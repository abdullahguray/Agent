import { NextResponse } from 'next/server'
import { generateScrapePlan } from '@/lib/nvidia'

export async function POST(request: Request) {
  try {
    const { topic, sources, model } = await request.json()
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 })
    }

    const plan = await generateScrapePlan(topic, sources || [], model)
    return NextResponse.json({ data: plan })
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Planning failed' }, { status: 500 })
  }
}
