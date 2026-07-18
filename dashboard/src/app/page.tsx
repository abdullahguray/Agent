'use client'

import { useEffect, useState } from 'react'
import { api } from '@/lib/api'

type ModelInfo = {
  id: string
  name: string
  category: string
  provider: string
  capabilities: string[]
  supports_thinking?: boolean
  recommended_for?: string
}

type Config = {
  id: string
  topic: string
  sources: string[]
  model: string
  schedule: { work_min: number; sleep_min: number }
  status: string
  created_at: string
}

const CATEGORY_LABELS: Record<string, string> = {
  reasoning: 'Thinking / Reasoning',
  balanced: 'Balanced All-Round',
  fast: 'Fast / Cheap',
  vision: 'Vision / Multimodal'
}

const CATEGORY_COLORS: Record<string, string> = {
  reasoning: 'bg-purple-100 text-purple-800',
  balanced: 'bg-blue-100 text-blue-800',
  fast: 'bg-green-100 text-green-800',
  vision: 'bg-orange-100 text-orange-800'
}

export default function Home() {
  const [configs, setConfigs] = useState<Config[]>([])
  const [models, setModels] = useState<ModelInfo[]>([])
  const [topic, setTopic] = useState('')
  const [sources, setSources] = useState('')
  const [selectedModel, setSelectedModel] = useState('meta/llama-3.3-70b-instruct')
  const [modelSearch, setModelSearch] = useState('')
  const [showModelPicker, setShowModelPicker] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)
  const [scrapedData, setScrapedData] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const loadConfigs = async () => {
    try { const res = await api.getConfigs(); setConfigs(res.data || []) } catch (e) { console.error(e) }
  }

  const loadModels = async () => {
    try { const res = await api.getModels(); setModels(res.data || []) } catch (e) { console.error(e) }
  }

  useEffect(() => { loadConfigs(); loadModels() }, [])

  const handleCreateConfig = async () => {
    if (!topic.trim()) return
    setLoading(true)
    try {
      const sourcesList = sources.split(',').map(s => s.trim()).filter(Boolean)
      await api.createConfig({ topic, sources: sourcesList, model: selectedModel })
      setTopic(''); setSources(''); setSelectedModel('meta/llama-3.3-70b-instruct')
      await loadConfigs()
    } catch (e) { console.error(e) }
    setLoading(false)
  }

  const handleToggleStatus = async (config: Config) => {
    const newStatus = config.status === 'active' ? 'paused' : 'active'
    await api.updateConfig(config.id, { status: newStatus })
    await loadConfigs()
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this configuration?')) return
    await api.deleteConfig(id)
    await loadConfigs()
  }

  const handleModelChange = async (configId: string, modelId: string) => {
    await api.updateConfig(configId, { model: modelId })
    await loadConfigs()
  }

  const handleSelectConfig = async (id: string) => {
    setSelectedConfig(id)
    try {
      const [dataRes, logRes] = await Promise.all([
        api.getScrapedData(id),
        api.getTaskLogs(id),
      ])
      setScrapedData(dataRes.data || [])
      setLogs(logRes.data || [])
    } catch (e) { console.error(e) }
  }

  const filteredModels = models.filter(m =>
    m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
    m.name.toLowerCase().includes(modelSearch.toLowerCase())
  )

  const groupedModels = filteredModels.reduce((acc, m) => {
    const cat = m.category || 'other'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(m)
    return acc
  }, {} as Record<string, ModelInfo[]>)

  const selectedModelInfo = models.find(m => m.id === selectedModel)

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b px-6 py-4">
        <h1 className="text-xl font-bold">Scrape Agent AI</h1>
      </nav>

      <div className="max-w-7xl mx-auto p-6">
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">New Scraping Configuration</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Topic (e.g. Latest tech news)"
              className="border rounded-lg px-4 py-2 col-span-2"
            />
            <input
              value={sources}
              onChange={e => setSources(e.target.value)}
              placeholder="Sources (comma-separated URLs)"
              className="border rounded-lg px-4 py-2 col-span-1"
            />
            <div className="relative col-span-1">
              <button
                onClick={() => setShowModelPicker(!showModelPicker)}
                className="w-full border rounded-lg px-4 py-2 text-left flex items-center justify-between bg-white hover:bg-gray-50"
              >
                <span className="truncate text-sm">
                  {selectedModelInfo ? `${selectedModelInfo.provider} - ${selectedModelInfo.name}` : 'Select Model'}
                </span>
                <svg className={`w-4 h-4 transition ${showModelPicker ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showModelPicker && (
                <div className="absolute z-50 mt-1 w-full bg-white border rounded-lg shadow-xl max-h-96 overflow-hidden">
                  <div className="p-2 border-b">
                    <input
                      value={modelSearch}
                      onChange={e => setModelSearch(e.target.value)}
                      placeholder="Search models..."
                      className="w-full border rounded px-2 py-1 text-sm"
                      autoFocus
                    />
                  </div>
                  <div className="overflow-y-auto max-h-80">
                    {Object.entries(groupedModels).map(([cat, catModels]) => (
                      <div key={cat}>
                        <div className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0">
                          {CATEGORY_LABELS[cat] || cat}
                        </div>
                        {catModels.map(m => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedModel(m.id); setShowModelPicker(false); setModelSearch('') }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-blue-50 flex items-center justify-between ${selectedModel === m.id ? 'bg-blue-50' : ''}`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{m.name}</div>
                              <div className="text-xs text-gray-500 truncate">{m.id}</div>
                            </div>
                            <span className={`text-xs px-1.5 py-0.5 rounded ml-2 ${CATEGORY_COLORS[m.category] || 'bg-gray-100 text-gray-800'}`}>
                              {m.category}
                            </span>
                          </button>
                        ))}
                      </div>
                    ))}
                    {filteredModels.length === 0 && (
                      <p className="p-4 text-sm text-gray-500 text-center">No models found</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex gap-2 text-xs text-gray-500">
              <span className={`px-2 py-0.5 rounded ${selectedModelInfo ? CATEGORY_COLORS[selectedModelInfo.category] || '' : ''}`}>
                {selectedModelInfo?.category || 'balanced'}
              </span>
              <span>{selectedModelInfo?.capabilities?.join(', ') || ''}</span>
            </div>
            <button
              onClick={handleCreateConfig}
              disabled={loading || !topic.trim()}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Config'}
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">Schedule: 3min work → 3min sleep → repeat (24/7) | {models.length} models available</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <h2 className="text-lg font-semibold mb-3">Configurations</h2>
            <div className="space-y-3">
              {configs.map(c => {
                const cfgModel = models.find(m => m.id === c.model)
                return (
                  <div
                    key={c.id}
                    onClick={() => handleSelectConfig(c.id)}
                    className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition ${selectedConfig === c.id ? 'ring-2 ring-blue-500' : 'hover:shadow'}`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium truncate">{c.topic}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {c.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1">{c.sources?.length || 0} sources</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
                      <span className={`px-1.5 py-0.5 rounded ${cfgModel ? CATEGORY_COLORS[cfgModel.category] || '' : ''}`}>
                        {cfgModel?.name || c.model?.split('/').pop() || 'default'}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={e => { e.stopPropagation(); handleToggleStatus(c) }} className="text-xs text-blue-600 hover:underline">
                        {c.status === 'active' ? 'Pause' : 'Resume'}
                      </button>
                      <button onClick={e => { e.stopPropagation(); handleDelete(c.id) }} className="text-xs text-red-600 hover:underline">
                        Delete
                      </button>
                    </div>
                  </div>
                )
              })}
              {configs.length === 0 && <p className="text-gray-500 text-sm">No configurations yet</p>}
            </div>
          </div>

          <div className="lg:col-span-2">
            {selectedConfig ? (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-lg font-semibold">Scraped Data</h2>
                  {(() => {
                    const cfg = configs.find(c => c.id === selectedConfig)
                    return cfg ? (
                      <select
                        value={cfg.model}
                        onChange={e => handleModelChange(cfg.id, e.target.value)}
                        className="text-sm border rounded px-2 py-1"
                      >
                        {models.map(m => (
                          <option key={m.id} value={m.id}>{m.name} ({m.category})</option>
                        ))}
                      </select>
                    ) : null
                  })()}
                </div>
                <div className="bg-white rounded-lg shadow-sm border mb-6">
                  {scrapedData.length > 0 ? (
                    <div className="divide-y">
                      {scrapedData.slice(0, 10).map((d: any) => (
                        <div key={d.id} className="p-4">
                          <h3 className="font-medium mb-1">{d.title || 'No title'}</h3>
                          <p className="text-sm text-gray-600 line-clamp-2">{d.ai_summary || d.content?.slice(0, 200)}</p>
                          {d.model_used && (
                            <span className="text-xs text-gray-400">Model: {d.model_used}</span>
                          )}
                          {d.source_url && (
                            <a href={d.source_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 block">
                              {d.source_url}
                            </a>
                          )}
                          <p className="text-xs text-gray-400 mt-1">{new Date(d.scraped_at).toLocaleString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-gray-500 text-sm">No data scraped yet. Wait for the next cycle.</p>
                  )}
                </div>

                <h2 className="text-lg font-semibold mb-3">Task Logs</h2>
                <div className="bg-white rounded-lg shadow-sm border">
                  {logs.length > 0 ? (
                    <div className="divide-y text-sm">
                      {logs.map((l: any) => (
                        <div key={l.id} className="p-3 flex justify-between">
                          <div>
                            <span className={`font-medium ${l.status === 'completed' ? 'text-green-600' : l.status === 'error' ? 'text-red-600' : 'text-yellow-600'}`}>
                              {l.status}
                            </span>
                            <span className="text-gray-500 ml-2">Cycle #{l.cycle_number}</span>
                          </div>
                          <div className="text-gray-500">
                            {l.items_scraped > 0 && <span>{l.items_scraped} items | </span>}
                            {l.started_at && new Date(l.started_at).toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="p-4 text-gray-500 text-sm">No logs yet.</p>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-64 bg-white rounded-lg shadow-sm border">
                <p className="text-gray-500">Select a configuration to view its data</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
