import { Message } from "./types"

interface ExportChatButtonProps {
  messages: Message[]
}

export const ExportChatButton: React.FC<ExportChatButtonProps> = ({ messages }) => {
  const exportConversationToMarkdown = () => {
    if (messages.length === 0) {
      alert("No hay mensajes para exportar.")
      return
    }

    const markdownContent = messages
      .map(msg => {
        const time = new Date(msg.timestamp).toLocaleTimeString()
        const prefix = msg.sender === "user" ? "**User**" : "**AI**"
        return `${prefix} (${time}):\n\n${msg.text}\n\n---`
      })
      .join("\n")

    const blob = new Blob([markdownContent], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)

    const a = document.createElement("a")
    a.href = url
    a.download = `chat-${new Date().toISOString().slice(0, 19)}.md`
    a.click()

    URL.revokeObjectURL(url)
  }

  return (
    <button
      onClick={exportConversationToMarkdown}
      className="export-button"
      title="Exportar chat"
    >
      Exportar Chat
    </button>
  )
}
