import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Delete all data in reverse dependency order (children first, parents last).
    // Sequential execution is required to respect foreign key constraints.
    // Users table is intentionally excluded to keep accounts intact.

    const treatmentPlanSession = await db.treatmentPlanSession.deleteMany()
    const treatmentPhase = await db.treatmentPhase.deleteMany()
    const treatmentPlan = await db.treatmentPlan.deleteMany()
    const prescriptionItem = await db.prescriptionItem.deleteMany()
    const prescription = await db.prescription.deleteMany()
    const notification = await db.notification.deleteMany()
    const auditLog = await db.auditLog.deleteMany()
    const inventoryTransaction = await db.inventoryTransaction.deleteMany()
    const inventoryItem = await db.inventoryItem.deleteMany()
    const waitingQueue = await db.waitingQueue.deleteMany()
    const appointment = await db.appointment.deleteMany()
    const transaction = await db.transaction.deleteMany()
    const laserNote = await db.laserNote.deleteMany()
    const laserSession = await db.laserSession.deleteMany()
    const laserRecord = await db.laserRecord.deleteMany()
    const laserSetting = await db.laserSetting.deleteMany()
    const laserPackage = await db.laserPackage.deleteMany()
    const patientPhoto = await db.patientPhoto.deleteMany()
    const medication = await db.medication.deleteMany()
    const reminder = await db.reminder.deleteMany()
    const alert = await db.alert.deleteMany()
    const note = await db.note.deleteMany()
    const session = await db.session.deleteMany()
    const visit = await db.visit.deleteMany()
    const service = await db.service.deleteMany()
    const partnerDoctor = await db.partnerDoctor.deleteMany()
    const patient = await db.patient.deleteMany()

    return NextResponse.json({
      message: 'All data cleared successfully (users preserved)',
      deleted: {
        treatmentPlanSession: treatmentPlanSession.count,
        treatmentPhase: treatmentPhase.count,
        treatmentPlan: treatmentPlan.count,
        prescriptionItem: prescriptionItem.count,
        prescription: prescription.count,
        notification: notification.count,
        auditLog: auditLog.count,
        inventoryTransaction: inventoryTransaction.count,
        inventoryItem: inventoryItem.count,
        waitingQueue: waitingQueue.count,
        appointment: appointment.count,
        transaction: transaction.count,
        laserNote: laserNote.count,
        laserSession: laserSession.count,
        laserRecord: laserRecord.count,
        laserSetting: laserSetting.count,
        laserPackage: laserPackage.count,
        patientPhoto: patientPhoto.count,
        medication: medication.count,
        reminder: reminder.count,
        alert: alert.count,
        note: note.count,
        session: session.count,
        visit: visit.count,
        service: service.count,
        partnerDoctor: partnerDoctor.count,
        patient: patient.count,
      },
    })
  } catch (error) {
    console.error('Clear data error:', error)
    return NextResponse.json(
      {
        error: 'Failed to clear data',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
