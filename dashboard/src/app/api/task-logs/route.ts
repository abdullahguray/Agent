import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const configId = searchParams.get('config_id')
  const limit = Math.min(Number(searchParams.get('limit')) || 20, 100)

  const supabase = createServerSupabase()
  let query = supabase
    .from('task_logs')
    .select('*')
    .order('started_at', { ascending: false })
    .limit(limit)

  if (configId) {
    query = query.eq('config_id', configId)
  }

  const { data, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}
