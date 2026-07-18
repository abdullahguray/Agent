import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://itzwwompgyjgxkaddxvl.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml0end3b21wZ3lqZ3hrYWRkeHZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM3NTU3NCwiZXhwIjoyMDk5OTUxNTc0fQ.N2dgZE22Z2t4aHrmzfOjVwwT5YJwawgtCd__twnuUlU'
const nvidiaApiKey = process.env.NVIDIA_API_KEY || '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'
const nvidiaBaseUrl = 'https://integrate.api.nvidia.com/v1'
const cronSecret = process.env.CRON_SECRET || 'scrape-agent-cron-2026'

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

const MODEL_REGISTRY: any[] = [
  { id: 'deepseek-ai/deepseek-v4-flash', name: 'DeepSeek V4 Flash', category: 'reasoning', provider: 'DeepSeek', capabilities: ['planning', 'reasoning', 'thinking', 'analysis'], supports_thinking: true, recommended_for: 'planning' },
  { id: 'deepseek-ai/deepseek-v4-pro', name: 'DeepSeek V4 Pro', category: 'reasoning', provider: 'DeepSeek', capabilities: ['planning', 'reasoning', 'analysis'], supports_thinking: true, recommended_for: 'planning', unavailable: true },
  { id: 'nvidia/nemotron-3-ultra-550b-a55b', name: 'Nemotron 3 Ultra 550B', category: 'reasoning', provider: 'NVIDIA', capabilities: ['planning', 'reasoning', 'thinking', 'analysis'], supports_thinking: true, recommended_for: 'deep_analysis' },
  { id: 'nvidia/nemotron-3-super-120b-a12b', name: 'Nemotron 3 Super 120B', category: 'reasoning', provider: 'NVIDIA', capabilities: ['planning', 'reasoning', 'thinking'], supports_thinking: true },
  { id: 'nvidia/nemotron-3-nano-30b-a3b', name: 'Nemotron 3 Nano 30B', category: 'reasoning', provider: 'NVIDIA', capabilities: ['reasoning', 'thinking'], supports_thinking: true, recommended_for: 'fast_reasoning' },
  { id: 'google/gemma-4-31b-it', name: 'Gemma 4 31B IT', category: 'reasoning', provider: 'Google', capabilities: ['planning', 'reasoning', 'thinking'], supports_thinking: true, unavailable: true },
  { id: 'stepfun-ai/step-3.7-flash', name: 'Step 3.7 Flash', category: 'reasoning', provider: 'StepFun', capabilities: ['planning', 'reasoning'] },
  { id: 'stepfun-ai/step-3.5-flash', name: 'Step 3.5 Flash', category: 'reasoning', provider: 'StepFun', capabilities: ['planning', 'reasoning'] },
  { id: 'nvidia/llama-3.3-nemotron-super-49b-v1.5', name: 'Llama 3.3 Nemotron Super 49B', category: 'balanced', provider: 'NVIDIA', capabilities: ['planning', 'analysis', 'summarization'], recommended_for: 'summarization' },
  { id: 'meta/llama-3.3-70b-instruct', name: 'Llama 3.3 70B', category: 'balanced', provider: 'Meta', capabilities: ['planning', 'analysis', 'summarization'], recommended_for: 'planning' },
  { id: 'meta/llama-3.1-70b-instruct', name: 'Llama 3.1 70B', category: 'balanced', provider: 'Meta', capabilities: ['planning', 'analysis', 'summarization'] },
  { id: 'moonshotai/kimi-k2.6', name: 'Kimi K2.6', category: 'balanced', provider: 'Moonshot', capabilities: ['planning', 'analysis'], unavailable: true },
  { id: 'minimaxai/minimax-m3', name: 'MiniMax M3', category: 'balanced', provider: 'MiniMax', capabilities: ['planning', 'analysis', 'summarization'], recommended_for: 'general' },
  { id: 'minimaxai/minimax-m2.7', name: 'MiniMax M2.7', category: 'balanced', provider: 'MiniMax', capabilities: ['planning', 'summarization'] },
  { id: 'qwen/qwen3.5-122b-a10b', name: 'Qwen 3.5 122B', category: 'balanced', provider: 'Qwen', capabilities: ['planning', 'analysis', 'summarization'], recommended_for: 'cheap_planning' },
  { id: 'qwen/qwen3.5-397b-a17b', name: 'Qwen 3.5 397B', category: 'balanced', provider: 'Qwen', capabilities: ['planning', 'analysis', 'summarization'], recommended_for: 'high_quality', unavailable: true },
  { id: 'qwen/qwen3-next-80b-a3b-instruct', name: 'Qwen 3 Next 80B', category: 'balanced', provider: 'Qwen', capabilities: ['planning', 'summarization'] },
  { id: 'openai/gpt-oss-20b', name: 'GPT-OSS 20B', category: 'balanced', provider: 'OpenAI', capabilities: ['planning', 'analysis'] },
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', category: 'balanced', provider: 'OpenAI', capabilities: ['planning', 'analysis', 'reasoning'] },
  { id: 'poolside/laguna-xs-2.1', name: 'Laguna XS 2.1', category: 'balanced', provider: 'Poolside', capabilities: ['planning', 'analysis'] },
  { id: 'z-ai/glm-5.2', name: 'GLM 5.2', category: 'balanced', provider: 'Z-AI', capabilities: ['planning', 'analysis'] },
  { id: 'meta/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', category: 'fast', provider: 'Meta', capabilities: ['planning', 'summarization'], recommended_for: 'fast_planning', unavailable: true },
  { id: 'meta/llama-3.2-1b-instruct', name: 'Llama 3.2 1B', category: 'fast', provider: 'Meta', capabilities: ['simple_tasks'], unavailable: true },
  { id: 'meta/llama-3.2-3b-instruct', name: 'Llama 3.2 3B', category: 'fast', provider: 'Meta', capabilities: ['simple_tasks', 'summarization'] },
  { id: 'google/gemma-3n-e4b-it', name: 'Gemma 3N E4B', category: 'fast', provider: 'Google', capabilities: ['simple_tasks', 'summarization'] },
  { id: 'meta/llama-3.2-11b-vision-instruct', name: 'Llama 3.2 11B Vision', category: 'vision', provider: 'Meta', capabilities: ['vision', 'analysis'] }
]

function json(status: number, data: any) {
  return { statusCode: status, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }
}

function timer() { const s = Date.now(); return () => Date.now() - s }

async function nvidiaChat(messages: any[], modelId: string, overrides: any = {}) {
  const model = MODEL_REGISTRY.find((m: any) => m.id === modelId) || MODEL_REGISTRY[0]
  const body: any = {
    model: modelId,
    messages,
    temperature: overrides.temperature ?? model.params?.temperature ?? 0.3,
    top_p: overrides.top_p ?? model.params?.top_p ?? 0.95,
    max_tokens: overrides.max_tokens ?? model.params?.max_tokens ?? 1024
  }
  for (const k of ['seed', 'frequency_penalty', 'presence_penalty', 'repetition_penalty', 'top_k']) {
    if (model.params?.[k] !== undefined) body[k] = model.params[k]
  }
  if (model.params?.extra_body) body.extra_body = model.params.extra_body

  const elapsed = timer()
  const res = await fetch(`${nvidiaBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${nvidiaApiKey}` },
    body: JSON.stringify(body)
  })
  if (!res.ok) throw new Error(`NVIDIA API ${res.status}: ${await res.text()}`)
  const data = await res.json()
  data._responseTime = elapsed()
  return data
}

async function scrapeUrl(url: string, selectors?: any) {
  const elapsed = timer()
  const result: any = { url, title: '', content: '', raw_html: '' }
  try {
    const controller = new AbortController()
    const t = setTimeout(() => controller.abort(), 30000)
    const res = await fetch(url, { signal: controller.signal, headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ScrapeAgentAI/1.0)' } })
    clearTimeout(t)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const html = await res.text()
    result.raw_html = html

    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    result.title = titleMatch ? titleMatch[1].trim() : ''

    if (selectors?.content) {
      const regex = new RegExp(`<${selectors.content}[^>]*>([\\s\\S]*?)<\\/${selectors.content}>`, 'i')
      const m = html.match(regex)
      if (m) result.content = m[1].replace(/<[^>]*>/g, '').trim()
    }
    if (!result.content) {
      const text = html.replace(/<[^>]*>/g, '\n').replace(/\s+/g, ' ').trim()
      result.content = text.slice(0, 5000)
    }
  } catch (err: any) {
    result.error = err.message
  }
  result._scrapeTime = elapsed()
  return result
}

async function generatePlan(topic: string, sources: string[], modelId: string) {
  const prompt = `You are a web scraping planning AI. Given a topic and optional sources, design a scraping plan.

Rules:
1. Identify what information to scrape
2. Generate search queries or URLs if none provided
3. Define CSS selectors or data extraction patterns
4. Return only valid JSON with this structure:

{
  "topic_analysis": "Brief summary",
  "target_sites": [
    {
      "url": "full URL",
      "purpose": "what data from this site",
      "selectors": {
        "title": "CSS selector or pattern",
        "content": "CSS selector or pattern"
      }
    }
  ],
  "extraction_fields": ["field1", "field2"],
  "max_items": 5
}`

  const completion = await nvidiaChat(
    [{ role: 'system', content: prompt }, { role: 'user', content: `Topic: ${topic}\n${sources.length ? `Sources: ${JSON.stringify(sources)}` : ''}` }],
    modelId,
    { temperature: 0.3, max_tokens: 1000 }
  )

  const rawReasoning = completion.choices?.[0]?.message?.content || ''
  const content = rawReasoning
  const clean = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '')
  try {
    const result = JSON.parse(clean)
    result._model_used = modelId
    result._plan_time = completion._responseTime
    result._raw_reasoning = rawReasoning
    return result
  } catch {
    return { topic_analysis: topic, target_sites: sources.map((s: string) => ({ url: s, purpose: topic, selectors: {} })), extraction_fields: ['title', 'content'], max_items: 5, error: 'Parse failed', _model_used: modelId, _plan_time: completion._responseTime, _raw_reasoning: rawReasoning }
  }
}

async function summarize(title: string, content: string, modelId: string) {
  const completion = await nvidiaChat(
    [{ role: 'system', content: 'Summarize the following scraped content in 2-3 sentences. Focus on key facts and data points.' }, { role: 'user', content: `Title: ${title}\n\nContent: ${content.slice(0, 2000)}` }],
    modelId,
    { temperature: 0.2, max_tokens: 300 }
  )
  return { text: completion.choices?.[0]?.message?.content?.trim() || '', _responseTime: completion._responseTime }
}

async function runScrapeCycle(config: any) {
  const cycleStart = timer()
  const details: any[] = []
  let modelId = config.model || 'meta/llama-3.3-70b-instruct'
  const modelInfo = MODEL_REGISTRY.find((m: any) => m.id === modelId)
  if (modelInfo?.unavailable) {
    modelId = 'meta/llama-3.1-70b-instruct'
  }
  const topic = config.topic
  const sources = config.sources || []

  const currentCycle = (config._current_cycle || 0) + 1

  details.push({ step: 'started', time: cycleStart(), cycle: currentCycle, model: modelId })

  const { data: logData } = await supabase.from('task_logs').insert({
    config_id: config.id, cycle_number: currentCycle, status: 'scraping', started_at: new Date().toISOString()
  }).select().single()
  const logId = logData?.id

  let plan
  let planTime = 0
  let planError: string | null = null
  try {
    plan = topic ? await generatePlan(topic, sources, modelId) : { target_sites: sources.map((s: string) => ({ url: s, purpose: '', selectors: {} })), max_items: 5 }
    planTime = plan._plan_time || 0
  } catch (err: any) {
    planError = err.message
    plan = { target_sites: sources.map((s: string) => ({ url: s, purpose: '', selectors: {} })), max_items: 5 }
  }

  const targetSites = plan.target_sites || []
  details.push({ step: 'plan_generated', plan_time: planTime, sites_found: targetSites.length, reasoning: (plan._raw_reasoning || '').slice(0, 500), error: planError })

  const limit = Math.min(targetSites.length, 10)
  const scrapedItems: any[] = []
  const errors: string[] = []

  for (const site of targetSites.slice(0, limit)) {
    try {
      const result = await scrapeUrl(site.url, site.selectors)
      if (result.error) {
        errors.push(result.error)
        details.push({ step: 'scrape_error', url: site.url, error: result.error, time: result._scrapeTime })
        continue
      }

      let summary: any = { text: '', _responseTime: 0 }
      let summaryTime = 0
      if (result.content) {
        try {
          summary = await summarize(result.title, result.content, modelId)
          summaryTime = summary._responseTime || 0
        } catch {}
      }

      details.push({ step: 'scraped', url: site.url, title: result.title, content_length: result.content?.length || 0, scrape_time: result._scrapeTime, summary_time: summaryTime, content_preview: (result.content || '').slice(0, 200) })

      const { data: inserted } = await supabase.from('scraped_data').insert({
        config_id: config.id, title: result.title || '', content: result.content || '', source_url: result.url,
        raw_json: result, ai_summary: summary.text, model_used: modelId
      }).select().single()
      if (inserted) scrapedItems.push(inserted)
    } catch (err: any) { errors.push(`${site.url}: ${err.message}`) }
  }

  const totalTime = cycleStart()

  if (logId) {
    await supabase.from('task_logs').update({
      status: errors.length && !scrapedItems.length ? 'error' : 'completed',
      ended_at: new Date().toISOString(), items_scraped: scrapedItems.length,
      error: errors.slice(0, 3).join('; ') || null,
      details: { total_time: totalTime, steps: details, sites_scraped: scrapedItems.length, errors: errors.length }
    }).eq('id', logId)
  }

  return { config_id: config.id, topic, model_used: modelId, items_scraped: scrapedItems.length, errors: errors.slice(0, 5), status: errors.length && !scrapedItems.length ? 'error' : 'completed', total_time: totalTime, cycle: currentCycle }
}

export const handler: any = async (event: any) => {
  const path = event.path.replace(/^\/?api\/?/, '').replace(/^\/+/, '')
  const method = event.httpMethod
  const segments = path.split('/').filter(Boolean)

  try {
    if (path === 'models' || path.startsWith('models?')) {
      const params = new URLSearchParams(event.rawQuery)
      const category = params.get('category')
      const models = category ? MODEL_REGISTRY.filter((m: any) => m.category === category) : MODEL_REGISTRY
      return json(200, { data: models, total: models.length })
    }

    if (path === 'plan' && method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      if (!body.topic) return json(400, { error: 'Topic is required' })
      const plan = await generatePlan(body.topic, body.sources || [], body.model || 'meta/llama-3.3-70b-instruct')
      return json(200, { data: plan })
    }

    if (path === 'configurations' || path === '') {
      if (method === 'GET') {
        const { data } = await supabase.from('configurations').select('*').order('created_at', { ascending: false })
        return json(200, { data: data || [] })
      }
      if (method === 'POST') {
        const body = JSON.parse(event.body || '{}')
        const { data, error } = await supabase.from('configurations').insert({
          user_id: body.user_id || null, topic: body.topic, sources: body.sources || [],
          model: body.model || 'meta/llama-3.3-70b-instruct',
          schedule: body.schedule || { work_min: 3, sleep_min: 3 }, status: body.status || 'active'
        }).select().single()
        if (error) return json(400, { error: error.message })
        return json(201, { data })
      }
    }

    if (segments[0] === 'configurations' && segments[1]) {
      const configId = segments[1]
      if (method === 'GET') {
        const { data, error } = await supabase.from('configurations').select('*').eq('id', configId).single()
        if (error || !data) return json(404, { error: 'Not found' })
        return json(200, { data })
      }
      if (method === 'PATCH') {
        const body = JSON.parse(event.body || '{}')
        const { data, error } = await supabase.from('configurations').update(body).eq('id', configId).select().single()
        if (error) return json(400, { error: error.message })
        return json(200, { data })
      }
      if (method === 'DELETE') {
        await supabase.from('configurations').delete().eq('id', configId)
        return json(200, { message: 'Deleted' })
      }
    }

    if (path === 'scraped-data' || path.startsWith('scraped-data?')) {
      const params = new URLSearchParams(event.rawQuery)
      const configId = params.get('config_id')
      const limit = Math.min(Number(params.get('limit')) || 50, 200)
      let query = supabase.from('scraped_data').select('*').order('scraped_at', { ascending: false }).limit(limit)
      if (configId) query = query.eq('config_id', configId)
      const { data } = await query
      return json(200, { data: data || [] })
    }

    if (path === 'task-logs' || path.startsWith('task-logs?')) {
      const params = new URLSearchParams(event.rawQuery)
      const configId = params.get('config_id')
      const limit = Math.min(Number(params.get('limit')) || 20, 100)
      let query = supabase.from('task_logs').select('*').order('started_at', { ascending: false }).limit(limit)
      if (configId) query = query.eq('config_id', configId)
      const { data } = await query
      return json(200, { data: data || [] })
    }

    if (segments[0] === 'task-logs' && segments[1]) {
      const { data } = await supabase.from('task_logs').select('*').eq('id', segments[1]).single()
      return json(200, { data: data || null })
    }

    if (path === 'system/status') {
      const { count: configCount } = await supabase.from('configurations').select('*', { count: 'exact', head: true })
      const { count: activeCount } = await supabase.from('configurations').select('*', { count: 'exact', head: true }).eq('status', 'active')
      const { count: scrapedCount } = await supabase.from('scraped_data').select('*', { count: 'exact', head: true })
      const { data: lastLogs } = await supabase.from('task_logs').select('*').order('started_at', { ascending: false }).limit(5)
      const { count: logCount } = await supabase.from('task_logs').select('*', { count: 'exact', head: true })
      const lastRun = lastLogs?.[0]?.started_at || null
      return json(200, { data: { configs: configCount || 0, active_configs: activeCount || 0, total_scraped: scrapedCount || 0, total_logs: logCount || 0, last_run: lastRun, recent_logs: lastLogs || [] } })
    }

    if (path === 'scrape' && method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      if (body.configId) {
        const { data: config } = await supabase.from('configurations').select('*').eq('id', body.configId).single()
        if (!config) return json(404, { error: 'Config not found' })
        const result = await runScrapeCycle(config)
        return json(200, { data: result })
      }
      if (body.topic) {
        const plan = await generatePlan(body.topic, body.sources || [], body.modelId || 'meta/llama-3.3-70b-instruct')
        const targetSites = plan.target_sites || []
        const results: any[] = []
        const errors: string[] = []

        for (const site of targetSites.slice(0, 5)) {
          try {
            const result = await scrapeUrl(site.url, site.selectors)
            if (result.error) { errors.push(result.error); continue }
            let summary: any = { text: '', _responseTime: 0 }
            if (result.content) { try { summary = await summarize(result.title, result.content, body.modelId || 'meta/llama-3.3-70b-instruct') } catch {} }
            results.push({ ...result, ai_summary: summary.text })
          } catch (err: any) { errors.push(err.message) }
        }
        return json(200, { data: { results, errors: errors.slice(0, 3), status: errors.length && !results.length ? 'error' : 'completed' } })
      }
      return json(400, { error: 'configId or topic required' })
    }

    if (path === 'schedule' && method === 'POST') {
      const auth = event.headers.authorization || ''
      if (auth !== `Bearer ${cronSecret}`) return json(401, { error: 'Unauthorized' })
      const { data: configs } = await supabase.from('configurations').select('*').eq('status', 'active')
      if (!configs?.length) return json(200, { data: { message: 'No active configs', processed: 0 } })

      const results = []
      for (const config of configs) {
        try { results.push(await runScrapeCycle(config)) }
        catch (err: any) { results.push({ config_id: config.id, error: err.message, status: 'error' }) }
      }
      return json(200, { data: { processed: results.length, results } })
    }

    if (path === 'chat' && method === 'POST') {
      const body = JSON.parse(event.body || '{}')
      const { model, message, history } = body
      if (!message) return json(400, { error: 'message is required' })

      const modelId = model || 'meta/llama-3.3-70b-instruct'
      const messages = [
        { role: 'system', content: 'You are a helpful AI assistant. Answer clearly and concisely. Reply in the same language the user writes in.' },
        ...(history || []),
        { role: 'user', content: message }
      ]

      const elapsed = timer()
      const data = await nvidiaChat(messages, modelId, { max_tokens: 2048 })
      const responseTime = elapsed()
      const reply = data.choices?.[0]?.message?.content || 'No response'

      return json(200, {
        data: {
          reply,
          model: modelId,
          response_time_ms: responseTime,
          usage: data.usage
        }
      })
    }

    return json(404, { error: `Route not found: ${path}` })
  } catch (err: any) {
    return json(500, { error: err.message || 'Internal error' })
  }
}
