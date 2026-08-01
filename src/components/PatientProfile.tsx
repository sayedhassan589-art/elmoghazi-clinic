'use client'

import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, usePatientFormStore } from '@/store'
import { useMemo } from 'react'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { ImprovementEntry, Patient, Visit, Session, Service, Note, LaserRecord, Transaction, Reminder } from '@/lib/types'
import { apiFetch, waPhone, normalizePhone, cairoISO, cairoDateTime, getImprovementColor, getImprovementEmoji, getImprovementHistory, getVisitCategory, VISIT_TYPES } from '@/lib/helpers'
import { addItem, deleteItem } from '@/lib/crud-helpers'
import { toast } from 'sonner'
import { motion } from 'framer-motion'
import { Activity, AlertTriangle, Bell, Calendar, CheckCircle, ChevronDown, ClipboardCheck, Clock, DollarSign, Edit3, FileText, Hash, Heart, Lock, MapPin, Phone, Plus, Receipt, Send, Shield, Sparkles, Star, Stethoscope, StickyNote, ThumbsUp, Timer, Trash2, Wallet, Zap, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'

// ─── PatientProfile Component (self-contained) ──────────────────────────────────
export default function PatientProfile() {
  // ─── Stores ────────────────────────────────────────────────────
  const { userRole } = useAuthStore()
  const { defaultCheckupPrice, defaultRevisitPrice, setActiveTab } = useClinicStore()
  const { patients, setPatients, visits, setVisits, sessions, setSessions, services, notes, setNotes, laserRecords, setLaserRecords, transactions, setTransactions, reminders, setReminders, waitingQueue, setWaitingQueue, patientPhotos, setPatientPhotos, refreshPatientPhotos } = useDataStore()
  const { selectedPatient, setSelectedPatient, patientDetailTab, setPatientDetailTab, editingPatient, setEditingPatient, deletePatientConfirmOpen, setDeletePatientConfirmOpen, showAddSessionProfile, setShowAddSessionProfile, showAddVisitProfile, setShowAddVisitProfile, showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement, showAddLaserRecord, setShowAddLaserRecord, laserFormPatientId, setLaserFormPatientId, laserFormPatientSearch, setLaserFormPatientSearch } = useUIStore()
  const { editPatientForm, setEditPatientForm, profileSessionServiceId, setProfileSessionServiceId, profileSessionPrice, setProfileSessionPrice, profileSessionNotes, setProfileSessionNotes, profileSessionDate, setProfileSessionDate, profileVisitType, setProfileVisitType, profileVisitPrice, setProfileVisitPrice, profileVisitNotes, setProfileVisitNotes, profileVisitDate, setProfileVisitDate, quickNote, setQuickNote, editingNoteId, setEditingNoteId, editingNoteContent, setEditingNoteContent, editingVisitId, setEditingVisitId, editVisitForm, setEditVisitForm, editingSessionId, setEditingSessionId, editSessionForm, setEditSessionForm, improvementSliderValue, setImprovementSliderValue, improvementNote, setImprovementNote } = usePatientFormStore()

  // ─── Role-based access ─────────────────────────────────────────
  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor
  const canEditPatientFull = isDoctor


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
        if (newTxn?.id) {
          setTransactions(prev => [newTxn, ...prev])
        } else {
          setTransactions(prev => [...prev, { id: 'sp-' + Date.now(), type: 'income', category, amount: s.price, description, date: txnDate }])
        }
      } catch { setTransactions(prev => [...prev, { id: 'sp-' + Date.now(), type: 'income', category, amount: s.price, description, date: txnDate }]) }
      setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss))
      toast.success('تم الدفع ✅')
    } catch { toast.error('خطأ') }
  }

  // Delete patient with full cascade cleanup
  const deletePatientWithFinance = async () => {
    if (!selectedPatient) return
    try {
      const pId = selectedPatient.id
      const pName = selectedPatient.name
      // Delete all visits
      const patientVisits = visits.filter(v => v.patientId === pId)
      for (const v of patientVisits) { await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }) }
      // Delete all sessions
      const patientSessions = sessions.filter(s => s.patientId === pId)
      for (const s of patientSessions) { await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }) }
      // Delete related finance transactions
      const relatedTx = transactions.filter(t => t.description?.includes(pName))
      for (const tx of relatedTx) { await apiFetch(`/finance/transactions/${tx.id}`, { method: 'DELETE' }) }
      // Delete related notes
      const relatedNotes = notes.filter(n => n.patientId === pId)
      for (const n of relatedNotes) { await apiFetch(`/notes/${n.id}`, { method: 'DELETE' }) }
      // Delete patient
      await apiFetch(`/patients/${pId}`, { method: 'DELETE' })
      // Update all state
      setPatients(prev => prev.filter(p => p.id !== pId))
      setVisits(prev => prev.filter(v => v.patientId !== pId))
      setSessions(prev => prev.filter(s => s.patientId !== pId))
      setTransactions(prev => prev.filter(t => !t.description?.includes(pName)))
      setNotes(prev => prev.filter(n => n.patientId !== pId))
      setLaserRecords(prev => prev.filter(r => r.patientId !== pId))
      setSelectedPatient(null)
      setDeletePatientConfirmOpen(false)
      toast.success('تم حذف المريض وكل البيانات المرتبطة ✅')
    } catch { toast.error('خطأ في الحذف') }
  }
  // ─── useMemo: Filtered Patient Data ──────────────────────────────
  const pVisits = useMemo(() => visits.filter(v => selectedPatient && v.patientId === selectedPatient.id), [visits, selectedPatient])
  const pSessions = useMemo(() => sessions.filter(s => selectedPatient && s.patientId === selectedPatient.id), [sessions, selectedPatient])
  const pLaser = useMemo(() => laserRecords.filter(l => selectedPatient && l.patientId === selectedPatient.id), [laserRecords, selectedPatient])
  const pNotes = useMemo(() => notes.filter(n => selectedPatient && n.patientId === selectedPatient.id), [notes, selectedPatient])
  const pReminders = useMemo(() => reminders.filter(r => selectedPatient && r.patientId === selectedPatient.id), [reminders, selectedPatient])
  const pTransactions = useMemo(() => transactions.filter(t => selectedPatient && t.description?.includes(selectedPatient.name)), [transactions, selectedPatient])
  const pLaserSessions = useMemo(() => pLaser.flatMap(r => r.laserSessions || []), [pLaser])

  // ─── Render ────────────────────────────────────────────────────
  // activeTab guard is handled by parent page.tsx conditional rendering
  if (!selectedPatient) return null

  return (
  <div className="space-y-4">
<button initial={{ x: -10 }} animate={{ x: 0 }} onClick={() => setSelectedPatient(null)} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 text-sm font-bold hover:shadow-md transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><ChevronDown size={16} className="rotate-90 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /> العودة للقائمة</button>

    {/* ═══ PATIENT HEADER — Luxury Premium Design ═══ */}
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl shadow-xl border-0">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-600 to-violet-700" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/15 rounded-full blur-3xl animate-drift-a"/>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-cyan-300/15 rounded-full blur-3xl animate-drift-a"/>
        <div className="absolute top-1/2 left-1/2 w-36 h-36 bg-amber-200/10 rounded-full blur-3xl animate-drift-a"/>
      </div>
      <div className="relative z-10 p-6">
        <div className="flex items-start gap-4">
          <div className="relative">
            <Avatar className="h-22 w-22 border-4 shadow-2xl" style={{ borderColor: selectedPatient.colorTag || '#818cf8', width: 88, height: 88 }}><AvatarFallback className="bg-white/20 backdrop-blur-sm text-white text-3xl font-black" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.name?.charAt(0)}</AvatarFallback></Avatar>
            {selectedPatient.starred && <span className="absolute -top-1 -right-1 text-xl animate-wiggle-wide">⭐</span>}
            {selectedPatient.improved && <span className="absolute -bottom-1 -right-1 text-lg">💗</span>}
            {selectedPatient.publishable && <span className="absolute top-1/2 -left-2 text-lg">👍</span>}
            {selectedPatient.dangerous && <span className="absolute -bottom-1 -left-2 text-lg animate-pulse-scale-lg">💀</span>}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{safeName(selectedPatient.name)}</h2>
              {/* Improvement Ring */}
              {(() => {
                const score = selectedPatient.improvementScore || 0
                const colors = getImprovementColor(score)
                const history = getImprovementHistory(selectedPatient.improvementHistory)
                const prevScore = history.length >= 2 ? history[history.length - 2]?.score : undefined
                const trend = prevScore !== undefined ? (score > prevScore ? 'up' : score < prevScore ? 'down' : 'same') : undefined
                const radius = 28
                const circumference = 2 * Math.PI * radius
                const progress = score > 0 ? (score / 10) * circumference : 0
                return (
                  <div className="improvement-ring" style={{ width: 68, height: 68 }} onClick={() => { setImprovementSliderValue(score || 5); setImprovementNote(''); setShowImprovementSlider(true) }}>
                    <svg width="68" height="68" viewBox="0 0 68 68">
                      <circle cx="34" cy="34" r={radius} fill="none" stroke="var(--muted)" strokeWidth="5" />
                      {score > 0 && <motion.circle cx="34" cy="34" r={radius} fill="none" stroke={colors.ring} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: circumference - progress }} transition={{ duration: 1, ease: 'easeOut' }} />}
                    </svg>
                    <div className="improvement-ring-label">
                      <span className="emoji">{score > 0 ? getImprovementEmoji(score) : '➕'}</span>
                      <span className="score text-sm" style={{ color: score > 0 ? colors.ring : 'var(--muted-foreground)' }}>{score > 0 ? score : '-'}</span>
                    </div>
                    {trend && (
                      <span className={cn('improvement-trend absolute -top-1 -left-1', trend === 'up' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' : trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400')}>
                        {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'}
                      </span>
                    )}
                  </div>
                )
              })()}
            </div>
            <div className="flex items-center gap-2 text-sm mt-2 flex-wrap">
              <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg font-bold text-white/90 text-xs border border-white/10"><Hash size={11} />{selectedPatient.fileNumber}</span>
              {selectedPatient.phone && <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white/90 text-xs border border-white/10"><Phone size={11} />{selectedPatient.phone}</span>}
              {selectedPatient.age && <span className="flex items-center gap-1 bg-white/15 backdrop-blur-sm px-2.5 py-1 rounded-lg text-white/90 text-xs border border-white/10">🎂 {selectedPatient.age} سنة</span>}
              {selectedPatient.gender && <Badge className="text-[10px] font-bold bg-white/20 backdrop-blur-sm text-white border border-white/20">🔬 {selectedPatient.gender}</Badge>}
            </div>
            {selectedPatient.dangerous && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="mt-3 p-2.5 rounded-xl bg-red-500/30 backdrop-blur-sm border-2 border-red-400/50 flex items-center gap-2">
                <span className="text-lg animate-pulse-scale-lg">💀</span>
                <span className="text-xs font-bold text-red-100">حالة خطر — تحتاج متابعة دقيقة</span>
              </motion.div>
            )}
          </div>
        </div>
        {/* Quick Actions — Glass Style */}
        <div className="flex items-center gap-2 mt-4 flex-wrap">
{canEditPatientFull && <button onClick={() => { setEditingPatient(!editingPatient); if (!editingPatient) setEditPatientForm({ name: selectedPatient.name, phone: selectedPatient.phone || '', phone2: selectedPatient.phone2 || '', age: String(selectedPatient.age || ''), gender: selectedPatient.gender || '', address: selectedPatient.address || '', bloodType: selectedPatient.bloodType || '', medicalHistory: selectedPatient.medicalHistory || '', notes: selectedPatient.notes || '' }) }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', editingPatient ? 'bg-white/30 border-white/40 text-white shadow-lg' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Edit3 size={13} /> تعديل</button>}
{!isDoctor && <button onClick={() => { setEditingPatient(!editingPatient); if (!editingPatient) setEditPatientForm({ name: selectedPatient.name, phone: selectedPatient.phone || '', phone2: selectedPatient.phone2 || '', age: String(selectedPatient.age || ''), gender: selectedPatient.gender || '', address: selectedPatient.address || '', bloodType: selectedPatient.bloodType || '', medicalHistory: selectedPatient.medicalHistory || '', notes: selectedPatient.notes || '' }) }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', editingPatient ? 'bg-white/30 border-white/40 text-white shadow-lg' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Edit3 size={13} /> تعديل اسم/تاريخ</button>}
{canDelete && <button onClick={() => setDeletePatientConfirmOpen(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-red-500/30 backdrop-blur-sm border border-red-400/30 text-red-100 hover:bg-red-500/40 transition-all active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150"><Trash2 size={13} /> حذف</button>}
<button onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ starred: !selectedPatient.starred }) }); const u = { ...selectedPatient, starred: !selectedPatient.starred }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success(selectedPatient.starred ? 'تم إزالة التمييز' : 'تم التمييز ⭐') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', selectedPatient.starred ? 'bg-amber-400/30 border-amber-400/40 text-amber-100' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Star size={13} className={selectedPatient.starred ? 'fill-amber-300' : ''} /> {selectedPatient.starred ? 'مميز' : 'تمييز'}</button>
<button onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ improved: !selectedPatient.improved }) }); const u = { ...selectedPatient, improved: !selectedPatient.improved }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success(selectedPatient.improved ? 'تم إزالة التحسن' : 'تم تسجيل التحسن 💗') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', selectedPatient.improved ? 'bg-pink-400/30 border-pink-400/40 text-pink-100' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><Heart size={13} className={selectedPatient.improved ? 'fill-pink-300' : ''} /> {selectedPatient.improved ? 'متحسن' : 'تحسن'}</button>
{isDoctor && <button onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ publishable: !selectedPatient.publishable }) }); const u = { ...selectedPatient, publishable: !selectedPatient.publishable }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success(selectedPatient.publishable ? 'تم إزالة علامة النشر' : 'تم وضع علامة النشر 👍') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', selectedPatient.publishable ? 'bg-green-400/30 border-green-400/40 text-green-100' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><ThumbsUp size={13} className={selectedPatient.publishable ? 'fill-green-300' : ''} /> {selectedPatient.publishable ? 'للنشر' : 'نشر'}</button>}
{isDoctor && <button onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ dangerous: !selectedPatient.dangerous }) }); const u = { ...selectedPatient, dangerous: !selectedPatient.dangerous }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success(selectedPatient.dangerous ? 'تم إزالة علامة الخطر' : 'تم وضع علامة الخطر 💀') } catch { toast.error('خطأ') } }} className={cn('flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all border backdrop-blur-sm active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150', selectedPatient.dangerous ? 'bg-red-500/40 border-red-400/50 text-red-100' : 'bg-white/15 border-white/20 text-white/90 hover:bg-white/25')}><AlertTriangle size={13} className={selectedPatient.dangerous ? 'text-red-300' : ''} /> {selectedPatient.dangerous ? 'خطر' : '⚠️ خطر'}</button>}
<button onClick={async () => { const alreadyInQueue = waitingQueue.find(w => w.patientId === selectedPatient.id && (w.status === 'waiting' || w.status === 'in-progress')); if (alreadyInQueue) { toast.info('المريض موجود بالفعل في قائمة الانتظار ⏳'); return } await addItem('/waiting', { patientId: selectedPatient.id, patientName: selectedPatient.name, priority: selectedPatient.dangerous ? 2 : 1, status: 'waiting', notes: selectedPatient.dangerous ? '⚠️ حالة خطر' : undefined }, setWaitingQueue); toast.success(selectedPatient.dangerous ? 'تم الإضافة لقائمة الانتظار كحالة عاجلة ⏳🚨' : 'تم الإضافة لقائمة الانتظار ⏳') }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-orange-400/30 backdrop-blur-sm border border-orange-400/30 text-orange-100 hover:bg-orange-400/40 transition-all active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150"><Timer size={13} /> انتظار</button>
{selectedPatient.phone && <button onClick={() => { const wp = waPhone(selectedPatient.phone); if (wp) window.open(`https://wa.me/${wp}`, '_blank') }} className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500/30 backdrop-blur-sm border border-emerald-400/30 text-emerald-100 hover:bg-emerald-500/40 transition-all active:scale-[0.95] hover:scale-[1.03] transition-transform duration-150"><Send size={12} /> واتساب</button>}
        </div>
        {/* Edit Patient Form */}
        {editingPatient && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-3 p-4 rounded-2xl border border-blue-200 dark:border-blue-800 bg-white dark:bg-slate-900 space-y-3">
            {isDoctor ? (
            /* ─── Doctor: Full Edit ─── */
            <>
            <div className="flex items-center gap-2 mb-2"><Lock size={14} className="text-blue-500" /><span className="text-xs font-bold text-blue-600 dark:text-blue-400">تعديل كامل — صلاحيات الطبيب فقط</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold">الاسم</Label><Input value={editPatientForm.name} onChange={e => setEditPatientForm(prev => ({ ...prev, name: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
              <div><Label className="text-xs font-bold">الهاتف</Label><Input dir="ltr" value={editPatientForm.phone} onChange={e => setEditPatientForm(prev => ({ ...prev, phone: normalizePhone(e.target.value) }))} className="input-luxury rounded-xl h-9 mt-1 text-left" /></div>
              <div><Label className="text-xs font-bold">هاتف آخر</Label><Input dir="ltr" value={editPatientForm.phone2} onChange={e => setEditPatientForm(prev => ({ ...prev, phone2: normalizePhone(e.target.value) }))} className="input-luxury rounded-xl h-9 mt-1 text-left" /></div>
              <div><Label className="text-xs font-bold">العمر</Label><Input type="number" value={editPatientForm.age} onChange={e => setEditPatientForm(prev => ({ ...prev, age: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
              <div><Label className="text-xs font-bold">التشخيص</Label><Input value={editPatientForm.gender} onChange={e => setEditPatientForm(prev => ({ ...prev, gender: e.target.value }))} placeholder="أدخل التشخيص..." className="rounded-xl h-9 mt-1" /></div>
              <div><Label className="text-xs font-bold">فصيلة الدم</Label><Select value={editPatientForm.bloodType} onValueChange={v => setEditPatientForm(p => ({ ...p, bloodType: v }))}><SelectTrigger className="rounded-xl h-9 mt-1"><SelectValue /></SelectTrigger><SelectContent>{['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}</SelectContent></Select></div>
              <div><Label className="text-xs font-bold">العنوان</Label><Input value={editPatientForm.address} onChange={e => setEditPatientForm(prev => ({ ...prev, address: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
              <div><Label className="text-xs font-bold">التاريخ المرضي</Label><Input value={editPatientForm.medicalHistory} onChange={e => setEditPatientForm(prev => ({ ...prev, medicalHistory: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
            </div>
            <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editPatientForm.notes} onChange={e => setEditPatientForm(prev => ({ ...prev, notes: e.target.value }))} className="input-luxury rounded-xl mt-1" rows={2} /></div>
            <div className="flex gap-2"><Button className="rounded-xl bg-blue-600 text-white" onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ name: editPatientForm.name, phone: editPatientForm.phone || null, phone2: editPatientForm.phone2 || null, age: parseInt(editPatientForm.age) || null, gender: editPatientForm.gender || null, address: editPatientForm.address || null, bloodType: editPatientForm.bloodType || null, medicalHistory: editPatientForm.medicalHistory || null, notes: editPatientForm.notes || null }) }); const updated = { ...selectedPatient, name: editPatientForm.name, phone: editPatientForm.phone || undefined, phone2: editPatientForm.phone2 || undefined, age: parseInt(editPatientForm.age) || undefined, gender: editPatientForm.gender || undefined, address: editPatientForm.address || undefined, bloodType: editPatientForm.bloodType || undefined, medicalHistory: editPatientForm.medicalHistory || undefined, notes: editPatientForm.notes || undefined }; setSelectedPatient(updated); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updated : p)); setEditingPatient(false); toast.success('تم تحديث البيانات') } catch { toast.error('خطأ في التحديث') } }}>حفظ</Button><Button variant="outline" onClick={() => setEditingPatient(false)}>إلغاء</Button></div>
            </>
            ) : (
            /* ─── Secretary: Limited Edit (Name/Phone/Date only) ─── */
            <>
            <div className="flex items-center gap-2 mb-2"><Shield size={14} className="text-amber-500" /><span className="text-xs font-bold text-amber-600 dark:text-amber-400">تعديل محدود — الأسماء والتواريخ فقط</span></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold">الاسم</Label><Input value={editPatientForm.name} onChange={e => setEditPatientForm(prev => ({ ...prev, name: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
              <div><Label className="text-xs font-bold">الهاتف</Label><Input dir="ltr" value={editPatientForm.phone} onChange={e => setEditPatientForm(prev => ({ ...prev, phone: normalizePhone(e.target.value) }))} className="input-luxury rounded-xl h-9 mt-1 text-left" /></div>
              <div><Label className="text-xs font-bold">هاتف آخر</Label><Input dir="ltr" value={editPatientForm.phone2} onChange={e => setEditPatientForm(prev => ({ ...prev, phone2: normalizePhone(e.target.value) }))} className="input-luxury rounded-xl h-9 mt-1 text-left" /></div>
              <div><Label className="text-xs font-bold">العمر</Label><Input type="number" value={editPatientForm.age} onChange={e => setEditPatientForm(prev => ({ ...prev, age: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
              <div><Label className="text-xs font-bold">العنوان</Label><Input value={editPatientForm.address} onChange={e => setEditPatientForm(prev => ({ ...prev, address: e.target.value }))} className="input-luxury rounded-xl h-9 mt-1" /></div>
            </div>
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800"><p className="text-xs text-amber-600 dark:text-amber-400 font-bold">⚠️ السكرتارية يمكنها تعديل الاسم والهاتف والعمر والعنوان فقط — تعديل التشخيص وفصيلة الدم والتاريخ المرضي متاح للطبيب فقط</p></div>
            <div className="flex gap-2"><Button className="rounded-xl bg-amber-600 text-white" onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ name: editPatientForm.name, phone: editPatientForm.phone || null, phone2: editPatientForm.phone2 || null, age: parseInt(editPatientForm.age) || null, address: editPatientForm.address || null }) }); const updated = { ...selectedPatient, name: editPatientForm.name, phone: editPatientForm.phone || undefined, phone2: editPatientForm.phone2 || undefined, age: parseInt(editPatientForm.age) || undefined, address: editPatientForm.address || undefined }; setSelectedPatient(updated); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? updated : p)); setEditingPatient(false); toast.success('تم تحديث الاسم والتواريخ') } catch { toast.error('خطأ في التحديث') } }}>حفظ</Button><Button variant="outline" onClick={() => setEditingPatient(false)}>إلغاء</Button></div>
            </>
            )}
          </motion.div>
        )}
        {/* Color Tag — Glass Style — Doctor Only */}
        {isDoctor && <div className="flex items-center gap-2 mt-3">
          <span className="text-[10px] text-white/60 font-bold">لون:</span>
          {['#3b82f6', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4', '#84cc16', '#6366f1'].map(c => (
            <button key={c} onClick={async () => { try { await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ colorTag: c }) }); const u = { ...selectedPatient, colorTag: c }; setSelectedPatient(u); setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p)); toast.success('تم تغيير اللون') } catch { toast.error('خطأ') } }} className={cn('w-6 h-6 rounded-full border-2 transition-all hover:scale-125', selectedPatient.colorTag === c ? 'border-white scale-125 shadow-lg shadow-white/20' : 'border-white/30 hover:border-white/60')} style={{ backgroundColor: c }} />
          ))}
        </div>}
        {(() => {
          const history = getImprovementHistory(selectedPatient.improvementHistory)
          if (history.length === 0) return null
          return (
            <div className="mt-3 p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10">
              <div className="flex items-center gap-2 mb-2">
                <Activity size={14} className="text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">سجل مؤشر التحسن</span>
              </div>
              <div className="max-h-32 overflow-y-auto custom-scrollbar space-y-0">
                {history.slice().reverse().map((entry, idx) => {
                  const entryColor = getImprovementColor(entry.score)
                  return (
                    <div key={idx} className="improvement-timeline-item">
                      <div className="flex items-center gap-2">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm flex-shrink-0" style={{ backgroundColor: entryColor.ring }} />
                        <span className="text-xs font-bold" style={{ color: entryColor.ring }}>{entry.score}/10</span>
                        <span className="text-[10px]">{getImprovementEmoji(entry.score)}</span>
                        <span className="text-[10px] text-muted-foreground">{formatDate(entry.date)}</span>
                        {entry.note && <span className="text-[10px] text-muted-foreground truncate max-w-[120px]">- {entry.note}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </div>
    </motion.div>

    {/* Improvement Score Slider Dialog */}
    <Dialog open={showImprovementSlider} onOpenChange={setShowImprovementSlider}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Activity size={18} className="text-emerald-600" /> مؤشر التحسن
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {/* Preview Ring */}
          {(() => {
            const previewColors = getImprovementColor(improvementSliderValue)
            const pRadius = 44
            const pCircumference = 2 * Math.PI * pRadius
            const pProgress = (improvementSliderValue / 10) * pCircumference
            return (
              <div className="flex justify-center">
                <div className="improvement-ring" style={{ width: 100, height: 100 }}>
                  <svg width="100" height="100" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r={pRadius} fill="none" stroke="var(--muted)" strokeWidth="7" />
                    <motion.circle cx="50" cy="50" r={pRadius} fill="none" stroke={previewColors.ring} strokeWidth="7" strokeLinecap="round" strokeDasharray={pCircumference} animate={{ strokeDashoffset: pCircumference - pProgress }} transition={{ duration: 0.4 }} />
                  </svg>
                  <div className="improvement-ring-label">
                    <span className="text-2xl">{getImprovementEmoji(improvementSliderValue)}</span>
                    <span className="score text-2xl" style={{ color: previewColors.ring }}>{improvementSliderValue}</span>
                    <span className="text-[10px] font-bold" style={{ color: previewColors.ring }}>{previewColors.label}</span>
                  </div>
                </div>
              </div>
            )
          })()}
          {/* Score Buttons 1-10 */}
          <div className="flex items-center justify-center gap-1.5 flex-wrap">
            {Array.from({ length: 10 }, (_, i) => i + 1).map(n => {
              const nColors = getImprovementColor(n)
              return (
<button className="active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" key={n} onClick={() => setImprovementSliderValue(n)}
                  className={cn('w-9 h-9 rounded-xl text-sm font-black transition-all border-2', improvementSliderValue === n ? 'text-white shadow-lg scale-110' : 'bg-white dark:bg-slate-800 border-border text-muted-foreground hover:scale-105')}
                  style={improvementSliderValue === n ? { backgroundColor: nColors.ring, borderColor: nColors.ring } : {}}>
                  {n}
                </button>
              )
            })}
          </div>
          {/* Note */}
          <div>
            <Label className="text-xs font-bold">ملاحظة (اختياري)</Label>
            <Input value={improvementNote} onChange={e => setImprovementNote(e.target.value)} placeholder="سبب التغيير..." className="input-luxury rounded-xl h-9 mt-1" />
          </div>
          <Button className="w-full rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-700 text-white shadow-lg" onClick={async () => {
            try {
              const history = getImprovementHistory(selectedPatient.improvementHistory)
              const newEntry: ImprovementEntry = { score: improvementSliderValue, date: cairoISO(), note: improvementNote || undefined }
              const newHistory = [...history, newEntry]
              const historyStr = JSON.stringify(newHistory)
              await apiFetch(`/patients/${selectedPatient.id}`, { method: 'PUT', body: JSON.stringify({ improvementScore: improvementSliderValue, improvementHistory: historyStr }) })
              const u = { ...selectedPatient, improvementScore: improvementSliderValue, improvementHistory: historyStr }
              setSelectedPatient(u)
              setPatients(prev => prev.map(p => p.id === selectedPatient.id ? u : p))
              if (improvementSliderValue >= 8) {
                setCelebratingImprovement(true)
                setTimeout(() => setCelebratingImprovement(false), 2000)
                toast.success(`🎉 مؤشر التحسن: ${improvementSliderValue}/10 - ممتاز!`)
              } else {
                toast.success(`تم تحديث مؤشر التحسن: ${improvementSliderValue}/10`)
              }
              setShowImprovementSlider(false)
            } catch { toast.error('خطأ في التحديث') }
          }}>
            حفظ مؤشر التحسن
          </Button>
        </div>
        {/* Celebration Effect */}
        {celebratingImprovement && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="confetti-particle" style={{
                left: `${Math.random() * 100}%`,
                top: `${30 + Math.random() * 40}%`,
                backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#f97316', '#8b5cf6'][i % 6],
                animationDelay: `${i * 0.08}s`,
              }} />
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>

    {/* Delete Patient Confirmation — Doctor Only */}
    {canDelete && <AlertDialog open={deletePatientConfirmOpen} onOpenChange={setDeletePatientConfirmOpen}>
      <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف المريض</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف {selectedPatient?.name}؟ سيتم حذف جميع البيانات المرتبطة بما فيها سجلات وجلسات الليزر.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={deletePatientWithFinance}>حذف نهائي</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
    </AlertDialog>}

    {/* ═══ PATIENT DETAIL TABS — Elegant Navigation ═══ */}
    <Tabs value={patientDetailTab} onValueChange={setPatientDetailTab}>
      <TabsList className="w-full flex flex-wrap gap-1.5 bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-700">
        <TabsTrigger value="overview" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Activity size={12} className="inline ml-1" />نظرة</TabsTrigger>
        <TabsTrigger value="visits" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Stethoscope size={12} className="inline ml-1" />زيارات</TabsTrigger>
        <TabsTrigger value="sessions" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Zap size={12} className="inline ml-1" />جلسات</TabsTrigger>
        <TabsTrigger value="laser" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Zap size={12} className="inline ml-1 text-cyan-500" />ليزر</TabsTrigger>
        <TabsTrigger value="reminders" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><Bell size={12} className="inline ml-1 text-rose-500" />تذكيرات</TabsTrigger>
        <TabsTrigger value="finance" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><DollarSign size={12} className="inline ml-1 text-emerald-500" />مالية</TabsTrigger>
        <TabsTrigger value="notes" className="flex-1 text-[11px] min-w-[55px] font-bold rounded-xl py-2"><FileText size={12} className="inline ml-1 text-amber-500" />ملاحظات</TabsTrigger>
      </TabsList>

      {/* ═══ OVERVIEW — Premium Dashboard Style ═══ */}
      <TabsContent value="overview" className="space-y-4 mt-4">
        {(() => {
          // Already computed via useMemo above: pVisits, pSessions, pLaser, pLaserSessions, pNotes
          const totalSpent = pSessions.reduce((a, s) => a + s.price, 0) + pLaserSessions.reduce((a, s) => a + (s.price || 0), 0)
          const totalPaid = pSessions.filter(s => s.paid).reduce((a, s) => a + s.price, 0) + pLaserSessions.filter(s => s.paid).reduce((a, s) => a + (s.price || 0), 0)
          const totalUnpaid = totalSpent - totalPaid
          const latestVisit = pVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          const latestDiagnosis = latestVisit?.diagnosis || latestVisit?.notes
          return (
        <>

        {/* ─── Hero Info Cards ─── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Contact Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="relative overflow-hidden rounded-2xl border-2 border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-blue-950/20 dark:via-slate-900/40 dark:to-indigo-950/20 p-4 shadow-sm">
            <div className="absolute top-0 right-0 w-16 h-16 bg-blue-200/30 dark:bg-blue-700/10 rounded-full -translate-y-4 translate-x-4 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md"><Phone size={14} className="text-white" /></div>
                <h4 className="text-sm font-black text-blue-700 dark:text-blue-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>بيانات الاتصال</h4>
              </div>
              <div className="space-y-2">
                {selectedPatient.phone && <div className="flex items-center gap-2 p-2 rounded-xl bg-blue-50/80 dark:bg-blue-900/20"><Phone size={13} className="text-blue-500" /><div><p className="text-[10px] text-muted-foreground font-bold">الهاتف</p><a href={`tel:${selectedPatient.phone}`} className="text-sm font-bold text-blue-700 dark:text-blue-300 hover:underline" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.phone}</a></div></div>}
                {selectedPatient.phone2 && <div className="flex items-center gap-2 p-2 rounded-xl bg-teal-50/80 dark:bg-teal-900/20"><Phone size={13} className="text-teal-500" /><div><p className="text-[10px] text-muted-foreground font-bold">هاتف آخر</p><a href={`tel:${selectedPatient.phone2}`} className="text-sm font-bold text-teal-700 dark:text-teal-300 hover:underline" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.phone2}</a></div></div>}
                {selectedPatient.address && <div className="flex items-center gap-2 p-2 rounded-xl bg-indigo-50/80 dark:bg-indigo-900/20"><MapPin size={13} className="text-indigo-500" /><div><p className="text-[10px] text-muted-foreground font-bold">العنوان</p><p className="text-sm font-bold text-indigo-700 dark:text-indigo-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.address}</p></div></div>}
                {!selectedPatient.phone && !selectedPatient.phone2 && !selectedPatient.address && <p className="text-center text-muted-foreground text-xs py-3">لا توجد بيانات اتصال</p>}
              </div>
            </div>
          </motion.div>

          {/* Medical Card */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="relative overflow-hidden rounded-2xl border-2 border-rose-200 dark:border-rose-800/60 bg-gradient-to-br from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-slate-900/40 dark:to-pink-950/20 p-4 shadow-sm">
            <div className="absolute top-0 left-0 w-16 h-16 bg-rose-200/30 dark:bg-rose-700/10 rounded-full -translate-y-4 -translate-x-4 blur-xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-rose-500 to-pink-600 shadow-md"><Heart size={14} className="text-white" /></div>
                <h4 className="text-sm font-black text-rose-700 dark:text-rose-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>البيانات الطبية</h4>
              </div>
              <div className="space-y-2">
                {selectedPatient.bloodType && <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50/80 dark:bg-red-900/20"><div className="w-8 h-8 rounded-lg bg-red-500 text-white flex items-center justify-center font-black text-xs shadow-sm">{selectedPatient.bloodType}</div><div><p className="text-[10px] text-muted-foreground font-bold">فصيلة الدم</p><p className="text-sm font-bold text-red-700 dark:text-red-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.bloodType}</p></div></div>}
                {selectedPatient.allergies && <div className="flex items-center gap-2 p-2 rounded-xl bg-amber-50/80 dark:bg-amber-900/20"><AlertTriangle size={13} className="text-amber-500" /><div><p className="text-[10px] text-muted-foreground font-bold">الحساسية</p><p className="text-sm font-bold text-amber-700 dark:text-amber-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.allergies}</p></div></div>}
                {selectedPatient.medicalHistory && <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50/80 dark:bg-purple-900/20"><ClipboardCheck size={13} className="text-purple-500" /><div><p className="text-[10px] text-muted-foreground font-bold">التاريخ المرضي</p><p className="text-sm font-bold text-purple-700 dark:text-purple-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{selectedPatient.medicalHistory}</p></div></div>}
                {latestDiagnosis && <div className="flex items-center gap-2 p-2 rounded-xl bg-violet-50/80 dark:bg-violet-900/20"><Stethoscope size={13} className="text-violet-500" /><div><p className="text-[10px] text-muted-foreground font-bold">آخر تشخيص</p><p className="text-sm font-bold text-violet-700 dark:text-violet-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{latestDiagnosis}</p></div></div>}
                {!selectedPatient.bloodType && !selectedPatient.medicalHistory && !selectedPatient.allergies && !latestDiagnosis && <p className="text-center text-muted-foreground text-xs py-3">لا توجد بيانات طبية</p>}
              </div>
            </div>
          </motion.div>
        </div>

        {/* ─── Patient Notes ─── */}
        {selectedPatient.notes && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="relative overflow-hidden rounded-2xl border-2 border-amber-200 dark:border-amber-800/60 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 dark:from-amber-950/20 dark:via-slate-900/40 dark:to-orange-950/20 p-4 shadow-sm">
            <div className="absolute top-0 left-0 w-20 h-20 bg-amber-200/30 dark:bg-amber-700/10 rounded-full -translate-y-6 -translate-x-6 blur-2xl" />
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 shadow-md"><StickyNote size={14} className="text-white" /></div>
                <h4 className="text-sm font-black text-amber-700 dark:text-amber-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>ملاحظات المريض</h4>
              </div>
              <p className="text-[15px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", lineHeight: '1.9' }}>{selectedPatient.notes}</p>
            </div>
          </motion.div>
        )}

        {/* ─── Quick Stats — Modern Dashboard Cards ─── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('visits')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-blue-200 dark:border-blue-800/60 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-sm hover:shadow-lg transition-all group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-blue-200/20 dark:bg-blue-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 w-fit mx-auto mb-2 shadow-md"><Stethoscope size={18} className="text-white" /></div>
              <p className="text-2xl font-black text-blue-600 dark:text-blue-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{pVisits.length}</p>
              <p className="text-xs font-bold text-blue-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>زيارة</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.25 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('sessions')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-orange-200 dark:border-orange-800/60 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/20 dark:to-amber-950/20 shadow-sm hover:shadow-lg transition-all group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-200/20 dark:bg-orange-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 w-fit mx-auto mb-2 shadow-md"><Zap size={18} className="text-white" /></div>
              <p className="text-2xl font-black text-orange-600 dark:text-orange-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{pSessions.length}</p>
              <p className="text-xs font-bold text-orange-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>جلسة</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('laser')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-cyan-200 dark:border-cyan-800/60 bg-gradient-to-br from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20 shadow-sm hover:shadow-lg transition-all group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-cyan-200/20 dark:bg-cyan-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 w-fit mx-auto mb-2 shadow-md"><Zap size={18} className="text-white" /></div>
              <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{pLaser.length}</p>
              <p className="text-xs font-bold text-cyan-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>ليزر</p>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.35 }} whileTap={{ scale: 0.95 }} onClick={() => setPatientDetailTab('finance')} className="relative overflow-hidden rounded-2xl p-4 text-center cursor-pointer border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/20 dark:to-green-950/20 shadow-sm hover:shadow-lg transition-all group">
            <div className="absolute -top-4 -right-4 w-20 h-20 bg-emerald-200/20 dark:bg-emerald-700/10 rounded-full blur-2xl group-hover:scale-150 transition-transform" />
            <div className="relative z-10">
              <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 w-fit mx-auto mb-2 shadow-md"><DollarSign size={18} className="text-white" /></div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{formatCurrency(totalSpent)}</p>
              <p className="text-xs font-bold text-emerald-500/70 mt-0.5" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>إجمالي</p>
            </div>
          </motion.div>
        </div>

        {/* ─── Financial Summary ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="relative overflow-hidden rounded-2xl border-2 border-emerald-200 dark:border-emerald-800/60 bg-gradient-to-br from-emerald-50 via-white to-green-50 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-green-950/20 p-4 shadow-sm">
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-200/20 dark:bg-emerald-700/10 rounded-full translate-y-8 -translate-x-8 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-green-600 shadow-md"><Wallet size={14} className="text-white" /></div>
              <h4 className="text-sm font-black text-emerald-700 dark:text-emerald-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>الملخص المالي</h4>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50">
                <p className="text-[10px] text-muted-foreground font-bold mb-1">المدفوع</p>
                <p className="text-lg font-black text-emerald-600 dark:text-emerald-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{formatCurrency(totalPaid)}</p>
              </div>
              <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/50">
                <p className="text-[10px] text-muted-foreground font-bold mb-1">المتبقي</p>
                <p className="text-lg font-black text-amber-600 dark:text-amber-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{formatCurrency(totalUnpaid)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* ─── Activity Timeline — Premium ─── */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="relative overflow-hidden rounded-2xl border-2 border-indigo-200 dark:border-indigo-800/60 bg-gradient-to-br from-indigo-50 via-white to-violet-50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-violet-950/20 p-4 shadow-sm">
          <div className="absolute top-0 right-0 w-20 h-20 bg-indigo-200/20 dark:bg-indigo-700/10 rounded-full -translate-y-6 translate-x-6 blur-2xl" />
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-md"><Activity size={14} className="text-white" /></div>
              <h4 className="text-sm font-black text-indigo-700 dark:text-indigo-400" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>سجل النشاط</h4>
              <Badge variant="outline" className="text-[9px] font-bold">{pVisits.length + pSessions.length + pNotes.length} حدث</Badge>
            </div>
            <div className="space-y-2 max-h-72 overflow-y-auto custom-scrollbar">
              {(() => {
                const pV = pVisits.map(v => ({ id: v.id, t: 'visit' as const, date: v.date, icon: <Stethoscope size={14} className="text-violet-500" />, label: VISIT_TYPES.find(ti => ti.id === v.type)?.label || v.type, detail: v.notes || v.diagnosis || '', color: 'bg-violet-500' }))
                const pS = pSessions.map(s => ({ id: s.id, t: 'session' as const, date: s.date, icon: <Zap size={14} className={s.paid ? 'text-emerald-500' : 'text-amber-500'} />, label: (services.find(sv => sv.id === s.serviceId)?.name || 'جلسة') + (s.paid ? ' ✅' : ''), detail: `${formatCurrency(s.price)}`, color: s.paid ? 'bg-emerald-500' : 'bg-amber-500' }))
                const pN = pNotes.map(n => ({ id: n.id, t: 'note' as const, date: n.createdAt, icon: <FileText size={14} className="text-amber-500" />, label: 'ملاحظة', detail: n.content, color: 'bg-amber-500' }))
                const tl = [...pV, ...pS, ...pN].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                if (tl.length === 0) return <div className="text-center py-8"><p className="text-sm font-bold text-muted-foreground" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>لا توجد عمليات بعد</p></div>
                return tl.slice(0, 15).map((item, idx) => (
                  <div key={`${item.t}-${item.id}`} className="flex items-start gap-3 p-2.5 rounded-xl bg-white/60 dark:bg-slate-800/40 hover:bg-white/90 dark:hover:bg-slate-800/60 transition-all border border-slate-100 dark:border-slate-800">
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white flex-shrink-0 shadow-sm', item.color)}>{item.icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><Badge variant="outline" className="text-[10px] font-bold" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{item.label}</Badge><span className="text-[10px] text-muted-foreground font-medium">{formatDate(item.date)}</span></div>
                      {item.detail && <p className="text-[13px] mt-1 font-medium text-slate-700 dark:text-slate-300 truncate" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{item.detail}</p>}
                    </div>
                  </div>
                ))
              })()}
            </div>
          </div>
        </motion.div>
        </>
        )})()}
      </TabsContent>

      {/* ═══ VISITS ═══ */}
      <TabsContent value="visits" className="space-y-3 mt-3">
        <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Stethoscope size={15} className="text-violet-500" /> الزيارات</h3>{isDoctor && <Button size="sm" className="rounded-xl bg-violet-600 text-white h-8 text-xs" onClick={() => { setProfileVisitType('checkup'); setProfileVisitPrice(String(defaultCheckupPrice)); setProfileVisitNotes(''); setProfileVisitDate(''); setShowAddVisitProfile(true) }}><Plus size={12} className="ml-1" /> زيارة</Button>}</div>
        {showAddVisitProfile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 space-y-2">
<div className="grid grid-cols-3 gap-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{VISIT_TYPES.slice(0, 3).map(vt => (<button key={vt.id} onClick={() => { setProfileVisitType(vt.id); if (vt.id === 'checkup') setProfileVisitPrice(String(defaultCheckupPrice)); else if (vt.id === 'revisit') setProfileVisitPrice(String(defaultRevisitPrice)); else setProfileVisitPrice(''); }} className={cn('flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 text-xs font-bold transition-all', profileVisitType === vt.id ? 'border-violet-500 bg-violet-100 dark:bg-violet-900/30 text-violet-700 shadow-md' : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted')}><span className="text-base active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{vt.emoji}</span>{vt.label}{vt.id === 'checkup' && <span className="text-[8px] text-muted-foreground active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{defaultCheckupPrice} ج.م</span>}{vt.id === 'revisit' && <span className="text-[8px] text-muted-foreground active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{defaultRevisitPrice} ج.م</span>}</button>))}</div>
            <div className="grid grid-cols-2 gap-2"><div><Label className="text-[10px] font-bold">السعر (ج.م)</Label><Input type="number" value={profileVisitPrice} onChange={e => setProfileVisitPrice(e.target.value)} placeholder={profileVisitType === 'checkup' ? String(defaultCheckupPrice) : profileVisitType === 'revisit' ? String(defaultRevisitPrice) : '0'} className="input-luxury rounded-xl h-9 mt-0.5" /></div><div><Label className="text-[10px] font-bold">ملاحظات</Label><Input value={profileVisitNotes} onChange={e => setProfileVisitNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-9 mt-0.5" /></div></div>
            <div><Label className="text-[10px] font-bold text-cyan-600 flex items-center gap-1"><Calendar size={10} /> تاريخ الزيارة (اختياري)</Label><Input type="date" value={profileVisitDate || cairoTodayInput()} onChange={e => setProfileVisitDate(e.target.value)} className="rounded-xl h-9 text-xs mt-0.5 border-cyan-200 dark:border-cyan-800" placeholder="اتركه فارغاً لتاريخ اليوم" /></div>
            <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white" onClick={async () => { const currentType = profileVisitType; const currentPrice = profileVisitPrice; const currentNotes = profileVisitNotes; const vDate = cairoDateTime(profileVisitDate); const patientName = selectedPatient.name; const patientId = selectedPatient.id; if (!currentType) { toast.error('اختر نوع الزيارة'); return; } const vPrice = parseFloat(String(currentPrice)) || 0; const cat = getVisitCategory(currentType); try { await addItem('/visits', { patientId, type: currentType, notes: currentNotes || undefined, date: vDate }, setVisits, true); if (vPrice > 0) { await addItem('/finance/transactions', { type: 'income', category: cat, amount: vPrice, description: `${cat} - ${patientName}`, date: vDate }, setTransactions, true); } } catch (e) { console.error('Visit save error:', e); } setShowAddVisitProfile(false); setProfileVisitType('checkup'); setProfileVisitPrice(''); setProfileVisitNotes(''); setProfileVisitDate(''); try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {} toast.success(`تم إضافة الزيارة - ${cat}${vPrice > 0 ? ` ${vPrice} ج.م` : ''}`) }}>حفظ</Button><Button variant="ghost" size="sm" onClick={() => setShowAddVisitProfile(false)}>إلغاء</Button></div>
          </motion.div>
        )}
        {visits.filter(v => v.patientId === selectedPatient.id).length === 0 && !showAddVisitProfile && <p className="text-center text-muted-foreground text-xs py-6">لا توجد زيارات</p>}
        {pVisits.map(v => { const vt = VISIT_TYPES.find(t => t.id === v.type); return <Card key={v.id} className="border border-slate-200 dark:border-slate-800 p-3">{editingVisitId === v.id ? (<div className="space-y-2 p-2 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-300"><div className="grid grid-cols-2 gap-2"><Select value={editVisitForm.type} onValueChange={val => setEditVisitForm(f => ({ ...f, type: val }))}><SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent>{VISIT_TYPES.slice(0,3).map(vt => <SelectItem key={vt.id} value={vt.id}>{vt.emoji} {vt.label}</SelectItem>)}</SelectContent></Select><Input value={editVisitForm.notes} onChange={e => setEditVisitForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." className="input-luxury rounded-xl h-8 text-xs" /></div><div><Label className="text-[10px]">السعر</Label><Input type="number" value={editVisitForm.price} onChange={e => setEditVisitForm(f => ({ ...f, price: e.target.value }))} className="input-luxury rounded-xl h-8 text-xs" /></div><div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white text-xs h-7" onClick={async () => { try { await apiFetch(`/visits/${v.id}`, { method: 'PUT', body: JSON.stringify({ type: editVisitForm.type, notes: editVisitForm.notes || undefined }) }); const oldCat = getVisitCategory(v.type); const newCat = getVisitCategory(editVisitForm.type); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === oldCat); if (relatedTx) { const newPrice = parseFloat(editVisitForm.price) || relatedTx.amount; await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'PUT', body: JSON.stringify({ category: newCat, amount: newPrice, description: `${newCat} - ${selectedPatient!.name}` }) }); setTransactions(prev => prev.map(t => t.id === relatedTx.id ? { ...t, category: newCat, amount: newPrice, description: `${newCat} - ${selectedPatient!.name}` } : t)); } setVisits(prev => prev.map(vv => vv.id === v.id ? { ...vv, type: editVisitForm.type, notes: editVisitForm.notes || undefined } : vv)); setEditingVisitId(null); toast.success('تم التعديل') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="text-xs h-7" onClick={() => setEditingVisitId(null)}>إلغاء</Button></div></div>) : (<div className="flex items-center justify-between"><div className="flex items-center gap-2"><div className={cn('p-2 rounded-lg text-white', vt?.bg || 'bg-gray-500')}>{vt?.emoji || '📝'}</div><div><div className="flex items-center gap-1.5"><Badge className={cn('text-white text-[8px]', vt?.bg || 'bg-gray-500')}>{vt?.label || v.type}</Badge><span className="text-[9px] text-muted-foreground">{formatDate(v.date)}</span></div>{v.notes && <p className="text-[11px] text-muted-foreground mt-0.5">{v.notes}</p>}</div></div><div className="flex gap-0.5">{canEditPatientFull && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || '', price: String(transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === getVisitCategory(v.type))?.amount || '') }) }}><Edit3 size={10} className="text-violet-500" /></Button>}{canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { const cat = getVisitCategory(v.type); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === cat); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); setVisits(prev => prev.filter(vv => vv.id !== v.id)); toast.success('تم الحذف') } catch { toast.error('خطأ') } }}><Trash2 size={10} className="text-red-500" /></Button>}</div></div>)}</Card> })}
      </TabsContent>

      {/* ═══ SESSIONS ═══ */}
      <TabsContent value="sessions" className="space-y-3 mt-3">
        <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Zap size={15} className="text-orange-500" /> الجلسات</h3>{isDoctor && <Button size="sm" className="rounded-xl bg-orange-500 text-white h-8 text-xs" onClick={() => setShowAddSessionProfile(true)}><Plus size={12} className="ml-1" /> جلسة</Button>}</div>
        {showAddSessionProfile && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="p-3 rounded-xl border border-orange-200 dark:border-orange-800 bg-orange-50/50 dark:bg-orange-950/20 space-y-2">
            {services.length > 0 && <div><Label className="text-[10px] font-bold">الخدمة</Label><Select value={profileSessionServiceId} onValueChange={setProfileSessionServiceId}><SelectTrigger className="rounded-xl h-9 mt-0.5 text-xs"><SelectValue placeholder="اختر الخدمة..." /></SelectTrigger><SelectContent>{services.filter(s => s.active).map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>}
            <div className="grid grid-cols-2 gap-2"><div><Label className="text-[10px] font-bold">السعر (ج.م)</Label><Input type="number" value={profileSessionPrice} onChange={e => setProfileSessionPrice(e.target.value)} placeholder="0" className="input-luxury rounded-xl h-9 mt-0.5" /></div><div><Label className="text-[10px] font-bold">ملاحظات</Label><Input value={profileSessionNotes} onChange={e => setProfileSessionNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-9 mt-0.5" /></div></div>
            <div><Label className="text-[10px] font-bold text-cyan-600 flex items-center gap-1"><Calendar size={10} /> تاريخ الجلسة (اختياري)</Label><Input type="date" value={profileSessionDate} onChange={e => setProfileSessionDate(e.target.value)} className="rounded-xl h-9 text-xs mt-0.5 border-cyan-200 dark:border-cyan-800" placeholder="اتركه فارغاً لتاريخ اليوم" /></div>
            <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-orange-500 text-white" onClick={async () => { const sDate = cairoDateTime(profileSessionDate); const sPrice = parseFloat(profileSessionPrice) || 0; await addItem('/sessions', { patientId: selectedPatient.id, serviceId: profileSessionServiceId || undefined, status: 'completed', price: sPrice, paid: true, notes: profileSessionNotes || undefined, date: sDate }, setSessions, true); if (sPrice > 0) { const svcName = services.find(sv => sv.id === profileSessionServiceId)?.name || 'جلسة'; await addItem('/finance/transactions', { type: 'income', category: 'جلسات', amount: sPrice, description: `${svcName} - ${selectedPatient.name}`, date: sDate }, setTransactions, true); } setShowAddSessionProfile(false); setProfileSessionServiceId(''); setProfileSessionPrice(''); setProfileSessionNotes(''); setProfileSessionDate(''); try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {} toast.success(`تم إضافة الجلسة${sPrice > 0 ? ` - ${sPrice} ج.م` : ''}`) }}>حفظ</Button><Button variant="ghost" size="sm" onClick={() => setShowAddSessionProfile(false)}>إلغاء</Button></div>
          </motion.div>
        )}
        {sessions.filter(s => s.patientId === selectedPatient.id).length === 0 && !showAddSessionProfile && <p className="text-center text-muted-foreground text-xs py-6">لا توجد جلسات</p>}
{pSessions.map(s => { const svc = services.find(sv => sv.id === s.serviceId); return <Card key={s.id} className="border border-slate-200 dark:border-slate-800 p-3 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{editingSessionId === s.id ? (<div className="space-y-2 p-2 rounded-xl bg-orange-50 dark:bg-orange-950/20 border border-orange-300 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div className="grid grid-cols-2 gap-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div><Label className="text-[10px] active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">السعر</Label><Input type="number" value={editSessionForm.price} onChange={e => setEditSessionForm(f => ({ ...f, price: e.target.value }))} className="input-luxury rounded-xl h-8 text-xs active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></div><div><Label className="text-[10px] active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">الحالة</Label><Select value={editSessionForm.status} onValueChange={val => setEditSessionForm(f => ({ ...f, status: val }))}><SelectTrigger className="rounded-xl h-8 text-xs active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="scheduled">مجدولة</SelectItem><SelectItem value="completed">مكتملة</SelectItem><SelectItem value="cancelled">ملغاة</SelectItem></SelectContent></Select></div></div><Input value={editSessionForm.notes} onChange={e => setEditSessionForm(f => ({ ...f, notes: e.target.value }))} placeholder="ملاحظات..." className="input-luxury rounded-xl h-8 text-xs active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /><div className="flex gap-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><Button size="sm" className="rounded-xl bg-orange-500 text-white text-xs h-7 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={async () => { try { const newPrice = parseFloat(editSessionForm.price) || s.price; await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice, status: editSessionForm.status, notes: editSessionForm.notes || undefined }) }); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && (t.category === 'جلسات' || t.category === 'ليزر')); if (relatedTx && newPrice !== s.price) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'PUT', body: JSON.stringify({ amount: newPrice }) }); setTransactions(prev => prev.map(t => t.id === relatedTx.id ? { ...t, amount: newPrice } : t)); } setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, price: newPrice, status: editSessionForm.status, notes: editSessionForm.notes || undefined } : ss)); setEditingSessionId(null); toast.success('تم التعديل') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="text-xs h-7 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => setEditingSessionId(null)}>إلغاء</Button></div></div>) : (<div className="flex items-center justify-between active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div className="flex items-center gap-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div className={cn('p-2 rounded-lg', s.paid ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>{s.paid ? <CheckCircle className="text-emerald-600 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" size={14} /> : <Clock className="text-amber-600 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" size={14} />}</div><div><p className="font-bold text-xs active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{svc?.name || 'جلسة'}</p><div className="flex items-center gap-1.5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><Badge variant="outline" className="text-[8px] active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{s.status === 'completed' ? 'مكتملة' : s.status === 'cancelled' ? 'ملغاة' : 'مجدولة'}</Badge>{s.paid ? <span className="text-[8px] text-emerald-600 font-bold active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">مدفوعة</span> : <span className="text-[8px] text-amber-600 font-bold active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">غير مدفوعة</span>}</div>{s.notes && <p className="text-[10px] text-muted-foreground mt-0.5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{s.notes}</p>}</div></div><div className="flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div className="text-left active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><p className="font-black text-xs text-orange-600 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{formatCurrency(s.price)}</p><p className="text-[9px] text-muted-foreground active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{formatDate(s.date)}</p>{!s.paid && <button onClick={() => markSessionPaid(s)} className="px-1.5 py-0.5 rounded bg-emerald-500 text-white text-[8px] font-bold mt-0.5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">دفع</button>}</div>{canEditPatientFull && <Button variant="ghost" size="icon" className="h-5 w-5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { setEditingSessionId(s.id); setEditSessionForm({ price: String(s.price), notes: s.notes || '', status: s.status, paid: s.paid }) }}><Edit3 size={9} className="text-orange-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></Button>}{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={async () => { try { const sDateStr = s.date ? new Date(s.date).toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }) : ''; const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && (t.category === 'جلسات' || t.category === 'ليزر') && t.amount === s.price && (sDateStr ? new Date(t.date).toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }) === sDateStr : true)); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }); setSessions(prev => prev.filter(ss => ss.id !== s.id)); toast.success('تم الحذف') } catch { toast.error('خطأ') } }}><Trash2 size={9} className="text-red-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></Button>}</div></div>)}</Card> })}
      </TabsContent>

      {/* ═══ LASER ═══ */}
      <TabsContent value="laser" className="space-y-3 mt-3">
        <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Zap size={15} className="text-cyan-500" /> سجلات الليزر</h3></div>
        {laserRecords.filter(l => l.patientId === selectedPatient.id).length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-3xl mb-2 animate-bounce-y">💎</div><p className="text-muted-foreground text-xs">لا توجد سجلات ليزر</p>{isDoctor && <Button size="sm" className="mt-2 rounded-xl bg-gradient-to-l from-cyan-500 to-teal-600 text-white text-xs" onClick={() => { setActiveTab('laser'); setShowAddLaserRecord(true); setLaserFormPatientId(selectedPatient.id); setLaserFormPatientSearch(selectedPatient.name) }}><Plus size={12} className="ml-1" /> إنشاء سجل</Button>}</Card>}
        {pLaser.map(l => {
          const areaInfo = BODY_AREAS.find(a => a.id === l.bodyArea || a.label === l.bodyArea)
          const lSess = l.laserSessions || []
          const laserSessCount = lSess.length || l._count?.laserSessions || 0
          const progressPercent = l.totalSessions > 0 ? Math.min((laserSessCount / l.totalSessions) * 100, 100) : 0
          const paidCount = lSess.filter(s => s.paid).length
          const unpaidCount = lSess.filter(s => !s.paid).length
          const totalSessionPaid = lSess.filter(s => s.paid).reduce((sum, s) => sum + (s.price || 0), 0)
          return (
            <motion.div key={l.id} whileHover={{ scale: 1.01, y: -1 }} whileTap={{ scale: 0.99 }}>
              <Card className="border-2 border-cyan-200 dark:border-cyan-800 p-3 cursor-pointer hover:shadow-lg transition-all" onClick={() => { setActiveTab('laser'); setSelectedLaserRecordId(l.id); setLaserDetailTab('overview') }}>
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-md animate-pulse-scale"><Zap size={16} /></div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2"><span className="font-bold text-sm">{areaInfo?.label || l.bodyArea}</span><Badge className={cn('text-[8px]', l.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>{l.status === 'active' ? '🟢 نشط' : l.status === 'completed' ? '🔵 مكتمل' : l.status === 'paused' ? '⏸️ متوقف' : l.status}</Badge></div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground mt-0.5">{l.skinType && <span>بشرة {l.skinType}</span>}{l.hairColor && <span>شعر {l.hairColor}</span>}{l.machineName && <span>| {l.machineName}</span>}</div>
                    {l.price > 0 && <p className="text-[10px] font-bold text-emerald-600 mt-0.5">{formatCurrency(l.price)}/جلسة - إجمالي: {formatCurrency(l.totalPrice || l.price * l.totalSessions)}</p>}
                    <div className="mt-1.5"><div className="flex items-center justify-between text-[9px] mb-0.5"><span>{laserSessCount}/{l.totalSessions} جلسة</span><span>{Math.round(progressPercent)}%</span></div><Progress value={progressPercent} className="h-1.5" /></div>
                    {laserSessCount > 0 && <div className="flex items-center gap-2 mt-1 text-[9px]"><span className="text-emerald-600 font-bold">✅ {paidCount} مدفوعة</span>{unpaidCount > 0 && <span className="text-amber-600 font-bold">⏳ {unpaidCount} متبقية</span>}<span className="text-muted-foreground">({formatCurrency(totalSessionPaid)})</span></div>}
                  </div>
                  <div className="flex flex-col items-center gap-1"><Eye size={14} className="text-cyan-500" /><span className="text-[8px] text-cyan-500 font-bold">عرض</span></div>
                </div>
              </Card>
            </motion.div>
          )
        })}
      </TabsContent>

      {/* ═══ REMINDERS ═══ */}
      <TabsContent value="reminders" className="space-y-3 mt-3">
        <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-2"><Bell size={15} className="text-rose-500" /> التذكيرات</h3><Button size="sm" className="rounded-xl bg-rose-500 text-white h-8 text-xs" onClick={() => { setReminderPatientId(selectedPatient.id); setShowAddReminder(true) }}><Plus size={12} className="ml-1" /> تذكير</Button></div>
        {reminders.filter(r => r.patientId === selectedPatient.id).length === 0 && <p className="text-center text-muted-foreground text-xs py-6">لا توجد تذكيرات</p>}
        {reminders.filter(r => r.patientId === selectedPatient.id).map(r => (
          <Card key={r.id} className="border border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 flex-1">
                <div className={cn('p-1.5 rounded-lg mt-0.5', r.type === 'urgent' ? 'bg-red-100 dark:bg-red-900/30' : r.type === 'important' ? 'bg-amber-100 dark:bg-amber-900/30' : r.type === 'followup' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30')}><Bell size={12} className={r.type === 'urgent' ? 'text-red-500' : r.type === 'important' ? 'text-amber-500' : r.type === 'followup' ? 'text-blue-500' : 'text-emerald-500'} /></div>
                <div><p className="font-bold text-xs">{r.title}</p>{r.description && <p className="text-[10px] text-muted-foreground">{r.description}</p>}<div className="flex items-center gap-2 mt-1"><Badge variant="outline" className="text-[8px]">{r.type === 'urgent' ? 'عاجل' : r.type === 'important' ? 'مهم' : r.type === 'followup' ? 'متابعة' : 'عام'}</Badge><span className="text-[9px] text-muted-foreground">{formatDate(r.date)}</span><Badge variant="outline" className={cn('text-[8px]', r.status === 'pending' ? 'border-amber-300 text-amber-600' : r.status === 'completed' ? 'border-emerald-300 text-emerald-600' : 'border-red-300 text-red-600')}>{r.status === 'pending' ? 'قيد الانتظار' : r.status === 'completed' ? 'مكتمل' : r.status}</Badge></div></div>
              </div>
              <div className="flex gap-0.5">
                {r.status === 'pending' && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); toast.success('تم إكمال التذكير') } catch { toast.error('خطأ') } }}><CheckCircle size={10} className="text-emerald-500" /></Button>}
                {canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem('/reminders', r.id, setReminders)}><Trash2 size={10} className="text-red-500" /></Button>}
              </div>
            </div>
          </Card>
        ))}
      </TabsContent>

      {/* ═══ FINANCE ═══ */}
      <TabsContent value="finance" className="space-y-3 mt-3">
        <h3 className="font-bold text-sm flex items-center gap-2"><DollarSign size={15} className="text-emerald-500" /> الملخص المالي</h3>
        {(() => {
          const pSessions = sessions.filter(s => s.patientId === selectedPatient.id);
          const sessPaid = pSessions.filter(s => s.paid).reduce((a, s) => a + s.price, 0);
          const sessUnpaid = pSessions.filter(s => !s.paid).reduce((a, s) => a + s.price, 0);
          const pLaserRecords = laserRecords.filter(r => r.patientId === selectedPatient.id);
          const pLaserSessions = pLaserRecords.flatMap(r => (r.laserSessions || []));
          const laserPaid = pLaserSessions.filter(s => s.paid).reduce((a, s) => a + (s.price || 0), 0);
          const laserUnpaid = pLaserSessions.filter(s => !s.paid).reduce((a, s) => a + (s.price || 0), 0);
          const pTransactions = transactions.filter(t => t.description?.includes(selectedPatient.name));
          const pIncome = pTransactions.filter(t => t.type === 'income').reduce((a, t) => a + t.amount, 0);
          const pExpenses = pTransactions.filter(t => t.type === 'expense').reduce((a, t) => a + t.amount, 0);
          const combinedPaid = sessPaid + laserPaid;
          const combinedUnpaid = sessUnpaid + laserUnpaid;
          const visitIncome = pTransactions.filter(t => t.type === 'income' && (t.category === 'كشف' || t.category === 'إعادة')).reduce((a, t) => a + t.amount, 0);
          const sessionIncome = pTransactions.filter(t => t.type === 'income' && t.category === 'جلسات').reduce((a, t) => a + t.amount, 0);
          const laserIncome = pTransactions.filter(t => t.type === 'income' && t.category === 'ليزر').reduce((a, t) => a + t.amount, 0);
          return (<>
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20"><p className="text-[9px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-sm font-black text-emerald-600">{formatCurrency(pIncome)}</p></div>
              <div className="p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20"><p className="text-[9px] text-muted-foreground">المدفوع الكلي</p><p className="text-sm font-black text-blue-600">{formatCurrency(combinedPaid)}</p></div>
              <div className="p-3 rounded-xl border border-red-200 dark:border-red-800 bg-red-50/50 dark:bg-red-950/20"><p className="text-[9px] text-muted-foreground">غير المدفوع الكلي</p><p className="text-sm font-black text-red-600">{formatCurrency(combinedUnpaid)}</p></div>
              <div className="p-3 rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20"><p className="text-[9px] text-muted-foreground">إجمالي الجلسات</p><p className="text-sm font-black text-violet-600">{pSessions.length + pLaserSessions.length}</p></div>
            </div>
            <Card className="border border-slate-200 dark:border-slate-800 overflow-hidden">
              <div className="bg-gradient-to-l from-slate-600 to-slate-700 p-2 flex items-center gap-2"><Receipt size={14} className="text-white" /><p className="text-xs text-white font-bold">تفصيل الإيرادات</p></div>
              <CardContent className="p-2 space-y-1.5">
                <div className="flex items-center justify-between p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20"><div className="flex items-center gap-2"><Stethoscope size={12} className="text-violet-500" /><span className="text-xs">كشف/إعادة</span></div><span className="font-bold text-xs text-violet-600">{formatCurrency(visitIncome)}</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20"><div className="flex items-center gap-2"><Zap size={12} className="text-orange-500" /><span className="text-xs">جلسات عادية</span><span className="text-[9px] text-muted-foreground">({pSessions.filter(s => s.paid).length} مدفوعة / {pSessions.filter(s => !s.paid).length} متبقية)</span></div><span className="font-bold text-xs text-orange-600">{formatCurrency(sessPaid)}<span className="text-amber-600"> / {formatCurrency(sessUnpaid)}</span></span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20"><div className="flex items-center gap-2"><Zap size={12} className="text-cyan-500" /><span className="text-xs">ليزر</span><span className="text-[9px] text-muted-foreground">({pLaserSessions.filter(s => s.paid).length} مدفوعة / {pLaserSessions.filter(s => !s.paid).length} متبقية)</span></div><span className="font-bold text-xs text-cyan-600">{formatCurrency(laserPaid)}<span className="text-amber-600"> / {formatCurrency(laserUnpaid)}</span></span></div>
                <Separator />
                <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20"><span className="text-xs font-bold">الإجمالي المدفوع</span><span className="font-black text-sm text-emerald-600">{formatCurrency(combinedPaid)}</span></div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20"><span className="text-xs font-bold">الإجمالي المتبقي</span><span className="font-black text-sm text-amber-600">{formatCurrency(combinedUnpaid)}</span></div>
              </CardContent>
            </Card>
          </>)
        })()}
        <h4 className="font-bold text-xs flex items-center gap-2 mt-2"><FileText size={13} className="text-slate-500" /> سجل المعاملات</h4>
        <div className="space-y-1.5">{transactions.filter(t => t.description?.includes(selectedPatient.name)).slice(0, 20).map(t => <div key={t.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50"><div className="flex items-center gap-2"><div className={cn('p-1 rounded', t.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-red-100 dark:bg-red-900/30')}><DollarSign className={t.type === 'income' ? 'text-emerald-600' : 'text-red-600'} size={10} /></div><div><p className="text-[10px] font-medium">{t.description || t.category}</p><div className="flex items-center gap-1.5"><Badge className={cn('text-[7px] px-1', t.category === 'ليزر' ? 'bg-cyan-100 text-cyan-700' : t.category === 'كشف' ? 'bg-violet-100 text-violet-700' : t.category === 'إعادة' ? 'bg-blue-100 text-blue-700' : t.category === 'جلسات' ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-700')}>{t.category}</Badge><span className="text-[8px] text-muted-foreground">{formatDate(t.date)}</span></div></div></div><div className="flex items-center gap-1"><span className={cn('text-xs font-bold', t.type === 'income' ? 'text-emerald-600' : 'text-red-600')}>{t.type === 'income' ? '+' : '-'}{formatCurrency(t.amount)}</span>{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: 'DELETE' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success('تم حذف المعاملة المالية') } catch { toast.error('خطأ في الحذف') } }}><Trash2 size={9} className="text-red-400" /></Button>}</div></div>)}</div>
      </TabsContent>

      {/* ═══ NOTES — Premium Professional Design ═══ */}
      <TabsContent value="notes" className="space-y-4 mt-4">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-amber-200/50 dark:shadow-amber-900/30">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-800 dark:text-slate-100" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>الملاحظات</h3>
              <p className="text-[11px] text-muted-foreground font-medium">{notes.filter(n => n.patientId === selectedPatient.id).length} ملاحظة مسجلة</p>
            </div>
          </div>
        </div>

        {/* Add Note Input — Premium Card */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 dark:from-amber-950/20 dark:via-orange-950/20 dark:to-yellow-950/20 border-2 border-amber-200/70 dark:border-amber-800/50 p-4 shadow-md">
          <div className="absolute top-0 left-0 w-24 h-24 bg-amber-200/20 dark:bg-amber-700/10 rounded-full -translate-x-8 -translate-y-8 blur-2xl" />
          <div className="relative z-10">
            <Label className="text-sm font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
              <Sparkles size={14} /> إضافة ملاحظة جديدة
            </Label>
            <div className="flex gap-2">
              <Textarea value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="اكتب ملاحظتك هنا... اضغط Enter للحفظ" className="flex-1 rounded-xl min-h-[52px] text-sm font-medium border-2 border-amber-200 dark:border-amber-800 focus:border-amber-400 focus:ring-amber-400/20 bg-white/80 dark:bg-slate-900/60 resize-none" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", fontSize: '14px' }} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && quickNote.trim() && selectedPatient) { e.preventDefault(); const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: selectedPatient.id, section: 'patient' }, setNotes) } }} />
<button className="px-4 py-2 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-amber-300/30 dark:shadow-amber-900/30 flex items-center gap-1.5 text-sm self-end active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { if (quickNote.trim() && selectedPatient) { const content = quickNote; setQuickNote(''); addItem('/notes', { content, important: false, patientId: selectedPatient.id, section: 'patient' }, setNotes) } }}>
                <Plus size={16} /> إضافة
              </button>
            </div>
          </div>
        </motion.div>

        {/* Notes List */}
        {notes.filter(n => n.patientId === selectedPatient.id).length === 0 && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="py-12 text-center">
            <div className="text-6xl mb-4 animate-bounce-y">📝</div>
            <p className="text-lg font-bold text-slate-600 dark:text-slate-300" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>لا توجد ملاحظات بعد</p>
            <p className="text-sm text-muted-foreground mt-1">ابدأ بإضافة ملاحظتك الأولى أعلاه</p>
          </motion.div>
        )}
        <div className="space-y-3">
          {notes.filter(n => n.patientId === selectedPatient.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((n, idx) => {
            const noteColors = [
              { border: 'border-indigo-200 dark:border-indigo-800/60', bg: 'from-indigo-50 via-white to-blue-50 dark:from-indigo-950/20 dark:via-slate-900/40 dark:to-blue-950/20', accent: 'bg-indigo-500', accentLight: 'bg-indigo-100 dark:bg-indigo-900/30', accentText: 'text-indigo-600 dark:text-indigo-400' },
              { border: 'border-violet-200 dark:border-violet-800/60', bg: 'from-violet-50 via-white to-purple-50 dark:from-violet-950/20 dark:via-slate-900/40 dark:to-purple-950/20', accent: 'bg-violet-500', accentLight: 'bg-violet-100 dark:bg-violet-900/30', accentText: 'text-violet-600 dark:text-violet-400' },
              { border: 'border-emerald-200 dark:border-emerald-800/60', bg: 'from-emerald-50 via-white to-teal-50 dark:from-emerald-950/20 dark:via-slate-900/40 dark:to-teal-950/20', accent: 'bg-emerald-500', accentLight: 'bg-emerald-100 dark:bg-emerald-900/30', accentText: 'text-emerald-600 dark:text-emerald-400' },
              { border: 'border-cyan-200 dark:border-cyan-800/60', bg: 'from-cyan-50 via-white to-sky-50 dark:from-cyan-950/20 dark:via-slate-900/40 dark:to-sky-950/20', accent: 'bg-cyan-500', accentLight: 'bg-cyan-100 dark:bg-cyan-900/30', accentText: 'text-cyan-600 dark:text-cyan-400' },
              { border: 'border-rose-200 dark:border-rose-800/60', bg: 'from-rose-50 via-white to-pink-50 dark:from-rose-950/20 dark:via-slate-900/40 dark:to-pink-950/20', accent: 'bg-rose-500', accentLight: 'bg-rose-100 dark:bg-rose-900/30', accentText: 'text-rose-600 dark:text-rose-400' },
              { border: 'border-amber-200 dark:border-amber-800/60', bg: 'from-amber-50 via-white to-yellow-50 dark:from-amber-950/20 dark:via-slate-900/40 dark:to-yellow-950/20', accent: 'bg-amber-500', accentLight: 'bg-amber-100 dark:bg-amber-900/30', accentText: 'text-amber-600 dark:text-amber-400' },
            ]
            const color = noteColors[idx % noteColors.length]
            const isEditing = editingNoteId === n.id
            const timeAgo = (() => { const diff = Date.now() - new Date(n.createdAt).getTime(); const mins = Math.floor(diff / 60000); if (mins < 1) return 'الآن'; if (mins < 60) return `منذ ${mins} دقيقة`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `منذ ${hrs} ساعة`; const days = Math.floor(hrs / 24); return `منذ ${days} يوم` })()

            return (
              <motion.div key={n.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }}
                className={cn('relative overflow-hidden rounded-2xl border-2 bg-gradient-to-l p-0 shadow-sm hover:shadow-md transition-all', color.border, color.bg)}>
                {/* Side accent bar */}
                <div className={cn('absolute top-0 right-0 w-1.5 h-full rounded-r-2xl', color.accent)} />
                <div className="p-4 pr-5">
                  {isEditing ? (
                    <div className="space-y-3">
                      <Textarea value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="rounded-xl min-h-[60px] text-sm font-medium border-2 border-amber-300 dark:border-amber-700 focus:border-amber-500 bg-white dark:bg-slate-900 resize-none" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", fontSize: '14px' }} autoFocus onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }).then(() => { setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل بنجاح ✓') }).catch(() => toast.error('خطأ في التعديل')) } }} />
                      <div className="flex gap-2">
                        <Button size="sm" className="rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold shadow-md h-8 px-4" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent } : nn)); setEditingNoteId(null); toast.success('تم التعديل بنجاح ✓') } catch { toast.error('خطأ في التعديل') } }}>
                          <CheckCircle size={14} className="ml-1" /> حفظ
                        </Button>
                        <Button variant="ghost" size="sm" className="rounded-xl h-8 text-xs" onClick={() => setEditingNoteId(null)}>إلغاء</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-sm', color.accent)}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[15px] font-semibold leading-relaxed text-slate-700 dark:text-slate-200 whitespace-pre-wrap break-words" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif", lineHeight: '1.8' }}>{n.content}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={cn('text-[11px] font-medium px-2 py-0.5 rounded-lg', color.accentLight, color.accentText)}>{timeAgo}</span>
                          <span className="text-[11px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1 flex-shrink-0">
{canEditPatientFull && <button className="h-8 w-8 rounded-xl flex items-center justify-center bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all active:scale-[0.85] hover:scale-[1.1] transition-transform duration-150" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content) }}>
                          <Edit3 size={14} className="text-blue-600 dark:text-blue-400" />
                        </button>}
                        {canDelete && <AlertDialog>
                          <AlertDialogTrigger asChild>
<button className="h-8 w-8 rounded-xl flex items-center justify-center bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition-all active:scale-[0.85] hover:scale-[1.1] transition-transform duration-150">
                              <Trash2 size={14} className="text-red-500 dark:text-red-400" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف الملاحظة</AlertDialogTitle>
                              <AlertDialogDescription>هل أنت متأكد من حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.</AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>إلغاء</AlertDialogCancel>
                              <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'DELETE' }); setNotes(prev => prev.filter(nn => nn.id !== n.id)); toast.success('تم حذف الملاحظة ✓') } catch { toast.error('خطأ في الحذف') } }}>حذف</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </TabsContent>
    </Tabs>
  </div>
  )
}
