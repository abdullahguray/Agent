import { getModelParams } from './models'

const NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1'
const NVIDIA_API_KEY = process.env.NVIDIA_API_KEY || ''

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface CompletionParams {
  messages: ChatMessage[]
  model: string
  temperature?: number
  max_tokens?: number
  top_p?: number
  [key: string]: any
}

export async function nvidiaChatCompletion(params: CompletionParams): Promise<any> {
  const response = await fetch(`${NVIDIA_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${NVIDIA_API_KEY}`
    },
    body: JSON.stringify(params)
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`NVIDIA API error ${response.status}: ${text}`)
  }

  return response.json()
}

export async function generateScrapePlan(
  topic: string,
  sources: string[] = [],
  modelId?: string
): Promise<any> {
  const effectiveModelId = modelId || 'meta/llama-3.3-70b-instruct'
  const params = getModelParams(effectiveModelId)

  const userMsg = `Topic: ${topic}\n${sources.length > 0 ? `Sources: ${JSON.stringify(sources)}` : ''}`

  const completion = await nvidiaChatCompletion({
    model: effectiveModelId,
    messages: [
      {
        role: 'system',
        content: `You are a web scraping planning AI. Given a topic and optional sources, design a scraping plan.

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
      },
      { role: 'user', content: userMsg }
    ],
    temperature: 0.3,
    max_tokens: 1000,
    ...params
  })

  const content = completion.choices?.[0]?.message?.content || ''
  const cleanJson = content.replace(/^```(?:json)?\s*/, '').replace(/\s*```$/, '')

  try {
    const result = JSON.parse(cleanJson)
    result._model_used = effectiveModelId
    return result
  } catch {
    return {
      topic_analysis: topic,
      target_sites: sources.map(s => ({ url: s, purpose: topic, selectors: {} })),
      extraction_fields: ['title', 'content'],
      max_items: 5,
      error: 'Failed to parse AI response',
      _model_used: effectiveModelId
    }
  }
}

export async function summarizeContent(title: string, content: string, modelId?: string): Promise<string> {
  const effectiveModelId = modelId || 'meta/llama-3.3-70b-instruct'
  const params = getModelParams(effectiveModelId)

  const completion = await nvidiaChatCompletion({
    model: effectiveModelId,
    messages: [
      {
        role: 'system',
        content: 'Summarize the following scraped content in 2-3 sentences. Focus on key facts and data points.'
      },
      { role: 'user', content: `Title: ${title}\n\nContent: ${content.slice(0, 2000)}` }
    ],
    temperature: 0.2,
    max_tokens: 300,
    ...params
  })

  return completion.choices?.[0]?.message?.content?.trim() || ''
}
