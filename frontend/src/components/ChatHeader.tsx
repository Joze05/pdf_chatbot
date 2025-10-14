import ClearButton from "./ClearButton"

interface ChatHeaderProps {
  onClearChat: () => void
}

export default function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <div className="chat-header">
      <div className="header-content">
        <div className="header-info">
          <h1 className="header-title">Asistente AI</h1>
          <p className="header-subtitle">Siempre aquí para ayudarte</p>
        </div>
        <ClearButton onClick={onClearChat} />
      </div>
    </div>
  )
}
