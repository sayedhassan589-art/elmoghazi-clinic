import { db } from '@/lib/db'
import { cairoDayRange, cairoTodayStr } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const todayStr = cairoTodayStr()
    const dateFilter = cairoDayRange(todayStr)

    const [
      totalVisits,
      totalSessions,
      completedSessions,
      cancelledSessions,
      totalAppointments,
      scheduledAppointments,
      totalIncome,
      totalExpense,
      newPatients,
      waitingCount,
      laserSessionsCount,
    ] = await Promise.all([
      db.visit.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter, status: 'completed' } }),
      db.session.count({ where: { date: dateFilter, status: 'cancelled' } }),
      db.appointment.count({ where: { date: dateFilter } }),
      db.appointment.count({ where: { date: dateFilter, status: 'scheduled' } }),
      db.transaction.aggregate({ where: { type: 'income', date: dateFilter }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'expense', date: dateFilter }, _sum: { amount: true } }),
      db.patient.count({ where: { createdAt: dateFilter } }),
      db.waitingQueue.count({ where: { status: 'waiting' } }),
      db.laserSession.count({ where: { date: dateFilter } }),
    ])

    const income = totalIncome._sum.amount || 0
    const expense = totalExpense._sum.amount || 0

    return NextResponse.json({
      date: todayStr,
      visits: totalVisits,
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        cancelled: cancelledSessions,
      },
      appointments: {
        total: totalAppointments,
        scheduled: scheduledAppointments,
      },
      finance: {
        income,
        expense,
        net: income - expense,
      },
      newPatients,
      waitingCount,
      laserSessionsCount,
    })
  } catch (error) {
    console.error('Get daily report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
