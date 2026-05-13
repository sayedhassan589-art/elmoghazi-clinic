import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}

    if (category) where.category = category
    if (active !== null && active !== '') where.active = active === 'true'

    const services = await db.service.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ services })
  } catch (error) {
    console.error('Get services error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'Service name is required' }, { status: 400 })
    }

    const service = await db.service.create({
      data: {
        name: body.name,
        category: body.category || null,
        price: body.price || 0,
        duration: body.duration || null,
        active: body.active ?? true,
      },
    })

    return NextResponse.json({ service }, { status: 201 })
  } catch (error) {
    console.error('Create service error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
