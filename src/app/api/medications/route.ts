import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const active = searchParams.get('active')

    const where: Record<string, unknown> = {}

    if (category) where.category = category
    if (search) where.name = { contains: search }
    if (active !== null && active !== '') where.active = active === 'true'

    const medications = await db.medication.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return NextResponse.json({ medications })
  } catch (error) {
    console.error('Get medications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'Medication name is required' }, { status: 400 })
    }

    const medication = await db.medication.create({
      data: {
        name: body.name,
        category: body.category || null,
        description: body.description || null,
        dosage: body.dosage || null,
        instructions: body.instructions || null,
        sideEffects: body.sideEffects || null,
        active: body.active ?? true,
      },
    })

    return NextResponse.json({ medication }, { status: 201 })
  } catch (error) {
    console.error('Create medication error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
