import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}
    if (active !== null && active !== '') where.active = active === 'true'

    const packages = await db.laserPackage.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ packages })
  } catch (error) {
    console.error('Get laser packages error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name || !body.sessionsCount || !body.price) {
      return NextResponse.json({ error: 'name, sessionsCount, and price are required' }, { status: 400 })
    }

    const laserPackage = await db.laserPackage.create({
      data: {
        name: body.name,
        sessionsCount: body.sessionsCount,
        price: body.price,
        bodyArea: body.bodyArea || null,
        active: body.active ?? true,
      },
    })

    return NextResponse.json({ package: laserPackage }, { status: 201 })
  } catch (error) {
    console.error('Create laser package error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
