'use client'

import { useMemo, useState, useRef, memo } from 'react'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore } from '@/store'
import { cn, safeName, formatCurrency, formatTime, formatDate } from '@/lib/utils'
import { apiFetch, getLocalDateStr, getCairoDateParts, getEgyptianWeekDays, cairoISO, cairoTodayInput, normalizePhone, waPhone, CHART_COLORS } from '@/lib/helpers'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send, Search, Filter, Users, Star, Phone, Calendar,
  CheckCircle, Copy, Clock, Eye, Sparkles, MessageCircle,
  ChevronDown, X, Plus, Zap, Heart, AlertTriangle, RefreshCw,
  Download, ArrowUpRight, ArrowDownRight, Target, Crown,
  FileText, Edit3, Trash2, UserPlus, PhoneCall, Stethoscope,
  BarChart3, TrendingUp, Wallet, Flame, Badge as BadgeIcon,
  CircleDot, Sparkle, ThumbsUp, ClipboardCheck, Shield
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import CairoClock from '@/components/CairoClock'

// ─── Animation Variants ──────────────────────────────────────────
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

// ─── Message Templates ───────────────────────────────────────────
const BROADCAST_TEMPLATES = [
  { id: 'reminder', label: 'تذكير موعد', emoji: '📅', category: 'مواعيد', message: 'مرحباً {name}، نود تذكيرك بموعدك في عيادة المغازي للأمراض الجلدية. نتطلع لرؤيتك! 🏥' },
  { id: 'followup', label: 'متابعة', emoji: '🔄', category: 'متابعة', message: 'مرحباً {name}، كيف حالك؟ نود متابعة حالتك بعد الزيارة الأخيرة. هل يمكنك مراجعة العيادة؟ 🩺' },
  { id: 'promo', label: 'عرض ليزر', emoji: '🎉', category: 'عروض', message: 'مرحباً {name}! عيادة المغازي تقدم عرض خاص على جلسات الليزر هذا الشهر. احجز الآن واستمتع بنتائج مذهلة! ⚡' },
  { id: 'promosession', label: 'عرض جلسات', emoji: '✨', category: 'عروض', message: 'مرحباً {name}! خصم خاص على جلسات العلاج في عيادة المغازي. لا تفوت الفرصة! 💫' },
  { id: 'holiday', label: 'إجازة', emoji: '🌴', category: 'إعلانات', message: 'مرحباً {name}، عيادة المغازي ستكون مغلقة خلال الإجازة. سيتم إعادة جدولة موعدك. شكراً لتفهمكم! 🏥' },
  { id: 'holidayopen', label: 'عودة العمل', emoji: '🏢', category: 'إعلانات', message: 'مرحباً {name}! عيادة المغازي فتحت أبوابها مجدداً بعد الإجازة. نرحب بك在任何 وقت! 🩺' },
  { id: 'thankyou', label: 'شكر', emoji: '🙏', category: 'علاقات', message: 'مرحباً {name}، شكراً لزيارتك عيادة المغازي. نتمنى لك دوام الصحة والعافية! 💚' },
  { id: 'birthday', label: 'عيد ميلاد', emoji: '🎂', category: 'علاقات', message: 'كل عام وأنت بخير {name}! 🎂 عيادة المغازي تتمنى لك يوم عيد ميلاد سعيد filled with joy! 🎉' },
  { id: 'newpatient', label: 'مريض جديد', emoji: '👋', category: 'ترحيب', message: 'مرحباً {name}! 👋 شكراً لاختيار عيادة المغازي للأمراض الجلدية. نحن هنا لخدمتك! 🏥' },
  { id: 'custom', label: 'مخصص', emoji: '✏️', category: 'مخصص', message: '' },
]

// ─── Filter Presets ──────────────────────────────────────────────
const FILTER_PRESETS = [
  { id: 'all', label: 'الكل', emoji: '👥', desc: 'جميع المرضى بأرقام' },
  { id: 'starred', label: 'المميزة', emoji: '⭐', desc: 'المرضى المميزين' },
  { id: 'today', label: 'زيارات اليوم', emoji: '📅', desc: 'المرضى الذين زاروا اليوم' },
  { id: 'recent7', label: '7 أيام', emoji: '📆', desc: 'المرضى خلال آخر 7 أيام' },
  { id: 'recent30', label: '30 يوم', emoji: '🗓️', desc: 'المرضى خلال آخر 30 يوم' },
  { id: 'laser', label: 'ليزر', emoji: '⚡', desc: 'مرضى لديهم سجلات ليزر' },
  { id: 'unpaid', label: 'غير مدفوع', emoji: '⚠️', desc: 'مرضى لديهم جلسات غير مدفوعة' },
  { id: 'noVisits', label: 'بدون زيارات', emoji: '🆕', desc: 'المرضى الذين لم يزوروا بعد' },
]

// ─── MessageSection Component ────────────────────────────────────
function MessageSectionInner() {
  const { user, userRole } = useAuthStore()
  const { setActiveTab } = useClinicStore()
  const { patients, visits, sessions, services, laserRecords, transactions, appointments, loading } = useDataStore()
  const {
    broadcastMessage, setBroadcastMessage, broadcastFilter, setBroadcastFilter,
    broadcastSending, setBroadcastSending, broadcastProgress, setBroadcastProgress,
    broadcastSelectedIds, setBroadcastSelectedIds
  } = useUIStore()

  const isDoctor = userRole === 'doctor'
  const [msgSubTab, setMsgSubTab] = useState<'compose' | 'contacts' | 'history'>('compose')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  // ─── Computed data ─────────────────────────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [])
  const patientsWithPhone = useMemo(() => patients.filter(p => p.phone && waPhone(p.phone)), [patients])
  const maleWithPhone = useMemo(() => patientsWithPhone.filter(p => p.gender === 'male').length, [patientsWithPhone])
  const femaleWithPhone = useMemo(() => patientsWithPhone.filter(p => p.gender === 'female').length, [patientsWithPhone])

  // ─── Filtered broadcast patients ──────────────────────────────
  const filteredBroadcastPatients = useMemo(() => {
    let list = patientsWithPhone
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q))
    }
    switch (broadcastFilter) {
      case 'starred': list = list.filter(p => p.starred); break
      case 'today': list = list.filter(p => visits.some(v => v.patientId === p.id && getLocalDateStr(v.date) === todayStr)); break
      case 'recent7': {
        const cutoff = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
        cutoff.setDate(cutoff.getDate() - 7)
        list = list.filter(p => p.createdAt && new Date(p.createdAt) >= cutoff)
        break
      }
      case 'recent30': {
        const cutoff = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
        cutoff.setDate(cutoff.getDate() - 30)
        list = list.filter(p => p.createdAt && new Date(p.createdAt) >= cutoff)
        break
      }
      case 'laser': list = list.filter(p => laserRecords.some(r => r.patientId === p.id && r.status === 'active')); break
      case 'unpaid': list = list.filter(p => sessions.some(s => s.patientId === p.id && !s.paid)); break
      case 'noVisits': list = list.filter(p => !visits.some(v => v.patientId === p.id)); break
    }
    if (broadcastSelectedIds.length > 0) list = list.filter(p => broadcastSelectedIds.includes(p.id))
    return list
  }, [patientsWithPhone, broadcastFilter, broadcastSelectedIds, searchQuery, visits, sessions, laserRecords, todayStr])

  // ─── Send broadcast ────────────────────────────────────────────
  const sendBroadcast = async () => {
    if (!broadcastMessage.trim()) { toast.error('اكتب الرسالة أولاً'); return }
    const targets = broadcastSelectedIds.length > 0 ? filteredBroadcastPatients : filteredBroadcastPatients
    if (targets.length === 0) { toast.error('لا يوجد مرضى بأرقام هاتف'); return }
    setBroadcastSending(true)
    setBroadcastProgress({ sent: 0, total: targets.length })
    for (let i = 0; i < targets.length; i++) {
      const p = targets[i]
      const personalizedMsg = broadcastMessage.replace(/\{name\}/g, p.name).replace(/\{phone\}/g, p.phone || '')
      const encodedMsg = encodeURIComponent(personalizedMsg)
      window.open(`https://wa.me/${waPhone(p.phone)}?text=${encodedMsg}`, '_blank')
      setBroadcastProgress({ sent: i + 1, total: targets.length })
      await new Promise(resolve => setTimeout(resolve, 1500))
    }
    setBroadcastSending(false)
    toast.success(`تم فتح واتساب لـ ${targets.length} مريض ✅`)
  }

  // ─── Copy broadcast info ───────────────────────────────────────
  const copyBroadcastInfo = () => {
    const targets = broadcastSelectedIds.length > 0 ? filteredBroadcastPatients : filteredBroadcastPatients
    const lines = targets.map(p => `${p.name}: ${p.phone}`)
    const info = `الرسالة:\n${broadcastMessage}\n\nالأرقام:\n${lines.join('\n')}\n\nعدد المرضى: ${targets.length}`
    navigator.clipboard.writeText(info)
    toast.success('تم نسخ البيانات ✅')
  }

  // ─── Send to individual patient ────────────────────────────────
  const sendToPatient = (patient: any, message: string) => {
    const personalizedMsg = message.replace(/\{name\}/g, patient.name).replace(/\{phone\}/g, patient.phone || '')
    window.open(`https://wa.me/${waPhone(patient.phone)}?text=${encodeURIComponent(personalizedMsg)}`, '_blank')
    toast.success(`فتح واتساب لـ ${patient.name} ✅`)
  }

  // ─── Call patient ──────────────────────────────────────────────
  const callPatient = (patient: any) => {
    window.open(`tel:${waPhone(patient.phone)}`, '_self')
    toast.success(`جاري الاتصال بـ ${patient.name}`)
  }

  // ─── Template categories ───────────────────────────────────────
  const templateCategories = useMemo(() => {
    const cats: Record<string, typeof BROADCAST_TEMPLATES> = {}
    BROADCAST_TEMPLATES.forEach(t => {
      if (!cats[t.category]) cats[t.category] = []
      cats[t.category].push(t)
    })
    return cats
  }, [])

  // ─── Stats ─────────────────────────────────────────────────────
  const statsCards = useMemo(() => [
    { emoji: '📱', label: 'أرقام مسجلة', value: patientsWithPhone.length, gradient: 'from-emerald-600 to-teal-700', sub: `${maleWithPhone} ذكور · ${femaleWithPhone} إناث` },
    { emoji: '🎯', label: 'مستهدفين', value: filteredBroadcastPatients.length, gradient: 'from-amber-600 to-orange-700', sub: broadcastFilter === 'all' ? 'جميع الأرقام' : FILTER_PRESETS.find(f => f.id === broadcastFilter)?.label },
    { emoji: '📵', label: 'بدون رقم', value: patients.length - patientsWithPhone.length, gradient: 'from-red-600 to-rose-700', sub: 'يتطلب إضافة رقم' },
  ], [patientsWithPhone, filteredBroadcastPatients, broadcastFilter, patients, maleWithPhone, femaleWithPhone])

  // ─── RENDER ────────────────────────────────────────────────────
  return (
    <div className="space-y-6 max-w-full">

      {/* ═══ HERO HEADER — WhatsApp-style ═══ */}
      <motion.div variants={heroVariant} initial="hidden" animate="visible" className="relative overflow-hidden rounded-3xl shadow-2xl shadow-green-500/20 dark:shadow-green-500/10">
        {/* WhatsApp-style gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] dark:from-[#054D44] dark:via-[#0E7A6E] dark:to-[#1FB556]" />
        {/* Mesh gradient overlay */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-gradient-to-br from-white/30 to-transparent rounded-full blur-3xl animate-drift-a" />
          <div className="absolute -bottom-10 -left-10 w-[400px] h-[400px] bg-gradient-to-tr from-[#25D366]/30 to-transparent rounded-full blur-3xl animate-drift-b" />
        </div>
        {/* Chat bubble pattern */}
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        {/* Top shimmer line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#25D366] via-[#128C7E] to-[#25D366] animate-shimmer" style={{ backgroundSize: '200% 100%' }} />

        <div className="relative z-10 p-6 md:p-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4 md:gap-6">
              {/* WhatsApp-style logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-2xl border-4 border-white/20 animate-bounce-y-sm">
                <MessageCircle className="text-white" size={40} />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                  قسم الرسائل
                </h1>
                <p className="text-white/80 text-sm md:text-base mt-1">
                  إرسال رسائل واتساب احترافية للمرضى
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge className="bg-white/20 text-white border-white/30 text-xs backdrop-blur-sm">
                    <Phone size={10} className="ml-1" /> واتساب
                  </Badge>
                  {isDoctor && <Badge className="bg-[#25D366]/30 text-[#25D366] border-[#25D366]/30 text-xs backdrop-blur-sm">
                    <Shield size={10} className="ml-1" /> طبيب
                  </Badge>}
                </div>
              </div>
            </div>
            {/* Quick stats */}
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
              <Users size={18} className="text-white" />
              <span className="text-white font-bold text-lg">{patientsWithPhone.length}</span>
              <span className="text-white/70 text-xs">رقم هاتف</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ═══ SUB-TABS ═══ */}
      <div className="flex gap-2">
        {[
          { id: 'compose', label: 'رسالة جديدة', emoji: '✍️', icon: <Send size={16} /> },
          { id: 'contacts', label: 'جهات الاتصال', emoji: '👥', icon: <Users size={16} /> },
          { id: 'history', label: 'سجل الإرسال', emoji: '📋', icon: <FileText size={16} /> },
        ].map(tab => (
          <motion.button key={tab.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
            onClick={() => setMsgSubTab(tab.id as any)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all shadow-md',
              msgSubTab === tab.id
                ? 'bg-gradient-to-br from-[#075E54] to-[#128C7E] text-white shadow-lg shadow-green-500/20'
                : 'bg-white dark:bg-gray-900 text-muted-foreground border border-border/50 hover:border-[#128C7E]/30'
            )}
          >
            <span className="text-lg">{tab.emoji}</span>
            {tab.label}
          </motion.button>
        ))}
      </div>

      {/* ═══ STATS ROW ═══ */}
      <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-3 gap-3">
        {statsCards.map((s, i) => (
          <motion.div key={i} variants={staggerItem} whileHover={{ scale: 1.03, y: -2 }}
            className={cn('relative overflow-hidden rounded-2xl p-4 text-white shadow-lg bg-gradient-to-br', s.gradient)}>
            <div className="absolute top-0 left-0 w-20 h-20 bg-white/[0.06] rounded-full -translate-x-1/3 -translate-y-1/3" />
            <div className="relative z-10">
              <span className="text-2xl">{s.emoji}</span>
              <p className="text-xl font-black mt-1">{s.value}</p>
              <p className="text-xs text-white/70">{s.label}</p>
              <p className="text-[9px] text-white/40 mt-0.5">{s.sub}</p>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ COMPOSE TAB ═══ */}
      <AnimatePresence mode="wait">
        {msgSubTab === 'compose' && (
          <motion.div key="compose" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-5">

            {/* ─── Message Templates ──────────────────────────────── */}
            <Card className="border-2 border-[#128C7E]/40 dark:border-[#128C7E]/30 overflow-hidden shadow-lg shadow-green-500/5">
              <div className="h-1.5 bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles size={18} className="text-[#128C7E]" />
                  قوالب الرسائل
                </CardTitle>
                <CardDescription className="text-sm">اختر قالب أو اكتب رسالة مخصصة</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Category tabs */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                  {Object.entries(templateCategories).map(([cat]) => (
                    <button key={cat} onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap',
                        selectedCategory === cat
                          ? 'bg-[#128C7E] text-white border-[#128C7E]'
                          : 'bg-muted/30 text-muted-foreground border-border/50 hover:border-[#128C7E]/30'
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
                {/* Template cards */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5 mb-4">
                  {BROADCAST_TEMPLATES
                    .filter(t => !selectedCategory || t.category === selectedCategory)
                    .map(t => (
                      <motion.button key={t.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                        onClick={() => setBroadcastMessage(t.message)}
                        className={cn(
                          'flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-xs font-bold',
                          broadcastMessage === t.message
                            ? 'bg-[#128C7E]/10 dark:bg-[#128C7E]/20 border-[#128C7E] text-[#075E54] dark:text-[#25D366] shadow-md'
                            : 'bg-white/60 dark:bg-gray-800/60 border-border text-muted-foreground hover:border-[#128C7E]/30 hover:text-[#075E54]'
                        )}
                      >
                        <span className="text-xl">{t.emoji}</span>
                        <span>{t.label}</span>
                        {broadcastMessage === t.message && <CheckCircle size={12} className="text-[#128C7E]" />}
                      </motion.button>
                    ))
                  }
                </div>

                {/* Message editor */}
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-[#075E54] dark:text-[#25D366] flex items-center gap-2">
                    <Send size={14} /> نص الرسالة
                  </Label>
                  <Textarea
                    value={broadcastMessage}
                    onChange={e => setBroadcastMessage(e.target.value)}
                    placeholder="اكتب رسالتك هنا... استخدم {name} لاسم المريض و {phone} لرقمه..."
                    className="rounded-2xl min-h-[120px] border-2 border-[#128C7E]/30 dark:border-[#128C7E]/20 focus:border-[#128C7E] bg-white dark:bg-black/20 text-sm resize-y"
                  />
                  {/* Variable hints */}
                  <div className="flex gap-2">
                    {[
                      { var: '{name}', desc: 'اسم المريض', emoji: '👤' },
                      { var: '{phone}', desc: 'رقم المريض', emoji: '📱' },
                    ].map(v => (
                      <button key={v.var} onClick={() => setBroadcastMessage(broadcastMessage + ' ' + v.var)}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#128C7E]/10 dark:bg-[#128C7E]/20 border border-[#128C7E]/30 text-xs font-bold text-[#075E54] dark:text-[#25D366] hover:bg-[#128C7E]/20 transition-all"
                      >
                        <span>{v.emoji}</span>
                        <code className="text-[10px]">{v.var}</code>
                        <span className="text-muted-foreground">{v.desc}</span>
                      </button>
                    ))}
                  </div>
                  {broadcastMessage.includes('{name}') && (
                    <p className="text-[10px] text-[#128C7E] font-bold">
                      ✨ {'{name}'} سيتم استبداله باسم كل مريض تلقائياً عند الإرسال
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* ─── Target Selection ──────────────────────────────── */}
            <Card className="border-2 border-amber-300/40 dark:border-amber-700/30 overflow-hidden shadow-lg shadow-amber-500/5">
              <div className="h-1.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Target size={18} className="text-amber-500" />
                    تحديد المستهدفين
                  </CardTitle>
                  <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-300/50 dark:border-amber-700/50">
                    {filteredBroadcastPatients.length} مستهدف
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                {/* Search */}
                <div className="relative mb-4">
                  <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="بحث بالاسم أو رقم الهاتف..."
                    className="rounded-xl pr-9 h-10 border-2 border-amber-200/50 dark:border-amber-700/30 focus:border-amber-400"
                  />
                </div>

                {/* Filter presets */}
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {FILTER_PRESETS.map(f => {
                    let count = patientsWithPhone.length
                    if (f.id === 'starred') count = patientsWithPhone.filter(p => p.starred).length
                    else if (f.id === 'today') count = patientsWithPhone.filter(p => visits.some(v => v.patientId === p.id && getLocalDateStr(v.date) === todayStr)).length
                    else if (f.id === 'recent7') { const c = new Date(); c.setDate(c.getDate() - 7); count = patientsWithPhone.filter(p => p.createdAt && new Date(p.createdAt) >= c).length }
                    else if (f.id === 'recent30') { const c = new Date(); c.setDate(c.getDate() - 30); count = patientsWithPhone.filter(p => p.createdAt && new Date(p.createdAt) >= c).length }
                    else if (f.id === 'laser') count = patientsWithPhone.filter(p => laserRecords.some(r => r.patientId === p.id)).length
                    else if (f.id === 'unpaid') count = patientsWithPhone.filter(p => sessions.some(s => s.patientId === p.id && !s.paid)).length
                    else if (f.id === 'noVisits') count = patientsWithPhone.filter(p => !visits.some(v => v.patientId === p.id)).length
                    return (
                      <motion.button key={f.id} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setBroadcastFilter(f.id as any); setBroadcastSelectedIds([]) }}
                        className={cn(
                          'flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 transition-all text-xs font-bold',
                          broadcastFilter === f.id && broadcastSelectedIds.length === 0
                            ? 'bg-amber-100 dark:bg-amber-900/20 border-amber-400 text-amber-700 dark:text-amber-300 shadow-md'
                            : 'bg-white/60 dark:bg-gray-800/60 border-border text-muted-foreground hover:border-amber-300'
                        )}
                      >
                        <span className="text-lg">{f.emoji}</span>
                        <span>{f.label}</span>
                        <span className="text-[9px] text-muted-foreground font-bold">{count}</span>
                      </motion.button>
                    )
                  })}
                </div>

                {/* Manual patient selection */}
                <Separator className="my-3" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold text-muted-foreground flex items-center gap-1">
                      <CheckCircle size={12} className="text-[#128C7E]" />
                      اختيار يدوي ({broadcastSelectedIds.length} مريض)
                    </p>
                    {broadcastSelectedIds.length > 0 && (
                      <Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setBroadcastSelectedIds([])}>
                        إلغاء الاختيار
                      </Button>
                    )}
                  </div>
                  <div className="max-h-36 overflow-y-auto space-y-1.5">
                    {(searchQuery ? filteredBroadcastPatients : patientsWithPhone).slice(0, 50).map(p => (
                      <motion.button key={p.id} whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setBroadcastFilter('all')
                          setBroadcastSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id])
                        }}
                        className={cn(
                          'w-full flex items-center gap-2.5 p-2 rounded-xl transition-all text-xs',
                          broadcastSelectedIds.includes(p.id)
                            ? 'bg-[#128C7E]/10 dark:bg-[#128C7E]/20 border border-[#128C7E]/30'
                            : 'bg-muted/20 hover:bg-muted/40 border border-transparent'
                        )}
                      >
                        <div className={cn(
                          'w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all',
                          broadcastSelectedIds.includes(p.id)
                            ? 'bg-[#128C7E] border-[#075E54] text-white'
                            : 'border-muted-foreground/30'
                        )}>
                          {broadcastSelectedIds.includes(p.id) && <CheckCircle size={10} />}
                        </div>
                        <Avatar className="w-7 h-7">
                          <AvatarFallback className={cn('text-xs font-bold', p.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400')}>
                            {p.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold truncate flex-1">{p.name}</span>
                        <div className="flex items-center gap-1.5">
                          {p.starred && <Star size={10} className="text-amber-500 fill-amber-500" />}
                          <span dir="ltr" className="text-muted-foreground">{p.phone}</span>
                        </div>
                      </motion.button>
                    ))}
                    {(searchQuery ? filteredBroadcastPatients : patientsWithPhone).length > 50 && (
                      <p className="text-center text-[10px] text-muted-foreground">
                        و {(searchQuery ? filteredBroadcastPatients : patientsWithPhone).length - 50} مريض آخر...
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* ─── Preview & Send ────────────────────────────────── */}
            <Card className="border-2 border-[#128C7E]/40 dark:border-[#128C7E]/30 overflow-hidden shadow-lg shadow-green-500/5">
              <div className="h-1.5 bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]" />
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Eye size={18} className="text-[#128C7E]" />
                  معاينة وإرسال
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredBroadcastPatients.length > 0 && broadcastMessage.trim() ? (
                  <div className="space-y-4">
                    {/* WhatsApp-style preview bubble */}
                    <div className="relative">
                      <div className="rounded-2xl bg-[#DCF8C6] dark:bg-[#128C7E]/20 p-4 border border-[#128C7E]/20 max-w-[85%] ml-auto shadow-md">
                        {/* Message preview */}
                        {(() => {
                          const firstP = filteredBroadcastPatients[0]
                          const previewMsg = broadcastMessage.replace(/\{name\}/g, firstP.name).replace(/\{phone\}/g, firstP.phone || '')
                          return (
                            <>
                              <p className="text-[10px] text-[#075E54]/60 dark:text-[#25D366]/60 font-bold mb-1">
                                معاينة (لـ {firstP.name})
                              </p>
                              <p className="text-sm whitespace-pre-wrap text-[#075E54] dark:text-[#25D366] font-medium">{previewMsg}</p>
                              <div className="flex items-center justify-end gap-1 mt-2">
                                <span className="text-[9px] text-[#075E54]/40 dark:text-[#25D366]/40">{new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', timeZone: 'Africa/Cairo', hour12: true })}</span>
                                <CheckCircle size={10} className="text-[#128C7E]" />
                              </div>
                            </>
                          )
                        })()}
                      </div>
                      {/* WhatsApp bubble tail */}
                      <div className="absolute bottom-0 left-[85%] w-4 h-4 bg-[#DCF8C6] dark:bg-[#128C7E]/20 border-r-2 border-b-2 border-[#128C7E]/20 rotate-[225deg] translate-x-2 -translate-y-0.5 rounded-bl-sm" />
                    </div>

                    {/* Send info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/20 rounded-xl p-3">
                      <span className="flex items-center gap-1"><Users size={12} /> {filteredBroadcastPatients.length} مريض</span>
                      <span className="flex items-center gap-1"><Clock size={12} /> ~{Math.ceil(filteredBroadcastPatients.length * 1.5 / 60)} دقيقة</span>
                      <span className="flex items-center gap-1"><Phone size={12} /> واتساب</span>
                    </div>

                    {/* Progress bar */}
                    {broadcastSending && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-[#128C7E]">جاري الإرسال...</span>
                          <span className="text-muted-foreground">{broadcastProgress.sent}/{broadcastProgress.total}</span>
                        </div>
                        <Progress value={(broadcastProgress.sent / broadcastProgress.total) * 100}
                          className="h-3 [&>div]:bg-gradient-to-r [&>div]:from-[#075E54] [&>div]:via-[#128C7E] [&>div]:to-[#25D366]" />
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        onClick={sendBroadcast}
                        disabled={broadcastSending || !broadcastMessage.trim() || filteredBroadcastPatients.length === 0}
                        className={cn(
                          'flex items-center justify-center gap-2 p-4 rounded-2xl text-sm font-bold transition-all shadow-lg',
                          broadcastSending
                            ? 'bg-muted text-muted-foreground cursor-wait'
                            : !broadcastMessage.trim() || filteredBroadcastPatients.length === 0
                              ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                              : 'bg-gradient-to-br from-[#075E54] via-[#128C7E] to-[#25D366] text-white hover:shadow-xl shadow-green-500/20'
                        )}
                      >
                        <Send size={18} />
                        {broadcastSending ? `إرسال... (${broadcastProgress.sent}/${broadcastProgress.total})` : 'إرسال واتساب'}
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.95 }}
                        onClick={copyBroadcastInfo}
                        disabled={!broadcastMessage.trim() || filteredBroadcastPatients.length === 0}
                        className={cn(
                          'flex items-center justify-center gap-2 p-4 rounded-2xl text-sm font-bold transition-all shadow-lg',
                          !broadcastMessage.trim() || filteredBroadcastPatients.length === 0
                            ? 'bg-muted/50 text-muted-foreground cursor-not-allowed'
                            : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl shadow-blue-500/20'
                        )}
                      >
                        <Copy size={18} /> نسخ البيانات
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3 py-8">
                    <MessageCircle size={40} className="text-muted-foreground/30" />
                    <p className="text-muted-foreground text-sm">
                      {!broadcastMessage.trim() ? 'اكتب رسالتك أولاً' : 'لا يوجد مرضى بأرقام هاتف في هذا الفلتر'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* ─── Tips Card ──────────────────────────────────────── */}
            <Card className="border-2 border-dashed border-blue-200/60 dark:border-blue-700/30 bg-blue-50/30 dark:bg-blue-950/10">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                    <Sparkle size={16} />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">نصائح للإرسال الجماعي</p>
                    <ul className="text-[10px] text-muted-foreground space-y-1">
                      <li>• سيتم فتح واتساب لكل مريض تلقائياً كل 1.5 ثانية — تأكد من إرسال الرسالة في كل نافذة</li>
                      <li>• استخدم {'{name}'} لإضافة اسم المريض شخصياً في الرسالة</li>
                      <li>• استخدم {'{phone}'} لإضافة رقم هاتف المريض</li>
                      <li>• اختر "نسخ البيانات" لنسخ الأرقام والرسالة معاً</li>
                      <li>• يمكن الإرسال لمرضى محددين عبر الاختيار اليدوي</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* ═══ CONTACTS TAB ═══ */}
        {msgSubTab === 'contacts' && (
          <motion.div key="contacts" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو رقم الهاتف..."
                className="rounded-xl pr-9 h-11 border-2 border-[#128C7E]/30 focus:border-[#128C7E]"
              />
            </div>

            {/* Contact cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {(searchQuery ? patientsWithPhone.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.phone?.includes(searchQuery)) : patientsWithPhone).slice(0, 40).map(p => {
                const pVisits = visits.filter(v => v.patientId === p.id).length
                const pSessions = sessions.filter(s => s.patientId === p.id).length
                const pUnpaid = sessions.filter(s => s.patientId === p.id && !s.paid).length
                const hasLaser = laserRecords.some(r => r.patientId === p.id)
                return (
                  <motion.div key={p.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-white dark:bg-gray-900 border border-border/50 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className={cn('text-sm font-bold', p.gender === 'male' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400')}>
                        {p.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-bold truncate">{p.name}</p>
                        {p.starred && <Star size={10} className="text-amber-500 fill-amber-500" />}
                        {hasLaser && <Zap size={10} className="text-cyan-500" />}
                      </div>
                      <p className="text-xs text-muted-foreground" dir="ltr">{p.phone}</p>
                      <div className="flex gap-1 mt-1">
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[8px] border-0">{pVisits} زيارة</Badge>
                        {pSessions > 0 && <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400 text-[8px] border-0">{pSessions} جلسة</Badge>}
                        {pUnpaid > 0 && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[8px] border-0">{pUnpaid} غير مدفوع</Badge>}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => sendToPatient(p, broadcastMessage || 'مرحباً {name}، عيادة المغازي 🏥')}
                        className="p-2 rounded-xl bg-[#128C7E] text-white shadow-md hover:shadow-lg transition-shadow"
                        title="إرسال واتساب"
                      >
                        <Send size={14} />
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                        onClick={() => callPatient(p)}
                        className="p-2 rounded-xl bg-blue-500 text-white shadow-md hover:shadow-lg transition-shadow"
                        title="اتصال"
                      >
                        <PhoneCall size={14} />
                      </motion.button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ═══ HISTORY TAB ═══ */}
        {msgSubTab === 'history' && (
          <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            <Card className="border-2 border-[#128C7E]/40 dark:border-[#128C7E]/30 shadow-lg shadow-green-500/5 overflow-hidden">
              <div className="h-1.5 bg-gradient-to-r from-[#075E54] via-[#128C7E] to-[#25D366]" />
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText size={18} className="text-[#128C7E]" />
                  سجل الإرسال
                </CardTitle>
                <CardDescription className="text-sm">سجل رسائل واتساب المرسلة للمرضى</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Recent activity-based history */}
                <div className="space-y-3">
                  {visits.slice(0, 10).filter(v => {
                    const p = patients.find(pp => pp.id === v.patientId)
                    return p?.phone && waPhone(p.phone)
                  }).map(v => {
                    const p = patients.find(pp => pp.id === v.patientId)
                    if (!p) return null
                    return (
                      <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/20 border border-border/30">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="text-xs font-bold bg-[#128C7E]/10 text-[#075E54] dark:bg-[#128C7E]/20 dark:text-[#25D366]">
                            {p.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold truncate">{p.name}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {v.type === 'checkup' ? 'كشف' : 'إعادة'} — {formatDate(v.date)}
                          </p>
                        </div>
                        <div className="flex gap-1.5">
                          <button onClick={() => sendToPatient(p, 'مرحباً {name}، نود تذكيرك بموعدك في عيادة المغازي 🏥')}
                            className="p-1.5 rounded-lg bg-[#128C7E] text-white text-xs" title="تذكير واتساب">
                            <Send size={12} />
                          </button>
                          <button onClick={() => sendToPatient(p, 'مرحباً {name}، كيف حالك؟ نود متابعة حالتك 🩺')}
                            className="p-1.5 rounded-lg bg-amber-500 text-white text-xs" title="متابعة واتساب">
                            <RefreshCw size={12} />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Quick actions from history */}
                <div className="mt-4 p-3 rounded-xl bg-[#128C7E]/5 dark:bg-[#128C7E]/10 border border-[#128C7E]/20">
                  <p className="text-xs font-bold text-[#075E54] dark:text-[#25D366] flex items-center gap-1 mb-2">
                    <Sparkles size={12} /> إرسال سريع لمرضى اليوم
                  </p>
                  <div className="flex gap-2">
                    {[
                      { label: 'تذكير موعد', msg: 'مرحباً {name}، نود تذكيرك بموعدك في عيادة المغازي 🏥', color: 'from-[#075E54] to-[#128C7E]' },
                      { label: 'متابعة', msg: 'مرحباً {name}، كيف حالك؟ نود متابعة حالتك 🩺', color: 'from-amber-500 to-orange-600' },
                      { label: 'شكر', msg: 'مرحباً {name}، شكراً لزيارتك عيادة المغازي 💚', color: 'from-emerald-500 to-teal-600' },
                    ].map(a => (
                      <motion.button key={a.label} whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                        onClick={() => { setBroadcastMessage(a.msg); setMsgSubTab('compose'); setBroadcastFilter('today') }}
                        className={cn('px-3 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r shadow-md', a.color)}
                      >
                        {a.label}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ─── Export with memo for performance ────────────────────────────
export default memo(MessageSectionInner)
