import * as cheerio from 'cheerio'

interface ScrapeResult {
  url: string
  title: string
  content: string
  raw_html: string
  error?: string
  ai_summary?: string
}

export async function scrapeUrl(url: string, selectors?: Record<string, string>): Promise<ScrapeResult> {
  const result: ScrapeResult = { url, title: '', content: '', raw_html: '' }

  try {
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 30000)

    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ScrapeAgentAI/1.0)' }
    })
    clearTimeout(timeout)

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const html = await response.text()
    result.raw_html = html

    const $ = cheerio.load(html)
    result.title = $('title').text().trim()

    if (selectors?.content) {
      const el = $(selectors.content)
      if (el.length > 0) {
        result.content = el.text().trim()
      }
    }

    if (!result.content) {
      const text = $('body').text()
      const lines = text.split('\n').map(l => l.trim()).filter(Boolean)
      result.content = lines.slice(0, 100).join('\n')
    }

  } catch (err: any) {
    result.error = err.message || String(err)
  }

  return result
}
