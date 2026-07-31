'use client'

import { useMemo } from 'react'
import { useAuthStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useLaserFormStore, usePatientFormStore } from '@/store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { LaserRecord, LaserSession, LaserPackage, LaserSetting, Session, Service, Transaction, Patient } from '@/lib/types'
import { apiFetch, getLocalDateStr, cairoISO, cairoDateTime, BODY_AREAS, SKIN_TYPES, HAIR_COLORS, waPhone, normalizePhone } from '@/lib/helpers'
import { addItem, deleteItem } from '@/lib/crud-helpers'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import {
  Activity, AlertTriangle, Bell, Calendar, CheckCircle, ChevronDown, Clock, DollarSign,
  Edit3, FileText, Hash, Heart, Lock, MapPin, Phone, Plus, Receipt, Send, Shield,
  Sparkles, Star, Stethoscope, StickyNote, ThumbsUp, Timer, Trash2, Zap, X,
  Package, Settings, Wand2, Scissors, Users, Search, Eye, Wallet
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { Progress } from '@/components/ui/progress'

// ─── LaserCenter Component (self-contained) ──────────────────────────────────
export default function LaserCenter() {
  // ─── Stores ────────────────────────────────────────────────────
  const { userRole } = useAuthStore()
  const { patients, setPatients, visits, sessions, setSessions, services, laserRecords, setLaserRecords, laserPackages, setLaserPackages, laserSettings, transactions, setTransactions, notes, setNotes, doctors } = useDataStore()
  const { laserSubTab, setLaserSubTab, laserDetailTab, setLaserDetailTab, selectedLaserRecordId, setSelectedLaserRecordId, showAddLaserRecord, setShowAddLaserRecord, showAddLaserPackage, setShowAddLaserPackage, showAddLaserSessionForm, setShowAddLaserSessionForm, deleteLaserRecordConfirmId, setDeleteLaserRecordConfirmId, deleteLaserSessionConfirmId, setDeleteLaserSessionConfirmId } = useUIStore()
  const {
    laserFormArea, setLaserFormArea, laserFormSkinType, setLaserFormSkinType,
    laserFormHairColor, setLaserFormHairColor, laserFormHairDensity, setLaserFormHairDensity,
    laserFormSessions, setLaserFormSessions, laserFormNotes, setLaserFormNotes,
    laserFormPatientId, setLaserFormPatientId, laserFormPatientSearch, setLaserFormPatientSearch,
    laserFormPrice, setLaserFormPrice, laserFormPaid, setLaserFormPaid,
    laserFormMachine, setLaserFormMachine, laserFormEnergy, setLaserFormEnergy,
    laserFormPulse, setLaserFormPulse, laserFormDoctorId, setLaserFormDoctorId,
    editingLaserSessionId, setEditingLaserSessionId,
    editLaserSessionForm, setEditLaserSessionForm,
    newLaserSessionForm, setNewLaserSessionForm,
    editingLaserRecordId, setEditingLaserRecordId,
    editLaserRecordForm, setEditLaserRecordForm,
    laserFinancePatientId, setLaserFinancePatientId,
    laserFinancePrice, setLaserFinancePrice,
    laserFinanceNotes, setLaserFinanceNotes,
    treatmentTemplates, resetLaserForm
  } = useLaserFormStore()
  const { editingNoteId, setEditingNoteId, editingNoteContent, setEditingNoteContent } = usePatientFormStore()

  // ─── Role-based access ─────────────────────────────────────────
  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor


  const markSessionPaid = async (s: Session) => {
    try {
      await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) })
      const patientName = patients.find(p => p.id === s.patientId)?.name || 'مريض'
      const svc = services.find(sv => sv.id === s.serviceId)
      const category = s.notes?.includes('ليزر') ? 'ليزر' : 'جلسات'
      const description = `${svc?.name || (category === 'ليزر' ? 'جلسة ليزر' : 'جلسة')} - ${patientName}`
      const txnDate = s.date || cairoISO()
      try {
        const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category, amount: s.price, description, date: txnDate }) })
        const newTxn = txnRes?.transaction || txnRes?.data || txnRes
        if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]) }
        else { setTransactions(prev => [...prev, { id: 'sp-' + Date.now(), type: 'income', category, amount: s.price, description, date: txnDate }]) }
      } catch { setTransactions(prev => [...prev, { id: 'sp-' + Date.now(), type: 'income', category, amount: s.price, description, date: txnDate }]) }
      setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss))
      toast.success('تم الدفع ✅')
    } catch { toast.error('خطأ') }
  }

  // ─── useMemo: Laser Data ──────────────────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [sessions.length, transactions.length])

  const laserPatientSuggestions = useMemo(() => {
    if (!laserFormPatientSearch) return []
    const q = laserFormPatientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [laserFormPatientSearch, patients])

  const laserHairSessions = useMemo(() => sessions.filter(s => {
    try {
      const svc = services.find(sv => sv.id === s.serviceId)
      if (svc?.category?.includes('ليزر')) return true
      if (s.notes?.startsWith('ليزر')) return true
      return false
    } catch { return false }
  }), [sessions, services])

  const laserRevenue = useMemo(() => transactions.filter(t => t.type === 'income' && t.category === 'ليزر').reduce((s, t) => s + (t.amount || 0), 0), [transactions])

  const laserProgressData = useMemo(() => {
    return laserRecords.filter(r => r.status === 'active').map(r => {
      const patient = patients.find(p => p.id === r.patientId)
      const completedSessions = (r as any)?.laserSessions?.length || (r as any)?._count?.laserSessions || 0
      const progress = r.totalSessions > 0 ? (completedSessions / r.totalSessions) * 100 : 0
      const areaLabel = BODY_AREAS.find(a => a.id === r.bodyArea)?.label || r.bodyArea
      return { record: r, patient, completedSessions, totalSessions: r.totalSessions, progress, areaLabel }
    }).sort((a, b) => b.progress - a.progress)
  }, [laserRecords, patients])

  const laserRevenueByArea = useMemo(() => {
    const areaMap: Record<string, number> = {}
    laserRecords.forEach(r => {
      const area = r.bodyArea || 'غير محدد'
      const paid = (r.laserSessions || []).filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
      areaMap[area] = (areaMap[area] || 0) + paid
    })
    return Object.entries(areaMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [laserRecords])

  const laserRevenueByPackage = useMemo(() => {
    const pkgMap: Record<string, number> = {}
    laserPackages.forEach(pkg => {
      const matchingRecords = laserRecords.filter(r => r.bodyArea === pkg.bodyArea || r.bodyArea === pkg.name)
      const paid = matchingRecords.flatMap(r => (r.laserSessions || []).filter(s => s.paid)).reduce((sum, s) => sum + (s.price || 0), 0)
      if (paid > 0) pkgMap[pkg.name] = paid
    })
    return Object.entries(pkgMap).map(([name, value]) => ({ name, value })).filter(d => d.value > 0)
  }, [laserRecords, laserPackages])

  // ─── Render ────────────────────────────────────────────────────
  // activeTab guard is handled by parent page.tsx conditional rendering

  return (
    <>
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-cyan-50 dark:bg-cyan-950/30">
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-3"><div className="text-4xl animate-pulse-scale-lg">💎</div><div><h1 className="text-2xl font-bold">مركز الليزر</h1><p className="text-muted-foreground text-sm">إدارة شاملة لليزر إزالة الشعر</p></div></div>
                    <div className="flex gap-2">
                      {isDoctor && <Button className="btn-luxury bg-gradient-to-l from-cyan-600 to-cyan-700 text-white shadow-lg" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> سجل جديد</Button>}
                      {isDoctor && <Button variant="outline" className="rounded-xl" onClick={() => setShowAddLaserPackage(true)}><Package size={14} className="ml-1" /> باقة</Button>}
                    </div>
                  </div>
                </div>

                {/* Laser Stats - 4 cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 shadow-lg"><Activity className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">سجلات نشطة</p><p className="text-xl font-bold">{laserRecords.filter(r => r.status === 'active').length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500 to-violet-700 shadow-lg"><Zap className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">جلسات اليوم</p><p className="text-xl font-bold">{laserHairSessions.filter(s => getLocalDateStr(s.date) === todayStr).length}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 shadow-lg"><DollarSign className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">إيراد الليزر</p><p className="text-xl font-bold">{formatCurrency(laserRevenue)}</p></div></div></motion.div>
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="section-card p-3"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-lg"><Package className="text-white" size={18} /></div><div><p className="text-[10px] text-muted-foreground">باقات نشطة</p><p className="text-xl font-bold">{laserPackages.filter(p => p.active).length}</p></div></div></motion.div>
                </div>

                {/* ═══ Laser Sub-section Navigation ═══ */}
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {[
                    { id: 'records', icon: '📋', label: 'السجلات', color: 'from-cyan-500 to-cyan-700', count: laserRecords.length },
                    { id: 'sessions', icon: '⚡', label: 'الجلسات', color: 'from-violet-500 to-violet-700', count: laserHairSessions.length },
                    { id: 'packages', icon: '📦', label: 'الباقات', color: 'from-amber-500 to-amber-700', count: laserPackages.length },
                    { id: 'bodymap', icon: '🗺️', label: 'المناطق', color: 'from-emerald-500 to-emerald-700', count: BODY_AREAS.length },
                    { id: 'finance', icon: '💰', label: 'المالي', color: 'from-green-500 to-green-700', count: 0 },
                    { id: 'settings', icon: '⚙️', label: 'الأجهزة', color: 'from-slate-500 to-slate-700', count: laserSettings.length },
                  ].map(tab => (
 <button className="active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150" key={tab.id}
                      onClick={() => setLaserSubTab(tab.id)}
                      className={cn(
                        'flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all text-white shadow-lg',
                        laserSubTab === tab.id
                          ? `bg-gradient-to-br ${tab.color} border-white/30 scale-105 shadow-xl`
                          : 'bg-muted/50 border-border text-muted-foreground hover:bg-muted'
                      )}
                    >
                      <span className="text-xl">{tab.icon}</span>
                      <span className="text-[10px] font-bold">{tab.label}</span>
                      {tab.count > 0 && <Badge className={cn('text-[8px] px-1 py-0', laserSubTab === tab.id ? 'bg-white/20 text-white' : 'bg-muted text-muted-foreground')}>{tab.count}</Badge>}
                    </button>
                  ))}
                </div>

                {/* ═══ Laser Records - COMPREHENSIVE PATIENT FILE SYSTEM ═══ */}
                {laserSubTab === 'records' && (<div className="space-y-3 mt-4">
                    {/* ─── Detail View for Selected Laser Record ─── */}
                    {selectedLaserRecordId ? (() => {
                      const rec = laserRecords.find(r => r.id === selectedLaserRecordId)
                      if (!rec) return <Card className="card-luxury p-8 text-center"><p className="text-muted-foreground">لم يتم العثور على السجل</p><Button className="mt-3" onClick={() => setSelectedLaserRecordId(null)}>رجوع</Button></Card>
                      const pat = rec.patient || patients.find(pt => pt.id === rec.patientId)
                      const areaInfo = BODY_AREAS.find(a => a.id === rec.bodyArea || a.label === rec.bodyArea)
                      const laserSess = (rec.laserSessions || []).sort((a, b) => (b.sessionNumber || 0) - (a.sessionNumber || 0))
                      const sessCount = laserSess.length || rec._count?.laserSessions || 0
                      const progressPct = rec.totalSessions > 0 ? Math.min((sessCount / rec.totalSessions) * 100, 100) : 0
                      const remainingSessions = Math.max(rec.totalSessions - sessCount, 0)
                      // Calculate payments from actual laser sessions
                      const totalPaidFromSessions = laserSess.filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      const totalUnpaidFromSessions = laserSess.filter(s => !s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      const grandTotal = rec.totalPrice || (rec.price * rec.totalSessions)
                      const totalPaid = rec.paid ? grandTotal : totalPaidFromSessions
                      const totalRemaining = rec.paid ? 0 : Math.max(grandTotal - totalPaid, 0)
                      const isEditingRecord = editingLaserRecordId === rec.id
                      const skinInfo = SKIN_TYPES.find(s => s.id === rec.skinType)
                      const hairInfo = HAIR_COLORS.find(h => h.id === rec.hairColor)

                      return (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                          {/* ─── Animated Header ─── */}
                          <motion.div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-600 via-teal-600 to-emerald-700 p-5 shadow-xl">
                            <div className="absolute inset-0 opacity-15">
                              <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-drift-a"/>
                              <div className="absolute bottom-0 left-0 w-36 h-36 bg-cyan-300/20 rounded-full blur-3xl animate-drift-a"/>
                            </div>
                            <div className="relative z-10">
                              <div className="flex items-center justify-between mb-3">
 <button onClick={() => { setSelectedLaserRecordId(null); setLaserDetailTab('overview') }} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-sm font-bold border border-white/20 hover:bg-white/25 transition-all active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">
                                  <ChevronDown size={16} className="rotate-90" /> رجوع
                                </button>
                                <div className="flex gap-2">
 <button onClick={() => { setEditingLaserRecordId(isEditingRecord ? null : rec.id); setEditLaserRecordForm({ bodyArea: rec.bodyArea, skinType: rec.skinType || '', hairColor: rec.hairColor || '', hairDensity: rec.hairDensity || '', totalSessions: String(rec.totalSessions), price: String(rec.price), totalPrice: String(rec.totalPrice), paid: rec.paid, machineName: rec.machineName || '', energy: String(rec.energy || ''), pulse: rec.pulse || '', status: rec.status, notes: rec.notes || '' }) }} className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-bold border border-white/20 hover:bg-white/25 transition-all flex items-center gap-1.5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">
                                    {isEditingRecord ? <><X size={12} /> إلغاء</> : <><Edit3 size={12} /> تعديل</>}
                                  </button>
 <button onClick={() => { setShowAddLaserSessionForm(true); setNewLaserSessionForm({ energy: String(rec.energy || ''), pulse: rec.pulse || '', painLevel: '', reaction: '', notes: '', date: getLocalDateStr() }) }} className="px-3 py-1.5 rounded-xl bg-white/15 backdrop-blur-sm text-white text-xs font-bold border border-white/20 hover:bg-white/25 transition-all flex items-center gap-1.5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">
                                    <Plus size={12} /> جلسة جديدة
                                  </button>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-5xl animate-pulse-scale">💎</div>
                                <div className="flex-1">
                                  <h2 className="text-2xl font-black text-white">{pat?.name || 'مريض'}</h2>
                                  <div className="flex items-center gap-3 mt-1 flex-wrap">
                                    {pat?.fileNumber && <Badge className="bg-white/20 text-white border-white/30 text-xs">#{pat.fileNumber}</Badge>}
                                    <Badge className={cn('text-xs', rec.status === 'active' ? 'bg-emerald-400/80 text-white' : rec.status === 'completed' ? 'bg-blue-400/80 text-white' : 'bg-amber-400/80 text-white')}>{rec.status === 'active' ? '🟢 نشط' : rec.status === 'completed' ? '🔵 مكتمل' : rec.status === 'paused' ? '⏸️ متوقف' : rec.status}</Badge>
                                    <Badge className="bg-white/20 text-white border-white/30 text-xs">{areaInfo?.label || rec.bodyArea}</Badge>
                                    {rec.machineName && <Badge className="bg-white/20 text-white border-white/30 text-xs">⚙️ {rec.machineName}</Badge>}
                                  </div>
                                </div>
                                <div className="text-left">
                                  <div className="text-4xl font-black text-white animate-pulse-scale">{Math.round(progressPct)}%</div>
                                  <p className="text-cyan-200 text-[10px]">{sessCount} من {rec.totalSessions} جلسة</p>
                                </div>
                              </div>
                              <div className="mt-3"><Progress value={progressPct} className="h-3 bg-white/20 [&>div]:bg-gradient-to-l [&>div]:from-white [&>div]:to-cyan-200 rounded-full" /></div>
                            </div>
                          </motion.div>

                          {/* ─── Quick Stats ─── */}
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { icon: <Zap size={16} />, label: 'الجلسات المتبقية', value: remainingSessions, gradient: 'from-violet-500 to-purple-600', emoji: '⚡' },
                              { icon: <DollarSign size={16} />, label: 'المدفوع', value: formatCurrency(totalPaid), gradient: 'from-emerald-500 to-teal-600', emoji: '✅' },
                              { icon: <Receipt size={16} />, label: 'المتبقي', value: formatCurrency(totalRemaining), gradient: 'from-amber-500 to-orange-600', emoji: '⏳' },
                              { icon: <Package size={16} />, label: 'سعر الجلسة', value: formatCurrency(rec.price), gradient: 'from-cyan-500 to-blue-600', emoji: '💰' },
                            ].map((stat, idx) => (
                              <motion.div key={stat.label} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden">
                                <div className={cn('p-3 rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.gradient)}>
                                  <div className="absolute top-1 left-1 text-2xl opacity-15 animate-bounce-y-sm">{stat.emoji}</div>
                                  <div className="relative z-10 flex items-center gap-2.5">
                                    <div className="p-1.5 rounded-lg bg-white/20 backdrop-blur-sm">{stat.icon}</div>
                                    <div><p className="text-[9px] text-white/70">{stat.label}</p><p className="text-base font-black">{stat.value}</p></div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>

                          {/* ─── Detail Sub-tabs ─── */}
                          <div className="flex gap-2 overflow-x-auto pb-1">
                            {[
                              { id: 'overview' as const, label: 'نظرة عامة', emoji: '📋', color: 'from-cyan-500 to-teal-600' },
                              { id: 'sessions' as const, label: 'سجل الجلسات', emoji: '⚡', color: 'from-violet-500 to-purple-600' },
                              { id: 'payments' as const, label: 'المدفوعات', emoji: '💰', color: 'from-emerald-500 to-green-600' },
                              { id: 'notes' as const, label: 'ملاحظات', emoji: '📝', color: 'from-amber-500 to-orange-600' },
                            ].map(tab => (
 <button key={tab.id} onClick={() => setLaserDetailTab(tab.id)} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', laserDetailTab === tab.id ? `bg-gradient-to-l ${tab.color} text-white shadow-lg` : 'bg-muted/50 text-muted-foreground hover:bg-muted')}>
                                <span>{tab.emoji}</span> {tab.label}
                                {tab.id === 'sessions' && laserSess.length > 0 && <Badge className={cn('text-[8px] px-1', laserDetailTab === tab.id ? 'bg-white/20 text-white' : '')}>{laserSess.length}</Badge>}
                              </button>
                            ))}
                          </div>

                          {/* ─── OVERVIEW TAB ─── */}
                          {laserDetailTab === 'overview' && (<div className="space-y-4">
                            {/* Patient & Treatment Info */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                                <Card className="card-luxury overflow-hidden h-full">
                                  <div className="bg-gradient-to-l from-blue-500 to-indigo-600 p-3 flex items-center gap-2"><div className="text-xl animate-bounce-y-sm">👤</div><CardTitle className="text-sm text-white font-bold">بيانات المريض</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    {pat && <><div className="flex items-center gap-2 p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"><Users size={14} className="text-blue-500" /><div><p className="text-xs text-muted-foreground">الاسم</p><p className="font-bold text-sm">{pat.name}</p></div></div>
                                    {pat.phone && <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 dark:bg-green-900/20"><Phone size={14} className="text-green-500" /><div><p className="text-xs text-muted-foreground">الهاتف</p><p className="font-bold text-sm" dir="ltr">{pat.phone}</p></div></div>}
                                    {pat.age && <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20"><Calendar size={14} className="text-purple-500" /><div><p className="text-xs text-muted-foreground">العمر</p><p className="font-bold text-sm">{pat.age} سنة</p></div></div>}
                                    {pat.gender && <div className="flex items-center gap-2 p-2 rounded-lg bg-pink-50 dark:bg-pink-900/20"><Heart size={14} className="text-pink-500" /><div><p className="text-xs text-muted-foreground">الجنس</p><p className="font-bold text-sm">{pat.gender === 'male' ? 'ذكر' : pat.gender === 'female' ? 'أنثى' : pat.gender}</p></div></div>}</>}
                                    {pat?.phone && <motion.a href={`https://wa.me/${waPhone(pat.phone)}`} target="_blank" rel="noopener" whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.03 }} className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-gradient-to-l from-green-500 to-emerald-600 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all"><Send size={14} /> واتساب</motion.a>}
                                  </CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
                                <Card className="card-luxury overflow-hidden h-full">
                                  <div className="bg-gradient-to-l from-cyan-500 to-teal-600 p-3 flex items-center gap-2"><div className="text-xl animate-spin-slow">🔬</div><CardTitle className="text-sm text-white font-bold">بيانات العلاج</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex items-center gap-2 p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"><MapPin size={14} className="text-cyan-500" /><div><p className="text-xs text-muted-foreground">منطقة العلاج</p><p className="font-bold text-sm">{areaInfo?.label || rec.bodyArea}</p></div></div>
                                    {rec.skinType && <div className={cn('flex items-center gap-2 p-2 rounded-lg border', skinInfo?.color || 'bg-muted/50')}><ThermometerSun size={14} className="text-amber-500" /><div><p className="text-xs text-muted-foreground">نوع البشرة</p><p className="font-bold text-sm">{skinInfo?.label || rec.skinType}</p></div></div>}
                                    {rec.hairColor && <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"><div className={cn('w-4 h-4 rounded-full', hairInfo?.color || 'bg-gray-400')} /><div><p className="text-xs text-muted-foreground">لون الشعر</p><p className="font-bold text-sm">{hairInfo?.label || rec.hairColor}</p></div></div>}
                                    {rec.hairDensity && <div className="flex items-center gap-2 p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20"><Layers size={14} className="text-violet-500" /><div><p className="text-xs text-muted-foreground">كثافة الشعر</p><p className="font-bold text-sm">{rec.hairDensity === 'low' ? 'خفيف' : rec.hairDensity === 'medium' ? 'متوسط' : rec.hairDensity === 'high' ? 'كثيف' : rec.hairDensity}</p></div></div>}
                                    {rec.machineName && <div className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-900/20"><Settings size={14} className="text-slate-500" /><div><p className="text-xs text-muted-foreground">جهاز الليزر</p><p className="font-bold text-sm">{rec.machineName}</p></div></div>}
                                    {rec.energy && <div className="flex items-center gap-2 p-2 rounded-lg bg-yellow-50 dark:bg-yellow-900/20"><Zap size={14} className="text-yellow-500" /><div><p className="text-xs text-muted-foreground">الطاقة الافتراضية</p><p className="font-bold text-sm">{rec.energy} جول</p></div></div>}
                                    {rec.pulse && <div className="flex items-center gap-2 p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"><Activity size={14} className="text-indigo-500" /><div><p className="text-xs text-muted-foreground">النبض الافتراضي</p><p className="font-bold text-sm">{rec.pulse}</p></div></div>}
                                    {rec.notes && <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20"><StickyNote size={14} className="text-orange-500 mt-0.5" /><div><p className="text-xs text-muted-foreground">ملاحظات عامة</p><p className="text-sm">{rec.notes}</p></div></div>}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </div>

                            {/* Contraindications & Safety */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                              <Card className="card-luxury overflow-hidden border-2 border-red-200 dark:border-red-800/50">
                                <div className="bg-gradient-to-l from-red-500 to-rose-600 p-3 flex items-center gap-2"><div className="text-xl animate-pulse-scale-lg">⚠️</div><CardTitle className="text-sm text-white font-bold">موانع الاستخدام والاحتياطات</CardTitle></div>
                                <CardContent className="p-3">
                                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                    {['حمل', 'رضاعة', 'أدوية حساسة للضوء', 'هرمونات/كورتيزون', 'أمراض جلدية نشطة', 'تاريخ ندبات', 'كريمات ريتينول (5 أيام)', 'حساسية ضوئية', 'مرض السكري (غير منضبط)', 'وخز حديث (أسبوعين)'].map(item => (
                                      <div key={item} className="flex items-center gap-1.5 p-1.5 rounded-lg bg-red-50/50 dark:bg-red-900/10 text-[10px]"><AlertTriangle size={10} className="text-red-500 shrink-0" /><span className="text-muted-foreground">{item}</span></div>
                                    ))}
                                  </div>
                                  {pat?.medicalHistory && <div className="mt-3 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30"><p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">تاريخ طبي للمريض:</p><p className="text-xs">{pat.medicalHistory}</p></div>}
                                </CardContent>
                              </Card>
                            </motion.div>

                            {/* Patch Test & Next Session */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                                <Card className="card-luxury overflow-hidden">
                                  <div className="bg-gradient-to-l from-green-500 to-emerald-600 p-3 flex items-center gap-2"><div className="text-xl animate-pulse-scale">🧪</div><CardTitle className="text-sm text-white font-bold">اختبار البقعة (Patch Test)</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    <p className="text-xs text-muted-foreground">يُنصح بإجراء اختبار بقعة قبل أول جلسة ليزر، خاصة للمرضى الجدد أو أصحاب البشرة الحساسة. يتم اختبار منطقة صغيرة ومراقبتها لمدة 24-48 ساعة.</p>
                                    <div className="flex items-center gap-2"><Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px]">✅ مطلوب قبل الجلسة الأولى</Badge></div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                                <Card className="card-luxury overflow-hidden">
                                  <div className="bg-gradient-to-l from-indigo-500 to-blue-600 p-3 flex items-center gap-2"><div className="text-xl animate-wiggle-wide">📅</div><CardTitle className="text-sm text-white font-bold">الجلسة القادمة</CardTitle></div>
                                  <CardContent className="p-3 space-y-2">
                                    {remainingSessions > 0 ? (<>
                                      <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20"><p className="text-xs text-muted-foreground">الفترة الموصى بها بين الجلسات</p><p className="font-bold text-sm">4-6 أسابيع (حسب دورة نمو الشعر)</p></div>
                                      {rec.energy && <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">إعدادات موصى بها</p><p className="font-bold text-sm">⚡ طاقة: {rec.energy} جول | نبض: {rec.pulse || '-'}</p></div>}
                                      <p className="text-[10px] text-muted-foreground">💡 يُنصح بزيادة الطاقة تدريجياً 10-15% كل جلسة حسب تحمل المريض</p>
                                    </>) : <div className="text-center py-3"><div className="text-3xl mb-2 animate-bounce-y">🎉</div><p className="font-bold text-sm text-emerald-600">تم الانتهاء من جميع الجلسات!</p></div>}
                                  </CardContent>
                                </Card>
                              </motion.div>
                            </div>

                            {/* Edit Record Form */}
                            {isEditingRecord && (
                              <motion.div initial={{ opacity: 0, y: 20, height: 0 }} animate={{ opacity: 1, y: 0, height: 'auto' }}>
                                <Card className="card-luxury border-2 border-cyan-300 dark:border-cyan-700 overflow-hidden">
                                  <div className="bg-gradient-to-l from-cyan-500 to-teal-600 p-3 flex items-center gap-2"><Edit3 size={16} className="text-white" /><CardTitle className="text-sm text-white font-bold">تعديل بيانات السجل</CardTitle></div>
                                  <CardContent className="p-3 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      <div><Label className="text-xs font-bold">منطقة العلاج</Label><Select value={editLaserRecordForm.bodyArea} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, bodyArea: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent>{BODY_AREAS.map(a => <SelectItem key={a.id} value={a.id}>{a.label}</SelectItem>)}</SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">نوع البشرة</Label><Select value={editLaserRecordForm.skinType} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, skinType: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue placeholder="اختار..." /></SelectTrigger><SelectContent>{SKIN_TYPES.map(s => <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>)}</SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">لون الشعر</Label><Select value={editLaserRecordForm.hairColor} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, hairColor: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue placeholder="اختار..." /></SelectTrigger><SelectContent>{HAIR_COLORS.map(h => <SelectItem key={h.id} value={h.id}>{h.label}</SelectItem>)}</SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">كثافة الشعر</Label><Select value={editLaserRecordForm.hairDensity} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, hairDensity: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue placeholder="اختار..." /></SelectTrigger><SelectContent><SelectItem value="low">خفيف</SelectItem><SelectItem value="medium">متوسط</SelectItem><SelectItem value="high">كثيف</SelectItem></SelectContent></Select></div>
                                      <div><Label className="text-xs font-bold">عدد الجلسات</Label><Input type="number" value={editLaserRecordForm.totalSessions} onChange={e => setEditLaserRecordForm(p => ({ ...p, totalSessions: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">سعر الجلسة</Label><Input type="number" value={editLaserRecordForm.price} onChange={e => setEditLaserRecordForm(p => ({ ...p, price: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">الإجمالي</Label><Input type="number" value={editLaserRecordForm.totalPrice} onChange={e => setEditLaserRecordForm(p => ({ ...p, totalPrice: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">الجهاز</Label><Input value={editLaserRecordForm.machineName} onChange={e => setEditLaserRecordForm(p => ({ ...p, machineName: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">الحالة</Label><Select value={editLaserRecordForm.status} onValueChange={v => setEditLaserRecordForm(p => ({ ...p, status: v }))}><SelectTrigger className="rounded-xl h-9 text-xs mt-1"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">نشط</SelectItem><SelectItem value="completed">مكتمل</SelectItem><SelectItem value="paused">متوقف</SelectItem></SelectContent></Select></div>
                                    </div>
                                    <div className="flex items-center gap-3"><Label className="text-xs font-bold">تم الدفع</Label><Switch checked={editLaserRecordForm.paid} onCheckedChange={v => setEditLaserRecordForm(p => ({ ...p, paid: v }))} /></div>
                                    <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editLaserRecordForm.notes} onChange={e => setEditLaserRecordForm(p => ({ ...p, notes: e.target.value }))} className="rounded-xl text-xs mt-1" rows={2} /></div>
                                    <div className="flex gap-2">
                                      <Button className="rounded-xl bg-gradient-to-l from-cyan-600 to-teal-600 text-white" onClick={async () => { try { await apiFetch(`/laser/records/${rec.id}`, { method: 'PUT', body: JSON.stringify({ bodyArea: editLaserRecordForm.bodyArea, skinType: editLaserRecordForm.skinType || undefined, hairColor: editLaserRecordForm.hairColor || undefined, hairDensity: editLaserRecordForm.hairDensity || undefined, totalSessions: parseInt(editLaserRecordForm.totalSessions) || 0, price: parseFloat(editLaserRecordForm.price) || 0, totalPrice: parseFloat(editLaserRecordForm.totalPrice) || 0, paid: editLaserRecordForm.paid, machineName: editLaserRecordForm.machineName || undefined, status: editLaserRecordForm.status, notes: editLaserRecordForm.notes || undefined }) }); setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, bodyArea: editLaserRecordForm.bodyArea, skinType: editLaserRecordForm.skinType, hairColor: editLaserRecordForm.hairColor, hairDensity: editLaserRecordForm.hairDensity, totalSessions: parseInt(editLaserRecordForm.totalSessions) || 0, price: parseFloat(editLaserRecordForm.price) || 0, totalPrice: parseFloat(editLaserRecordForm.totalPrice) || 0, paid: editLaserRecordForm.paid, machineName: editLaserRecordForm.machineName, status: editLaserRecordForm.status, notes: editLaserRecordForm.notes } : r)); toast.success('تم تحديث السجل ✅'); setEditingLaserRecordId(null) } catch { toast.error('خطأ في التحديث') } }}>حفظ التعديلات</Button>
                                      <Button variant="outline" className="rounded-xl" onClick={() => setEditingLaserRecordId(null)}>إلغاء</Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </div>)}

                          {/* ─── SESSIONS TAB ─── */}
                          {laserDetailTab === 'sessions' && (<div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-violet-500" /> سجل الجلسات</h3>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-xs">{laserSess.length} جلسة</Badge>
 <button onClick={() => { setShowAddLaserSessionForm(true); setNewLaserSessionForm({ energy: String(rec.energy || ''), pulse: rec.pulse || '', painLevel: '', reaction: '', notes: '', date: getLocalDateStr() }) }} className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 text-white text-xs font-bold shadow-lg flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><Plus size={12} /> جلسة</button>
                              </div>
                            </div>
                            {laserSess.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-5xl mb-3 animate-bounce-y">⚡</div><p className="font-bold mb-1">لا توجد جلسات مسجلة</p><p className="text-muted-foreground text-xs mb-3">ابدأ بتسجيل أول جلسة ليزر لهذا المريض</p><Button className="rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 text-white" onClick={() => { setShowAddLaserSessionForm(true); setNewLaserSessionForm({ energy: String(rec.energy || ''), pulse: rec.pulse || '', painLevel: '', reaction: '', notes: '', date: getLocalDateStr() }) }}><Plus size={14} className="ml-1" /> تسجيل جلسة</Button></Card>}

                            {laserSess.map((ls, idx) => {
                              const isEditing = editingLaserSessionId === ls.id
                              const isFirst = idx === 0
                              return (
                                <motion.div key={ls.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                                  <Card className={cn('section-card overflow-hidden transition-all', ls.paid ? 'border-r-4 border-r-emerald-400' : 'border-r-4 border-r-amber-400', isEditing ? 'ring-2 ring-violet-400 dark:ring-violet-600' : isFirst ? 'shadow-md' : '', isFirst && !ls.paid && 'border-2 border-amber-200 dark:border-amber-700', isFirst && ls.paid && 'border-2 border-emerald-200 dark:border-emerald-700')}>
                                    {/* Session Header */}
                                    <div className={cn('p-3 flex items-center justify-between gap-2', isEditing ? 'bg-violet-50 dark:bg-violet-950/30' : isFirst ? 'bg-gradient-to-l from-cyan-50/80 via-teal-50/50 to-emerald-50/80 dark:from-cyan-950/20 dark:via-teal-950/10 dark:to-emerald-950/20' : '')}>
                                      <div className="flex items-center gap-3">
                                        <motion.div animate={isFirst ? { scale: [1, 1.15, 1] } : {}} transition={{ duration: 2, repeat: isFirst ? Infinity : 0, repeatDelay: 2 }} className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-md text-lg font-black', ls.paid ? 'bg-gradient-to-br from-emerald-500 to-green-600' : 'bg-gradient-to-br from-amber-400 to-orange-500')}>
                                          {ls.sessionNumber}
                                        </motion.div>
                                        <div>
                                          <div className="flex items-center gap-2 flex-wrap">
                                            <p className="font-bold text-sm">الجلسة رقم {ls.sessionNumber}</p>
                                            {isFirst && <Badge className="bg-gradient-to-l from-cyan-500 to-teal-500 text-white text-[9px] border-0 shadow-sm">⭐ الأخيرة</Badge>}
                                            <Badge className={cn('text-[9px]', ls.paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{ls.paid ? '✅ مدفوعة' : '⏳ غير مدفوعة'}</Badge>
                                          </div>
                                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                                            <Calendar size={10} /><span>{formatDate(ls.date)}</span>
                                            <DollarSign size={10} className="text-emerald-500" /><span className="font-bold text-emerald-600">{formatCurrency(ls.price || rec.price)}</span>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1.5 flex-shrink-0">
                                        {!ls.paid && <motion.div whileTap={{ scale: 0.9 }}><Button size="sm" className="h-7 px-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-bold shadow-sm" onClick={async () => { try { await apiFetch(`/laser/sessions/${ls.id}`, { method: 'PUT', body: JSON.stringify({ paid: true, price: ls.price || rec.price }) }); const txnAmount = ls.price || rec.price; const txnDesc = `جلسة ليزر #${ls.sessionNumber} - ${pat?.name || 'مريض'} - ${areaInfo?.label || rec.bodyArea}`; const txnDate = ls.date || ls.createdAt || cairoISO(); try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]); } else { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } } catch { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: (r.laserSessions || []).map(s => s.id === ls.id ? { ...s, paid: true } : s) } : r)); toast.success('تم تأكيد الدفع ✅') } catch { toast.error('خطأ') } }}>💰 دفع</Button></motion.div>}
                                        <Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-violet-600 border-violet-200 dark:border-violet-700 hover:bg-violet-50 dark:hover:bg-violet-900/20 text-[9px] font-bold" onClick={() => { setEditingLaserSessionId(isEditing ? null : ls.id); setEditLaserSessionForm({ energy: String(ls.energy || ''), pulse: ls.pulse || '', painLevel: String(ls.painLevel || ''), reaction: ls.reaction || '', notes: ls.notes || '', date: ls.date ? ls.date.split('T')[0] : '', price: String(ls.price ?? rec.price), paid: ls.paid }) }}><Edit3 size={10} className="ml-0.5" /> تعديل</Button>
                                        {canDelete && <Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px] font-bold" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={10} className="ml-0.5" /> حذف</Button>}
                                      </div>
                                    </div>
                                    {isEditing ? (
                                      <CardContent className="p-3 space-y-2 bg-violet-50/50 dark:bg-violet-950/10">
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                          <div><Label className="text-[10px] font-bold">⚡ الطاقة (جول)</Label><Input type="number" value={editLaserSessionForm.energy} onChange={e => setEditLaserSessionForm(p => ({ ...p, energy: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">📢 النبض</Label><Input value={editLaserSessionForm.pulse} onChange={e => setEditLaserSessionForm(p => ({ ...p, pulse: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">😣 مستوى الألم (1-10)</Label><Input type="number" min="1" max="10" value={editLaserSessionForm.painLevel} onChange={e => setEditLaserSessionForm(p => ({ ...p, painLevel: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">🔴 رد الفعل</Label><Input value={editLaserSessionForm.reaction} onChange={e => setEditLaserSessionForm(p => ({ ...p, reaction: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">💰 السعر</Label><Input type="number" value={editLaserSessionForm.price} onChange={e => setEditLaserSessionForm(p => ({ ...p, price: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                          <div><Label className="text-[10px] font-bold">📅 التاريخ</Label><Input type="date" value={editLaserSessionForm.date} onChange={e => setEditLaserSessionForm(p => ({ ...p, date: e.target.value }))} className="rounded-lg h-8 text-xs mt-0.5" /></div>
                                        </div>
                                        <div className="flex items-center gap-3"><Label className="text-[10px] font-bold">تم الدفع</Label><Switch checked={editLaserSessionForm.paid} onCheckedChange={v => setEditLaserSessionForm(p => ({ ...p, paid: v }))} /></div>
                                        <div><Label className="text-[10px] font-bold">📝 ملاحظات</Label><Textarea value={editLaserSessionForm.notes} onChange={e => setEditLaserSessionForm(p => ({ ...p, notes: e.target.value }))} className="rounded-lg text-xs mt-0.5" rows={2} /></div>
                                        <div className="flex gap-2">
                                          <Button size="sm" className="rounded-lg bg-gradient-to-l from-violet-600 to-purple-600 text-white text-xs shadow-sm" onClick={async () => { try { const updatedPrice = parseFloat(editLaserSessionForm.price) || rec.price; await apiFetch(`/laser/sessions/${ls.id}`, { method: 'PUT', body: JSON.stringify({ energy: parseFloat(editLaserSessionForm.energy) || undefined, pulse: editLaserSessionForm.pulse || undefined, painLevel: parseInt(editLaserSessionForm.painLevel) || undefined, reaction: editLaserSessionForm.reaction || undefined, notes: editLaserSessionForm.notes || undefined, price: updatedPrice, paid: editLaserSessionForm.paid, date: editLaserSessionForm.date || undefined }) }); setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: (r.laserSessions || []).map(s => s.id === ls.id ? { ...s, energy: parseFloat(editLaserSessionForm.energy) || undefined, pulse: editLaserSessionForm.pulse || undefined, painLevel: parseInt(editLaserSessionForm.painLevel) || undefined, reaction: editLaserSessionForm.reaction || undefined, notes: editLaserSessionForm.notes || undefined, price: updatedPrice, paid: editLaserSessionForm.paid, date: editLaserSessionForm.date || s.date } : s) } : r)); toast.success('تم تحديث الجلسة ✅'); setEditingLaserSessionId(null) } catch { toast.error('خطأ') } }}>✅ حفظ</Button>
                                          <Button variant="outline" size="sm" className="rounded-lg text-xs" onClick={() => setEditingLaserSessionId(null)}>إلغاء</Button>
                                        </div>
                                      </CardContent>
                                    ) : (
                                      <CardContent className="p-3">
                                        <div className={cn('grid gap-2', isFirst ? 'grid-cols-2 sm:grid-cols-4' : 'grid-cols-2 sm:grid-cols-4')}>
                                          {ls.energy && <div className="p-2 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-center border border-yellow-100 dark:border-yellow-800/30"><p className="text-[9px] text-muted-foreground">⚡ طاقة</p><p className="font-bold text-xs">{ls.energy} جول</p></div>}
                                          {ls.pulse && <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 text-center border border-indigo-100 dark:border-indigo-800/30"><p className="text-[9px] text-muted-foreground">📢 نبض</p><p className="font-bold text-xs">{ls.pulse}</p></div>}
                                          {ls.painLevel && <div className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-center border border-red-100 dark:border-red-800/30"><p className="text-[9px] text-muted-foreground">😣 ألم</p><p className="font-bold text-xs">{ls.painLevel}/10</p></div>}
                                          {ls.reaction && <div className="p-2 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-center border border-orange-100 dark:border-orange-800/30"><p className="text-[9px] text-muted-foreground">🔴 رد فعل</p><p className="font-bold text-xs">{ls.reaction}</p></div>}
                                          {/* For first session, show default values if not set */}
                                          {isFirst && !ls.energy && rec.energy && <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-center border border-cyan-100 dark:border-cyan-800/30"><p className="text-[9px] text-muted-foreground">⚡ طاقة افتراضية</p><p className="font-bold text-xs">{rec.energy} جول</p></div>}
                                          {isFirst && !ls.pulse && rec.pulse && <div className="p-2 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 text-center border border-cyan-100 dark:border-cyan-800/30"><p className="text-[9px] text-muted-foreground">📢 نبض افتراضي</p><p className="font-bold text-xs">{rec.pulse}</p></div>}
                                          {/* Show empty placeholder for alignment when no data */}
                                          {!ls.energy && !ls.pulse && !ls.painLevel && !ls.reaction && (!isFirst || (!rec.energy && !rec.pulse)) && <div className="p-2 rounded-xl bg-muted/30 text-center border border-dashed border-muted-foreground/20 col-span-2"><p className="text-[10px] text-muted-foreground">لا توجد تفاصيل إضافية مسجلة لهذه الجلسة</p></div>}
                                        </div>
                                        {ls.notes && <div className="mt-2 p-2.5 rounded-xl bg-teal-50 dark:bg-teal-900/10 border border-teal-100 dark:border-teal-800/30 text-xs"><span className="text-teal-600 dark:text-teal-400 font-semibold">📝 </span>{ls.notes}</div>}
                                      </CardContent>
                                    )}
                                  </Card>
                                </motion.div>
                              )
                            })}

                            {/* Add Laser Session Form */}
                            {showAddLaserSessionForm && (
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                                <Card className="card-luxury border-2 border-violet-300 dark:border-violet-700 overflow-hidden">
                                  <div className="bg-gradient-to-l from-violet-500 to-purple-600 p-3 flex items-center justify-between"><div className="flex items-center gap-2"><Plus size={16} className="text-white" /><CardTitle className="text-sm text-white font-bold">تسجيل جلسة جديدة</CardTitle></div><Button variant="ghost" size="icon" className="h-7 w-7 text-white" onClick={() => setShowAddLaserSessionForm(false)}><X size={14} /></Button></div>
                                  <CardContent className="p-3 space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                      <div><Label className="text-xs font-bold">⚡ الطاقة (جول)</Label><Input type="number" value={newLaserSessionForm.energy} onChange={e => setNewLaserSessionForm(p => ({ ...p, energy: e.target.value }))} placeholder="مثال: 15" className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">📢 النبض</Label><Input value={newLaserSessionForm.pulse} onChange={e => setNewLaserSessionForm(p => ({ ...p, pulse: e.target.value }))} placeholder="مثال: 20ms" className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">😣 مستوى الألم (1-10)</Label><Input type="number" min="1" max="10" value={newLaserSessionForm.painLevel} onChange={e => setNewLaserSessionForm(p => ({ ...p, painLevel: e.target.value }))} placeholder="1-10" className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">🔴 رد الفعل</Label><Input value={newLaserSessionForm.reaction} onChange={e => setNewLaserSessionForm(p => ({ ...p, reaction: e.target.value }))} placeholder="احمرار، تورم..." className="rounded-xl h-9 text-xs mt-1" /></div>
                                      <div><Label className="text-xs font-bold">📅 التاريخ</Label><Input type="date" value={newLaserSessionForm.date} onChange={e => setNewLaserSessionForm(p => ({ ...p, date: e.target.value }))} className="rounded-xl h-9 text-xs mt-1" /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                      <div><Label className="text-xs font-bold">💰 سعر الجلسة (ج.م)</Label><Input type="number" value={newLaserSessionForm.price || String(rec.price)} onChange={e => setNewLaserSessionForm(p => ({ ...p, price: e.target.value }))} className="rounded-xl h-9 text-xs mt-1 font-bold" /></div>
                                      <div className="flex items-end gap-2 pb-1"><Label className="text-xs font-bold">تم الدفع</Label><Switch checked={newLaserSessionForm.paid} onCheckedChange={v => setNewLaserSessionForm(p => ({ ...p, paid: v }))} /></div>
                                    </div>
                                    <div><Label className="text-xs font-bold">📝 ملاحظات الجلسة</Label><Textarea value={newLaserSessionForm.notes} onChange={e => setNewLaserSessionForm(p => ({ ...p, notes: e.target.value }))} placeholder="ملاحظات عن الجلسة، استجابة المريض، تعديلات..." className="rounded-xl text-xs mt-1" rows={2} /></div>
                                    <div className="flex gap-2">
                                      <Button className="rounded-xl bg-gradient-to-l from-violet-500 to-purple-600 text-white flex-1" onClick={async () => { try { const sessionPrice = parseFloat(newLaserSessionForm.price) || rec.price; const res = await apiFetch<any>('/laser/sessions', { method: 'POST', body: JSON.stringify({ laserRecordId: rec.id, energy: parseFloat(newLaserSessionForm.energy) || undefined, pulse: newLaserSessionForm.pulse || undefined, painLevel: parseInt(newLaserSessionForm.painLevel) || undefined, reaction: newLaserSessionForm.reaction || undefined, notes: newLaserSessionForm.notes || undefined, price: sessionPrice, paid: newLaserSessionForm.paid, date: newLaserSessionForm.date || cairoISO() }) }); const newSession = res?.session; if (newSession) { setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: [...(r.laserSessions || []), newSession], _count: { laserSessions: (r._count?.laserSessions || 0) + 1 } } : r)); } if (newLaserSessionForm.paid && sessionPrice > 0) { try { const txnRes = await apiFetch<any>('/finance/transactions?limit=5&page=1'); const latestTxns = txnRes?.transactions || []; if (latestTxns.length > 0) { const newest = latestTxns[0]; if (newest?.id && newest.category === 'ليزر') { setTransactions(prev => [newest, ...prev]); } } } catch {} } toast.success('تم تسجيل الجلسة ✅'); setShowAddLaserSessionForm(false); setNewLaserSessionForm({ energy: '', pulse: '', painLevel: '', reaction: '', notes: '', date: '' }) } catch { toast.error('خطأ في تسجيل الجلسة') } }}>تسجيل الجلسة</Button>
                                      <Button variant="outline" className="rounded-xl" onClick={() => setShowAddLaserSessionForm(false)}>إلغاء</Button>
                                    </div>
                                  </CardContent>
                                </Card>
                              </motion.div>
                            )}
                          </div>)}

                          {/* ─── PAYMENTS TAB ─── */}
                          {laserDetailTab === 'payments' && (<div className="space-y-3">
                            <h3 className="font-bold text-lg flex items-center gap-2"><DollarSign size={18} className="text-emerald-500" /> المدفوعات والمالية</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} whileHover={{ scale: 1.02 }}>
                                <Card className="card-luxury overflow-hidden border-2 border-emerald-200 dark:border-emerald-800/50">
                                  <div className="bg-gradient-to-l from-emerald-500 to-green-600 p-3 flex items-center gap-2"><CheckCircle size={16} className="text-white" /><p className="text-sm text-white font-bold">المدفوع</p></div>
                                  <CardContent className="p-3 text-center"><div className="text-2xl font-black text-emerald-600 animate-pulse-scale">{formatCurrency(totalPaid)}</div></CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.02 }}>
                                <Card className="card-luxury overflow-hidden border-2 border-amber-200 dark:border-amber-800/50">
                                  <div className="bg-gradient-to-l from-amber-500 to-orange-600 p-3 flex items-center gap-2"><Clock size={16} className="text-white" /><p className="text-sm text-white font-bold">المتبقي</p></div>
                                  <CardContent className="p-3 text-center"><motion.div animate={totalRemaining > 0 ? { scale: [1, 1.08, 1] } : {}} transition={{ duration: 1.5, repeat: totalRemaining > 0 ? Infinity : 0, repeatDelay: 2 }} className="text-2xl font-black text-amber-600">{formatCurrency(totalRemaining)}</motion.div></CardContent>
                                </Card>
                              </motion.div>
                              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.02 }}>
                                <Card className="card-luxury overflow-hidden border-2 border-blue-200 dark:border-blue-800/50">
                                  <div className="bg-gradient-to-l from-blue-500 to-indigo-600 p-3 flex items-center gap-2"><Receipt size={16} className="text-white" /><p className="text-sm text-white font-bold">الإجمالي</p></div>
                                  <CardContent className="p-3 text-center"><div className="text-2xl font-black text-blue-600">{formatCurrency(grandTotal)}</div></CardContent>
                                </Card>
                              </motion.div>
                            </div>
                            {/* Payment Progress */}
                            <Card className="card-luxury p-4">
                              <p className="text-sm font-bold mb-2 flex items-center gap-2"><BarChart3 size={16} className="text-emerald-500" /> نسبة السداد</p>
                              <div className="flex h-6 rounded-full overflow-hidden bg-muted">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${Math.round((totalPaid / Math.max(grandTotal, 1)) * 100)}%` }} transition={{ duration: 1 }} className="bg-gradient-to-l from-emerald-400 to-emerald-600 flex items-center justify-center text-white text-[10px] font-bold">{Math.round((totalPaid / Math.max(grandTotal, 1)) * 100)}%</motion.div>
                              </div>
                            </Card>
                            {/* Individual Session Payments */}
                            <Card className="card-luxury overflow-hidden">
                              <div className="bg-gradient-to-l from-violet-500 to-purple-600 p-3 flex items-center gap-2"><Zap size={16} className="text-white" /><p className="text-sm text-white font-bold">مدفوعات الجلسات</p></div>
                              <CardContent className="p-3 space-y-2">
                                {laserSess.length === 0 && <p className="text-center text-muted-foreground text-sm py-3">لا توجد جلسات مسجلة بعد</p>}
                                {laserSess.map((ls, idx) => (
                                  <motion.div key={ls.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={cn('flex items-center justify-between p-2.5 rounded-xl border transition-all', ls.paid ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/50 dark:border-emerald-800/30' : 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-200/50 dark:border-amber-800/30')}>
                                    <div className="flex items-center gap-2.5">
                                      <div className={cn('p-1.5 rounded-lg text-white text-[10px] font-bold', ls.paid ? 'bg-emerald-500' : 'bg-amber-500')}>{ls.sessionNumber}</div>
                                      <div>
                                        <p className="text-xs font-bold">الجلسة رقم {ls.sessionNumber}</p>
                                        <p className="text-[10px] text-muted-foreground">{formatDate(ls.date)}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                      <span className={cn('font-bold text-sm', ls.paid ? 'text-emerald-600' : 'text-amber-600')}>{formatCurrency(ls.price || rec.price)}</span>
 {ls.paid ? <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px] active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150">✅</Badge> : <button onClick={async () => { try { await apiFetch(`/laser/sessions/${ls.id}`, { method: 'PUT', body: JSON.stringify({ paid: true, price: ls.price || rec.price }) }); const txnAmount = ls.price || rec.price; const txnDesc = `جلسة ليزر #${ls.sessionNumber} - ${pat?.name || 'مريض'} - ${areaInfo?.label || rec.bodyArea}`; const txnDate = ls.date || cairoISO(); try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]); } else { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } } catch { setTransactions(prev => [...prev, { id: 'laser-' + Date.now(), type: 'income', category: 'ليزر', amount: txnAmount, description: txnDesc, date: txnDate }]); } setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, laserSessions: (r.laserSessions || []).map(s => s.id === ls.id ? { ...s, paid: true } : s) } : r)); toast.success('تم تأكيد الدفع ✅') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[9px] font-bold shadow-md hover:bg-emerald-600 active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150">💰 دفع</button>}
                                      {canDelete && <Button size="sm" variant="outline" className="h-6 px-1.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px]" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={9} className="ml-0.5" /> حذف</Button>}
                                    </div>
                                  </motion.div>
                                ))}
                              </CardContent>
                            </Card>
                            {/* Payment Summary */}
                            <Card className="card-luxury overflow-hidden">
                              <div className="bg-gradient-to-l from-slate-600 to-slate-700 p-3 flex items-center gap-2"><FileText size={16} className="text-white" /><p className="text-sm text-white font-bold">ملخص الفاتورة</p></div>
                              <CardContent className="p-3 space-y-2">
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 text-sm"><span>سعر الجلسة الواحدة</span><span className="font-bold">{formatCurrency(rec.price)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 text-sm"><span>عدد الجلسات الكلي</span><span className="font-bold">{rec.totalSessions} جلسة</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-muted/50 text-sm"><span>جلسات تمت</span><span className="font-bold">{laserSess.length} جلسة</span></div>
                                <Separator />
                                <div className="flex justify-between items-center p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-sm"><span className="font-bold">الإجمالي</span><span className="font-bold text-blue-600">{formatCurrency(grandTotal)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-sm"><span>المدفوع ({laserSess.filter(s => s.paid).length} جلسة)</span><span className="font-bold text-emerald-600">{formatCurrency(totalPaid)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-sm"><span>المتبقي ({laserSess.filter(s => !s.paid).length} جلسة)</span><span className="font-bold text-amber-600">{formatCurrency(totalUnpaidFromSessions)}</span></div>
                                <div className="flex justify-between items-center p-2 rounded-lg text-sm"><span>حالة الدفع</span><Badge className={rec.paid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}>{rec.paid ? '✅ مدفوع بالكامل' : '⏳ يوجد متبقي'}</Badge></div>
                              </CardContent>
                            </Card>
                            {!rec.paid && <Button className="rounded-xl w-full bg-gradient-to-l from-emerald-500 to-green-600 text-white" onClick={async () => { try { await apiFetch(`/laser/records/${rec.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); setLaserRecords(prev => prev.map(r => r.id === rec.id ? { ...r, paid: true } : r)); toast.success('تم تأكيد الدفع الكامل ✅') } catch { toast.error('خطأ') } }}>تأكيد الدفع الكامل</Button>}
                          </div>)}

                          {/* ─── NOTES TAB ─── */}
                          {laserDetailTab === 'notes' && (<div className="space-y-3">
                            <h3 className="font-bold text-lg flex items-center gap-2"><StickyNote size={18} className="text-amber-500" /> ملاحظات العلاج</h3>
                            {/* Quick Note Add */}
                            <div className="flex gap-2">
                              <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-9 text-xs" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: rec.patientId, section: 'laser' }, setNotes) } }} />
                              <Button size="sm" className="rounded-xl bg-amber-500 text-white h-9" onClick={() => { if (quickNote.trim()) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: rec.patientId, section: 'laser' }, setNotes) } }}><Plus size={14} /></Button>
                            </div>
                            {/* Laser Notes */}
                            {notes.filter(n => n.patientId === rec.patientId && (n.section === 'laser' || n.section === 'patient')).length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-muted-foreground text-sm">لا توجد ملاحظات بعد</p></Card>}
                            <div className="space-y-2">{notes.filter(n => n.patientId === rec.patientId && (n.section === 'laser' || n.section === 'patient' || !n.section)).map(n => (
                              <Card key={n.id} className="section-card p-3 border border-amber-200/50 dark:border-amber-800/30">
                                <div className="flex items-start gap-2">
                                  <div className="flex-1">
                                    {editingNoteId === n.id ? (<div className="flex gap-1.5"><Input value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="input-luxury rounded-lg h-7 text-xs" autoFocus /><Button size="sm" className="rounded-lg h-7 bg-amber-500 text-white text-[10px] px-2" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="h-7 px-1" onClick={() => setEditingNoteId(null)}>✕</Button></div>) : <><p className="text-xs">{n.content}</p><p className="text-[8px] text-muted-foreground mt-0.5">{formatDate(n.createdAt)}{n.important && ' ⭐ مهم'}</p></>}
                                  </div>
                                  {editingNoteId !== n.id && <div className="flex gap-0.5"><Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content) }}><Edit3 size={9} className="text-amber-500" /></Button>{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={9} className="text-red-500" /></Button>}</div>}
                                </div>
                              </Card>
                            ))}</div>

                            {/* Professional Treatment Notes */}
                            <Card className="card-luxury overflow-hidden border-2 border-teal-200 dark:border-teal-800/50">
                              <div className="bg-gradient-to-l from-teal-500 to-emerald-600 p-3 flex items-center gap-2"><div className="text-lg animate-spin-slow">💡</div><CardTitle className="text-sm text-white font-bold">نصائح مهنية - ما بعد الجلسة</CardTitle></div>
                              <CardContent className="p-3 space-y-2">
                                {['تجنب التعرض لأشعة الشمس المباشرة لمدة أسبوعين', 'استخدم واقي شمس SPF 50+ يومياً', 'تجنب التقشير الكيميائي لمدة أسبوع', 'لا تستخدم مزيل شعر بالشمع بين الجلسات', 'استخدم كريم مهدئ (ألوفيرا) بعد الجلسة', 'تجنب الماء الساخن على المنطقة لمدة 24 ساعة', 'تجنب ممارسة الرياضة الشاقة لمدة 24-48 ساعة', 'لا تقوم بفرك المنطقة أو حكها'].map((tip, i) => (
                                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="flex items-start gap-2 p-1.5 rounded-lg bg-teal-50/50 dark:bg-teal-900/10 text-xs"><CheckCircle size={12} className="text-teal-500 shrink-0 mt-0.5" /><span>{tip}</span></motion.div>
                                ))}
                              </CardContent>
                            </Card>
                          </div>)}
                        </motion.div>
                      )
                    })() : (<div className="space-y-3">
                    {/* ─── Records List (when no record selected) ─── */}
                    {laserRecords.length === 0 && <Card className="card-luxury p-8 text-center"><div className="text-5xl mb-3 animate-bounce-y">💎</div><p className="text-lg font-bold mb-1">لا توجد سجلات ليزر بعد</p><p className="text-muted-foreground text-sm mb-3">ابدأ بإضافة سجل جديد لمريض</p><Button className="btn-luxury rounded-xl bg-gradient-to-l from-cyan-600 to-cyan-700 text-white" onClick={() => setShowAddLaserRecord(true)}><Plus size={14} className="ml-1" /> إنشاء سجل</Button></Card>}
                    {laserRecords.map(r => {
                      const p = r.patient || patients.find(pt => pt.id === r.patientId)
                      const areaInfo = BODY_AREAS.find(a => a.id === r.bodyArea || a.label === r.bodyArea)
                      const rSess = r.laserSessions || []
                      const laserSessCount = rSess.length || r._count?.laserSessions || 0
                      const progressPercent = r.totalSessions > 0 ? Math.min((laserSessCount / r.totalSessions) * 100, 100) : 0
                      const paidSessions = rSess.filter(s => s.paid).length
                      const unpaidSessions = rSess.filter(s => !s.paid).length
                      const totalPaid = rSess.filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
                      const grandTotal = r.totalPrice || (r.price * r.totalSessions)
                      const totalRemaining = r.paid ? 0 : Math.max(grandTotal - totalPaid, 0)
                      return (
                        <motion.div key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}>
                          <Card className={cn('section-card overflow-hidden cursor-pointer hover:shadow-xl transition-all', r.paid ? 'border-r-4 border-r-emerald-400' : totalRemaining > 0 ? 'border-r-4 border-r-amber-400' : 'border-r-4 border-r-cyan-400')} onClick={() => { setSelectedLaserRecordId(r.id); setLaserDetailTab('overview') }}>
                            <div className="p-3.5">
                              <div className="flex items-start gap-3">
                                {/* Area Icon */}
                                <div className={cn('p-2.5 rounded-xl flex-shrink-0', areaInfo?.color || 'bg-cyan-100 dark:bg-cyan-900/30')}>
                                  <div className="text-lg animate-pulse-scale">💎</div>
                                </div>
                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <p className="font-bold text-sm">{p?.name || 'مريض'}</p>
                                    <Badge className={cn('text-[9px]', r.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : r.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400')}>{r.status === 'active' ? '🟢 نشط' : r.status === 'completed' ? '🔵 مكتمل' : '⏸️ متوقف'}</Badge>
                                    {areaInfo && <Badge className={cn('text-[9px]', areaInfo.color)}>{areaInfo.label}</Badge>}
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">{r.machineName && <span>⚙️ {r.machineName}</span>}</div>
                                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-[10px]"><Zap size={11} className="text-violet-500" /><span className="font-bold">{laserSessCount}/{r.totalSessions} جلسة</span></div>
                                    {r.price > 0 && <div className="flex items-center gap-1.5 text-[10px]"><DollarSign size={11} className="text-emerald-500" /><span className="font-bold text-emerald-600">{formatCurrency(totalPaid)}</span>{totalRemaining > 0 && <span className="text-amber-600">/ {formatCurrency(grandTotal)}</span>}</div>}
                                    {laserSessCount > 0 && <div className="flex items-center gap-1.5 text-[10px]">{paidSessions > 0 && <span className="text-emerald-600 font-bold">✅ {paidSessions}</span>}{unpaidSessions > 0 && <span className="text-amber-600 font-bold">⏳ {unpaidSessions}</span>}</div>}
                                  </div>
                                  {/* Progress */}
                                  <div className="mt-2"><div className="flex items-center justify-between text-[9px] mb-1"><span className="text-muted-foreground">التقدم</span><span className="font-bold">{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-2" /></div>
                                </div>
                                {/* Actions */}
                                <div className="flex flex-col gap-1.5 flex-shrink-0">
                                  <Button size="sm" className="h-8 px-3 rounded-lg bg-gradient-to-l from-cyan-500 to-teal-500 text-white text-[10px] font-bold shadow-sm hover:shadow-md" onClick={e => { e.stopPropagation(); setSelectedLaserRecordId(r.id); setLaserDetailTab('overview') }}><Eye size={12} className="ml-1" /> فتح</Button>
                                  {canDelete && <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[10px] font-bold" onClick={e => { e.stopPropagation(); setDeleteLaserRecordConfirmId(r.id) }}><Trash2 size={12} className="ml-1" /> حذف</Button>}
                                </div>
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>)}
                </div>)}

                {/* Laser Sessions */}
                {laserSubTab === 'sessions' && (<div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Zap size={18} className="text-violet-500" /> جلسات الليزر</h3><Badge variant="outline">{laserHairSessions.length} جلسة</Badge></div>
                    {laserHairSessions.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚡</p><p className="text-muted-foreground">لا توجد جلسات ليزر مسجلة</p><p className="text-xs text-muted-foreground mt-1">سيتم إنشاء الجلسات تلقائياً عند تسجيل مريض بجلسات ليزر</p></Card>}
                    <div className="space-y-2">
                      {laserHairSessions.slice(0, 30).map(s => {
                        const p = patients.find(pt => pt.id === s.patientId)
                        const svc = services.find(sv => sv.id === s.serviceId)
                        return (
                          <Card key={s.id} className="section-card p-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg text-white', s.status === 'completed' ? 'bg-emerald-500' : s.status === 'scheduled' ? 'bg-blue-500' : s.status === 'cancelled' ? 'bg-red-500' : 'bg-amber-500')}>
                                  {s.status === 'completed' ? <CheckCircle size={14} /> : s.status === 'scheduled' ? <Calendar size={14} /> : <Clock size={14} />}
                                </div>
                                <div>
                                  <p className="font-medium text-sm">{p?.name || 'مريض'} - {svc?.name || 'جلسة ليزر'}</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(s.date)} {s.paid ? '✅ مدفوعة' : '⏳ غير مدفوعة'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm">{formatCurrency(s.price)}</span>
 {!s.paid && <button onClick={() => markSessionPaid(s)} className="px-2 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold hover:bg-emerald-200 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">دفع</button>}
                              </div>
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                </div>)}

                {/* Laser Packages - Enhanced */}
                {laserSubTab === 'packages' && (<div className="space-y-3 mt-4">
                    <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Package size={18} className="text-amber-500" /> باقات الليزر</h3></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {laserPackages.length === 0 && <Card className="card-luxury p-6 text-center col-span-2"><p className="text-3xl mb-2">📦</p><p className="text-muted-foreground">لا توجد باقات ليزر</p><Button className="mt-3 btn-luxury rounded-xl" onClick={() => setShowAddLaserPackage(true)}><Plus size={14} className="ml-1" /> إنشاء باقة</Button></Card>}
                      {laserPackages.map(pkg => {
                        const pricePerSession = pkg.sessionsCount > 0 ? pkg.price / pkg.sessionsCount : 0
                        return (
                          <Card key={pkg.id} className={cn('section-card p-4', !pkg.active && 'opacity-50')}>
                            <div className="flex items-center justify-between mb-2"><h3 className="font-bold">{pkg.name}</h3><Badge className={pkg.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}>{pkg.active ? 'نشط' : 'معطل'}</Badge></div>
                            <div className="space-y-1">
                              <p className="text-2xl font-bold text-primary">{formatCurrency(pkg.price)}</p>
                              <p className="text-xs text-muted-foreground">{pkg.sessionsCount} جلسة{pkg.bodyArea ? ` - ${pkg.bodyArea}` : ''}</p>
                              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(pricePerSession)} / جلسة</p>
                            </div>
                            <div className="flex gap-2 mt-3">
                              {canDelete && <Button variant="outline" size="sm" className="rounded-lg flex-1" onClick={() => deleteItem('/laser/packages', pkg.id, setLaserPackages)}><Trash2 size={12} className="ml-1" /> حذف</Button>}
                            </div>
                          </Card>
                        )
                      })}
                    </div>
                </div>)}

                {/* Body Area Map - Interactive */}
                {laserSubTab === 'bodymap' && (<div className="mt-4">
                    <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><MapPin size={18} /> مناطق الجسم - إزالة الشعر بالليزر</CardTitle><CardDescription>اضغط على أي منطقة لعرض سجلاتها</CardDescription></CardHeader><CardContent>
                      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                        {BODY_AREAS.map(area => {
                          const count = laserRecords.filter(r => r.bodyArea === area.id || r.bodyArea === area.label).length
                          const areaRevenue = laserPackages.filter(p => p.bodyArea === area.label).reduce((s, p) => s + p.price, 0)
                          return (
 <button key={area.id} className={cn('flex items-center justify-center gap-1.5 p-2.5 rounded-xl border transition-all relative active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', area.color, count > 0 ? 'ring-2 ring-primary/30' : 'border-dashed')}>
                              <MapPin size={14} />
                              <span className="text-xs font-bold">{area.label}</span>
                              {count > 0 && <Badge variant="secondary" className="text-[9px]">{count} سجل</Badge>}
                            </button>
                          )
                        })}
                      </div>
                    </CardContent></Card>
                </div>)}

                {/* Laser Financial Summary - Full System */}
                {laserSubTab === 'finance' && (<div className="space-y-4 mt-4">
                    {/* Laser Revenue from actual paid sessions */}
                    {(() => {
                      const allLaserSessions = laserRecords.flatMap(r => (r.laserSessions || []));
                      const paidSessions = allLaserSessions.filter(s => s.paid);
                      const unpaidSessions = allLaserSessions.filter(s => !s.paid);
                      const totalLaserPaid = paidSessions.reduce((s, sess) => s + (sess.price || 0), 0);
                      const totalLaserUnpaid = unpaidSessions.reduce((s, sess) => s + (sess.price || 0), 0);
                      const totalLaserGrand = laserRecords.reduce((s, r) => s + (r.totalPrice || r.price * r.totalSessions), 0);
                      const totalRemaining = Math.max(totalLaserGrand - totalLaserPaid, 0);
                      return (<>
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30"><TrendingUp className="text-emerald-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الليزر</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(totalLaserPaid)}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-900/30"><Receipt className="text-amber-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">غير المدفوع ليزر</p><p className="text-lg font-bold text-amber-600">{formatCurrency(totalLaserUnpaid)}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-900/30"><ClipboardCheck className="text-blue-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">جلسات مدفوعة</p><p className="text-lg font-bold text-blue-600">{paidSessions.length} / {allLaserSessions.length}</p></div></div></Card>
                      <Card className="section-card p-4"><div className="flex items-center gap-3"><div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-900/30"><UsersRound className="text-violet-600" size={20} /></div><div><p className="text-[10px] text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-violet-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div></div></Card>
                    </div>
                    {/* Laser Revenue by Area */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><MapPin size={16} className="text-cyan-500" /> الإيرادات حسب المنطقة</CardTitle></CardHeader><CardContent>
                      <div className="space-y-2">{BODY_AREAS.map(area => { const areaRecords = laserRecords.filter(r => r.bodyArea === area.id || r.bodyArea === area.label); if (areaRecords.length === 0) return null; const areaPaid = areaRecords.flatMap(r => (r.laserSessions || []).filter(s => s.paid)).reduce((sum, s) => sum + (s.price || 0), 0); const areaSessCount = areaRecords.flatMap(r => (r.laserSessions || [])).length; return <div key={area.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div className="flex items-center gap-2"><MapPin size={14} className="text-cyan-500" /><span className="text-sm font-medium">{area.label}</span><Badge variant="outline" className="text-[9px]">{areaRecords.length} سجل | {areaSessCount} جلسة</Badge></div><span className="font-bold text-sm text-emerald-600">{formatCurrency(areaPaid)}</span></div> })}
                      </div>
                    </CardContent></Card>
                    {/* Laser Service Pricing */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Tag size={16} className="text-amber-500" /> أسعار خدمات الليزر</CardTitle></CardHeader><CardContent className="space-y-2">
                      {services.filter(s => s.category?.includes('ليزر') || s.name?.toLowerCase().includes('laser')).map(s => <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">{s.name}</p><p className="text-xs text-muted-foreground">{s.duration ? `${s.duration} دقيقة` : ''}</p></div><div className="flex items-center gap-2"><Badge variant="outline" className="font-bold">{s.price} ج.م</Badge>{editingServiceId === s.id ? (<div className="flex items-center gap-1"><Input type="number" value={editingServicePrice} onChange={e => setEditingServicePrice(e.target.value)} className="w-20 h-7 text-xs rounded-lg" /><Button size="sm" className="h-7 rounded-lg text-[10px]" onClick={async () => { const newPrice = parseFloat(editingServicePrice) || 0; try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, price: newPrice } : sv)); toast.success('تم تحديث السعر') } catch { toast.error('خطأ') } setEditingServiceId(null) }}>حفظ</Button></div>) : <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingServiceId(s.id); setEditingServicePrice(String(s.price)) }}><Edit3 size={10} className="text-amber-500" /></Button>}</div></div>)}
                    </CardContent></Card>
                    {/* Register Laser Session */}
                    <Card className="card-luxury border-2 border-cyan-200 dark:border-cyan-800"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Plus size={16} className="text-cyan-500" /> تسجيل جلسة ليزر جديدة</CardTitle></CardHeader><CardContent className="space-y-3">
                      <Select value={laserFinancePatientId} onValueChange={setLaserFinancePatientId}><SelectTrigger className="rounded-xl h-10"><SelectValue placeholder="اختار المريض..." /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}</SelectContent></Select>
                      <div><Label className="text-xs font-bold flex items-center gap-1"><DollarSign size={12} /> قيمة الجلسة (ج.م)</Label><Input type="number" value={laserFinancePrice} onChange={e => setLaserFinancePrice(e.target.value)} placeholder="السعر بالجنيه..." className="input-luxury rounded-xl h-10 mt-1 text-lg font-bold" /></div>
                      <Input value={laserFinanceNotes} onChange={e => setLaserFinanceNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10" />
                      <Button className="btn-luxury rounded-xl w-full bg-gradient-to-l from-cyan-600 to-cyan-700 text-white" onClick={async () => { if (!laserFinancePatientId || !laserFinancePrice) return toast.error('اختار المريض وحدد السعر'); const price = parseFloat(laserFinancePrice) || 0; const pName = patients.find(p => p.id === laserFinancePatientId)?.name || 'مريض'; await addItem('/sessions', { patientId: laserFinancePatientId, status: 'completed', price, paid: true, notes: laserFinanceNotes ? `ليزر - ${laserFinanceNotes}` : 'ليزر' }, setSessions); if (price > 0) { await addItem('/finance/transactions', { type: 'income', category: 'ليزر', amount: price, description: `جلسة ليزر - ${pName}` }, setTransactions); } setLaserFinancePatientId(''); setLaserFinancePrice(''); setLaserFinanceNotes(''); toast.success('تم تسجيل جلسة الليزر') }}>تسجيل الجلسة</Button>
                    </CardContent></Card>
                    {/* Unpaid Dues */}
                    <Card className="card-luxury"><CardHeader><CardTitle className="text-sm flex items-center gap-2"><Receipt size={16} /> المبالغ المستحقة</CardTitle></CardHeader><CardContent className="space-y-2">
 {laserHairSessions.filter(s => !s.paid).slice(0, 15).map(s => { const p = patients.find(pt => pt.id === s.patientId); const svc = services.find(sv => sv.id === s.serviceId); return <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div><p className="font-medium text-sm active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{svc?.name || s.notes || 'جلسة ليزر'}</p></div><div className="flex items-center gap-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><span className="font-bold text-red-600 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{formatCurrency(s.price)}</span><button onClick={() => markSessionPaid(s)} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">تأكيد الدفع</button></div></div> })}
                      {laserHairSessions.filter(s => !s.paid).length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد مبالغ مستحقة ✅</p>}
                    </CardContent></Card>
                    </>) })()}
                </div>)}

                {/* Machine Settings */}
                {laserSubTab === 'settings' && (<div className="mt-4">
                    <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Settings size={18} /> إعدادات الأجهزة</CardTitle><CardDescription>إعدادات الطاقة والنبض لكل جهاز</CardDescription></CardHeader><CardContent>
                      {laserSettings.length === 0 ? <div className="text-center py-8"><div className="text-4xl mb-2 inline-block animate-spin-slow">⚙️</div><p className="text-muted-foreground">لا توجد إعدادات أجهزة</p><p className="text-xs text-muted-foreground mt-1">أضف إعدادات من لوحة تحكم الأجهزة</p></div> :
                        <div className="space-y-2">{laserSettings.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><Wand2 className="text-cyan-600" size={16} /></div><div><p className="font-medium text-sm">{s.machineName}</p><p className="text-xs text-muted-foreground">{s.bodyArea}</p></div></div><div className="flex gap-2"><Badge variant="outline" className="text-[10px]">⚡ طاقة: {s.defaultEnergy || '-'}</Badge><Badge variant="outline" className="text-[10px]">📢 نبض: {s.defaultPulse || '-'}</Badge></div></div>)}</div>
                      }
                    </CardContent></Card>
                </div>)}
                {/* renderQuickNotes called from page.tsx */}
              </div>

{/* Delete Laser Record */}
<Dialog open={showAddLaserRecord} onOpenChange={(open) => {
        setShowAddLaserRecord(open)
        if (open) {
          apiFetch<any>('/patients?limit=50000').then(res => {
            const pList = res?.patients || res?.data || (Array.isArray(res) ? res : [])
            if (Array.isArray(pList) && pList.length > 0) setPatients(pList)
          }).catch(() => {})
        }
      }}>
        <DialogContent className="max-w-2xl max-h-[95vh] overflow-y-auto p-0 gap-0">
          {/* ═══ Premium Header ═══ */}
          <div className="relative overflow-hidden bg-gradient-to-l from-teal-600 via-cyan-600 to-emerald-600 p-5">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxIiBmaWxsPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDUpIi8+PC9zdmc+')] opacity-50" />
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20 shadow-lg animate-wiggle">
                  <Zap size={22} className="text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-black text-white">سجل ليزر جديد</DialogTitle>
                  <DialogDescription className="text-cyan-100 text-xs mt-0.5">تسجيل جلسة إزالة الشعر بالليزر</DialogDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-white/15 text-white border-white/20 text-[10px] px-3 py-1 backdrop-blur-sm">💎 مركز الليزر</Badge>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-5">
            {/* ═══ Section 1: بيانات العميل ═══ */}
            <div className="rounded-2xl border-2 border-teal-200/50 dark:border-teal-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-teal-500 to-cyan-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">1</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users size={15} /> بيانات العميل
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">مطلوب *</Badge>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-teal-50/30 to-transparent dark:from-teal-950/10">
                {/* Patient Search */}
                <div>
                  <Label className="text-xs font-semibold text-teal-700 dark:text-teal-300 flex items-center gap-1.5 mb-2">
                    <Search size={13} /> ابحث عن المريض بالاسم أو الهاتف
                  </Label>
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-400" size={18} />
                    <Input value={laserFormPatientSearch} onChange={e => { setLaserFormPatientSearch(e.target.value); if (laserFormPatientId) setLaserFormPatientId('') }} placeholder="اكتب اسم المريض أو رقم الهاتف..." className="rounded-xl h-12 pr-10 text-sm border-2 border-teal-200 dark:border-teal-700 focus:border-teal-400 focus:ring-teal-400/20 bg-white dark:bg-slate-900" autoFocus />
                    {laserFormPatientSearch && !laserFormPatientId && (
                      <button onClick={() => { setLaserFormPatientSearch(''); setLaserFormPatientId('') }} className="absolute left-3 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-teal-100 dark:bg-teal-900/50 hover:bg-teal-200 dark:hover:bg-teal-800 flex items-center justify-center transition-colors"><X size={12} className="text-teal-600" /></button>
                    )}
                  </div>
                  {/* Search Results */}
                  {laserPatientSuggestions.length > 0 && !laserFormPatientId && (
                    <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 border-2 border-teal-200 dark:border-teal-700 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-xl">
                      <div className="px-3 py-2 bg-gradient-to-l from-teal-500 to-cyan-500 flex items-center justify-between">
                        <p className="text-xs font-bold text-white flex items-center gap-1.5"><Search size={12} /> نتائج البحث</p>
                        <Badge className="bg-white/25 text-white text-[9px]">{laserPatientSuggestions.length}</Badge>
                      </div>
                      <div className="max-h-[200px] overflow-y-auto divide-y divide-teal-50 dark:divide-teal-900/30">
                        {laserPatientSuggestions.map(p => (
                          <button key={p.id} onClick={() => { setLaserFormPatientId(p.id); setLaserFormPatientSearch(p.name) }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-teal-50 dark:hover:bg-teal-950/30 text-right transition-colors hover:-translate-x-1 transition-transform duration-150">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-md">{p.name?.charAt(0)}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-sm">{p.name}</p>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <Badge variant="outline" className="text-[9px] h-4">#{p.fileNumber}</Badge>
                                {p.phone && <span dir="ltr">{p.phone}</span>}
                                {p.age && <span>{p.age} سنة</span>}
                              </div>
                            </div>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Selected Patient Card */}
                {laserFormPatientId && (() => {
                  const sp = patients.find(p => p.id === laserFormPatientId)
                  if (!sp) return null
                  return (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="rounded-xl border-2 border-teal-300 dark:border-teal-700 overflow-hidden shadow-lg">
                      <div className="bg-gradient-to-l from-teal-500 to-cyan-500 p-3 flex items-center gap-3">
                        <Avatar className="h-11 w-11 border-2 border-white/30 shadow-md"><AvatarFallback className="bg-white text-teal-600 text-sm font-bold">{sp.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-white font-bold text-sm">{sp.name}</p>
                          <div className="flex items-center gap-1.5 text-cyan-100 text-[10px] flex-wrap">
                            <Badge className="bg-white/15 text-white text-[9px] border-white/20">#{sp.fileNumber}</Badge>
                            {sp.gender && <Badge className="bg-white/15 text-white text-[9px] border-white/20">{sp.gender === 'male' ? 'ذكر' : sp.gender === 'female' ? 'أنثى' : sp.gender}</Badge>}
                            {sp.age && <Badge className="bg-white/15 text-white text-[9px] border-white/20">{sp.age} سنة</Badge>}
                            {sp.phone && <Badge className="bg-white/15 text-white text-[9px] border-white/20" dir="ltr">{sp.phone}</Badge>}
                          </div>
                        </div>
                        <button onClick={() => { setLaserFormPatientId(''); setLaserFormPatientSearch('') }} className="w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors shadow-sm"><X size={14} /></button>
                      </div>
                      {(sp.allergies || sp.medicalHistory) && (
                        <div className="p-2.5 space-y-1.5 bg-teal-50/50 dark:bg-teal-950/20">
                          {sp.allergies && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"><AlertTriangle size={12} className="text-red-500 flex-shrink-0" /><p className="text-[10px] text-red-600 dark:text-red-400 font-semibold">حساسية: {sp.allergies}</p></div>}
                          {sp.medicalHistory && <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><AlertCircle size={12} className="text-amber-500 flex-shrink-0" /><p className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold truncate">{sp.medicalHistory}</p></div>}
                        </div>
                      )}
                    </motion.div>
                  )
                })()}
              </div>
            </div>

            {/* ═══ Section 2: بيانات الليزر ═══ */}
            <div className="rounded-2xl border-2 border-cyan-200/50 dark:border-cyan-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-cyan-500 to-emerald-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">2</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Zap size={15} /> بيانات العلاج
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">أساسي</Badge>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-cyan-50/30 to-transparent dark:from-cyan-950/10">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">الطبيب المعالج</Label>
                    <Select value={laserFormDoctorId} onValueChange={setLaserFormDoctorId}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر الطبيب..." />
                      </SelectTrigger>
                      <SelectContent>
                        {doctors.filter(d => d.active).map(d => (
                          <SelectItem key={d.id} value={d.id}>{d.name}{d.specialty && <span className="text-slate-400 text-xs"> - {d.specialty}</span>}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">منطقة الجسم <span className="text-red-500">*</span></Label>
                    <Select value={laserFormArea} onValueChange={setLaserFormArea}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر المنطقة..." />
                      </SelectTrigger>
                      <SelectContent>
                        {BODY_AREAS.map(area => (
                          <SelectItem key={area.id} value={area.id}>{area.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">نوع البشرة</Label>
                    <Select value={laserFormSkinType} onValueChange={setLaserFormSkinType}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر النوع..." />
                      </SelectTrigger>
                      <SelectContent>
                        {SKIN_TYPES.map(st => (
                          <SelectItem key={st.id} value={st.id}>{st.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">لون الشعر</Label>
                    <Select value={laserFormHairColor} onValueChange={setLaserFormHairColor}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر اللون..." />
                      </SelectTrigger>
                      <SelectContent>
                        {HAIR_COLORS.map(hc => (
                          <SelectItem key={hc.id} value={hc.id}>{hc.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs font-semibold text-cyan-700 dark:text-cyan-300 mb-1.5 block">كثافة الشعر</Label>
                    <Select value={laserFormHairDensity} onValueChange={setLaserFormHairDensity}>
                      <SelectTrigger className="rounded-xl h-10 border-2 border-cyan-200 dark:border-cyan-700 text-sm focus:border-cyan-400">
                        <SelectValue placeholder="اختر الكثافة..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="light">خفيف</SelectItem>
                        <SelectItem value="medium">متوسط</SelectItem>
                        <SelectItem value="dense">كثيف</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Section 3: إعدادات الجهاز ═══ */}
            <div className="rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-emerald-500 to-teal-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">3</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Settings size={15} /> إعدادات الجهاز
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">اختياري</Badge>
              </div>
              <div className="p-4 bg-gradient-to-b from-emerald-50/30 to-transparent dark:from-emerald-950/10">
                <div className="grid grid-cols-3 gap-3">
                  <div><Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 block">اسم الجهاز</Label><Input value={laserFormMachine} onChange={e => setLaserFormMachine(e.target.value)} placeholder="Soprano" className="rounded-xl h-10 text-sm border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400" /></div>
                  <div><Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 block">الطاقة (J)</Label><Input type="number" value={laserFormEnergy} onChange={e => setLaserFormEnergy(e.target.value)} placeholder="14" className="rounded-xl h-10 text-sm border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400" /></div>
                  <div><Label className="text-xs font-semibold text-emerald-700 dark:text-emerald-300 mb-1.5 block">النبض (ms)</Label><Input value={laserFormPulse} onChange={e => setLaserFormPulse(e.target.value)} placeholder="20" className="rounded-xl h-10 text-sm border-2 border-emerald-200 dark:border-emerald-700 focus:border-emerald-400" /></div>
                </div>
              </div>
            </div>

            {/* ═══ Section 4: التكلفة ═══ */}
            <div className="rounded-2xl border-2 border-amber-200/50 dark:border-amber-800/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-amber-500 to-orange-500 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">4</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <DollarSign size={15} /> التكلفة والسداد
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">💰 مالي</Badge>
              </div>
              <div className="p-4 space-y-3 bg-gradient-to-b from-amber-50/30 to-transparent dark:from-amber-950/10">
                <div className="grid grid-cols-2 gap-3">
                  <div><Label className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5 block">عدد الجلسات</Label><Input value={laserFormSessions} onChange={e => setLaserFormSessions(e.target.value)} type="number" className="rounded-xl h-10 text-sm text-center border-2 border-amber-200 dark:border-amber-700 focus:border-amber-400 font-bold" /></div>
                  <div><Label className="text-xs font-semibold text-amber-700 dark:text-amber-300 mb-1.5 block">سعر الجلسة (ج.م) <span className="text-red-500">*</span></Label><Input type="number" value={laserFormPrice} onChange={e => setLaserFormPrice(e.target.value)} placeholder="0" className="rounded-xl h-10 text-sm text-center border-2 border-amber-200 dark:border-amber-700 focus:border-amber-400 font-bold" /></div>
                </div>
                {laserFormPrice && parseInt(laserFormSessions) > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl bg-gradient-to-l from-teal-500 to-emerald-500 border border-teal-300 dark:border-teal-600 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-white font-bold">إجمالي الباقة ({laserFormSessions} جلسة)</p>
                        <p className="text-[10px] text-teal-100 mt-0.5">يُسجّل تلقائياً في النظام المالي</p>
                      </div>
                      <div className="text-2xl font-black text-white animate-pulse-scale">{formatCurrency(parseFloat(laserFormPrice) * parseInt(laserFormSessions))}</div>
                    </div>
                  </motion.div>
                )}
                <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-200 dark:border-amber-700">
                  <Label className="text-xs font-bold text-amber-700 dark:text-amber-300">حالة الدفع:</Label>
                  <div className="flex gap-2">
 <button onClick={() => setLaserFormPaid(true)} className={cn('px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', laserFormPaid ? 'bg-gradient-to-l from-emerald-500 to-green-600 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700')}>✅ مدفوع</button>
 <button onClick={() => setLaserFormPaid(false)} className={cn('px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', !laserFormPaid ? 'bg-gradient-to-l from-amber-500 to-orange-500 text-white shadow-md' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700')}>⏳ غير مدفوع</button>
                  </div>
                </div>
              </div>
            </div>

            {/* ═══ Section 5: ملاحظات ═══ */}
            <div className="rounded-2xl border-2 border-slate-200/50 dark:border-slate-700/50 overflow-hidden shadow-sm">
              <div className="bg-gradient-to-l from-slate-500 to-slate-600 px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center">
                    <span className="text-white text-sm font-black">5</span>
                  </div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileText size={15} /> ملاحظات
                  </h3>
                </div>
                <Badge className="bg-white/20 text-white border-white/30 text-[9px]">اختياري</Badge>
              </div>
              <div className="p-4 bg-gradient-to-b from-slate-50/30 to-transparent dark:from-slate-900/10">
                <Textarea value={laserFormNotes} onChange={e => setLaserFormNotes(e.target.value)} placeholder="ملاحظات عن الحالة أو التعليمات الخاصة بالعلاج..." className="rounded-xl min-h-[80px] text-sm border-2 border-slate-200 dark:border-slate-600 focus:border-teal-400 focus:ring-teal-400/20 resize-none" />
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2 p-4 border-t border-slate-200 dark:border-slate-700 bg-gradient-to-l from-slate-50 to-white dark:from-slate-900 dark:to-slate-800">
            <Button variant="ghost" onClick={() => setShowAddLaserRecord(false)} className="rounded-xl text-slate-600 px-6">إلغاء</Button>
            <Button className="rounded-xl bg-gradient-to-l from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white font-bold h-12 px-8 shadow-lg" onClick={async () => {
              if (!laserFormPatientId) return toast.error('اختر المريض أولاً')
              if (!laserFormArea) return toast.error('اختر منطقة الجسم')

              try {
                const patientCheck = await apiFetch<any>(`/patients/${laserFormPatientId}`)
                if (!patientCheck?.id && !patientCheck?.patient?.id) {
                  toast.error('المريض غير موجود في قاعدة البيانات. قم بتحديث الصفحة وحاول مرة أخرى')
                  const freshPatients = await apiFetch<any>('/patients?limit=50000')
                  const pList = freshPatients?.patients || freshPatients?.data || freshPatients || []
                  if (Array.isArray(pList)) setPatients(pList)
                  return
                }
              } catch {
                toast.error('المريض غير موجود. قم بتحديث الصفحة وحاول مرة أخرى')
                const freshPatients = await apiFetch<any>('/patients?limit=50000')
                const pList = freshPatients?.patients || freshPatients?.data || freshPatients || []
                if (Array.isArray(pList)) setPatients(pList)
                return
              }

              const now = cairoISO()
              const patientName = patients.find(p => p.id === laserFormPatientId)?.name || 'مريض'
              const areaLabel = BODY_AREAS.find(a => a.id === laserFormArea)?.label || laserFormArea
              const sessionPrice = parseFloat(laserFormPrice) || 0
              let newRecordId: string | null = null

              const totalPrice = sessionPrice * (parseInt(laserFormSessions) || 6)
              try {
                const recordRes = await apiFetch<any>('/laser/records', {
                  method: 'POST',
                  body: JSON.stringify({
                    patientId: laserFormPatientId,
                    bodyArea: areaLabel,
                    skinType: laserFormSkinType || undefined,
                    hairColor: laserFormHairColor || undefined,
                    hairDensity: laserFormHairDensity || undefined,
                    totalSessions: parseInt(laserFormSessions) || 6,
                    price: sessionPrice,
                    totalPrice: totalPrice,
                    paid: laserFormPaid,
                    machineName: laserFormMachine || undefined,
                    energy: parseFloat(laserFormEnergy) || undefined,
                    pulse: laserFormPulse || undefined,
                    status: 'active',
                    notes: laserFormNotes || undefined
                  })
                })
                const newRecord = recordRes?.record || recordRes?.data || recordRes
                if (newRecord?.id) { setLaserRecords(prev => [newRecord, ...prev]); newRecordId = newRecord.id }
              } catch (e: any) {
                toast.error('خطأ في إنشاء سجل الليزر: ' + (e.message || 'حاول مرة أخرى'))
                return
              }

              if (newRecordId) {
                try {
                  await apiFetch('/laser/sessions', { method: 'POST', body: JSON.stringify({ laserRecordId: newRecordId, energy: parseFloat(laserFormEnergy) || undefined, pulse: laserFormPulse || undefined, date: now }) })
                } catch { /* non-critical */ }
              }

              if (sessionPrice > 0) {
                try {
                  const finRes = await apiFetch<any>('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'ليزر', amount: sessionPrice, description: `ليزر ${areaLabel} - ${patientName}${laserFormPaid ? '' : ' (غير مدفوع)'}`, date: now }) })
                  const finItem = finRes?.data || finRes?.transaction || finRes
                  if (finItem?.id) setTransactions(prev => [finItem, ...prev])
                } catch { /* non-critical */ }
              }

              try {
                const sessRes = await apiFetch<any>('/sessions', { method: 'POST', body: JSON.stringify({ patientId: laserFormPatientId, status: laserFormPaid ? 'completed' : 'scheduled', price: sessionPrice, paid: laserFormPaid, notes: `ليزر - ${areaLabel}${laserFormMachine ? ` - ${laserFormMachine}` : ''}`, date: now }) })
                const sessItem = sessRes?.data || sessRes?.session || sessRes
                if (sessItem?.id) setSessions(prev => [sessItem, ...prev])
              } catch { /* non-critical */ }

              setLaserFormArea(''); setLaserFormSkinType(''); setLaserFormHairColor(''); setLaserFormHairDensity(''); setLaserFormSessions('6'); setLaserFormNotes(''); setLaserFormPatientId(''); setLaserFormPatientSearch(''); setLaserFormPrice(''); setLaserFormPaid(false); setLaserFormMachine(''); setLaserFormEnergy(''); setLaserFormPulse(''); setLaserFormDoctorId(''); setShowAddLaserRecord(false)
              toast.success('تم تسجيل سجل الليزر بنجاح ✅')
            }}><Zap size={16} className="ml-1.5" /> حفظ السجل</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

<Dialog open={showAddLaserPackage} onOpenChange={setShowAddLaserPackage}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>باقة ليزر جديدة</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>اسم الباقة *</Label><Input id="lpName" placeholder="اسم الباقة" className="input-luxury rounded-xl" /></div><div className="grid grid-cols-2 gap-3"><div><Label>عدد الجلسات</Label><Input id="lpSess" type="number" placeholder="6" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input id="lpPrice" type="number" placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>منطقة الجسم</Label><Select><SelectTrigger className="rounded-xl"><SelectValue placeholder="اختر المنطقة" /></SelectTrigger><SelectContent>{BODY_AREAS.map(a => <SelectItem key={a.id} value={a.label}>{a.label}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/laser/packages', { name: (document.getElementById('lpName') as HTMLInputElement)?.value, sessionsCount: parseInt((document.getElementById('lpSess') as HTMLInputElement)?.value) || 6, price: parseFloat((document.getElementById('lpPrice') as HTMLInputElement)?.value) || 0, active: true }, setLaserPackages); setShowAddLaserPackage(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>


{/* Delete Laser Record */}
      {canDelete && <AlertDialog open={!!deleteLaserRecordConfirmId} onOpenChange={() => setDeleteLaserRecordConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف سجل الليزر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف سجل الليزر هذا؟ سيتم حذف جميع الجلسات والمعاملات المالية المرتبطة به نهائياً.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => {
            if (!deleteLaserRecordConfirmId) return
            try {
              const r = laserRecords.find(rec => rec.id === deleteLaserRecordConfirmId)
              await apiFetch(`/laser/records/${deleteLaserRecordConfirmId}`, { method: 'DELETE' })
              if (r) {
                const rP = r.patient || patients.find(pt => pt.id === r.patientId)
                const rSess2 = r.laserSessions || []
                const areaLabel = BODY_AREAS.find(a => a.id === r.bodyArea || a.label === r.bodyArea)?.label || r.bodyArea

                // 1. Remove related transactions
                const rTxIds = new Set<string>()
                if (rP) {
                  rSess2.filter(s => s.paid).forEach(s => {
                    const t = transactions.find(tx => tx.description?.includes(`جلسة ليزر #${s.sessionNumber}`) && tx.description?.includes(rP!.name) && tx.category === 'ليزر')
                    if (t) rTxIds.add(t.id)
                  })
                  // Also remove initial record transaction
                  const initTx = transactions.find(tx => tx.category === 'ليزر' && tx.description?.includes(rP.name) && tx.description?.includes(areaLabel) && !tx.description?.includes('جلسة ليزر #'))
                  if (initTx) rTxIds.add(initTx.id)
                }
                setTransactions(prev => prev.filter(t => !rTxIds.has(t.id)))

                // 2. Remove related regular sessions
                if (rP) {
                  const relatedSessions = sessions.filter(s => s.patientId === r.patientId && s.notes?.includes('ليزر') && s.notes?.includes(areaLabel))
                  const rSessIds = new Set(relatedSessions.map(s => s.id))
                  if (rSessIds.size > 0) setSessions(prev => prev.filter(s => !rSessIds.has(s.id)))
                }
              }
              setLaserRecords(prev => prev.filter(rec => rec.id !== deleteLaserRecordConfirmId))
              if (selectedLaserRecordId === deleteLaserRecordConfirmId) setSelectedLaserRecordId(null)
              toast.success('تم حذف السجل والمعاملات المالية المرتبطة ✅')
            } catch { toast.error('خطأ في الحذف') }
            setDeleteLaserRecordConfirmId(null)
          }}>حذف نهائي</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>}

{/* Delete Laser Session */}
      {canDelete && <AlertDialog open={!!deleteLaserSessionConfirmId} onOpenChange={() => setDeleteLaserSessionConfirmId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف جلسة الليزر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذه الجلسة؟ سيتم حذف المعاملة المالية والجلسة المرتبطة بها إذا كانت مدفوعة.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => {
            if (!deleteLaserSessionConfirmId) return
            try {
              const ls = laserRecords.flatMap(r => r.laserSessions || []).find(s => s.id === deleteLaserSessionConfirmId)
              await apiFetch(`/laser/sessions/${deleteLaserSessionConfirmId}`, { method: 'DELETE' })
              if (ls) {
                const parentRec = laserRecords.find(r => (r.laserSessions || []).some(s => s.id === deleteLaserSessionConfirmId))
                const pName = parentRec?.patient?.name || patients.find(pt => pt.id === parentRec?.patientId)?.name
                const areaLabel = parentRec ? BODY_AREAS.find(a => a.id === parentRec.bodyArea || a.label === parentRec.bodyArea)?.label || parentRec.bodyArea : ''

                // 1. Remove related transaction (by session number and patient name match)
                const relatedTx = transactions.find(t => t.description?.includes(`جلسة ليزر #${ls.sessionNumber}`) && t.description?.includes(pName || '') && t.category === 'ليزر')
                if (relatedTx) setTransactions(prev => prev.filter(t => t.id !== relatedTx.id))

                // 2. Also try to remove by broader match (ليرز areaLabel - patientName format)
                const broaderTx = transactions.find(t => t.category === 'ليزر' && t.description?.includes(pName || '') && t.description?.includes(areaLabel) && Math.abs(t.amount - ls.price) < 1)
                if (broaderTx && broaderTx.id !== relatedTx?.id) setTransactions(prev => prev.filter(t => t.id !== broaderTx.id))

                // 3. Remove related regular session
                const relatedSession = sessions.find(s => s.patientId === parentRec?.patientId && s.notes?.includes('ليزر') && s.notes?.includes(areaLabel) && Math.abs(s.price - ls.price) < 1 && s.date && ls.date && new Date(s.date).toDateString() === new Date(ls.date).toDateString())
                if (relatedSession) setSessions(prev => prev.filter(s => s.id !== relatedSession.id))

                // 4. Update laser records state
                setLaserRecords(prev => prev.map(r => (r.laserSessions || []).some(s => s.id === deleteLaserSessionConfirmId) ? { ...r, laserSessions: (r.laserSessions || []).filter(s => s.id !== deleteLaserSessionConfirmId), _count: { laserSessions: Math.max((r._count?.laserSessions || 1) - 1, 0) } } : r))
              }
              toast.success('تم حذف الجلسة والمعاملات المرتبطة ✅')
            } catch { toast.error('خطأ في الحذف') }
            setDeleteLaserSessionConfirmId(null)
          }}>حذف</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>}
    </>
  )
}
