import { db } from '@/lib/db'
import { cairoDayRange } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || ''
    const action = searchParams.get('action') || ''
    const entity = searchParams.get('entity') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10000')
    const skip = (page - 1) * limit

    const where: Record<string, unknown> = {}

    if (userId) where.userId = userId
    if (action) where.action = { contains: action }
    if (entity) where.entity = entity
    if (startDate && endDate && startDate === endDate) {
      where.createdAt = cairoDayRange(startDate)
    } else if (startDate || endDate) {
      const dateFilter: Record<string, Date> = {}
      if (startDate) dateFilter.gte = cairoDayRange(startDate).gte
      if (endDate) dateFilter.lt = cairoDayRange(endDate).lt
      where.createdAt = dateFilter
    }

    const [logs, total] = await Promise.all([
      db.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
        },
      }),
      db.auditLog.count({ where }),
    ])

    return NextResponse.json({
      logs,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get audit logs error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
