'use client'

import { useMemo } from 'react'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useFinanceFormStore, useAppointmentFormStore } from '@/store'
import { cn, safeName, formatCurrency } from '@/lib/utils'
import { getLocalDateStr, getCairoDateParts, getEgyptianWeekDays, cairoTodayInput, cairoISO, CHART_COLORS } from '@/lib/helpers'
import { addItem } from '@/lib/crud-helpers'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Users, Stethoscope, Zap, DollarSign, Calendar, Search,
  Clock, Download, RefreshCw, TrendingUp, TrendingDown,
  Activity, FileText, Plus, UserPlus, Timer, Wallet,
  CalendarCheck, BarChart3, Eye, Star, Heart, Sparkles,
  AlertTriangle, CheckCircle, ClipboardCheck
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import CairoClock from '@/components/CairoClock'

// ─── Animation Variants ──────────────────────────────────────────
const cardVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { delay: i * 0.06, type: 'spring', stiffness: 200, damping: 20 }
  }),
  hover: { scale: 1.04, boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }
}

const slideUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
}

const pulseGlow = {
  animate: { boxShadow: ['0 0 0px rgba(16,185,129,0.4)', '0 0 20px rgba(16,185,129,0.6)', '0 0 0px rgba(16,185,129,0.4)'] },
  transition: { duration: 2, repeat: Infinity }
}

// ─── DashboardSection Component ──────────────────────────────────
export default function DashboardSection() {
  const { user, userRole } = useAuthStore()
  const { activeTab, setActiveTab } = useClinicStore()
  const { patients, visits, sessions, services, laserRecords, transactions, appointments, inventoryItems, notes, setNotes, loading, loadAllData } = useDataStore()
  const { setShowAddPatient, setShowAddLaserRecord, setShowAddTransaction, setShowAddAppointment, setSmartSearchOpen, quickNote, setQuickNote } = useUIStore()
  const { setTxnFormDate } = useFinanceFormStore()

  const isDoctor = userRole === 'doctor'
  const canAddPatient = isDoctor

  // ─── Computed Data ─────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [transactions.length, visits.length, sessions.length])
  const cairoNow = useMemo(() => getCairoDateParts(), [todayStr])

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

  const todayVisits = useMemo(() => visits.filter(v => getLocalDateStr(v.date) === todayStr), [visits, todayStr])
  const todayAppointments = useMemo(() => appointments.filter(a => getLocalDateStr(a.date) === todayStr), [appointments, todayStr])
  const todaySessions = useMemo(() => sessions.filter(s => getLocalDateStr(s.date) === todayStr), [sessions, todayStr])
  const activeLaserRecords = useMemo(() => laserRecords.filter(r => r.status === 'active'), [laserRecords])
  const newPatientsToday = useMemo(() => patients.filter(p => getLocalDateStr(p.createdAt) === todayStr), [patients, todayStr])

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
      } else { totalExpense += t.amount }
    }
    return { totalIncome, totalExpense, checkupRevenue: checkupRev, revisitRevenue: revisitRev, laserRevenue: laserRev, followUpRevenue: followUpRev, sessionRevenue: sessionRev, thisMonthIncome: monthIncome }
  }, [clinicTransactions, cairoNow])

  const unpaidTotal = useMemo(() => sessions.filter(s => !s.paid).reduce((s, ses) => s + ses.price, 0), [sessions])
  const todayUnpaid = useMemo(() => sessions.filter(s => !s.paid && getLocalDateStr(s.date) === todayStr).reduce((s, ses) => s + ses.price, 0), [sessions, todayStr])
  const lowStockItems = useMemo(() => inventoryItems.filter(i => i.quantity <= i.minQuantity), [inventoryItems])
  const patientGenderCounts = useMemo(() => ({ male: patients.filter(p => p.gender === 'male').length, female: patients.filter(p => p.gender === 'female').length }), [patients])

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
    return weekDays.map(wd => {
      const dayData = txByDate[wd.dateStr] || { income: 0, expense: 0 }
      return { name: wd.dayName, إيراد: dayData.income, مصروف: dayData.expense }
    })
  }, [transactions])

  const genderData = useMemo(() => [
    { name: 'ذكور', value: patientGenderCounts.male || 1 },
    { name: 'إناث', value: patientGenderCounts.female || 1 }
  ], [patientGenderCounts])

  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: clinicFinancials.checkupRevenue || 0 },
    { name: 'إعادة', value: clinicFinancials.revisitRevenue || 0 },
    { name: 'جلسات', value: clinicFinancials.sessionRevenue || 0 },
    { name: 'ليزر', value: clinicFinancials.laserRevenue || 0 },
    { name: 'متابعة', value: clinicFinancials.followUpRevenue || 0 },
    { name: 'أخرى', value: (clinicFinancials.totalIncome - clinicFinancials.checkupRevenue - clinicFinancials.revisitRevenue - clinicFinancials.sessionRevenue - clinicFinancials.laserRevenue - clinicFinancials.followUpRevenue) || 0 },
  ].filter(d => d.value > 0), [clinicFinancials])

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
    const thisWeekTotal = clinicTransactions.filter(t => t.type === 'income' && thisWeekDays.has(getLocalDateStr(t.date))).reduce((s, t) => s + t.amount, 0)
    const lastWeekTotal = clinicTransactions.filter(t => t.type === 'income' && lastWeekDays.has(getLocalDateStr(t.date))).reduce((s, t) => s + t.amount, 0)
    const changePercent = lastWeekTotal > 0 ? ((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100 : thisWeekTotal > 0 ? 100 : 0
    return { thisWeekTotal, lastWeekTotal, changePercent, isUp: thisWeekTotal >= lastWeekTotal }
  }, [clinicTransactions])

  // ─── WhatsApp Summary ──────────────────────────────────────────
  const shareDailySummary = () => {
    const summary = `🏥 *تقرير عيادة المجازي اليومي*
📅 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })}

🩺 كشف: ${todayVisits.filter(v => v.type === 'checkup').length}
🔄 إعادة: ${todayVisits.filter(v => v.type === 'revisit').length}
⚡ جلسات: ${todaySessions.length}

💰 إيراد اليوم: ${formatCurrency(todayStats.todayIncome)}
📉 مصروفات: ${formatCurrency(todayStats.todayExpense)}
📊 صافي الربح: ${formatCurrency(todayStats.todayNetProfit)}

👥 إجمالي المرضى: ${patients.length}
📅 مواعيد اليوم: ${todayAppointments.length}`
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank')
  }

  // ─── Quick Notes ──────────────────────────────────────────────
  const renderQuickNotes = () => {
    const sectionNotes = notes.filter(n => n.section === 'dashboard')
    return (
      <Card className="mt-4 border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText size={14} className="text-emerald-500" /> ملاحظات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="أضف ملاحظة..." className="rounded-xl h-9 text-sm border-emerald-200 dark:border-emerald-800 focus:border-emerald-400" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: 'dashboard', createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
            <button className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md active:scale-[0.9] hover:scale-[1.05] transition-transform" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: 'dashboard', createdAt: cairoISO() }, setNotes); setQuickNote('') } }}>
              <Plus size={16} />
            </button>
          </div>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {sectionNotes.slice(0, 8).map(n => (
              <div key={n.id} className="flex items-start gap-2 p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-100 dark:border-emerald-900">
                <p className="flex-1 text-xs font-medium">{n.content}</p>
                <span className="text-[9px] text-muted-foreground whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' })}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  // ─── STAT CARD CONFIG ──────────────────────────────────────────
  const statCards = [
    { emoji: '👥', label: 'إجمالي المرضى', value: patients.length, sub: `+${newPatientsToday.length} اليوم`, gradient: 'from-blue-500 via-blue-600 to-blue-700', shadowColor: 'shadow-blue-500/30', iconBg: 'bg-blue-500/20' },
    { emoji: '🩺', label: 'زيارات اليوم', value: todayVisits.length, sub: `${todayVisits.filter(v => v.type === 'checkup').length} كشف`, gradient: 'from-emerald-500 via-emerald-600 to-emerald-700', shadowColor: 'shadow-emerald-500/30', iconBg: 'bg-emerald-500/20' },
    { emoji: '💰', label: 'إيراد اليوم', value: formatCurrency(todayStats.todayIncome), sub: `صافي: ${formatCurrency(todayStats.todayNetProfit)}`, gradient: 'from-amber-500 via-amber-600 to-yellow-600', shadowColor: 'shadow-amber-500/30', iconBg: 'bg-amber-500/20' },
    { emoji: '📅', label: 'مواعيد اليوم', value: todayAppointments.length, sub: `${todayAppointments.filter(a => a.status === 'scheduled').length} مجدول`, gradient: 'from-purple-500 via-purple-600 to-purple-700', shadowColor: 'shadow-purple-500/30', iconBg: 'bg-purple-500/20' },
    { emoji: '⚡', label: 'جلسات اليوم', value: todaySessions.length, sub: `${sessions.filter(s => !s.paid).length} غير مدفوعة`, gradient: 'from-violet-500 via-violet-600 to-violet-700', shadowColor: 'shadow-violet-500/30', iconBg: 'bg-violet-500/20' },
    { emoji: '💎', label: 'سجلات الليزر', value: activeLaserRecords.length, sub: `${new Set(activeLaserRecords.map(r => r.patientId)).size} مريض`, gradient: 'from-cyan-500 via-cyan-600 to-teal-600', shadowColor: 'shadow-cyan-500/30', iconBg: 'bg-cyan-500/20' },
  ]

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="space-y-6">

      {/* ═══ HERO HEADER — Premium Glass Design ═══ */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, type: 'spring' }} className="relative overflow-hidden rounded-3xl">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-950" />
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/20 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-amber-300/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute top-1/2 left-1/3 w-40 h-40 bg-cyan-200/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 md:gap-6">
              <motion.div animate={{ y: [0, -6, 0] }} transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }} className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-white/20">
                <Stethoscope className="text-white" size={36} />
              </motion.div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">لوحة التحكم</h1>
                <p className="text-emerald-200/80 text-sm md:text-base mt-1">مرحباً، {safeName(user?.name)} 👋</p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                    <Sparkles size={12} className="ml-1" /> عيادة المغازي
                  </Badge>
                  {isDoctor && <Badge className="bg-amber-500/30 text-amber-200 border-amber-400/30 text-xs backdrop-blur-sm">
                    <CheckCircle size={12} className="ml-1" /> طبيب
                  </Badge>}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end gap-2">
              <motion.div animate={pulseGlow.animate} transition={pulseGlow.transition} className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
                <Clock size={22} className="text-white" />
                <span className="text-white font-black text-xl md:text-2xl tracking-wider font-mono" dir="ltr">
                  <CairoClock className="text-white font-black text-xl md:text-2xl tracking-wider font-mono" />
                </span>
              </motion.div>
              <Badge className="bg-white/10 text-white border-white/20 text-[10px] backdrop-blur-sm">
                <CairoClock dateClassName="" />
              </Badge>
            </div>
          </div>

          {/* Quick Stats Row inside header */}
          <div className="grid grid-cols-4 gap-3 mt-6 md:mt-8">
            {[
              { label: 'الإيراد', value: formatCurrency(todayStats.todayIncome), icon: <TrendingUp size={16} />, color: 'text-emerald-200' },
              { label: 'المصروفات', value: formatCurrency(todayStats.todayExpense), icon: <TrendingDown size={16} />, color: 'text-amber-200' },
              { label: 'صافي الربح', value: formatCurrency(todayStats.todayNetProfit), icon: <Wallet size={16} />, color: todayStats.todayNetProfit >= 0 ? 'text-emerald-200' : 'text-red-200' },
              { label: 'غير مدفوع', value: formatCurrency(unpaidTotal), icon: <AlertTriangle size={16} />, color: 'text-orange-200' },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2 p-2.5 md:p-3 rounded-xl bg-white/[0.08] backdrop-blur-sm border border-white/10">
                <div className={cn('p-1.5 rounded-lg bg-white/10', s.color)}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-[10px] text-white/60 truncate">{s.label}</p>
                  <p className={cn('text-sm md:text-base font-bold truncate', s.color)}>{s.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ QUICK ACTIONS ═══ */}
      <motion.div variants={slideUp} initial="hidden" animate="visible">
        <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-950 dark:to-emerald-950/10 overflow-hidden">
          <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg flex items-center gap-2">
              <motion.span animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>⚡</motion.span>
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-4">
              {[
                ...(canAddPatient ? [{ label: 'مريض جديد', icon: <UserPlus size={20} />, color: 'from-blue-500 to-blue-700', shadow: 'shadow-blue-500/30', action: () => setShowAddPatient(true) }] : []),
                { label: 'سجل ليزر', icon: <Zap size={20} />, color: 'from-cyan-500 to-teal-600', shadow: 'shadow-cyan-500/30', action: () => setShowAddLaserRecord(true) },
                { label: 'معاملة مالية', icon: <DollarSign size={20} />, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/30', action: () => { setActiveTab('finance'); setTxnFormDate(cairoTodayInput()); setShowAddTransaction(true) } },
                { label: 'موعد جديد', icon: <Calendar size={20} />, color: 'from-purple-500 to-purple-700', shadow: 'shadow-purple-500/30', action: () => setShowAddAppointment(true) },
                { label: 'بحث ذكي', icon: <Search size={20} />, color: 'from-emerald-500 to-emerald-700', shadow: 'shadow-emerald-500/30', action: () => setSmartSearchOpen(true) },
              ].map((a, i) => (
                <motion.button key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" onClick={a.action} className="flex flex-col items-center gap-2.5 p-3 md:p-4 rounded-2xl bg-white dark:bg-gray-900 border border-border/50 shadow-md hover:shadow-xl transition-all group cursor-pointer">
                  <div className={cn('p-3 md:p-4 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-shadow bg-gradient-to-br', a.color, a.shadow)}>
                    {a.icon}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-center">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ STAT CARDS ═══ */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {statCards.map((s, i) => (
          <motion.div key={i} custom={i} variants={cardVariants} initial="hidden" animate="visible" whileHover="hover" className={cn('relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-6 text-white shadow-xl bg-gradient-to-br', s.gradient, s.shadowColor)}>
            <div className="absolute top-0 left-0 w-28 h-28 bg-white/[0.08] rounded-full -translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 right-0 w-20 h-20 bg-white/[0.05] rounded-full translate-x-1/3 translate-y-1/3" />
            <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-l from-white/20 to-transparent" />
            <div className="relative z-10">
              <div className={cn('w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm border border-white/20', s.iconBg)}>
                <span className="text-2xl md:text-3xl">{s.emoji}</span>
              </div>
              <p className="text-sm md:text-base font-medium text-white/80">{s.label}</p>
              <p className="text-2xl md:text-3xl font-black mt-1 tracking-tight">{s.value}</p>
              {s.sub && <p className="text-xs text-white/50 mt-1.5 flex items-center gap-1"><Eye size={10} /> {s.sub}</p>}
            </div>
          </motion.div>
        ))}
      </div>

      {/* ═══ END-OF-DAY SUMMARY ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }}>
        <Card className="border-2 border-amber-300 dark:border-amber-700 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-yellow-50/40 dark:from-amber-950/30 dark:via-orange-950/15 dark:to-yellow-950/20 pointer-events-none" />
          <div className="h-2 bg-gradient-to-l from-amber-500 via-amber-400 to-yellow-500" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="flex items-center gap-3">
                <motion.div animate={{ rotate: [0, 360] }} transition={{ duration: 20, repeat: Infinity, ease: 'linear' }} className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
                  <BarChart3 size={20} className="text-white" />
                </motion.div>
                ملخص نهاية اليوم
              </span>
              <div className="flex gap-2">
                <button onClick={shareDailySummary} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow active:scale-[0.95]">
                  <RefreshCw size={14} /> مشاركة واتساب
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow active:scale-[0.95]">
                  <Download size={14} /> طباعة
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { emoji: '👥', label: 'زيارات اليوم', value: todayVisits.length, detail: `${todayVisits.filter(v => v.type === 'checkup').length} كشف | ${todayVisits.filter(v => v.type === 'revisit').length} إعادة`, gradient: 'from-blue-500 to-blue-700', icon: <ClipboardCheck size={16} className="text-white/60" /> },
                { emoji: '💰', label: 'إجمالي الإيرادات', value: formatCurrency(todayStats.todayIncome), detail: `كشف ${formatCurrency(clinicFinancials.checkupRevenue)} | إعادة ${formatCurrency(clinicFinancials.revisitRevenue)}`, gradient: 'from-emerald-500 to-emerald-700', icon: <Wallet size={16} className="text-white/60" /> },
                { emoji: '⚡', label: 'جلسات مكتملة', value: todaySessions.filter(s => s.status === 'completed').length, detail: `${todaySessions.length} إجمالي | ${sessions.filter(s => !s.paid).length} غير مدفوعة`, gradient: 'from-violet-500 to-violet-700', icon: <Zap size={16} className="text-white/60" /> },
                { emoji: '⚠️', label: 'مبالغ غير مدفوعة', value: formatCurrency(todayUnpaid), detail: `إجمالي: ${formatCurrency(unpaidTotal)}`, gradient: 'from-red-500 to-red-700', icon: <AlertTriangle size={16} className="text-white/60" /> },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5 + i * 0.1 }} whileHover={{ scale: 1.03 }} className={cn('relative overflow-hidden p-4 md:p-5 rounded-2xl text-white shadow-lg bg-gradient-to-br', item.gradient)}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.08] rounded-full -translate-y-1/3 translate-x-1/3" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl md:text-3xl">{item.emoji}</span>
                      {item.icon}
                    </div>
                    <p className="text-xs text-white/70">{item.label}</p>
                    <p className="text-xl md:text-2xl font-black mt-0.5">{item.value}</p>
                    <p className="text-[9px] md:text-[10px] text-white/50 mt-1 line-clamp-2">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Weekly comparison */}
            <div className="mt-4 p-3 md:p-4 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={16} className={weeklyComparison.isUp ? 'text-emerald-500' : 'text-red-500'} />
                  <span className="text-sm font-bold">مقارنة الأسبوع</span>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-muted-foreground">هذا الأسبوع: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(weeklyComparison.thisWeekTotal)}</span></span>
                  <span className="text-muted-foreground">السابق: <span className="font-bold">{formatCurrency(weeklyComparison.lastWeekTotal)}</span></span>
                  <Badge className={cn('text-xs font-bold', weeklyComparison.isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400')}>
                    {weeklyComparison.isUp ? <TrendingUp size={12} className="ml-1" /> : <TrendingDown size={12} className="ml-1" />}
                    {weeklyComparison.changePercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ CHARTS ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">
        <Card className="lg:col-span-2 border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
          <div className="h-1 bg-gradient-to-l from-emerald-500 to-teal-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-500" />
              الإيرادات والمصروفات — الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={revenueChartData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="إيراد" fill="#047857" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Bar dataKey="مصروف" fill="#D4A843" radius={[6, 6, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 overflow-hidden">
            <div className="h-1 bg-gradient-to-l from-blue-500 to-violet-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                توزيع المرضى
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} paddingAngle={3}>
                    {genderData.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} stroke="none" />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)' }} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {revenueByCategory.length > 0 && (
            <Card className="border-2 border-amber-300 dark:border-amber-700 overflow-hidden">
              <div className="h-1 bg-gradient-to-l from-amber-500 to-orange-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-500" />
                  الإيراد بالتصنيف
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={35} outerRadius={65} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} paddingAngle={2}>
                      {revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} stroke="none" />)}
                    </Pie>
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid var(--border)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* ═══ ALERTS ═══ */}
      {(lowStockItems.length > 0 || todayAppointments.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="border-2 border-red-300 dark:border-red-700 bg-gradient-to-br from-red-50/50 to-orange-50/30 dark:from-red-950/20 dark:to-orange-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle size={16} className="text-red-500" />
                  مخزون منخفض ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-24 overflow-y-auto space-y-1">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-red-100/50 dark:bg-red-900/20 text-xs">
                    <span className="text-red-600 dark:text-red-400 font-bold">{item.name}</span>
                    <Badge className="bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[9px]">{item.quantity}/{item.minQuantity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {todayAppointments.length > 0 && (
            <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <CalendarCheck size={16} className="text-purple-500" />
                  مواعيد اليوم ({todayAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-24 overflow-y-auto space-y-1">
                {todayAppointments.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-1.5 rounded-lg bg-purple-100/50 dark:bg-purple-900/20 text-xs">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{a.patientName || patients.find(p => p.id === a.patientId)?.name}</span>
                    <Badge className={cn('text-[9px]', a.status === 'scheduled' ? 'bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400' : 'bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400')}>
                      {a.status === 'scheduled' ? 'مجدول' : 'مكتمل'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* ═══ TOP PATIENTS ═══ */}
      {isDoctor && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}>
          <Card className="border-2 border-emerald-200 dark:border-emerald-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Star size={18} className="text-amber-500" />
                أعلى 5 مرضى بالزيارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {(() => {
                  const visitCountByPatient: Record<string, number> = {}
                  for (const v of visits) visitCountByPatient[v.patientId] = (visitCountByPatient[v.patientId] || 0) + 1
                  const sessionCountByPatient: Record<string, number> = {}
                  for (const s of sessions) sessionCountByPatient[s.patientId] = (sessionCountByPatient[s.patientId] || 0) + 1
                  const top5 = patients
                    .filter(p => (visitCountByPatient[p.id] || 0) + (sessionCountByPatient[p.id] || 0) > 0)
                    .sort((a, b) => ((visitCountByPatient[b.id] || 0) + (sessionCountByPatient[b.id] || 0)) - ((visitCountByPatient[a.id] || 0) + (sessionCountByPatient[a.id] || 0)))
                    .slice(0, 5)
                  const maxCount = top5.length > 0 ? (visitCountByPatient[top5[0].id] || 0) + (sessionCountByPatient[top5[0].id] || 0) : 1
                  return top5.map(p => {
                    const vc = visitCountByPatient[p.id] || 0
                    const sc = sessionCountByPatient[p.id] || 0
                    const total = vc + sc
                    const pct = Math.round((total / maxCount) * 100)
                    return (
                      <div key={p.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                          {p.name?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pct} className="h-2 flex-1" />
                            <span className="text-xs text-muted-foreground font-bold">{total}</span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">{vc} زيارة</Badge>
                          <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[9px]">{sc} جلسة</Badge>
                        </div>
                      </div>
                    )
                  })
                })()}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {renderQuickNotes()}
    </div>
  )
}
