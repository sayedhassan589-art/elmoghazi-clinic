import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const month = searchParams.get('month') // Format: YYYY-MM
    const now = new Date()

    let year: number, monthNum: number
    if (month) {
      const parts = month.split('-')
      year = parseInt(parts[0])
      monthNum = parseInt(parts[1]) - 1
    } else {
      year = now.getFullYear()
      monthNum = now.getMonth()
    }

    const monthStart = new Date(year, monthNum, 1)
    const monthEnd = new Date(year, monthNum + 1, 1)

    const dateFilter = { gte: monthStart, lt: monthEnd }

    const [
      totalVisits,
      totalSessions,
      completedSessions,
      cancelledSessions,
      totalAppointments,
      totalIncome,
      totalExpense,
      clinicIncome,
      clinicExpense,
      newPatients,
      laserSessionsCount,
      topServices,
    ] = await Promise.all([
      db.visit.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter } }),
      db.session.count({ where: { date: dateFilter, status: 'completed' } }),
      db.session.count({ where: { date: dateFilter, status: 'cancelled' } }),
      db.appointment.count({ where: { date: dateFilter } }),
      db.transaction.aggregate({ where: { type: 'income', date: dateFilter }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { type: 'expense', date: dateFilter }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { type: 'income', category: 'clinic', date: dateFilter }, _sum: { amount: true } }),
      db.transaction.aggregate({ where: { type: 'expense', category: 'clinic', date: dateFilter }, _sum: { amount: true } }),
      db.patient.count({ where: { createdAt: dateFilter } }),
      db.laserSession.count({ where: { date: dateFilter } }),
      db.session.groupBy({
        by: ['serviceId'],
        where: { date: dateFilter, serviceId: { not: null } },
        _count: true,
        orderBy: { _count: { serviceId: 'desc' } },
        take: 10,
      }),
    ])

    const income = totalIncome._sum.amount || 0
    const expense = totalExpense._sum.amount || 0

    // Get service names for top services
    const serviceIds = topServices.map(s => s.serviceId).filter(Boolean) as string[]
    const services = await db.service.findMany({
      where: { id: { in: serviceIds } },
      select: { id: true, name: true },
    })

    const serviceMap = new Map(services.map(s => [s.id, s.name]))
    const topServicesWithNames = topServices.map(s => ({
      serviceId: s.serviceId,
      serviceName: serviceMap.get(s.serviceId!) || 'Unknown',
      count: s._count,
    }))

    return NextResponse.json({
      month: `${year}-${String(monthNum + 1).padStart(2, '0')}`,
      monthStart: monthStart.toISOString().split('T')[0],
      monthEnd: monthEnd.toISOString().split('T')[0],
      visits: totalVisits,
      sessions: {
        total: totalSessions,
        completed: completedSessions,
        cancelled: cancelledSessions,
        completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0,
      },
      appointments: totalAppointments,
      finance: {
        income,
        expense,
        net: income - expense,
        incomeCount: totalIncome._count,
        expenseCount: totalExpense._count,
        clinicIncome: clinicIncome._sum.amount || 0,
        clinicExpense: clinicExpense._sum.amount || 0,
      },
      newPatients,
      laserSessionsCount,
      topServices: topServicesWithNames,
    })
  } catch (error) {
    console.error('Get monthly report error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
