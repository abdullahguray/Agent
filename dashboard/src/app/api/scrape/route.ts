import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { generateScrapePlan, summarizeContent } from '@/lib/nvidia'
import { scrapeUrl } from '@/lib/scraper'

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const { configId, topic, sources, modelId } = await request.json()

    const supabase = createServerSupabase()
    const effectiveModelId = modelId || 'meta/llama-3.3-70b-instruct'

    let config: any = {}
    if (configId) {
      const { data } = await supabase
        .from('configurations')
        .select('*')
        .eq('id', configId)
        .single()
      if (data) config = data
    }

    const scrapeTopic = topic || config.topic
    const scrapeSources = sources || config.sources || []
    const useModelId = modelId || config.model || 'meta/llama-3.3-70b-instruct'

    if (!scrapeTopic && !scrapeSources.length && !configId) {
      return NextResponse.json({ error: 'Topic or configId required' }, { status: 400 })
    }

    const logEntry: Record<string, any> | null = configId ? {
      config_id: configId,
      cycle_number: 0,
      status: 'scraping',
      started_at: new Date().toISOString()
    } : null

    if (logEntry) {
      const { data: logData } = await supabase
        .from('task_logs')
        .insert(logEntry)
        .select()
        .single()
      if (logData) logEntry.id = logData.id
    }

    const plan = scrapeTopic
      ? await generateScrapePlan(scrapeTopic, scrapeSources, useModelId)
      : { target_sites: scrapeSources.map((s: string) => ({ url: s, purpose: '', selectors: {} })), extraction_fields: ['title', 'content'], max_items: 5 }

    const targetSites = plan.target_sites || []
    const limit = Math.min(targetSites.length, 10)
    const itemsScraped: any[] = []
    const errors: string[] = []

    for (let i = 0; i < limit; i++) {
      const site = targetSites[i]
      try {
        const result = await scrapeUrl(site.url, site.selectors)
        if (result.error) {
          errors.push(result.error)
          continue
        }

        let aiSummary = ''
        if (result.content) {
          try {
            aiSummary = await summarizeContent(result.title, result.content, useModelId)
          } catch {}
        }

        const scrapedRecord = {
          config_id: logEntry?.config_id || null,
          title: result.title || '',
          content: result.content || '',
          source_url: result.url,
          raw_json: result,
          ai_summary: aiSummary,
          model_used: useModelId
        }

        const { data: inserted } = await supabase
          .from('scraped_data')
          .insert(scrapedRecord)
          .select()
          .single()

        if (inserted) itemsScraped.push(inserted)
      } catch (err: any) {
        errors.push(`${site.url}: ${err.message}`)
      }
    }

    if (logEntry?.id) {
      await supabase
        .from('task_logs')
        .update({
          status: errors.length && !itemsScraped.length ? 'error' : 'completed',
          ended_at: new Date().toISOString(),
          items_scraped: itemsScraped.length,
          error: errors.slice(0, 3).join('; ') || null
        })
        .eq('id', logEntry.id)
    }

    return NextResponse.json({
      data: {
        config_id: configId || null,
        topic: scrapeTopic,
        model_used: useModelId,
        items_scraped: itemsScraped.length,
        errors: errors.slice(0, 5),
        status: errors.length && !itemsScraped.length ? 'error' : 'completed'
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Scrape failed' }, { status: 500 })
  }
}
