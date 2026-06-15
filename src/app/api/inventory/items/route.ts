import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const search = searchParams.get('search') || ''
    const lowStock = searchParams.get('lowStock')

    const where: Record<string, unknown> = {}

    if (category) where.category = category
    if (search) where.name = { contains: search }
    if (lowStock === 'true') where.quantity = { lte: 5 }

    const items = await db.inventoryItem.findMany({
      where,
      orderBy: { name: 'asc' },
      include: {
        _count: { select: { transactions: true } },
      },
    })

    return NextResponse.json({ items })
  } catch (error) {
    console.error('Get inventory items error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.name) {
      return NextResponse.json({ error: 'Item name is required' }, { status: 400 })
    }

    const item = await db.inventoryItem.create({
      data: {
        name: body.name,
        category: body.category || null,
        quantity: body.quantity || 0,
        minQuantity: body.minQuantity || 5,
        unitPrice: body.unitPrice || 0,
        notes: body.notes || null,
      },
    })

    return NextResponse.json({ item }, { status: 201 })
  } catch (error) {
    console.error('Create inventory item error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
