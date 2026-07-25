'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useFinanceFormStore, usePatientFormStore } from '@/store'
import { cn, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { apiFetch, getLocalDateStr, getCairoDateParts, getEgyptianWeekDays, cairoISO, cairoDateTime, cairoTodayInput, getCairoWeekday, getCairoDateLabel, CHART_COLORS } from '@/lib/helpers'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Plus, Send, TrendingUp, TrendingDown, BarChart3, Receipt,
  ChevronDown, CalendarCheck, DollarSign, Trash2, FileText
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Transaction, Session, Patient, Visit } from '@/lib/types'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { addItem, deleteItem } from '@/lib/crud-helpers'
import CairoClock from '@/components/CairoClock'


// ─── FinanceCenter Component (self-contained) ──────────────────────────────────
export default function FinanceCenter() {
  // ─── Stores ────────────────────────────────────────────────────
  const { userRole } = useAuthStore()
  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor

  const { patients, transactions, setTransactions, sessions, visits, appointments, notes, setNotes } = useDataStore()
  const { showAddTransaction, setShowAddTransaction, expandedFinanceDay, setExpandedFinanceDay } = useUIStore()
  const { txnFormType, setTxnFormType, txnFormCategory, setTxnFormCategory, txnFormAmount, setTxnFormAmount, txnFormDescription, setTxnFormDescription, txnFormDate, setTxnFormDate } = useFinanceFormStore()
  const { quickNote, setQuickNote } = usePatientFormStore()

  // ─── Financial Computed Values ──────────────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [transactions.length, visits.length, sessions.length])
  const cairoNow = useMemo(() => getCairoDateParts(), [todayStr, patients.length, visits.length, sessions.length])

  const clinicTransactions = useMemo(() => transactions.filter(t => t.category !== 'personal'), [transactions])
  const clinicFinancials = useMemo(() => {
    let totalIncome = 0, totalExpense = 0, checkupRev = 0, revisitRev = 0, laserRev = 0, followUpRev = 0, sessionRev = 0, monthIncome = 0
    for (const t of clinicTransactions) {
      if (t.type === 'income') {
        totalIncome += t.amount
        if (t.category === 'كشف') checkupRev += t.amount
        else if (t.category === 'إعادة') revisitRev += t.amount
        else if (t.category === 'ليزر') laserRev += t.amount
        else if (t.category === 'متابعة') followUpRev += t.amount
        else if (t.category === 'جلسات') sessionRev += t.amount
        const td = getCairoDateParts(t.date)
        if (td.year === cairoNow.year && td.month === cairoNow.month) monthIncome += t.amount
      } else {
        totalExpense += t.amount
      }
    }
    return { totalIncome, totalExpense, checkupRevenue: checkupRev, revisitRevenue: revisitRev, laserRevenue: laserRev, followUpRevenue: followUpRev, sessionRevenue: sessionRev, thisMonthIncome: monthIncome }
  }, [clinicTransactions, cairoNow])
  const totalIncome = clinicFinancials.totalIncome
  const totalExpense = clinicFinancials.totalExpense
  const netProfit = totalIncome - totalExpense
  const checkupRevenue = clinicFinancials.checkupRevenue
  const revisitRevenue = clinicFinancials.revisitRevenue
  const laserRevenue = clinicFinancials.laserRevenue
  const followUpRevenue = clinicFinancials.followUpRevenue
  const sessionRevenue = clinicFinancials.sessionRevenue
  const otherRevenue = totalIncome - checkupRevenue - revisitRevenue - sessionRevenue - laserRevenue - followUpRevenue
  const thisMonthIncome = clinicFinancials.thisMonthIncome
  const unpaidTotal = useMemo(() => sessions.filter(s => !s.paid).reduce((s, ses) => s + ses.price, 0), [sessions])

  const todayStats = useMemo(() => {
    let todayIncome = 0, todayExpense = 0
    for (const t of transactions) {
      if (t.category === 'personal') continue
      if (getLocalDateStr(t.date) === todayStr) {
        if (t.type === 'income') todayIncome += t.amount
        else todayExpense += t.amount
      }
    }
    return { todayIncome, todayExpense, todayNetProfit: todayIncome - todayExpense }
  }, [transactions, todayStr])
  const todayIncome = todayStats.todayIncome
  const todayExpense = todayStats.todayExpense
  const todayNetProfit = todayStats.todayNetProfit

  const dailyFinanceData = useMemo(() => {
    const dayMap: Record<string, { date: string; income: number; expense: number; net: number; transactions: Transaction[] }> = {}
    transactions.filter(t => t.category !== 'personal').forEach(t => {
      const key = getLocalDateStr(t.date)
      if (!dayMap[key]) dayMap[key] = { date: key, income: 0, expense: 0, net: 0, transactions: [] }
      if (t.type === 'income') dayMap[key].income += t.amount || 0
      else dayMap[key].expense += t.amount || 0
      dayMap[key].net = dayMap[key].income - dayMap[key].expense
      dayMap[key].transactions.push(t)
    })
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date))
  }, [transactions])

  const revenueChartData = useMemo(() => {
    const txByDate: Record<string, { income: number; expense: number }> = {}
    for (const t of transactions) {
      if (t.category === 'personal') continue
      const ds = getLocalDateStr(t.date)
      if (!txByDate[ds]) txByDate[ds] = { income: 0, expense: 0 }
      if (t.type === 'income') txByDate[ds].income += t.amount
      else txByDate[ds].expense += t.amount
    }
    const weekDays = getEgyptianWeekDays()
    const days: { name: string; إيراد: number; مصروف: number }[] = weekDays.map(wd => {
      const dayData = txByDate[wd.dateStr] || { income: 0, expense: 0 }
      return { name: wd.dayName, إيراد: dayData.income, مصروف: dayData.expense }
    })
    return days
  }, [transactions])

  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: checkupRevenue || 0 },
    { name: 'إعادة', value: revisitRevenue || 0 },
    { name: 'جلسات', value: sessionRevenue || 0 },
    { name: 'ليزر', value: laserRevenue || 0 },
    { name: 'متابعة', value: followUpRevenue || 0 },
    { name: 'أخرى', value: otherRevenue || 0 },
  ].filter(d => d.value > 0), [checkupRevenue, revisitRevenue, sessionRevenue, laserRevenue, followUpRevenue, otherRevenue])

  // ─── Weekly Revenue Comparison (Saturday-Friday Egyptian week) ───
  const weeklyComparison = useMemo(() => {
    const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
    const dayOfWeek = nowCairo.getDay()
    const daysSinceSaturday = (dayOfWeek + 1) % 7
    const thisWeekDays = new Set<string>()
    for (let i = daysSinceSaturday; i >= 0; i--) {
      const d = new Date(nowCairo)
      d.setDate(d.getDate() - i)
      thisWeekDays.add(d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
    }
    const lastWeekDays = new Set<string>()
    for (let i = daysSinceSaturday + 1; i <= daysSinceSaturday + 7; i++) {
      const d = new Date(nowCairo)
      d.setDate(d.getDate() - i)
      lastWeekDays.add(d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
    }
    const thisWeekTxns = clinicTransactions.filter(t => t.type === 'income' && thisWeekDays.has(getLocalDateStr(t.date)))
    const thisWeekTotal = thisWeekTxns.reduce((s, t) => s + t.amount, 0)
    const lastWeekTxns = clinicTransactions.filter(t => t.type === 'income' && lastWeekDays.has(getLocalDateStr(t.date)))
    const lastWeekTotal = lastWeekTxns.reduce((s, t) => s + t.amount, 0)
    const changePercent = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : thisWeekTotal > 0 ? 100 : 0
    return { thisWeekTotal, lastWeekTotal, changePercent, isUp: thisWeekTotal >= lastWeekTotal }
  }, [clinicTransactions])

  // ─── Daily visit stats (for shareDailySummary) ───
  const dailyVisitStats = useMemo(() => {
    const dayMap: Record<string, { date: string; checkupCount: number; revisitCount: number; sessionCount: number; checkupRevenue: number; revisitRevenue: number; sessionRevenue: number }> = {}
    visits.forEach(v => {
      const key = getLocalDateStr(v.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      if (v.type === 'checkup' || v.type === 'checkup_session') dayMap[key].checkupCount++
      else if (v.type === 'revisit' || v.type === 'revisit_session') dayMap[key].revisitCount++
    })
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const key = getLocalDateStr(s.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      dayMap[key].sessionCount++
    })
    transactions.filter(t => t.category !== 'personal').forEach(t => {
      const key = getLocalDateStr(t.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      if (t.type === 'income' && t.category === 'كشف') dayMap[key].checkupRevenue += t.amount || 0
      else if (t.type === 'income' && t.category === 'إعادة') dayMap[key].revisitRevenue += t.amount || 0
      else if (t.type === 'income' && (t.category === 'جلسات' || t.category === 'ليزر' || t.category === 'متابعة')) dayMap[key].sessionRevenue += t.amount || 0
    })
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date))
  }, [visits, sessions, transactions])

  const todayAppointments = useMemo(() => appointments.filter(a => getLocalDateStr(a.date) === todayStr), [appointments, todayStr])

  // ─── WhatsApp Daily Summary ───
  const shareDailySummary = () => {
    const _cairoNow = getCairoDateParts()
    const _todayStats = dailyVisitStats.find(d => d.date === todayStr)
    const summary = `🏥 *تقرير عيادة المجازي اليومي*
📅 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })}

🩺 كشف: ${_todayStats?.checkupCount || 0} (${formatCurrency(_todayStats?.checkupRevenue || 0)})
🔄 إعادة: ${_todayStats?.revisitCount || 0} (${formatCurrency(_todayStats?.revisitRevenue || 0)})
⚡ جلسات: ${_todayStats?.sessionCount || 0} (${formatCurrency(_todayStats?.sessionRevenue || 0)})

💰 إيراد اليوم: ${formatCurrency(todayIncome)}
📉 مصروفات: ${formatCurrency(todayExpense)}
📊 صافي الربح: ${formatCurrency(todayNetProfit)}

👥 إجمالي المرضى: ${patients.length}
📅 مواعيد اليوم: ${todayAppointments.length}`
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank')
  }

  // ─── Quick Notes helper ────────────────────────────────────────
  const renderQuickNotes = (section: string) => {
    const sectionNotesList = notes.filter(n => n.section === section)
    const noteColors = [
      'from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-300 dark:border-rose-700',
      'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700',
      'from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700',
      'from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700',
      'from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-300 dark:border-violet-700',
      'from-cyan-100 to-sky-100 dark:from-cyan-900/20 dark:to-sky-900/20 border-cyan-300 dark:border-cyan-700',
    ]
    const noteEmojis = ['📝', '💡', '📌', '🔔', '⭐', '💬']
    return (
      <Card className="card-luxury mt-4 border-2 border-indigo-200 dark:border-indigo-800" key={`notes-${section}`}>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><div className="animate-wiggle"><FileText size={14} className="text-indigo-500" /></div> ملاحظات محترفة</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-9 text-sm border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
 <button className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: cairoISO() }, setNotes); setQuickNote('') } }}><Plus size={16} /></button>
          </div>
          <div className="space-y-1.5">
          {sectionNotesList.slice(0, 8).map((n, i) => (
            <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn('flex items-start gap-2 p-2.5 rounded-xl border bg-gradient-to-l transition-all hover:shadow-md', noteColors[i % noteColors.length])}>
              <span className="text-sm animate-bounce-y-sm">{noteEmojis[i % noteEmojis.length]}</span>
              <p className="flex-1 text-xs font-medium">{n.content}</p>
              <span className="text-[9px] text-muted-foreground whitespace-nowrap">{formatDate(n.createdAt)}</span>
              {canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={10} className="text-red-400" /></Button>}
            </motion.div>
          ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─── Render ──────────────────────────────────────────────────────
  return (
    <>
    <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-amber-50 dark:bg-amber-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="text-4xl animate-spin-slow">💰</div><div><h1 className="text-2xl font-bold">الإدارة المالية</h1><p className="text-muted-foreground text-sm">إيرادات ومصروفات العيادة - يومية بالتاريخ</p></div></div>
                    <div className="flex items-center gap-2">
                      <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
                        <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                        <CairoClock className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono" />
                        <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">|</span>
                        <CairoClock dateClassName="text-[10px] font-bold text-amber-600 dark:text-amber-400" />
                      </div>
                      <Button className="btn-luxury bg-gradient-to-l from-green-500 to-green-600 text-white shadow-lg" onClick={shareDailySummary}><Send size={14} className="ml-1" /> مشاركة واتساب</Button>
                      <Button className="btn-luxury bg-gradient-to-l from-amber-500 to-amber-600 text-white shadow-lg" onClick={() => { setTxnFormDate(cairoTodayInput()); setShowAddTransaction(true) }}><Plus size={14} className="ml-1" /> معاملة</Button>
                    </div>
                  </div>
                </div>
                {/* Today's Summary Cards */}
                {/* Cairo Time Indicator - always visible, links time to financial system */}
                <div className="sm:hidden flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
                  <Clock size={14} className="text-amber-600 dark:text-amber-400" />
                  <CairoClock className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono" />
                  <span className="text-[10px] text-amber-600/70 dark:text-amber-400/70">|</span>
                  <CairoClock dateClassName="text-[10px] font-bold text-amber-600 dark:text-amber-400" />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Card className="section-card p-4 border-2 border-emerald-200 dark:border-emerald-800"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={18} /></div><div><p className="text-[10px] text-muted-foreground">إيراد اليوم</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(todayIncome)}</p></div></div></Card>
                  <Card className="section-card p-4 border-2 border-red-200 dark:border-red-800"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingDown className="text-red-600" size={18} /></div><div><p className="text-[10px] text-muted-foreground">مصروفات اليوم</p><p className="text-lg font-bold text-red-600">{formatCurrency(todayExpense)}</p></div></div></Card>
                  <Card className="section-card p-4 border-2 border-blue-200 dark:border-blue-800"><div className="flex items-center gap-2"><div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30"><BarChart3 className="text-blue-600" size={18} /></div><div><p className="text-[10px] text-muted-foreground">صافي اليوم</p><p className={cn('text-lg font-bold', todayNetProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(todayNetProfit)}</p></div></div></Card>
                </div>
                {/* Period + Overall Summary */}
                <div className="grid grid-cols-2 gap-3">
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-xl font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-900/30"><TrendingDown className="text-red-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">إجمالي المصروفات</p><p className="text-xl font-bold text-red-600">{formatCurrency(totalExpense)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><BarChart3 className="text-blue-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">صافي الربح الكلي</p><p className={cn('text-xl font-bold', netProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(netProfit)}</p></div></div></Card>
                  <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[11px] text-muted-foreground">غير المدفوع</p><p className="text-xl font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div></div></Card>
                </div>
                {/* ═══ Weekly Revenue Comparison ═══ */}
                <Card className="card-luxury border-2 border-indigo-200 dark:border-indigo-800">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={16} className="text-indigo-600" /> مقارنة الإيرادات الأسبوعية</CardTitle></CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                        <p className="text-[10px] text-muted-foreground">هذا الأسبوع</p>
                        <p className="text-lg font-black text-emerald-600">{formatCurrency(weeklyComparison.thisWeekTotal)}</p>
                      </div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 text-center">
                        <p className="text-[10px] text-muted-foreground">الأسبوع السابق</p>
                        <p className="text-lg font-black text-gray-600">{formatCurrency(weeklyComparison.lastWeekTotal)}</p>
                      </div>
                      <div className={cn('p-3 rounded-xl text-center', weeklyComparison.isUp ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20')}>
                        <p className="text-[10px] text-muted-foreground">نسبة التغير</p>
                        <p className={cn('text-lg font-black flex items-center justify-center gap-1', weeklyComparison.isUp ? 'text-emerald-600' : 'text-red-600')}>
                          {weeklyComparison.isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                          {Math.abs(weeklyComparison.changePercent).toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Progress value={weeklyComparison.lastWeekTotal > 0 ? Math.min((weeklyComparison.thisWeekTotal / weeklyComparison.lastWeekTotal) * 100, 150) : (weeklyComparison.thisWeekTotal > 0 ? 100 : 0)} className={cn('h-3 rounded-full', weeklyComparison.isUp ? '[&>div]:bg-emerald-500' : '[&>div]:bg-red-500')} />
                      <p className="text-[9px] text-muted-foreground mt-1 text-center">{weeklyComparison.isUp ? '📈 ارتفاع عن الأسبوع الماضي' : '📉 انخفاض عن الأسبوع الماضي'}</p>
                    </div>
                  </CardContent>
                </Card>
                {/* Revenue by Category - Compact */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} className="text-amber-600" /> الإيرادات حسب النوع</CardTitle></CardHeader><CardContent>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🩺</span><span className="text-sm font-bold">كشف</span></div><span className="font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">🔄</span><span className="text-sm font-bold">إعادة</span></div><span className="font-bold text-blue-600">{formatCurrency(revisitRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">⚡</span><span className="text-sm font-bold">جلسات</span></div><span className="font-bold text-violet-600">{formatCurrency(sessionRevenue)}</span></div>
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">📊</span><span className="text-sm font-bold">أخرى</span></div><span className="font-bold text-gray-600">{formatCurrency(otherRevenue)}</span></div>
                  </div>
                  {revenueByCategory.length > 0 && <div className="mt-4"><ResponsiveContainer width="100%" height={200}><PieChart><Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>}
                </CardContent></Card>
                {/* Daily Revenue Chart */}
                <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={16} className="text-emerald-600" /> الإيرادات والمصروفات - آخر 7 أيام</CardTitle></CardHeader><CardContent>
                  <ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                </CardContent></Card>
                {/* ═══ Daily Financial Ledger ═══ */}
                <Card className="card-luxury border-2 border-amber-300 dark:border-amber-700">
                  <CardHeader><CardTitle className="text-sm flex items-center gap-2"><CalendarCheck size={16} className="text-amber-600" /> السجل المالي اليومي بالتاريخ</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {dailyFinanceData.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد معاملات بعد</p>}
                    {dailyFinanceData.map(day => {
                      const isToday = day.date === todayStr
                      const isExpanded = expandedFinanceDay === day.date
                      const dayName = getCairoWeekday(day.date)
                      const dayLabel = getCairoDateLabel(day.date)
                      return (
                        <div key={day.date} className={cn('rounded-xl border-2 overflow-hidden transition-all', isToday ? 'border-amber-400 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-950/20' : 'border-border bg-card')}>
                          <motion.div whileTap={{ scale: 0.99 }} onClick={() => setExpandedFinanceDay(isExpanded ? null : day.date)} className="p-3 cursor-pointer hover:bg-muted/50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={cn('p-2 rounded-lg', isToday ? 'bg-amber-200 dark:bg-amber-800' : 'bg-muted')}>
                                  <CalendarCheck size={14} className={isToday ? 'text-amber-700 dark:text-amber-300' : 'text-muted-foreground'} />
                                </div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-sm">{dayLabel}</span>
                                    {isToday && <Badge className="bg-amber-500 text-white text-[8px]">اليوم</Badge>}
                                  </div>
                                  <span className="text-[10px] text-muted-foreground">{dayName}</span>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-left">
                                  <div className="flex items-center gap-3">
                                    <div className="text-center"><p className="text-[8px] text-muted-foreground">إيراد</p><p className="text-xs font-bold text-emerald-600">{formatCurrency(day.income)}</p></div>
                                    <div className="text-center"><p className="text-[8px] text-muted-foreground">مصروف</p><p className="text-xs font-bold text-red-600">{formatCurrency(day.expense)}</p></div>
                                    <div className="text-center"><p className="text-[8px] text-muted-foreground">صافي</p><p className={cn('text-xs font-bold', day.net >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(day.net)}</p></div>
                                  </div>
                                </div>
                                <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', isExpanded && 'rotate-180')} />
                              </div>
                            </div>
                          </motion.div>
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                                <div className="px-3 pb-3 space-y-1.5 border-t border-dashed pt-2">
                                  {day.transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(t => (
                                    <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                                      <div className="flex items-center gap-2">
                                        <div className={cn('p-1 rounded-lg', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}>
                                          <DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={10} />
                                        </div>
                                        <div>
                                          <p className="text-[11px] font-medium">{t.description || t.category}</p>
                                          <div className="flex items-center gap-1.5">
                                            <Badge variant="outline" className="text-[7px] px-1 py-0">{t.category}</Badge>
                                            <span className="text-[9px] text-muted-foreground">{formatTime(t.date)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <span className={cn('text-xs font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>
                                        {canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success('تم حذف المعاملة') } catch { toast.error('خطأ في الحذف') } }}><Trash2 size={9} className="text-red-500" /></Button>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    })}
                  </CardContent>
                </Card>
                {renderQuickNotes('finance')}
              </div>

      {/* ─── Add Transaction Dialog ─── */}
      <Dialog open={showAddTransaction} onOpenChange={setShowAddTransaction}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><DollarSign size={20} className="text-amber-500" /> إضافة معاملة مالية</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">نوع المعاملة</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
 <button onClick={() => setTxnFormType('income')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', txnFormType === 'income' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}><TrendingUp size={16} /> إيراد</button>
 <button onClick={() => setTxnFormType('expense')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', txnFormType === 'expense' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}><TrendingUp size={16} className="rotate-180 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /> مصروف</button>
              </div>
            </div>
            <div><Label className="text-xs font-bold">الفئة</Label>
              <Select value={txnFormCategory} onValueChange={setTxnFormCategory}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {txnFormType === 'income' ? (
                    <>
                      <SelectItem value="كشف">كشف</SelectItem>
                      <SelectItem value="إعادة">إعادة</SelectItem>
                      <SelectItem value="جلسات">جلسات</SelectItem>
                      <SelectItem value="ليزر">ليزر</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </>
                  ) : (
                    <>
                      <SelectItem value="إيجار">إيجار</SelectItem>
                      <SelectItem value="رواتب">رواتب</SelectItem>
                      <SelectItem value="مستلزمات">مستلزمات</SelectItem>
                      <SelectItem value="صيانة">صيانة</SelectItem>
                      <SelectItem value="كهرباء">كهرباء</SelectItem>
                      <SelectItem value="ماء">ماء</SelectItem>
                      <SelectItem value="أخرى">أخرى</SelectItem>
                    </>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold">المبلغ (ج.م) *</Label><Input type="number" value={txnFormAmount} onChange={e => setTxnFormAmount(e.target.value)} placeholder="المبلغ بالجنيه..." className="input-luxury rounded-xl h-10 mt-1 text-lg font-bold" /></div>
            <div><Label className="text-xs font-bold">الوصف</Label><Input value={txnFormDescription} onChange={e => setTxnFormDescription(e.target.value)} placeholder="وصف المعاملة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            <div><Label className="text-xs font-bold">التاريخ</Label><Input type="date" value={txnFormDate} onChange={e => setTxnFormDate(e.target.value)} className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddTransaction(false)}>إلغاء</Button>
            <Button className={cn('btn-luxury rounded-xl text-white', txnFormType === 'income' ? 'bg-gradient-to-l from-emerald-500 to-emerald-600' : 'bg-gradient-to-l from-red-500 to-red-600')} onClick={async () => {
              const amount = parseFloat(txnFormAmount)
              if (!amount || amount <= 0) return toast.error('أدخل مبلغ صحيح')
              const date = cairoDateTime(txnFormDate)
              await addItem('/finance/transactions', { type: txnFormType, category: txnFormCategory, amount, description: txnFormDescription || undefined, date }, setTransactions, true)
              setTxnFormType('income'); setTxnFormCategory('كشف'); setTxnFormAmount(''); setTxnFormDescription(''); setTxnFormDate('')
              setShowAddTransaction(false)
              toast.success(txnFormType === 'income' ? 'تم إضافة الإيراد' : 'تم إضافة المصروف')
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
