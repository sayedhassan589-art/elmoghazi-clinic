import { db } from '@/lib/db'
import { cairoWeekRange } from '@/lib/cairo-time'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { gte, lt, weekStart, weekEnd } = cairoWeekRange()
    const dateFilter = { gte, lt }

    const [
      totalVisits,
      totalSessions,
      completedSessions,
      totalAppointments,
      totalIncome,
      totalExpense,
      newPatients,
      laserSessionsCount,
    ] = await Promise.all([
      db.visit.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter, status: 'completed' } }),
      db.appointment.count({ where: { date: dateFilter } }),
      db.transaction.aggregate({ where: { type: 'income', date: dateFilter }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'expense', date: dateFilter }, _sum: { amount: true } }),
      db.patient.count({ where: { createdAt: dateFilter } }),
      db.laserSession.count({ where: { date: dateFilter } }),
    ])

    const income = totalIncome._sum.amount || 0
    const expense = totalExpense._sum.amount || 0

    return NextResponse.json({
      weekStart,
      weekEnd,
      visits: totalVisits,
      sessions: { total: totalSessions, completed: completedSessions },
      appointments: totalAppointments,
      finance: { income, expense, net: income - expense },
      newPatients,
      laserSessionsCount,
    })
  } catch (error) {
    console.error('Get weekly report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
