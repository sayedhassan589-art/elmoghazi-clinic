import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const skip = (page - 1) * limit

    const [backups, total] = await Promise.all([
      db.backup.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          type: true,
          size: true,
          status: true,
          createdAt: true,
        },
      }),
      db.backup.count(),
    ])

    return NextResponse.json({
      backups,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    })
  } catch (error) {
    console.error('Get backups error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Get backup type from request body
    let backupType = 'manual'
    try {
      const body = await request.clone().json()
      if (body?.type) backupType = body.type
    } catch {}

    // Serialize all data as JSON for backup
    const [
      users,
      patients,
      services,
      visits,
      sessions,
      notes,
      alerts,
      reminders,
      laserRecords,
      laserSessions,
      laserPackages,
      laserSettings,
      laserNotes,
      transactions,
      appointments,
      waitingQueue,
      inventoryItems,
      inventoryTransactions,
      treatmentPlans,
      treatmentPhases,
      treatmentPlanSessions,
      patientPhotos,
      medications,
      prescriptions,
      prescriptionItems,
      notifications,
      auditLogs,
      partnerDoctors,
      followUpRecords,
      followUpVisits,
    ] = await Promise.all([
      db.user.findMany(),
      db.patient.findMany(),
      db.service.findMany(),
      db.visit.findMany(),
      db.session.findMany(),
      db.note.findMany(),
      db.alert.findMany(),
      db.reminder.findMany(),
      db.laserRecord.findMany(),
      db.laserSession.findMany(),
      db.laserPackage.findMany(),
      db.laserSetting.findMany(),
      db.laserNote.findMany(),
      db.transaction.findMany(),
      db.appointment.findMany(),
      db.waitingQueue.findMany(),
      db.inventoryItem.findMany(),
      db.inventoryTransaction.findMany(),
      db.treatmentPlan.findMany(),
      db.treatmentPhase.findMany(),
      db.treatmentPlanSession.findMany(),
      db.patientPhoto.findMany(),
      db.medication.findMany(),
      db.prescription.findMany(),
      db.prescriptionItem.findMany(),
      db.notification.findMany(),
      db.auditLog.findMany(),
      db.partnerDoctor.findMany(),
      db.followUpRecord.findMany(),
      db.followUpVisit.findMany(),
    ])

    const backupData = JSON.stringify({
      exportedAt: new Date().toISOString(),
      version: '2.0',
      app: 'elmoghazi-clinic',
      data: {
        users,
        patients,
        services,
        visits,
        sessions,
        notes,
        alerts,
        reminders,
        laserRecords,
        laserSessions,
        laserPackages,
        laserSettings,
        laserNotes,
        transactions,
        appointments,
        waitingQueue,
        inventoryItems,
        inventoryTransactions,
        treatmentPlans,
        treatmentPhases,
        treatmentPlanSessions,
        patientPhotos,
        medications,
        prescriptions,
        prescriptionItems,
        notifications,
        auditLogs,
        partnerDoctors,
        followUpRecords,
        followUpVisits,
      },
    })

    const backup = await db.backup.create({
      data: {
        type: backupType,
        size: backupData.length,
        status: 'completed',
        data: backupData,
      },
      select: {
        id: true,
        type: true,
        size: true,
        status: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ backup }, { status: 201 })
  } catch (error) {
    console.error('Create backup error:', error)

    // Mark backup as failed
    try {
      await db.backup.create({
        data: {
          type: backupType,
          size: 0,
          status: 'failed',
          data: '{}',
        },
      })
    } catch {
      // Ignore
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
