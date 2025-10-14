"use client"

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react"

// Define the structure of a chat message
interface Message {
    id: string
    text: string
    sender: "user" | "ai" // Who sent the message
    timestamp: Date
}

export default function ChatInterface() {
    // State variables
    const [messages, setMessages] = useState<Message[]>([]) // All chat messages
    const [inputValue, setInputValue] = useState<string>("") // Current text input
    const [isTyping, setIsTyping] = useState<boolean>(false) // AI typing indicator
    const [error, setError] = useState<string | null>(null) // Error messages

    // Refs for scrolling and textarea auto-resize
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // Auto-scroll to bottom when messages or typing indicator changes
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isTyping])

    /**
     * Send user message to backend and receive streaming response via SSE.
     * @param userMessage - The message text from the user
     */
    const sendMessageToBackend = async (userMessage: string) => {
        setIsTyping(true)
        setError(null)

        try {
            const backendUrl = import.meta.env.VITE_BACKEND_URL
            const response = await fetch(`${backendUrl}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    conversation_id: "frontend-session",
                }),
            })

            if (!response.ok || !response.body) {
                throw new Error(`Server error: ${response.status}`)
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder("utf-8")

            let aiMessageText = ""
            let aiMessageId = ""
            let firstChunk = true

            // Read streaming chunks from the backend
            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value, { stream: true })
                const lines = chunk.split("\n").filter((line) => line.trim() !== "")

                for (const line of lines) {
                    // Clean up SSE data prefix
                    const dataStr = line.replace(/^data:\s*/, "").replace(/^data:\s*/, "").trim()
                    if (!dataStr) continue

                    const parsed = JSON.parse(dataStr)

                    if (parsed.type === "content") {
                        const newText = parsed.content

                        if (firstChunk) {
                            // Add new AI message placeholder to state
                            aiMessageId = Date.now().toString()
                            setMessages((prev) => [
                                ...prev,
                                { id: aiMessageId, text: "", sender: "ai", timestamp: new Date() },
                            ])
                            firstChunk = false

                            // Remove typing indicator immediately after first chunk
                            setIsTyping(false)
                        }

                        // Append characters one by one for typing animation
                        for (let i = 0; i < newText.length; i++) {
                            aiMessageText += newText[i]
                            setMessages((prev) =>
                                prev.map((msg) =>
                                    msg.id === aiMessageId ? { ...msg, text: aiMessageText } : msg
                                )
                            )
                            await new Promise((resolve) => setTimeout(resolve, 15)) // typing speed
                        }
                    } else if (parsed.type === "done") {
                        setIsTyping(false)
                        return
                    } else if (parsed.type === "error") {
                        setError(parsed.content || "Unknown backend error")
                        setIsTyping(false)
                        return
                    }
                }
            }
        } catch (err: any) {
            console.error("Error fetching from backend:", err)
            setError("Failed to connect to server.")
            setIsTyping(false)
        }
    }

    /**
     * Handle sending a user message from the form
     */
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!inputValue.trim()) return

        // Add user message to chat state
        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: "user",
            timestamp: new Date(),
        }

        setMessages((prev) => [...prev, userMessage])
        const messageText = inputValue
        setInputValue("")
        if (textareaRef.current) textareaRef.current.style.height = "auto"

        await sendMessageToBackend(messageText)
    }

    /**
     * Clear all messages and reset state
     */
    const handleClearChat = () => {
        setMessages([])
        setIsTyping(false)
        setError(null)
    }

    /**
     * Send message when Enter key is pressed (Shift+Enter for newline)
     */
    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault()
            e.currentTarget.form?.requestSubmit()
        }
    }

    /**
     * Auto-adjust textarea height based on content
     */
    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setInputValue(e.target.value)
        e.target.style.height = "auto"
        e.target.style.height = `${e.target.scrollHeight}px`
    }

    /**
     * Format timestamp for display
     */
    const formatTime = (date: Date): string =>
        date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

    return (
        <div className="chat-container">
            {/* Chat header with title and clear button */}
            <div className="chat-header">
                <div className="header-content">
                    <div className="header-info">
                        <h1 className="header-title">Asistente AI</h1>
                        <p className="header-subtitle">Siempre aquí para ayudarte</p>
                    </div>
                    <button onClick={handleClearChat} className="clear-button" title="Limpiar conversación">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 6h18" />
                            <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                            <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Chat messages container */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 className="empty-title">¡Comienza una conversación!</h2>
                        <p className="empty-description">Escribe un mensaje para comenzar a chatear con el asistente AI</p>
                    </div>
                ) : (
                    <>
                        {/* Render all messages */}
                        {messages.map((message) => (
                            <div key={message.id} className={`message ${message.sender === "user" ? "message-user" : "message-ai"}`}>
                                <div className="message-content">
                                    <p className="message-text">{message.text}</p>
                                    <span className="message-time">{formatTime(message.timestamp)}</span>
                                </div>
                            </div>
                        ))}

                        {/* Typing indicator */}
                        {isTyping && (
                            <div className="message message-ai">
                                <div className="message-content">
                                    <div className="typing-indicator">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
                {error && <p className="error-text">{error}</p>}
                <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div className="input-container">
                <form onSubmit={handleSubmit} className="input-form">
                    <textarea
                        ref={textareaRef}
                        value={inputValue}
                        onChange={handleTextareaChange}
                        onKeyDown={handleKeyDown}
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
                <p className="input-hint">
                    Presiona <kbd>Enter</kbd> para enviar, <kbd>Shift + Enter</kbd> para nueva línea
                </p>
            </div>
        </div>
    )
}
