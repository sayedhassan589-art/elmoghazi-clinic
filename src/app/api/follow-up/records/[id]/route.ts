import { db } from '@/lib/db'
import { toCairoDate } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const record = await db.followUpRecord.findUnique({
      where: { id },
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true, age: true, gender: true } },
        followUpVisits: { orderBy: { visitNumber: 'desc' } },
      },
    })
    if (!record) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json({ record })
  } catch (error) {
    console.error('Get follow-up record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.followUpRecord.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.condition !== undefined) data.condition = body.condition
    if (body.conditionCategory !== undefined) data.conditionCategory = body.conditionCategory || null
    if (body.severity !== undefined) data.severity = body.severity
    if (body.status !== undefined) data.status = body.status
    if (body.frequency !== undefined) data.frequency = body.frequency
    if (body.customDays !== undefined) data.customDays = body.customDays || null
    if (body.nextVisitDate !== undefined) data.nextVisitDate = body.nextVisitDate ? toCairoDate(body.nextVisitDate) : null
    if (body.lastVisitDate !== undefined) data.lastVisitDate = body.lastVisitDate ? toCairoDate(body.lastVisitDate) : null
    if (body.hasSubscription !== undefined) data.hasSubscription = body.hasSubscription
    if (body.subscriptionType !== undefined) data.subscriptionType = body.subscriptionType || null
    if (body.subscriptionPrice !== undefined) data.subscriptionPrice = body.subscriptionPrice
    if (body.subscriptionStart !== undefined) data.subscriptionStart = body.subscriptionStart ? toCairoDate(body.subscriptionStart) : null
    if (body.subscriptionEnd !== undefined) data.subscriptionEnd = body.subscriptionEnd ? toCairoDate(body.subscriptionEnd) : null
    if (body.sessionsIncluded !== undefined) data.sessionsIncluded = body.sessionsIncluded
    if (body.sessionsUsed !== undefined) data.sessionsUsed = body.sessionsUsed
    if (body.diagnosis !== undefined) data.diagnosis = body.diagnosis || null
    if (body.treatmentPlan !== undefined) data.treatmentPlan = body.treatmentPlan || null
    if (body.medications !== undefined) data.medications = body.medications || null
    if (body.notes !== undefined) data.notes = body.notes || null
    if (body.reminderEnabled !== undefined) data.reminderEnabled = body.reminderEnabled
    if (body.reminderDaysBefore !== undefined) data.reminderDaysBefore = body.reminderDaysBefore

    const record = await db.followUpRecord.update({
      where: { id },
      data: data as any,
      include: {
        patient: { select: { id: true, name: true, fileNumber: true, phone: true } },
        followUpVisits: { orderBy: { visitNumber: 'desc' } },
      },
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Update follow-up record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.followUpRecord.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete related financial transactions
    const patient = await db.patient.findUnique({ where: { id: existing.patientId }, select: { name: true } })
    if (patient) {
      try {
        await db.transaction.deleteMany({
          where: { category: 'متابعة', description: { contains: patient.name } },
        })
      } catch (e) { console.error('Failed to delete related transactions:', e) }
    }

    await db.followUpRecord.delete({ where: { id } })
    return NextResponse.json({ message: 'Follow-up record deleted successfully' })
  } catch (error) {
    console.error('Delete follow-up record error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
