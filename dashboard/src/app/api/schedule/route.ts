import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'
import { generateScrapePlan, summarizeContent } from '@/lib/nvidia'
import { scrapeUrl } from '@/lib/scraper'

export const maxDuration = 300

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const expectedToken = process.env.CRON_SECRET || 'scrape-agent-cron-2026'
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabase()
    const { data: configs, error } = await supabase
      .from('configurations')
      .select('*')
      .eq('status', 'active')

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!configs?.length) {
      return NextResponse.json({ data: { message: 'No active configurations', processed: 0 } })
    }

    const results = []
    for (const config of configs) {
      try {
        const modelId = config.model || 'meta/llama-3.3-70b-instruct'
        const currentCycle = (config._current_cycle || 0) + 1

        const logEntry = {
          config_id: config.id,
          cycle_number: currentCycle,
          status: 'scraping',
          started_at: new Date().toISOString()
        }

        const { data: logData } = await supabase
          .from('task_logs')
          .insert(logEntry)
          .select()
          .single()

        const logId = logData?.id

        const plan = config.topic
          ? await generateScrapePlan(config.topic, config.sources || [], modelId)
          : { target_sites: (config.sources || []).map((s: string) => ({ url: s, purpose: '', selectors: {} })), max_items: 5 }

        const targetSites = plan.target_sites || []
        const limit = Math.min(targetSites.length, 10)
        const itemsScraped: any[] = []
        const errors: string[] = []

        for (const site of targetSites.slice(0, limit)) {
          try {
            const result = await scrapeUrl(site.url, site.selectors)
            if (result.error) {
              errors.push(result.error)
              continue
            }

            let aiSummary = ''
            if (result.content) {
              try { aiSummary = await summarizeContent(result.title, result.content, modelId) } catch {}
            }

            const { data: inserted } = await supabase
              .from('scraped_data')
              .insert({
                config_id: config.id,
                title: result.title || '',
                content: result.content || '',
                source_url: result.url,
                raw_json: result,
                ai_summary: aiSummary,
                model_used: modelId
              })
              .select()
              .single()

            if (inserted) itemsScraped.push(inserted)
          } catch (err: any) {
            errors.push(`${site.url}: ${err.message}`)
          }
        }

        if (logId) {
          await supabase
            .from('task_logs')
            .update({
              status: errors.length && !itemsScraped.length ? 'error' : 'completed',
              ended_at: new Date().toISOString(),
              items_scraped: itemsScraped.length,
              error: errors.slice(0, 3).join('; ') || null
            })
            .eq('id', logId)
        }

        results.push({
          config_id: config.id,
          topic: config.topic,
          items_scraped: itemsScraped.length,
          errors: errors.length,
          status: errors.length && !itemsScraped.length ? 'error' : 'completed'
        })
      } catch (err: any) {
        results.push({ config_id: config.id, error: err.message, status: 'error' })
      }
    }

    return NextResponse.json({
      data: {
        processed: results.length,
        results
      }
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Schedule cycle failed' }, { status: 500 })
  }
}
