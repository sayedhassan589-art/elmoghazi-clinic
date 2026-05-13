import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 7)

    const dateFilter = { gte: weekStart, lt: weekEnd }

    const [
      totalVisits,
      totalSessions,
      completedSessions,
      totalAppointments,
      totalIncome,
      totalExpense,
      newPatients,
      laserSessionsCount,
      dailyBreakdown,
    ] = await Promise.all([
      db.visit.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter, status: 'completed' } }),
      db.appointment.count({ where: { date: dateFilter } }),
      db.transaction.aggregate({ where: { type: 'income', date: dateFilter }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'expense', date: dateFilter }, _sum: { amount: true } }),
      db.patient.count({ where: { createdAt: dateFilter } }),
      db.laserSession.count({ where: { date: dateFilter } }),
      db.$queryRaw<Array<{ date: string; count: number }>>`
        SELECT date(visit_date) as date, COUNT(*) as count
        FROM Visit
        WHERE visit_date >= date(${weekStart.toISOString()})
        AND visit_date < date(${weekEnd.toISOString()})
        GROUP BY date(visit_date)
        ORDER BY date(visit_date)
      `,
    ])

    const income = totalIncome._sum.amount || 0
    const expense = totalExpense._sum.amount || 0

    return NextResponse.json({
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      visits: totalVisits,
      sessions: { total: totalSessions, completed: completedSessions },
      appointments: totalAppointments,
      finance: { income, expense, net: income - expense },
      newPatients,
      laserSessionsCount,
      dailyBreakdown,
    })
  } catch (error) {
    console.error('Get weekly report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
