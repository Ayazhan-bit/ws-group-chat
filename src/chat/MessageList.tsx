import { useEffect, useRef, useState } from 'react'
import { Avatar } from '../components/Avatar'
import { ArrowDownIcon, ChatIcon } from '../components/Icons'
import {
  formatClockTime,
  formatDayLabel,
  hueForName,
  isSameDay,
} from '../lib/format'
import type { ChatMessage } from '../types'

const GROUP_WINDOW_MS = 5 * 60 * 1000
const STICK_THRESHOLD_PX = 90

interface MessageListProps {
  messages: ChatMessage[]
  currentUsername: string
}

export function MessageList({ messages, currentUsername }: MessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const stickToBottomRef = useRef(true)
  const previousCountRef = useRef(messages.length)
  const [showJump, setShowJump] = useState(false)
  const [newCount, setNewCount] = useState(0)

  useEffect(() => {
    const added = messages.length - previousCountRef.current
    previousCountRef.current = messages.length
    if (added <= 0) return

    if (stickToBottomRef.current) {
      const frame = requestAnimationFrame(() => {
        bottomRef.current?.scrollIntoView({ block: 'end' })
      })
      return () => cancelAnimationFrame(frame)
    }

    setNewCount((count) => count + added)
    setShowJump(true)
  }, [messages.length])

  const jumpToBottom = (behavior: ScrollBehavior = 'smooth') => {
    stickToBottomRef.current = true
    setShowJump(false)
    setNewCount(0)
    bottomRef.current?.scrollIntoView({ block: 'end', behavior })
  }

  const handleScroll = () => {
    const element = scrollRef.current
    if (!element) return

    const distance =
      element.scrollHeight - element.scrollTop - element.clientHeight
    const nearBottom = distance < STICK_THRESHOLD_PX
    stickToBottomRef.current = nearBottom

    if (nearBottom) {
      setShowJump(false)
      setNewCount(0)
    }
  }

  return (
    <div className="messages-wrap">
      <div className="messages" ref={scrollRef} onScroll={handleScroll}>
        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="messages-inner">
            {messages.map((message, index) => {
              const previous = messages[index - 1]
              const date = new Date(message.timestamp)
              const previousDate = previous
                ? new Date(previous.timestamp)
                : null

              const showDay =
                !previousDate || !isSameDay(previousDate, date)
              const showHeader =
                showDay ||
                !previous ||
                previous.sender !== message.sender ||
                message.timestamp - previous.timestamp > GROUP_WINDOW_MS

              const mine = message.sender === currentUsername

              return (
                <div key={message.id}>
                  {showDay ? (
                    <div className="day-divider">
                      <span>{formatDayLabel(message.timestamp)}</span>
                    </div>
                  ) : null}

                  <div
                    className={[
                      'message',
                      mine ? 'message--mine' : '',
                      showHeader ? 'message--first' : 'message--grouped',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {!mine ? (
                      <div className="message-avatar">
                        {showHeader ? (
                          <Avatar username={message.sender} size={36} />
                        ) : null}
                      </div>
                    ) : null}

                    <div className="message-content">
                      {showHeader && !mine ? (
                        <span
                          className="message-author"
                          style={{
                            color: `hsl(${hueForName(message.sender)} 62% 72%)`,
                          }}
                        >
                          {message.sender}
                        </span>
                      ) : null}

                      <div className="bubble">
                        <span className="bubble-text">{message.text}</span>
                        <time
                          className="bubble-time"
                          dateTime={date.toISOString()}
                        >
                          {formatClockTime(message.timestamp)}
                        </time>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
            <div ref={bottomRef} className="messages-end" aria-hidden="true" />
          </div>
        )}
      </div>

      {showJump ? (
        <button
          type="button"
          className="jump-button"
          onClick={() => jumpToBottom()}
        >
          <ArrowDownIcon />
          {newCount > 0
            ? `${newCount} ${pluralizeMessages(newCount)}`
            : 'К последним'}
        </button>
      ) : null}
    </div>
  )
}

function pluralizeMessages(count: number): string {
  const mod10 = count % 10
  const mod100 = count % 100
  if (mod10 === 1 && mod100 !== 11) return 'новое сообщение'
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) {
    return 'новых сообщения'
  }
  return 'новых сообщений'
}

function EmptyState() {
  return (
    <div className="empty-state">
      <div className="empty-art" aria-hidden="true">
        <span className="empty-ring empty-ring--outer" />
        <span className="empty-ring empty-ring--inner" />
        <span className="empty-icon">
          <ChatIcon />
        </span>
      </div>
      <h3>Здесь пока тихо</h3>
      <p>
        Напишите первое сообщение — его сразу увидят все, кто сейчас в эфире.
      </p>
      <span className="empty-hint">
        Видны сообщения, отправленные при вашем подключении
      </span>
    </div>
  )
}
