import { type FormEvent, type KeyboardEvent } from "react"

interface ChatInputProps {
  inputValue: string
  isTyping: boolean
  totalTokens: number
  onInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  onKeyDown: (e: KeyboardEvent<HTMLTextAreaElement>) => void
  onSubmit: (e: FormEvent<HTMLFormElement>) => Promise<void>
  textareaRef: React.RefObject<HTMLTextAreaElement | null>
}

export default function ChatInput({
  inputValue,
  isTyping,
  totalTokens,
  onInputChange,
  onKeyDown,
  onSubmit,
  textareaRef,
}: ChatInputProps) {
  return (
    <div className="input-container">
      <form onSubmit={onSubmit} className="input-form">
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={onInputChange}
          onKeyDown={onKeyDown}
          placeholder="Escribe tu mensaje..."
          className="message-input"
          rows={1}
        />
        <button type="submit" disabled={!inputValue.trim() || isTyping} className="send-button" title="Enviar mensaje">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </form>
      {totalTokens > 0 && (
        <p className="token-counter">
          Tokens utilizados en esta sesión: <b>{totalTokens}</b>
        </p>
      )}
      <p className="input-hint">
        Presiona <kbd>Enter</kbd> para enviar, <kbd>Shift + Enter</kbd> para nueva línea
      </p>
    </div>
  )
}
