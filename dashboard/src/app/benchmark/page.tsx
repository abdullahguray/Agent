'use client'

import { useState, useRef } from 'react'

const MODELS = [
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', category: 'reasoning' },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', category: 'reasoning', unavailable: true },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', category: 'reasoning' },
  { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', category: 'reasoning' },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B', category: 'reasoning' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B IT', category: 'reasoning', unavailable: true },
  { id: 'stepfun-ai/step-3.7-flash', name: 'Step 3.7 Flash', category: 'reasoning' },
  { id: 'stepfun-ai/step-3.5-flash', name: 'Step 3.5 Flash', category: 'reasoning' },
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Llama 3.3 Nemotron Super 49B', category: 'balanced' },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', category: 'balanced' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', category: 'balanced' },
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', category: 'balanced', unavailable: true },
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', category: 'balanced' },
  { id: 'minimaxai/minimax-m2.7', name: 'MiniMax M2.7', category: 'balanced' },
  { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 122B', category: 'balanced' },
  { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 397B', category: 'balanced', unavailable: true },
  { id: 'qwen/qwen3-next-80b-a3b-instruct', name: 'Qwen 3 Next 80B', category: 'balanced' },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', category: 'balanced' },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', category: 'balanced' },
  { id: 'poolside/laguna-xs-2.1', name: 'Poolside Laguna XS 2.1', category: 'balanced' },
  { id: 'z-ai/glm-5.2', name: 'GLM 5.2', category: 'balanced' },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', category: 'fast', unavailable: true },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B', category: 'fast', unavailable: true },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', category: 'fast' },
  { id: 'google/gemma-3n-e4b-it', name: 'Gemma 3N E4B', category: 'fast' },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', category: 'vision' },
]

type BenchmarkResult = {
  model_id: string
  model_name: string
  category: string
  status: 'success' | 'error' | 'pending'
  reply?: string
  error?: string
  response_time_ms?: number
  usage?: any
}

const categoryColors: Record<string, string> = {
  reasoning: 'bg-purple-100 text-purple-700',
  balanced: 'bg-blue-100 text-blue-700',
  fast: 'bg-green-100 text-green-700',
  vision: 'bg-orange-100 text-orange-700',
}

const rankColors = ['text-amber-500', 'text-gray-400', 'text-amber-700']

export default function BenchmarkPage() {
  const [question, setQuestion] = useState('')
  const [selectedModels, setSelectedModels] = useState<Set<string>>(
    new Set(MODELS.filter(m => !m.unavailable).map(m => m.id))
  )
  const [results, setResults] = useState<BenchmarkResult[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedReply, setExpandedReply] = useState<string | null>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const availableModels = MODELS.filter(m => !m.unavailable)
  const allSelected = availableModels.every(m => selectedModels.has(m.id))

  function toggleModel(id: string) {
    setSelectedModels(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (allSelected) {
      setSelectedModels(new Set())
    } else {
      setSelectedModels(new Set(availableModels.map(m => m.id)))
    }
  }

  function selectCategory(cat: string) {
    setSelectedModels(prev => {
      const next = new Set(prev)
      MODELS.filter(m => m.category === cat && !m.unavailable).forEach(m => next.add(m.id))
      return next
    })
  }

  async function handleBenchmark() {
    if (!question.trim() || selectedModels.size === 0 || loading) return

    const modelIds = Array.from(selectedModels)
    const pendingResults: BenchmarkResult[] = modelIds.map(id => ({
      model_id: id,
      model_name: MODELS.find(m => m.id === id)?.name || id.split('/').pop() || '',
      category: MODELS.find(m => m.id === id)?.category || 'unknown',
      status: 'pending',
    }))
    setResults(pendingResults)
    setLoading(true)

    let completed = 0
    await Promise.allSettled(
      modelIds.map(async (id) => {
        const start = Date.now()
        try {
          const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: id, message: question })
          })
          const json = await res.json()
          if (json.error) throw new Error(json.error)
          const time = Date.now() - start
          setResults(prev => {
            const updated = prev.map(r =>
              r.model_id === id
                ? { ...r, status: 'success' as const, reply: json.data.reply, response_time_ms: time, usage: json.data.usage }
                : r
            )
            return updated.sort((a, b) => (a.response_time_ms ?? Infinity) - (b.response_time_ms ?? Infinity))
          })
        } catch (err: any) {
          const time = Date.now() - start
          setResults(prev => {
            const updated = prev.map(r =>
              r.model_id === id
                ? { ...r, status: 'error' as const, error: err.message, response_time_ms: time }
                : r
            )
            return updated.sort((a, b) => (a.response_time_ms ?? Infinity) - (b.response_time_ms ?? Infinity))
          })
        } finally {
          completed++
          if (completed === modelIds.length) setLoading(false)
        }
      })
    )
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleBenchmark()
    }
  }

  function formatTime(ms?: number) {
    if (ms === undefined || ms === null) return '—'
    if (ms < 1000) return `${ms}ms`
    return `${(ms / 1000).toFixed(1)}s`
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-gray-600 text-sm transition">← Dashboard</a>
          <div className="h-5 w-px bg-gray-200" />
          <a href="/chat" className="text-gray-400 hover:text-gray-600 text-sm transition">Chat</a>
          <div className="h-5 w-px bg-gray-200" />
          <h1 className="text-lg font-semibold text-gray-800">Model Benchmark</h1>
        </div>
        <span className="text-sm text-gray-500">{selectedModels.size} of {availableModels.length} available models selected</span>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Left Panel: Model Selection */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sticky top-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Models</h2>
                <button
                  onClick={toggleAll}
                  className={`text-xs font-medium px-2 py-1 rounded transition ${
                    allSelected ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {/* Category quick-select */}
              <div className="flex flex-wrap gap-1 mb-3">
                {['reasoning', 'balanced', 'fast', 'vision'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => selectCategory(cat)}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border transition hover:opacity-80 ${categoryColors[cat]}`}
                  >
                    +{cat}
                  </button>
                ))}
              </div>

              <div className="space-y-1 max-h-[60vh] overflow-y-auto">
                {MODELS.map(m => (
                  <label
                    key={m.id}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-lg cursor-pointer transition text-sm ${
                      selectedModels.has(m.id) ? 'bg-blue-50 text-blue-800' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModels.has(m.id)}
                      onChange={() => toggleModel(m.id)}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="truncate text-xs">{m.name}</span>
                    {m.unavailable && (
                      <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded-full bg-red-100 text-red-600">
                        unavailable
                      </span>
                    )}
                    {!m.unavailable && (
                      <span className={`ml-auto text-[9px] px-1.5 py-0.5 rounded-full ${categoryColors[m.category]}`}>
                        {m.category}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel: Question + Results */}
          <div className="lg:col-span-9">
            {/* Question Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-6">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-3">Question</h2>
              <div className="relative">
                <textarea
                  ref={inputRef}
                  value={question}
                  onChange={e => setQuestion(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type your question to benchmark all selected models..."
                  rows={3}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm resize-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 focus:outline-none placeholder-gray-400"
                />
                <button
                  onClick={handleBenchmark}
                  disabled={loading || !question.trim() || selectedModels.size === 0}
                  className={`absolute right-3 bottom-3 p-2 rounded-xl transition ${
                    loading || !question.trim() || selectedModels.size === 0
                      ? 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Press Enter to run benchmark · {selectedModels.size} models will be tested in parallel
              </p>
            </div>

            {/* Results Table */}
            {results.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-5 py-3 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Results</h2>
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    <span>{results.filter(r => r.status === 'success').length} succeeded</span>
                    <span>·</span>
                    <span>{results.filter(r => r.status === 'error').length} failed</span>
                    <span>·</span>
                    <span>Sorted by response time</span>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        <th className="px-5 py-3 w-12">#</th>
                        <th className="px-5 py-3">Model</th>
                        <th className="px-5 py-3 w-28">Time</th>
                        <th className="px-5 py-3 w-20">Status</th>
                        <th className="px-5 py-3">Response</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {results.map((r, i) => (
                        <tr key={r.model_id} className={`hover:bg-gray-50 transition ${r.status === 'pending' ? 'opacity-60' : ''}`}>
                          <td className="px-5 py-4">
                            <span className={`text-sm font-bold ${rankColors[i] || 'text-gray-400'}`}>
                              {r.status === 'pending' ? '—' : i + 1}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-gray-800 text-sm">{r.model_name}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${categoryColors[r.category] || 'bg-gray-100 text-gray-500'}`}>
                                {r.category}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            {r.status === 'pending' ? (
                              <div className="w-12 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div className="h-full bg-blue-400 rounded-full animate-pulse w-full" />
                              </div>
                            ) : (
                              <span className={`font-mono text-sm font-semibold ${
                                (r.response_time_ms ?? 0) < 3000 ? 'text-green-600' :
                                (r.response_time_ms ?? 0) < 8000 ? 'text-amber-600' : 'text-red-500'
                              }`}>
                                {formatTime(r.response_time_ms)}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {r.status === 'pending' && (
                              <span className="text-xs text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">Running...</span>
                            )}
                            {r.status === 'success' && (
                              <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">OK</span>
                            )}
                            {r.status === 'error' && (
                              <span className="text-xs text-red-600 bg-red-50 px-2 py-0.5 rounded-full">Error</span>
                            )}
                          </td>
                          <td className="px-5 py-4">
                            {r.status === 'success' && r.reply && (
                              <div>
                                <p className={`text-sm text-gray-700 ${expandedReply === r.model_id ? '' : 'line-clamp-2'}`}>
                                  {r.reply}
                                </p>
                                {r.reply.length > 150 && (
                                  <button
                                    onClick={() => setExpandedReply(expandedReply === r.model_id ? null : r.model_id)}
                                    className="text-xs text-blue-500 hover:underline mt-1"
                                  >
                                    {expandedReply === r.model_id ? 'Show less' : 'Show more'}
                                  </button>
                                )}
                              </div>
                            )}
                            {r.status === 'error' && (
                              <p className="text-sm text-red-500">{r.error}</p>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Empty state */}
            {results.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center h-[400px]">
                <div className="text-center">
                  <svg className="w-16 h-16 text-gray-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-600 mb-1">Ready to Benchmark</h3>
                  <p className="text-sm text-gray-400">Select models, type a question, and hit run to compare response times.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
