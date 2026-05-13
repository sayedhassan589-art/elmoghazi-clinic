import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''
    const type = searchParams.get('type') || ''
    const read = searchParams.get('read')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (type) where.type = type
    if (read !== null && read !== '') where.read = read === 'true'

    const [notifications, total] = await Promise.all([
      db.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      db.notification.count({ where }),
    ])

    const unreadCount = await db.notification.count({
      where: { ...where, read: false },
    })

    return NextResponse.json({
      notifications,
      unreadCount,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get notifications error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.message) {
      return NextResponse.json({ error: 'title and message are required' }, { status: 400 })
    }

    const notification = await db.notification.create({
      data: {
        userId: body.userId || null,
        title: body.title,
        message: body.message,
        type: body.type || 'info',
        read: false,
        link: body.link || null,
      },
    })

    return NextResponse.json({ notification }, { status: 201 })
  } catch (error) {
    console.error('Create notification error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
