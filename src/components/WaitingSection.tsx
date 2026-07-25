'use client'

import { useMemo } from 'react'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore } from '@/store'
import { cn, formatCurrency } from '@/lib/utils'
import { apiFetch } from '@/lib/helpers'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Plus, Trash2, Edit3, CheckCircle, Timer, Users, Phone, X, ChevronDown,
  Star, Hash, Badge as BadgeIcon, Sparkles
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { WaitingItem } from '@/lib/types'

export default function WaitingSection() {
  const { userRole } = useAuthStore()
  const { activeTab, setActiveTab } = useClinicStore()
  const { patients, waitingQueue, setWaitingQueue } = useDataStore()
  const { showAddWaiting, setShowAddWaiting, waitingFormName, setWaitingFormName, waitingFormPriority, setWaitingFormPriority, waitingFormPatientId, setWaitingFormPatientId, waitingFormNotes, setWaitingFormNotes, setSelectedPatient } = useUIStore()

  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor

  // ─── CRUD helpers ────────────────────────────────────────────
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // ─── Helper functions ────────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.item || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }


  // ─── Computed values ────────────────────────────────────────────
  const waitingItems = useMemo(() => waitingQueue.filter(w => w.status === 'waiting').sort((a, b) => b.priority - a.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [waitingQueue])
  const inProgressItems = useMemo(() => waitingQueue.filter(w => w.status === 'in-progress').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [waitingQueue])
  const doneItems = useMemo(() => waitingQueue.filter(w => w.status === 'done' || w.status === 'left'), [waitingQueue])
  const totalWaiting = waitingItems.length
  const totalInProgress = inProgressItems.length
  const totalDone = doneItems.length

  return (
    <>
                <div className="space-y-4">
                  {/* ─── Animated Header ─── */}
                  <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-500 via-red-500 to-rose-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-drift-c"/>
                      <div className="absolute bottom-0 left-0 w-24 h-24 bg-yellow-300/20 rounded-full blur-3xl animate-drift-c"/>
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-5xl animate-bounce-y">⏳</div>
                        <div>
                          <h1 className="text-2xl font-black text-white">إدارة الانتظار</h1>
                          <p className="text-white/80 text-sm">تنظيم دخول المرضى ومتابعة الحالات</p>
                        </div>
                      </div>
                      <motion.div whileTap={{ scale: 0.95 }} whileHover={{ scale: 1.05 }}>
                        <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg h-11 px-4" onClick={() => setShowAddWaiting(true)}><Plus size={16} className="ml-2" /> إضافة مريض</Button>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* ─── Smart Stats Row ─── */}
                  <div className="grid grid-cols-4 gap-2">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3 text-white shadow-lg">
                      <div className="absolute top-1 left-1 text-2xl opacity-20 animate-bounce-y-sm">⏳</div>
                      <p className="text-2xl font-black relative z-10">{totalWaiting}</p>
                      <p className="text-[10px] text-white/80 font-bold relative z-10">في الانتظار</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 p-3 text-white shadow-lg">
                      <div className="absolute top-1 left-1 text-2xl opacity-20 animate-wiggle-wide">🩺</div>
                      <p className="text-2xl font-black relative z-10">{totalInProgress}</p>
                      <p className="text-[10px] text-white/80 font-bold relative z-10">جاري الكشف</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-400 to-green-500 p-3 text-white shadow-lg">
                      <div className="absolute top-1 left-1 text-2xl opacity-20 animate-pulse-scale">✅</div>
                      <p className="text-2xl font-black relative z-10">{totalDone}</p>
                      <p className="text-[10px] text-white/80 font-bold relative z-10">تم / غادر</p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 p-3 text-white shadow-lg">
                      <div className="absolute top-1 left-1 text-2xl opacity-20 animate-pulse-scale-lg">🚨</div>
                      <p className="text-2xl font-black relative z-10">{waitingItems.filter(w => w.priority >= 2).length}</p>
                      <p className="text-[10px] text-white/80 font-bold relative z-10">عاجل</p>
                    </motion.div>
                  </div>

                  {/* ─── IN PROGRESS SECTION ─── */}
                  {inProgressItems.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-lg animate-wiggle-wide">🩺</div>
                        <h3 className="font-bold text-sm text-blue-700 dark:text-blue-400">جاري الكشف الآن</h3>
                        <Badge className="bg-blue-500 text-white text-[8px]">{inProgressItems.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {inProgressItems.map((w, i) => {
                          const waitMinutes = Math.round((Date.now() - new Date(w.createdAt).getTime()) / 60000)
                          const isUrgent = w.priority >= 2
                          const linkedPatient = w.patientId ? patients.find(p => p.id === w.patientId) : null
                          return (
                            <motion.div key={w.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="relative overflow-hidden rounded-xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/10 p-3 shadow-md">
                              <div className="absolute top-0 left-0 w-2 h-full bg-blue-500 rounded-r-xl" />
                              <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-3">
                                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold text-sm shadow-md">🩺</div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-bold text-sm">{w.patientName || 'مريض'}</p>
                                      <Badge className="bg-blue-500 text-white text-[8px] animate-pulse">جاري الكشف</Badge>
                                      {isUrgent && <Badge className="bg-red-500 text-white text-[8px]">عاجل</Badge>}
                                    </div>
                                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                      <span>⏱ {waitMinutes > 60 ? `${Math.floor(waitMinutes / 60)} س ${waitMinutes % 60} د` : `${waitMinutes} دقيقة`}</span>
                                      {linkedPatient?.phone && <span dir="ltr" className="bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">📞 {linkedPatient.phone}</span>}
                                      {linkedPatient?.gender && <span className="bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">🔬 {linkedPatient.gender}</span>}
                                      {w.notes && <span className="bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">📝 {w.notes}</span>}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
 {linkedPatient && <button onClick={() => { setSelectedPatient(linkedPatient); setActiveTab('patients') }} className="px-2 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors shadow-md flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" title="فتح ملف المريض">👤</button>}
 <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'done' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'done' } : q)); toast.success('تم الكشف ✅') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'done' } : q)); toast.success('تم الكشف ✅') } }} className="px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-bold hover:bg-emerald-600 transition-colors shadow-md flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">✅ تم</button>
 <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'left' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } }} className="px-3 py-2 rounded-xl bg-gray-400 text-white text-xs font-bold hover:bg-gray-500 transition-colors shadow-md flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">🚪 غادر</button>
                                </div>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── WAITING LIST SECTION ─── */}
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="text-lg animate-bounce-y-sm">⏳</div>
                      <h3 className="font-bold text-sm text-amber-700 dark:text-amber-400">قائمة الانتظار</h3>
                      <Badge className="bg-amber-500 text-white text-[8px]">{totalWaiting}</Badge>
                    </div>
                    {waitingItems.length === 0 && totalInProgress === 0 && totalDone === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <div className="text-5xl mb-3 animate-bounce-y">⏳</div>
                        <p className="text-muted-foreground font-bold">قائمة الانتظار فارغة</p>
                        <p className="text-muted-foreground text-xs mt-1">اضغط "إضافة مريض" لبدء تنظيم الدخول</p>
                      </Card>
                    )}
                    {waitingItems.length === 0 && totalInProgress > 0 && (
                      <Card className="card-luxury p-4 text-center border-2 border-dashed border-amber-300 dark:border-amber-700">
                        <p className="text-amber-600 text-sm font-bold">✨ لا يوجد مرضى في الانتظار — جميعهم مع الدكتور الآن</p>
                      </Card>
                    )}
                    <div className="space-y-2">
                      {waitingItems.map((w, i) => {
                        const waitMinutes = Math.round((Date.now() - new Date(w.createdAt).getTime()) / 60000)
                        const isUrgent = w.priority >= 2
                        const isLongWait = waitMinutes > 30
                        const linkedPatient = w.patientId ? patients.find(p => p.id === w.patientId) : null
                        return (
                          <motion.div key={w.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ scale: 1.01, x: 4 }} className={cn('relative overflow-hidden rounded-xl border-2 p-3 transition-all', isUrgent ? 'border-red-300 dark:border-red-700 bg-gradient-to-l from-red-50 to-orange-50 dark:from-red-950/20 dark:to-orange-950/10 shadow-md' : isLongWait ? 'border-amber-300 dark:border-amber-700 bg-gradient-to-l from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/10' : 'border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10')}>
                            <div className={cn('absolute top-0 left-0 w-1.5 h-full rounded-r-xl', isUrgent ? 'bg-red-500' : isLongWait ? 'bg-amber-500' : 'bg-amber-400')} />
                            <div className="flex items-center justify-between relative z-10">
                              <div className="flex items-center gap-3">
                                <div className={cn('flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm text-white shadow-md', isUrgent ? 'bg-red-500' : 'bg-amber-500')}>{i + 1}</div>
                                <div>
                                  <div className="flex items-center gap-2">
                                    <p className="font-bold text-sm">{w.patientName || 'مريض'}</p>
                                    {isUrgent && <Badge className="bg-red-500 text-white text-[8px] animate-pulse">🚨 عاجل</Badge>}
                                    {isLongWait && !isUrgent && <Badge className="bg-amber-500 text-white text-[8px]">⏰ انتظار طويل</Badge>}
                                    {linkedPatient && <Badge variant="outline" className="text-[8px] border-blue-300 text-blue-600">#{linkedPatient.fileNumber || w.patientId?.slice(-4)}</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                    <span className={cn('font-bold', isLongWait && 'text-red-500')}>⏱ {waitMinutes > 60 ? `${Math.floor(waitMinutes / 60)} س ${waitMinutes % 60} د` : `${waitMinutes} دقيقة`}</span>
                                    {linkedPatient?.phone && <span dir="ltr" className="bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">📞 {linkedPatient.phone}</span>}
                                    {linkedPatient?.gender && <span className="bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">🔬 {linkedPatient.gender}</span>}
                                    {w.notes && <span className="bg-white/60 dark:bg-black/20 px-1.5 py-0.5 rounded text-[9px]">📝 {w.notes}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5">
 {linkedPatient && <button onClick={() => { setSelectedPatient(linkedPatient); setActiveTab('patients') }} className="px-2 py-2 rounded-xl bg-indigo-500 text-white text-xs font-bold hover:bg-indigo-600 transition-colors shadow-md flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" title="فتح ملف المريض">👤</button>}
 <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'in-progress' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'in-progress' } : q)); toast.success('🩺 يتم الكشف الآن') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'in-progress' } : q)); toast.success('🩺 يتم الكشف الآن') } }} className="px-3 py-2 rounded-xl bg-blue-500 text-white text-xs font-bold hover:bg-blue-600 transition-colors shadow-md flex items-center gap-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">🩺 دخول</button>
 <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'left' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } }} className="px-2 py-2 rounded-xl bg-gray-400 text-white text-xs font-bold hover:bg-gray-500 transition-colors active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">🚪</button>
                                {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/waiting', w.id, setWaitingQueue)}><Trash2 size={11} className="text-red-500" /></Button>}
                              </div>
                            </div>
                          </motion.div>
                        )
                      })}
                    </div>
                  </motion.div>

                  {/* ─── DONE/LEFT SECTION ─── */}
                  {doneItems.length > 0 && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm">📋</span>
                        <h4 className="text-xs text-muted-foreground font-bold">مكتمل / غادر ({doneItems.length})</h4>
                      </div>
                      <div className="space-y-1 max-h-32 overflow-y-auto">
                        {doneItems.map(w => (
                          <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                            <span className="text-muted-foreground line-through">{w.patientName || 'مريض'}</span>
                            <Badge variant="outline" className={w.status === 'done' ? 'border-emerald-500 text-emerald-600 text-[8px]' : 'border-gray-400 text-gray-500 text-[8px]'}>{w.status === 'done' ? '✅ تم' : '🚪 غادر'}</Badge>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── Quick Actions Card for Secretary ─── */}
                  {!isDoctor && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                      <Card className="border-2 border-dashed border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/10 dark:to-blue-950/10">
                        <CardContent className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles size={14} className="text-cyan-500" />
                            <h4 className="text-xs font-bold text-cyan-700 dark:text-cyan-400">إجراءات سريعة</h4>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
 <button onClick={() => { setShowAddWaiting(true) }} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-amber-100 dark:bg-amber-900/20 hover:bg-amber-200 dark:hover:bg-amber-900/40 transition-all border border-amber-200 dark:border-amber-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">
                              <span className="text-lg">➕</span>
                              <span className="text-[9px] font-bold text-amber-700 dark:text-amber-400">مريض جديد</span>
                            </button>
 <button onClick={() => { setActiveTab('patients'); setSelectedPatient(null) }} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-blue-100 dark:bg-blue-900/20 hover:bg-blue-200 dark:hover:bg-blue-900/40 transition-all border border-blue-200 dark:border-blue-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">
                              <span className="text-lg">👥</span>
                              <span className="text-[9px] font-bold text-blue-700 dark:text-blue-400">المرضى</span>
                            </button>
 <button onClick={() => { setActiveTab('laser') }} className="flex flex-col items-center gap-1 p-3 rounded-xl bg-cyan-100 dark:bg-cyan-900/20 hover:bg-cyan-200 dark:hover:bg-cyan-900/40 transition-all border border-cyan-200 dark:border-cyan-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">
                              <span className="text-lg">💎</span>
                              <span className="text-[9px] font-bold text-cyan-700 dark:text-cyan-400">الليزر</span>
                            </button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>

{/* Add to Waiting Queue Dialog */}
      <Dialog open={showAddWaiting} onOpenChange={setShowAddWaiting}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Clock size={18} className="text-red-500" /> إضافة لقائمة الانتظار</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label className="text-xs font-bold">اسم المريض أو اختر من القائمة</Label><Select value={waitingFormName} onValueChange={v => { const p = patients.find(pp => pp.id === v); if (p) { setWaitingFormName(p.name); setWaitingFormPatientId(p.id) } }}><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر مريض موجود..." /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}{p.phone ? ` (${p.phone})` : ''}</SelectItem>)}</SelectContent></Select></div>
          <div><Label className="text-xs font-bold">أو اكتب اسم المريض</Label><Input value={waitingFormName} onChange={e => { setWaitingFormName(e.target.value); setWaitingFormPatientId(undefined) }} placeholder="اسم المريض..." className="input-luxury rounded-xl mt-1" /></div>
 <div><Label className="text-xs font-bold active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">الأولوية</Label><div className="grid grid-cols-2 gap-2 mt-1 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><button onClick={() => setWaitingFormPriority('normal')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', waitingFormPriority === 'normal' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}>🟢 عادي</button><button onClick={() => setWaitingFormPriority('urgent')} className={cn('flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', waitingFormPriority === 'urgent' ? 'border-red-500 bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300 shadow-lg' : 'border-transparent bg-muted/50 text-muted-foreground')}>🔴 عاجل</button></div></div>
          <div><Label className="text-xs font-bold">ملاحظات</Label><Input value={waitingFormNotes} onChange={e => setWaitingFormNotes(e.target.value)} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl mt-1" /></div>
        </div>
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-red-500 to-red-600 text-white" onClick={async () => { if (!waitingFormName.trim()) return toast.error('اسم المريض مطلوب'); const priority = waitingFormPriority === 'urgent' ? 2 : 1; await addItem('/waiting', { patientId: waitingFormPatientId || undefined, patientName: waitingFormName, priority, status: 'waiting', notes: waitingFormNotes || undefined }, setWaitingQueue); setWaitingFormName(''); setWaitingFormPriority('normal'); setWaitingFormNotes(''); setWaitingFormPatientId(undefined); setShowAddWaiting(false) }}>إضافة للقائمة</Button></DialogFooter>
      </DialogContent></Dialog>

    </>
  )
}
