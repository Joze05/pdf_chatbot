"use client"

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from "react"
import type { Message } from "./types"
import ChatHeader from "./ChatHeader"
import ChatMessages from "./ChatMessages"
import ChatInput from "./ChatInput"
import { ExportChatButton } from "./ExportChatButton"

export default function ChatInterface() {
    const [messages, setMessages] = useState<Message[]>([])
    const [inputValue, setInputValue] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [totalTokens, setTotalTokens] = useState(0)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isTyping])

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
                    } else if (parsed.type === "usage") {
                        setTotalTokens(parsed.total_tokens)
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
     * Format timestamp for display
     */
    const formatTime = (date: Date): string =>
        date.toLocaleTimeString("es-ES", { hour: "2-digit", minute: "2-digit" })

    return (
        <div className="chat-container">
            <ChatHeader onClearChat={() => {
                setMessages([])
                setIsTyping(false)
                setError(null)
                setTotalTokens(0)
            }} />

            <ChatMessages
                messages={messages}
                isTyping={isTyping}
                error={error}
                formatTime={formatTime}
                messagesEndRef={messagesEndRef}
            />

            <ExportChatButton messages={messages} />

            <ChatInput
                inputValue={inputValue}
                isTyping={isTyping}
                totalTokens={totalTokens}
                onInputChange={(e) => {
                    setInputValue(e.target.value)
                    e.target.style.height = "auto"
                    e.target.style.height = `${e.target.scrollHeight}px`
                }}
                onKeyDown={(e: KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        e.currentTarget.form?.requestSubmit()
                    }
                }}
                onSubmit={handleSubmit}
                textareaRef={textareaRef}
            />
        </div>
    )
}
