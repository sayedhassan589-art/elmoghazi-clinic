import { db } from '@/lib/db'
import { toCairoDate } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await request.json()

    const existing = await db.followUpVisit.findUnique({ where: { id } })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const data: Record<string, unknown> = {}
    if (body.findings !== undefined) data.findings = body.findings || null
    if (body.vitals !== undefined) data.vitals = body.vitals || null
    if (body.diagnosis !== undefined) data.diagnosis = body.diagnosis || null
    if (body.treatmentNotes !== undefined) data.treatmentNotes = body.treatmentNotes || null
    if (body.medications !== undefined) data.medications = body.medications || null
    if (body.instructions !== undefined) data.instructions = body.instructions || null
    if (body.paid !== undefined) data.paid = body.paid
    if (body.price !== undefined) data.price = body.price
    if (body.nextVisitDate !== undefined) data.nextVisitDate = body.nextVisitDate ? toCairoDate(body.nextVisitDate) : null
    if (body.status !== undefined) data.status = body.status
    if (body.notes !== undefined) data.notes = body.notes || null

    const visit = await db.followUpVisit.update({
      where: { id },
      data: data as any,
      include: {
        followUp: {
          include: {
            patient: { select: { id: true, name: true, fileNumber: true } },
          },
        },
      },
    })

    return NextResponse.json({ visit })
  } catch (error) {
    console.error('Update follow-up visit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const existing = await db.followUpVisit.findUnique({
      where: { id },
      include: { followUp: { include: { patient: { select: { name: true } } } } },
    })
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Delete related financial transaction
    const patientName = existing.followUp?.patient?.name || 'مريض'
    try {
      await db.transaction.deleteMany({
        where: {
          category: 'متابعة',
          description: { contains: `زيارة متابعة #${existing.visitNumber}` },
          description: { contains: patientName },
        },
      })
    } catch (e) { console.error('Failed to delete related transaction:', e) }

    // Decrement sessionsUsed on the follow-up record
    await db.followUpRecord.update({
      where: { id: existing.followUpId },
      data: { sessionsUsed: { decrement: 1 } },
    })

    await db.followUpVisit.delete({ where: { id } })
    return NextResponse.json({ message: 'Visit deleted successfully' })
  } catch (error) {
    console.error('Delete follow-up visit error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
