import React from "react"
import ReactMarkdown, { Components } from "react-markdown"
import { type Message } from "./types"
import TypingIndicator from "./TypingIndicator"

interface ChatMessagesProps {
  messages: Message[]
  isTyping: boolean
  error: string | null
  formatTime: (date: Date) => string
  messagesEndRef: React.RefObject<HTMLDivElement>
}

// Custom renderers for markdown elements
const markdownComponents: Components = {
  code({
    inline,
    className,
    children,
    ...props
  }: {
    inline?: boolean
    className?: string
    children?: React.ReactNode
  }) {
    return inline ? (
      <code className="inline-code" {...props}>
        {children}
      </code>
    ) : (
      <pre className="code-block">
        <code {...props}>{children}</code>
      </pre>
    )
  },
  a({
    href,
    children,
  }: {
    href?: string
    children?: React.ReactNode
  }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    )
  },
}

export default function ChatMessages({
  messages,
  isTyping,
  error,
  formatTime,
  messagesEndRef,
}: ChatMessagesProps) {
  return (
    <div className="messages-container">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
          </div>
          <h2 className="empty-title">¡Comienza una conversación!</h2>
          <p className="empty-description">
            Escribe un mensaje para comenzar a chatear con el asistente AI
          </p>
        </div>
      ) : (
        <>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message ${
                message.sender === "user" ? "message-user" : "message-ai"
              }`}
            >
              <div className="message-content">
                {message.sender === "ai" ? (
                  <ReactMarkdown components={markdownComponents}>
                    {message.text}
                  </ReactMarkdown>
                ) : (
                  <p className="message-text">{message.text}</p>
                )}
                <span className="message-time">
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && <TypingIndicator />}
        </>
      )}

      {error && <p className="error-text">{error}</p>}
      <div ref={messagesEndRef} />
    </div>
  )
}
