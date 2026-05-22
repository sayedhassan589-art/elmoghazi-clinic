import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId') || ''
    const type = searchParams.get('type') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (itemId) where.itemId = itemId
    if (type) where.type = type

    const [transactions, total] = await Promise.all([
      db.inventoryTransaction.findMany({
        where,
        skip,
        take: limit,
        orderBy: { date: 'desc' },
        include: {
          item: true,
        },
      }),
      db.inventoryTransaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get inventory transactions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.itemId || !body.type || !body.quantity) {
      return NextResponse.json({ error: 'itemId, type, and quantity are required' }, { status: 400 })
    }

    if (!['in', 'out'].includes(body.type)) {
      return NextResponse.json({ error: 'type must be "in" or "out"' }, { status: 400 })
    }

    const item = await db.inventoryItem.findUnique({ where: { id: body.itemId } })
    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const transaction = await db.inventoryTransaction.create({
      data: {
        itemId: body.itemId,
        type: body.type,
        quantity: body.quantity,
        notes: body.notes || null,
        date: body.date ? new Date(body.date) : new Date(),
      },
      include: { item: true },
    })

    // Update item quantity
    const quantityChange = body.type === 'in' ? body.quantity : -body.quantity
    await db.inventoryItem.update({
      where: { id: body.itemId },
      data: { quantity: { increment: quantityChange } },
    })

    return NextResponse.json({ transaction }, { status: 201 })
  } catch (error) {
    console.error('Create inventory transaction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
