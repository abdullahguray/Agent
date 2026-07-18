'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

const MODELS = [
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', category: 'reasoning', supportsThinking: true },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', category: 'reasoning', supportsThinking: true },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', category: 'reasoning', supportsThinking: true },
  { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', category: 'reasoning', supportsThinking: true },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B', category: 'reasoning', supportsThinking: true },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B IT', category: 'reasoning', supportsThinking: true },
  { id: 'stepfun-ai/step-3.7-flash', name: 'Step 3.7 Flash', category: 'reasoning', supportsThinking: false },
  { id: 'stepfun-ai/step-3.5-flash', name: 'Step 3.5 Flash', category: 'reasoning', supportsThinking: false },
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Llama 3.3 Nemotron Super 49B', category: 'balanced', supportsThinking: false },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', category: 'balanced', supportsThinking: false },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', category: 'balanced', supportsThinking: false },
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', category: 'balanced', supportsThinking: false },
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', category: 'balanced', supportsThinking: false },
  { id: 'minimaxai/minimax-m2.7', name: 'MiniMax M2.7', category: 'balanced', supportsThinking: false },
  { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 122B', category: 'balanced', supportsThinking: false },
  { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 397B', category: 'balanced', supportsThinking: false },
  { id: 'qwen/qwen3-next-80b-a3b-instruct', name: 'Qwen 3 Next 80B', category: 'balanced', supportsThinking: false },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', category: 'balanced', supportsThinking: false },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', category: 'balanced', supportsThinking: false },
  { id: 'poolside/laguna-xs-2.1', name: 'Laguna XS 2.1', category: 'balanced', supportsThinking: false },
  { id: 'z-ai/glm-5.2', name: 'GLM 5.2', category: 'balanced', supportsThinking: false },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', category: 'fast', supportsThinking: false },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B', category: 'fast', supportsThinking: false },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', category: 'fast', supportsThinking: false },
  { id: 'google/gemma-3n-e4b-it', name: 'Gemma 3N E4B', category: 'fast', supportsThinking: false },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', category: 'vision', supportsThinking: false, supportsVision: true },
]

type Message = {
  id: string
  role: 'user' | 'assistant'
  content: string
  model?: string
  response_time_ms?: number
  thinking?: string
  thinking_time?: number
  searchResults?: { query: string; count: number; favicons: string[] }[]
  readPages?: { title: string; url: string; snippets: string[] }[]
  attachments?: { name: string; type: string; size: number; preview?: string }[]
}

const categoryColors: Record<string, string> = {
  reasoning: 'bg-purple-100 text-purple-700 border-purple-200',
  balanced: 'bg-blue-100 text-blue-700 border-blue-200',
  fast: 'bg-green-100 text-green-700 border-green-200',
  vision: 'bg-orange-100 text-orange-700 border-orange-200',
}

function ThinkingBlock({ thinking, thinking_time }: { thinking: string; thinking_time?: number }) {
  const [expanded, setExpanded] = useState(false)

  if (!thinking) return null

  return (
    <div className="mb-3">
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition group"
      >
        <span className="text-purple-500">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
        </span>
        <span className="font-medium">
          Thought for {thinking_time ? `${(thinking_time / 1000).toFixed(0)} seconds` : 'a while'}
        </span>
        <svg
          className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && (
        <div className="mt-2 pl-6 border-l-2 border-purple-200 text-sm text-gray-600 whitespace-pre-wrap leading-relaxed">
          {thinking}
        </div>
      )}
    </div>
  )
}

function SearchResults({ results }: { results: Message['searchResults'] }) {
  if (!results?.length) return null
  return (
    <div className="mb-3 space-y-2">
      {results.map((r, i) => (
        <div key={i} className="flex items-center gap-2 text-sm text-gray-600">
          <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span>Found <strong>{r.count}</strong> web pages</span>
          <div className="flex -space-x-1">
            {r.favicons.slice(0, 5).map((f, j) => (
              <img key={j} src={f} alt="" className="w-4 h-4 rounded-full bg-white border border-gray-200" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function ReadPages({ pages }: { pages: Message['readPages'] }) {
  const [expanded, setExpanded] = useState(false)
  if (!pages?.length) return null

  return (
    <div className="mb-3">
      <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        <span>Read <strong>{pages.length}</strong> pages</span>
        {pages.slice(0, 3).map((p, i) => (
          <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-xs truncate max-w-[200px]">
            {p.title} ↗
          </a>
        ))}
        {pages.length > 3 && (
          <button onClick={() => setExpanded(!expanded)} className="text-xs text-gray-400 hover:text-gray-600">
            {expanded ? 'less' : `+${pages.length - 3} more`}
          </button>
        )}
      </div>
      {expanded && (
        <div className="pl-6 space-y-1">
          {pages.slice(3).map((p, i) => (
            <a key={i} href={p.url} target="_blank" rel="noopener noreferrer" className="block text-sm text-blue-600 hover:underline">
              {p.title} ↗
            </a>
          ))}
        </div>
      )}
    </div>
  )
}

function AttachmentPreviews({ attachments }: { attachments: Message['attachments'] }) {
  if (!attachments?.length) return null
  return (
    <div className="flex flex-wrap gap-2 mb-3">
      {attachments.map((a, i) => (
        <div key={i} className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden">
          {a.preview ? (
            <img src={a.preview} alt={a.name} className="w-20 h-20 object-cover" />
          ) : (
            <div className="w-20 h-20 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          )}
          <div className="px-2 py-1">
            <p className="text-[10px] text-gray-500 truncate max-w-[72px]">{a.name}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ChatPage() {
  const [selectedModel, setSelectedModel] = useState('deepseek-ai/deepseek-v4-flash')
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [deepThink, setDeepThink] = useState(false)
  const [search, setSearch] = useState(true)
  const [attachments, setAttachments] = useState<{ name: string; type: string; size: number; preview?: string }[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + 'px'
    }
  }, [input])

  const currentModel = MODELS.find(m => m.id === selectedModel)
  const supportsVision = currentModel?.supportsVision ?? false

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return

    Array.from(files).forEach(file => {
      const isImage = file.type.startsWith('image/')
      if (isImage) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          setAttachments(prev => [...prev, {
            name: file.name,
            type: file.type,
            size: file.size,
            preview: ev.target?.result as string,
          }])
        }
        reader.readAsDataURL(file)
      } else {
        setAttachments(prev => [...prev, {
          name: file.name,
          type: file.type,
          size: file.size,
        }])
      }
    })
    e.target.value = ''
  }, [])

  const removeAttachment = useCallback((index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index))
  }, [])

  async function handleSend() {
    const text = input.trim()
    if (!text && attachments.length === 0) return
    if (loading) return

    const hasImages = attachments.some(a => a.preview)
    if (hasImages && !supportsVision) {
      const proceed = window.confirm(
        `The selected model (${currentModel?.name}) does not support images. Send without images?`
      )
      if (!proceed) return
    }

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text || '(attachments)',
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setAttachments([])
    setLoading(true)

    try {
      const history = messages.map(m => ({ role: m.role, content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: selectedModel,
          message: text,
          history,
          deep_think: deepThink,
          search_enabled: search,
        })
      })
      const json = await res.json()
      if (json.error) throw new Error(json.error)

      const reply = json.data.reply || ''
      const thinkingMatch = reply.match(/\[Thinking\]\s*([\s\S]*?)\s*\[\/Thinking\]/)
      const thinking = thinkingMatch?.[1] || json.data.thinking || ''
      const cleanContent = thinkingMatch ? reply.replace(/\[Thinking\][\s\S]*?\[\/Thinking\]/, '').trim() : reply

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: cleanContent,
        model: json.data.model,
        response_time_ms: json.data.response_time_ms,
        thinking: thinking || undefined,
        thinking_time: deepThink ? json.data.response_time_ms : undefined,
        searchResults: json.data.search_results,
        readPages: json.data.read_pages,
      }
      setMessages(prev => [...prev, assistantMsg])
    } catch (err: any) {
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: ${err.message}`,
      }])
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

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-sm transition">
            ← Dashboard
          </a>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-lg font-semibold text-gray-800">Scrape Agent</h1>
          <div className="h-5 w-px bg-gray-200" />
          <a href="/benchmark" className="text-sm text-gray-500 hover:text-gray-700 font-medium transition">Benchmark</a>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedModel}
            onChange={e => setSelectedModel(e.target.value)}
            className="bg-white text-gray-700 text-sm rounded-lg px-3 py-2 border border-gray-200 focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none max-w-[280px]"
          >
            {MODELS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <span className={`text-xs px-2 py-1 rounded-full border ${categoryColors[currentModel?.category || 'balanced']}`}>
            {currentModel?.category}
          </span>
        </div>
      </nav>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-6">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-24">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">What can I help with?</h2>
              <p className="text-gray-500 text-sm">Ask me anything. I can search the web, analyze content, and reason through complex problems.</p>
            </div>
          )}

          <div className="space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className="flex gap-4">
                {/* Avatar */}
                {msg.role === 'assistant' && (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mt-1">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                )}

                <div className={`flex-1 ${msg.role === 'user' ? 'flex justify-end' : ''}`}>
                  {/* User message bubble */}
                  {msg.role === 'user' && (
                    <div className="inline-block bg-blue-600 text-white rounded-2xl rounded-br-md px-5 py-3 max-w-[85%]">
                      <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                    </div>
                  )}

                  {/* Assistant message */}
                  {msg.role === 'assistant' && (
                    <div>
                      <AttachmentPreviews attachments={msg.attachments} />
                      <ThinkingBlock thinking={msg.thinking || ''} thinking_time={msg.thinking_time} />
                      <SearchResults results={msg.searchResults} />
                      <ReadPages pages={msg.readPages} />
                      <div className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{msg.content}</div>
                      {msg.response_time_ms !== undefined && (
                        <div className="mt-3 pt-2 border-t border-gray-100 flex items-center gap-3 text-xs text-gray-400">
                          <span className="font-medium">{msg.model?.split('/').pop()}</span>
                          <span>·</span>
                          <span>{(msg.response_time_ms / 1000).toFixed(1)}s</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Loading indicator */}
            {loading && (
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="flex items-center gap-1 pt-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 bg-white px-6 py-4">
        <div className="max-w-3xl mx-auto">
          {/* Attachment previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {attachments.map((a, i) => (
                <div key={i} className="relative bg-gray-100 rounded-lg border border-gray-200 overflow-hidden group">
                  {a.preview ? (
                    <img src={a.preview} alt={a.name} className="w-16 h-16 object-cover" />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center">
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                  )}
                  <button
                    onClick={() => removeAttachment(i)}
                    className="absolute top-0 right-0 w-5 h-5 bg-gray-800 bg-opacity-75 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                  >
                    ×
                  </button>
                  <div className="px-1.5 py-0.5">
                    <p className="text-[9px] text-gray-500 truncate max-w-[60px]">{a.name}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Input box */}
          <div className="relative border border-gray-200 rounded-2xl focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-400 transition bg-gray-50">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message Scrape Agent..."
              rows={1}
              className="w-full bg-transparent px-4 pt-3 pb-2 text-sm resize-none focus:outline-none placeholder-gray-400"
            />

            {/* Bottom toolbar */}
            <div className="flex items-center justify-between px-3 pb-2">
              <div className="flex items-center gap-1">
                {/* File attach */}
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="*/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition"
                  title="Attach files"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* DeepThink toggle */}
                {currentModel?.supportsThinking && (
                  <button
                    onClick={() => setDeepThink(!deepThink)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      deepThink
                        ? 'bg-purple-100 text-purple-700 border border-purple-200'
                        : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                    </svg>
                    DeepThink
                  </button>
                )}

                {/* Search toggle */}
                <button
                  onClick={() => setSearch(!search)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                    search
                      ? 'bg-blue-100 text-blue-700 border border-blue-200'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                  Search
                </button>

                {/* Vision indicator */}
                {attachments.some(a => a.preview) && !supportsVision && (
                  <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-200">
                    Model does not support images
                  </span>
                )}
              </div>

              {/* Send button */}
              <button
                onClick={handleSend}
                disabled={loading || (!input.trim() && attachments.length === 0)}
                className={`p-2 rounded-xl transition ${
                  loading || (!input.trim() && attachments.length === 0)
                    ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>

          <p className="text-center text-xs text-gray-300 mt-2">AI can make mistakes. Verify important information.</p>
        </div>
      </div>
    </div>
  )
}
