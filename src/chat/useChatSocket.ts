import { useCallback, useEffect, useRef, useState } from 'react'
import { WS_URL } from '../lib/config'
import type { ChatMessage, ConnectionState } from '../types'

const MAX_AUTO_RETRIES = 5
const AUTH_TIMEOUT_MS = 10_000
const MAX_STORED_MESSAGES = 500
const MAX_AUTH_FAILURES = 2

/** Close code sent by the server when the AUTH message / token is invalid. */
const CLOSE_INVALID_TOKEN = 4003
/** Local code used when the server does not confirm authentication in time. */
const CLOSE_AUTH_TIMEOUT = 4001

interface UseChatSocketOptions {
  token: string | null
  refreshToken: () => Promise<string | null>
}

export interface ChatSocket {
  connection: ConnectionState
  messages: ChatMessage[]
  error: string | null
  sendMessage: (text: string) => boolean
  reconnect: () => void
}

let messageSequence = 0

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function closeMessage(code: number): string {
  switch (code) {
    case CLOSE_INVALID_TOKEN:
      return 'Сервер отклонил токен авторизации.'
    case CLOSE_AUTH_TIMEOUT:
      return 'Сервер не подтвердил авторизацию.'
    default:
      return 'Соединение с чатом прервано.'
  }
}

export function useChatSocket({
  token,
  refreshToken,
}: UseChatSocketOptions): ChatSocket {
  const [connection, setConnection] = useState<ConnectionState>('connecting')
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [error, setError] = useState<string | null>(null)
  const [reconnectNonce, setReconnectNonce] = useState(0)

  const socketRef = useRef<WebSocket | null>(null)
  const authorizedRef = useRef(false)
  const authFailuresRef = useRef(0)
  const tokenRef = useRef(token)
  const hasToken = token !== null

  // Keep the newest token without rebuilding the connection when it is refreshed.
  useEffect(() => {
    tokenRef.current = token
  }, [token])

  const reconnect = useCallback(() => {
    setReconnectNonce((value) => value + 1)
  }, [])

  useEffect(() => {
    if (!hasToken) return

    let disposed = false
    let socket: WebSocket | null = null
    let retryTimer: ReturnType<typeof setTimeout> | null = null
    let authTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0

    function clearTimers() {
      if (retryTimer) window.clearTimeout(retryTimer)
      if (authTimer) window.clearTimeout(authTimer)
      retryTimer = null
      authTimer = null
    }

    function dropSocket() {
      if (!socket) return
      socket.onopen = null
      socket.onmessage = null
      socket.onclose = null
      socket.onerror = null
      if (
        socket.readyState === WebSocket.OPEN ||
        socket.readyState === WebSocket.CONNECTING
      ) {
        socket.close()
      }
      socket = null
      socketRef.current = null
      authorizedRef.current = false
    }

    function scheduleRetry(reason: string) {
      if (disposed) return

      if (attempt >= MAX_AUTO_RETRIES) {
        setConnection('error')
        setError(
          `${reason} Не удалось восстановить соединение автоматически.`,
        )
        return
      }

      const delay = Math.min(1000 * 2 ** attempt, 12_000)
      attempt += 1
      setConnection('reconnecting')
      setError(null)
      retryTimer = window.setTimeout(connect, delay + Math.random() * 300)
    }

    function handleEvent(raw: string) {
      let event: unknown
      try {
        event = JSON.parse(raw)
      } catch {
        return
      }
      if (!isRecord(event) || typeof event.type !== 'string') return

      if (event.type === 'AUTH_SUCCESS') {
        authorizedRef.current = true
        authFailuresRef.current = 0
        attempt = 0
        if (authTimer) {
          window.clearTimeout(authTimer)
          authTimer = null
        }
        setConnection('online')
        setError(null)
        return
      }

      if (event.type === 'NEW_MESSAGE' && isRecord(event.payload)) {
        const { sender, text, timestamp } = event.payload
        if (typeof sender !== 'string' || typeof text !== 'string') return

        const message: ChatMessage = {
          id: `msg-${messageSequence++}`,
          sender,
          text,
          timestamp: typeof timestamp === 'number' ? timestamp : Date.now(),
        }

        setMessages((previous) => {
          const duplicate = previous.some(
            (item) =>
              item.sender === message.sender &&
              item.timestamp === message.timestamp &&
              item.text === message.text,
          )
          if (duplicate) return previous
          const next = [...previous, message]
          return next.length > MAX_STORED_MESSAGES
            ? next.slice(next.length - MAX_STORED_MESSAGES)
            : next
        })
      }
    }

    function connect() {
      if (disposed) return

      const activeToken = tokenRef.current
      if (!activeToken) {
        setConnection('error')
        setError('Сессия истекла. Войдите заново.')
        return
      }

      setConnection(attempt === 0 ? 'connecting' : 'reconnecting')

      try {
        socket = new WebSocket(WS_URL)
      } catch {
        scheduleRetry('Не удалось открыть соединение.')
        return
      }

      socketRef.current = socket

      socket.onopen = () => {
        if (disposed || !socket) return
        setConnection('authenticating')

        socket.send(
          JSON.stringify({ type: 'AUTH', payload: { token: activeToken } }),
        )

        authTimer = window.setTimeout(() => {
          if (socket && socket.readyState === WebSocket.OPEN) {
            socket.close(CLOSE_AUTH_TIMEOUT, 'auth timeout')
          }
        }, AUTH_TIMEOUT_MS)
      }

      socket.onmessage = (message) => {
        if (disposed) return
        if (typeof message.data === 'string') handleEvent(message.data)
      }

      socket.onerror = () => {
        // The close handler below performs the actual recovery.
      }

      socket.onclose = (event) => {
        if (disposed) return

        clearTimers()
        authorizedRef.current = false
        socket = null
        socketRef.current = null

        if (event.code === CLOSE_INVALID_TOKEN) {
          authFailuresRef.current += 1

          if (authFailuresRef.current > MAX_AUTH_FAILURES) {
            setConnection('error')
            setError('Сессия больше не действует. Войдите заново.')
            return
          }

          setConnection('reconnecting')

          // Access tokens live for a few minutes; ask for a fresh one and
          // reconnect with it.
          void refreshToken().then((fresh) => {
            if (disposed) return

            if (!fresh) {
              setConnection('error')
              setError('Сессия истекла. Войдите заново.')
              return
            }

            tokenRef.current = fresh
            attempt = 0
            connect()
          })
          return
        }

        scheduleRetry(closeMessage(event.code))
      }
    }

    connect()

    return () => {
      disposed = true
      clearTimers()
      dropSocket()
    }
  }, [hasToken, reconnectNonce, refreshToken])

  const sendMessage = useCallback((text: string): boolean => {
    const socket = socketRef.current
    const value = text.trim()

    if (!value) return false
    if (!socket || socket.readyState !== WebSocket.OPEN) return false
    if (!authorizedRef.current) return false

    socket.send(JSON.stringify({ type: 'CHAT_MESSAGE', payload: { text: value } }))
    return true
  }, [])

  return {
    connection,
    messages,
    error,
    sendMessage,
    reconnect,
  }
}
