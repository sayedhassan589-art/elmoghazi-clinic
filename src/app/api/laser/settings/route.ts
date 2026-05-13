import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const machineName = searchParams.get('machineName') || ''
    const bodyArea = searchParams.get('bodyArea') || ''

    const where: Record<string, unknown> = {}

    if (machineName) where.machineName = { contains: machineName }
    if (bodyArea) where.bodyArea = bodyArea

    const settings = await db.laserSetting.findMany({
      where,
      orderBy: [{ machineName: 'asc' }, { bodyArea: 'asc' }],
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get laser settings error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.machineName || !body.bodyArea) {
      return NextResponse.json({ error: 'machineName and bodyArea are required' }, { status: 400 })
    }

    const setting = await db.laserSetting.create({
      data: {
        machineName: body.machineName,
        bodyArea: body.bodyArea,
        skinType: body.skinType || null,
        defaultEnergy: body.defaultEnergy || null,
        defaultPulse: body.defaultPulse || null,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ setting }, { status: 201 })
  } catch (error) {
    console.error('Create laser setting error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
