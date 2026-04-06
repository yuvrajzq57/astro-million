'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { BirthChart } from '@/lib/astrology'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatSession {
  birthChart: BirthChart
  userInfo: {
    name: string
    dateOfBirth: string
    timeOfBirth: string
    placeOfBirth: string
    email: string
    phone: string
  }
  sessionId: string
  messages: Message[]
}

export default function ChatPage() {
  const router = useRouter()
  const [session, setSession] = useState<ChatSession | null>(null)
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [session?.messages])

  useEffect(() => {
    // Get session data from session storage
    const stored = sessionStorage.getItem('chatSession')

    if (stored) {
      try {
        const parsedData = JSON.parse(stored)
        setSession({
          ...parsedData,
          messages: parsedData.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        })
      } catch (error) {
        console.error('Failed to parse stored session:', error)
        router.push('/onboarding')
      }
    } else {
      router.push('/onboarding')
    }
  }, [router])

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading || !session) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    }

    setSession(prev => prev ? {
      ...prev,
      messages: [...prev.messages, userMessage]
    } : null)

    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          sessionId: session.sessionId,
          userInfo: session.userInfo
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const result = await response.json()

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.response,
        timestamp: new Date()
      }

      setSession(prev => prev ? {
        ...prev,
        messages: [...prev.messages, assistantMessage]
      } : null)

      // Update session storage
      const updatedSession = {
        ...session,
        messages: [...session.messages, userMessage, assistantMessage]
      }
      sessionStorage.setItem('chatSession', JSON.stringify(updatedSession))

    } catch (error) {
      console.error('Error sending message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!session) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black flex items-center justify-center">
        <div className="text-center">
          <p className="text-purple-300 mb-4">Loading chat session...</p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-950 via-purple-900 to-black flex flex-col">
      {/* Header */}
      <div className="border-b border-purple-800/30 bg-purple-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div>
            <Link href="/" className="text-2xl font-bold text-amber-300 hover:text-amber-400">
              Jyotish AI
            </Link>
            <p className="text-sm text-purple-300 mt-1">Chat with {session.userInfo.name}</p>
          </div>
          <div className="flex gap-4">
            <Link href="/reading">
              <Button
                variant="outline"
                className="text-purple-300 border-purple-600 hover:bg-purple-800/50"
              >
                View Reading
              </Button>
            </Link>
            <Link href="/onboarding">
              <Button
                variant="outline"
                className="text-purple-300 border-purple-600 hover:bg-purple-800/50"
              >
                New Session
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <ScrollArea className="h-[calc(100vh-200px)] pr-4">
          <div className="space-y-4">
            {session.messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-4 ${
                    message.role === 'user'
                      ? 'bg-amber-300 text-purple-950'
                      : 'bg-purple-900/40 border border-purple-700/50 text-purple-200'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-2 ${
                    message.role === 'user' ? 'text-purple-700' : 'text-purple-400'
                  }`}>
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-purple-900/40 border border-purple-700/50 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-amber-300 border-t-purple-300 rounded-full animate-spin"></div>
                    <span className="text-purple-300">Thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      </div>

      {/* Input Form */}
      <div className="border-t border-purple-800/30 bg-purple-950/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <form onSubmit={sendMessage} className="flex gap-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your astrology, career, relationships, or any life guidance..."
              className="flex-1 bg-purple-950/50 border-purple-700/50 text-white placeholder:text-purple-500 focus:border-amber-300"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-amber-300 text-purple-950 hover:bg-amber-400"
            >
              Send
            </Button>
          </form>
          <p className="text-xs text-purple-400 mt-2 text-center">
            Ask questions about your birth chart, planetary influences, life guidance, and more.
          </p>
        </div>
      </div>
    </main>
  )
}
