'use client'

import { useEffect, useState, useRef, useCallback } from 'react'

type SystemStatus = {
  configs: number
  active_configs: number
  total_scraped: number
  total_logs: number
  last_run: string | null
  recent_logs: any[]
}

type Config = {
  id: string
  topic: string
  sources: string[]
  model: string
  status: string
  created_at: string
}

type TaskLog = {
  id: string
  config_id: string
  cycle_number: number
  status: string
  started_at: string
  ended_at: string | null
  items_scraped: number
  error: string | null
  details: any
}

type ScrapedData = {
  id: string
  config_id: string
  title: string
  content: string
  source_url: string
  ai_summary: string
  model_used: string
  scraped_at: string
}

function relativeTime(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffSec = Math.floor((now - then) / 1000)
  if (diffSec < 60) return `${diffSec}s ago`
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin}m ago`
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return `${diffHr}h ago`
  const diffDay = Math.floor(diffHr / 24)
  return `${diffDay}d ago`
}

function isSystemRunning(lastRun: string | null): boolean {
  if (!lastRun) return false
  const diff = Date.now() - new Date(lastRun).getTime()
  return diff < 5 * 60 * 1000
}

function statusColor(status: string): string {
  switch (status) {
    case 'completed': return 'bg-green-100 text-green-800'
    case 'running': return 'bg-blue-100 text-blue-800'
    case 'error': return 'bg-red-100 text-red-800'
    case 'active': return 'bg-green-100 text-green-800'
    case 'paused': return 'bg-yellow-100 text-yellow-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor(status)}`}>
      {status}
    </span>
  )
}

export default function MonitorPage() {
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null)
  const [configs, setConfigs] = useState<Config[]>([])
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null)
  const [taskLogs, setTaskLogs] = useState<TaskLog[]>([])
  const [scrapedData, setScrapedData] = useState<ScrapedData[]>([])
  const [activeTab, setActiveTab] = useState<'logs' | 'data' | 'reasoning'>('logs')
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null)
  const [logDetails, setLogDetails] = useState<Record<string, any>>({})
  const [autoRefresh, setAutoRefresh] = useState(false)
  const [loading, setLoading] = useState(true)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetchSystemStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/system/status')
      if (res.ok) {
        const data = await res.json()
        setSystemStatus(data)
      }
    } catch (e) {
      console.error('Failed to fetch system status:', e)
    }
  }, [])

  const fetchConfigs = useCallback(async () => {
    try {
      const res = await fetch('/api/configurations')
      if (res.ok) {
        const data = await res.json()
        setConfigs(data.data || data || [])
      }
    } catch (e) {
      console.error('Failed to fetch configs:', e)
    }
  }, [])

  const fetchTaskLogs = useCallback(async (configId: string) => {
    try {
      const res = await fetch(`/api/task-logs?config_id=${configId}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setTaskLogs(data.data || data || [])
      }
    } catch (e) {
      console.error('Failed to fetch task logs:', e)
    }
  }, [])

  const fetchScrapedData = useCallback(async (configId: string) => {
    try {
      const res = await fetch(`/api/scraped-data?config_id=${configId}&limit=50`)
      if (res.ok) {
        const data = await res.json()
        setScrapedData(data.data || data || [])
      }
    } catch (e) {
      console.error('Failed to fetch scraped data:', e)
    }
  }, [])

  const fetchLogDetails = useCallback(async (logId: string) => {
    if (logDetails[logId]) return
    try {
      const res = await fetch(`/api/task-logs/${logId}`)
      if (res.ok) {
        const data = await res.json()
        setLogDetails(prev => ({ ...prev, [logId]: data }))
      }
    } catch (e) {
      console.error('Failed to fetch log details:', e)
    }
  }, [logDetails])

  const loadAll = useCallback(async () => {
    setLoading(true)
    await Promise.all([fetchSystemStatus(), fetchConfigs()])
    setLoading(false)
  }, [fetchSystemStatus, fetchConfigs])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (selectedConfigId) {
      fetchTaskLogs(selectedConfigId)
      fetchScrapedData(selectedConfigId)
    }
  }, [selectedConfigId, fetchTaskLogs, fetchScrapedData])

  useEffect(() => {
    if (autoRefresh) {
      intervalRef.current = setInterval(() => {
        fetchSystemStatus()
        fetchConfigs()
        if (selectedConfigId) {
          fetchTaskLogs(selectedConfigId)
          fetchScrapedData(selectedConfigId)
        }
      }, 10000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [autoRefresh, selectedConfigId, fetchSystemStatus, fetchConfigs, fetchTaskLogs, fetchScrapedData])

  const selectedConfig = configs.find(c => c.id === selectedConfigId)

  const reasoningLogs = taskLogs.filter(l =>
    l.details?.reasoning || l.details?.plan
  )

  const renderLogStepDetails = (details: any) => {
    if (!details) return <p className="text-sm text-gray-500">No details available</p>

    const steps = [
      { label: 'Plan', content: details.plan },
      { label: 'Sources', content: details.sources },
      { label: 'Results', content: details.results },
      { label: 'Errors', content: details.errors || details.error },
      { label: 'Reasoning', content: details.reasoning },
    ]

    return (
      <div className="mt-3 space-y-3 border-t pt-3">
        {steps.map(step => {
          if (!step.content) return null
          const content = typeof step.content === 'string'
            ? step.content
            : JSON.stringify(step.content, null, 2)
          return (
            <div key={step.label}>
              <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">{step.label}</h5>
              <pre className="text-xs bg-gray-50 rounded p-2 overflow-x-auto whitespace-pre-wrap max-h-48 overflow-y-auto">
                {content}
              </pre>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Header */}
      <nav className="bg-gray-900 text-white px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a href="/" className="text-gray-400 hover:text-white text-sm">
            ← Back to Dashboard
          </a>
          <h1 className="text-xl font-bold">System Monitor</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              autoRefresh
                ? 'bg-green-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-green-300 animate-pulse' : 'bg-gray-500'}`} />
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          <button
            onClick={loadAll}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-700 text-gray-300 hover:bg-gray-600 transition"
          >
            Refresh Now
          </button>
        </div>
      </nav>

      <div className="max-w-[1600px] mx-auto p-6">
        {/* System Status Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">System Status</h2>
            <div className="flex items-center gap-2">
              <span
                className={`w-3 h-3 rounded-full ${
                  systemStatus && isSystemRunning(systemStatus.last_run)
                    ? 'bg-green-500 animate-pulse'
                    : 'bg-red-400'
                }`}
              />
              <span className="text-sm font-medium text-gray-700">
                {systemStatus && isSystemRunning(systemStatus.last_run) ? 'Running' : 'Idle'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Configs</p>
              <p className="text-3xl font-bold text-gray-900">{systemStatus?.configs ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Configs</p>
              <p className="text-3xl font-bold text-green-600">{systemStatus?.active_configs ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Items Scraped</p>
              <p className="text-3xl font-bold text-blue-600">{systemStatus?.total_scraped ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Total Logs</p>
              <p className="text-3xl font-bold text-purple-600">{systemStatus?.total_logs ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1">Last Run</p>
              <p className="text-3xl font-bold text-gray-900">
                {relativeTime(systemStatus?.last_run ?? null)}
              </p>
            </div>
          </div>

          {systemStatus?.recent_logs && systemStatus.recent_logs.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Recent Activity</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                {systemStatus.recent_logs.slice(0, 10).map((log: any, i: number) => (
                  <span
                    key={i}
                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${statusColor(log.status || 'completed')}`}
                  >
                    {log.config_topic || 'Config'} · Cycle #{log.cycle_number || '?'}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content: Left Sidebar + Right Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Configurations List */}
          <div className="lg:col-span-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-900">Configurations</h2>
              <span className="text-sm text-gray-500">{configs.length} total</span>
            </div>

            <div className="space-y-3">
              {loading && configs.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
                  <p className="text-sm text-gray-500">Loading...</p>
                </div>
              )}

              {!loading && configs.length === 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
                  <p className="text-gray-500 text-sm">No configurations yet</p>
                </div>
              )}

              {configs.map(config => (
                <div
                  key={config.id}
                  onClick={() => {
                    setSelectedConfigId(config.id)
                    setActiveTab('logs')
                    setExpandedLogId(null)
                  }}
                  className={`bg-white rounded-xl shadow-sm border p-4 cursor-pointer transition-all ${
                    selectedConfigId === config.id
                      ? 'border-blue-500 ring-2 ring-blue-100'
                      : 'border-gray-200 hover:border-gray-300 hover:shadow'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 truncate pr-2">{config.topic}</h3>
                    <StatusBadge status={config.status} />
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                      {config.model?.split('/').pop() || 'default'}
                    </span>
                    <span>{config.sources?.length || 0} source{(config.sources?.length || 0) !== 1 ? 's' : ''}</span>
                  </div>

                  <p className="text-xs text-gray-400">
                    Created {relativeTime(config.created_at)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Selected Config Details */}
          <div className="lg:col-span-8">
            {selectedConfig ? (
              <>
                {/* Config Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 mb-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{selectedConfig.topic}</h2>
                      <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                        <span>Model: <span className="font-medium text-gray-700">{selectedConfig.model?.split('/').pop()}</span></span>
                        <span>·</span>
                        <span>{selectedConfig.sources?.length || 0} sources</span>
                        <span>·</span>
                        <StatusBadge status={selectedConfig.status} />
                      </div>
                    </div>
                  </div>

                  {/* Sources */}
                  {selectedConfig.sources && selectedConfig.sources.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {selectedConfig.sources.map((src, i) => (
                        <a
                          key={i}
                          href={src}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-100 transition truncate max-w-[200px]"
                          title={src}
                        >
                          {new URL(src).hostname}
                        </a>
                      ))}
                    </div>
                  )}
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                  <div className="flex border-b border-gray-200">
                    {(['logs', 'data', 'reasoning'] as const).map(tab => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-3 text-sm font-semibold text-center transition ${
                          activeTab === tab
                            ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
                            : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {tab === 'logs' && `Logs (${taskLogs.length})`}
                        {tab === 'data' && `Data (${scrapedData.length})`}
                        {tab === 'reasoning' && `Reasoning (${reasoningLogs.length})`}
                      </button>
                    ))}
                  </div>

                  <div className="p-5">
                    {/* Logs Tab */}
                    {activeTab === 'logs' && (
                      <div className="space-y-3">
                        {taskLogs.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">No logs yet. Wait for the next cycle.</p>
                        )}
                        {taskLogs.map(log => {
                          const isExpanded = expandedLogId === log.id
                          const duration = log.ended_at && log.started_at
                            ? Math.round((new Date(log.ended_at).getTime() - new Date(log.started_at).getTime()) / 1000)
                            : null

                          return (
                            <div
                              key={log.id}
                              className="border border-gray-200 rounded-lg overflow-hidden"
                            >
                              <div
                                onClick={() => {
                                  if (isExpanded) {
                                    setExpandedLogId(null)
                                  } else {
                                    setExpandedLogId(log.id)
                                    fetchLogDetails(log.id)
                                  }
                                }}
                                className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition"
                              >
                                <div className="flex items-center gap-3">
                                  <StatusBadge status={log.status} />
                                  <span className="text-sm font-medium text-gray-700">
                                    Cycle #{log.cycle_number}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {log.items_scraped} items
                                  </span>
                                  {duration !== null && (
                                    <span className="text-xs text-gray-400">
                                      {duration}s
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <span className="text-xs text-gray-400">
                                    {relativeTime(log.started_at)}
                                  </span>
                                  <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </div>
                              </div>

                              {isExpanded && (
                                <div className="px-4 pb-4 border-t border-gray-100">
                                  {log.error && (
                                    <div className="mt-3 bg-red-50 border border-red-200 rounded p-3">
                                      <p className="text-sm font-medium text-red-800">Error</p>
                                      <p className="text-xs text-red-600 mt-1">{log.error}</p>
                                    </div>
                                  )}
                                  {logDetails[log.id] ? (
                                    renderLogStepDetails(logDetails[log.id].details || logDetails[log.id])
                                  ) : (
                                    <div className="flex items-center gap-2 mt-3 text-sm text-gray-500">
                                      <div className="animate-spin w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full" />
                                      Loading details...
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Data Tab */}
                    {activeTab === 'data' && (
                      <div className="space-y-4">
                        {scrapedData.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">No data scraped yet.</p>
                        )}
                        {scrapedData.map(item => (
                          <div
                            key={item.id}
                            className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-semibold text-gray-900">{item.title || 'Untitled'}</h4>
                              <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                                {relativeTime(item.scraped_at)}
                              </span>
                            </div>

                            {item.ai_summary && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{item.ai_summary}</p>
                            )}

                            {!item.ai_summary && item.content && (
                              <p className="text-sm text-gray-600 mb-2 line-clamp-3">{item.content.slice(0, 300)}...</p>
                            )}

                            <div className="flex items-center gap-3 flex-wrap">
                              {item.source_url && (
                                <a
                                  href={item.source_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline truncate max-w-[300px]"
                                >
                                  {item.source_url}
                                </a>
                              )}
                              {item.model_used && (
                                <span className="text-xs bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                                  {item.model_used?.split('/').pop()}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reasoning Tab */}
                    {activeTab === 'reasoning' && (
                      <div className="space-y-4">
                        {reasoningLogs.length === 0 && (
                          <p className="text-sm text-gray-500 text-center py-8">No reasoning data available yet.</p>
                        )}
                        {reasoningLogs.map(log => (
                          <div
                            key={log.id}
                            className="border border-gray-200 rounded-lg p-4"
                          >
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <StatusBadge status={log.status} />
                                <span className="text-sm font-medium text-gray-700">
                                  Cycle #{log.cycle_number}
                                </span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {relativeTime(log.started_at)}
                              </span>
                            </div>

                            {(log.details?.reasoning || log.details?.plan) && (
                              <div className="space-y-3">
                                {log.details.plan && (
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Plan</h5>
                                    <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                                      {typeof log.details.plan === 'string'
                                        ? log.details.plan
                                        : JSON.stringify(log.details.plan, null, 2)}
                                    </pre>
                                  </div>
                                )}
                                {log.details.reasoning && (
                                  <div>
                                    <h5 className="text-xs font-semibold text-gray-500 uppercase mb-1">Reasoning</h5>
                                    <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                                      {typeof log.details.reasoning === 'string'
                                        ? log.details.reasoning
                                        : JSON.stringify(log.details.reasoning, null, 2)}
                                    </pre>
                                  </div>
                                )}
                              </div>
                            )}

                            {!log.details?.reasoning && !log.details?.plan && log.details && (
                              <pre className="text-xs bg-gray-50 rounded p-3 overflow-x-auto whitespace-pre-wrap">
                                {JSON.stringify(log.details, null, 2)}
                              </pre>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex items-center justify-center h-[500px]">
                <div className="text-center">
                  <svg className="w-12 h-12 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500">Select a configuration to view details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
