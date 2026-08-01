'use client'

import { useMemo, useState, useEffect, useRef, memo } from 'react'
import { useShallow } from 'zustand/shallow'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useFinanceFormStore, useAppointmentFormStore } from '@/store'
import { cn, safeName, formatCurrency, formatTime } from '@/lib/utils'
import { getLocalDateStr, getCairoDateParts, getEgyptianWeekDays, cairoTodayInput, cairoISO, CHART_COLORS } from '@/lib/helpers'
import { addItem } from '@/lib/crud-helpers'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Users, Stethoscope, Zap, DollarSign, Calendar, Search,
  Clock, Download, RefreshCw, TrendingUp, TrendingDown,
  Activity, FileText, Plus, UserPlus, Timer, Wallet,
  CalendarCheck, BarChart3, Eye, Star, Heart, Sparkles,
  AlertTriangle, CheckCircle, ClipboardCheck, ArrowUpRight,
  ArrowDownRight, Crown, Medal, Trophy, Flame, Target,
  PieChart as PieChartIcon, LineChart as LineChartIcon,
  CircleDot, LayoutGrid
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LinearGradient, Stop, AreaChart, Area } from 'recharts'
import CairoClock from '@/components/CairoClock'

// ─── Animation Variants (kept minimal for performance) ───────────
const staggerContainer = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
}

const staggerItem = {
  hidden: { opacity: 0, y: 30, scale: 0.92 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { type: 'spring', stiffness: 260, damping: 22 } }
}

const heroVariant = {
  hidden: { opacity: 0, y: -30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, type: 'spring', stiffness: 120 } }
}

// ─── Animated Counter Component ──────────────────────────────────
function AnimatedCounter({ value, duration = 1200 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0)
  const prevValue = useRef(0)

  useEffect(() => {
    const start = prevValue.current
    const end = value
    const range = end - start
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      // Ease-out cubic for smooth deceleration
      const eased = 1 - Math.pow(1 - progress, 3)
      setDisplay(Math.round(start + range * eased))
      if (progress < 1) requestAnimationFrame(animate)
    }

    requestAnimationFrame(animate)
    prevValue.current = value
  }, [value, duration])

  return <>{display}</>
}

// ─── Shimmer Badge ───────────────────────────────────────────────
function ShimmerBadge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={cn(
      'relative overflow-hidden rounded-full px-2.5 py-0.5 text-xs font-bold',
      'bg-gradient-to-r from-emerald-500/20 via-amber-400/20 to-emerald-500/20',
      'text-emerald-700 dark:text-emerald-300 border border-emerald-400/30',
      className
    )}>
      <span className="animate-shimmer absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent" style={{ backgroundSize: '200% 100%' }} />
      {children}
    </span>
  )
}

// ─── DashboardSection Component ──────────────────────────────────
function DashboardSectionInner() {
  const { user, userRole } = useAuthStore()
  const { activeTab, setActiveTab } = useClinicStore()
  const { patients, visits, sessions, services, laserRecords, transactions, appointments, inventoryItems, notes, setNotes, alerts, loading, loadAllData } = useDataStore(useShallow((s) => ({
    patients: s.patients, visits: s.visits, sessions: s.sessions, services: s.services, laserRecords: s.laserRecords, transactions: s.transactions, appointments: s.appointments, inventoryItems: s.inventoryItems, notes: s.notes, setNotes: s.setNotes, alerts: s.alerts, loading: s.loading, loadAllData: s.loadAllData,
  })))
  const { setShowAddPatient, setShowAddLaserRecord, setShowAddTransaction, setShowAddAppointment, setSmartSearchOpen, quickNote, setQuickNote } = useUIStore(useShallow((s) => ({
    setShowAddPatient: s.setShowAddPatient, setShowAddLaserRecord: s.setShowAddLaserRecord, setShowAddTransaction: s.setShowAddTransaction, setShowAddAppointment: s.setShowAddAppointment, setSmartSearchOpen: s.setSmartSearchOpen, quickNote: s.quickNote, setQuickNote: s.setQuickNote,
  })))
  const { setTxnFormDate } = useFinanceFormStore()

  const isDoctor = userRole === 'doctor'
  const canAddPatient = isDoctor

  // ─── Computed Data ─────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [])
  const cairoNow = useMemo(() => getCairoDateParts(), [])

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

  // ─── Revenue chart data — 7-day with gradient ──────────────────
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
      return { name: wd.dayName, إيراد: dayData.income, مصروف: dayData.expense, صافي: dayData.income - dayData.expense }
    })
  }, [transactions])

  // ─── Monthly trend (last 30 days) ──────────────────────────────
  const monthlyTrend = useMemo(() => {
    const dayMap: Record<string, number> = {}
    for (const t of clinicTransactions) {
      if (t.type === 'income') {
        const ds = getLocalDateStr(t.date)
        dayMap[ds] = (dayMap[ds] || 0) + t.amount
      }
    }
    // Last 30 days
    const data: { date: string; income: number }[] = []
    const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const ds = d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
      const label = d.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' })
      data.push({ date: label, income: dayMap[ds] || 0 })
    }
    return data
  }, [clinicTransactions])

  const genderData = useMemo(() => [
    { name: 'ذكور', value: patientGenderCounts.male || 1 },
    { name: 'إناث', value: patientGenderCounts.female || 1 }
  ], [patientGenderCounts])

  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: clinicFinancials.checkupRevenue || 0, color: '#047857' },
    { name: 'إعادة', value: clinicFinancials.revisitRevenue || 0, color: '#D4A843' },
    { name: 'جلسات', value: clinicFinancials.sessionRevenue || 0, color: '#7C3AED' },
    { name: 'ليزر', value: clinicFinancials.laserRevenue || 0, color: '#06B6D4' },
    { name: 'متابعة', value: clinicFinancials.followUpRevenue || 0, color: '#EC4899' },
    { name: 'أخرى', value: (clinicFinancials.totalIncome - clinicFinancials.checkupRevenue - clinicFinancials.revisitRevenue - clinicFinancials.sessionRevenue - clinicFinancials.laserRevenue - clinicFinancials.followUpRevenue) || 0, color: '#F97316' },
  ].filter(d => d.value > 0), [clinicFinancials])

  // ─── Weekly comparison ──────────────────────────────────────────
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

  // ─── Top 5 patients by visits ──────────────────────────────────
  const top5Patients = useMemo(() => {
    const visitCountByPatient: Record<string, number> = {}
    for (const v of visits) visitCountByPatient[v.patientId] = (visitCountByPatient[v.patientId] || 0) + 1
    const sessionCountByPatient: Record<string, number> = {}
    for (const s of sessions) sessionCountByPatient[s.patientId] = (sessionCountByPatient[s.patientId] || 0) + 1
    const txnByPatient: Record<string, number> = {}
    for (const t of clinicTransactions) {
      if (t.type === 'income') {
        const pName = patients.find(p => t.description?.includes(p.name))
        if (pName) txnByPatient[pName.id] = (txnByPatient[pName.id] || 0) + t.amount
      }
    }
    const top5 = patients
      .filter(p => (visitCountByPatient[p.id] || 0) + (sessionCountByPatient[p.id] || 0) > 0)
      .sort((a, b) => ((visitCountByPatient[b.id] || 0) + (sessionCountByPatient[b.id] || 0)) - ((visitCountByPatient[a.id] || 0) + (sessionCountByPatient[a.id] || 0)))
      .slice(0, 5)
    const maxCount = top5.length > 0 ? (visitCountByPatient[top5[0].id] || 0) + (sessionCountByPatient[top5[0].id] || 0) : 1
    return top5.map(p => ({
      ...p,
      visits: visitCountByPatient[p.id] || 0,
      sessions: sessionCountByPatient[p.id] || 0,
      total: (visitCountByPatient[p.id] || 0) + (sessionCountByPatient[p.id] || 0),
      revenue: txnByPatient[p.id] || 0,
      pct: Math.round(((visitCountByPatient[p.id] || 0) + (sessionCountByPatient[p.id] || 0)) / maxCount * 100)
    }))
  }, [patients, visits, sessions, clinicTransactions])

  // ─── Recent activity timeline ──────────────────────────────────
  const recentActivity = useMemo(() => {
    const items: { id: string; type: string; label: string; detail: string; time: string; icon: React.ReactNode; color: string }[] = []
    todayVisits.slice(0, 3).forEach(v => {
      const pName = patients.find(p => p.id === v.patientId)?.name || 'مريض'
      items.push({ id: v.id, type: 'visit', label: pName, detail: v.type === 'checkup' ? 'كشف' : 'إعادة', time: formatTime(v.date), icon: <Stethoscope size={14} />, color: 'text-emerald-500' })
    })
    todaySessions.slice(0, 3).forEach(s => {
      const pName = patients.find(p => p.id === s.patientId)?.name || 'مريض'
      const svc = services.find(sv => sv.id === s.serviceId)?.name || 'جلسة'
      items.push({ id: s.id, type: 'session', label: pName, detail: svc, time: formatTime(s.date), icon: <Zap size={14} />, color: 'text-violet-500' })
    })
    clinicTransactions.filter(t => getLocalDateStr(t.date) === todayStr && t.type === 'income').slice(0, 3).forEach(t => {
      items.push({ id: t.id, type: 'income', label: t.description || 'إيراد', detail: formatCurrency(t.amount), time: formatTime(t.date), icon: <DollarSign size={14} />, color: 'text-amber-500' })
    })
    return items.sort((a, b) => b.time.localeCompare(a.time)).slice(0, 6)
  }, [todayVisits, todaySessions, clinicTransactions, todayStr, patients, services])

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
  const sectionNotes = useMemo(() => notes.filter(n => n.section === 'dashboard'), [notes])

  // ─── Custom Recharts Tooltip ───────────────────────────────────
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div className="rounded-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-emerald-200/50 dark:border-emerald-700/50 shadow-2xl shadow-emerald-500/10 p-3 min-w-[140px]">
        <p className="text-xs font-bold text-muted-foreground mb-2">{label}</p>
        {payload.map((p: any, i: number) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
            <span className="text-xs font-medium">{p.name}</span>
            <span className="text-sm font-bold ml-auto">{formatCurrency(p.value)}</span>
          </div>
        ))}
      </div>
    )
  }

  // ─── STAT CARD CONFIG ──────────────────────────────────────────
  const statCards = [
    { emoji: '👥', label: 'إجمالي المرضى', value: patients.length, sub: `+${newPatientsToday.length} اليوم`, gradient: 'from-blue-500 to-blue-600', shadowColor: 'shadow-blue-500/20', iconBg: 'bg-blue-400/20', accent: 'border-blue-400/30', countValue: patients.length },
    { emoji: '🩺', label: 'زيارات اليوم', value: todayVisits.length, sub: `${todayVisits.filter(v => v.type === 'checkup').length} كشف · ${todayVisits.filter(v => v.type === 'revisit').length} إعادة`, gradient: 'from-emerald-500 to-emerald-600', shadowColor: 'shadow-emerald-500/20', iconBg: 'bg-emerald-400/20', accent: 'border-emerald-400/30', countValue: todayVisits.length },
    { emoji: '💰', label: 'إيراد اليوم', value: formatCurrency(todayStats.todayIncome), sub: `صافي: ${formatCurrency(todayStats.todayNetProfit)}`, gradient: 'from-amber-500 to-amber-600', shadowColor: 'shadow-amber-500/20', iconBg: 'bg-amber-400/20', accent: 'border-amber-400/30', countValue: todayStats.todayIncome },
    { emoji: '📅', label: 'مواعيد اليوم', value: todayAppointments.length, sub: `${todayAppointments.filter(a => a.status === 'scheduled').length} مجدول`, gradient: 'from-violet-500 to-violet-600', shadowColor: 'shadow-violet-500/20', iconBg: 'bg-violet-400/20', accent: 'border-violet-400/30', countValue: todayAppointments.length },
    { emoji: '⚡', label: 'جلسات اليوم', value: todaySessions.length, sub: `${sessions.filter(s => !s.paid).length} غير مدفوعة`, gradient: 'from-fuchsia-500 to-fuchsia-600', shadowColor: 'shadow-fuchsia-500/20', iconBg: 'bg-fuchsia-400/20', accent: 'border-fuchsia-400/30', countValue: todaySessions.length },
    { emoji: '💎', label: 'سجلات الليزر', value: activeLaserRecords.length, sub: `${new Set(activeLaserRecords.map(r => r.patientId)).size} مريض`, gradient: 'from-cyan-500 to-cyan-600', shadowColor: 'shadow-cyan-500/20', iconBg: 'bg-cyan-400/20', accent: 'border-cyan-400/30', countValue: activeLaserRecords.length },
  ]

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-full">

      {/* ═══ HERO HEADER — Premium Mesh Gradient ═══ */}
      <motion.div variants={heroVariant} initial="hidden" animate="visible" className="relative overflow-hidden rounded-3xl shadow-2xl shadow-emerald-500/20 dark:shadow-emerald-500/10">
        {/* Multi-layer gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-700 dark:from-emerald-800 dark:to-teal-900" />
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-amber-400/40 to-transparent rounded-full blur-3xl animate-drift-a" />
          <div className="absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-gradient-to-tr from-emerald-300/30 to-transparent rounded-full blur-3xl animate-drift-b" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-bl from-cyan-300/20 to-transparent rounded-full blur-3xl animate-drift-c" />
        </div>
        {/* Dot pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-emerald-400 to-cyan-400 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

        <div className="relative z-10 p-6 md:p-8">
          {/* Header content */}
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              {/* Animated logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-yellow-600 flex items-center justify-center shadow-2xl shadow-amber-500/40 border-4 border-white/20 animate-bounce-y-sm">
                <Stethoscope className="text-white" size={36} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  لوحة التحكم
                </h1>
                <p className="text-emerald-200/80 text-sm md:text-base mt-1">
                  مرحباً، {safeName(user?.name)} 👋
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <ShimmerBadge>
                    <Sparkles size={10} className="ml-1 inline" /> عيادة المغازي
                  </ShimmerBadge>
                  {isDoctor && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-500/30 text-amber-200 border border-amber-400/30 text-xs font-bold backdrop-blur-sm">
                      <CheckCircle size={10} className="ml-1 inline" /> طبيب
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Clock */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl animate-glow-pulse">
                <Clock size={22} className="text-white" />
                <span className="text-white font-black text-xl md:text-2xl tracking-wider font-mono" dir="ltr">
                  <CairoClock className="text-white font-black text-xl md:text-2xl tracking-wider font-mono" />
                </span>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white/10 text-white/80 text-[10px] backdrop-blur-sm border border-white/10">
                <CairoClock dateClassName="" />
              </span>
            </div>
          </div>

          {/* Quick Stats Row inside header */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 md:mt-8">
            {[
              { label: 'الإيراد', value: formatCurrency(todayStats.todayIncome), icon: <TrendingUp size={16} />, color: 'text-emerald-200', change: weeklyComparison.isUp ? <ArrowUpRight size={12} className="text-emerald-300" /> : <ArrowDownRight size={12} className="text-red-300" /> },
              { label: 'المصروفات', value: formatCurrency(todayStats.todayExpense), icon: <TrendingDown size={16} />, color: 'text-amber-200', change: null },
              { label: 'صافي الربح', value: formatCurrency(todayStats.todayNetProfit), icon: <Wallet size={16} />, color: todayStats.todayNetProfit >= 0 ? 'text-emerald-200' : 'text-red-200', change: todayStats.todayNetProfit >= 0 ? <ArrowUpRight size={12} className="text-emerald-300" /> : <ArrowDownRight size={12} className="text-red-300" /> },
              { label: 'غير مدفوع', value: formatCurrency(unpaidTotal), icon: <AlertTriangle size={16} />, color: 'text-orange-200', change: unpaidTotal > 0 ? <ArrowDownRight size={12} className="text-orange-300" /> : null },
            ].map((s, i) => (
              <div key={i} className="flex items-center gap-2.5 p-3 md:p-4 rounded-2xl bg-white/[0.08] backdrop-blur-md border border-white/10 hover:bg-white/[0.14] transition-colors">
                <div className={cn('p-2 rounded-xl bg-white/10', s.color)}>{s.icon}</div>
                <div className="min-w-0">
                  <p className="text-[10px] md:text-xs text-white/50 truncate">{s.label}</p>
                  <div className="flex items-center gap-1">
                    <p className={cn('text-sm md:text-lg font-bold truncate', s.color)}>{s.value}</p>
                    {s.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ═══ QUICK ACTIONS — Glass Cards ═══ */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible">
        <Card className="border-2 border-emerald-200/60 dark:border-emerald-700/40 bg-gradient-to-br from-white/90 to-emerald-50/40 dark:from-gray-900/90 dark:to-emerald-950/20 backdrop-blur-sm overflow-hidden shadow-lg shadow-emerald-500/5">
          <div className="absolute top-0 left-0 w-40 h-40 bg-gradient-to-br from-emerald-500/8 to-teal-500/8 rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tr from-amber-500/5 to-yellow-500/5 rounded-full translate-x-1/2 translate-y-1/2" />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-lg flex items-center gap-2">
              <span className="animate-wiggle inline-block">⚡</span>
              إجراءات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-4">
              {[
                ...(canAddPatient ? [{ label: 'مريض جديد', icon: <UserPlus size={20} />, color: 'from-blue-500 to-indigo-700', shadow: 'shadow-blue-500/25', action: () => setShowAddPatient(true) }] : []),
                { label: 'سجل ليزر', icon: <Zap size={20} />, color: 'from-cyan-500 to-teal-600', shadow: 'shadow-cyan-500/25', action: () => setShowAddLaserRecord(true) },
                { label: 'معاملة مالية', icon: <DollarSign size={20} />, color: 'from-amber-500 to-orange-600', shadow: 'shadow-amber-500/25', action: () => { setActiveTab('finance'); setTxnFormDate(cairoTodayInput()); setShowAddTransaction(true) } },
                { label: 'موعد جديد', icon: <Calendar size={20} />, color: 'from-purple-500 to-violet-700', shadow: 'shadow-purple-500/25', action: () => setShowAddAppointment(true) },
                { label: 'بحث ذكي', icon: <Search size={20} />, color: 'from-emerald-500 to-emerald-700', shadow: 'shadow-emerald-500/25', action: () => setSmartSearchOpen(true) },
              ].map((a, i) => (
                <motion.button key={i} variants={staggerItem} whileHover={{ scale: 1.06, y: -4 }} whileTap={{ scale: 0.95 }} onClick={a.action} className="flex flex-col items-center gap-2.5 p-3 md:p-4 rounded-2xl bg-white dark:bg-gray-900 border border-border/50 shadow-md hover:shadow-xl transition-all group cursor-pointer">
                  <div className={cn('p-3 md:p-3.5 rounded-2xl text-white shadow-lg group-hover:shadow-xl transition-shadow bg-gradient-to-br', a.color, a.shadow)}>
                    {a.icon}
                  </div>
                  <span className="text-xs md:text-sm font-bold text-center">{a.label}</span>
                </motion.button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ STAT CARDS — Gradient with Animated Counter ═══ */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-5">
        {statCards.map((s, i) => (
          <motion.div key={i} variants={staggerItem} whileHover={{ scale: 1.04, y: -4 }} className={cn('relative overflow-hidden rounded-2xl md:rounded-3xl p-5 md:p-6 text-white shadow-xl bg-gradient-to-br group cursor-default', s.gradient, s.shadowColor)}>
            {/* Glass overlay circles */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-white/[0.06] rounded-full -translate-x-1/3 -translate-y-1/3 group-hover:scale-[1.5] transition-transform duration-500" />
            <div className="absolute bottom-0 right-0 w-24 h-24 bg-white/[0.04] rounded-full translate-x-1/3 translate-y-1/3 group-hover:scale-[1.3] transition-transform duration-500" />
            {/* Top accent line */}
            <div className="absolute top-0 right-0 w-full h-[3px] bg-gradient-to-l from-white/30 via-white/10 to-transparent" />
            {/* Bottom shimmer */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <div className="relative z-10">
              <div className={cn('w-12 h-12 md:w-14 md:h-14 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm border', s.accent, s.iconBg)}>
                <span className="text-2xl md:text-3xl">{s.emoji}</span>
              </div>
              <p className="text-sm md:text-base font-medium text-white/70">{s.label}</p>
              <p className="text-2xl md:text-3xl font-black mt-1 tracking-tight">
                {typeof s.countValue === 'number' && s.countValue < 100000 ? <AnimatedCounter value={s.countValue} /> : s.value}
              </p>
              {s.sub && <p className="text-xs text-white/40 mt-1.5 flex items-center gap-1"><Eye size={10} /> {s.sub}</p>}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ END-OF-DAY SUMMARY — Premium ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
        <Card className="border-2 border-amber-300/60 dark:border-amber-700/40 overflow-hidden shadow-lg shadow-amber-500/5">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-50/60 via-orange-50/30 to-yellow-50/40 dark:from-amber-950/30 dark:via-orange-950/15 dark:to-yellow-950/20 pointer-events-none" />
          {/* Animated gradient top bar */}
          <div className="h-2 bg-gradient-to-l from-amber-500 via-amber-400 to-yellow-500 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
          <CardHeader className="pb-3 relative z-10">
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg animate-spin-slow">
                  <BarChart3 size={20} className="text-white" />
                </div>
                ملخص نهاية اليوم
              </span>
              <div className="flex gap-2">
                <button onClick={shareDailySummary} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow active:scale-[0.95] hover:scale-[1.02]">
                  <RefreshCw size={14} /> مشاركة واتساب
                </button>
                <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-l from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md hover:shadow-lg transition-shadow active:scale-[0.95] hover:scale-[1.02]">
                  <Download size={14} /> طباعة
                </button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {[
                { emoji: '🩺', label: 'زيارات اليوم', value: todayVisits.length, detail: `${todayVisits.filter(v => v.type === 'checkup').length} كشف · ${todayVisits.filter(v => v.type === 'revisit').length} إعادة`, gradient: 'from-emerald-500 to-emerald-600', icon: <ClipboardCheck size={14} className="text-white/50" />, count: todayVisits.length },
                { emoji: '💰', label: 'إجمالي الإيرادات', value: formatCurrency(todayStats.todayIncome), detail: `كشف ${formatCurrency(clinicFinancials.checkupRevenue)} · إعادة ${formatCurrency(clinicFinancials.revisitRevenue)}`, gradient: 'from-amber-500 to-amber-600', icon: <Wallet size={14} className="text-white/50" />, count: null },
                { emoji: '⚡', label: 'جلسات مكتملة', value: todaySessions.filter(s => s.status === 'completed').length, detail: `${todaySessions.length} إجمالي · ${sessions.filter(s => !s.paid).length} غير مدفوعة`, gradient: 'from-violet-500 to-violet-600', icon: <Zap size={14} className="text-white/50" />, count: todaySessions.filter(s => s.status === 'completed').length },
                { emoji: '⚠️', label: 'مبالغ غير مدفوعة', value: formatCurrency(todayUnpaid), detail: `إجمالي: ${formatCurrency(unpaidTotal)}`, gradient: 'from-red-500 to-red-600', icon: <AlertTriangle size={14} className="text-white/50" />, count: null },
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 + i * 0.08 }} whileHover={{ scale: 1.03, y: -3 }} className={cn('relative overflow-hidden p-4 md:p-5 rounded-2xl text-white shadow-lg bg-gradient-to-br', item.gradient)}>
                  <div className="absolute top-0 right-0 w-16 h-16 bg-white/[0.08] rounded-full -translate-y-1/3 translate-x-1/3" />
                  <div className="absolute bottom-0 left-0 w-12 h-12 bg-white/[0.05] rounded-full translate-y-1/3 -translate-x-1/3" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-2xl md:text-3xl">{item.emoji}</span>
                      {item.icon}
                    </div>
                    <p className="text-xs text-white/70">{item.label}</p>
                    <p className="text-xl md:text-2xl font-black mt-0.5">
                      {item.count !== null && item.count < 100000 ? <AnimatedCounter value={item.count} /> : item.value}
                    </p>
                    <p className="text-[9px] md:text-[10px] text-white/40 mt-1 line-clamp-2">{item.detail}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Weekly comparison — enhanced */}
            <div className="mt-4 p-4 rounded-2xl bg-gradient-to-l from-emerald-500/10 to-amber-500/10 dark:from-emerald-500/20 dark:to-amber-500/20 border border-emerald-500/20 dark:border-emerald-400/20 backdrop-blur-sm">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  {weeklyComparison.isUp ? <ArrowUpRight size={18} className="text-emerald-500 animate-bounce-y-sm" /> : <ArrowDownRight size={18} className="text-red-500 animate-bounce-y-sm" />}
                  <span className="text-sm font-bold">مقارنة الأسبوع</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-muted-foreground">هذا الأسبوع: <span className="font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(weeklyComparison.thisWeekTotal)}</span></span>
                  <span className="text-muted-foreground">السابق: <span className="font-bold">{formatCurrency(weeklyComparison.lastWeekTotal)}</span></span>
                  <Badge className={cn('text-xs font-bold px-2 py-1', weeklyComparison.isUp ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border-red-300 dark:border-red-700')}>
                    {weeklyComparison.isUp ? <ArrowUpRight size={12} className="ml-1" /> : <ArrowDownRight size={12} className="ml-1" />}
                    {weeklyComparison.changePercent.toFixed(1)}%
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ MONTHLY TARGET PROGRESS ═══ */}
      {clinicFinancials.thisMonthIncome > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="border-2 border-emerald-200/60 dark:border-emerald-700/40 overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-teal-400 to-cyan-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target size={18} className="text-emerald-500" />
                إيراد الشهر الحالي
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                {cairoNow.monthName} {cairoNow.year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatCurrency(clinicFinancials.thisMonthIncome)}</span>
                  <span className="text-sm text-muted-foreground">إجمالي هذا الشهر</span>
                </div>
                {/* Revenue breakdown by category */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { label: 'كشف', value: clinicFinancials.checkupRevenue, color: 'bg-emerald-500' },
                    { label: 'إعادة', value: clinicFinancials.revisitRevenue, color: 'bg-amber-500' },
                    { label: 'جلسات', value: clinicFinancials.sessionRevenue, color: 'bg-violet-500' },
                    { label: 'ليزر', value: clinicFinancials.laserRevenue, color: 'bg-cyan-500' },
                    { label: 'متابعة', value: clinicFinancials.followUpRevenue, color: 'bg-pink-500' },
                    { label: 'أخرى', value: clinicFinancials.totalIncome - clinicFinancials.checkupRevenue - clinicFinancials.revisitRevenue - clinicFinancials.sessionRevenue - clinicFinancials.laserRevenue - clinicFinancials.followUpRevenue, color: 'bg-orange-500' },
                  ].filter(c => c.value > 0).map(c => (
                    <div key={c.label} className="flex items-center gap-2 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                      <div className={cn('w-3 h-3 rounded-full', c.color)} />
                      <span className="text-xs font-medium">{c.label}</span>
                      <span className="text-xs font-bold ml-auto">{formatCurrency(c.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══ CHARTS — Enhanced ═══ */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-5">

        {/* Revenue Bar Chart */}
        <Card className="lg:col-span-2 border-2 border-emerald-200/60 dark:border-emerald-700/40 overflow-hidden shadow-lg shadow-emerald-500/5">
          <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-teal-400 to-cyan-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <BarChart3 size={18} className="text-emerald-500" />
              الإيرادات والمصروفات — الأسبوع
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueChartData} barGap={4} barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={60} tickFormatter={(v: number) => formatCurrency(v)} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Bar dataKey="إيراد" fill="#047857" radius={[8, 8, 0, 0]} maxBarSize={36} />
                <Bar dataKey="مصروف" fill="#D4A843" radius={[8, 8, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Side charts */}
        <div className="space-y-4">
          {/* Gender distribution */}
          <Card className="border-2 border-blue-200/60 dark:border-blue-700/40 overflow-hidden shadow-lg shadow-blue-500/5">
            <div className="h-1.5 bg-gradient-to-l from-blue-500 via-violet-400 to-purple-500" />
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users size={18} className="text-blue-500" />
                توزيع المرضى
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} paddingAngle={4} strokeWidth={0}>
                    {genderData.map((_, i) => <Cell key={i} fill={i === 0 ? '#3B82F6' : '#EC4899'} stroke="none" />)}
                  </Pie>
                  <RechartsTooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Revenue by category */}
          {revenueByCategory.length > 0 && (
            <Card className="border-2 border-amber-200/60 dark:border-amber-700/40 overflow-hidden shadow-lg shadow-amber-500/5">
              <div className="h-1.5 bg-gradient-to-l from-amber-500 via-orange-400 to-yellow-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign size={18} className="text-amber-500" />
                  الإيراد بالتصنيف
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} paddingAngle={2} strokeWidth={0}>
                      {revenueByCategory.map((entry, i) => <Cell key={i} fill={entry.color} stroke="none" />)}
                    </Pie>
                    <RechartsTooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>

      {/* ═══ MONTHLY TREND — Line/Area Chart ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="border-2 border-emerald-200/60 dark:border-emerald-700/40 overflow-hidden shadow-lg shadow-emerald-500/5">
          <div className="h-1.5 bg-gradient-to-l from-emerald-500 via-cyan-400 to-blue-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LineChartIcon size={18} className="text-emerald-500" />
              trend الإيراد — آخر 30 يوم
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.3} vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={60} tickFormatter={(v: number) => formatCurrency(v)} />
                <RechartsTooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="income" stroke="#047857" strokeWidth={3} fill="url(#incomeGradient)" dot={false} activeDot={{ r: 6, fill: '#047857', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </motion.div>

      {/* ═══ RECENT ACTIVITY TIMELINE ═══ */}
      {recentActivity.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
          <Card className="border-2 border-emerald-200/60 dark:border-emerald-700/40 overflow-hidden shadow-lg shadow-emerald-500/5">
            <div className="h-1.5 bg-gradient-to-l from-violet-500 via-purple-400 to-fuchsia-500" />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity size={18} className="text-violet-500 animate-pulse-scale" />
                نشاط اليوم
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((item, i) => (
                  <motion.div key={item.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.06 }} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30 hover:bg-muted/40 transition-colors">
                    <div className={cn('p-2 rounded-lg bg-muted/40', item.color)}>
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold truncate">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.detail}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Clock size={12} />
                      <span dir="ltr">{item.time}</span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══ ALERTS — Premium Glass ═══ */}
      {(lowStockItems.length > 0 || todayAppointments.length > 0) && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lowStockItems.length > 0 && (
            <Card className="border-2 border-red-300/60 dark:border-red-700/40 bg-gradient-to-br from-red-50/50 to-orange-50/30 dark:from-red-950/20 dark:to-orange-950/10 backdrop-blur-sm shadow-lg shadow-red-500/5 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-l from-red-500 to-orange-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-red-700 dark:text-red-400">
                  <AlertTriangle size={16} className="text-red-500 animate-pulse-scale" />
                  مخزون منخفض ({lowStockItems.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-24 overflow-y-auto space-y-1.5">
                {lowStockItems.slice(0, 5).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-2 rounded-xl bg-red-100/50 dark:bg-red-900/20 border border-red-200/40 dark:border-red-800/30 text-xs">
                    <span className="text-red-600 dark:text-red-400 font-bold">{item.name}</span>
                    <Badge className="bg-red-200 text-red-700 dark:bg-red-900/40 dark:text-red-400 text-[9px] border border-red-300/50 dark:border-red-700/50">{item.quantity}/{item.minQuantity}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
          {todayAppointments.length > 0 && (
            <Card className="border-2 border-purple-300/60 dark:border-purple-700/40 bg-gradient-to-br from-purple-50/50 to-violet-50/30 dark:from-purple-950/20 dark:to-violet-950/10 backdrop-blur-sm shadow-lg shadow-purple-500/5 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-l from-purple-500 to-violet-500" />
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2 text-purple-700 dark:text-purple-400">
                  <CalendarCheck size={16} className="text-purple-500 animate-bounce-y-sm" />
                  مواعيد اليوم ({todayAppointments.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="max-h-24 overflow-y-auto space-y-1.5">
                {todayAppointments.slice(0, 5).map(a => (
                  <div key={a.id} className="flex items-center gap-2 p-2 rounded-xl bg-purple-100/50 dark:bg-purple-900/20 border border-purple-200/40 dark:border-purple-800/30 text-xs">
                    <span className="text-purple-600 dark:text-purple-400 font-bold">{a.patientName || patients.find(p => p.id === a.patientId)?.name}</span>
                    <Badge className={cn('text-[9px] border', a.status === 'scheduled' ? 'bg-purple-200 text-purple-700 dark:bg-purple-900/40 dark:text-purple-400 border-purple-300/50 dark:border-purple-700/50' : 'bg-emerald-200 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400 border-emerald-300/50 dark:border-emerald-700/50')}>
                      {a.status === 'scheduled' ? 'مجدول' : 'مكتمل'}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}

      {/* ═══ TOP PATIENTS — Trophy Ranking ═══ */}
      {isDoctor && top5Patients.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}>
          <Card className="border-2 border-amber-200/60 dark:border-amber-700/40 overflow-hidden shadow-lg shadow-amber-500/5">
            <div className="h-1.5 bg-gradient-to-l from-amber-400 via-yellow-500 to-amber-600 animate-shimmer" style={{ backgroundSize: '200% 100%' }} />
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                أعلى 5 مرضى بالزيارات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-56 overflow-y-auto">
                {top5Patients.map((p, i) => {
                  const rankIcon = i === 0 ? <Crown size={16} className="text-amber-500" /> : i === 1 ? <Medal size={16} className="text-gray-400" /> : i === 2 ? <Medal size={16} className="text-amber-700" /> : <Star size={14} className="text-muted-foreground" />
                  const rankBg = i === 0 ? 'from-amber-500 to-yellow-600' : i === 1 ? 'from-gray-400 to-gray-600' : i === 2 ? 'from-amber-700 to-orange-800' : 'from-emerald-500 to-teal-600'
                  const rankBorder = i === 0 ? 'border-amber-300/60 dark:border-amber-600/40 bg-amber-50/50 dark:bg-amber-950/20' : i === 1 ? 'border-gray-300/60 dark:border-gray-600/40 bg-gray-50/50 dark:bg-gray-950/20' : 'border-border/40 bg-muted/20'
                  return (
                    <motion.div key={p.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.8 + i * 0.07 }} className={cn('flex items-center gap-3 p-3 rounded-xl border', rankBorder)}>
                      {/* Rank number */}
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm shadow-md bg-gradient-to-br', rankBg)}>
                        {i + 1}
                      </div>
                      {/* Avatar */}
                      <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md bg-gradient-to-br', rankBg)}>
                        {p.name?.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-bold truncate">{p.name}</p>
                          {rankIcon}
                        </div>
                        <div className="flex items-center gap-2 mt-1.5">
                          <Progress value={p.pct} className="h-2.5 flex-1 [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:to-teal-500" />
                          <span className="text-xs text-muted-foreground font-bold">{p.total}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 items-end">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] border border-emerald-300/50 dark:border-emerald-700/50">{p.visits} زيارة</Badge>
                        <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[9px] border border-violet-300/50 dark:border-violet-700/50">{p.sessions} جلسة</Badge>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* ═══ QUICK NOTES ═══ */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85 }}>
        <Card className="border-2 border-emerald-200/60 dark:border-emerald-700/40 bg-gradient-to-br from-emerald-50/50 to-teal-50/30 dark:from-emerald-950/20 dark:to-teal-950/10 backdrop-blur-sm shadow-lg shadow-emerald-500/5 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-l from-emerald-500 to-teal-500" />
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <FileText size={14} className="text-emerald-500" /> ملاحظات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="أضف ملاحظة..." className="rounded-xl h-9 text-sm border-emerald-200/60 dark:border-emerald-700/40 focus:border-emerald-400" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: 'dashboard', createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
              <button className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-sm font-bold shadow-md active:scale-[0.9] hover:scale-[1.05] transition-transform" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: 'dashboard', createdAt: cairoISO() }, setNotes); setQuickNote('') } }}>
                <Plus size={16} />
              </button>
            </div>
            {sectionNotes.length > 0 && (
              <div className="space-y-1.5 max-h-32 overflow-y-auto">
                {sectionNotes.slice(0, 8).map(n => (
                  <div key={n.id} className="flex items-start gap-2 p-2 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-100/60 dark:border-emerald-900/40">
                    <p className="flex-1 text-xs font-medium">{n.content}</p>
                    <span className="text-[9px] text-muted-foreground whitespace-nowrap">{new Date(n.createdAt).toLocaleDateString('ar-EG', { timeZone: 'Africa/Cairo' })}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

// ─── Export with memo for performance ────────────────────────────
export default memo(DashboardSectionInner)
