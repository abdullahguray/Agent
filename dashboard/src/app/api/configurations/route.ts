import { NextResponse } from 'next/server'
import { createServerSupabase } from '@/lib/supabase'

export async function GET() {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('configurations')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ data: data || [] })
}

export async function POST(request: Request) {
  try {
    const supabase = createServerSupabase()
    const body = await request.json()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const config = {
      user_id: user.id,
      topic: body.topic,
      sources: body.sources || [],
      model: body.model || 'meta/llama-3.3-70b-instruct',
      schedule: body.schedule || { work_min: 3, sleep_min: 3 },
      status: body.status || 'active'
    }

    const { data, error } = await supabase
      .from('configurations')
      .insert(config)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to create configuration' }, { status: 500 })
  }
}
