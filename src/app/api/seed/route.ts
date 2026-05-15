import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    // Only ensure default users exist - NO demo/seed data
    const existingDoctor = await db.user.findFirst({ where: { role: 'doctor' } })
    if (!existingDoctor) {
      await db.user.create({
        data: {
          name: 'Dr. Elmoghazi',
          email: 'doctor@elmoghazi.com',
          password: '1300',
          role: 'doctor',
          active: true,
        },
      })
    }

    const existingSecretary = await db.user.findFirst({ where: { role: 'secretary' } })
    if (!existingSecretary) {
      await db.user.create({
        data: {
          name: 'Secretary',
          email: 'secretary@elmoghazi.com',
          password: '1300',
          role: 'secretary',
          active: true,
        },
      })
    }

    return NextResponse.json({
      message: 'Database initialized - no demo data created',
      initialized: true,
    }, { status: 200 })
  } catch (error) {
    console.error('Init error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}

// DELETE method to clear all demo/seed data
export async function DELETE(request: Request) {
  try {
    // Clean all data in reverse dependency order
    await db.treatmentPlanSession.deleteMany()
    await db.treatmentPhase.deleteMany()
    await db.treatmentPlan.deleteMany()
    await db.prescriptionItem.deleteMany()
    await db.prescription.deleteMany()
    await db.notification.deleteMany()
    await db.auditLog.deleteMany()
    await db.inventoryTransaction.deleteMany()
    await db.inventoryItem.deleteMany()
    await db.waitingQueue.deleteMany()
    await db.appointment.deleteMany()
    await db.transaction.deleteMany()
    await db.laserNote.deleteMany()
    await db.laserSession.deleteMany()
    await db.laserRecord.deleteMany()
    await db.laserSetting.deleteMany()
    await db.laserPackage.deleteMany()
    await db.patientPhoto.deleteMany()
    await db.medication.deleteMany()
    await db.reminder.deleteMany()
    await db.alert.deleteMany()
    await db.note.deleteMany()
    await db.session.deleteMany()
    await db.visit.deleteMany()
    await db.service.deleteMany()
    await db.patient.deleteMany()
    // Keep users - recreate defaults
    await db.user.deleteMany()
    await db.user.create({ data: { name: 'Dr. Elmoghazi', email: 'doctor@elmoghazi.com', password: '1300', role: 'doctor', active: true } })
    await db.user.create({ data: { name: 'Secretary', email: 'secretary@elmoghazi.com', password: '1300', role: 'secretary', active: true } })

    return NextResponse.json({
      message: 'All data cleared successfully',
      cleared: true,
    }, { status: 200 })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 })
  }
}
