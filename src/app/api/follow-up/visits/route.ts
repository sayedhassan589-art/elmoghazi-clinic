import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const followUpId = searchParams.get('followUpId') || ''

    const where: Record<string, unknown> = {}
    if (followUpId) where.followUpId = followUpId

    const visits = await db.followUpVisit.findMany({
      where,
      orderBy: { visitDate: 'desc' },
      include: {
        followUp: {
          include: {
            patient: { select: { id: true, name: true, fileNumber: true } },
          },
        },
      },
    })

    return NextResponse.json({ visits })
  } catch (error) {
    console.error('Get follow-up visits error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.followUpId) {
      return NextResponse.json({ error: 'followUpId is required' }, { status: 400 })
    }

    const record = await db.followUpRecord.findUnique({ where: { id: body.followUpId } })
    if (!record) return NextResponse.json({ error: 'Follow-up record not found' }, { status: 404 })

    // Auto-calculate visit number
    const lastVisit = await db.followUpVisit.findFirst({
      where: { followUpId: body.followUpId },
      orderBy: { visitNumber: 'desc' },
      select: { visitNumber: true },
    })
    const visitNumber = lastVisit ? lastVisit.visitNumber + 1 : 1

    const visitData: Record<string, unknown> = {
      followUpId: body.followUpId,
      visitNumber,
      visitDate: body.visitDate ? new Date(body.visitDate) : new Date(),
      type: body.type || 'followup',
      findings: body.findings || null,
      vitals: body.vitals || null,
      diagnosis: body.diagnosis || null,
      treatmentNotes: body.treatmentNotes || null,
      medications: body.medications || null,
      instructions: body.instructions || null,
      paid: body.paid || false,
      price: body.price || 0,
      nextVisitDate: body.nextVisitDate ? new Date(body.nextVisitDate) : null,
      status: body.status || 'completed',
      notes: body.notes || null,
    }

    const visit = await db.followUpVisit.create({
      data: visitData as any,
      include: {
        followUp: {
          include: {
            patient: { select: { id: true, name: true, fileNumber: true } },
          },
        },
      },
    })

    // Update follow-up record: lastVisitDate, nextVisitDate, sessionsUsed
    const updateData: Record<string, unknown> = {
      lastVisitDate: new Date(),
      sessionsUsed: record.sessionsUsed + 1,
    }
    if (body.nextVisitDate) updateData.nextVisitDate = new Date(body.nextVisitDate)

    await db.followUpRecord.update({
      where: { id: body.followUpId },
      data: updateData,
    })

    // If visit is paid and has price, create financial transaction
    if (body.paid && body.price > 0) {
      // Check if subscription covers this - if so, don't create individual transaction
      if (!record.hasSubscription) {
        const patientName = visit.followUp?.patient?.name || 'مريض'
        try {
          await db.transaction.create({
            data: {
              type: 'income',
              category: 'متابعة',
              amount: body.price,
              description: `زيارة متابعة #${visitNumber} - ${patientName} - ${record.condition}`,
              date: body.visitDate ? new Date(body.visitDate) : new Date(),
            },
          })
        } catch (e) { console.error('Failed to create visit transaction:', e) }
      }
    }

    return NextResponse.json({ visit }, { status: 201 })
  } catch (error) {
    console.error('Create follow-up visit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
