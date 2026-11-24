import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import {
  AlertIcon,
  LogoutIcon,
  RefreshIcon,
  SpinnerIcon,
} from '../components/Icons'
import { Logo } from '../components/Logo'
import { useAuth } from '../auth/AuthContext'
import type { ConnectionState } from '../types'
import { MessageComposer } from './MessageComposer'
import { MessageList } from './MessageList'
import { useChatSocket } from './useChatSocket'
import '../styles/chat.css'

const STATUS_LABEL: Record<ConnectionState, string> = {
  connecting: 'Подключение',
  authenticating: 'Проверка доступа',
  online: 'В сети',
  reconnecting: 'Переподключение',
  error: 'Нет связи',
}

const STATUS_TONE: Record<ConnectionState, string> = {
  connecting: 'pending',
  authenticating: 'pending',
  online: 'online',
  reconnecting: 'pending',
  error: 'offline',
}

const CONNECTING_TEXT: Record<ConnectionState, string> = {
  connecting: 'Открываем соединение с чатом…',
  authenticating: 'Проверяем access-токен…',
  online: '',
  reconnecting: 'Связь прервалась. Восстанавливаем соединение…',
  error: 'Соединение с чатом недоступно.',
}

export function ChatPage() {
  const { user, accessToken, logout, refreshToken } = useAuth()
  const { connection, messages, error, sendMessage, reconnect } = useChatSocket({
    token: accessToken,
    refreshToken,
  })
  const [loggingOut, setLoggingOut] = useState(false)

  const username = user?.username ?? ''
  const tone = STATUS_TONE[connection]

  const handleLogout = async () => {
    if (loggingOut) return
    setLoggingOut(true)
    try {
      await logout()
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <div className="chat">
      <header className="chat-header">
        <div className="chat-room">
          <Logo size={38} />
          <div className="room-text">
            <span className="room-title"># общий-эфир</span>
            <span className="room-sub">Групповой чат · WebSocket</span>
          </div>
        </div>

        <div className="chat-header-right">
          <span className={`status-pill status-pill--${tone}`}>
            <span className="status-dot" aria-hidden="true" />
            {STATUS_LABEL[connection]}
          </span>

          <span className="header-divider" aria-hidden="true" />

          <div className="current-user">
            <Avatar username={username || 'Я'} size={32} tone="self" />
            <span className="current-user-name">{username || 'Участник'}</span>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
            disabled={loggingOut}
            title="Выйти из аккаунта"
          >
            {loggingOut ? <SpinnerIcon /> : <LogoutIcon />}
            <span>Выйти</span>
          </button>
        </div>
      </header>

      {connection !== 'online' ? (
        <div
          className={`banner ${
            connection === 'error' ? 'banner--error' : 'banner--info'
          }`}
          role="status"
          aria-live="polite"
        >
          {connection === 'error' ? <AlertIcon /> : <SpinnerIcon />}
          <span className="banner-text">
            {connection === 'error'
              ? (error ?? CONNECTING_TEXT.error)
              : CONNECTING_TEXT[connection]}
          </span>
          {connection === 'error' ? (
            <button type="button" className="banner-action" onClick={reconnect}>
              <RefreshIcon />
              Переподключиться
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="chat-body">
        <MessageList messages={messages} currentUsername={username} />
        <MessageComposer connection={connection} onSend={sendMessage} />
      </div>
    </div>
  )
}
