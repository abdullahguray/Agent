'use client'

import { useEffect, useState, useRef } from 'react'

const MODELS = [
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', category: 'reasoning' },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', category: 'reasoning' },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', category: 'reasoning' },
  { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', category: 'reasoning' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B', category: 'reasoning' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B IT', category: 'reasoning' },
  { id: 'stepfun-ai/step-3.7-flash', name: 'Step 3.7 Flash', category: 'reasoning' },
  { id: 'stepfun-ai/step-3.5-flash', name: 'Step 3.5 Flash', category: 'reasoning' },
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Llama 3.3 Nemotron Super 49B', category: 'balanced' },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', category: 'balanced' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', category: 'balanced' },
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', category: 'balanced' },
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', category: 'balanced' },
  { id: 'minimaxai/minimax-m2.7', name: 'MiniMax M2.7', category: 'balanced' },
  { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 122B', category: 'balanced' },
  { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 397B', category: 'balanced' },
  { id: 'qwen/qwen3-next-80b-a3b-instruct', name: 'Qwen 3 Next 80B', category: 'balanced' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', category: 'balanced' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', category: 'balanced' },
  { id: 'poolside/laguna-xs-2.1', name: 'Laguna XS 2.1', category: 'balanced' },
  { id: 'z-ai/glm-5.2', name: 'GLM 5.2', category: 'balanced' },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', category: 'fast' },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B', category: 'fast' },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', category: 'fast' },
  { id: 'google/gemma-3n-e4b-it', name: 'Gemma 3N E4B', category: 'fast' },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', category: 'vision' },
]

type Message = {
  role: 'user' | 'assistant'
  content: string
  model?: string
  response_time_ms?: number
}

const categoryColors: Record<string, string> = {
  reasoning: 'bg-purple-100 text-purple-700',
  balanced: 'bg-blue-100 text-blue-700',
  fast: 'bg-green-100 text-green-700',
  vision: 'bg-orange-100 text-orange-700',
}

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('meta/llama-3.3-70b-instruct')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    const text = input.trim()
    if (!text || loading) return

    const userMsg: Message = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: selectedModel, message: text, history })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const assistantMsg: Message = {
        role: 'assistant',
        content: json.data.reply,
        model: json.data.model,
        response_time_ms: json.data.response_time_ms,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const currentModel = MODELS.find(m => m.id === selectedModel)

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white text-sm">
            ← Dashboard
          </a>
          <h1 className="text-xl font-bold">Model Chat</h1>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-gray-700 text-white text-sm rounded-lg px-3 py-2 border border-gray-600 focus:border-blue-500 focus:outline-none max-w-[300px]"
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>
                {m.name} ({m.category})
              </option>
            ))}
          </select>
          {currentModel && (
            <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[currentModel.category] || 'bg-gray-100 text-gray-600'}`}>
              {currentModel.category}
            </span>
          )}
        </div>
      </nav>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
              </div>
              <h2 className="text-lg font-semibold text-gray-700 mb-1">Test any model</h2>
              <p className="text-sm text-gray-500">Select a model from the dropdown and start chatting to verify the API key works.</p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-900'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                {msg.role === 'assistant' && msg.response_time_ms !== undefined && (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
                    <span>{msg.model?.split('/').pop()}</span>
                    <span>·</span>
                    <span>{(msg.response_time_ms / 1000).toFixed(1)}s</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto flex gap-3">
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none"
          />
          <button
            onClick={handleSend}
            disabled={loading || !input.trim()}
            className="bg-blue-600 text-white px-5 py-3 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}
