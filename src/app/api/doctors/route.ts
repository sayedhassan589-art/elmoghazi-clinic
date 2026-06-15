import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '500')

    const doctors = await db.partnerDoctor.findMany({
      where: { active: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    })

    return NextResponse.json({ doctors })
  } catch (error) {
    console.error('Get doctors error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const doctor = await db.partnerDoctor.create({
      data: {
        name: body.name,
        phone: body.phone || null,
        specialty: body.specialty || null,
        checkupPercentage: body.checkupPercentage || 0,
        revisitPercentage: body.revisitPercentage || 0,
        laserPercentage: body.laserPercentage || 0,
        sessionPercentage: body.sessionPercentage || 0,
        fixedAmount: body.fixedAmount || 0,
        active: true,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ doctor }, { status: 201 })
  } catch (error) {
    console.error('Create doctor error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
