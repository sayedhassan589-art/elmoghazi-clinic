import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const backup = await db.backup.findUnique({ where: { id } })
    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    return NextResponse.json({ backup })
  } catch (error) {
    console.error('Get backup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params

    const backup = await db.backup.findUnique({ where: { id } })
    if (!backup) {
      return NextResponse.json({ error: 'Backup not found' }, { status: 404 })
    }

    const backupData = JSON.parse(backup.data)
    const { data } = backupData

    // Restore data - delete existing and recreate
    // Note: This is a simple restore. In production, you'd want transactions and more careful handling.

    // Delete in reverse dependency order
    await db.followUpVisit.deleteMany()
    await db.followUpRecord.deleteMany()
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
    await db.partnerDoctor.deleteMany()
    await db.patient.deleteMany()
    await db.user.deleteMany()

    // Recreate data
    if (data.users?.length) await db.user.createMany({ data: data.users })
    if (data.patients?.length) await db.patient.createMany({ data: data.patients })
    if (data.services?.length) await db.service.createMany({ data: data.services })
    if (data.visits?.length) await db.visit.createMany({ data: data.visits })
    if (data.sessions?.length) await db.session.createMany({ data: data.sessions })
    if (data.notes?.length) await db.note.createMany({ data: data.notes })
    if (data.alerts?.length) await db.alert.createMany({ data: data.alerts })
    if (data.reminders?.length) await db.reminder.createMany({ data: data.reminders })
    if (data.laserRecords?.length) await db.laserRecord.createMany({ data: data.laserRecords })
    if (data.laserSessions?.length) await db.laserSession.createMany({ data: data.laserSessions })
    if (data.laserPackages?.length) await db.laserPackage.createMany({ data: data.laserPackages })
    if (data.laserSettings?.length) await db.laserSetting.createMany({ data: data.laserSettings })
    if (data.laserNotes?.length) await db.laserNote.createMany({ data: data.laserNotes })
    if (data.transactions?.length) await db.transaction.createMany({ data: data.transactions })
    if (data.appointments?.length) await db.appointment.createMany({ data: data.appointments })
    if (data.waitingQueue?.length) await db.waitingQueue.createMany({ data: data.waitingQueue })
    if (data.inventoryItems?.length) await db.inventoryItem.createMany({ data: data.inventoryItems })
    if (data.inventoryTransactions?.length) await db.inventoryTransaction.createMany({ data: data.inventoryTransactions })
    if (data.treatmentPlans?.length) await db.treatmentPlan.createMany({ data: data.treatmentPlans })
    if (data.treatmentPhases?.length) await db.treatmentPhase.createMany({ data: data.treatmentPhases })
    if (data.treatmentPlanSessions?.length) await db.treatmentPlanSession.createMany({ data: data.treatmentPlanSessions })
    if (data.patientPhotos?.length) await db.patientPhoto.createMany({ data: data.patientPhotos })
    if (data.medications?.length) await db.medication.createMany({ data: data.medications })
    if (data.prescriptions?.length) await db.prescription.createMany({ data: data.prescriptions })
    if (data.prescriptionItems?.length) await db.prescriptionItem.createMany({ data: data.prescriptionItems })
    if (data.notifications?.length) await db.notification.createMany({ data: data.notifications })
    if (data.auditLogs?.length) await db.auditLog.createMany({ data: data.auditLogs })
    if (data.partnerDoctors?.length) await db.partnerDoctor.createMany({ data: data.partnerDoctors })
    if (data.followUpRecords?.length) await db.followUpRecord.createMany({ data: data.followUpRecords })
    if (data.followUpVisits?.length) await db.followUpVisit.createMany({ data: data.followUpVisits })

    return NextResponse.json({ message: 'Backup restored successfully' })
  } catch (error) {
    console.error('Restore backup error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
