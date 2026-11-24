import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { SendIcon } from '../components/Icons'
import { MAX_MESSAGE_LENGTH } from '../lib/config'
import type { ConnectionState } from '../types'

interface MessageComposerProps {
  connection: ConnectionState
  onSend: (text: string) => boolean
}

const MAX_HEIGHT_PX = 168

export function MessageComposer({ connection, onSend }: MessageComposerProps) {
  const [text, setText] = useState('')
  const [failed, setFailed] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const online = connection === 'online'
  const trimmed = text.trim()
  const canSend = online && trimmed.length > 0

  // Drop a stale "not delivered" notice as soon as the connection is back.
  const [wasOnline, setWasOnline] = useState(online)
  if (online !== wasOnline) {
    setWasOnline(online)
    if (online && failed) setFailed(false)
  }

  useEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, MAX_HEIGHT_PX)}px`
  }, [text])

  const submit = () => {
    if (!canSend) return

    if (!onSend(trimmed)) {
      setFailed(true)
      return
    }

    setFailed(false)
    setText('')
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key !== 'Enter' || event.shiftKey) return
    if (event.nativeEvent.isComposing) return

    event.preventDefault()
    submit()
  }

  const placeholder = online
    ? 'Напишите сообщение…'
    : connection === 'error'
      ? 'Нет соединения с чатом'
      : 'Подключение к чату…'

  return (
    <div className="composer">
      {failed ? (
        <p className="composer-error" role="alert">
          Сообщение не отправлено — соединение потеряно. Попробуйте ещё раз.
        </p>
      ) : null}

      <div className={`composer-shell${online ? '' : ' is-disabled'}`}>
        <textarea
          ref={textareaRef}
          rows={1}
          value={text}
          onChange={(event) => {
            setText(event.target.value)
            if (failed) setFailed(false)
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          maxLength={MAX_MESSAGE_LENGTH}
          disabled={!online}
          aria-label="Текст сообщения"
        />

        <button
          type="button"
          className="send-button"
          onClick={submit}
          disabled={!canSend}
          aria-label="Отправить сообщение"
          title="Отправить (Enter)"
        >
          <SendIcon />
        </button>
      </div>

      <div className="composer-meta">
        <span className="composer-hint">
          {online ? (
            <>
              <kbd>Enter</kbd> — отправить, <kbd>Shift</kbd> + <kbd>Enter</kbd> —
              новая строка
            </>
          ) : (
            'Поле откроется, как только восстановится соединение'
          )}
        </span>
        {text.length > MAX_MESSAGE_LENGTH - 300 ? (
          <span
            className={
              text.length >= MAX_MESSAGE_LENGTH
                ? 'composer-count is-limit'
                : 'composer-count'
            }
          >
            {text.length} / {MAX_MESSAGE_LENGTH}
          </span>
        ) : null}
      </div>
    </div>
  )
}
