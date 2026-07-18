const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function fetchAPI(endpoint: string, options?: RequestInit) {
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...options?.headers },
    ...options,
  })
  if (!res.ok) throw new Error(`API error: ${res.statusText}`)
  return res.json()
}

export const api = {
  getConfigs: () => fetchAPI('/api/configurations'),
  getModels: () => fetchAPI('/api/models'),
  createConfig: (data: any) => fetchAPI('/api/configurations', { method: 'POST', body: JSON.stringify(data) }),
  updateConfig: (id: string, data: any) => fetchAPI(`/api/configurations/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteConfig: (id: string) => fetchAPI(`/api/configurations/${id}`, { method: 'DELETE' }),
  getScrapedData: (configId?: string) => fetchAPI(`/api/scraped-data?${configId ? `config_id=${configId}` : ''}`),
  getTaskLogs: (configId?: string) => fetchAPI(`/api/task-logs?${configId ? `config_id=${configId}` : ''}`),
  planScrape: (topic: string, sources?: string[], model?: string) => {
    let url = `/api/plan?topic=${encodeURIComponent(topic)}`
    if (sources?.length) url += `&sources=${encodeURIComponent(JSON.stringify(sources))}`
    if (model) url += `&model=${encodeURIComponent(model)}`
    return fetchAPI(url, { method: 'POST' })
  },
}
