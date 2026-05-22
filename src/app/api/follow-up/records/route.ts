import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const patientId = searchParams.get('patientId') || ''
    const status = searchParams.get('status') || ''
    const search = searchParams.get('search') || ''

    const where: Record<string, unknown> = {}
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (search) {
      where.OR = [
        { condition: { contains: search, mode: 'insensitive' } },
        { diagnosis: { contains: search, mode: 'insensitive' } },
        { patient: { name: { contains: search, mode: 'insensitive' } } },
        { patient: { phone: { contains: search } } },
        { patient: { fileNumber: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const records = await db.followUpRecord.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true, age: true, gender: true } },
        followUpVisits: { orderBy: { visitNumber: 'desc' } },
      },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Get follow-up records error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.patientId || !body.condition) {
      return NextResponse.json({ error: 'patientId and condition are required' }, { status: 400 })
    }

    const data: Record<string, unknown> = {
      patientId: body.patientId,
      condition: body.condition,
      conditionCategory: body.conditionCategory || null,
      severity: body.severity || 'moderate',
      status: body.status || 'active',
      frequency: body.frequency || 'monthly',
      customDays: body.customDays || null,
      nextVisitDate: body.nextVisitDate ? new Date(body.nextVisitDate) : null,
      lastVisitDate: body.lastVisitDate ? new Date(body.lastVisitDate) : null,
      hasSubscription: body.hasSubscription || false,
      subscriptionType: body.subscriptionType || null,
      subscriptionPrice: body.subscriptionPrice || 0,
      subscriptionStart: body.subscriptionStart ? new Date(body.subscriptionStart) : null,
      subscriptionEnd: body.subscriptionEnd ? new Date(body.subscriptionEnd) : null,
      sessionsIncluded: body.sessionsIncluded || 0,
      sessionsUsed: 0,
      diagnosis: body.diagnosis || null,
      treatmentPlan: body.treatmentPlan || null,
      medications: body.medications || null,
      notes: body.notes || null,
      reminderEnabled: body.reminderEnabled !== false,
      reminderDaysBefore: body.reminderDaysBefore || 1,
    }

    const record = await db.followUpRecord.create({
      data: data as any,
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
        followUpVisits: true,
      },
    })

    // If subscription has a price, create a financial transaction
    if (body.hasSubscription && body.subscriptionPrice > 0) {
      try {
        const patientName = record.patient?.name || 'مريض'
        await db.transaction.create({
          data: {
            type: 'income',
            category: 'متابعة',
            amount: body.subscriptionPrice,
            description: `باقة متابعة - ${patientName} - ${body.condition}`,
            date: new Date(),
          },
        })
      } catch (e) { console.error('Failed to create subscription transaction:', e) }
    }

    return NextResponse.json({ record }, { status: 201 })
  } catch (error) {
    console.error('Create follow-up record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
