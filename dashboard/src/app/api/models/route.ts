import { NextResponse } from 'next/server'
import { MODEL_REGISTRY } from '@/lib/models'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')

  let models = MODEL_REGISTRY
  if (category) {
    models = models.filter(m => m.category === category)
  }

  return NextResponse.json({ data: models, total: models.length })
}
