import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const dateFilter: Record<string, Date> = {}
    if (startDate) dateFilter.gte = new Date(startDate)
    if (endDate) dateFilter.lte = new Date(endDate)

    const where: Record<string, unknown> = {}
    if (Object.keys(dateFilter).length > 0) where.date = dateFilter

    const [incomeAgg, expenseAgg, clinicIncomeAgg, personalIncomeAgg, clinicExpenseAgg, personalExpenseAgg] = await Promise.all([
      db.transaction.aggregate({ where: { ...where, type: 'income' }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { ...where, type: 'expense' }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { ...where, type: 'income', category: 'clinic' }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { ...where, type: 'income', category: 'personal' }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { ...where, type: 'expense', category: 'clinic' }, _sum: { amount: true }, _count: true }),
      db.transaction.aggregate({ where: { ...where, type: 'expense', category: 'personal' }, _sum: { amount: true }, _count: true }),
    ])

    const totalIncome = incomeAgg._sum.amount || 0
    const totalExpense = expenseAgg._sum.amount || 0

    return NextResponse.json({
      totalIncome,
      totalExpense,
      netProfit: totalIncome - totalExpense,
      incomeCount: incomeAgg._count,
      expenseCount: expenseAgg._count,
      clinicIncome: clinicIncomeAgg._sum.amount || 0,
      personalIncome: personalIncomeAgg._sum.amount || 0,
      clinicExpense: clinicExpenseAgg._sum.amount || 0,
      personalExpense: personalExpenseAgg._sum.amount || 0,
      clinicNet: (clinicIncomeAgg._sum.amount || 0) - (clinicExpenseAgg._sum.amount || 0),
      personalNet: (personalIncomeAgg._sum.amount || 0) - (personalExpenseAgg._sum.amount || 0),
    })
  } catch (error) {
    console.error('Get finance summary error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
