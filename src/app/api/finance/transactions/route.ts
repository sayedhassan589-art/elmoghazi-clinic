import { db } from '@/lib/db'
import { cairoDayRange, toCairoDate } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || ''
    const category = searchParams.get('category') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (category) where.category = category
    if (startDate || endDate) {
      if (startDate && endDate && startDate === endDate) {
        // Same day — use Cairo day range for accurate filtering
        where.date = cairoDayRange(startDate)
      } else {
        const dateFilter: Record<string, Date> = {}
        if (startDate) dateFilter.gte = cairoDayRange(startDate).gte
        if (endDate) dateFilter.lte = cairoDayRange(endDate).lt
        where.date = dateFilter
      }
    }

    const [transactions, total] = await Promise.all([
      db.transaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
      }),
      db.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.amount) {
      return NextResponse.json({ error: 'amount is required' }, { status: 400 })
    }

    const transaction = await db.transaction.create({
      data: {
        type: body.type || 'income',
        category: body.category || 'clinic',
        amount: body.amount,
        description: body.description || null,
        date: body.date ? toCairoDate(body.date) : toCairoDate(),
      },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
