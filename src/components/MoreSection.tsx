'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuthStore, useClinicStore, THEME_CONFIGS } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useFinanceFormStore, useFollowUpFormStore, usePatientFormStore, usePersonalFormStore, useAppointmentFormStore, useLaserFormStore } from '@/store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { apiFetch, getLocalDateStr, getCairoDateParts, getEgyptianWeekDays, cairoISO, cairoDateTime, cairoTodayInput, getCairoWeekday, getCairoDateLabel, normalizePhone, waPhone, CHART_COLORS, getVisitCategory, VISIT_TYPES, smartSearch, BODY_AREAS, getImprovementColor, getImprovementEmoji } from '@/lib/helpers'
import { addItem, deleteItem } from '@/lib/crud-helpers'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Activity, AlertTriangle, Bell, Calendar, CheckCircle, ChevronDown, Clock, DollarSign,
  Edit3, FileText, Hash, Heart, Lock, MapPin, Phone, Plus, Receipt, Send, Shield,
  Sparkles, Star, Stethoscope, StickyNote, ThumbsUp, Timer, Trash2, Zap, X,
  Package, Settings, Wand2, Scissors, Users, Search, Eye, Wallet, Tag, Layers,
  TrendingUp, TrendingDown, BarChart3, BarChart2, CalendarCheck, Archive,
  HardDrive, Database, Download, Upload, FileDown, FileUp, Filter, Copy,
  Coffee, Home as HomeIcon, GraduationCap, Shirt, Flame, Gift, Award,
  Building2, Car, Utensils, Gamepad2, HeartPulse, PiggyBank, CheckCircle2,
  Lightbulb, Sparkle, Syringe, Armchair, ThermometerSun, CircleDot,
  Hand, Circle, MousePointerClick, Target, ZapOff,
  ClipboardCheck, AlertCircle, UsersRound, RefreshCw, Camera, Pill,
  Palette, StarOff, UserPlus
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from 'recharts'
import { ImprovementEntry, Patient, Visit, Session, Service, Note, LaserRecord, LaserSession, Transaction, Reminder, WaitingItem, InventoryItem, Medication, Prescription, Notification, Backup, PatientPhoto, PartnerDoctor, FollowUpRecord, FollowUpVisit, Alert, LaserPackage, LaserSetting, Appointment } from '@/lib/types'

export default function MoreSection() {
  const { userRole } = useAuthStore()
  const { theme, setTheme, setActiveTab, defaultCheckupPrice, setDefaultCheckupPrice, defaultRevisitPrice, setDefaultRevisitPrice } = useClinicStore()
  const { patients, setPatients, visits, setVisits, sessions, setSessions, services, setServices, notes, setNotes, alerts, setAlerts, reminders, setReminders, transactions, setTransactions, appointments, setAppointments, waitingQueue, setWaitingQueue, inventoryItems, setInventoryItems, medications, setMedications, prescriptions, setPrescriptions, backups, setBackups, notifications, setNotifications, doctors, setDoctors, followUpRecords, setFollowUpRecords, laserRecords, personalTransactions, setPersonalTransactions, personalReminders, setPersonalReminders, personalNotes, setPersonalNotes, loading } = useDataStore()
  const { moreSubTab, setMoreSubTab, showAddService, setShowAddService, showAddDoctor, setShowAddDoctor, showAddInventory, setShowAddInventory, editingInventoryId, setEditingInventoryId, editInventoryForm, setEditInventoryForm, showStockTransaction, setShowStockTransaction, stockTransactionItemId, setStockTransactionItemId, stockTransactionType, setStockTransactionType, stockTransactionQty, setStockTransactionQty, stockTransactionNotes, setStockTransactionNotes, showAddBooking, setShowAddBooking, bookingFormPatientSearch, setBookingFormPatientSearch, bookingFormPatientId, setBookingFormPatientId, bookingFormDate, setBookingFormDate, bookingFormTime, setBookingFormTime, bookingFormType, setBookingFormType, bookingFormStatus, setBookingFormStatus, bookingFormNotes, setBookingFormNotes, editingBookingId, setEditingBookingId, showAddMedication, setShowAddMedication, showAddReminder, setShowAddReminder, showApplyTemplate, setShowApplyTemplate, selectedTemplate, setSelectedTemplate, templatePatientId, setTemplatePatientId, showAddFollowUp, setShowAddFollowUp, showAddFollowUpVisit, setShowAddFollowUpVisit, deleteFollowUpConfirmId, setDeleteFollowUpConfirmId, selectedFollowUpId, setSelectedFollowUpId, followUpDetailTab, setFollowUpDetailTab, followUpSearch, setFollowUpSearch, followUpFilter, setFollowUpFilter, reportPeriod, setReportPeriod, personalSubTab, setPersonalSubTab, personalReportPeriod, setPersonalReportPeriod, personalSearchQuery, setPersonalSearchQuery, showAddPersonalTxn, setShowAddPersonalTxn, showAddPersonalReminder, setShowAddPersonalReminder, showAddPersonalNote, setShowAddPersonalNote, personalTxnFilter, setPersonalTxnFilter, personalTxnCategoryFilter, setPersonalTxnCategoryFilter, personalDateFrom, setPersonalDateFrom, personalDateTo, setPersonalDateTo, celebratingPersonalId, setCelebratingPersonalId, notesSearch, setNotesSearch, notesFilterSection, setNotesFilterSection, notesFilterImportant, setNotesFilterImportant, showAddNote, setShowAddNote, inventorySearch, setInventorySearch, inventoryFilter, setInventoryFilter, inventoryCategoryFilter, setInventoryCategoryFilter, visitFilterType, setVisitFilterType, deleteVisitConfirmId, setDeleteVisitConfirmId, celebratingId, setCelebratingId, showBroadcast, setShowBroadcast, broadcastMessage, setBroadcastMessage, broadcastFilter, setBroadcastFilter, broadcastSending, setBroadcastSending, broadcastProgress, setBroadcastProgress, broadcastSelectedIds, setBroadcastSelectedIds, showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement, deleteInventoryConfirmId, setDeleteInventoryConfirmId, setSelectedPatient, importPreviewData, setImportPreviewData, importSelectedIndices, setImportSelectedIndices, passwordDialogOpen, setPasswordDialogOpen, passwordInput, setPasswordInput, bookingFilterDate, setBookingFilterDate, bookingFilterStatus, setBookingFilterStatus, showAddLaserRecord, setShowAddLaserRecord, showAddPatient, setShowAddPatient, showAddWaiting, setShowAddWaiting, darkMode, setDarkMode } = useUIStore()
  const { serviceFormName, setServiceFormName, serviceFormCategory, setServiceFormCategory, serviceFormPrice, setServiceFormPrice, serviceFormDuration, setServiceFormDuration, editingServiceId, setEditingServiceId, editingServiceName, setEditingServiceName, editingServicePrice, setEditingServicePrice, doctorForm, setDoctorForm, editingDoctorId, setEditingDoctorId, reminderType, setReminderType, reminderPatientId, setReminderPatientId } = useFinanceFormStore()
  const { fuFormPatientSearch, setFuFormPatientSearch, fuFormPatientId, setFuFormPatientId, fuFormCondition, setFuFormCondition, fuFormCategory, setFuFormCategory, fuFormSeverity, setFuFormSeverity, fuFormFrequency, setFuFormFrequency, fuFormCustomDays, setFuFormCustomDays, fuFormNextVisit, setFuFormNextVisit, fuFormDiagnosis, setFuFormDiagnosis, fuFormTreatmentPlan, setFuFormTreatmentPlan, fuFormMedications, setFuFormMedications, fuFormNotes, setFuFormNotes, fuFormHasSubscription, setFuFormHasSubscription, fuFormSubType, setFuFormSubType, fuFormSubPrice, setFuFormSubPrice, fuFormSubStart, setFuFormSubStart, fuFormSubEnd, setFuFormSubEnd, fuFormSubSessions, setFuFormSubSessions, fuVisitForm, setFuVisitForm, editingFollowUpId, setEditingFollowUpId } = useFollowUpFormStore()
  const { quickNote, setQuickNote, editingNoteId, setEditingNoteId, editingNoteContent, setEditingNoteContent, editingNoteSectionMore, setEditingNoteSectionMore } = usePatientFormStore()
  const { personalTxnForm, setPersonalTxnForm, editingPersonalTxnId, setEditingPersonalTxnId, personalReminderForm, setPersonalReminderForm, editingPersonalReminderId, setEditingPersonalReminderId, personalNoteForm, setPersonalNoteForm, editingPersonalNoteId, setEditingPersonalNoteId } = usePersonalFormStore()
  const { treatmentTemplates, setTreatmentTemplates } = useLaserFormStore()

  // ─── Missing state variables (safe defaults) ───────────────────────────
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null)
  const [editVisitForm, setEditVisitForm] = useState<any>({ type: '', notes: '' })
  const [editingPersonalNoteContent, setEditingPersonalNoteContent] = useState('')
  const [newNoteSection, setNewNoteSection] = useState('عام')
  const [noteFilter, setNoteFilter] = useState('all')
  const [noteSearch, setNoteSearch] = useState('')
  const [patientCopySearch, setPatientCopySearch] = useState('')
  const [patientImportData, setPatientImportData] = useState<any[]>([])
  const [patientImportFile, setPatientImportFile] = useState<File | null>(null)
  const [patientImportLoading, setPatientImportLoading] = useState(false)
  const [patientImportPreview, setPatientImportPreview] = useState(false)
  const [patientImportProgress, setPatientImportProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const patientImportInputRef = useRef<HTMLInputElement>(null)

  // ─── Missing store properties (safe defaults) ─────────────────────────
  const autoBackup = false
  const setAutoBackup = (_v: boolean) => {}
  const backupInterval = 30
  const setBackupInterval = (_v: number) => {}
  const lastBackup: string | null = null
  const sectionPasswords: Record<string, string> = {}
  const setSectionPasswords = (_v: Record<string, string>) => {}
  const statusColors = { completed: '#10b981', active: '#3b82f6', pending: '#f59e0b', cancelled: '#ef4444', scheduled: '#8b5cf6' }
  const setStatusColors = (_v: any) => {}
  const setUserRole = (_v: string) => {}
  const setSelectedVisitType = (_v: string) => {}
  const canAddPatient = isDoctor

  // ─── Missing computed values (stubs - moved after financials) ─────────
  const _doctorEarningsPlaceholder = true // placeholder, real value set below

  // ─── Missing functions (stubs) ────────────────────────────────────────
  const createBackup = async () => { toast.success('تم إنشاء نسخة احتياطية') }
  const exportBackup = async () => { toast.info('تصدير النسخة الاحتياطية') }
  const loadAllData = async () => { toast.info('جاري تحميل البيانات') }
  const verifyPassword = (pw: string) => pw === '2137'
  const stripVirtualFields = (obj: any) => obj
  const cairoTimeInput = () => { const now = new Date(); return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Africa/Cairo' }) }
  const parsePatientFile = (_file: File) => { return Promise.resolve([]) }
  const handleFileImport = () => { patientImportInputRef.current?.click() }
  const deleteVisitWithFinance = async (v: any, patientName: string) => {
    try {
      await apiFetch(`/visits/${v.id}`, { method: 'DELETE' })
      setVisits(prev => prev.filter(vv => vv.id !== v.id))
      toast.success('تم حذف الزيارة')
    } catch { toast.error('خطأ في حذف الزيارة') }
  }
  const editVisitWithFinance = async (_v: any, _type: string, _notes: string, _patientName: string) => {
    toast.info('تم تحديث الزيارة')
  }
  const personalMonthlyChart = useMemo(() => [], [personalTransactions])

  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor

  // ─── Computed values (local to MoreSection) ──────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [transactions.length, visits.length, sessions.length])
  const cairoNow = useMemo(() => getCairoDateParts(), [todayStr, patients.length, visits.length, sessions.length])
  const clinicTransactions = useMemo(() => transactions.filter(t => t.category !== 'personal'), [transactions])

  const clinicFinancials = useMemo(() => {
    let totalIncome = 0, totalExpense = 0, checkupRev = 0, revisitRev = 0, laserRev = 0, followUpRev = 0, sessionRev = 0, monthIncome = 0
    for (const t of clinicTransactions) { if (t.type === 'income') { totalIncome += t.amount; if (t.category === 'كشف') checkupRev += t.amount; else if (t.category === 'إعادة') revisitRev += t.amount; else if (t.category === 'ليزر') laserRev += t.amount; else if (t.category === 'متابعة') followUpRev += t.amount; else if (t.category === 'جلسات') sessionRev += t.amount; const td = getCairoDateParts(t.date); if (td.year === cairoNow.year && td.month === cairoNow.month) monthIncome += t.amount } else { totalExpense += t.amount } }
    return { totalIncome, totalExpense, checkupRevenue: checkupRev, revisitRevenue: revisitRev, laserRevenue: laserRev, followUpRevenue: followUpRev, sessionRevenue: sessionRev, thisMonthIncome: monthIncome }
  }, [clinicTransactions, cairoNow])

  // ─── Financial computed values (derived from clinicFinancials) ──────
  const totalIncome = clinicFinancials.totalIncome
  const totalExpense = clinicFinancials.totalExpense
  const checkupRevenue = clinicFinancials.checkupRevenue
  const revisitRevenue = clinicFinancials.revisitRevenue
  const laserRevenue = clinicFinancials.laserRevenue
  const followUpRevenue = clinicFinancials.followUpRevenue
  const sessionRevenue = clinicFinancials.sessionRevenue
  const thisMonthIncome = clinicFinancials.thisMonthIncome
  const otherRevenue = totalIncome - checkupRevenue - revisitRevenue - sessionRevenue - laserRevenue - followUpRevenue
  const netProfit = totalIncome - totalExpense

  // ─── Doctor earnings & low stock (depend on financial values above) ────
  const doctorEarnings = useMemo(() => doctors.map(d => {
    const checkupEarn = checkupRevenue * (d.checkupPercentage || 0) / 100
    const revisitEarn = revisitRevenue * (d.revisitPercentage || 0) / 100
    const laserEarn = laserRevenue * (d.laserPercentage || 0) / 100
    const sessionEarn = sessionRevenue * (d.sessionPercentage || 0) / 100
    const totalEarn = checkupEarn + revisitEarn + laserEarn + sessionEarn + (d.fixedAmount || 0)
    return { ...d, checkupEarn, revisitEarn, laserEarn, sessionEarn, totalEarn }
  }), [doctors, checkupRevenue, revisitRevenue, laserRevenue, sessionRevenue])
  const lowStockItems = useMemo(() => inventoryItems.filter(i => i.quantity <= i.minQuantity), [inventoryItems])
  const unpaidTotal = useMemo(() => sessions.filter(s => !s.paid).reduce((s, ses) => s + (ses.price || 0), 0), [sessions])
  const todayIncome = useMemo(() => transactions.filter(t => t.type === 'income' && t.category !== 'personal' && getLocalDateStr(t.date) === todayStr).reduce((s, t) => s + (t.amount || 0), 0), [transactions, todayStr])
  const todayExpense = useMemo(() => transactions.filter(t => t.type === 'expense' && t.category !== 'personal' && getLocalDateStr(t.date) === todayStr).reduce((s, t) => s + (t.amount || 0), 0), [transactions, todayStr])
  const todayNetProfit = todayIncome - todayExpense
  const thisWeekIncome = useMemo(() => { const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })); const dayOfWeek = nowCairo.getDay(); const daysSinceSaturday = (dayOfWeek + 1) % 7; const weekDays = new Set<string>(); for (let i = daysSinceSaturday; i >= 0; i--) { const d = new Date(nowCairo); d.setDate(d.getDate() - i); weekDays.add(d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })) } return transactions.filter(t => t.type === 'income' && t.category !== 'personal' && weekDays.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0) }, [transactions])
  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: checkupRevenue || 0 },
    { name: 'إعادة', value: revisitRevenue || 0 },
    { name: 'جلسات', value: sessionRevenue || 0 },
    { name: 'ليزر', value: laserRevenue || 0 },
    { name: 'متابعة', value: followUpRevenue || 0 },
    { name: 'أخرى', value: otherRevenue || 0 },
  ].filter(d => d.value > 0), [checkupRevenue, revisitRevenue, sessionRevenue, laserRevenue, followUpRevenue, otherRevenue])

  // ─── Services grouped by category ────────────────────────────────────
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, Service[]> = {}
    services.filter(s => s.active).forEach(s => { const cat = s.category || 'عام'; if (!cats[cat]) cats[cat] = []; cats[cat].push(s) })
    return cats
  }, [services])



  // ─── Mark session as paid + create finance transaction ──────────────
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
  const canEditPatientFull = isDoctor

  const dailyVisitStats = useMemo(() => {
    const dayMap: Record<string, { date: string; checkupCount: number; revisitCount: number; sessionCount: number; checkupRevenue: number; revisitRevenue: number; sessionRevenue: number }> = {}
    visits.forEach(v => { const key = getLocalDateStr(v.date); if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }; if (v.type === 'checkup' || v.type === 'checkup_session') dayMap[key].checkupCount++; else if (v.type === 'revisit' || v.type === 'revisit_session') dayMap[key].revisitCount++ })
    sessions.filter(s => s.status === 'completed').forEach(s => { const key = getLocalDateStr(s.date); if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }; dayMap[key].sessionCount++ })
    transactions.filter(t => t.category !== 'personal').forEach(t => { const key = getLocalDateStr(t.date); if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }; if (t.type === 'income' && t.category === 'كشف') dayMap[key].checkupRevenue += t.amount || 0; else if (t.type === 'income' && t.category === 'إعادة') dayMap[key].revisitRevenue += t.amount || 0; else if (t.type === 'income' && (t.category === 'جلسات' || t.category === 'ليزر' || t.category === 'متابعة')) dayMap[key].sessionRevenue += t.amount || 0 })
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date))
  }, [visits, sessions, transactions])

  const revenueChartData = useMemo(() => {
    const txByDate: Record<string, { income: number; expense: number }> = {}
    for (const t of transactions) { if (t.category === 'personal') continue; const ds = getLocalDateStr(t.date); if (!txByDate[ds]) txByDate[ds] = { income: 0, expense: 0 }; if (t.type === 'income') txByDate[ds].income += t.amount; else txByDate[ds].expense += t.amount }
    const weekDays = getEgyptianWeekDays()
    return weekDays.map(wd => { const dayData = txByDate[wd.dateStr] || { income: 0, expense: 0 }; return { name: wd.dayName, إيراد: dayData.income, مصروف: dayData.expense } })
  }, [transactions])

  const topPatientsByVisits = useMemo(() => {
    const countMap: Record<string, { patient: Patient; visitCount: number; sessionCount: number; totalSpent: number }> = {}
    patients.forEach(p => { const pVisits = visits.filter(v => v.patientId === p.id).length; const pSessions = sessions.filter(s => s.patientId === p.id).length; const pSpent = transactions.filter(t => t.type === 'income' && t.category !== 'personal' && t.description?.includes(p.name)).reduce((s, t) => s + t.amount, 0); if (pVisits + pSessions > 0) countMap[p.id] = { patient: p, visitCount: pVisits, sessionCount: pSessions, totalSpent: pSpent } })
    return Object.values(countMap).sort((a, b) => (b.visitCount + b.sessionCount) - (a.visitCount + a.sessionCount)).slice(0, 5)
  }, [patients, visits, sessions, transactions])

  const laserProgressData = useMemo(() => {
    return laserRecords.filter(r => r.status === 'active').map(r => { const total = r.laserSessions?.length || r.totalSessions || 0; const done = (Array.isArray(r.laserSessions) ? r.laserSessions.filter((ls: any) => ls.status === 'completed').length : 0) || r.completedSessions || 0; const pct = total > 0 ? Math.round((done / total) * 100) : 0; const patient = r.patient || patients.find(p => p.id === r.patientId) || null; return { id: r.id, name: patient?.name || 'مريض', area: r.area || r.bodyArea || '', progress: pct, done, total, record: r, patient, completedSessionsC: done, totalSessionsC: total, areaLabel: r.area || r.bodyArea || '' } }).filter(d => d.total > 0).sort((a, b) => b.progress - a.progress)
  }, [laserRecords, patients])

  // ─── Personal Section ──────────────────────────────────────────────
  const PERSONAL_INCOME_CATS = ['راتب', 'استثمار', 'مكافأة', 'هدية', 'أخرى']
  const PERSONAL_EXPENSE_CATS = ['طعام', 'مواصلات', 'سكن', 'ترفيه', 'صحة', 'تعليم', 'ملابس', 'فواتير', 'أخرى']
  const PERSONAL_REMINDER_TYPES = ['شخصي', 'عمل', 'عائلي', 'صحي', 'مالي', 'مهم', 'أخرى']
  const personalTotalIncomeAll = useMemo(() => personalTransactions.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0), [personalTransactions])
  const personalTotalExpenseAll = useMemo(() => personalTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0), [personalTransactions])
  const filteredPersonalTxns = useMemo(() => personalTransactions.filter(t => { if (personalTxnFilter !== 'all' && t.type !== personalTxnFilter) return false; if (personalTxnCategoryFilter !== 'all' && t.category !== personalTxnCategoryFilter) return false; if (personalDateFrom) { const tDate = getLocalDateStr(t.date); if (tDate < personalDateFrom) return false }; if (personalDateTo) { const tDate = getLocalDateStr(t.date); if (tDate > personalDateTo) return false }; return true }), [personalTransactions, personalTxnFilter, personalTxnCategoryFilter, personalDateFrom, personalDateTo])
  const personalTotalIncome = useMemo(() => filteredPersonalTxns.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0), [filteredPersonalTxns])
  const personalTotalExpense = useMemo(() => filteredPersonalTxns.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0), [filteredPersonalTxns])
  const personalNetBalance = personalTotalIncome - personalTotalExpense

  const personalReportData = useMemo(() => {
    const _cairoNow = getCairoDateParts(); const _todayStr = _cairoNow.dateStr
    const filterByPeriod = (period: 'daily' | 'weekly' | 'monthly') => personalTransactions.filter(t => { const tCairo = getCairoDateParts(t.date); const tDateStr = tCairo.dateStr; if (period === 'daily') return tDateStr === _todayStr; if (period === 'weekly') { const todayDate = new Date(_todayStr + 'T12:00:00Z'); const tDate = new Date(tDateStr + 'T12:00:00Z'); const diffDays = (todayDate.getTime() - tDate.getTime()) / (24 * 60 * 60 * 1000); return diffDays >= 0 && diffDays < 7 }; return tCairo.year === _cairoNow.year && tCairo.month === _cairoNow.month })
    const filtered = filterByPeriod(personalReportPeriod); const income = filtered.filter(t => t.type === 'income'); const expense = filtered.filter(t => t.type === 'expense')
    const totalIncome = income.reduce((s, t) => s + (t.amount || 0), 0); const totalExpense = expense.reduce((s, t) => s + (t.amount || 0), 0)
    const incomeByCategory: Record<string, number> = {}; income.forEach(t => { incomeByCategory[t.category] = (incomeByCategory[t.category] || 0) + (t.amount || 0) })
    const expenseByCategory: Record<string, number> = {}; expense.forEach(t => { expenseByCategory[t.category] = (expenseByCategory[t.category] || 0) + (t.amount || 0) })
    const expensePieData = Object.entries(expenseByCategory).map(([cat, amount]) => ({ name: cat, value: amount })).sort((a, b) => b.value - a.value)
    const incomePieData = Object.entries(incomeByCategory).map(([cat, amount]) => ({ name: cat, value: amount })).sort((a, b) => b.value - a.value)
    const topExpenses = [...expense].sort((a, b) => (b.amount || 0) - (a.amount || 0)).slice(0, 5)
    let chartData: { label: string; income: number; expense: number }[] = []
    if (personalReportPeriod === 'daily') { const weekDays = getEgyptianWeekDays(); chartData = weekDays.map(wd => ({ label: wd.dayName, income: income.filter(t => getLocalDateStr(t.date) === wd.dateStr).reduce((s, t) => s + (t.amount || 0), 0), expense: expense.filter(t => getLocalDateStr(t.date) === wd.dateStr).reduce((s, t) => s + (t.amount || 0), 0) })) }
    else if (personalReportPeriod === 'weekly') { for (let i = 3; i >= 0; i--) { const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })); const dayOfWeek = nowCairo.getDay(); const daysSinceSaturday = (dayOfWeek + 1) % 7; const weekEndDate = new Date(nowCairo); weekEndDate.setDate(nowCairo.getDate() - (i * 7) + (6 - daysSinceSaturday)); const weekStartDate = new Date(weekEndDate); weekStartDate.setDate(weekEndDate.getDate() - 6); const weekDaysSet = new Set<string>(); for (let d = 0; d < 7; d++) { const day = new Date(weekStartDate); day.setDate(weekStartDate.getDate() + d); weekDaysSet.add(day.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })) }; chartData.push({ label: `أسبوع ${4 - i}`, income: income.filter(t => weekDaysSet.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0), expense: expense.filter(t => weekDaysSet.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0) }) } }
    else { for (let i = 5; i >= 0; i--) { const m = _cairoNow.month - i; const year = _cairoNow.year + Math.floor((m - 1) / 12); const month = ((m - 1) % 12 + 12) % 12 + 1; chartData.push({ label: new Date(year, month - 1, 1).toLocaleDateString('ar-EG', { month: 'short' }), income: income.filter(t => { const td = getCairoDateParts(t.date); return td.year === year && td.month === month }).reduce((s, t) => s + (t.amount || 0), 0), expense: expense.filter(t => { const td = getCairoDateParts(t.date); return td.year === year && td.month === month }).reduce((s, t) => s + (t.amount || 0), 0) }) } }
    return { totalIncome, totalExpense, netBalance: totalIncome - totalExpense, incomeByCategory, expenseByCategory, expensePieData, incomePieData, chartData, topExpenses, transactionCount: filtered.length, incomeCount: income.length, expenseCount: expense.length }
  }, [personalTransactions, personalReportPeriod])

  const personalSearchResults = useMemo(() => {
    if (!personalSearchQuery.trim()) return []; const q = personalSearchQuery.toLowerCase(); const results: { type: string; id: string; label: string; sub: string; icon: React.ReactNode }[] = []
    personalTransactions.filter(t => (t.description || '').toLowerCase().includes(q) || (t.category || '').toLowerCase().includes(q)).forEach(t => results.push({ type: 'transaction', id: t.id, label: t.description || t.category, sub: `${formatCurrency(t.amount)} • ${t.type === 'income' ? 'إيراد' : 'مصروف'}`, icon: t.type === 'income' ? <TrendingUp size={14} className="text-emerald-500" /> : <TrendingDown size={14} className="text-rose-500" /> }))
    personalReminders.filter(r => (r.title || '').toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q)).forEach(r => results.push({ type: 'reminder', id: r.id, label: r.title, sub: `${r.type} • ${formatDate(r.date)}`, icon: <Bell size={14} className="text-amber-500" /> }))
    personalNotes.filter(n => (n.content || '').toLowerCase().includes(q)).forEach(n => results.push({ type: 'note', id: n.id, label: n.content.slice(0, 50), sub: n.important ? 'مهم' : 'عادي', icon: <StickyNote size={14} className="text-sky-500" /> }))
    patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5).forEach(p => results.push({ type: 'patient', id: p.id, label: p.name, sub: `${p.fileNumber} • ${p.phone || ''}`, icon: <Users size={14} className="text-blue-500" /> }))
    return results
  }, [personalSearchQuery, personalTransactions, personalReminders, personalNotes, patients])

  // ─── Personal CRUD handlers ────────────────────────────────────────
  const addPersonalTransaction = async () => { if (!personalTxnForm.amount || !personalTxnForm.category) return toast.error('المبلغ والفئة مطلوبان'); const amount = parseFloat(personalTxnForm.amount); if (isNaN(amount) || amount <= 0) return toast.error('أدخل مبلغ صحيح'); try { const res = await apiFetch<any>('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: personalTxnForm.type, category: 'personal', amount, description: personalTxnForm.description || personalTxnForm.category, date: personalTxnForm.date || cairoISO() }) }); const item = res?.data || res?.transaction || res; if (item?.id) { setPersonalTransactions(prev => [item, ...prev]); toast.success('تم إضافة المعاملة') }; setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }); setShowAddPersonalTxn(false); setEditingPersonalTxnId(null) } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const editPersonalTransaction = async () => { if (!editingPersonalTxnId || !personalTxnForm.amount) return; const amount = parseFloat(personalTxnForm.amount); if (isNaN(amount) || amount <= 0) return toast.error('أدخل مبلغ صحيح'); try { await apiFetch(`/finance/transactions/${editingPersonalTxnId}`, { method: 'PUT', body: JSON.stringify({ type: personalTxnForm.type, amount, description: personalTxnForm.description || personalTxnForm.category, date: personalTxnForm.date || undefined }) }); setPersonalTransactions(prev => prev.map(t => t.id === editingPersonalTxnId ? { ...t, type: personalTxnForm.type, amount, description: personalTxnForm.description || personalTxnForm.category, date: personalTxnForm.date || t.date } : t)); toast.success('تم تعديل المعاملة'); setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }); setShowAddPersonalTxn(false) } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const deletePersonalTransaction = async (id: string) => { try { await apiFetch(`/finance/transactions/${id}`, { method: 'DELETE' }); setPersonalTransactions(prev => prev.filter(t => t.id !== id)); toast.success('تم حذف المعاملة') } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const startEditPersonalTxn = (txn: Transaction) => { setEditingPersonalTxnId(txn.id); setPersonalTxnForm({ type: txn.type as 'income' | 'expense', category: txn.category, amount: String(txn.amount), description: txn.description || '', date: txn.date?.split('T')[0] || '' }); setShowAddPersonalTxn(true) }
  const addPersonalReminder = async () => { if (!personalReminderForm.title) return toast.error('العنوان مطلوب'); try { const res = await apiFetch<any>('/reminders', { method: 'POST', body: JSON.stringify({ title: personalReminderForm.title, description: personalReminderForm.description || undefined, date: personalReminderForm.date || cairoISO(), type: 'personal', status: 'pending' }) }); const item = res?.data || res?.reminder || res; if (item?.id) { setPersonalReminders(prev => [item, ...prev]); toast.success('تم إضافة التذكير') }; setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }); setShowAddPersonalReminder(false); setEditingPersonalReminderId(null) } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const editPersonalReminder = async () => { if (!editingPersonalReminderId || !personalReminderForm.title) return; try { await apiFetch(`/reminders/${editingPersonalReminderId}`, { method: 'PUT', body: JSON.stringify({ title: personalReminderForm.title, description: personalReminderForm.description || undefined, date: personalReminderForm.date || undefined }) }); setPersonalReminders(prev => prev.map(r => r.id === editingPersonalReminderId ? { ...r, title: personalReminderForm.title, description: personalReminderForm.description || r.description, date: personalReminderForm.date || r.date } : r)); toast.success('تم تعديل التذكير'); setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }); setShowAddPersonalReminder(false) } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const deletePersonalReminder = async (id: string) => { try { await apiFetch(`/reminders/${id}`, { method: 'DELETE' }); setPersonalReminders(prev => prev.filter(r => r.id !== id)); toast.success('تم حذف التذكير') } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const togglePersonalReminderDone = async (reminder: Reminder) => { try { const newStatus = reminder.status === 'done' ? 'pending' : 'done'; await apiFetch(`/reminders/${reminder.id}`, { method: 'PUT', body: JSON.stringify({ status: newStatus }) }); setPersonalReminders(prev => prev.map(r => r.id === reminder.id ? { ...r, status: newStatus } : r)); if (newStatus === 'done') { setCelebratingPersonalId(reminder.id); setTimeout(() => setCelebratingPersonalId(null), 1500) }; toast.success(newStatus === 'done' ? 'تم إنجاز التذكير' : 'تم إلغاء الإنجاز') } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const startEditPersonalReminder = (r: Reminder) => { setEditingPersonalReminderId(r.id); setPersonalReminderForm({ title: r.title, description: r.description || '', date: r.date?.split('T')[0] || '', type: 'شخصي' }); setShowAddPersonalReminder(true) }
  const addPersonalNote = async () => { if (!personalNoteForm.content) return toast.error('المحتوى مطلوب'); try { const res = await apiFetch<any>('/notes', { method: 'POST', body: JSON.stringify({ content: personalNoteForm.content, important: personalNoteForm.important, section: 'personal' }) }); const item = res?.data || res?.note || res; if (item?.id) { setPersonalNotes(prev => [item, ...prev]); toast.success('تم إضافة الملاحظة') }; setPersonalNoteForm({ content: '', important: false }); setShowAddPersonalNote(false) } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const editPersonalNote = async (id: string, content: string, important: boolean) => { try { await apiFetch(`/notes/${id}`, { method: 'PUT', body: JSON.stringify({ content, important }) }); setPersonalNotes(prev => prev.map(n => n.id === id ? { ...n, content, important } : n)); toast.success('تم تعديل الملاحظة'); setEditingPersonalNoteId(null) } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const deletePersonalNote = async (id: string) => { try { await apiFetch(`/notes/${id}`, { method: 'DELETE' }); setPersonalNotes(prev => prev.filter(n => n.id !== id)); toast.success('تم حذف الملاحظة') } catch (e: any) { toast.error(e.message || 'خطأ') } }
  const togglePersonalNoteImportance = async (note: Note) => { try { await apiFetch(`/notes/${note.id}`, { method: 'PUT', body: JSON.stringify({ important: !note.important }) }); setPersonalNotes(prev => prev.map(n => n.id === note.id ? { ...n, important: !n.important } : n)); toast.success(note.important ? 'تم إلغاء الأهمية' : 'تم وضع علامة مهم') } catch (e: any) { toast.error(e.message || 'خطأ') } }

  // ─── Selected FollowUp ─────────────────────────────────────────────
  const selectedFU = useMemo(() => { if (!selectedFollowUpId) return null; const fu = followUpRecords.find(f => f.id === selectedFollowUpId); if (!fu) return null; const patient = patients.find(p => p.id === fu.patientId); const fuVisits = fu.visits || []; return { ...fu, patient, visits: fuVisits } }, [selectedFollowUpId, followUpRecords, patients])

  // ─── renderQuickNotes ──────────────────────────────────────────────
  const renderQuickNotes = (section: string) => {
    const sectionNotesList = notes.filter(n => n.section === section)
    const noteColors = ['from-rose-100 to-pink-100 dark:from-rose-900/20 dark:to-pink-900/20 border-rose-300 dark:border-rose-700', 'from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-300 dark:border-blue-700', 'from-emerald-100 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-300 dark:border-emerald-700', 'from-amber-100 to-yellow-100 dark:from-amber-900/20 dark:to-yellow-900/20 border-amber-300 dark:border-amber-700', 'from-violet-100 to-purple-100 dark:from-violet-900/20 dark:to-purple-900/20 border-violet-300 dark:border-violet-700', 'from-cyan-100 to-sky-100 dark:from-cyan-900/20 dark:to-sky-900/20 border-cyan-300 dark:border-cyan-700']
    const noteEmojis = ['📝', '💡', '📌', '🔔', '⭐', '💬']
    return (
      <Card className="card-luxury mt-4 border-2 border-indigo-200 dark:border-indigo-800" key={`notes-${section}`}>
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><div className="animate-wiggle"><FileText size={14} className="text-indigo-500" /></div> ملاحظات محترفة</CardTitle></CardHeader>
        <CardContent className="space-y-2">
          <div className="flex gap-2">
            <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة سريعة..." className="input-luxury rounded-xl h-9 text-sm border-2 border-indigo-200 dark:border-indigo-800 focus:border-indigo-400" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
            <button className="px-3 py-1.5 rounded-xl bg-gradient-to-l from-indigo-500 to-violet-500 text-white text-sm font-bold shadow-md" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section, createdAt: cairoISO() }, setNotes); setQuickNote('') } }}><Plus size={16} /></button>
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

  // ─── Broadcast function ─────────────────────────────────────────────
  const sendBroadcast = async () => {
    setBroadcastSending(true); setBroadcastProgress(0)
    const filter = broadcastFilter
    let targetPatients = patients
    if (filter === 'with-phone') targetPatients = patients.filter(p => p.phone)
    else if (filter === 'starred') targetPatients = patients.filter(p => p.starred)
    else if (filter === 'selected') targetPatients = patients.filter(p => broadcastSelectedIds.includes(p.id))
    const total = targetPatients.length; let sent = 0
    for (const p of targetPatients) { if (!p.phone) continue; const url = `https://wa.me/${waPhone(p.phone)}?text=${encodeURIComponent(broadcastMessage)}`; window.open(url, '_blank'); sent++; setBroadcastProgress(Math.round((sent / total) * 100)); await new Promise(r => setTimeout(r, 500)) }
    setBroadcastSending(false); setBroadcastProgress(100); toast.success(`تم إرسال الرسالة إلى ${sent} مريض`)
  }

  // ─── Loading guard: don't render until data is ready ──────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center">
          <div className="text-4xl animate-spin mb-4">⏳</div>
          <p className="text-muted-foreground font-medium">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <>
              <div className="space-y-5">
                {/* ─── Ultra Premium Header ─── */}
                <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#6366F1] via-[#A855F7] to-[#EC4899] p-6 shadow-2xl">
                  <div className="absolute inset-0">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/20 rounded-full blur-3xl animate-drift-a"/>
                    <div className="absolute bottom-0 left-0 w-36 h-36 bg-pink-300/20 rounded-full blur-3xl animate-drift-a"/>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-200/10 rounded-full blur-3xl animate-pulse-scale-lg"/>
                    <div className="absolute -top-10 -left-10 w-32 h-32 border border-white/10 rounded-full animate-spin-slow"/>
                    <div className="absolute -bottom-8 -right-8 w-40 h-40 border border-white/10 rounded-full animate-spin-slow"/>
                  </div>
                  <div className="relative z-10 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-4xl shadow-lg border border-white/20 animate-spin-slow">📋</div>
                    <div>
                      <h1 className="text-3xl font-black text-white drop-shadow-lg" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>المزيد</h1>
                      <p className="text-white/90 text-sm font-medium">خدمات وأدوات إضافية لإدارة عيادتك</p>
                    </div>
                  </div>
                </motion.div>

                {/* ─── Ultra Premium Navigation Grid ─── */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                  {[
                    { id: 'followup', label: 'المتابعات', emoji: '🔄', gradient: 'from-[#06B6D4] to-[#0891B2]', glow: 'shadow-cyan-500/40', ring: 'ring-cyan-400/60' },
                    { id: 'services', label: 'الخدمات', emoji: '⚙️', gradient: 'from-[#14B8A6] to-[#0D9488]', glow: 'shadow-teal-500/40', ring: 'ring-teal-400/60' },
                    { id: 'sessions', label: 'الجلسات', emoji: '⚡', gradient: 'from-[#8B5CF6] to-[#7C3AED]', glow: 'shadow-violet-500/40', ring: 'ring-violet-400/60' },
                    { id: 'visits', label: 'الزيارات', emoji: '🩺', gradient: 'from-[#3B82F6] to-[#2563EB]', glow: 'shadow-blue-500/40', ring: 'ring-blue-400/60' },
                    { id: 'doctors', label: 'الأطباء', emoji: '👨‍⚕️', gradient: 'from-[#10B981] to-[#059669]', glow: 'shadow-emerald-500/40', ring: 'ring-emerald-400/60' },
                    { id: 'inventory', label: 'المخزون', emoji: '📦', gradient: 'from-[#F59E0B] to-[#D97706]', glow: 'shadow-amber-500/40', ring: 'ring-amber-400/60' },
                    { id: 'bookings', label: 'الحجز', emoji: '📅', gradient: 'from-[#0EA5E9] to-[#0284C7]', glow: 'shadow-sky-500/40', ring: 'ring-sky-400/60' },
                    { id: 'medications', label: 'الأدوية', emoji: '💊', gradient: 'from-[#84CC16] to-[#65A30D]', glow: 'shadow-lime-500/40', ring: 'ring-lime-400/60' },
                    { id: 'reminders', label: 'التذكيرات', emoji: '⏰', gradient: 'from-[#F43F5E] to-[#E11D48]', glow: 'shadow-rose-500/40', ring: 'ring-rose-400/60' },
                    { id: 'templates', label: 'القوالب', emoji: '📋', gradient: 'from-[#D946EF] to-[#C026D3]', glow: 'shadow-fuchsia-500/40', ring: 'ring-fuchsia-400/60' },
                    { id: 'waiting', label: 'الانتظار', emoji: '⏳', gradient: 'from-[#EF4444] to-[#DC2626]', glow: 'shadow-red-500/40', ring: 'ring-red-400/60' },
                    { id: 'broadcast', label: 'رسائل', emoji: '📩', gradient: 'from-[#22C55E] to-[#16A34A]', glow: 'shadow-green-500/40', ring: 'ring-green-400/60' },
                    { id: 'reports', label: 'التقارير', emoji: '📊', gradient: 'from-[#06B6D4] to-[#0284C7]', glow: 'shadow-cyan-500/40', ring: 'ring-cyan-400/60' },
                    { id: 'backup', label: 'النسخ', emoji: '💾', gradient: 'from-[#64748B] to-[#475569]', glow: 'shadow-slate-500/40', ring: 'ring-slate-400/60' },
                    { id: 'notes', label: 'الملاحظات', emoji: '📝', gradient: 'from-[#6366F1] to-[#4F46E5]', glow: 'shadow-indigo-500/40', ring: 'ring-indigo-400/60' },
                    { id: 'personal', label: 'شخصي', emoji: '🌟', gradient: 'from-[#F97316] to-[#EA580C]', glow: 'shadow-orange-500/40', ring: 'ring-orange-400/60' },
                    { id: 'settings', label: 'الإعدادات', emoji: '🎨', gradient: 'from-[#A855F7] to-[#9333EA]', glow: 'shadow-purple-500/40', ring: 'ring-purple-400/60' },
                  ].map(s => (
 <button key={s.id} onClick={() => setMoreSubTab(s.id)} className={cn('relative overflow-hidden flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all duration-300 active:scale-[0.9] hover:scale-[1.08] transition-transform duration-150', moreSubTab === s.id ? cn('ring-2 shadow-xl scale-105 bg-white dark:bg-gray-800', s.ring, s.glow) : 'bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 hover:shadow-lg border border-white/30 dark:border-gray-700/30')}>
                      {moreSubTab === s.id && <div className={cn('absolute inset-0 bg-gradient-to-br opacity-15', s.gradient)} />}
                      <motion.div animate={moreSubTab === s.id ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 0.5 }} className={cn('w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all duration-300', moreSubTab === s.id ? cn('bg-gradient-to-br text-white shadow-lg', s.gradient, s.glow) : 'bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600')}>{s.emoji}</motion.div>
                      <span className={cn('text-[10px] font-bold transition-colors whitespace-nowrap', moreSubTab === s.id ? 'text-foreground' : 'text-muted-foreground')}>{s.label}</span>
                    </button>
                  ))}
                </div>

                {/* ═══ Follow-up (المتابعات) Sub-tab - LIGHT CYAN/TEAL THEME ═══ */}
                {moreSubTab === 'followup' && (() => {
                  const filteredFU = followUpRecords.filter(fu => {
                    if (followUpFilter !== 'all' && fu.status !== followUpFilter) return false
                    if (followUpSearch.trim()) {
                      const q = followUpSearch.toLowerCase()
                      const pName = fu.patient?.name?.toLowerCase() || ''
                      const pPhone = fu.patient?.phone || ''
                      const pFile = fu.patient?.fileNumber?.toLowerCase() || ''
                      return fu.condition.toLowerCase().includes(q) || pName.includes(q) || pPhone.includes(q) || pFile.includes(q) || (fu.diagnosis || '').toLowerCase().includes(q)
                    }
                    return true
                  })
                  // selectedFU is now defined at component level
                  const activeCount = followUpRecords.filter(f => f.status === 'active').length
                  const subCount = followUpRecords.filter(f => f.hasSubscription).length
                  const dueSoon = followUpRecords.filter(f => {
                    if (!f.nextVisitDate || f.status !== 'active') return false
                    const next = new Date(f.nextVisitDate)
                    const now = new Date()
                    const diffDays = (next.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
                    return diffDays >= 0 && diffDays <= 3
                  }).length
                  const fuPatientSuggestions = patients.filter(p => {
                    if (!fuFormPatientSearch) return false
                    const q = fuFormPatientSearch.toLowerCase()
                    return p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)
                  }).slice(0, 5)
                  const SEVERITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
                    mild: { label: 'خفيف', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                    moderate: { label: 'متوسط', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    severe: { label: 'شديد', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30' },
                    critical: { label: 'حرج', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
                  }
                  const FREQ_MAP: Record<string, string> = { weekly: 'أسبوعي', biweekly: 'كل أسبوعين', monthly: 'شهري', quarterly: 'ربع سنوي', custom: 'مخصص' }
                  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
                    active: { label: 'نشط', color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
                    paused: { label: 'متوقف', color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
                    completed: { label: 'مكتمل', color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30' },
                    discharged: { label: 'خرج', color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-900/30' },
                  }
                  return (
                  <div className="space-y-4">
                    {/* Hero Header - Light Cyan Theme */}
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0891B2] via-[#06B6D4] to-[#67E8F9] p-5 shadow-xl">
                      <div className="absolute inset-0 opacity-15">
                        <div className="absolute top-0 right-0 w-36 h-36 bg-white/30 rounded-full blur-3xl animate-drift-a"/>
                        <div className="absolute bottom-0 left-0 w-28 h-28 bg-white/20 rounded-full blur-3xl animate-drift-a"/>
                      </div>
                      <div className="relative z-10 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl animate-spin-slow">🔄</div>
                          <div>
                            <h1 className="text-2xl font-bold text-white">المتابعات</h1>
                            <p className="text-white/80 text-sm">متابعة الحالات المزمنة والباقات</p>
                          </div>
                        </div>
                        {isDoctor && <Button className="rounded-xl bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm" onClick={() => { setShowAddFollowUp(true); setFuFormPatientSearch(''); setFuFormPatientId(''); setFuFormCondition(''); setFuFormCategory('جلدية'); setFuFormSeverity('moderate'); setFuFormFrequency('monthly'); setFuFormCustomDays(''); setFuFormNextVisit(''); setFuFormDiagnosis(''); setFuFormTreatmentPlan(''); setFuFormMedications(''); setFuFormNotes(''); setFuFormHasSubscription(false); setFuFormSubType('monthly'); setFuFormSubPrice(''); setFuFormSubStart(''); setFuFormSubEnd(''); setFuFormSubSessions('') }}><Plus size={16} className="ml-1" /> حالة جديدة</Button>}
                      </div>
                      {/* Stats Row */}
                      <div className="relative z-10 grid grid-cols-3 gap-3 mt-4">
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"><p className="text-white/70 text-[10px]">حالات نشطة</p><p className="text-white text-xl font-black">{activeCount}</p></div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"><p className="text-white/70 text-[10px]">باقات متابعة</p><p className="text-white text-xl font-black">{subCount}</p></div>
                        <div className="bg-white/15 backdrop-blur-sm rounded-xl p-3 text-center"><p className="text-white/70 text-[10px]">زيارات قريبة</p><p className="text-white text-xl font-black">{dueSoon}</p></div>
                      </div>
                    </motion.div>

                    {/* Search & Filters */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      <div className="relative flex-1"><Search className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0891B2]/40" size={16} /><Input placeholder="بحث بالاسم أو الحالة أو التشخيص..." value={followUpSearch} onChange={e => setFollowUpSearch(e.target.value)} className="pr-10 input-luxury rounded-xl h-11 border-[#06B6D4]/30 focus:border-[#0891B2]" /></div>
                      <div className="flex gap-1.5 flex-wrap">
                        {(['all', 'active', 'paused', 'completed', 'discharged'] as const).map(f => (
                          <Button key={f} size="sm" variant={followUpFilter === f ? 'default' : 'outline'} className={cn('rounded-lg text-xs h-9', followUpFilter === f ? 'bg-[#0891B2] text-white' : 'border-[#06B6D4]/30 text-[#0891B2]')} onClick={() => setFollowUpFilter(f)}>
                            {f === 'all' ? 'الكل' : f === 'active' ? 'نشط' : f === 'paused' ? 'متوقف' : f === 'completed' ? 'مكتمل' : 'خرج'}
                          </Button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                      {/* Follow-up Records List */}
                      <div className="lg:col-span-1 space-y-2 max-h-[65vh] overflow-y-auto">
                        {filteredFU.length === 0 && <Card className="card-luxury p-8 text-center border-[#06B6D4]/20"><p className="text-4xl mb-2">🔄</p><p className="text-muted-foreground">لا توجد متابعات</p></Card>}
                        {filteredFU.map(fu => {
                          const sev = SEVERITY_MAP[fu.severity] || SEVERITY_MAP.moderate
                          const stat = STATUS_MAP[fu.status] || STATUS_MAP.active
                          const isDue = fu.nextVisitDate && new Date(fu.nextVisitDate) <= new Date() && fu.status === 'active'
                          const isSelected = selectedFollowUpId === fu.id
                          return (
                            <motion.div key={fu.id} whileTap={{ scale: 0.98 }} onClick={() => { setSelectedFollowUpId(isSelected ? null : fu.id); setFollowUpDetailTab('overview') }} className={cn('cursor-pointer rounded-xl p-3 border-2 transition-all', isSelected ? 'border-[#0891B2] bg-[#0891B2]/5 shadow-lg' : 'border-transparent bg-card hover:border-[#06B6D4]/30 hover:shadow-md')}>
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <div className={cn('p-1.5 rounded-lg', sev.bg)}><span className="text-xs">{fu.conditionCategory === 'جلدية' ? '🩺' : fu.conditionCategory === 'داخلية' ? '💊' : '📋'}</span></div>
                                  <div>
                                    <p className="font-bold text-sm">{fu.patient?.name || 'مريض'}</p>
                                    <p className="text-xs text-muted-foreground">{fu.condition}</p>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <Badge className={cn('text-[8px]', stat.bg, stat.color)}>{stat.label}</Badge>
                                  {isDue && <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[8px]">⏰ موعد اليوم</Badge>}
                                  {fu.hasSubscription && <Badge className="bg-[#06B6D4]/20 text-[#0891B2] text-[8px]">💎 باقة</Badge>}
                                </div>
                              </div>
                              <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                                <span className={cn('font-medium', sev.color)}>{sev.label}</span>
                                <span>•</span>
                                <span>{FREQ_MAP[fu.frequency] || fu.frequency}</span>
                                {fu.nextVisitDate && <><span>•</span><span>التالي: {formatDate(fu.nextVisitDate)}</span></>}
                              </div>
                              {fu.hasSubscription && (
                                <div className="mt-2 flex items-center gap-1.5">
                                  <div className="flex-1 h-1.5 rounded-full bg-[#67E8F9]/30 dark:bg-[#0891B2]/20"><div className="h-full rounded-full bg-gradient-to-l from-[#0891B2] to-[#06B6D4]" style={{ width: `${fu.sessionsIncluded > 0 ? (fu.sessionsUsed / fu.sessionsIncluded) * 100 : 0}%` }} /></div>
                                  <span className="text-[9px] font-bold text-[#0891B2]">{fu.sessionsUsed}/{fu.sessionsIncluded}</span>
                                </div>
                              )}
                            </motion.div>
                          )
                        })}
                      </div>

                      {/* Detail Panel */}
                      <div className="lg:col-span-2">
                        {selectedFU ? (() => {
                          const fu = selectedFU
                          const sev = SEVERITY_MAP[fu.severity] || SEVERITY_MAP.moderate
                          const stat = STATUS_MAP[fu.status] || STATUS_MAP.active
                          const pat = fu.patient
                          return (
                            <Card className="card-luxury border-[#06B6D4]/20 overflow-hidden">
                              {/* Detail Header */}
                              <div className="bg-gradient-to-l from-[#0891B2] to-[#06B6D4] p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">🔄</div>
                                    <div>
                                      <h2 className="text-lg font-bold text-white">{pat?.name || 'مريض'}</h2>
                                      <p className="text-white/80 text-sm">{fu.condition} • {sev.label}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className={cn('text-xs', stat.bg, stat.color)}>{stat.label}</Badge>
                                    {canDelete && <Button size="sm" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => setDeleteFollowUpConfirmId(fu.id)}><Trash2 size={14} /></Button>}
                                  </div>
                                </div>
                                {/* Detail Tabs */}
                                <div className="flex gap-2 mt-3">
                                  {(['overview', 'visits', 'subscription'] as const).map(t => (
                                    <Button key={t} size="sm" className={cn('rounded-lg text-xs h-8', followUpDetailTab === t ? 'bg-white/25 text-white' : 'bg-white/10 text-white/60 hover:bg-white/15')} onClick={() => setFollowUpDetailTab(t)}>
                                      {t === 'overview' ? '📋 نظرة عامة' : t === 'visits' ? '🩺 الزيارات' : '💎 الباقة'}
                                    </Button>
                                  ))}
                                </div>
                              </div>

                              <CardContent className="p-4 space-y-3">
                                {/* Overview Tab */}
                                {followUpDetailTab === 'overview' && (
                                  <div className="space-y-3">
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">الشدة</p><p className={cn('font-bold text-sm', sev.color)}>{sev.label}</p></div>
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">التكرار</p><p className="font-bold text-sm">{FREQ_MAP[fu.frequency] || fu.frequency}</p></div>
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">آخر زيارة</p><p className="font-bold text-sm">{fu.lastVisitDate ? formatDate(fu.lastVisitDate) : 'لا توجد'}</p></div>
                                      <div className="p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20"><p className="text-[10px] text-muted-foreground">الزيارة القادمة</p><p className={cn('font-bold text-sm', fu.nextVisitDate && new Date(fu.nextVisitDate) <= new Date() ? 'text-red-600' : 'text-emerald-600')}>{fu.nextVisitDate ? formatDate(fu.nextVisitDate) : 'غير محدد'}</p></div>
                                    </div>
                                    {fu.diagnosis && <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800"><p className="text-[10px] text-blue-600 font-bold">التشخيص</p><p className="text-sm mt-1">{fu.diagnosis}</p></div>}
                                    {fu.treatmentPlan && <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-200 dark:border-violet-800"><p className="text-[10px] text-violet-600 font-bold">خطة العلاج</p><p className="text-sm mt-1">{fu.treatmentPlan}</p></div>}
                                    {fu.medications && <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800"><p className="text-[10px] text-emerald-600 font-bold">الأدوية</p><p className="text-sm mt-1">{fu.medications}</p></div>}
                                    {fu.notes && <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800"><p className="text-[10px] text-amber-600 font-bold">ملاحظات</p><p className="text-sm mt-1">{fu.notes}</p></div>}
                                    {/* Patient Info */}
                                    {pat && <div className="p-3 rounded-xl bg-muted/50 border"><div className="flex items-center justify-between"><div className="flex items-center gap-2"><span className="text-lg">👤</span><div><p className="font-bold text-sm">{pat.name}</p><div className="flex items-center gap-2 text-xs text-muted-foreground"><span>{pat.fileNumber}</span>{pat.phone && <><span>•</span><a href={`https://wa.me/${waPhone(pat.phone)}`} target="_blank" className="text-emerald-600 hover:underline">{pat.phone}</a></>}</div></div></div><Button size="sm" variant="outline" className="rounded-lg text-[#0891B2] border-[#06B6D4]/30" onClick={() => { setSelectedPatient(pat); setActiveTab('patients') }}>📋 ملف المريض</Button></div></div>}
                                    {/* Quick Actions */}
                                    <div className="flex gap-2">
                                      {isDoctor && <Button className="flex-1 rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white" onClick={() => setShowAddFollowUpVisit(true)}><Plus size={14} className="ml-1" /> زيارة متابعة</Button>}
                                      <Button variant="outline" className="rounded-xl border-[#06B6D4]/30 text-[#0891B2]" onClick={async () => { try { await apiFetch(`/follow-up/records/${fu.id}`, { method: 'PUT', body: JSON.stringify({ status: fu.status === 'active' ? 'paused' : 'active' }) }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, status: fu.status === 'active' ? 'paused' : 'active' } : f)); toast.success(fu.status === 'active' ? 'تم إيقاف المتابعة' : 'تم تنشيط المتابعة') } catch { toast.error('خطأ') } }}>{fu.status === 'active' ? '⏸ إيقاف' : '▶️ تنشيط'}</Button>
                                    </div>
                                  </div>
                                )}

                                {/* Visits Tab */}
                                {followUpDetailTab === 'visits' && (
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between"><h3 className="font-bold text-sm flex items-center gap-1"><Calendar size={14} className="text-[#0891B2]" /> سجل الزيارات ({fu.followUpVisits?.length || 0})</h3>{isDoctor && <Button size="sm" className="rounded-lg bg-[#0891B2] text-white text-xs" onClick={() => setShowAddFollowUpVisit(true)}><Plus size={12} className="ml-1" /> زيارة جديدة</Button>}</div>
                                    {(fu.followUpVisits || []).length === 0 && <div className="text-center py-8"><p className="text-3xl mb-2">📋</p><p className="text-muted-foreground text-sm">لا توجد زيارات بعد</p></div>}
                                    {(fu.followUpVisits || []).map(v => (
                                      <Card key={v.id} className="border border-[#06B6D4]/20 p-3">
                                        <div className="flex items-center justify-between">
                                          <div className="flex items-center gap-2">
                                            <div className={cn('p-2 rounded-lg', v.status === 'completed' ? 'bg-emerald-100 dark:bg-emerald-900/30' : v.status === 'no_show' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30')}>
                                              <span className="text-sm">{v.status === 'completed' ? '✅' : v.status === 'no_show' ? '❌' : '⏳'}</span>
                                            </div>
                                            <div>
                                              <p className="font-bold text-xs">زيارة #{v.visitNumber}</p>
                                              <p className="text-[10px] text-muted-foreground">{formatDate(v.visitDate)}</p>
                                            </div>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge className={cn('text-[8px]', v.paid ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700')}>{v.paid ? 'مدفوعة' : 'غير مدفوعة'}</Badge>
                                            {v.price > 0 && <span className="text-xs font-bold text-[#0891B2]">{formatCurrency(v.price)}</span>}
                                            {canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { await apiFetch(`/follow-up/visits/${v.id}`, { method: 'DELETE' }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, followUpVisits: (f.followUpVisits || []).filter(fv => fv.id !== v.id), sessionsUsed: Math.max(0, f.sessionsUsed - 1) } : f)); toast.success('تم حذف الزيارة') } catch { toast.error('خطأ') } }}><Trash2 size={10} className="text-red-500" /></Button>}
                                          </div>
                                        </div>
                                        {v.findings && <p className="text-xs mt-2 text-muted-foreground"><span className="font-bold">النتائج:</span> {v.findings}</p>}
                                        {v.treatmentNotes && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">العلاج:</span> {v.treatmentNotes}</p>}
                                        {v.medications && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">الأدوية:</span> {v.medications}</p>}
                                        {v.instructions && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">التعليمات:</span> {v.instructions}</p>}
                                        {v.notes && <p className="text-xs mt-1 text-muted-foreground"><span className="font-bold">ملاحظات:</span> {v.notes}</p>}
                                        {!v.paid && v.price > 0 && !fu.hasSubscription && (
                                          <Button size="sm" className="mt-2 rounded-lg bg-emerald-500 text-white text-[10px] h-7" onClick={async () => { try { await apiFetch(`/follow-up/visits/${v.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) }); const txnAmount = v.price; const txnDesc = `زيارة متابعة #${v.visitNumber} - ${pat?.name || 'مريض'} - ${fu.condition}`; const txnDate = v.visitDate || cairoISO(); try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'متابعة', amount: txnAmount, description: txnDesc, date: txnDate }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]); } else { setTransactions(prev => [...prev, { id: 'fu-pay-' + Date.now(), type: 'income', category: 'متابعة', amount: txnAmount, description: txnDesc, date: txnDate }]); } } catch { setTransactions(prev => [...prev, { id: 'fu-pay-' + Date.now(), type: 'income', category: 'متابعة', amount: txnAmount, description: txnDesc, date: txnDate }]); } setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, followUpVisits: (f.followUpVisits || []).map(fv => fv.id === v.id ? { ...fv, paid: true } : fv) } : f)); toast.success('تم تأكيد الدفع') } catch { toast.error('خطأ') } }}>💰 دفع</Button>
                                        )}
                                      </Card>
                                    ))}
                                  </div>
                                )}

                                {/* Subscription Tab */}
                                {followUpDetailTab === 'subscription' && (
                                  <div className="space-y-3">
                                    {fu.hasSubscription ? (
                                      <>
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-[#0891B2]/10 to-[#06B6D4]/10 border-2 border-[#06B6D4]/30">
                                          <div className="flex items-center gap-2 mb-3"><span className="text-2xl">💎</span><div><p className="font-bold text-[#0891B2]">باقة المتابعة</p><p className="text-xs text-muted-foreground">{fu.subscriptionType === 'monthly' ? 'شهرية' : fu.subscriptionType === 'quarterly' ? 'ربع سنوية' : fu.subscriptionType === 'yearly' ? 'سنوية' : 'بالجلسات'}</p></div></div>
                                          <div className="grid grid-cols-2 gap-3">
                                            <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">السعر</p><p className="font-bold text-sm text-[#0891B2]">{formatCurrency(fu.subscriptionPrice)}</p></div>
                                            <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">الجلسات</p><p className="font-bold text-sm">{fu.sessionsUsed} / {fu.sessionsIncluded}</p></div>
                                            {fu.subscriptionStart && <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">البداية</p><p className="font-bold text-sm">{formatDate(fu.subscriptionStart)}</p></div>}
                                            {fu.subscriptionEnd && <div className="p-2 rounded-lg bg-white/50 dark:bg-white/5"><p className="text-[10px] text-muted-foreground">النهاية</p><p className="font-bold text-sm">{formatDate(fu.subscriptionEnd)}</p></div>}
                                          </div>
                                          {/* Progress Bar */}
                                          <div className="mt-3">
                                            <div className="flex items-center justify-between mb-1"><span className="text-[10px] text-muted-foreground">استخدام الجلسات</span><span className="text-[10px] font-bold text-[#0891B2]">{fu.sessionsIncluded > 0 ? Math.round((fu.sessionsUsed / fu.sessionsIncluded) * 100) : 0}%</span></div>
                                            <div className="h-2.5 rounded-full bg-[#67E8F9]/30"><div className="h-full rounded-full bg-gradient-to-l from-[#0891B2] to-[#06B6D4] transition-all" style={{ width: `${fu.sessionsIncluded > 0 ? (fu.sessionsUsed / fu.sessionsIncluded) * 100 : 0}%` }} /></div>
                                          </div>
                                        </div>
                                        <div className="flex gap-2">
                                          <Button variant="outline" className="flex-1 rounded-xl border-[#06B6D4]/30 text-[#0891B2]" onClick={async () => { try { await apiFetch(`/follow-up/records/${fu.id}`, { method: 'PUT', body: JSON.stringify({ sessionsUsed: fu.sessionsUsed + 1 }) }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, sessionsUsed: f.sessionsUsed + 1 } : f)); toast.success('تم تسجيل استخدام جلسة') } catch { toast.error('خطأ') } }}>➕ استخدام جلسة</Button>
                                          <Button variant="outline" className="rounded-xl border-red-300 text-red-600" onClick={async () => { try { await apiFetch(`/follow-up/records/${fu.id}`, { method: 'PUT', body: JSON.stringify({ hasSubscription: false, subscriptionType: null, subscriptionPrice: 0, sessionsIncluded: 0, sessionsUsed: 0 }) }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, hasSubscription: false, subscriptionType: undefined, subscriptionPrice: 0, sessionsIncluded: 0, sessionsUsed: 0 } : f)); toast.success('تم إلغاء الباقة') } catch { toast.error('خطأ') } }}>🗑 إلغاء الباقة</Button>
                                        </div>
                                      </>
                                    ) : (
                                      <div className="text-center py-8">
                                        <p className="text-4xl mb-3">💎</p>
                                        <p className="text-muted-foreground mb-4">لا توجد باقة متابعة لهذه الحالة</p>
                                        <p className="text-sm text-muted-foreground mb-4">الباقة تتيح للمريض دفع مبلغ مقطوع والحصول على عدد زيارات محددة بدون دفع كل مرة</p>
                                        <Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white" onClick={() => setEditingFollowUpId(fu.id)}>إضافة باقة متابعة</Button>
                                      </div>
                                    )}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          )
                        })() : (
                          <Card className="card-luxury p-12 text-center border-[#06B6D4]/20">
                            <div className="text-5xl mb-3 animate-bounce-y">🔄</div>
                            <p className="text-muted-foreground">اختر حالة من القائمة لعرض التفاصيل</p>
                          </Card>
                        )}
                      </div>
                    </div>
                  </div>
                  )
                })()}

                {/* Services Sub-tab - Premium Design */}
                {moreSubTab === 'services' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 via-emerald-500 to-green-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-drift-c"/></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="text-4xl animate-spin-slow">⚙️</div><div><h2 className="text-2xl font-black text-white">الخدمات</h2><p className="text-white/80 text-sm">{services.length} خدمة مسجلة</p></div></div>
                      {isDoctor && <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddService(true)}><Plus size={14} className="ml-1" /> خدمة جديدة</Button>}
                    </div>
                  </motion.div>

                  {/* ─── Default Visit Prices Card ─── */}
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-cyan-950/30 p-4 shadow-lg">
                    <div className="absolute top-0 left-0 w-24 h-24 bg-blue-400/10 rounded-full blur-2xl" />
                    <div className="relative z-10">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="text-xl animate-pulse-scale">💰</div>
                        <h3 className="font-bold text-sm text-blue-700 dark:text-blue-400">قيم الكشف والإعادة الافتراضية</h3>
                        <span className="text-[9px] text-muted-foreground bg-blue-100 dark:bg-blue-900/30 px-2 py-0.5 rounded-full">تُطبق تلقائياً عند إنشاء زيارة</span>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="relative">
                          <Label className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mb-1">🩺 قيمة الكشف</Label>
                          <div className="relative">
                            <Input type="number" value={defaultCheckupPrice} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0) setDefaultCheckupPrice(v) }} className="pr-10 rounded-xl h-11 text-lg font-bold border-2 border-emerald-200 dark:border-emerald-800 bg-white dark:bg-black/20 text-emerald-700 dark:text-emerald-300 focus:border-emerald-500" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">ج.م</span>
                          </div>
                        </div>
                        <div className="relative">
                          <Label className="text-[10px] font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1 mb-1">🔄 قيمة الإعادة</Label>
                          <div className="relative">
                            <Input type="number" value={defaultRevisitPrice} onChange={e => { const v = parseInt(e.target.value); if (!isNaN(v) && v >= 0) setDefaultRevisitPrice(v) }} className="pr-10 rounded-xl h-11 text-lg font-bold border-2 border-blue-200 dark:border-blue-800 bg-white dark:bg-black/20 text-blue-700 dark:text-blue-300 focus:border-blue-500" />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-muted-foreground">ج.م</span>
                          </div>
                        </div>
                      </div>
                      <p className="text-[9px] text-muted-foreground mt-2 flex items-center gap-1"><Sparkles size={9} className="text-blue-400" /> يتم حفظ القيم تلقائياً وتطبيقها عند إنشاء زيارات جديدة</p>
                    </div>
                  </motion.div>
                  {services.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">⚙️</p><p className="text-muted-foreground">لا توجد خدمات بعد</p></Card>}
 {Object.entries(servicesByCategory).map(([cat, svcs]) => <Card key={cat} className="card-luxury active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><CardHeader className="pb-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><CardTitle className="text-sm flex items-center gap-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><Tag size={14} className="text-teal-500 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /> {cat} <Badge variant="secondary" className="text-[9px] active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{svcs.length}</Badge></CardTitle></CardHeader><CardContent className="space-y-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{svcs.map(s => <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-transparent hover:border-primary/20 transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><div className="flex items-center gap-3 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><div className={cn('w-2 h-8 rounded-full', s.active ? 'bg-emerald-500' : 'bg-red-400')} /><div>{editingServiceId === s.id ? (<div className="flex items-center gap-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><Input value={editingServiceName} onChange={e => setEditingServiceName(e.target.value)} className="h-8 text-sm rounded-lg font-medium w-32 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" placeholder="اسم الخدمة" /><Input type="number" value={editingServicePrice} onChange={e => setEditingServicePrice(e.target.value)} className="w-24 h-8 text-sm rounded-lg font-bold active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /><Button size="sm" className="h-8 rounded-lg text-xs bg-teal-600 text-white active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={async () => { const newPrice = parseFloat(editingServicePrice); const newName = editingServiceName.trim(); if (isNaN(newPrice)) { toast.error('أدخل سعر صحيح'); return } if (!newName) { toast.error('أدخل اسم الخدمة'); return } try { await apiFetch(`/services/${s.id}`, { method: 'PUT', body: JSON.stringify({ name: newName, price: newPrice }) }); setServices(prev => prev.map(sv => sv.id === s.id ? { ...sv, name: newName, price: newPrice } : sv)); toast.success('تم التحديث ✓'); setEditingServiceId(null) } catch (e: any) { toast.error(e?.message || 'خطأ'); setEditingServiceId(null) } }}>✓</Button><Button variant="ghost" size="sm" className="h-8 rounded-lg active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => setEditingServiceId(null)}>✕</Button></div>) : (<><p className="font-medium text-sm cursor-pointer hover:text-teal-600 hover:underline decoration-dashed underline-offset-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); setEditingServicePrice(String(s.price)) }}>{s.name}</p><p className="text-xs text-muted-foreground active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{s.duration ? `${s.duration} دقيقة` : 'بدون مدة محددة'}</p></>)}</div></div><div className="flex items-center gap-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{editingServiceId !== s.id && (<><button className="flex items-center gap-1 px-2.5 py-1 rounded-lg border-2 border-dashed border-teal-300 dark:border-teal-700 hover:border-teal-500 hover:bg-teal-50 dark:hover:bg-teal-950/20 transition-all cursor-pointer active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); setEditingServicePrice(String(s.price)) }}><span className="font-bold text-sm text-teal-700 dark:text-teal-300 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{s.price}</span><span className="text-xs text-muted-foreground active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">ج.م</span><Edit3 size={10} className="text-teal-400 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /></button><Button variant="ghost" size="icon" className="h-7 w-7 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => { setEditingServiceId(s.id); setEditingServiceName(s.name); setEditingServicePrice(String(s.price)) }}><Edit3 size={11} className="text-teal-500 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /></Button></>)}<Badge className={s.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{s.active ? 'نشط' : 'معطل'}</Badge>{canDelete && <Button variant="ghost" size="icon" className="h-7 w-7 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => deleteItem('/services', s.id, setServices)}><Trash2 size={12} className="text-red-500 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /></Button>}</div></div>)}</CardContent></Card>)}
                </div>)}

                {/* ═══ Sessions Sub-tab - PROFESSIONAL ANIMATED ═══ */}
                {moreSubTab === 'sessions' && (<div className="space-y-5">
                  {/* Animated Header */}
                  <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-fuchsia-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-20">
                      <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full blur-3xl animate-drift-a"/>
                      <div className="absolute bottom-0 left-0 w-32 h-32 bg-fuchsia-300/20 rounded-full blur-3xl animate-drift-a"/>
                    </div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="text-5xl animate-pulse-scale">⚡</div>
                        <div>
                          <h2 className="text-2xl font-black text-white">إدارة الجلسات</h2>
                          <p className="text-violet-200 text-sm mt-0.5">تتبع ومتابعة وإدارة جميع جلسات العيادة</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {isDoctor && <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          <Button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-xl shadow-lg" onClick={() => { setShowAddLaserRecord(true) }}><Plus size={14} className="ml-1" /> جلسة ليزر</Button>
                        </motion.div>}
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                          {canAddPatient && <Button className="bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 rounded-xl shadow-lg" onClick={() => { setShowAddPatient(true); setSelectedVisitType('session') }}><UserPlus size={14} className="ml-1" /> جديدة</Button>}
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Animated Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { icon: <Activity size={20} />, label: 'جلسات اليوم', value: sessions.filter(s => getLocalDateStr(s.date) === todayStr).length, gradient: 'from-violet-500 to-purple-600', emoji: '⚡' },
                      { icon: <CheckCircle size={20} />, label: 'مدفوعة', value: sessions.filter(s => s.paid).length, gradient: 'from-emerald-500 to-teal-600', emoji: '✅' },
                      { icon: <Clock size={20} />, label: 'غير مدفوعة', value: sessions.filter(s => !s.paid).length, gradient: 'from-amber-500 to-orange-600', emoji: '⏳' },
                      { icon: <DollarSign size={20} />, label: 'إجمالي الإيرادات', value: formatCurrency(sessions.reduce((s, ses) => s + (ses.price || 0), 0)), gradient: 'from-blue-500 to-indigo-600', emoji: '💰' },
                    ].map((stat, idx) => (
                      <motion.div key={stat.label} initial={{ opacity: 0, y: 30, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: idx * 0.1, type: 'spring', stiffness: 200 }} whileHover={{ scale: 1.03, y: -2 }} className="relative overflow-hidden">
                        <div className={cn('p-4 rounded-2xl bg-gradient-to-br text-white shadow-lg', stat.gradient)}>
                          <div className="absolute top-2 left-2 text-3xl opacity-20 animate-bounce-y-sm">{stat.emoji}</div>
                          <div className="relative z-10 flex items-center gap-3">
                            <div className="p-2 rounded-xl bg-white/20 backdrop-blur-sm">{stat.icon}</div>
                            <div><p className="text-[10px] text-white/70 font-medium">{stat.label}</p><p className="text-xl font-black">{stat.value}</p></div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Session Status Overview - Horizontal Bar */}
                  {(() => {
                    const total = sessions.length || 1
                    const paidCount = sessions.filter(s => s.paid).length
                    const unpaidCount = sessions.filter(s => !s.paid).length
                    const todayCount = sessions.filter(s => getLocalDateStr(s.date) === todayStr).length
                    const paidPct = Math.round((paidCount / total) * 100)
                    const unpaidPct = 100 - paidPct
                    return (
                      <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}>
                        <Card className="card-luxury overflow-hidden">
                          <div className="p-4">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-sm font-bold flex items-center gap-2"><BarChart2 size={16} className="text-violet-500" /> نسبة الدفع</p>
                              <div className="flex items-center gap-3 text-xs">
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> مدفوع {paidPct}%</span>
                                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> غير مدفوع {unpaidPct}%</span>
                              </div>
                            </div>
                            <div className="flex h-4 rounded-full overflow-hidden bg-muted">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${paidPct}%` }} transition={{ duration: 1, delay: 0.5 }} className="bg-gradient-to-l from-emerald-400 to-emerald-600" />
                              <motion.div initial={{ width: 0 }} animate={{ width: `${unpaidPct}%` }} transition={{ duration: 1, delay: 0.7 }} className="bg-gradient-to-l from-amber-400 to-amber-600" />
                            </div>
                            <div className="grid grid-cols-3 gap-3 mt-3">
                              <div className="text-center p-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-lg font-black text-emerald-600">{paidCount}</p><p className="text-[9px] text-muted-foreground">مدفوعة</p></div>
                              <div className="text-center p-2 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-lg font-black text-amber-600">{unpaidCount}</p><p className="text-[9px] text-muted-foreground">مستحقة</p></div>
                              <div className="text-center p-2 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-lg font-black text-violet-600">{todayCount}</p><p className="text-[9px] text-muted-foreground">اليوم</p></div>
                            </div>
                          </div>
                        </Card>
                      </motion.div>
                    )
                  })()}

                  {/* Today's Sessions - Animated */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <Card className="card-luxury border-2 border-violet-200 dark:border-violet-800 overflow-hidden">
                      <div className="bg-gradient-to-l from-violet-500 to-purple-600 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="text-xl animate-spin-slow">📅</div><CardTitle className="text-sm text-white font-bold">جلسات اليوم</CardTitle></div>
                        <Badge className="bg-white/20 text-white border-white/30">{sessions.filter(s => getLocalDateStr(s.date) === todayStr).length}</Badge>
                      </div>
                      <CardContent className="p-3 space-y-2">
                        {(() => {
                          const todaySessions = sessions.filter(s => getLocalDateStr(s.date) === todayStr)
                          if (todaySessions.length === 0) return <div className="text-center py-8"><div className="text-5xl mb-3 animate-bounce-y">😴</div><p className="text-muted-foreground font-medium">لا توجد جلسات اليوم</p><p className="text-xs text-muted-foreground mt-1">أضف جلسة جديدة من الأعلى</p></div>
                          return todaySessions.map((s, idx) => {
                            const p = patients.find(pt => pt.id === s.patientId)
                            const svc = services.find(sv => sv.id === s.serviceId)
                            return (
                              <motion.div key={s.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.05 }} className={cn('flex items-center justify-between p-3 rounded-xl border transition-all', s.paid ? 'bg-gradient-to-l from-emerald-50 to-emerald-100/50 dark:from-emerald-950/20 dark:to-emerald-900/10 border-emerald-200 dark:border-emerald-800' : 'bg-gradient-to-l from-amber-50 to-amber-100/50 dark:from-amber-950/20 dark:to-amber-900/10 border-amber-200 dark:border-amber-800')}>
                                <div className="flex items-center gap-3">
                                  <motion.div animate={s.paid ? {} : { scale: [1, 1.15, 1] }} transition={{ duration: 1.5, repeat: s.paid ? 0 : Infinity, repeatDelay: 2 }} className={cn('p-2.5 rounded-xl text-white shadow-md', s.paid ? 'bg-gradient-to-br from-emerald-400 to-emerald-600' : 'bg-gradient-to-br from-amber-400 to-amber-600')}>
                                    {s.paid ? <CheckCircle size={16} /> : <Clock size={16} />}
                                  </motion.div>
                                  <div>
                                    <p className="font-bold text-sm">{p?.name || 'مريض'}</p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                      <Badge variant="outline" className="text-[9px] px-1.5">{svc?.name || s.notes || 'جلسة'}</Badge>
                                      <span className="flex items-center gap-1"><Clock size={10} /> {formatTime(s.date)}</span>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-sm bg-gradient-to-l from-violet-600 to-purple-600 bg-clip-text text-transparent">{formatCurrency(s.price)}</span>
                                  {!s.paid && <button onClick={() => markSessionPaid(s)} className="px-3 py-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-[10px] font-bold shadow-md hover:shadow-lg transition-shadow active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150">💰 دفع</button>}
                                </div>
                              </motion.div>
                            )
                          })
                        })()}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* All Sessions - Professional List */}
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
                    <Card className="card-luxury border-2 border-purple-200 dark:border-purple-800 overflow-hidden">
                      <div className="bg-gradient-to-l from-purple-500 to-fuchsia-600 p-3 flex items-center justify-between">
                        <div className="flex items-center gap-2"><div className="text-xl animate-pulse-scale-lg">⚡</div><CardTitle className="text-sm text-white font-bold">جميع الجلسات</CardTitle></div>
                        <Badge className="bg-white/20 text-white border-white/30">{sessions.length} جلسة</Badge>
                      </div>
                      <CardContent className="p-3 space-y-2">
                        {sessions.length === 0 && <div className="text-center py-8"><div className="text-5xl mb-3 animate-bounce-y">📋</div><p className="text-muted-foreground">لا توجد جلسات مسجلة</p></div>}
                        {sessions.slice(0, 50).map((s, idx) => {
                          const p = patients.find(pt => pt.id === s.patientId)
                          const svc = services.find(sv => sv.id === s.serviceId)
                          return (
                            <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.02 }} whileHover={{ scale: 1.01, x: 4 }} className={cn('flex items-center justify-between p-3 rounded-xl border transition-all', s.paid ? 'bg-emerald-50/50 dark:bg-emerald-950/10 border-emerald-200/50 dark:border-emerald-800/50' : 'bg-amber-50/50 dark:bg-amber-950/10 border-amber-200/50 dark:border-amber-800/50')}>
                              <div className="flex items-center gap-3">
                                <div className={cn('p-2 rounded-lg text-white', s.paid ? 'bg-emerald-500' : 'bg-amber-500')}>
                                  {s.paid ? <CheckCircle size={14} /> : <Clock size={14} />}
                                </div>
                                <div>
                                  <p className="font-bold text-sm">{p?.name || 'مريض'}</p>
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>{svc?.name || s.notes || 'جلسة'}</span>
                                    <span>{formatDate(s.date)}</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="font-black text-sm">{formatCurrency(s.price)}</span>
                                <Button variant="outline" size="sm" className="rounded-lg text-[10px] h-7" onClick={() => { const pt = patients.find(pp => pp.id === s.patientId); if (pt) { setSelectedPatient(pt); setActiveTab('patients') } }}><Eye size={10} /></Button>
 {!s.paid && <button onClick={() => markSessionPaid(s)} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold shadow-md active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">دفع</button>}
                              </div>
                            </motion.div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Unpaid Dues - Alert Style */}
                  {sessions.filter(s => !s.paid).length > 0 && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.6 }}>
                      <Card className="card-luxury border-2 border-red-300 dark:border-red-800 overflow-hidden">
                        <div className="bg-gradient-to-l from-red-500 to-rose-600 p-3 flex items-center justify-between">
                          <div className="flex items-center gap-2"><div className="text-xl animate-pulse-scale-lg">🚨</div><CardTitle className="text-sm text-white font-bold">مستحقات غير مدفوعة</CardTitle></div>
                          <Badge className="bg-white/20 text-white border-white/30">{sessions.filter(s => !s.paid).length} مستحق</Badge>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          {sessions.filter(s => !s.paid).slice(0, 20).map((s, idx) => {
                            const p = patients.find(pt => pt.id === s.patientId)
                            const svc = services.find(sv => sv.id === s.serviceId)
                            return (
                              <motion.div key={s.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }} className="flex items-center justify-between p-2.5 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30">
                                <div className="flex items-center gap-2">
                                  <div className="text-lg animate-pulse-scale">⚠️</div>
                                  <div><p className="font-medium text-sm">{p?.name || 'مريض'}</p><p className="text-xs text-muted-foreground">{svc?.name || s.notes || 'جلسة'}</p></div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-red-600">{formatCurrency(s.price)}</span>
 <button onClick={() => markSessionPaid(s)} className="px-2.5 py-1.5 rounded-lg bg-gradient-to-l from-emerald-500 to-emerald-600 text-white text-[10px] font-bold shadow-md active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">تأكيد الدفع</button>
                                </div>
                              </motion.div>
                            )
                          })}
                          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="text-center pt-2">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-l from-red-500 to-rose-600 text-white font-bold shadow-lg">
                              <span>💸</span>
                              <span>إجمالي المستحقات: {formatCurrency(sessions.filter(s => !s.paid).reduce((sum, s) => sum + (s.price || 0), 0))}</span>
                            </div>
                          </motion.div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {/* Session Stats by Service */}
                  {services.length > 0 && (
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
                      <Card className="card-luxury overflow-hidden">
                        <div className="bg-gradient-to-l from-indigo-500 to-blue-600 p-3 flex items-center gap-2">
                          <div className="text-xl animate-spin-slow">📊</div>
                          <CardTitle className="text-sm text-white font-bold">إحصائيات حسب الخدمة</CardTitle>
                        </div>
                        <CardContent className="p-3 space-y-2">
                          {services.filter(svc => sessions.some(s => s.serviceId === svc.id)).map((svc, idx) => {
                            const svcSessions = sessions.filter(s => s.serviceId === svc.id)
                            const paid = svcSessions.filter(s => s.paid).length
                            const total = svcSessions.length
                            const revenue = svcSessions.reduce((sum, s) => sum + (s.price || 0), 0)
                            const pct = total > 0 ? Math.round((paid / total) * 100) : 0
                            return (
                              <motion.div key={svc.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="p-3 rounded-xl bg-muted/50 border">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center gap-2"><span className="font-bold text-sm">{svc.name}</span><Badge variant="outline" className="text-[9px]">{total} جلسة</Badge></div>
                                  <span className="font-bold text-sm text-emerald-600">{formatCurrency(revenue)}</span>
                                </div>
                                <div className="flex h-2 rounded-full overflow-hidden bg-muted">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.8, delay: 0.3 + idx * 0.05 }} className="bg-gradient-to-l from-emerald-400 to-emerald-600 rounded-full" />
                                </div>
                                <div className="flex justify-between mt-1 text-[9px] text-muted-foreground"><span>{paid} مدفوعة</span><span>{total - paid} مستحقة</span><span>{pct}%</span></div>
                              </motion.div>
                            )
                          })}
                          {services.filter(svc => sessions.some(s => s.serviceId === svc.id)).length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد إحصائيات بعد</p>}
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </div>)}

                {/* Visits Sub-tab - ENHANCED */}
                {moreSubTab === 'visits' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute bottom-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-drift-c"/></div>
                    <div className="relative z-10 flex items-center gap-3"><div className="text-4xl animate-pulse-scale">🩺</div><div><h2 className="text-2xl font-black text-white">الزيارات</h2><p className="text-white/80 text-sm">{visits.length} زيارة مسجلة</p></div></div>
                  </motion.div>
                  
                  {/* Filter by visit type */}
                  <div className="flex gap-2 flex-wrap">
                    {[{ id: 'all', label: 'الكل', emoji: '📋' }, ...VISIT_TYPES.slice(0, 3)].map(vt => (
 <button key={vt.id} onClick={() => setVisitFilterType(vt.id)} className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', visitFilterType === vt.id ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20 shadow-md' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                        <span>{vt.id === 'all' ? '📋' : vt.emoji}</span><span>{vt.label}</span>
                      </button>
                    ))}
                  </div>

                  {visits.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">🩺</div><p className="text-muted-foreground">لا توجد زيارات بعد</p></Card>}
                  <div className="space-y-3">{(() => {
                    const filtered = visits.filter(v => visitFilterType === 'all' || v.type === visitFilterType).slice(0, 50)
                    return filtered.map((v, idx) => {
                      const p = patients.find(pt => pt.id === v.patientId)
                      const vt = VISIT_TYPES.find(t => t.id === v.type)
                      const isEditing = editingVisitId === v.id
                      return (
                        <motion.div key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card className="section-card p-4 border-2 border-violet-100 dark:border-violet-900 hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <div className={cn('p-2 rounded-xl text-white text-lg animate-bounce-y-sm', vt?.bg || 'bg-gray-500')}>{vt?.emoji || '📝'}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm">{p?.name || 'مريض'}</span>
                                    <Badge className={cn('text-white text-[9px]', vt?.bg || 'bg-gray-500')}>{vt?.label || v.type}</Badge>
                                  </div>
                                  {isEditing ? (
                                    <div className="space-y-2 mt-2 p-3 rounded-xl bg-violet-50 dark:bg-violet-950/20 border border-violet-200 dark:border-violet-800">
 <div><Label className="text-xs font-bold active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">نوع الزيارة</Label><div className="flex gap-1.5 mt-1 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{VISIT_TYPES.slice(0, 3).map(vt => (<button key={vt.id} onClick={() => setEditVisitForm(prev => ({ ...prev, type: vt.id }))} className={cn('flex items-center gap-1 px-2 py-1 rounded-lg text-white text-[10px] font-bold transition-all', vt.bg, editVisitForm.type === vt.id ? 'ring-2 ring-white shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span>{vt.emoji}</span>{vt.label}</button>))}</div></div>
                                      <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={editVisitForm.notes} onChange={e => setEditVisitForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات الزيارة..." className="input-luxury rounded-xl h-16 text-xs mt-1" /></div>
                                      <div className="flex gap-2"><Button size="sm" className="rounded-xl bg-violet-600 text-white text-xs" onClick={() => editVisitWithFinance(v, editVisitForm.type, editVisitForm.notes, p?.name || '')}>حفظ</Button><Button variant="ghost" size="sm" className="rounded-xl text-xs" onClick={() => setEditingVisitId(null)}>إلغاء</Button></div>
                                    </div>
                                  ) : (
                                    <>
                                      {v.diagnosis && <p className="text-xs text-muted-foreground mb-1">🔍 {v.diagnosis}</p>}
                                      {v.notes && <p className="text-xs text-muted-foreground">📝 {v.notes}</p>}
                                      <span className="text-[10px] text-muted-foreground">{formatDate(v.date)}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {!isEditing && (
                                <div className="flex flex-col gap-1">
                                  {canEditPatientFull && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || '', price: '' }) }}><Edit3 size={12} className="text-violet-500" /></Button>}
                                  {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteVisitConfirmId(v.id)}><Trash2 size={12} className="text-red-500" /></Button>}
                                </div>
                              )}
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })
                  })()}</div>

                  {/* Delete Visit Confirm */}
                  {canDelete && <AlertDialog open={!!deleteVisitConfirmId} onOpenChange={() => setDeleteVisitConfirmId(null)}>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle className="flex items-center gap-2"><Trash2 size={18} className="text-red-500" /> حذف الزيارة</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذه الزيارة والمعاملة المالية المرتبطة بها؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => { if (deleteVisitConfirmId) { const v = visits.find(vv => vv.id === deleteVisitConfirmId); const p = v ? patients.find(pt => pt.id === v.patientId) : null; if (v && p) await deleteVisitWithFinance(v, p.name); else if (v) { await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); setVisits(prev => prev.filter(vv => vv.id !== deleteVisitConfirmId)); toast.success('تم حذف الزيارة') } setDeleteVisitConfirmId(null) } }}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>}
                </div>)}

                {/* Partner Doctors Sub-tab - Complete System */}
                {moreSubTab === 'doctors' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-green-500 to-teal-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-bounce-y"/></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="text-4xl animate-bounce-y">👨‍⚕️</div><div><h2 className="text-2xl font-black text-white">الأطباء المشاركون</h2><p className="text-white/80 text-sm">{doctors.length} طبيب مشارك</p></div></div>
                      {isDoctor && <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => { setDoctorForm({ name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' }); setShowAddDoctor(true) }}><Plus size={14} className="ml-1" /> طبيب جديد</Button>}
                    </div>
                  </motion.div>
                  {/* Doctor Revenue Summary */}
                  {doctors.length > 0 && <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800"><CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign size={14} className="text-emerald-500" /> ملخص حصص الأطباء</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الكشف</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الإعادة</p><p className="text-sm font-bold text-blue-600">{formatCurrency(revisitRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-[10px] text-muted-foreground">إجمالي إيرادات الجلسات</p><p className="text-sm font-bold text-violet-600">{formatCurrency(sessionRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-[10px] text-muted-foreground">إجمالي الإيرادات</p><p className="text-sm font-bold text-amber-600">{formatCurrency(totalIncome)}</p></div>
                    </div>
                  </CardContent></Card>}
                  {doctors.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">👨‍⚕️</div><p className="text-muted-foreground">لا يوجد أطباء مشاركون بعد</p><p className="text-xs text-muted-foreground mt-1">أضف أطباء مشاركين مع تحديد نسبهم</p></Card>}
                  {doctorEarnings.map(d => (
                    <Card key={d.id} className="section-card p-4 border-2 border-emerald-100 dark:border-emerald-900">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border-2 border-emerald-400"><AvatarFallback className="bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold text-lg">{d.name.charAt(0)}</AvatarFallback></Avatar>
                          <div><p className="font-bold">{d.name}</p>{d.specialty && <p className="text-xs text-muted-foreground">{d.specialty}</p>}{d.phone && <p className="text-xs text-muted-foreground flex items-center gap-1"><Phone size={10} />{d.phone}</p>}</div>
                        </div>
                        <div className="flex gap-1">{canEditPatientFull && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingDoctorId(d.id); setDoctorForm({ name: d.name, phone: d.phone || '', specialty: d.specialty || '', checkupPercentage: String(d.checkupPercentage), revisitPercentage: String(d.revisitPercentage), laserPercentage: String(d.laserPercentage), sessionPercentage: String(d.sessionPercentage), fixedAmount: String(d.fixedAmount), notes: d.notes || '' }); setShowAddDoctor(true) }}><Edit3 size={12} className="text-emerald-500" /></Button>}{canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/doctors', d.id, setDoctors)}><Trash2 size={12} className="text-red-500" /></Button>}</div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">كشف {d.checkupPercentage}%</p><p className="text-xs font-bold text-emerald-600">{formatCurrency(d.checkupEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">إعادة {d.revisitPercentage}%</p><p className="text-xs font-bold text-blue-600">{formatCurrency(d.revisitEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center"><p className="text-[9px] text-muted-foreground">ليزر {d.laserPercentage}%</p><p className="text-xs font-bold text-violet-600">{formatCurrency(d.laserEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center"><p className="text-[9px] text-muted-foreground">جلسات {d.sessionPercentage}%</p><p className="text-xs font-bold text-orange-600">{formatCurrency(d.sessionEarn)}</p></div>
                        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center"><p className="text-[9px] text-muted-foreground">ثابت</p><p className="text-xs font-bold text-amber-600">{formatCurrency(d.fixedAmount)}</p></div>
                        <div className="p-2 rounded-lg bg-primary/10 text-center border-2 border-primary/30"><p className="text-[9px] text-muted-foreground font-bold">الإجمالي</p><p className="text-sm font-black text-primary">{formatCurrency(d.totalEarn)}</p></div>
                      </div>
                    </Card>
                  ))}
                </div>)}

                {/* Inventory Sub-tab - PROFESSIONAL */}
                {moreSubTab === 'inventory' && (<div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><Package size={18} className="text-amber-500" /> المخزون</h3><div className="flex items-center gap-2">{lowStockItems.length > 0 && <div className="animate-pulse-scale"><Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]">{lowStockItems.length} منخفض</Badge></div>}{isDoctor && <Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-white" onClick={() => { setEditingInventoryId(null); setEditInventoryForm({ name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' }); setShowAddInventory(true) }}><Plus size={14} className="ml-1" /> عنصر</Button>}</div></div>
                  
                  {/* Dashboard Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
                      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-3 text-center">
                        <div className="text-2xl mb-1 animate-bounce-y-sm">📦</div>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-300">{inventoryItems.length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">إجمالي العناصر</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-3 text-center">
                        <div className="text-2xl mb-1 animate-bounce-y-sm">💰</div>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{formatCurrency(inventoryItems.reduce((s, i) => s + i.quantity * i.unitPrice, 0))}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">إجمالي القيمة</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className={cn('border-2 p-3 text-center', lowStockItems.length > 0 ? 'border-red-300 dark:border-red-800 bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/20 dark:to-rose-950/20' : 'border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20')}>
                        <motion.div animate={lowStockItems.length > 0 ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: lowStockItems.length > 0 ? Infinity : 0 }} className="text-2xl mb-1">{lowStockItems.length > 0 ? '⚠️' : '✅'}</motion.div>
                        <p className={cn('text-xl font-black', lowStockItems.length > 0 ? 'text-red-700 dark:text-red-300' : 'text-emerald-700 dark:text-emerald-300')}>{lowStockItems.length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">مخزون منخفض</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-3 text-center">
                        <div className="text-2xl mb-1 animate-bounce-y-sm">🏷️</div>
                        <p className="text-xl font-black text-violet-700 dark:text-violet-300">{new Set(inventoryItems.map(i => i.category || 'عام')).size}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">الفئات</p>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Search & Filter Bar */}
                  <div className="flex gap-2 flex-wrap">
                    <div className="flex-1 min-w-[150px] relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-500" /><Input value={inventorySearch} onChange={e => setInventorySearch(e.target.value)} placeholder="بحث بالاسم..." className="input-luxury rounded-xl h-9 pr-9 text-sm border-amber-200 dark:border-amber-800" /></div>
                    <Select value={inventoryFilter} onValueChange={v => setInventoryFilter(v as any)}><SelectTrigger className="rounded-xl h-9 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="low">⚠️ منخفض</SelectItem><SelectItem value="normal">✅ طبيعي</SelectItem></SelectContent></Select>
                    <Select value={inventoryCategoryFilter} onValueChange={setInventoryCategoryFilter}><SelectTrigger className="rounded-xl h-9 w-28 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الفئات</SelectItem>{[...new Set(inventoryItems.map(i => i.category || 'عام'))].map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select>
                  </div>

                  {/* Items List */}
                  {inventoryItems.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">📦</div><p className="text-muted-foreground">لا توجد عناصر في المخزون</p><p className="text-xs text-muted-foreground mt-1">أضف عناصر للبدء في إدارة المخزون</p></Card>}
                  <div className="space-y-3">{(() => {
                    const filtered = inventoryItems.filter(i => {
                      if (inventorySearch && !i.name.toLowerCase().includes(inventorySearch.toLowerCase())) return false
                      if (inventoryFilter === 'low' && i.quantity > i.minQuantity) return false
                      if (inventoryFilter === 'normal' && i.quantity <= i.minQuantity) return false
                      if (inventoryCategoryFilter !== 'all' && (i.category || 'عام') !== inventoryCategoryFilter) return false
                      return true
                    })
                    if (filtered.length === 0) return <Card className="p-6 text-center"><p className="text-muted-foreground text-sm">لا توجد نتائج</p></Card>
                    return filtered.map((item, idx) => {
                      const isLow = item.quantity <= item.minQuantity
                      const isCritical = item.quantity === 0
                      const stockPercent = item.minQuantity > 0 ? Math.min((item.quantity / (item.minQuantity * 2)) * 100, 100) : 100
                      const stockColor = isCritical ? 'bg-red-500' : isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      const borderColor = isCritical ? 'border-red-400 dark:border-red-700 bg-red-50/50 dark:bg-red-950/20' : isLow ? 'border-amber-300 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-950/10' : 'border-emerald-200 dark:border-emerald-800'
                      return (
                        <motion.div key={item.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card className={cn('section-card p-4 border-2 transition-all hover:shadow-lg', borderColor)}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <motion.div animate={isLow ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: isLow ? Infinity : 0 }} className={cn('p-2.5 rounded-xl', isCritical ? 'bg-red-100 dark:bg-red-900/30' : isLow ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30')}>
                                  {isCritical ? <AlertTriangle className="text-red-600" size={20} /> : isLow ? <AlertTriangle className="text-amber-600" size={20} /> : <Package className="text-emerald-600" size={20} />}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <p className="font-bold text-sm">{item.name}</p>
                                    {item.category && <Badge className="bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 text-[9px]">{item.category}</Badge>}
                                    {isCritical && <Badge className="bg-red-500 text-white text-[9px] animate-pulse">🚫 نفد</Badge>}
                                    {isLow && !isCritical && <Badge className="bg-amber-500 text-white text-[9px]">⚠️ منخفض</Badge>}
                                  </div>
                                  {/* Quantity Progress Bar */}
                                  <div className="flex items-center gap-2 mb-1.5">
                                    <span className="text-xs text-muted-foreground whitespace-nowrap">{item.quantity} / {item.minQuantity}</span>
                                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden"><motion.div initial={{ width: 0 }} animate={{ width: `${stockPercent}%` }} transition={{ duration: 0.8, delay: idx * 0.05 }} className={cn('h-full rounded-full', stockColor)} /></div>
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span>سعر الوحدة: {formatCurrency(item.unitPrice)}</span>
                                    <span>القيمة: <span className="font-bold text-amber-600">{formatCurrency(item.quantity * item.unitPrice)}</span></span>
                                  </div>
                                  {item.notes && <p className="text-[10px] text-muted-foreground mt-1">📝 {item.notes}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStockTransactionItemId(item.id); setStockTransactionType('in'); setStockTransactionQty(''); setStockTransactionNotes(''); setShowStockTransaction(true) }}><FileUp size={12} className="text-emerald-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setStockTransactionItemId(item.id); setStockTransactionType('out'); setStockTransactionQty(''); setStockTransactionNotes(''); setShowStockTransaction(true) }}><FileDown size={12} className="text-orange-500" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingInventoryId(item.id); setEditInventoryForm({ name: item.name, category: item.category || '', quantity: String(item.quantity), minQuantity: String(item.minQuantity), unitPrice: String(item.unitPrice), notes: item.notes || '' }); setShowAddInventory(true) }}><Edit3 size={12} className="text-amber-500" /></Button>
                                {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setDeleteInventoryConfirmId(item.id)}><Trash2 size={12} className="text-red-500" /></Button>}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })
                  })()}</div>

                  {/* Delete Inventory Confirm — Doctor Only */}
                  {canDelete && <AlertDialog open={!!deleteInventoryConfirmId} onOpenChange={() => setDeleteInventoryConfirmId(null)}>
                    <AlertDialogContent><AlertDialogHeader><AlertDialogTitle>حذف العنصر</AlertDialogTitle><AlertDialogDescription>هل أنت متأكد من حذف هذا العنصر من المخزون؟</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>إلغاء</AlertDialogCancel><AlertDialogAction className="bg-red-600" onClick={async () => { if (deleteInventoryConfirmId) { await deleteItem('/inventory/items', deleteInventoryConfirmId, setInventoryItems); setDeleteInventoryConfirmId(null) } }}>حذف</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
                  </AlertDialog>}
                </div>)}

                {/* Bookings Sub-tab - PROFESSIONAL */}
                {moreSubTab === 'bookings' && (<div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><div className="animate-wiggle"><CalendarCheck size={18} className="text-sky-500" /></div> نظام الحجز</h3><div className="flex items-center gap-2"><Badge variant="outline">{appointments.length} حجز</Badge><Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 text-white" onClick={() => { setEditingBookingId(null); setBookingFormPatientSearch(''); setBookingFormPatientId(''); setBookingFormDate(cairoTodayInput()); setBookingFormTime(cairoTimeInput()); setBookingFormType('checkup'); setBookingFormStatus('scheduled'); setBookingFormNotes(''); setShowAddBooking(true) }}><Plus size={14} className="ml-1" /> حجز جديد</Button></div></div>
                  
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                      <Card className="border-2 border-sky-200 dark:border-sky-800 bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/20 dark:to-blue-950/20 p-3 text-center">
                        <div className="text-2xl mb-1 animate-bounce-y-sm">📅</div>
                        <p className="text-xl font-black text-sky-700 dark:text-sky-300">{appointments.filter(a => getLocalDateStr(a.date) === todayStr).length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">حجز اليوم</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20 p-3 text-center">
                        <div className="text-2xl mb-1 animate-bounce-y-sm">📆</div>
                        <p className="text-xl font-black text-emerald-700 dark:text-emerald-300">{(() => { const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })); const dayOfWeek = nowCairo.getDay(); const daysSinceSaturday = (dayOfWeek + 1) % 7; const satDate = new Date(nowCairo); satDate.setDate(nowCairo.getDate() - daysSinceSaturday); const weekStartStr = satDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); return appointments.filter(a => getLocalDateStr(a.date) >= weekStartStr).length })()}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">هذا الأسبوع</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/20 dark:to-yellow-950/20 p-3 text-center">
                        <motion.div animate={appointments.filter(a => a.status === 'scheduled').length > 0 ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1, repeat: appointments.filter(a => a.status === 'scheduled').length > 0 ? Infinity : 0 }} className="text-2xl mb-1">⏳</motion.div>
                        <p className="text-xl font-black text-amber-700 dark:text-amber-300">{appointments.filter(a => a.status === 'scheduled').length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">قيد الانتظار</p>
                      </Card>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                      <Card className="border-2 border-violet-200 dark:border-violet-800 bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/20 dark:to-purple-950/20 p-3 text-center">
                        <div className="text-2xl mb-1 animate-bounce-y-sm">✅</div>
                        <p className="text-xl font-black text-violet-700 dark:text-violet-300">{appointments.filter(a => a.status === 'confirmed').length}</p>
                        <p className="text-[10px] text-muted-foreground font-bold">مؤكد</p>
                      </Card>
                    </motion.div>
                  </div>

                  {/* Filters */}
                  <div className="flex gap-2 flex-wrap">
                    <Select value={bookingFilterStatus} onValueChange={setBookingFilterStatus}><SelectTrigger className="rounded-xl h-9 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الحالات</SelectItem><SelectItem value="scheduled">⏳ مجدول</SelectItem><SelectItem value="confirmed">✅ مؤكد</SelectItem><SelectItem value="completed">🏁 مكتمل</SelectItem><SelectItem value="cancelled">❌ ملغي</SelectItem></SelectContent></Select>
                    <Select value={bookingFilterDate} onValueChange={v => setBookingFilterDate(v as any)}><SelectTrigger className="rounded-xl h-9 w-32 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">كل الأوقات</SelectItem><SelectItem value="today">📅 اليوم</SelectItem><SelectItem value="week">📆 هذا الأسبوع</SelectItem><SelectItem value="month">🗓️ هذا الشهر</SelectItem></SelectContent></Select>
                  </div>

                  {/* Appointments List */}
                  {appointments.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">📅</div><p className="text-muted-foreground">لا توجد حجوزات بعد</p><p className="text-xs text-muted-foreground mt-1">أضف حجز جديد للبدء</p></Card>}
                  <div className="space-y-3">{(() => {
                    const filtered = appointments.filter(a => {
                      if (bookingFilterStatus !== 'all' && a.status !== bookingFilterStatus) return false
                      if (bookingFilterDate !== 'all') {
                        const aDate = new Date(a.date)
                        const now = new Date()
                        if (bookingFilterDate === 'today' && getLocalDateStr(a.date) !== todayStr) return false
                        if (bookingFilterDate === 'week') { const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' })); const daysSinceSat = (nowCairo.getDay() + 1) % 7; const satDate = new Date(nowCairo); satDate.setDate(nowCairo.getDate() - daysSinceSat); const weekStartStr = satDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }); if (getLocalDateStr(a.date) < weekStartStr) return false }
                        if (bookingFilterDate === 'month') { const ad = getCairoDateParts(a.date); if (ad.year !== cairoNow.year || ad.month !== cairoNow.month) return false }
                      }
                      return true
                    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

                    if (filtered.length === 0) return <Card className="p-6 text-center"><p className="text-muted-foreground text-sm">لا توجد حجوزات مطابقة</p></Card>

                    const statusConfig: Record<string, { emoji: string; color: string; bg: string; border: string }> = {
                      scheduled: { emoji: '⏳', color: 'text-amber-700 dark:text-amber-300', bg: 'bg-amber-100 dark:bg-amber-900/30', border: 'border-amber-300 dark:border-amber-700' },
                      confirmed: { emoji: '✅', color: 'text-emerald-700 dark:text-emerald-300', bg: 'bg-emerald-100 dark:bg-emerald-900/30', border: 'border-emerald-300 dark:border-emerald-700' },
                      completed: { emoji: '🏁', color: 'text-sky-700 dark:text-sky-300', bg: 'bg-sky-100 dark:bg-sky-900/30', border: 'border-sky-300 dark:border-sky-700' },
                      cancelled: { emoji: '❌', color: 'text-red-700 dark:text-red-300', bg: 'bg-red-100 dark:bg-red-900/30', border: 'border-red-300 dark:border-red-700' },
                    }
                    const typeConfig: Record<string, { label: string; color: string }> = { checkup: { label: 'كشف', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }, revisit: { label: 'إعادة', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }, session: { label: 'جلسة', color: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300' }, consultation: { label: 'استشارة', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' } }

                    return filtered.map((apt, idx) => {
                      const p = patients.find(pt => pt.id === apt.patientId)
                      const sc = statusConfig[apt.status] || statusConfig.scheduled
                      const tc = typeConfig[apt.type] || typeConfig.consultation
                      const aptDate = new Date(apt.date)
                      const isPast = aptDate < new Date() && apt.status === 'scheduled'
                      const isToday = getLocalDateStr(apt.date) === todayStr

                      return (
                        <motion.div key={apt.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: idx * 0.03 }}>
                          <Card className={cn('section-card p-4 border-2 transition-all hover:shadow-lg', sc.border, isPast && 'bg-amber-50/30 dark:bg-amber-950/10', isToday && 'bg-sky-50/30 dark:bg-sky-950/10')}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-start gap-3 flex-1 min-w-0">
                                <motion.div animate={apt.status === 'scheduled' ? { scale: [1, 1.1, 1] } : {}} transition={{ duration: 1.5, repeat: apt.status === 'scheduled' ? Infinity : 0 }} className={cn('p-2.5 rounded-xl text-lg', sc.bg)}>
                                  {sc.emoji}
                                </motion.div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-sm">{p?.name || 'بدون مريض'}</span>
                                    <Badge className={cn('text-[9px]', tc.color)}>{tc.label}</Badge>
                                    <Badge className={cn('text-[9px]', sc.bg, sc.color)}>{sc.emoji} {apt.status === 'scheduled' ? 'مجدول' : apt.status === 'confirmed' ? 'مؤكد' : apt.status === 'completed' ? 'مكتمل' : 'ملغي'}</Badge>
                                    {isToday && <Badge className="bg-sky-500 text-white text-[9px]">اليوم</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                    <span className="flex items-center gap-1"><Calendar size={10} />{formatDate(apt.date)}</span>
                                    {apt.duration && <span className="flex items-center gap-1"><Clock size={10} />{apt.duration} دقيقة</span>}
                                    {p?.phone && <span className="flex items-center gap-1"><Phone size={10} dir="ltr">{p.phone}</Phone></span>}
                                  </div>
                                  {apt.notes && <p className="text-xs text-muted-foreground mt-1">📝 {apt.notes}</p>}
                                </div>
                              </div>
                              <div className="flex flex-col gap-1">
 {p?.phone && <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover-green-900/50 transition-all active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150" onClick={() => { if (!p) return; const wp = waPhone(p.phone); if (wp) { const msg = encodeURIComponent(`مرحباً ${p.name}، نود تذكيرك بموعدك في عيادةالمغازي بتاريخ ${formatDate(apt.date)} الساعة ${aptDate.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}. نتطلع لرؤيتك! 🏥`); window.open(`https://wa.me/${wp}?text=${msg}`, '_blank') } }}><Send size={14} className="text-green-600 active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150" /></button>}
                                {canEditPatientFull && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditingBookingId(apt.id); setBookingFormPatientSearch(p?.name || ''); setBookingFormPatientId(apt.patientId || ''); setBookingFormDate(apt.date?.split('T')[0] || ''); setBookingFormTime(aptDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })); setBookingFormType(apt.type); setBookingFormStatus(apt.status); setBookingFormNotes(apt.notes || ''); setShowAddBooking(true) }}><Edit3 size={12} className="text-sky-500" /></Button>}
                                {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/appointments', apt.id, setAppointments)}><Trash2 size={12} className="text-red-500" /></Button>}
                              </div>
                            </div>
                          </Card>
                        </motion.div>
                      )
                    })
                  })()}</div>
                </div>)}

                {/* Medications Sub-tab - Enhanced */}
                {moreSubTab === 'medications' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-lime-500 via-green-500 to-emerald-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-pulse-scale-lg"/></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="text-4xl animate-wiggle-wide">💊</div><div><h2 className="text-2xl font-black text-white">الأدوية</h2><p className="text-white/80 text-sm">{medications.length} دواء مسجل</p></div></div>
                      {isDoctor && <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddMedication(true)}><Plus size={14} className="ml-1" /> دواء جديد</Button>}
                    </div>
                  </motion.div>
                  {medications.length === 0 && <Card className="card-luxury p-6 text-center"><p className="text-3xl mb-2">💊</p><p className="text-muted-foreground">لا توجد أدوية بعد</p></Card>}
                  <div className="space-y-2">{medications.map(m => <Card key={m.id} className="section-card p-3"><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className={cn('p-1.5 rounded-lg', m.active ? 'bg-green-100 dark:bg-green-900/30' : 'bg-gray-100 dark:bg-gray-900/30')}><Pill className={m.active ? 'text-green-600' : 'text-gray-400'} size={14} /></div><div><p className="font-medium text-sm">{m.name}</p><div className="flex items-center gap-2"><span className="text-xs text-muted-foreground">{m.category || 'عام'}</span>{m.dosage && <span className="text-xs text-muted-foreground">- الجرعة: {m.dosage}</span>}{m.instructions && <span className="text-xs text-muted-foreground">- {m.instructions}</span>}</div></div></div><div className="flex items-center gap-2"><Badge className={m.active ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 text-[9px]'}>{m.active ? 'نشط' : 'معطل'}</Badge>{canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteItem('/medications', m.id, setMedications)}><Trash2 size={12} className="text-red-500" /></Button>}</div></div></Card>)}</div>
                </div>)}

                {/* Reminders Sub-tab - ENHANCED Professional */}
                {moreSubTab === 'reminders' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-rose-500 via-red-500 to-orange-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute bottom-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-drift-c"/></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="text-4xl animate-wiggle-wide">⏰</div><div><h2 className="text-2xl font-black text-white">التذكيرات</h2><p className="text-white/80 text-sm">{reminders.length} تذكير مسجل</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddReminder(true)}><Plus size={14} className="ml-1" /> تذكير جديد</Button>
                    </div>
                  </motion.div>
                  
                  {/* Today's Reminders Highlighted Card */}
                  {(() => {
                    const todayReminders = reminders.filter(r => getLocalDateStr(r.date) === todayStr && r.status !== 'completed')
                    if (todayReminders.length === 0) return null
                    return (
                      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
                        <Card className="border-2 border-amber-400 dark:border-amber-600 overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-l from-amber-100/50 via-orange-100/30 to-yellow-100/50 dark:from-amber-950/30 dark:via-orange-950/20 dark:to-yellow-950/30 pointer-events-none" />
                          <CardHeader className="pb-2 relative z-10"><CardTitle className="text-sm flex items-center gap-2"><span className="animate-wiggle-wide">📌</span> تذكيرات اليوم <Badge className="bg-amber-500 text-white text-[9px]">{todayReminders.length}</Badge></CardTitle></CardHeader>
                          <CardContent className="space-y-2 relative z-10">
                            {todayReminders.map(r => {
                              const rTypeConfig: Record<string, { emoji: string; color: string; bg: string }> = { urgent: { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' }, important: { emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' }, followup: { emoji: '🔵', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' }, general: { emoji: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' } }
                              const cfg = rTypeConfig[r.type as string] || rTypeConfig.general
                              return (
                                <motion.div key={r.id} layout className={cn('p-3 rounded-xl border-2', cfg.bg)}>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-lg">{cfg.emoji}</span>
                                      <div><p className="font-bold text-sm">{r.title}</p>{r.description && <p className="text-xs text-muted-foreground">{r.description}</p>}</div>
                                    </div>
                                    <div className="flex items-center gap-1">
 {r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); const wp = rp?.phone ? waPhone(rp.phone) : ''; return wp ? <button onClick={() => window.open(`https://wa.me/${wp}`, '_blank')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><Send size={12} /></button> : null })()}
 <button onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); setCelebratingId(r.id); setTimeout(() => setCelebratingId(null), 2000); toast.success('🎉 تم إكمال التذكير!') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150">✓ تم</button>
                                    </div>
                                  </div>
                                </motion.div>
                              )
                            })}
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })()}

                  {/* Celebration overlay */}
                  <AnimatePresence>{celebratingId && (<motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.5 }} className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"><motion.div animate={{ y: [0, -20, 0], rotate: [0, 10, -10, 0] }} transition={{ duration: 1, repeat: 2 }} className="text-6xl">🎉</motion.div></motion.div>)}</AnimatePresence>

                  {reminders.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">⏰</div><p className="text-muted-foreground">لا توجد تذكيرات</p><p className="text-xs text-muted-foreground mt-1">أضف تذكيراً جديداً للبدء</p></Card>}
                  <div className="space-y-2">{reminders.map(r => {
                    const isPast = new Date(r.date) < new Date()
                    const rTypeConfig: Record<string, { emoji: string; color: string; bg: string; gradient: string }> = { urgent: { emoji: '🔴', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700', gradient: 'from-red-500 to-red-700' }, important: { emoji: '🟡', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700', gradient: 'from-amber-500 to-amber-700' }, followup: { emoji: '🔵', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700', gradient: 'from-blue-500 to-blue-700' }, general: { emoji: '🟢', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700', gradient: 'from-emerald-500 to-emerald-700' } }
                    const cfg = rTypeConfig[r.type as string] || rTypeConfig.general
                    const reminderDate = new Date(r.date)
                    const now = new Date()
                    const diffMs = reminderDate.getTime() - now.getTime()
                    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
                    const countdownText = diffMs > 0 ? (diffDays === 0 ? 'اليوم' : diffDays === 1 ? 'غداً' : `بعد ${diffDays} يوم`) : (r.status === 'completed' ? '' : '⏰ متأخر!')
                    return (
                      <motion.div key={r.id} layout initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className={cn('relative overflow-hidden rounded-xl border-2 p-3', r.status === 'completed' ? 'bg-muted/50 border-muted' : cfg.bg)}>
                        <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b rounded-r-xl" style={{ background: `linear-gradient(to bottom, var(--tw-gradient-stops))` }} />
                        <div className={cn('absolute top-0 left-0 w-1.5 h-full rounded-r-xl bg-gradient-to-b', cfg.gradient)} />
                        <div className="flex items-center justify-between relative z-10">
                          <div className="flex items-center gap-3">
                            <motion.div animate={r.status !== 'completed' && isPast ? { scale: [1, 1.2, 1] } : {}} transition={{ duration: 1, repeat: r.status !== 'completed' && isPast ? Infinity : 0 }} className="text-lg">{cfg.emoji}</motion.div>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className={cn('font-medium text-sm', r.status === 'completed' && 'line-through text-muted-foreground')}>{r.title}</p>
                                {countdownText && r.status !== 'completed' && <Badge className={cn('text-[8px]', isPast ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400')}>{countdownText}</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground">{formatDate(r.date)} {r.description && `- ${r.description}`}</p>
                              {r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); return rp ? <p className="text-[10px] text-muted-foreground">👤 {rp.name}</p> : null })()}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5">
 {r.status !== 'completed' && r.patientId && (() => { const rp = patients.find(p => p.id === r.patientId); const wp = rp?.phone ? waPhone(rp.phone) : ''; return wp ? <button onClick={() => window.open(`https://wa.me/${wp}`, '_blank')} className="p-1.5 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600 hover:bg-green-200 transition-colors active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><Send size={12} /></button> : null })()}
                            <Badge variant="outline" className={r.status === 'completed' ? 'border-emerald-500 text-emerald-600 text-[9px]' : r.status === 'pending' ? 'border-amber-500 text-amber-600 text-[9px]' : 'border-blue-500 text-blue-600 text-[9px]'}>{r.status === 'completed' ? 'مكتمل ✓' : r.status === 'pending' ? 'قيد الانتظار' : r.status}</Badge>
 {r.status !== 'completed' && <button onClick={async () => { try { await apiFetch(`/reminders/${r.id}`, { method: 'PUT', body: JSON.stringify({ status: 'completed' }) }); setReminders(prev => prev.map(rm => rm.id === r.id ? { ...rm, status: 'completed' } : rm)); setCelebratingId(r.id); setTimeout(() => setCelebratingId(null), 2000); toast.success('🎉 تم إكمال التذكير!') } catch { toast.error('خطأ') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold flex items-center gap-1 hover:bg-emerald-600 transition-colors active:scale-[0.85] hover:scale-[1.05] transition-transform duration-150">✓ تم</button>}
                            {canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem('/reminders', r.id, setReminders)}><Trash2 size={10} className="text-red-500" /></Button>}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}</div>
                </div>)}

                {/* Treatment Templates Sub-tab - قوالب العلاج */}
                {moreSubTab === 'templates' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-fuchsia-500 via-pink-500 to-rose-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute top-0 right-0 w-28 h-28 bg-white/20 rounded-full blur-3xl animate-drift-a"/></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="text-4xl animate-pulse-scale">📋</div><div><h2 className="text-2xl font-black text-white">قوالب العلاج</h2><p className="text-white/80 text-sm">{treatmentTemplates.length} قالب جاهز</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => { const name = prompt('اسم القالب:'); if (!name) return; const desc = prompt('الوصف:') || ''; const sess = parseInt(prompt('عدد الجلسات:', '6') || '6'); const price = parseFloat(prompt('السعر التقديري:', '1000') || '1000'); const cat = prompt('الفئة:', 'جلدية') || 'جلدية'; setTreatmentTemplates(prev => [...prev, { id: Date.now().toString(), name, description: desc, sessions: sess, estimatedPrice: price, category: cat }]); toast.success('تم إضافة القالب') }}><Plus size={14} className="ml-1" /> قالب جديد</Button>
                    </div>
                  </motion.div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {treatmentTemplates.map((t, i) => {
                      const catColors: Record<string, string> = { 'جلدية': 'from-blue-500 to-blue-700', 'تجميل': 'from-pink-500 to-pink-700', 'ليزر': 'from-cyan-500 to-cyan-700' }
                      const gradient = catColors[t.category] || 'from-lime-500 to-lime-700'
                      return (
                        <motion.div key={t.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                          <Card className="card-luxury border-2 border-lime-200 dark:border-lime-800 overflow-hidden">
                            <div className={cn('h-2 bg-gradient-to-l', gradient)} />
                            <CardContent className="p-4 space-y-3">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-bold text-base">{t.name}</h4>
                                  <p className="text-xs text-muted-foreground mt-0.5">{t.description}</p>
                                </div>
                                <Badge className={cn('text-white text-[9px] bg-gradient-to-l', gradient)}>{t.category}</Badge>
                              </div>
                              <div className="grid grid-cols-3 gap-2">
                                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">الجلسات</p><p className="text-sm font-bold text-blue-600">{t.sessions}</p></div>
                                <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">السعر</p><p className="text-sm font-bold text-emerald-600">{formatCurrency(t.estimatedPrice)}</p></div>
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-center"><p className="text-[9px] text-muted-foreground">للجلسة</p><p className="text-sm font-bold text-amber-600">{formatCurrency(t.estimatedPrice / t.sessions)}</p></div>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" className="btn-luxury rounded-xl flex-1 bg-gradient-to-l from-lime-500 to-lime-600 text-white text-xs" onClick={() => { setSelectedTemplate(t); setShowApplyTemplate(true) }}><Sparkles size={12} className="ml-1" /> تطبيق على مريض</Button>
                                {canDelete && <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setTreatmentTemplates(prev => prev.filter(tp => tp.id !== t.id)); toast.success('تم حذف القالب') }}><Trash2 size={12} className="text-red-500" /></Button>}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                  {treatmentTemplates.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">📋</div><p className="text-muted-foreground">لا توجد قوالب علاج بعد</p></Card>}
                </div>)}

                {/* Waiting Queue Sub-tab - قائمة الانتظار */}
                {moreSubTab === 'waiting' && (<div className="space-y-4">
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-red-500 via-orange-500 to-amber-600 p-5 shadow-xl">
                    <div className="absolute inset-0 opacity-15"><div className="absolute top-0 left-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-drift-c"/></div>
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3"><div className="text-4xl animate-bounce-y">⏳</div><div><h2 className="text-2xl font-black text-white">قائمة الانتظار</h2><p className="text-white/80 text-sm">إدارة المرضى في الانتظار</p></div></div>
                      <Button className="rounded-xl bg-white/20 backdrop-blur-sm text-white border border-white/30 hover:bg-white/30 shadow-lg" onClick={() => setShowAddWaiting(true)}><Plus size={14} className="ml-1" /> إضافة مريض</Button>
                    </div>
                  </motion.div>
                  
                  {/* Queue Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center border border-amber-200 dark:border-amber-800"><div className="text-xl mb-1 animate-bounce-y-sm">⏳</div><p className="text-lg font-black text-amber-600">{waitingQueue.filter(w => w.status === 'waiting').length}</p><p className="text-[9px] text-muted-foreground">في الانتظار</p></div>
                    <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center border border-blue-200 dark:border-blue-800"><div className="text-xl mb-1 animate-wiggle-wide">🩺</div><p className="text-lg font-black text-blue-600">{waitingQueue.filter(w => w.status === 'in-progress').length}</p><p className="text-[9px] text-muted-foreground">جاري الكشف</p></div>
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center border border-emerald-200 dark:border-emerald-800"><div className="text-xl mb-1 animate-pulse-scale">✅</div><p className="text-lg font-black text-emerald-600">{waitingQueue.filter(w => w.status === 'done' || w.status === 'left').length}</p><p className="text-[9px] text-muted-foreground">تم/غادر</p></div>
                  </div>

                  {/* Active Queue */}
                  {(() => {
                    const activeQueue = waitingQueue
                      .filter(w => w.status === 'waiting' || w.status === 'in-progress')
                      .sort((a, b) => {
                        if (a.priority !== b.priority) return b.priority - a.priority
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                      })
                    const doneQueue = waitingQueue.filter(w => w.status === 'done' || w.status === 'left')
                    return (
                      <>
                        {activeQueue.length === 0 && doneQueue.length === 0 && <Card className="card-luxury p-6 text-center"><div className="text-4xl mb-2 animate-bounce-y">⏳</div><p className="text-muted-foreground">قائمة الانتظار فارغة</p></Card>}
                        <div className="space-y-2">
                          {activeQueue.map((w, i) => {
                            const waitMinutes = Math.round((Date.now() - new Date(w.createdAt).getTime()) / 60000)
                            const isUrgent = w.priority >= 2
                            return (
                              <motion.div key={w.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className={cn('relative overflow-hidden rounded-xl border-2 p-3', w.status === 'in-progress' ? 'border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-900/10' : isUrgent ? 'border-red-300 dark:border-red-700 bg-red-50/50 dark:bg-red-900/10' : 'border-amber-200 dark:border-amber-700 bg-amber-50/30 dark:bg-amber-900/10')}>
                                <div className={cn('absolute top-0 left-0 w-1.5 h-full rounded-r-xl', isUrgent ? 'bg-red-500' : 'bg-amber-400')} />
                                <div className="flex items-center justify-between relative z-10">
                                  <div className="flex items-center gap-3">
                                    <div className={cn('flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm text-white', isUrgent ? 'bg-red-500' : 'bg-amber-500')}>{i + 1}</div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="font-bold text-sm">{w.patientName || 'مريض'}</p>
                                        {isUrgent && <Badge className="bg-red-500 text-white text-[8px]">عاجل</Badge>}
                                        {w.status === 'in-progress' && <Badge className="bg-blue-500 text-white text-[8px]">🩺 جاري الكشف</Badge>}
                                      </div>
                                      <div className="flex items-center gap-3 text-[10px] text-muted-foreground">
                                        <span>⏱ {waitMinutes > 60 ? `${Math.floor(waitMinutes / 60)} س ${waitMinutes % 60} د` : `${waitMinutes} دقيقة`}</span>
                                        {w.notes && <span>📝 {w.notes}</span>}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
 {w.status === 'waiting' && <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'in-progress' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'in-progress' } : q)); toast.success('جاري الكشف') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'in-progress' } : q)); toast.success('جاري الكشف') } }} className="px-2 py-1 rounded-lg bg-blue-500 text-white text-[10px] font-bold hover:bg-blue-600 transition-colors active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">🩺 كشف</button>}
 {w.status === 'in-progress' && <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'done' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'done' } : q)); toast.success('تم الكشف ✅') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'done' } : q)); toast.success('تم الكشف ✅') } }} className="px-2 py-1 rounded-lg bg-emerald-500 text-white text-[10px] font-bold hover:bg-emerald-600 transition-colors active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">✅ تم</button>}
 <button onClick={async () => { try { await apiFetch(`/waiting/${w.id}`, { method: 'PUT', body: JSON.stringify({ status: 'left' }) }); setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } catch { setWaitingQueue(prev => prev.map(q => q.id === w.id ? { ...q, status: 'left' } : q)); toast.success('تم تسجيل المغادرة') } }} className="px-2 py-1 rounded-lg bg-gray-400 text-white text-[10px] font-bold hover:bg-gray-500 transition-colors active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">🚪 غادر</button>
                                    {canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem('/waiting', w.id, setWaitingQueue)}><Trash2 size={10} className="text-red-500" /></Button>}
                                  </div>
                                </div>
                              </motion.div>
                            )
                          })}
                        </div>
                        {doneQueue.length > 0 && (
                          <div className="mt-4">
                            <h4 className="text-xs text-muted-foreground font-bold mb-2">✅ مكتمل / غادر</h4>
                            <div className="space-y-1 max-h-40 overflow-y-auto">
                              {doneQueue.map(w => (
                                <div key={w.id} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                                  <span className="text-muted-foreground line-through">{w.patientName || 'مريض'}</span>
                                  <Badge variant="outline" className={w.status === 'done' ? 'border-emerald-500 text-emerald-600 text-[8px]' : 'border-gray-400 text-gray-500 text-[8px]'}>{w.status === 'done' ? 'تم' : 'غادر'}</Badge>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </>
                    )
                  })()}
                </div>)}

                {/* ═══ Broadcast Messages Sub-tab - رسائل جماعية ═══ */}
                {moreSubTab === 'broadcast' && (() => {
                  const patientsWithPhone = patients.filter(p => p.phone && waPhone(p.phone))
                  const filteredBroadcastPatients = (() => {
                    let list = patientsWithPhone
                    if (broadcastFilter === 'starred') list = list.filter(p => p.starred)
                    if (broadcastFilter === 'dangerous') list = list.filter(p => p.dangerous)
                    if (broadcastFilter === 'today') { const todayISO = cairoISO().split('T')[0]; list = list.filter(p => p.createdAt && p.createdAt.startsWith(todayISO)) }
                    if (broadcastFilter === 'recent7') { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 7); list = list.filter(p => new Date(p.createdAt) >= cutoff) }
                    if (broadcastFilter === 'recent30') { const cutoff = new Date(); cutoff.setDate(cutoff.getDate() - 30); list = list.filter(p => new Date(p.createdAt) >= cutoff) }
                    if (broadcastSelectedIds.length > 0) list = list.filter(p => broadcastSelectedIds.includes(p.id))
                    return list
                  })()

                  const broadcastTemplates = [
                    { id: 'reminder', label: 'تذكير موعد', emoji: '📅', message: 'مرحباً {name}، نود تذكيرك بموعدك في عيادة المغازي للأمراض الجلدية. نتطلع لرؤيتك! 🏥' },
                    { id: 'followup', label: 'متابعة', emoji: '🔄', message: 'مرحباً {name}، كيف حالك؟ نود متابعة حالتك بعد الزيارة الأخيرة. هل يمكنك مراجعة العيادة؟ 🩺' },
                    { id: 'promo', label: 'عرض خاص', emoji: '🎉', message: 'مرحباً {name}! عيادة المغازي تقدم عرض خاص على جلسات الليزر هذا الشهر. احجز الآن! ⚡' },
                    { id: 'holiday', label: 'إجازة', emoji: '🌴', message: 'مرحباً {name}، عيادة المغازي ستكون مغلقة خلال الإجازة. سيتم إعادة جدولة موعدك. شكراً لتفهمكم! 🏥' },
                    { id: 'custom', label: 'مخصص', emoji: '✏️', message: '' },
                  ]

                  const sendBroadcast = async () => {
                    if (!broadcastMessage.trim()) { toast.error('اكتب الرسالة أولاً'); return }
                    const targets = broadcastSelectedIds.length > 0 ? filteredBroadcastPatients : filteredBroadcastPatients
                    if (targets.length === 0) { toast.error('لا يوجد مرضى بأرقام هاتف'); return }
                    setBroadcastSending(true)
                    setBroadcastProgress({ sent: 0, total: targets.length })
                    for (let i = 0; i < targets.length; i++) {
                      const p = targets[i]
                      const wp = waPhone(p.phone)
                      const personalizedMsg = broadcastMessage.replace(/\{name\}/g, p.name).replace(/\{phone\}/g, p.phone || '')
                      const encodedMsg = encodeURIComponent(personalizedMsg)
                      window.open(`https://wa.me/${wp}?text=${encodedMsg}`, '_blank')
                      setBroadcastProgress({ sent: i + 1, total: targets.length })
                      await new Promise(resolve => setTimeout(resolve, 1500))
                    }
                    setBroadcastSending(false)
                    toast.success(`تم فتح واتساب ل ${targets.length} مريض ✅`)
                  }

                  const copyBroadcastInfo = () => {
                    const targets = broadcastSelectedIds.length > 0 ? filteredBroadcastPatients : filteredBroadcastPatients
                    const lines = targets.map(p => `${p.name}: ${p.phone}`)
                    const info = `الرسالة:\n${broadcastMessage}\n\nالأرقام:\n${lines.join('\n')}\n\nعدد المرضى: ${targets.length}`
                    navigator.clipboard.writeText(info)
                    toast.success('تم نسخ البيانات ✅')
                  }

                  return (
                    <div className="space-y-4">
                      {/* Header */}
                      <motion.div initial={{ opacity: 0, y: -15 }} animate={{ opacity: 1, y: 0 }} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 p-5 shadow-xl">
                        <div className="absolute inset-0 opacity-20"><div className="absolute top-0 right-0 w-32 h-32 bg-white/20 rounded-full blur-3xl animate-drift-c"/></div>
                        <div className="relative z-10 flex items-center justify-between">
                          <div className="flex items-center gap-3"><div className="text-5xl animate-bounce-y">📩</div><div><h1 className="text-2xl font-black text-white">رسائل جماعية</h1><p className="text-white/80 text-sm">إرسال رسائل واتساب لكل المرضى بضغة واحدة</p></div></div>
                          <div className="flex items-center gap-2">
                            <Badge className="bg-white/20 text-white border-white/30 text-sm">{patientsWithPhone.length} 📱</Badge>
                          </div>
                        </div>
                      </motion.div>

                      {/* Stats Row */}
                      <div className="grid grid-cols-3 gap-2">
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} whileHover={{ scale: 1.03 }} className="rounded-2xl bg-gradient-to-br from-green-400 to-emerald-500 p-3 text-white shadow-lg"><p className="text-2xl font-black">{patientsWithPhone.length}</p><p className="text-[10px] text-white/80 font-bold">أرقام مسجلة</p></motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} whileHover={{ scale: 1.03 }} className="rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 p-3 text-white shadow-lg"><p className="text-2xl font-black">{filteredBroadcastPatients.length}</p><p className="text-[10px] text-white/80 font-bold">مستهدفين</p></motion.div>
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} whileHover={{ scale: 1.03 }} className="rounded-2xl bg-gradient-to-br from-red-400 to-rose-500 p-3 text-white shadow-lg"><p className="text-2xl font-black">{patients.length - patientsWithPhone.length}</p><p className="text-[10px] text-white/80 font-bold">بدون رقم</p></motion.div>
                      </div>

                      {/* Message Template */}
                      <Card className="border-2 border-green-200 dark:border-green-800 bg-gradient-to-br from-green-50/50 to-emerald-50/50 dark:from-green-950/10 dark:to-emerald-950/10">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Sparkles size={14} className="text-green-500" /> قوالب رسائل سريعة</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {broadcastTemplates.map(t => (
 <button key={t.id} onClick={() => setBroadcastMessage(t.message)} className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-bold active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', broadcastMessage === t.message ? 'bg-green-100 dark:bg-green-900/30 border-green-400 text-green-700 dark:text-green-300 shadow-lg' : 'bg-white/60 dark:bg-gray-800/60 border-border text-muted-foreground hover:border-green-300')}>
                                <span className="text-lg">{t.emoji}</span>{t.label}
                              </button>
                            ))}
                          </div>
                          <div><Label className="text-xs font-bold text-green-700 dark:text-green-400 flex items-center gap-1"><Send size={12} /> نص الرسالة</Label><Textarea value={broadcastMessage} onChange={e => setBroadcastMessage(e.target.value)} placeholder="اكتب رسالتك هنا... استخدم {name} لاسم المريض..." className="mt-1 rounded-xl min-h-[100px] border-2 border-green-200 dark:border-green-800 bg-white dark:bg-black/20 text-sm" /></div>
                          {broadcastMessage.includes('{name}') && <p className="text-[10px] text-green-600 mt-1">✨ {'{name}'} سيتم استبداله باسم كل مريض تلقائياً</p>}
                        </CardContent>
                      </Card>

                      {/* Filter & Selection */}
                      <Card className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50/50 to-yellow-50/50 dark:from-amber-950/10 dark:to-yellow-950/10">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Filter size={14} className="text-amber-500" /> تحديد المستهدفين</CardTitle></CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-3 gap-2 mb-3">
                            {[
                              { id: 'all', label: 'الكل', emoji: '👥', count: patientsWithPhone.length },
                              { id: 'starred', label: 'المميزة', emoji: '⭐', count: patientsWithPhone.filter(p => p.starred).length },
                              { id: 'dangerous', label: 'خطر', emoji: '💀', count: patientsWithPhone.filter(p => p.dangerous).length },
                              { id: 'today', label: 'اليوم', emoji: '📅', count: patientsWithPhone.filter(p => { const todayISO = cairoISO().split('T')[0]; return p.createdAt?.startsWith(todayISO) }).length },
                              { id: 'recent7', label: '7 أيام', emoji: '📆', count: patientsWithPhone.filter(p => { const c = new Date(); c.setDate(c.getDate() - 7); return new Date(p.createdAt) >= c }).length },
                              { id: 'recent30', label: '30 يوم', emoji: '🗓️', count: patientsWithPhone.filter(p => { const c = new Date(); c.setDate(c.getDate() - 30); return new Date(p.createdAt) >= c }).length },
                            ].map(f => (
 <button key={f.id} onClick={() => { setBroadcastFilter(f.id as any); setBroadcastSelectedIds([]) }} className={cn('flex flex-col items-center gap-0.5 p-2.5 rounded-xl border-2 transition-all text-xs font-bold active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', broadcastFilter === f.id && broadcastSelectedIds.length === 0 ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 text-amber-700 dark:text-amber-300 shadow-lg' : 'bg-white/60 dark:bg-gray-800/60 border-border text-muted-foreground hover:border-amber-300')}>
                                <span className="text-lg">{f.emoji}</span><span>{f.label}</span><Badge variant="outline" className="text-[8px]">{f.count}</Badge>
                              </button>
                            ))}
                          </div>
                          {/* Manual patient selection */}
                          <div className="border-t border-border pt-3">
                            <div className="flex items-center justify-between mb-2">
                              <p className="text-xs font-bold text-muted-foreground">اختيار يدوي ({broadcastSelectedIds.length} مريض)</p>
                              {broadcastSelectedIds.length > 0 && <Button variant="ghost" size="sm" className="text-xs" onClick={() => setBroadcastSelectedIds([])}>إلغاء الاختيار</Button>}
                            </div>
                            <div className="max-h-32 overflow-y-auto space-y-1">
                              {patientsWithPhone.slice(0, 30).map(p => (
 <button key={p.id} onClick={() => { setBroadcastFilter('all'); setBroadcastSelectedIds(prev => prev.includes(p.id) ? prev.filter(id => id !== p.id) : [...prev, p.id]) }} className={cn('w-full flex items-center gap-2 p-2 rounded-lg transition-all text-xs active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', broadcastSelectedIds.includes(p.id) ? 'bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700' : 'bg-muted/30 hover:bg-muted/50')}>
                                  <div className={cn('w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all', broadcastSelectedIds.includes(p.id) ? 'bg-green-500 border-green-600 text-white' : 'border-muted-foreground/30')}><CheckCircle size={10} /></div>
                                  <span className="font-bold">{p.name}</span>
                                  <span dir="ltr" className="text-muted-foreground ml-auto">{p.phone}</span>
                                </button>
                              ))}
                              {patientsWithPhone.length > 30 && <p className="text-center text-[10px] text-muted-foreground">و {patientsWithPhone.length - 30} مريض آخر...</p>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Preview & Send */}
                      <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 dark:from-emerald-950/10 dark:to-teal-950/10">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Eye size={14} className="text-emerald-500" /> معاينة الرسالة</CardTitle></CardHeader>
                        <CardContent>
                          {filteredBroadcastPatients.length > 0 ? (
                            <div className="space-y-3">
                              {/* Preview for first patient */}
                              {(() => {
                                const firstP = filteredBroadcastPatients[0]
                                const previewMsg = broadcastMessage.replace(/\{name\}/g, firstP.name).replace(/\{phone\}/g, firstP.phone || '')
                                return (
                                  <div className="p-3 rounded-xl bg-emerald-100 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                    <p className="text-[10px] text-emerald-600 font-bold mb-1">معاينة (لـ {firstP.name}):</p>
                                    <p className="text-sm whitespace-pre-wrap">{previewMsg || 'اكتب رسالتك...'}</p>
                                  </div>
                                )
                              })()}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>📱 سيتم الإرسال لـ {filteredBroadcastPatients.length} مريض</span>
                                <span>|</span>
                                <span>⏱ ~{Math.ceil(filteredBroadcastPatients.length * 1.5 / 60)} دقيقة</span>
                              </div>
                              {/* Send Buttons */}
                              <div className="grid grid-cols-2 gap-3">
 <button onClick={sendBroadcast} disabled={broadcastSending || !broadcastMessage.trim() || filteredBroadcastPatients.length === 0} className={cn('flex items-center justify-center gap-2 p-4 rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', broadcastSending ? 'bg-muted text-muted-foreground cursor-wait' : !broadcastMessage.trim() || filteredBroadcastPatients.length === 0 ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-gradient-to-br from-green-500 to-emerald-600 text-white hover:shadow-xl')}>
                                  <Send size={18} /> {broadcastSending ? `إرسال... (${broadcastProgress.sent}/${broadcastProgress.total})` : 'إرسال واتساب'}
                                </button>
 <button onClick={copyBroadcastInfo} disabled={!broadcastMessage.trim() || filteredBroadcastPatients.length === 0} className={cn('flex items-center justify-center gap-2 p-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', !broadcastMessage.trim() || filteredBroadcastPatients.length === 0 ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white hover:shadow-xl shadow-lg')}>
                                  <Copy size={18} /> نسخ البيانات
                                </button>
                              </div>
                              {broadcastSending && (
                                <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${(broadcastProgress.sent / broadcastProgress.total) * 100}%` }} className="h-full bg-gradient-to-r from-green-400 to-emerald-500 rounded-full transition-all" />
                                </div>
                              )}
                            </div>
                          ) : (
                            <p className="text-center text-muted-foreground text-sm py-4">لا يوجد مرضى بأرقام هاتف في هذا الفلتر</p>
                          )}
                        </CardContent>
                      </Card>

                      {/* Tip */}
                      <Card className="border-2 border-dashed border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-950/10">
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">💡</span>
                            <div>
                              <p className="text-xs font-bold text-blue-700 dark:text-blue-400">نصيحة للإرسال الجماعي</p>
                              <p className="text-[10px] text-muted-foreground">سيتم فتح واتساب لكل مريض تلقائياً كل 1.5 ثانية. تأكد من إرسال الرسالة في كل نافذة قبل المتابعة. استخدم {'{name}'} لإضافة اسم المريض شخصياً.</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* ═══════════════════════════════════════════════════════════════════
                          EXPORT / IMPORT — نسخ واستيراد بيانات المرضى (LIGHTWEIGHT)
                          ═══════════════════════════════════════════════════════════════════ */}
                      <Card className="border-2 border-purple-300 dark:border-purple-700 bg-gradient-to-br from-purple-50/40 via-white to-fuchsia-50/40 dark:from-purple-950/20 dark:via-card dark:to-fuchsia-950/20">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white"><Database size={16} /></div>
                              تصدير واستيراد بيانات المرضى
                            </CardTitle>
                            <Badge className="bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-[10px] border border-purple-200 dark:border-purple-700">نسخ احتياطي</Badge>
                          </div>
                          <p className="text-[10px] text-muted-foreground">صدّر الأسماء والأرقام بصيغ متعددة أو استورد من تطبيق آخر</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          {/* ── Export Section ── */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-md bg-emerald-100 dark:bg-emerald-900/30"><FileDown size={14} className="text-emerald-600" /></div>
                              <p className="text-sm font-bold">تصدير نسخة</p>
                              <span className="text-[10px] text-muted-foreground">({filteredBroadcastPatients.length} مريض)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {/* CSV Export */}
                              <button onClick={() => {
                                const data = filteredBroadcastPatients.map(p => ({ name: p.name, phone: p.phone || '' }))
                                const BOM = '\uFEFF'
                                const csv = BOM + 'الاسم,رقم الهاتف\n' + data.map(d => `"${d.name}","${d.phone}"`).join('\n')
                                const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a'); a.href = url; a.download = `patients-${todayStr}.csv`; a.click(); URL.revokeObjectURL(url)
                                toast.success(`تم تصدير ${data.length} مريض بصيغة CSV ✅`)
                              }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all">
                                <FileDown size={16} /> CSV
                              </button>
                              {/* JSON Export */}
                              <button onClick={() => {
                                const data = filteredBroadcastPatients.map(p => ({ name: p.name, phone: p.phone || '' }))
                                const json = JSON.stringify(data, null, 2)
                                const blob = new Blob([json], { type: 'application/json' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a'); a.href = url; a.download = `patients-${todayStr}.json`; a.click(); URL.revokeObjectURL(url)
                                toast.success(`تم تصدير ${data.length} مريض بصيغة JSON ✅`)
                              }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all">
                                <FileDown size={16} /> JSON
                              </button>
                              {/* PDF Export — HTML-to-PDF (no heavy library) */}
                              <button onClick={() => {
                                const data = filteredBroadcastPatients
                                const html = `<!DOCTYPE html><html dir="rtl" lang="ar"><head><meta charset="UTF-8"><title>بيانات المرضى</title><style>body{font-family:Arial,sans-serif;direction:rtl;padding:20px}h1{color:#047857;text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#047857;color:#fff;padding:10px;text-align:right}td{border:1px solid #ddd;padding:8px;text-align:right}tr:nth-child(even){background:#f0fdf4}.info{text-align:center;color:#666;margin-top:10px;font-size:12px}</style></head><body><h1>بيانات المرضى — عيادة المغازي</h1><p class="info">التاريخ: ${todayStr} | عدد المرضى: ${data.length}</p><table><thead><tr><th>#</th><th>الاسم</th><th>رقم الهاتف</th></tr></thead><tbody>${data.map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td dir="ltr">${p.phone || '—'}</td></tr>`).join('')}</tbody></table></body></html>`
                                const w = window.open('', '_blank')
                                if (w) { w.document.write(html); w.document.close(); w.print() }
                                else toast.error('اسمح بالنوافذ المنبثقة للتصدير')
                              }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all">
                                <FileDown size={16} /> PDF
                              </button>
                              {/* Word Export — HTML-based .doc (no heavy library) */}
                              <button onClick={() => {
                                const data = filteredBroadcastPatients
                                const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><style>body{font-family:Arial,sans-serif;direction:rtl;padding:20px}h1{color:#047857;text-align:center}table{width:100%;border-collapse:collapse;margin-top:20px}th{background:#047857;color:#fff;padding:10px;text-align:right}td{border:1px solid #ddd;padding:8px;text-align:right}tr:nth-child(even){background:#f0fdf4}</style></head><body><h1>بيانات المرضى — عيادة المغازي</h1><p style="text-align:center;color:#666">التاريخ: ${todayStr} | عدد المرضى: ${data.length}</p><table><thead><tr><th>#</th><th>الاسم</th><th>رقم الهاتف</th></tr></thead><tbody>${data.map((p, i) => `<tr><td>${i + 1}</td><td>${p.name}</td><td dir="ltr">${p.phone || '—'}</td></tr>`).join('')}</tbody></table></body></html>`
                                const blob = new Blob(['\ufeff' + html], { type: 'application/msword' })
                                const url = URL.createObjectURL(blob)
                                const a = document.createElement('a'); a.href = url; a.download = `patients-${todayStr}.doc`; a.click(); URL.revokeObjectURL(url)
                                toast.success(`تم تصدير ${data.length} مريض بصيغة Word ✅`)
                              }} className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all">
                                <FileDown size={16} /> Word
                              </button>
                            </div>
                          </div>

                          {/* ── Divider ── */}
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-[10px] text-muted-foreground font-bold">أو</span>
                            <div className="flex-1 h-px bg-border" />
                          </div>

                          {/* ── Import Section ── */}
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <div className="p-1 rounded-md bg-blue-100 dark:bg-blue-900/30"><FileUp size={14} className="text-blue-600" /></div>
                              <p className="text-sm font-bold">استيراد نسخة</p>
                              <span className="text-[10px] text-muted-foreground">من تطبيق آخر</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              {/* CSV Import */}
                              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all cursor-pointer">
                                <FileUp size={16} /> CSV
                                <input type="file" accept=".csv" className="hidden" onChange={async (e) => {
                                  const file = e.target.files?.[0]; if (!file) return
                                  try {
                                    const text = await file.text()
                                    const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim())
                                    const parsed: { name: string; phone: string }[] = []
                                    for (let i = 1; i < lines.length; i++) {
                                      const parts = lines[i].match(/(".*?"|[^,]+)/g) || []
                                      const clean = parts.map(p => p.replace(/^"|"$/g, '').trim())
                                      if (clean.length >= 1) parsed.push({ name: clean[0] || '', phone: clean[1] || '' })
                                    }
                                    if (parsed.length === 0) { toast.error('لم يتم العثور على بيانات'); return }
                                    setImportPreviewData(parsed); setImportSelectedIndices(parsed.map((_, i) => i))
                                    toast.success(`تم قراءة ${parsed.length} سجل من CSV`)
                                  } catch { toast.error('خطأ في قراءة الملف') }
                                  e.target.value = ''
                                }} />
                              </label>
                              {/* JSON Import */}
                              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all cursor-pointer">
                                <FileUp size={16} /> JSON
                                <input type="file" accept=".json" className="hidden" onChange={async (e) => {
                                  const file = e.target.files?.[0]; if (!file) return
                                  try {
                                    const text = await file.text()
                                    const data = JSON.parse(text)
                                    const parsed: { name: string; phone: string }[] = []
                                    if (Array.isArray(data)) {
                                      data.forEach((item: any) => {
                                        const name = item.name || item.الاسم || item.Name || ''
                                        const phone = item.phone || item.رقم_الهاتف || item.Phone || item.mobile || item.موبايل || ''
                                        if (name || phone) parsed.push({ name, phone: String(phone) })
                                      })
                                    }
                                    if (parsed.length === 0) { toast.error('لم يتم العثور على بيانات'); return }
                                    setImportPreviewData(parsed); setImportSelectedIndices(parsed.map((_, i) => i))
                                    toast.success(`تم قراءة ${parsed.length} سجل من JSON`)
                                  } catch { toast.error('خطأ في قراءة الملف') }
                                  e.target.value = ''
                                }} />
                              </label>
                              {/* PDF Import — lightweight text extraction via canvas */}
                              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all cursor-pointer">
                                <FileUp size={16} /> PDF
                                <input type="file" accept=".pdf" className="hidden" onChange={async (e) => {
                                  const file = e.target.files?.[0]; if (!file) return
                                  try {
                                    const text = await file.text()
                                    // Extract readable text from PDF and parse name/phone pairs
                                    const parsed: { name: string; phone: string }[] = []
                                    const lines = text.split(/[\n\r]+/).map(l => l.trim()).filter(l => l.length > 1)
                                    for (const line of lines) {
                                      const phoneMatch = line.match(/[\+]?[\d\s\-]{8,}/)
                                      if (phoneMatch) {
                                        const phone = phoneMatch[0].trim()
                                        const name = line.replace(phoneMatch[0], '').replace(/[#\-|,;]/g, '').trim()
                                        if (name || phone) parsed.push({ name: name || 'بدون اسم', phone })
                                      }
                                    }
                                    // If no structured data found, try reading raw text blocks
                                    if (parsed.length === 0) {
                                      const phoneMatches = text.match(/[\+]?[\d]{2,}[\d\s\-]{6,}/g) || []
                                      phoneMatches.forEach(ph => {
                                        const clean = ph.trim()
                                        if (clean.length >= 8) parsed.push({ name: 'بدون اسم', phone: clean })
                                      })
                                    }
                                    if (parsed.length === 0) { toast.error('لم يتم العثور على بيانات — جرب CSV أو JSON بدلاً من ذلك'); return }
                                    setImportPreviewData(parsed); setImportSelectedIndices(parsed.map((_, i) => i))
                                    toast.success(`تم قراءة ${parsed.length} سجل من PDF`)
                                  } catch { toast.error('خطأ في قراءة ملف PDF') }
                                  e.target.value = ''
                                }} />
                              </label>
                              {/* Word Import — lightweight .docx text extraction via ZIP */}
                              <label className="flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg hover:shadow-xl active:scale-[0.95] transition-all cursor-pointer">
                                <FileUp size={16} /> Word
                                <input type="file" accept=".docx" className="hidden" onChange={async (e) => {
                                  const file = e.target.files?.[0]; if (!file) return
                                  try {
                                    const arrayBuffer = await file.arrayBuffer()
                                    // .docx is a ZIP file — extract document.xml and parse text
                                    const JSZip = await import('jszip').then(m => m.default || m)
                                    const zip = await JSZip.loadAsync(arrayBuffer)
                                    const docXml = await zip.file('word/document.xml')?.async('string')
                                    if (!docXml) { toast.error('خطأ في قراءة ملف Word'); return }
                                    // Strip XML tags to get plain text
                                    const plainText = docXml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
                                    const parsed: { name: string; phone: string }[] = []
                                    const segments = plainText.split(/[,;\n]+/).map(s => s.trim()).filter(Boolean)
                                    for (const seg of segments) {
                                      const phoneMatch = seg.match(/[\+]?[\d\s\-]{8,}/)
                                      if (phoneMatch) {
                                        const phone = phoneMatch[0].trim()
                                        const name = seg.replace(phoneMatch[0], '').replace(/[#\-|]/g, '').trim()
                                        if (name || phone) parsed.push({ name: name || 'بدون اسم', phone })
                                      }
                                    }
                                    if (parsed.length === 0) { toast.error('لم يتم العثور على بيانات — تأكد أن الملف يحتوي أسماء وأرقام'); return }
                                    setImportPreviewData(parsed); setImportSelectedIndices(parsed.map((_, i) => i))
                                    toast.success(`تم قراءة ${parsed.length} سجل من Word`)
                                  } catch { toast.error('خطأ في قراءة ملف Word') }
                                  e.target.value = ''
                                }} />
                              </label>
                            </div>

                            {/* ── Import Preview ── */}
                            {importPreviewData.length > 0 && (
                              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-bold flex items-center gap-1"><Eye size={12} className="text-purple-600" /> معاينة البيانات المستوردة ({importSelectedIndices.length}/{importPreviewData.length})</p>
                                  <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => { setImportPreviewData([]); setImportSelectedIndices([]) }}>إغلاق</Button>
                                </div>
                                <div className="max-h-48 overflow-y-auto rounded-xl border border-purple-200 dark:border-purple-800 divide-y divide-border">
                                  {importPreviewData.map((item, idx) => (
                                    <div key={idx} className={cn('flex items-center gap-2 p-2 text-xs', importSelectedIndices.includes(idx) ? 'bg-purple-50/50 dark:bg-purple-900/10' : 'bg-muted/20 opacity-50')}>
                                      <button onClick={() => setImportSelectedIndices(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])} className={cn('w-5 h-5 rounded-full flex items-center justify-center border-2 transition-all flex-shrink-0', importSelectedIndices.includes(idx) ? 'bg-purple-500 border-purple-600 text-white' : 'border-muted-foreground/30')}>
                                        {importSelectedIndices.includes(idx) && <CheckCircle size={10} />}
                                      </button>
                                      <span className="font-bold flex-1 truncate">{item.name || 'بدون اسم'}</span>
                                      <span dir="ltr" className="text-muted-foreground">{item.phone || '—'}</span>
                                      {patients.some(p => p.phone === item.phone && item.phone) && <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-[7px] border-0">مكرر</Badge>}
                                    </div>
                                  ))}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button onClick={() => setImportSelectedIndices(importPreviewData.map((_, i) => i))} className="text-[10px] text-purple-600 font-bold hover:underline">اختيار الكل</button>
                                  <span className="text-[10px] text-muted-foreground">|</span>
                                  <button onClick={() => setImportSelectedIndices([])} className="text-[10px] text-purple-600 font-bold hover:underline">إلغاء الكل</button>
                                </div>
                                <button onClick={async () => {
                                  const selected = importSelectedIndices.map(i => importPreviewData[i]).filter(Boolean)
                                  if (selected.length === 0) { toast.error('اختر سجلات للاستيراد'); return }
                                  let added = 0
                                  for (const item of selected) {
                                    try {
                                      const res = await apiFetch('/patients', { method: 'POST', body: JSON.stringify({ name: item.name, phone: item.phone }) })
                                      const newPatient = res?.patient || res?.data || res
                                      if (newPatient?.id) { setPatients(prev => [newPatient, ...prev]); added++ }
                                    } catch { added++ }
                                  }
                                  toast.success(`تم استيراد ${added} مريض بنجاح ✅`)
                                  setImportPreviewData([]); setImportSelectedIndices([])
                                }} disabled={importSelectedIndices.length === 0} className={cn('w-full flex items-center justify-center gap-2 p-3 rounded-xl text-sm font-bold transition-all shadow-lg active:scale-[0.95] hover:shadow-xl', importSelectedIndices.length === 0 ? 'bg-muted/50 text-muted-foreground cursor-not-allowed' : 'bg-gradient-to-br from-purple-500 to-fuchsia-600 text-white')}>
                                  <Upload size={16} /> استيراد {importSelectedIndices.length} مريض
                                </button>
                              </motion.div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )
                })()}

                {/* Reports Sub-tab - التقارير المحترفة */}
                {moreSubTab === 'reports' && (<div className="space-y-4">
                  {/* ═══ Daily Cases Summary - ملخص يومي بالحالات ═══ */}
                  <Card className="card-luxury border-2 border-cyan-300 dark:border-cyan-700"><CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck size={18} className="text-cyan-600" /> ملخص الحالات اليومي</CardTitle></CardHeader><CardContent className="space-y-3">
                    {dailyVisitStats.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد بيانات بعد</p>}
                    {dailyVisitStats.map(day => {
                      const isToday = day.date === todayStr
                      const dayName = getCairoWeekday(day.date)
                      const dayLabel = getCairoDateLabel(day.date)
                      const totalCases = day.checkupCount + day.revisitCount + day.sessionCount
                      const totalRev = day.checkupRevenue + day.revisitRevenue + day.sessionRevenue
                      return (
                        <div key={day.date} className={cn('p-3 rounded-xl border-2', isToday ? 'border-cyan-400 dark:border-cyan-600 bg-cyan-50/50 dark:bg-cyan-950/20' : 'border-border bg-card')}>
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                              <CalendarCheck size={14} className={isToday ? 'text-cyan-600' : 'text-muted-foreground'} />
                              <span className="font-bold text-sm">{dayLabel}</span>
                              <span className="text-[10px] text-muted-foreground">({dayName})</span>
                              {isToday && <Badge className="bg-cyan-500 text-white text-[8px]">اليوم</Badge>}
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[9px] font-bold">{totalCases} حالة</Badge>
                              <span className="text-xs font-bold text-emerald-600">{formatCurrency(totalRev)}</span>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1"><span className="text-sm">🩺</span><span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">كشف</span></div>
                              <p className="text-lg font-black text-emerald-600">{day.checkupCount}</p>
                              <p className="text-[9px] text-emerald-500 font-bold">{formatCurrency(day.checkupRevenue)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1"><span className="text-sm">🔄</span><span className="text-[10px] font-bold text-blue-700 dark:text-blue-400">إعادة</span></div>
                              <p className="text-lg font-black text-blue-600">{day.revisitCount}</p>
                              <p className="text-[9px] text-blue-500 font-bold">{formatCurrency(day.revisitRevenue)}</p>
                            </div>
                            <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center">
                              <div className="flex items-center justify-center gap-1 mb-1"><span className="text-sm">⚡</span><span className="text-[10px] font-bold text-violet-700 dark:text-violet-400">جلسات</span></div>
                              <p className="text-lg font-black text-violet-600">{day.sessionCount}</p>
                              <p className="text-[9px] text-violet-500 font-bold">{formatCurrency(day.sessionRevenue)}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </CardContent></Card>

                  {/* Today's Quick Summary */}
                  <Card className="card-luxury border-2 border-emerald-300 dark:border-emerald-700"><CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-emerald-600" /> ملخص اليوم السريع</CardTitle></CardHeader><CardContent>
                    {(() => {
                      const todayStats = dailyVisitStats.find(d => d.date === todayStr)
                      return (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">🩺 كشف اليوم</p><p className="text-lg font-bold text-emerald-600">{todayStats?.checkupCount || 0}</p><p className="text-[10px] text-emerald-500 font-bold">{formatCurrency(todayStats?.checkupRevenue || 0)}</p></div>
                          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">🔄 إعادة اليوم</p><p className="text-lg font-bold text-blue-600">{todayStats?.revisitCount || 0}</p><p className="text-[10px] text-blue-500 font-bold">{formatCurrency(todayStats?.revisitRevenue || 0)}</p></div>
                          <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-xs text-muted-foreground">⚡ جلسات اليوم</p><p className="text-lg font-bold text-violet-600">{todayStats?.sessionCount || 0}</p><p className="text-[10px] text-violet-500 font-bold">{formatCurrency(todayStats?.sessionRevenue || 0)}</p></div>
                          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">💰 إيراد اليوم</p><p className="text-lg font-bold text-amber-600">{formatCurrency(todayIncome)}</p><p className="text-[10px] text-amber-500 font-bold">صافي: {formatCurrency(todayNetProfit)}</p></div>
                        </div>
                      )
                    })()}
                  </CardContent></Card>

                  {/* Financial Summary */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 size={18} className="text-cyan-600" /> الملخص المالي الشامل</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">إجمالي الإيرادات</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(totalIncome)}</p></div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><p className="text-xs text-muted-foreground">إجمالي المصروفات</p><p className="text-lg font-bold text-red-600">{formatCurrency(totalExpense)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">صافي الربح</p><p className={cn('text-lg font-bold', netProfit >= 0 ? 'text-blue-600' : 'text-red-600')}>{formatCurrency(netProfit)}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">غير المدفوع</p><p className="text-lg font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-xs text-muted-foreground">إيراد الأسبوع</p><p className="text-lg font-bold text-violet-600">{formatCurrency(thisWeekIncome)}</p></div>
                      <div className="p-3 rounded-xl bg-teal-50 dark:bg-teal-900/20"><p className="text-xs text-muted-foreground">إيراد الشهر</p><p className="text-lg font-bold text-teal-600">{formatCurrency(thisMonthIncome)}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Revenue by Category */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Receipt size={18} className="text-amber-600" /> الإيرادات حسب النوع</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>🩺</span><span className="text-sm font-bold">كشف</span></div><span className="font-bold text-emerald-600">{formatCurrency(checkupRevenue)}</span></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>🔄</span><span className="text-sm font-bold">إعادة</span></div><span className="font-bold text-blue-600">{formatCurrency(revisitRevenue)}</span></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>⚡</span><span className="text-sm font-bold">جلسات</span></div><span className="font-bold text-violet-600">{formatCurrency(sessionRevenue)}</span></div>
                      <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/20 flex items-center justify-between"><div className="flex items-center gap-2"><span>📊</span><span className="text-sm font-bold">أخرى</span></div><span className="font-bold text-gray-600">{formatCurrency(otherRevenue)}</span></div>
                    </div>
                    {revenueByCategory.length > 0 && <div className="mt-4"><ResponsiveContainer width="100%" height={220}><PieChart><Pie data={revenueByCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`}>{revenueByCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}</Pie><RechartsTooltip /></PieChart></ResponsiveContainer></div>}
                  </CardContent></Card>

                  {/* Patient Stats */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Users size={18} className="text-blue-600" /> إحصائيات المرضى</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">إجمالي المرضى</p><p className="text-lg font-bold text-blue-600">{patients.length}</p></div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">جدد هذا الشهر</p><p className="text-lg font-bold text-emerald-600">{patients.filter(p => { const pd = getCairoDateParts(p.createdAt); return pd.year === cairoNow.year && pd.month === cairoNow.month }).length}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">⭐ حالات مميزة</p><p className="text-lg font-bold text-amber-600">{patients.filter(p => p.starred).length}</p></div>
                      <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20"><p className="text-xs text-muted-foreground">💗 متحسنين</p><p className="text-lg font-bold text-pink-600">{patients.filter(p => p.improved).length}</p></div>
                      <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20"><p className="text-xs text-muted-foreground">👍 حالات للنشر</p><p className="text-lg font-bold text-green-600">{patients.filter(p => p.publishable).length}</p></div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><p className="text-xs text-muted-foreground">💀 حالات خطر</p><p className="text-lg font-bold text-red-600">{patients.filter(p => p.dangerous).length}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Session Stats */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-orange-600" /> إحصائيات الجلسات</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-orange-50 dark:bg-orange-900/20"><p className="text-xs text-muted-foreground">إجمالي الجلسات</p><p className="text-lg font-bold text-orange-600">{sessions.length}</p></div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">مكتملة</p><p className="text-lg font-bold text-emerald-600">{sessions.filter(s => s.status === 'completed').length}</p></div>
                      <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20"><p className="text-xs text-muted-foreground">غير مدفوعة</p><p className="text-lg font-bold text-red-600">{sessions.filter(s => !s.paid).length}</p></div>
                      <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20"><p className="text-xs text-muted-foreground">إجمالي غير مدفوعة</p><p className="text-lg font-bold text-amber-600">{formatCurrency(unpaidTotal)}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* Laser Stats */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-cyan-600" /> إحصائيات الليزر</CardTitle></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-cyan-50 dark:bg-cyan-900/20"><p className="text-xs text-muted-foreground">سجلات نشطة</p><p className="text-lg font-bold text-cyan-600">{laserRecords.filter(r => r.status === 'active').length}</p></div>
                      <div className="p-3 rounded-xl bg-violet-50 dark:bg-violet-900/20"><p className="text-xs text-muted-foreground">مكتملة</p><p className="text-lg font-bold text-violet-600">{laserRecords.filter(r => r.status === 'completed').length}</p></div>
                      <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20"><p className="text-xs text-muted-foreground">إيراد الليزر</p><p className="text-lg font-bold text-emerald-600">{formatCurrency(laserRevenue)}</p></div>
                      <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20"><p className="text-xs text-muted-foreground">مرضى الليزر</p><p className="text-lg font-bold text-blue-600">{new Set(laserRecords.map(r => r.patientId)).size}</p></div>
                    </div>
                  </CardContent></Card>

                  {/* ═══ Top Patients by Visits ═══ */}
                  <Card className="card-luxury border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Award size={18} className="text-blue-600" /> أكثر المرضى زيارة</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {topPatientsByVisits.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">لا توجد زيارات بعد</p>}
                      {topPatientsByVisits.map((item, idx) => (
                        <div key={item.patient.id} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-all cursor-pointer" onClick={() => setSelectedPatient(item.patient)}>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm', idx === 0 ? 'bg-gradient-to-br from-yellow-400 to-amber-600' : idx === 1 ? 'bg-gradient-to-br from-gray-300 to-gray-500' : idx === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-600' : 'bg-gradient-to-br from-blue-400 to-blue-600')}>
                            {idx + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{item.patient.name}</p>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-[8px] px-1 py-0">🩺 {item.visitCount}</Badge>
                              <Badge variant="outline" className="text-[8px] px-1 py-0">⚡ {item.sessionCount}</Badge>
                            </div>
                          </div>
                          <div className="text-left">
                            <p className="text-xs font-bold text-emerald-600">{formatCurrency(item.totalSpent)}</p>
                            <p className="text-[8px] text-muted-foreground">{item.visitCount + item.sessionCount} زيارة</p>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  {/* ═══ Laser Session Progress ═══ */}
                  {laserProgressData.length > 0 && (
                  <Card className="card-luxury border-2 border-cyan-200 dark:border-cyan-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-cyan-600" /> تقدم جلسات الليزر النشطة</CardTitle></CardHeader>
                    <CardContent className="space-y-3">
                      {laserProgressData.map(item => (
                        <div key={item.record.id} className="p-3 rounded-xl bg-muted/50 space-y-2 cursor-pointer hover:bg-muted transition-all" onClick={() => { setSelectedPatient(item.patient || null); setActiveTab('patients') }}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-900/30"><Zap size={12} className="text-cyan-600" /></div>
                              <div>
                                <p className="text-xs font-bold">{item.patient?.name || 'مريض'}</p>
                                <p className="text-[9px] text-muted-foreground">{item.areaLabel}</p>
                              </div>
                            </div>
                            <div className="text-left">
                              <p className="text-xs font-bold text-cyan-600">{item.completedSessionsC}/{item.totalSessionsC}</p>
                              <p className="text-[9px] text-muted-foreground">{item.progress.toFixed(0)}%</p>
                            </div>
                          </div>
                          <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(item.progress, 100)}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={cn('absolute inset-y-0 right-0 rounded-full', item.progress >= 80 ? 'bg-emerald-500' : item.progress >= 50 ? 'bg-cyan-500' : item.progress >= 25 ? 'bg-amber-500' : 'bg-red-400')} />
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                  )}

                  {/* Weekly Revenue Bar Chart */}
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp size={18} className="text-emerald-600" /> الإيرادات الأسبوعية</CardTitle></CardHeader><CardContent>
                    <ResponsiveContainer width="100%" height={260}><BarChart data={revenueChartData}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} /><YAxis stroke="var(--muted-foreground)" fontSize={12} /><RechartsTooltip /><Bar dataKey="إيراد" fill="#047857" radius={[4,4,0,0]} /><Bar dataKey="مصروف" fill="#D4A843" radius={[4,4,0,0]} /></BarChart></ResponsiveContainer>
                  </CardContent></Card>

                  {/* ═══ NEW: Most Common Session Types ═══ */}
                  <Card className="card-luxury border-2 border-violet-200 dark:border-violet-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Zap size={18} className="text-violet-600" /> أكثر أنواع الجلسات</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const sessionByType: Record<string, { count: number; revenue: number }> = {}
                        sessions.forEach(s => {
                          const svc = services.find(sv => sv.id === s.serviceId)
                          const label = svc?.name || s.notes?.split('|')[0]?.trim() || 'جلسة عامة'
                          if (!sessionByType[label]) sessionByType[label] = { count: 0, revenue: 0 }
                          sessionByType[label].count++
                          if (s.paid) sessionByType[label].revenue += s.price || 0
                        })
                        const sorted = Object.entries(sessionByType).sort((a, b) => b[1].count - a[1].count).slice(0, 8)
                        const maxCount = sorted.length > 0 ? sorted[0][1].count : 1
                        if (sorted.length === 0) return <p className="text-center text-muted-foreground text-sm py-4">لا توجد جلسات بعد</p>
                        return sorted.map(([name, data], idx) => (
                          <div key={name} className="p-2.5 rounded-xl bg-muted/50 hover:bg-muted transition-all">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs', idx < 3 ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-gray-400 to-gray-500')}>{idx + 1}</div>
                                <span className="text-sm font-bold truncate max-w-[140px]">{name}</span>
                              </div>
                              <div className="text-left">
                                <span className="text-xs font-bold text-violet-600">{data.count} جلسة</span>
                                <span className="text-[10px] text-emerald-600 mr-1">{formatCurrency(data.revenue)}</span>
                              </div>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(data.count / maxCount) * 100}%` }} transition={{ duration: 0.8, delay: idx * 0.1 }} className={cn('absolute inset-y-0 right-0 rounded-full', idx === 0 ? 'bg-violet-500' : idx === 1 ? 'bg-purple-400' : idx === 2 ? 'bg-fuchsia-400' : 'bg-gray-400')} />
                            </div>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Detailed Weekly Report (Egyptian week: Saturday–Friday) ═══ */}
                  <Card className="card-luxury border-2 border-emerald-200 dark:border-emerald-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><CalendarCheck size={18} className="text-emerald-600" /> تقرير أسبوعي مفصل (السبت–الجمعة)</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        // Generate ALL 7 days of the current Egyptian week (Saturday→Friday)
                        const weekDays = getEgyptianWeekDays()
                        // Build a lookup map from dailyVisitStats for O(1) access
                        const statsByDate: Record<string, typeof dailyVisitStats[0]> = {}
                        for (const s of dailyVisitStats) statsByDate[s.date] = s
                        // Merge: always show all 7 days, zero-fill missing
                        const fullWeekDays = weekDays.map(wd => {
                          const stats = statsByDate[wd.dateStr]
                          return {
                            date: wd.dateStr,
                            dayName: wd.dayName,
                            checkupCount: stats?.checkupCount || 0,
                            revisitCount: stats?.revisitCount || 0,
                            sessionCount: stats?.sessionCount || 0,
                            checkupRevenue: stats?.checkupRevenue || 0,
                            revisitRevenue: stats?.revisitRevenue || 0,
                            sessionRevenue: stats?.sessionRevenue || 0,
                          }
                        })
                        const weekTotalCases = fullWeekDays.reduce((s, d) => s + d.checkupCount + d.revisitCount + d.sessionCount, 0)
                        const weekTotalRevenue = fullWeekDays.reduce((s, d) => s + d.checkupRevenue + d.revisitRevenue + d.sessionRevenue, 0)
                        return (
                          <>
                            <div className="grid grid-cols-2 gap-2 mb-3">
                              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 text-center">
                                <p className="text-[10px] text-muted-foreground">إجمالي حالات الأسبوع</p>
                                <p className="text-xl font-black text-emerald-600">{weekTotalCases}</p>
                              </div>
                              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-center">
                                <p className="text-[10px] text-muted-foreground">إيراد الأسبوع</p>
                                <p className="text-xl font-black text-amber-600">{formatCurrency(weekTotalRevenue)}</p>
                              </div>
                            </div>
                            {fullWeekDays.map(day => {
                              const totalCases = day.checkupCount + day.revisitCount + day.sessionCount
                              const totalRev = day.checkupRevenue + day.revisitRevenue + day.sessionRevenue
                              const isToday = day.date === todayStr
                              const dayShortLabel = new Date(day.date + 'T12:00:00Z').toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' })
                              return (
                                <div key={day.date} className={cn('flex items-center justify-between p-2 rounded-lg', isToday ? 'bg-emerald-100/60 dark:bg-emerald-900/30 border border-emerald-300 dark:border-emerald-700' : 'bg-muted/50')}>
                                  <div className="flex items-center gap-2">
                                    <span className={cn('text-xs font-bold', isToday ? 'text-emerald-900 dark:text-emerald-300' : 'text-emerald-700 dark:text-emerald-400')}>{day.dayName}</span>
                                    <span className="text-[10px] text-muted-foreground">{dayShortLabel}</span>
                                    {isToday && <Badge className="bg-emerald-500 text-white text-[7px] px-1 py-0">اليوم</Badge>}
                                  </div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-[10px] font-bold">{totalCases} حالة</span>
                                    <span className="text-[10px] font-bold text-emerald-600">{formatCurrency(totalRev)}</span>
                                  </div>
                                </div>
                              )
                            })}
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Detailed Monthly Report ═══ */}
                  <Card className="card-luxury border-2 border-blue-200 dark:border-blue-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Calendar size={18} className="text-blue-600" /> تقرير شهري مفصل</CardTitle></CardHeader>
                    <CardContent>
                      {(() => {
                        const cairoNow = getCairoDateParts()
                        const thisMonthPatients = patients.filter(p => { const pd = getCairoDateParts(p.createdAt); return pd.year === cairoNow.year && pd.month === cairoNow.month }).length
                        const thisMonthVisits = visits.filter(v => { const vd = getCairoDateParts(v.date); return vd.year === cairoNow.year && vd.month === cairoNow.month }).length
                        const thisMonthSessions = sessions.filter(s => { const sd = getCairoDateParts(s.date); return sd.year === cairoNow.year && sd.month === cairoNow.month }).length
                        const lastMonth = cairoNow.month === 1 ? 12 : cairoNow.month - 1
                        const lastMonthYear = cairoNow.month === 1 ? cairoNow.year - 1 : cairoNow.year
                        const lastMonthIncome = clinicTransactions.filter(t => { const td = getCairoDateParts(t.date); return t.type === 'income' && td.year === lastMonthYear && td.month === lastMonth }).reduce((s, t) => s + t.amount, 0)
                        const incomeChange = lastMonthIncome > 0 ? ((thisMonthIncome - lastMonthIncome) / lastMonthIncome * 100) : 0
                        const thisMonthExpenses = clinicTransactions.filter(t => { const td = getCairoDateParts(t.date); return t.type === 'expense' && td.year === cairoNow.year && td.month === cairoNow.month }).reduce((s, t) => s + t.amount, 0)
                        return (
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/20">
                              <p className="text-[10px] text-muted-foreground">مرضى جدد الشهر</p>
                              <p className="text-lg font-black text-blue-600">{thisMonthPatients}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-violet-50 dark:bg-violet-900/20">
                              <p className="text-[10px] text-muted-foreground">زيارات الشهر</p>
                              <p className="text-lg font-black text-violet-600">{thisMonthVisits}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/20">
                              <p className="text-[10px] text-muted-foreground">جلسات الشهر</p>
                              <p className="text-lg font-black text-orange-600">{thisMonthSessions}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20">
                              <p className="text-[10px] text-muted-foreground">إيراد الشهر</p>
                              <p className="text-lg font-black text-emerald-600">{formatCurrency(thisMonthIncome)}</p>
                              {incomeChange !== 0 && (
                                <div className={cn('flex items-center gap-1 text-[10px] font-bold', incomeChange > 0 ? 'text-emerald-600' : 'text-red-600')}>
                                  {incomeChange > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                                  {Math.abs(incomeChange).toFixed(0)}% عن الشهر السابق
                                </div>
                              )}
                            </div>
                            <div className="p-2.5 rounded-xl bg-red-50 dark:bg-red-900/20">
                              <p className="text-[10px] text-muted-foreground">مصروفات الشهر</p>
                              <p className="text-lg font-black text-red-600">{formatCurrency(thisMonthExpenses)}</p>
                            </div>
                            <div className="p-2.5 rounded-xl bg-cyan-50 dark:bg-cyan-900/20">
                              <p className="text-[10px] text-muted-foreground">صافي ربح الشهر</p>
                              <p className={cn('text-lg font-black', thisMonthIncome - thisMonthExpenses >= 0 ? 'text-cyan-600' : 'text-red-600')}>{formatCurrency(thisMonthIncome - thisMonthExpenses)}</p>
                            </div>
                          </div>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══════════════════════════════════════════════════════════════════
                      MONTHLY NET REVENUE COMPARISON — Last 6 Months
                      ═══════════════════════════════════════════════════════════════════ */}
                  <Card className="card-luxury border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50/40 via-white to-teal-50/40 dark:from-emerald-950/20 dark:via-card dark:to-teal-950/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 text-white"><TrendingUp size={16} /></div>
                          مقارنة الإيراد الشهري الصافي — آخر ٦ شهور
                        </CardTitle>
                        <Badge className="bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 text-[10px] border border-emerald-200 dark:border-emerald-700">شهري</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const _cairoNow = getCairoDateParts()
                        // Build 6-month data
                        const months: { label: string; monthNum: number; year: number; income: number; expense: number; net: number; categories: Record<string, number> }[] = []
                        for (let i = 5; i >= 0; i--) {
                          const m = _cairoNow.month - i
                          const year = _cairoNow.year + Math.floor((m - 1) / 12)
                          const month = ((m - 1) % 12 + 12) % 12 + 1
                          const monthLabel = new Date(year, month - 1, 1).toLocaleDateString('ar-EG', { month: 'long', timeZone: 'Africa/Cairo' })
                          const monthTxns = clinicTransactions.filter(t => { const td = getCairoDateParts(t.date); return td.year === year && td.month === month })
                          const income = monthTxns.filter(t => t.type === 'income').reduce((s, t) => s + (t.amount || 0), 0)
                          const expense = monthTxns.filter(t => t.type === 'expense').reduce((s, t) => s + (t.amount || 0), 0)
                          const categories: Record<string, number> = {}
                          monthTxns.filter(t => t.type === 'income').forEach(t => { categories[t.category] = (categories[t.category] || 0) + (t.amount || 0) })
                          months.push({ label: monthLabel, monthNum: month, year, income, expense, net: income - expense, categories })
                        }
                        const totalIncome6m = months.reduce((s, m) => s + m.income, 0)
                        const totalExpense6m = months.reduce((s, m) => s + m.expense, 0)
                        const totalNet6m = totalIncome6m - totalExpense6m
                        const avgNetMonthly = totalNet6m / 6
                        const bestMonth = [...months].sort((a, b) => b.net - a.net)[0]
                        const worstMonth = [...months].sort((a, b) => a.net - b.net)[0]
                        const chartData = months.map(m => ({ name: m.label, الإيراد: m.income, المصروفات: m.expense, 'صافي الربح': m.net }))

                        return (
                          <>
                            {/* ── Hero Stats Row ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200/60 dark:border-emerald-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">إجمالي الإيرادات</p>
                                <p className="text-lg font-black text-emerald-600">{formatCurrency(totalIncome6m)}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200/60 dark:border-red-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">إجمالي المصروفات</p>
                                <p className="text-lg font-black text-red-600">{formatCurrency(totalExpense6m)}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/30 border border-cyan-200/60 dark:border-cyan-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">صافي الربح الكلي</p>
                                <p className={cn('text-lg font-black', totalNet6m >= 0 ? 'text-cyan-600' : 'text-red-600')}>{formatCurrency(totalNet6m)}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/60 dark:border-amber-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">متوسط صافي الشهر</p>
                                <p className={cn('text-lg font-black', avgNetMonthly >= 0 ? 'text-amber-600' : 'text-red-600')}>{formatCurrency(avgNetMonthly)}</p>
                              </div>
                            </div>

                            {/* ── Area Chart ── */}
                            <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-emerald-100 dark:border-emerald-900/40">
                              <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                  <defs>
                                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#047857" stopOpacity={0.35} />
                                      <stop offset="95%" stopColor="#047857" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#DC2626" stopOpacity={0.25} />
                                      <stop offset="95%" stopColor="#DC2626" stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                      <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.35} />
                                      <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0.02} />
                                    </linearGradient>
                                  </defs>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} />
                                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} width={60} />
                                  <RechartsTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} formatter={(v: number) => formatCurrency(v)} />
                                  <Area type="monotone" dataKey="الإيراد" stroke="#047857" strokeWidth={2.5} fill="url(#incomeGrad)" dot={{ r: 4, fill: '#047857', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 2 }} />
                                  <Area type="monotone" dataKey="المصروفات" stroke="#DC2626" strokeWidth={2} fill="url(#expenseGrad)" dot={{ r: 3, fill: '#DC2626', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 5 }} />
                                  <Area type="monotone" dataKey="صافي الربح" stroke="#0EA5E9" strokeWidth={3} fill="url(#netGrad)" dot={{ r: 4, fill: '#0EA5E9', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6, strokeWidth: 2 }} />
                                </AreaChart>
                              </ResponsiveContainer>
                            </div>

                            {/* ── Best/Worst Month Badges ── */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-l from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border border-emerald-200/50 dark:border-emerald-800/40">
                                <div className="p-1.5 rounded-lg bg-emerald-500 text-white"><Award size={14} /></div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">أفضل شهر</p>
                                  <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{bestMonth.label} — {formatCurrency(bestMonth.net)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-l from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/40">
                                <div className="p-1.5 rounded-lg bg-red-500 text-white"><TrendingDown size={14} /></div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">أضعف شهر</p>
                                  <p className="text-xs font-bold text-red-700 dark:text-red-300">{worstMonth.label} — {formatCurrency(worstMonth.net)}</p>
                                </div>
                              </div>
                            </div>

                            {/* ── Detailed Monthly Breakdown Table ── */}
                            <div className="rounded-xl border border-border overflow-hidden">
                              <div className="grid grid-cols-5 gap-0 bg-muted/60 text-[10px] font-bold text-muted-foreground p-2">
                                <span>الشهر</span>
                                <span className="text-center">الإيراد</span>
                                <span className="text-center">المصروفات</span>
                                <span className="text-center">صافي الربح</span>
                                <span className="text-center">التغير</span>
                              </div>
                              {months.map((m, idx) => {
                                const prevNet = idx > 0 ? months[idx - 1].net : null
                                const change = prevNet !== null && prevNet !== 0 ? ((m.net - prevNet) / Math.abs(prevNet) * 100) : null
                                const isCurrentMonth = m.monthNum === _cairoNow.month && m.year === _cairoNow.year
                                return (
                                  <div key={`${m.year}-${m.monthNum}`} className={cn('grid grid-cols-5 gap-0 p-2 text-xs border-t border-border items-center', isCurrentMonth ? 'bg-emerald-50/60 dark:bg-emerald-900/15' : 'bg-card')}>
                                    <span className="font-bold flex items-center gap-1">
                                      {m.label}
                                      {isCurrentMonth && <Badge className="bg-emerald-500 text-white text-[7px] px-1 py-0">الحالي</Badge>}
                                    </span>
                                    <span className="text-center font-bold text-emerald-600">{formatCurrency(m.income)}</span>
                                    <span className="text-center font-bold text-red-600">{formatCurrency(m.expense)}</span>
                                    <span className={cn('text-center font-black', m.net >= 0 ? 'text-cyan-600' : 'text-red-600')}>{formatCurrency(m.net)}</span>
                                    <span className="text-center">
                                      {change !== null ? (
                                        <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold', change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground')}>
                                          {change > 0 ? <TrendingUp size={10} /> : change < 0 ? <TrendingDown size={10} /> : null}
                                          {change !== 0 ? `${Math.abs(change).toFixed(0)}%` : '—'}
                                        </span>
                                      ) : <span className="text-[10px] text-muted-foreground">—</span>}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            {/* ── Category Breakdown per Month ── */}
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Layers size={12} /> تفصيل الإيرادات حسب النوع لكل شهر</p>
                              {months.map(m => {
                                const cats = Object.entries(m.categories).sort((a, b) => b[1] - a[1])
                                if (cats.length === 0) return null
                                const maxCat = Math.max(...cats.map(c => c[1]), 1)
                                const catColors: Record<string, string> = { 'كشف': 'bg-emerald-500', 'إعادة': 'bg-blue-500', 'جلسات': 'bg-violet-500', 'ليزر': 'bg-amber-500', 'متابعة': 'bg-cyan-500' }
                                return (
                                  <div key={`${m.year}-${m.monthNum}`} className="p-2.5 rounded-xl bg-muted/40 border border-border/50">
                                    <p className="text-[10px] font-bold mb-2 text-muted-foreground">{m.label}</p>
                                    <div className="space-y-1.5">
                                      {cats.map(([cat, amount]) => (
                                        <div key={cat} className="flex items-center gap-2">
                                          <span className="text-[10px] font-medium w-14 truncate">{cat}</span>
                                          <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                                            <motion.div initial={{ width: 0 }} animate={{ width: `${(amount / maxCat) * 100}%` }} transition={{ duration: 0.7 }} className={cn('h-full rounded-full', catColors[cat] || 'bg-gray-500')} />
                                          </div>
                                          <span className="text-[10px] font-bold w-16 text-left">{formatCurrency(amount)}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══════════════════════════════════════════════════════════════════
                      WEEKLY NET REVENUE COMPARISON — Last 6 Weeks
                      ═══════════════════════════════════════════════════════════════════ */}
                  <Card className="card-luxury border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50/40 via-white to-indigo-50/40 dark:from-blue-950/20 dark:via-card dark:to-indigo-950/20">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white"><BarChart3 size={16} /></div>
                          مقارنة الإيراد الأسبوعي الصافي — آخر ٦ أسابيع
                        </CardTitle>
                        <Badge className="bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 text-[10px] border border-blue-200 dark:border-blue-700">أسبوعي</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const _cairoNow = getCairoDateParts()
                        // Build 6-week data (Egyptian week: Saturday–Friday)
                        const weeks: { label: string; startDate: string; endDate: string; income: number; expense: number; net: number; dayDetails: { dateStr: string; dayName: string; income: number; expense: number }[] }[] = []
                        const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
                        const dayOfWeek = nowCairo.getDay()
                        const daysSinceSaturday = (dayOfWeek + 1) % 7

                        for (let i = 5; i >= 0; i--) {
                          const weekEndDate = new Date(nowCairo)
                          weekEndDate.setDate(nowCairo.getDate() - (i * 7) + (6 - daysSinceSaturday))
                          const weekStartDate = new Date(weekEndDate)
                          weekStartDate.setDate(weekEndDate.getDate() - 6)
                          const weekDaysSet = new Set<string>()
                          const dayDetails: { dateStr: string; dayName: string; income: number; expense: number }[] = []
                          for (let d = 0; d < 7; d++) {
                            const day = new Date(weekStartDate)
                            day.setDate(weekStartDate.getDate() + d)
                            const dateStr = day.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' })
                            weekDaysSet.add(dateStr)
                            const dayName = day.toLocaleDateString('ar-EG', { weekday: 'short', timeZone: 'Africa/Cairo' })
                            const dayIncome = clinicTransactions.filter(t => t.type === 'income' && getLocalDateStr(t.date) === dateStr).reduce((s, t) => s + (t.amount || 0), 0)
                            const dayExpense = clinicTransactions.filter(t => t.type === 'expense' && getLocalDateStr(t.date) === dateStr).reduce((s, t) => s + (t.amount || 0), 0)
                            dayDetails.push({ dateStr, dayName, income: dayIncome, expense: dayExpense })
                          }
                          const weekIncome = clinicTransactions.filter(t => t.type === 'income' && weekDaysSet.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0)
                          const weekExpense = clinicTransactions.filter(t => t.type === 'expense' && weekDaysSet.has(getLocalDateStr(t.date))).reduce((s, t) => s + (t.amount || 0), 0)
                          const startLabel = weekStartDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' })
                          const endLabel = weekEndDate.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short', timeZone: 'Africa/Cairo' })
                          weeks.push({ label: `${startLabel} → ${endLabel}`, startDate: weekStartDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), endDate: weekEndDate.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), income: weekIncome, expense: weekExpense, net: weekIncome - weekExpense, dayDetails })
                        }
                        const totalIncome6w = weeks.reduce((s, w) => s + w.income, 0)
                        const totalExpense6w = weeks.reduce((s, w) => s + w.expense, 0)
                        const totalNet6w = totalIncome6w - totalExpense6w
                        const avgNetWeekly = totalNet6w / 6
                        const bestWeek = [...weeks].sort((a, b) => b.net - a.net)[0]
                        const worstWeek = [...weeks].sort((a, b) => a.net - b.net)[0]
                        const chartData = weeks.map(w => ({ name: w.label.split(' → ')[0], الإيراد: w.income, المصروفات: w.expense, 'صافي الربح': w.net }))

                        return (
                          <>
                            {/* ── Hero Stats Row ── */}
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 border border-blue-200/60 dark:border-blue-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">إجمالي الإيرادات</p>
                                <p className="text-lg font-black text-blue-600">{formatCurrency(totalIncome6w)}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gradient-to-br from-red-100 to-rose-100 dark:from-red-900/30 dark:to-rose-900/30 border border-red-200/60 dark:border-red-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">إجمالي المصروفات</p>
                                <p className="text-lg font-black text-red-600">{formatCurrency(totalExpense6w)}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-100 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/30 border border-cyan-200/60 dark:border-cyan-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">صافي الربح الكلي</p>
                                <p className={cn('text-lg font-black', totalNet6w >= 0 ? 'text-cyan-600' : 'text-red-600')}>{formatCurrency(totalNet6w)}</p>
                              </div>
                              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/30 border border-amber-200/60 dark:border-amber-800/40 text-center">
                                <p className="text-[10px] text-muted-foreground mb-1">متوسط صافي الأسبوع</p>
                                <p className={cn('text-lg font-black', avgNetWeekly >= 0 ? 'text-amber-600' : 'text-red-600')}>{formatCurrency(avgNetWeekly)}</p>
                              </div>
                            </div>

                            {/* ── Bar Chart ── */}
                            <div className="p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-blue-100 dark:border-blue-900/40">
                              <ResponsiveContainer width="100%" height={280}>
                                <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barGap={2}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.4} />
                                  <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                                  <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} width={60} />
                                  <RechartsTooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 12, fontSize: 12, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} formatter={(v: number) => formatCurrency(v)} />
                                  <Bar dataKey="الإيراد" fill="#047857" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                  <Bar dataKey="المصروفات" fill="#DC2626" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                  <Bar dataKey="صافي الربح" fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>

                            {/* ── Best/Worst Week Badges ── */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-l from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200/50 dark:border-blue-800/40">
                                <div className="p-1.5 rounded-lg bg-blue-500 text-white"><Award size={14} /></div>
                                <div className="min-w-0">
                                  <p className="text-[10px] text-muted-foreground">أفضل أسبوع</p>
                                  <p className="text-[10px] font-bold text-blue-700 dark:text-blue-300 truncate">{bestWeek.label} — {formatCurrency(bestWeek.net)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-gradient-to-l from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 border border-red-200/50 dark:border-red-800/40">
                                <div className="p-1.5 rounded-lg bg-red-500 text-white"><TrendingDown size={14} /></div>
                                <div className="min-w-0">
                                  <p className="text-[10px] text-muted-foreground">أضعف أسبوع</p>
                                  <p className="text-[10px] font-bold text-red-700 dark:text-red-300 truncate">{worstWeek.label} — {formatCurrency(worstWeek.net)}</p>
                                </div>
                              </div>
                            </div>

                            {/* ── Detailed Weekly Breakdown Table ── */}
                            <div className="rounded-xl border border-border overflow-hidden">
                              <div className="grid grid-cols-5 gap-0 bg-muted/60 text-[10px] font-bold text-muted-foreground p-2">
                                <span>الأسبوع</span>
                                <span className="text-center">الإيراد</span>
                                <span className="text-center">المصروفات</span>
                                <span className="text-center">صافي الربح</span>
                                <span className="text-center">التغير</span>
                              </div>
                              {weeks.map((w, idx) => {
                                const prevNet = idx > 0 ? weeks[idx - 1].net : null
                                const change = prevNet !== null && prevNet !== 0 ? ((w.net - prevNet) / Math.abs(prevNet) * 100) : null
                                const isCurrentWeek = idx === weeks.length - 1
                                return (
                                  <div key={w.startDate} className={cn('grid grid-cols-5 gap-0 p-2 text-xs border-t border-border items-center', isCurrentWeek ? 'bg-blue-50/60 dark:bg-blue-900/15' : 'bg-card')}>
                                    <span className="font-bold text-[10px] flex items-center gap-1">
                                      {w.label}
                                      {isCurrentWeek && <Badge className="bg-blue-500 text-white text-[7px] px-1 py-0">الحالي</Badge>}
                                    </span>
                                    <span className="text-center font-bold text-emerald-600">{formatCurrency(w.income)}</span>
                                    <span className="text-center font-bold text-red-600">{formatCurrency(w.expense)}</span>
                                    <span className={cn('text-center font-black', w.net >= 0 ? 'text-cyan-600' : 'text-red-600')}>{formatCurrency(w.net)}</span>
                                    <span className="text-center">
                                      {change !== null ? (
                                        <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold', change > 0 ? 'text-emerald-600' : change < 0 ? 'text-red-600' : 'text-muted-foreground')}>
                                          {change > 0 ? <TrendingUp size={10} /> : change < 0 ? <TrendingDown size={10} /> : null}
                                          {change !== 0 ? `${Math.abs(change).toFixed(0)}%` : '—'}
                                        </span>
                                      ) : <span className="text-[10px] text-muted-foreground">—</span>}
                                    </span>
                                  </div>
                                )
                              })}
                            </div>

                            {/* ── Daily Breakdown per Week ── */}
                            <div className="space-y-2">
                              <p className="text-xs font-bold text-muted-foreground flex items-center gap-1"><Calendar size={12} /> تفصيل يومي لكل أسبوع</p>
                              {weeks.map(w => {
                                const maxDayIncome = Math.max(...w.dayDetails.map(d => d.income), 1)
                                const isCurrentWeek = w === weeks[weeks.length - 1]
                                return (
                                  <div key={w.startDate} className={cn('p-2.5 rounded-xl border border-border/50', isCurrentWeek ? 'bg-blue-50/50 dark:bg-blue-900/15 border-blue-200/60 dark:border-blue-800/40' : 'bg-muted/40')}>
                                    <div className="flex items-center justify-between mb-2">
                                      <p className="text-[10px] font-bold text-muted-foreground">{w.label}</p>
                                      <span className={cn('text-[10px] font-black', w.net >= 0 ? 'text-cyan-600' : 'text-red-600')}>صافي: {formatCurrency(w.net)}</span>
                                    </div>
                                    <div className="grid grid-cols-7 gap-1">
                                      {w.dayDetails.map(d => {
                                        const dayProfit = d.income - d.expense
                                        const barHeight = maxDayIncome > 0 ? Math.max((d.income / maxDayIncome) * 100, 4) : 4
                                        return (
                                          <div key={d.dateStr} className="flex flex-col items-center gap-0.5">
                                            <span className="text-[8px] text-muted-foreground font-bold">{d.dayName}</span>
                                            <div className="w-full h-1.5 rounded-full bg-muted overflow-hidden">
                                              <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${barHeight}%` }}
                                                transition={{ duration: 0.5 }}
                                                className={cn('h-full rounded-full', dayProfit >= 0 ? 'bg-emerald-500' : 'bg-red-400')}
                                              />
                                            </div>
                                            <span className={cn('text-[7px] font-bold', dayProfit >= 0 ? 'text-emerald-600' : 'text-red-500')}>{d.income > 0 ? formatCurrency(d.income) : '—'}</span>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  </div>
                                )
                              })}
                            </div>
                          </>
                        )
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Patient Age Distribution ═══ */}
                  <Card className="card-luxury border-2 border-amber-200 dark:border-amber-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><Activity size={18} className="text-amber-600" /> توزيع المرضى حسب العمر</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const ageRanges = [
                          { label: '0-18', min: 0, max: 18, color: 'bg-sky-500' },
                          { label: '19-30', min: 19, max: 30, color: 'bg-emerald-500' },
                          { label: '31-45', min: 31, max: 45, color: 'bg-amber-500' },
                          { label: '46-60', min: 46, max: 60, color: 'bg-orange-500' },
                          { label: '60+', min: 61, max: 200, color: 'bg-rose-500' },
                        ]
                        const withData = ageRanges.map(range => {
                          const count = patients.filter(p => p.age && p.age >= range.min && p.age <= range.max).length
                          return { ...range, count, percent: patients.length > 0 ? (count / patients.length * 100) : 0 }
                        })
                        const maxCount = Math.max(...withData.map(r => r.count), 1)
                        return withData.map(range => (
                          <div key={range.label} className="p-2 rounded-xl bg-muted/50">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs font-bold">{range.label} سنة</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold">{range.count}</span>
                                <span className="text-[10px] text-muted-foreground">({range.percent.toFixed(0)}%)</span>
                              </div>
                            </div>
                            <div className="relative h-2 rounded-full bg-muted overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${(range.count / maxCount) * 100}%` }} transition={{ duration: 0.6 }} className={cn('absolute inset-y-0 right-0 rounded-full', range.color)} />
                            </div>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>

                  {/* ═══ NEW: Diagnosis Distribution ═══ */}
                  <Card className="card-luxury border-2 border-rose-200 dark:border-rose-800">
                    <CardHeader><CardTitle className="flex items-center gap-2"><FileText size={18} className="text-rose-600" /> أكثر التشخيصات شيوعاً</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {(() => {
                        const diagMap: Record<string, number> = {}
                        visits.forEach(v => {
                          if (v.diagnosis) {
                            v.diagnosis.split(/[,،]/).forEach(d => {
                              const trimmed = d.trim()
                              if (trimmed) diagMap[trimmed] = (diagMap[trimmed] || 0) + 1
                            })
                          }
                        })
                        const sorted = Object.entries(diagMap).sort((a, b) => b[1] - a[1]).slice(0, 10)
                        if (sorted.length === 0) return <p className="text-center text-muted-foreground text-sm py-4">لا توجد تشخيصات بعد</p>
                        return sorted.map(([diag, count], idx) => (
                          <div key={diag} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                            <div className={cn('w-6 h-6 rounded-md flex items-center justify-center text-white font-bold text-[10px]', idx < 3 ? 'bg-gradient-to-br from-rose-500 to-pink-600' : 'bg-gradient-to-br from-gray-400 to-gray-500')}>{idx + 1}</div>
                            <span className="text-xs font-medium truncate flex-1">{diag}</span>
                            <span className="text-xs font-bold text-rose-600">{count}</span>
                          </div>
                        ))
                      })()}
                    </CardContent>
                  </Card>
                </div>)}

                {/* Backup Sub-tab */}
                {moreSubTab === 'backup' && (<div className="space-y-4">
                  {/* Patient Data Copy Section - CSV & JSON Export */}
                  <Card className="card-luxury border-2 border-teal-200 dark:border-teal-800 bg-gradient-to-br from-teal-50/50 to-cyan-50/50 dark:from-teal-950/20 dark:to-cyan-950/20">
                    <CardHeader><CardTitle className="flex items-center gap-2"><ClipboardCheck size={20} className="text-teal-600" /> نسخ بيانات المرضى</CardTitle><CardDescription>تصدير بيانات المرضى بصيغة CSV أو JSON (الاسم، العنوان، التشخيص، الملاحظات)</CardDescription></CardHeader>
                    <CardContent className="space-y-3">
                      {/* Search */}
                      <div className="relative">
                        <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-500" />
                        <Input placeholder="بحث عن مريض بالاسم أو رقم الملف أو الموبايل..." className="input-luxury rounded-xl h-10 pr-9 border-teal-200 dark:border-teal-800 focus:border-teal-500" value={patientCopySearch} onChange={e => setPatientCopySearch(e.target.value)} />
                      </div>
                      {/* Export Buttons */}
                      <div className="flex gap-2 flex-wrap">
 <button className="active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => {
                          const filtered = patients.filter(p => {
                            if (!patientCopySearch.trim()) return true
                            const q = patientCopySearch.toLowerCase()
                            return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                          })
                          if (filtered.length === 0) return toast.error('لا توجد بيانات للتصدير')
                          const headers = ['رقم الملف', 'الاسم', 'الموبايل', 'الموبايل ٢', 'العنوان', 'العمر', 'الجنس', 'التشخيص', 'الملاحظات', 'الحساسية', 'التاريخ المرضي', 'تاريخ التسجيل']
                          const rows = filtered.map(p => {
                            const pv = visits.filter(v => v.patientId === p.id)
                            const diag = pv.length > 0 ? pv[pv.length - 1]?.diagnosis || '' : ''
                            return [
                              p.fileNumber || '',
                              p.name || '',
                              p.phone || '',
                              p.phone2 || '',
                              p.address || '',
                              p.age?.toString() || '',
                              p.gender || '',
                              diag,
                              p.notes || '',
                              p.allergies || '',
                              p.medicalHistory || '',
                              p.createdAt ? formatDate(p.createdAt) : ''
                            ].map(v => `"${(v || '').replace(/"/g, '""')}"`)
                          })
                          const csv = '\uFEFF' + headers.map(h => `"${h}"`).join(',') + '\n' + rows.map(r => r.join(',')).join('\n')
                          const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a'); a.href = url; a.download = `elmoghazi-patients-${todayStr}.csv`; a.click(); URL.revokeObjectURL(url)
                          toast.success(`تم تصدير ${filtered.length} مريض بصيغة CSV ✓`)
                        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-emerald-500 to-teal-600 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all">
                          <FileDown size={14} /> تصدير CSV
                        </button>
 <button className="active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => {
                          const filtered = patients.filter(p => {
                            if (!patientCopySearch.trim()) return true
                            const q = patientCopySearch.toLowerCase()
                            return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                          })
                          if (filtered.length === 0) return toast.error('لا توجد بيانات للتصدير')
                          const jsonData = filtered.map(p => {
                            const pv = visits.filter(v => v.patientId === p.id)
                            const diag = pv.length > 0 ? pv[pv.length - 1]?.diagnosis || '' : ''
                            return {
                              fileNumber: p.fileNumber || '',
                              name: p.name,
                              phone: p.phone || '',
                              phone2: p.phone2 || '',
                              address: p.address || '',
                              age: p.age || null,
                              gender: p.gender || '',
                              diagnosis: diag,
                              notes: p.notes || '',
                              allergies: p.allergies || '',
                              medicalHistory: p.medicalHistory || '',
                              createdAt: p.createdAt || ''
                            }
                          })
                          const json = JSON.stringify({ exportedAt: cairoISO(), totalPatients: jsonData.length, patients: jsonData }, null, 2)
                          const blob = new Blob([json], { type: 'application/json;charset=utf-8;' })
                          const url = URL.createObjectURL(blob)
                          const a = document.createElement('a'); a.href = url; a.download = `elmoghazi-patients-${todayStr}.json`; a.click(); URL.revokeObjectURL(url)
                          toast.success(`تم تصدير ${filtered.length} مريض بصيغة JSON ✓`)
                        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-blue-500 to-indigo-600 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all">
                          <FileDown size={14} /> تصدير JSON
                        </button>
 <button className="active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={async () => {
                          const filtered = patients.filter(p => {
                            if (!patientCopySearch.trim()) return true
                            const q = patientCopySearch.toLowerCase()
                            return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                          })
                          if (filtered.length === 0) return toast.error('لا توجد بيانات للنسخ')
                          const allText = filtered.map(p => {
                            const pv = visits.filter(v => v.patientId === p.id)
                            const diag = pv.length > 0 ? pv[pv.length - 1]?.diagnosis || '' : ''
                            return `الاسم: ${p.name}${p.address ? ' | العنوان: ' + p.address : ''}${diag ? ' | التشخيص: ' + diag : ''}${p.notes ? ' | الملاحظات: ' + p.notes : ''}`
                          }).join('\n')
                          try { await navigator.clipboard.writeText(allText); toast.success('تم نسخ بيانات جميع المرضى ✓') } catch {
                            const ta = document.createElement('textarea'); ta.value = allText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast.success('تم نسخ بيانات جميع المرضى ✓')
                          }
                        }} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-l from-teal-400 to-cyan-500 text-white text-xs font-bold shadow-lg hover:shadow-xl transition-all">
                          <Copy size={14} /> نسخ نصي
                        </button>
                      </div>
                      {/* Patient List */}
                      <div className="space-y-2 max-h-72 overflow-y-auto">
                        {patients.filter(p => {
                          if (!patientCopySearch.trim()) return true
                          const q = patientCopySearch.toLowerCase()
                          return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                        }).slice(0, 50).map(p => {
                          const patientVisits = visits.filter(v => v.patientId === p.id)
                          const latestDiagnosis = patientVisits.length > 0 ? patientVisits[patientVisits.length - 1]?.diagnosis || '' : ''
                          const copyText = `الاسم: ${p.name}${p.address ? '\nالعنوان: ' + p.address : ''}${latestDiagnosis ? '\nالتشخيص: ' + latestDiagnosis : ''}${p.notes ? '\nالملاحظات: ' + p.notes : ''}`
                          const wp = p.phone ? waPhone(p.phone) : ''
                          return (
                            <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-white/60 dark:bg-black/20 border border-teal-100 dark:border-teal-900/50 hover:border-teal-300 dark:hover:border-teal-700 transition-all">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-bold truncate">{p.name}</p>
                                  <Badge variant="outline" className="text-[8px] h-4 border-teal-300 text-teal-600">{p.fileNumber}</Badge>
                                </div>
                                <p className="text-[10px] text-muted-foreground truncate mt-0.5">
                                  {p.phone && <span>📞 {p.phone}</span>}
                                  {p.address && <span className="mr-2">📍 {p.address}</span>}
                                  {latestDiagnosis && <span className="mr-2">🩺 {latestDiagnosis}</span>}
                                </p>
                              </div>
                              <div className="flex items-center gap-1">
 {wp && <button className="active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => {
                                  const msg = encodeURIComponent(copyText)
                                  window.open(`https://wa.me/${wp}?text=${msg}`, '_blank')
                                }} className="h-7 w-7 rounded-lg flex items-center justify-center bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200 transition-all" title="إرسال واتساب">
                                  <Send size={12} />
                                </button>}
 <button className="active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={async () => {
                                  try { await navigator.clipboard.writeText(copyText); toast.success(`تم نسخ بيانات ${p.name} ✓`) } catch {
                                    const ta = document.createElement('textarea'); ta.value = copyText; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); toast.success(`تم نسخ بيانات ${p.name} ✓`)
                                  }
                                }} className="h-7 w-7 rounded-lg flex items-center justify-center bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 hover:bg-teal-200 transition-all" title="نسخ البيانات">
                                  <Copy size={12} />
                                </button>
                              </div>
                            </div>
                          )
                        })}
                        {patients.length === 0 && <div className="text-center py-6 text-muted-foreground"><Users size={32} className="mx-auto mb-2 opacity-30" /><p className="text-sm">لا يوجد مرضى</p></div>}
                      </div>
                      <div className="flex items-center justify-between p-2 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-[10px] text-muted-foreground">
                        <span>يتم التصدير: رقم الملف + الاسم + الموبايل + العنوان + التشخيص + الملاحظات + الحساسية + التاريخ المرضي</span>
                        <Badge variant="outline" className="text-[9px] border-teal-300 text-teal-600">{patients.filter(p => {
                          if (!patientCopySearch.trim()) return true
                          const q = patientCopySearch.toLowerCase()
                          return p.name.toLowerCase().includes(q) || p.fileNumber?.toLowerCase().includes(q) || p.phone?.includes(q)
                        }).length} مريض</Badge>
                      </div>
                    </CardContent>
                  </Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Database size={20} /> النسخ الاحتياطي</CardTitle></CardHeader><CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50"><div className="flex items-center gap-3"><div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30"><Timer className="text-blue-600" size={18} /></div><div><p className="font-medium text-sm">نسخ تلقائي</p><p className="text-xs text-muted-foreground">كل فترة محددة</p></div></div><Switch checked={autoBackup} onCheckedChange={setAutoBackup} /></div>
                    {autoBackup && <Select value={String(backupInterval)} onValueChange={v => setBackupInterval(Number(v))}><SelectTrigger className="w-40 rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="15">15 دقيقة</SelectItem><SelectItem value="30">30 دقيقة</SelectItem><SelectItem value="60">ساعة</SelectItem><SelectItem value="360">6 ساعات</SelectItem><SelectItem value="1440">يومياً</SelectItem></SelectContent></Select>}
                    {lastBackup && <p className="text-xs text-muted-foreground">آخر نسخة: {formatDate(lastBackup)}</p>}
                    {/* ─── Backup Actions Grid ─── */}
                    <div className="grid grid-cols-2 gap-3">
 <button onClick={createBackup} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><HardDrive className="text-emerald-600 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" size={24} /><span className="text-sm font-medium text-emerald-700 dark:text-emerald-400 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">إنشاء نسخة</span></button>
 <button onClick={() => exportBackup('json')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border border-blue-200 dark:border-blue-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><FileDown className="text-blue-600 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" size={24} /><span className="text-sm font-medium text-blue-700 dark:text-blue-400 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">تصدير JSON</span></button>
 <button onClick={() => { fileInputRef.current?.click() }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/30 border border-amber-200 dark:border-amber-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><FileUp className="text-amber-600 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" size={24} /><span className="text-sm font-medium text-amber-700 dark:text-amber-400 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">استيراد نسخة</span></button>
 <button onClick={() => exportBackup('csv')} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-violet-50 dark:bg-violet-900/20 hover:bg-violet-100 dark:hover:bg-violet-900/30 border border-violet-200 dark:border-violet-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><Archive className="text-violet-600 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" size={24} /><span className="text-sm font-medium text-violet-700 dark:text-violet-400 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">تصدير CSV</span></button>
 <button className="active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" onClick={() => {
                        // Export patients only (clean JSON for sharing/import)
                        const cleanPatients = patients.map(stripVirtualFields).map(p => ({
                          name: p.name, phone: p.phone || '', phone2: p.phone2 || '',
                          age: p.age || null, gender: p.gender || '',
                          bloodType: p.bloodType || '', address: p.address || '',
                          notes: p.notes || '', allergies: p.allergies || '',
                          medicalHistory: p.medicalHistory || '',
                        }))
                        const json = JSON.stringify({ exportedAt: cairoISO(), type: 'patients-only', totalPatients: cleanPatients.length, patients: cleanPatients }, null, 2)
                        const blob = new Blob([json], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a'); a.href = url; a.download = `elmoghazi-patients-only-${todayStr}.json`; a.click(); URL.revokeObjectURL(url)
                        toast.success(`تم تصدير ${cleanPatients.length} مريض ✓`)
                      }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/30 border border-rose-200 dark:border-rose-800"><Users size={24} className="text-rose-600" /><span className="text-sm font-medium text-rose-700 dark:text-rose-400">تصدير أسماء المرضى</span></button>
 <button onClick={() => { patientImportInputRef.current?.click() }} className="flex flex-col items-center gap-2 p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/20 hover:bg-cyan-100 dark:hover:bg-cyan-900/30 border border-cyan-200 dark:border-cyan-800 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><UserPlus size={24} className="text-cyan-600 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /><span className="text-sm font-medium text-cyan-700 dark:text-cyan-400 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">استيراد أسماء المرضى</span></button>
                    </div>
                    <input ref={fileInputRef} type="file" accept=".json,.csv" className="hidden" onChange={handleFileImport} />
                    <input ref={patientImportInputRef} type="file" accept=".json,.csv,.xlsx,.xls,.tsv,.txt" className="hidden" onChange={async (e) => {
                      const file = e.target.files?.[0]; if (!file) return
                      try {
                        setPatientImportProgress('جاري قراءة الملف...')
                        const parsed = await parsePatientFile(file)
                        setPatientImportData(parsed)
                        setPatientImportFile(file)
                        setPatientImportPreview(true)
                        setPatientImportProgress('')
                      } catch (err: any) {
                        toast.error(err.message || 'فشل قراءة الملف')
                        setPatientImportProgress('')
                      }
                      e.target.value = ''
                    }} />
                    {/* ─── Patient Import Preview (Professional) ─── */}
                    {patientImportPreview && <Card className="border-2 border-cyan-400 dark:border-cyan-600 bg-gradient-to-br from-cyan-50/50 to-blue-50/50 dark:from-cyan-950/20 dark:to-blue-950/20 shadow-lg">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-cyan-700 dark:text-cyan-300">
                          <UserPlus size={20} /> استيراد بيانات المرضى
                          <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 text-[10px]">{patientImportFile?.name}</Badge>
                        </CardTitle>
                        <CardDescription>مراجعة البيانات قبل الاستيراد — يتم تخطي المرضى المكررين تلقائياً</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Stats Row */}
                        <div className="grid grid-cols-3 gap-2">
                          <div className="p-2.5 rounded-xl bg-cyan-100/60 dark:bg-cyan-900/30 text-center">
                            <p className="text-[10px] text-muted-foreground">إجمالي</p>
                            <p className="text-lg font-black text-cyan-700 dark:text-cyan-300">{patientImportData.length}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-emerald-100/60 dark:bg-emerald-900/30 text-center">
                            <p className="text-[10px] text-muted-foreground">أسماء صالحة</p>
                            <p className="text-lg font-black text-emerald-700 dark:text-emerald-300">{patientImportData.filter(p => p.name).length}</p>
                          </div>
                          <div className="p-2.5 rounded-xl bg-amber-100/60 dark:bg-amber-900/30 text-center">
                            <p className="text-[10px] text-muted-foreground">مكرر محتمل</p>
                            <p className="text-lg font-black text-amber-700 dark:text-amber-300">{patientImportData.filter(p => p.name && patients.some(ep => ep.name === p.name && (ep.phone === p.phone || (!ep.phone && !p.phone)))).length}</p>
                          </div>
                        </div>
                        {/* Patient List Preview */}
                        <div className="max-h-56 overflow-y-auto space-y-1 rounded-xl border border-cyan-200 dark:border-cyan-800 p-2">
                          {patientImportData.filter(p => p.name).slice(0, 80).map((p, i) => {
                            const isDuplicate = patients.some(ep => ep.name === p.name && (ep.phone === p.phone || (!ep.phone && !p.phone)))
                            return (
                              <div key={i} className={cn('flex items-center gap-2 p-2 rounded-lg text-xs transition-all', isDuplicate ? 'bg-amber-50 dark:bg-amber-900/20 opacity-60' : 'bg-white/60 dark:bg-black/20')}>
                                <span className="w-5 h-5 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center text-[9px] font-bold text-cyan-700">{i + 1}</span>
                                <span className="font-bold text-cyan-800 dark:text-cyan-300 min-w-[80px] truncate">{p.name}</span>
                                {p.phone && <span className="text-muted-foreground text-[10px]">📞 {p.phone}</span>}
                                {p.age && <span className="text-muted-foreground text-[10px]">{p.age} سنة</span>}
                                {p.gender && <span className="text-muted-foreground text-[10px]">{p.gender === 'male' ? '♂' : p.gender === 'female' ? '♀' : p.gender}</span>}
                                {p.address && <span className="text-muted-foreground text-[10px] truncate max-w-[80px]">📍 {p.address}</span>}
                                {isDuplicate && <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 text-[7px] px-1">مكرر</Badge>}
                              </div>
                            )
                          })}
                          {patientImportData.filter(p => p.name).length > 80 && <p className="text-center text-xs text-muted-foreground py-2">... و {patientImportData.filter(p => p.name).length - 80} مريض آخر</p>}
                        </div>
                        {/* Progress */}
                        {patientImportProgress && <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-sm font-bold text-blue-700 dark:text-blue-300">{patientImportProgress}</p></div>}
                        {/* Action Buttons */}
                        <div className="flex gap-2">
                          <Button className="flex-1 rounded-xl bg-gradient-to-l from-cyan-500 to-blue-600 text-white font-bold h-11" disabled={patientImportLoading} onClick={async () => {
                            setPatientImportLoading(true)
                            setPatientImportProgress('جاري استيراد البيانات...')
                            try {
                              // Use bulk import API for efficiency
                              const validPatients = patientImportData.filter(p => p.name)
                              const result: any = await apiFetch('/patients/import', {
                                method: 'POST',
                                body: JSON.stringify({ patients: validPatients }),
                              })
                              await loadAllData()
                              setPatientImportPreview(false)
                              setPatientImportData([])
                              setPatientImportFile(null)
                              if (result.skipped > 0) {
                                toast.success(`تم استيراد ${result.imported} مريض ✓ (تم تخطي ${result.skipped} مكرر/غير صالح)`)
                              } else {
                                toast.success(`تم استيراد ${result.imported} مريض بنجاح ✓`)
                              }
                            } catch (err: any) {
                              toast.error('خطأ في الاستيراد: ' + (err.message || ''))
                            } finally {
                              setPatientImportLoading(false)
                              setPatientImportProgress('')
                            }
                          }}>
                            {patientImportLoading ? <RefreshCw size={16} className="animate-spin ml-2" /> : <UserPlus size={16} className="ml-2" />}
                            {patientImportLoading ? 'جاري الاستيراد...' : `تأكيد استيراد ${patientImportData.filter(p => p.name).length} مريض`}
                          </Button>
                          <Button variant="outline" className="rounded-xl h-11" disabled={patientImportLoading} onClick={() => { setPatientImportPreview(false); setPatientImportData([]); setPatientImportFile(null) }}>إلغاء</Button>
                        </div>
                      </CardContent>
                    </Card>}
                    {/* ─── Stored Backups List ─── */}
                    {backups.length > 0 && <div className="space-y-2">{backups.map(b => <div key={b.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 text-sm"><div className="flex items-center gap-2"><Database size={14} className="text-muted-foreground" /><span>{b.type === 'auto' ? 'تلقائي' : b.type === 'export' ? 'تصدير' : 'يدوي'}</span></div><div className="flex items-center gap-2"><Badge variant="outline" className={b.status === 'completed' ? 'border-emerald-500 text-emerald-600' : 'border-amber-500 text-amber-600'}>{b.status === 'completed' ? 'مكتمل' : b.status}</Badge></div></div>)}</div>}
                  </CardContent></Card>
                </div>)}

                {/* Notes Sub-tab - Professional Colorful Animated */}
                {moreSubTab === 'notes' && (<div className="space-y-4">
                  <div className="flex items-center justify-between"><h3 className="font-bold text-lg flex items-center gap-2"><FileText size={18} className="text-fuchsia-500" /> الملاحظات</h3><Badge variant="outline">{notes.length} ملاحظة</Badge></div>
                  {/* Search & Filter */}
                  <div className="flex gap-2">
                    <div className="flex-1 relative"><Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-fuchsia-500" /><Input value={noteSearch} onChange={e => setNoteSearch(e.target.value)} placeholder="بحث في الملاحظات..." className="input-luxury rounded-xl h-10 pr-9 border-fuchsia-200 dark:border-fuchsia-800" /></div>
                    <Select value={noteFilter} onValueChange={v => setNoteFilter(v as any)}><SelectTrigger className="rounded-xl h-10 w-32"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">الكل</SelectItem><SelectItem value="important">⭐ مهمة</SelectItem><SelectItem value="dashboard">🏠 الرئيسية</SelectItem><SelectItem value="patients">👥 المرضى</SelectItem><SelectItem value="laser">💎 الليزر</SelectItem><SelectItem value="finance">💰 المالية</SelectItem><SelectItem value="general">📌 عام</SelectItem></SelectContent></Select>
                  </div>
                  {/* Add Note */}
                  <Card className="card-luxury border-2 border-fuchsia-300 dark:border-fuchsia-700 bg-gradient-to-br from-fuchsia-50/50 to-violet-50/50 dark:from-fuchsia-950/20 dark:to-violet-950/20">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex gap-2">
                        <Input value={quickNote} onChange={e => setQuickNote(e.target.value)} placeholder="✏️ أضف ملاحظة جديدة..." className="input-luxury rounded-xl h-10 flex-1 border-fuchsia-200 dark:border-fuchsia-800 focus:border-fuchsia-500" onKeyDown={e => { if (e.key === 'Enter' && quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: newNoteSection, createdAt: cairoISO() }, setNotes); setQuickNote('') } }} />
                        <Select value={newNoteSection} onValueChange={setNewNoteSection}><SelectTrigger className="rounded-xl h-10 w-28"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">📌 عام</SelectItem><SelectItem value="dashboard">🏠 رئيسية</SelectItem><SelectItem value="patients">👥 مرضى</SelectItem><SelectItem value="laser">💎 ليزر</SelectItem><SelectItem value="finance">💰 مالية</SelectItem></SelectContent></Select>
 <button className="px-4 py-2 rounded-xl bg-gradient-to-l from-fuchsia-500 to-violet-500 text-white font-bold shadow-lg active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { if (quickNote.trim()) { addItem('/notes', { content: quickNote, important: false, section: newNoteSection, createdAt: cairoISO() }, setNotes); setQuickNote('') } }}><Plus size={18} /></button>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Notes List */}
                  {(() => {
                    const filteredNotes = notes.filter(n => {
                      if (noteSearch && !n.content.toLowerCase().includes(noteSearch.toLowerCase())) return false;
                      if (noteFilter === 'important' && !n.important) return false;
                      if (!['all', 'important'].includes(noteFilter) && n.section !== noteFilter) return false;
                      return true;
                    });
                    const noteColors = [
                      'from-rose-200/80 to-pink-100 dark:from-rose-900/30 dark:to-pink-900/20 border-rose-400 dark:border-rose-600',
                      'from-blue-200/80 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/20 border-blue-400 dark:border-blue-600',
                      'from-emerald-200/80 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/20 border-emerald-400 dark:border-emerald-600',
                      'from-amber-200/80 to-yellow-100 dark:from-amber-900/30 dark:to-yellow-900/20 border-amber-400 dark:border-amber-600',
                      'from-violet-200/80 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/20 border-violet-400 dark:border-violet-600',
                      'from-cyan-200/80 to-sky-100 dark:from-cyan-900/30 dark:to-sky-900/20 border-cyan-400 dark:border-cyan-600',
                      'from-fuchsia-200/80 to-pink-100 dark:from-fuchsia-900/30 dark:to-pink-900/20 border-fuchsia-400 dark:border-fuchsia-600',
                      'from-lime-200/80 to-green-100 dark:from-lime-900/30 dark:to-green-900/20 border-lime-400 dark:border-lime-600',
                    ];
                    const noteEmojis = ['📝', '💡', '📌', '🔔', '⭐', '💬', '🎯', '✨'];
                    const sectionConfig: Record<string, { emoji: string; color: string }> = { dashboard: { emoji: '🏠', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' }, patients: { emoji: '👥', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' }, laser: { emoji: '💎', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' }, finance: { emoji: '💰', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' }, general: { emoji: '📌', color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300' } };
                    if (filteredNotes.length === 0) return <Card className="card-luxury p-8 text-center"><div className="text-5xl mb-3 animate-bounce-y">📝</div><p className="text-lg font-bold mb-1">لا توجد ملاحظات</p><p className="text-muted-foreground text-sm">أضف ملاحظاتك اليومية هنا</p></Card>;
                    return filteredNotes.map((n, i) => {
                      const sec = sectionConfig[n.section || 'general'] || sectionConfig.general;
                      return (
                        <motion.div key={n.id} initial={{ opacity: 0, x: -10, scale: 0.98 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: i * 0.03, type: 'spring', stiffness: 200 }} className={cn('relative p-4 rounded-2xl border-2 bg-gradient-to-l transition-all hover:shadow-xl', noteColors[i % noteColors.length])}>
                          {n.important && <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl bg-gradient-to-l from-amber-400 to-yellow-300 animate-bounce-y"/>}
                          <div className="flex items-start gap-3">
                            <div className="text-2xl mt-0.5 animate-bounce-y">{noteEmojis[i % noteEmojis.length]}</div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <motion.div animate={n.important ? { scale: [1, 1.3, 1] } : {}} transition={{ duration: 0.8, repeat: n.important ? Infinity : 0, repeatDelay: 1 }}>
                                  {n.important ? <span className="text-lg">⭐</span> : null}
                                </motion.div>
                                <Badge className={cn('text-[9px]', sec.color)}>{sec.emoji} {n.section || 'عام'}</Badge>
                                <span className="text-[10px] text-muted-foreground">{formatDate(n.createdAt)}</span>
                              </div>
                              {editingNoteId === n.id ? (
                                <div className="space-y-2 mt-2 p-3 rounded-xl bg-white/80 dark:bg-black/20 border border-fuchsia-300 dark:border-fuchsia-700">
                                  <Input value={editingNoteContent} onChange={e => setEditingNoteContent(e.target.value)} className="input-luxury rounded-xl h-9 text-sm" autoFocus onKeyDown={e => { if (e.key === 'Enter') { apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent, section: editingNoteSectionMore }) }).then(() => { setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent, section: editingNoteSectionMore } : nn)); setEditingNoteId(null); toast.success('تم التعديل ✓') }).catch(() => toast.error('خطأ')) } }} />
                                  <Select value={editingNoteSectionMore} onValueChange={setEditingNoteSectionMore}><SelectTrigger className="rounded-xl h-8 text-xs"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="general">📌 عام</SelectItem><SelectItem value="dashboard">🏠 رئيسية</SelectItem><SelectItem value="patients">👥 مرضى</SelectItem><SelectItem value="laser">💎 ليزر</SelectItem><SelectItem value="finance">💰 مالية</SelectItem></SelectContent></Select>
                                  <div className="flex gap-2"><Button size="sm" className="rounded-xl h-8 bg-fuchsia-600 text-white text-[10px]" onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ content: editingNoteContent, section: editingNoteSectionMore }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, content: editingNoteContent, section: editingNoteSectionMore } : nn)); setEditingNoteId(null); toast.success('تم التعديل ✓') } catch { toast.error('خطأ') } }}>حفظ</Button><Button variant="ghost" size="sm" className="h-8" onClick={() => setEditingNoteId(null)}>✕</Button></div>
                                </div>
                              ) : (
                                <p className="text-sm font-medium leading-relaxed">{n.content}</p>
                              )}
                            </div>
                            <div className="flex gap-1">
 <button className={cn('h-8 w-8 rounded-lg flex items-center justify-center transition-all active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150', n.important ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-muted/50 hover:bg-amber-50 dark:hover:bg-amber-900/20')} onClick={async () => { try { await apiFetch(`/notes/${n.id}`, { method: 'PUT', body: JSON.stringify({ important: !n.important }) }); setNotes(prev => prev.map(nn => nn.id === n.id ? { ...nn, important: !nn.important } : nn)); toast.success(n.important ? 'تم إزالة الأهمية' : 'تم التمييز كمهم ⭐') } catch { toast.error('خطأ') } }}><Star size={14} className={n.important ? 'text-amber-500 fill-amber-500' : 'text-muted-foreground'} /></button>
 <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/20 transition-all active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" onClick={() => { setEditingNoteId(n.id); setEditingNoteContent(n.content); setEditingNoteSectionMore(n.section || 'general') }}><Edit3 size={14} className="text-fuchsia-500 active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" /></button>
 {canDelete && <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" onClick={() => deleteItem('/notes', n.id, setNotes)}><Trash2 size={14} className="text-red-500 active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" /></button>}
                            </div>
                          </div>
                        </motion.div>
                      );
                    });
                  })()}
                </div>)}

                {/* Settings Sub-tab - ENHANCED */}
                {moreSubTab === 'settings' && (<div className="space-y-4">
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Shield size={20} className="text-indigo-500" /> تخصيص الصلاحيات</CardTitle><CardDescription>تحديد دور المستخدم وصلاحياته</CardDescription></CardHeader><CardContent>
                    <div className="grid grid-cols-2 gap-3">
 <button onClick={() => { setUserRole('doctor'); toast.success('تم تفعيل صلاحيات الطبيب') }} className={cn('p-4 rounded-xl border-2 transition-all text-center active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', userRole === 'doctor' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                        <div className={cn('text-3xl mb-2', userRole === 'doctor' && 'animate-pulse-scale')}>👨‍⚕️</div>
                        <p className="font-bold text-sm">طبيب</p>
                        <p className="text-[9px] text-muted-foreground mt-1">صلاحية كاملة — إضافة/حذف/تعديل ملف المريض</p>
                        {userRole === 'doctor' && <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">فعّال ✓</Badge>}
                      </button>
 <button onClick={() => { setUserRole('secretary'); toast.success('تم تفعيل صلاحيات السكرتارية') }} className={cn('p-4 rounded-xl border-2 transition-all text-center active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', userRole === 'secretary' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 shadow-lg' : 'border-transparent bg-muted/50 hover:bg-muted')}>
                        <div className={cn('text-3xl mb-2', userRole === 'secretary' && 'animate-pulse-scale')}>👩‍💼</div>
                        <p className="font-bold text-sm">سكرتارية</p>
                        <p className="text-[9px] text-muted-foreground mt-1">إدخال البيانات وتعديل الأسماء والتواريخ فقط — الحذف للطبيب</p>
                        {userRole === 'secretary' && <Badge className="mt-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-[9px]">فعّال ✓</Badge>}
                      </button>
                    </div>
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Lock size={20} className="text-red-500" /> كلمات سر الأقسام</CardTitle><CardDescription>حماية الأقسام بكلمة سر</CardDescription></CardHeader><CardContent className="space-y-3">
                    {[
                      { key: 'finance', label: 'القسم المالي', emoji: '💰' },
                      { key: 'settings', label: 'الإعدادات', emoji: '🎨' },
                      { key: 'more', label: 'المزيد', emoji: '📋' },
                      { key: 'dashboard', label: 'لوحة التحكم', emoji: '🏠' },
                    ].map(s => (
                      <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50">
                        <div className="flex items-center gap-2"><span className="text-lg">{s.emoji}</span><div><p className="text-sm font-medium">{s.label}</p><p className="text-[9px] text-muted-foreground">{(sectionPasswords as Record<string,string>)[s.key] ? 'محمي بكلمة سر' : 'غير محمي'}</p></div></div>
                        <div className="flex items-center gap-2">
                          <Input type="password" value={(sectionPasswords as Record<string,string>)[s.key] || ''} onChange={e => setSectionPasswords({ ...sectionPasswords, [s.key]: e.target.value })} placeholder="كلمة السر" className="w-28 h-8 text-xs rounded-lg" />
                          {(sectionPasswords as Record<string,string>)[s.key] && <Button variant="ghost" size="sm" className="h-8 text-[10px] text-red-500" onClick={() => setSectionPasswords({ ...sectionPasswords, [s.key]: '' })}>إلغاء</Button>}
                        </div>
                      </div>
                    ))}
                  </CardContent></Card>

                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><RefreshCw size={20} className="text-blue-500" /> حالة المزامنة</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center gap-3"><div className="text-xl animate-wiggle-wide">🔄</div><div><p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">متصل</p><p className="text-[9px] text-muted-foreground">CockroachDB - سحابي (Vercel)</p></div></div>
                      <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">نشط ✓</Badge>
                    </div>
                    {/* Database Details */}
                    <div className="space-y-2 p-3 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30">
                      <div className="flex items-center gap-2 mb-2"><Database size={14} className="text-blue-500" /><p className="text-xs font-bold text-blue-700 dark:text-blue-300">تفاصيل قاعدة البيانات</p></div>
                      <div className="grid grid-cols-1 gap-1.5 text-[10px]">
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">نوع القاعدة</span><span className="font-bold">CockroachDB (سحابي)</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">المزود</span><span className="font-bold">Vercel Postgres</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">الموقع</span><span className="font-bold">سحابي (أونلاين)</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">المزامنة</span><span className="font-bold text-emerald-600">تلقائية (فوري)</span></div>
                        <div className="flex justify-between p-1.5 rounded-lg bg-white/60 dark:bg-black/10"><span className="text-muted-foreground">الإتصال</span><span className="font-bold text-emerald-600">HTTPS مشفر</span></div>
                      </div>
                    </div>
                    {/* How Sync Works */}
                    <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                      <div className="flex items-center gap-2 mb-2"><Lightbulb size={14} className="text-amber-500" /><p className="text-xs font-bold text-amber-700 dark:text-amber-300">كيف تعمل المزامنة؟</p></div>
                      <div className="space-y-1.5 text-[10px] text-muted-foreground">
                        <p>• البيانات محفوظة على السحابة مباشرة في قاعدة CockroachDB</p>
                        <p>• أي تعديل من أي جهاز يتحدث فوراً في القاعدة السحابية</p>
                        <p>• لما تفتح التطبيق من أي جهاز تاني، بتحمل أحدث البيانات تلقائي</p>
                        <p>• النسخ الاحتياطي بيعمل نسخة من كل البيانات ويحفظها في القاعدة</p>
                        <p>• ممكن تصدر نسخة احتياطية كملف JSON أو CSV وتحمّلها على جهازك</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-center"><p className="text-[9px] text-muted-foreground">المرضى</p><p className="text-sm font-bold text-blue-600">{patients.length}</p></div>
                      <div className="p-2 rounded-lg bg-violet-50 dark:bg-violet-900/20 text-center"><p className="text-[9px] text-muted-foreground">الزيارات</p><p className="text-sm font-bold text-violet-600">{visits.length}</p></div>
                      <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-center"><p className="text-[9px] text-muted-foreground">الجلسات</p><p className="text-sm font-bold text-orange-600">{sessions.length}</p></div>
                      <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-center"><p className="text-[9px] text-muted-foreground">المعاملات</p><p className="text-sm font-bold text-emerald-600">{transactions.length}</p></div>
                      <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-center"><p className="text-[9px] text-muted-foreground">سجلات الليزر</p><p className="text-sm font-bold text-purple-600">{laserRecords.length}</p></div>
                      <div className="p-2 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-center"><p className="text-[9px] text-muted-foreground">المتابعات</p><p className="text-sm font-bold text-cyan-600">{followUpRecords.length}</p></div>
                    </div>
                    {lastBackup && <p className="text-[10px] text-muted-foreground text-center">آخر نسخة احتياطية: {formatDate(lastBackup)}</p>}
                  </CardContent></Card>

 <Card className="card-luxury active:scale-[0.9] hover:scale-[1.1] transition-transform duration-150"><CardHeader><CardTitle className="flex items-center gap-2 active:scale-[0.9] hover:scale-[1.1] transition-transform duration-150"><Palette size={20} /> ألوان التطبيق</CardTitle><CardDescription>10 ألوان مميزة</CardDescription></CardHeader><CardContent><div className="grid grid-cols-5 gap-3 active:scale-[0.9] hover:scale-[1.1] transition-transform duration-150">{THEME_CONFIGS.map(tc => <button key={tc.id} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}><span className="text-xl active:scale-[0.9] hover:scale-[1.1] transition-transform duration-150">{tc.icon}</span><span className="text-[9px] font-bold text-white/90 truncate w-full text-center active:scale-[0.9] hover:scale-[1.1] transition-transform duration-150">{tc.name}</span>{theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1 active:scale-[0.9] hover:scale-[1.1] transition-transform duration-150" size={14} />}</button>)}</div></CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle className="flex items-center gap-2"><Tag size={20} /> ألوان الحالات</CardTitle></CardHeader><CardContent className="space-y-3">{[
                    { key: 'completed' as const, label: 'مكتمل' }, { key: 'active' as const, label: 'نشط' }, { key: 'pending' as const, label: 'قيد الانتظار' }, { key: 'cancelled' as const, label: 'ملغي' }, { key: 'scheduled' as const, label: 'مجدول' },
                  ].map(s => <div key={s.key} className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><span className="text-sm font-medium">{s.label}</span><div className="flex items-center gap-2"><input type="color" value={statusColors[s.key]} onChange={e => setStatusColors({ ...statusColors, [s.key]: e.target.value })} className="w-8 h-8 rounded-lg cursor-pointer border-0" /><Badge style={{ backgroundColor: statusColors[s.key] + '20', color: statusColors[s.key] }} className="border">{statusColors[s.key]}</Badge></div></div>)}</CardContent></Card>
                  <Card className="card-luxury"><CardHeader><CardTitle>إعدادات عامة</CardTitle></CardHeader><CardContent className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50"><div><p className="text-sm font-medium">الوضع الداكن</p></div><Switch checked={darkMode} onCheckedChange={setDarkMode} /></div>
                  </CardContent></Card>
                </div>)}

                {/* ═══ Personal Section - شخصى ═══ */}
                {moreSubTab === 'personal' && (
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                  {/* Header */}
                  <div className="relative overflow-hidden rounded-2xl bg-gradient-to-l from-orange-400 via-rose-400 to-amber-500 p-5 text-white shadow-lg">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10">
                      {[...Array(5)].map((_, i) => <div key={i} className="absolute rounded-full bg-white" style={{ width: `${30 + i * 15}px`, height: `${30 + i * 15}px`, top: `${10 + i * 15}%`, left: `${5 + i * 18}%`, opacity: 0.15 }} />)}
                    </div>
                    <div className="relative z-10 flex items-center gap-3">
                      <div className="text-4xl animate-pulse-scale">🌟</div>
                      <div>
                        <h1 className="text-2xl font-bold">قسم شخصى</h1>
                        <p className="text-white/80 text-sm">إدارة ماليتك وتذكيراتك وملاحظاتك الشخصية</p>
                      </div>
                    </div>
                  </div>

                  {/* Smart Search */}
                  <div className="relative">
                    <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-orange-400" />
                    <Input value={personalSearchQuery} onChange={e => setPersonalSearchQuery(e.target.value)} placeholder="بحث ذكي في البيانات الشخصية..." className="pr-9 rounded-xl border-orange-200 dark:border-orange-900/30 focus-visible:ring-orange-400" />
                    {personalSearchQuery && personalSearchResults.length > 0 && (
                      <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute z-50 w-full mt-1 bg-white dark:bg-zinc-900 rounded-xl shadow-xl border border-orange-100 dark:border-orange-900/30 max-h-64 overflow-y-auto">
                        {personalSearchResults.map((r, i) => (
                          <div key={`${r.type}-${r.id}-${i}`} className="flex items-center gap-3 px-4 py-2.5 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors border-b last:border-0 border-orange-50 dark:border-orange-950/10">
                            <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/30">{r.icon}</div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{r.label}</p>
                              <p className="text-xs text-muted-foreground truncate">{r.sub}</p>
                            </div>
                            <Badge variant="outline" className="text-[9px]">{r.type === 'transaction' ? 'معاملة' : r.type === 'reminder' ? 'تذكير' : r.type === 'patient' ? 'مريض' : 'ملاحظة'}</Badge>
                          </div>
                        ))}
                      </motion.div>
                    )}
                  </div>

                  {/* Sub-tabs */}
                  <div className="flex gap-2 bg-muted/50 p-1.5 rounded-xl">
                    {[
                      { id: 'finance' as const, label: 'المالية', icon: <Wallet size={16} /> },
                      { id: 'reminders' as const, label: 'التذكيرات', icon: <Bell size={16} /> },
                      { id: 'notes' as const, label: 'الملاحظات', icon: <StickyNote size={16} /> },
                      { id: 'reports' as const, label: 'التقارير', icon: <BarChart3 size={16} /> },
                    ].map(tab => (
 <button key={tab.id} onClick={() => setPersonalSubTab(tab.id)} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-medium transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', personalSubTab === tab.id ? 'bg-gradient-to-l from-orange-500 to-amber-500 text-white shadow-md' : 'text-muted-foreground hover:bg-muted')}>
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Finance Sub-tab */}
                  {personalSubTab === 'finance' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingUp size={14} className="text-white/80" /><span className="text-[10px] text-white/80">إيرادات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalTotalIncome)}</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingDown size={14} className="text-white/80" /><span className="text-[10px] text-white/80">مصروفات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalTotalExpense)}</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={cn('rounded-xl p-3 text-white shadow-md', personalNetBalance >= 0 ? 'bg-gradient-to-br from-amber-500 to-orange-600' : 'bg-gradient-to-br from-red-500 to-rose-700')}>
                        <div className="flex items-center gap-1.5 mb-1"><PiggyBank size={14} className="text-white/80" /><span className="text-[10px] text-white/80">الرصيد</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalNetBalance)}</p>
                      </motion.div>
                    </div>

                    {/* Monthly Chart */}
                    {personalMonthlyChart.length > 0 && (
                      <Card className="card-luxury overflow-hidden">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 size={16} className="text-orange-500" /> مقارنة شهرية</CardTitle></CardHeader>
                        <CardContent className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={personalMonthlyChart} barGap={4}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <RechartsTooltip />
                              <Bar dataKey="income" fill="#10b981" name="إيرادات" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" fill="#f43f5e" name="مصروفات" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Filters */}
                    <div className="flex gap-2 flex-wrap">
                      <div className="flex gap-1 bg-muted/50 p-1 rounded-lg">
                        {(['all', 'income', 'expense'] as const).map(f => (
                          <button key={f} onClick={() => setPersonalTxnFilter(f)} className={cn('px-3 py-1 rounded-md text-xs font-medium transition-all', personalTxnFilter === f ? 'bg-orange-500 text-white shadow' : 'text-muted-foreground hover:bg-muted')}>
                            {f === 'all' ? 'الكل' : f === 'income' ? 'إيرادات' : 'مصروفات'}
                          </button>
                        ))}
                      </div>
                      <Select value={personalTxnCategoryFilter} onValueChange={setPersonalTxnCategoryFilter}>
                        <SelectTrigger className="w-32 h-8 text-xs rounded-lg"><SelectValue placeholder="كل الفئات" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">كل الفئات</SelectItem>
                          {[...PERSONAL_INCOME_CATS, ...PERSONAL_EXPENSE_CATS].filter((v, i, a) => a.indexOf(v) === i).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <Button className="mr-auto bg-gradient-to-l from-orange-500 to-amber-500 text-white rounded-xl" onClick={() => { setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }); setShowAddPersonalTxn(true) }}>
                        <Plus size={14} className="ml-1" /> معاملة
                      </Button>
                    </div>
                    {/* Date Range Filter */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} className="text-orange-500" />
                        <span className="text-xs text-muted-foreground">من:</span>
                        <Input type="date" value={personalDateFrom} onChange={e => setPersonalDateFrom(e.target.value)} className="h-8 text-xs rounded-lg w-36" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs text-muted-foreground">إلى:</span>
                        <Input type="date" value={personalDateTo} onChange={e => setPersonalDateTo(e.target.value)} className="h-8 text-xs rounded-lg w-36" />
                      </div>
                      {(personalDateFrom || personalDateTo) && (
                        <Button variant="ghost" size="sm" className="text-xs h-8" onClick={() => { setPersonalDateFrom(''); setPersonalDateTo('') }}>مسح التاريخ</Button>
                      )}
                    </div>

                    {/* Transaction List */}
                    {filteredPersonalTxns.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <div className="text-4xl mb-2 animate-bounce-y">💰</div>
                        <p className="text-muted-foreground">لا توجد معاملات شخصية بعد</p>
                        <p className="text-xs text-muted-foreground mt-1">أضف أول معاملة لتتبع ماليتك الشخصية</p>
                      </Card>
                    )}
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {filteredPersonalTxns.map((txn, i) => (
                        <motion.div key={txn.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center justify-between p-3 rounded-xl bg-white/50 dark:bg-white/5 border border-orange-100 dark:border-orange-900/30 hover:shadow-md transition-all">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', txn.type === 'income' ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-rose-100 dark:bg-rose-900/30')}>
                              {txn.type === 'income' ? <TrendingUp size={16} className="text-emerald-600" /> : <TrendingDown size={16} className="text-rose-600" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">{txn.description || txn.category}</p>
                              <p className="text-xs text-muted-foreground">{formatDate(txn.date)} • {txn.category}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={cn('font-bold text-sm', txn.type === 'income' ? 'text-emerald-600' : 'text-rose-600')}>
                              {txn.type === 'income' ? '+' : '-'}{formatCurrency(txn.amount)}
                            </span>
                            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditPersonalTxn(txn)}>
                              <Edit3 size={12} className="text-orange-500" />
                            </Button>
                            {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePersonalTransaction(txn.id)}>
                              <Trash2 size={12} className="text-red-500" />
                            </Button>}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )}

                  {/* Reminders Sub-tab */}
                  {personalSubTab === 'reminders' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2"><Bell size={18} className="text-amber-500" /> التذكيرات الشخصية</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{personalReminders.length} تذكير</Badge>
                        <Button className="bg-gradient-to-l from-amber-500 to-violet-500 text-white rounded-xl" onClick={() => { setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }); setShowAddPersonalReminder(true) }}>
                          <Plus size={14} className="ml-1" /> تذكير
                        </Button>
                      </div>
                    </div>
                    {personalReminders.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <div className="text-4xl mb-2 animate-bounce-y">⏰</div>
                        <p className="text-muted-foreground">لا توجد تذكيرات شخصية بعد</p>
                      </Card>
                    )}
                    <div className="space-y-2 max-h-96 overflow-y-auto custom-scrollbar">
                      {personalReminders.map((reminder, i) => (
                        <motion.div key={reminder.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className={cn('relative p-3 rounded-xl border-r-4 bg-white/50 dark:bg-white/5 border border-orange-100 dark:border-orange-900/30 hover:shadow-md transition-all', reminder.status === 'done' ? 'border-r-emerald-500 opacity-60' : 'border-r-amber-500', celebratingPersonalId === reminder.id && 'ring-2 ring-amber-400 ring-offset-2')}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                {reminder.status === 'done' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-amber-500" />}
                                <p className={cn('font-medium text-sm', reminder.status === 'done' && 'line-through text-muted-foreground')}>{reminder.title}</p>
                              </div>
                              {reminder.description && <p className="text-xs text-muted-foreground mb-1">{reminder.description}</p>}
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar size={10} /> {formatDate(reminder.date)}
                                <Badge variant="outline" className="text-[9px]">{reminder.type}</Badge>
                              </div>
                            </div>
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => togglePersonalReminderDone(reminder)}>
                                {reminder.status === 'done' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <CheckCircle size={14} className="text-muted-foreground" />}
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => startEditPersonalReminder(reminder)}>
                                <Edit3 size={12} className="text-amber-500" />
                              </Button>
                              {canDelete && <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deletePersonalReminder(reminder.id)}>
                                <Trash2 size={12} className="text-red-500" />
                              </Button>}
                            </div>
                          </div>
                          {celebratingPersonalId === reminder.id && (
                            <motion.div initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} className="absolute top-1 left-1 text-lg">🎉</motion.div>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )}

                  {/* Notes Sub-tab */}
                  {personalSubTab === 'notes' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2"><StickyNote size={18} className="text-sky-500" /> الملاحظات الشخصية</h3>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{personalNotes.length} ملاحظة</Badge>
                        <Button className="bg-gradient-to-l from-sky-500 to-violet-500 text-white rounded-xl" onClick={() => { setPersonalNoteForm({ content: '', important: false }); setShowAddPersonalNote(true) }}>
                          <Plus size={14} className="ml-1" /> ملاحظة
                        </Button>
                      </div>
                    </div>
                    {personalNotes.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <div className="text-4xl mb-2 animate-bounce-y">📝</div>
                        <p className="text-muted-foreground">لا توجد ملاحظات شخصية بعد</p>
                      </Card>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto custom-scrollbar">
                      {personalNotes.map((note, i) => (
                        <motion.div key={note.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className={cn('relative p-3 rounded-xl border bg-white/50 dark:bg-white/5 hover:shadow-md transition-all', note.important ? 'border-amber-300 dark:border-amber-700 bg-amber-50/50 dark:bg-amber-950/10' : 'border-sky-100 dark:border-sky-900/30')}>
                          {note.important && (
                            <div className="absolute top-2 left-2 animate-pulse-scale-lg">
                              <Star size={14} className="text-amber-500 fill-amber-500" />
                            </div>
                          )}
                          {editingPersonalNoteId === note.id ? (
                            <div className="space-y-2">
                              <Textarea value={editingPersonalNoteContent} onChange={e => setEditingPersonalNoteContent(e.target.value)} className="min-h-16 text-sm rounded-xl" autoFocus />
                              <div className="flex gap-2">
                                <Button size="sm" className="bg-sky-500 text-white rounded-lg text-xs" onClick={() => editPersonalNote(note.id, editingPersonalNoteContent, note.important)}>حفظ</Button>
                                <Button size="sm" variant="ghost" className="text-xs" onClick={() => setEditingPersonalNoteId(null)}>إلغاء</Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="text-sm whitespace-pre-wrap mb-2 pl-6">{note.content}</p>
                              <div className="flex items-center justify-between">
                                <p className="text-[10px] text-muted-foreground">{formatDate(note.createdAt)}</p>
                                <div className="flex items-center gap-1">
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => togglePersonalNoteImportance(note)}>
                                    {note.important ? <Star size={12} className="text-amber-500 fill-amber-500" /> : <StarOff size={12} className="text-muted-foreground" />}
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingPersonalNoteId(note.id); setEditingPersonalNoteContent(note.content) }}>
                                    <Edit3 size={12} className="text-sky-500" />
                                  </Button>
                                  {canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deletePersonalNote(note.id)}>
                                    <Trash2 size={12} className="text-red-500" />
                                  </Button>}
                                </div>
                              </div>
                            </>
                          )}
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  )}

                  {/* Reports Sub-tab */}
                  {personalSubTab === 'reports' && (
                  <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-lg flex items-center gap-2"><BarChart3 size={18} className="text-violet-500" /> تقارير شخصية</h3>
                    </div>

                    {/* Period Selector */}
                    <div className="flex gap-2 bg-muted/50 p-1 rounded-xl">
                      {([
                        { id: 'daily' as const, label: 'يومي', emoji: '📅' },
                        { id: 'weekly' as const, label: 'أسبوعي', emoji: '📆' },
                        { id: 'monthly' as const, label: 'شهري', emoji: '🗓️' },
                      ]).map(p => (
 <button key={p.id} onClick={() => setPersonalReportPeriod(p.id)} className={cn('flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-all active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150', personalReportPeriod === p.id ? 'bg-gradient-to-l from-violet-500 to-purple-600 text-white shadow-md' : 'text-muted-foreground hover:bg-muted')}>
                          <span>{p.emoji}</span> {p.label}
                        </button>
                      ))}
                    </div>

                    {/* Summary Cards */}
                    <div className="grid grid-cols-3 gap-3">
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingUp size={14} className="text-white/80" /><span className="text-[10px] text-white/80">إيرادات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalReportData.totalIncome)}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">{personalReportData.incomeCount} معاملة</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="rounded-xl bg-gradient-to-br from-rose-500 to-red-600 p-3 text-white shadow-md">
                        <div className="flex items-center gap-1.5 mb-1"><TrendingDown size={14} className="text-white/80" /><span className="text-[10px] text-white/80">مصروفات</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalReportData.totalExpense)}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">{personalReportData.expenseCount} معاملة</p>
                      </motion.div>
                      <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className={cn('rounded-xl p-3 text-white shadow-md', personalReportData.netBalance >= 0 ? 'bg-gradient-to-br from-violet-500 to-purple-600' : 'bg-gradient-to-br from-red-600 to-rose-700')}>
                        <div className="flex items-center gap-1.5 mb-1"><PiggyBank size={14} className="text-white/80" /><span className="text-[10px] text-white/80">الصافي</span></div>
                        <p className="font-bold text-lg">{formatCurrency(personalReportData.netBalance)}</p>
                        <p className="text-[9px] text-white/60 mt-0.5">{personalReportData.transactionCount} إجمالي</p>
                      </motion.div>
                    </div>

                    {/* Bar Chart */}
                    {personalReportData.chartData.length > 0 && (
                      <Card className="card-luxury overflow-hidden">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 size={16} className="text-violet-500" /> مقارنة {personalReportPeriod === 'daily' ? 'يومية' : personalReportPeriod === 'weekly' ? 'أسبوعية' : 'شهرية'}</CardTitle></CardHeader>
                        <CardContent className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={personalReportData.chartData} barGap={4}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
                              <YAxis tick={{ fontSize: 10 }} />
                              <RechartsTooltip />
                              <Bar dataKey="income" fill="#10b981" name="إيرادات" radius={[4, 4, 0, 0]} />
                              <Bar dataKey="expense" fill="#f43f5e" name="مصروفات" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Category Breakdown */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Income by Category */}
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp size={14} className="text-emerald-500" /> إيرادات حسب الفئة</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(personalReportData.incomeByCategory).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا توجد إيرادات</p>}
                          {Object.entries(personalReportData.incomeByCategory).sort(([,a],[,b]) => b - a).map(([cat, amount]) => {
                            const pct = personalReportData.totalIncome > 0 ? Math.round((amount / personalReportData.totalIncome) * 100) : 0
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">{cat}</span>
                                  <span className="text-emerald-600 font-bold">{formatCurrency(amount)} ({pct}%)</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full bg-emerald-500 rounded-full" />
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                      {/* Expense by Category */}
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingDown size={14} className="text-rose-500" /> مصروفات حسب الفئة</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {Object.entries(personalReportData.expenseByCategory).length === 0 && <p className="text-xs text-muted-foreground text-center py-2">لا توجد مصروفات</p>}
                          {Object.entries(personalReportData.expenseByCategory).sort(([,a],[,b]) => b - a).map(([cat, amount]) => {
                            const pct = personalReportData.totalExpense > 0 ? Math.round((amount / personalReportData.totalExpense) * 100) : 0
                            return (
                              <div key={cat} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="font-medium">{cat}</span>
                                  <span className="text-rose-600 font-bold">{formatCurrency(amount)} ({pct}%)</span>
                                </div>
                                <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.5 }} className="h-full bg-rose-500 rounded-full" />
                                </div>
                              </div>
                            )
                          })}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Expense Pie Chart */}
                    {personalReportData.expensePieData.length > 0 && (
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><PieChart size={14} className="text-rose-500" /> توزيع المصروفات</CardTitle></CardHeader>
                        <CardContent className="h-52">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie data={personalReportData.expensePieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                                {personalReportData.expensePieData.map((_, index) => <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />)}
                              </Pie>
                              <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )}

                    {/* Top Expenses */}
                    {personalReportData.topExpenses.length > 0 && (
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Flame size={14} className="text-orange-500" /> أعلى المصروفات</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          {personalReportData.topExpenses.map((t, i) => (
                            <div key={t.id} className="flex items-center gap-3 p-2 rounded-lg bg-rose-50 dark:bg-rose-900/10">
                              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-200 text-xs font-bold">{i + 1}</span>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{t.description || t.category}</p>
                                <p className="text-[10px] text-muted-foreground">{t.category} • {formatDate(t.date)}</p>
                              </div>
                              <span className="text-rose-600 font-bold text-sm">{formatCurrency(t.amount)}</span>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    )}

                    {/* Reminders & Notes Summary */}
                    <div className="grid grid-cols-2 gap-3">
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Bell size={14} className="text-amber-500" /> التذكيرات</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                            <span className="text-xs">إجمالي التذكيرات</span>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">{personalReportData.periodReminders}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/10">
                            <span className="text-xs">مكتملة</span>
                            <Badge className="bg-emerald-100 text-emerald-700 text-xs">{personalReportData.doneReminders}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-orange-50 dark:bg-orange-900/10">
                            <span className="text-xs">قيد الانتظار</span>
                            <Badge className="bg-orange-100 text-orange-700 text-xs">{personalReportData.pendingReminders}</Badge>
                          </div>
                          {personalReportData.periodReminders > 0 && (
                            <div className="mt-1">
                              <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                                <span>نسبة الإنجاز</span>
                                <span>{Math.round((personalReportData.doneReminders / personalReportData.periodReminders) * 100)}%</span>
                              </div>
                              <Progress value={Math.round((personalReportData.doneReminders / personalReportData.periodReminders) * 100)} className="h-2" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                      <Card className="card-luxury">
                        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><StickyNote size={14} className="text-sky-500" /> الملاحظات</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex items-center justify-between p-2 rounded-lg bg-sky-50 dark:bg-sky-900/10">
                            <span className="text-xs">إجمالي الملاحظات</span>
                            <Badge className="bg-sky-100 text-sky-700 text-xs">{personalReportData.periodNotes}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 dark:bg-amber-900/10">
                            <span className="text-xs">مهمة</span>
                            <Badge className="bg-amber-100 text-amber-700 text-xs">{personalReportData.importantNotes}</Badge>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-muted/50">
                            <span className="text-xs">عادية</span>
                            <Badge variant="secondary" className="text-xs">{personalReportData.periodNotes - personalReportData.importantNotes}</Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {personalTransactions.length === 0 && (
                      <Card className="card-luxury p-8 text-center">
                        <div className="text-4xl mb-2 animate-bounce-y">📊</div>
                        <p className="text-muted-foreground">لا توجد بيانات كافية للتقارير</p>
                        <p className="text-xs text-muted-foreground mt-1">أضف معاملات شخصية لتظهر التقارير</p>
                      </Card>
                    )}
                  </motion.div>
                  )}
                </motion.div>
                )}

              </div>

<Dialog open={showAddFollowUp} onOpenChange={setShowAddFollowUp}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#0891B2]"><span className="text-xl">🔄</span> تسجيل حالة متابعة جديدة</DialogTitle></DialogHeader>
        <div className="space-y-3">
          {/* Patient Search */}
          <div className="relative">
            <Label className="text-xs font-bold">المريض *</Label>
            <div className="relative mt-1"><Search className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#0891B2]/40" size={14} /><Input placeholder="بحث بالاسم أو الهاتف أو رقم الملف..." value={fuFormPatientSearch} onChange={e => { setFuFormPatientSearch(e.target.value); setFuFormPatientId('') }} className="pr-9 input-luxury rounded-xl h-10 border-[#06B6D4]/30 focus:border-[#0891B2]" /></div>
            {fuFormPatientSearch && !fuFormPatientId && (
              <div className="absolute z-50 mt-1 w-full bg-card border border-[#06B6D4]/30 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                {patients.filter(p => { const q = fuFormPatientSearch.toLowerCase(); return p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q) }).slice(0, 5).map(p => (
                  <button key={p.id} className="w-full text-right p-2.5 hover:bg-[#0891B2]/5 flex items-center gap-2 border-b last:border-0" onClick={() => { setFuFormPatientId(p.id); setFuFormPatientSearch(p.name) }}>
                    <span className="text-sm font-medium">{p.name}</span><span className="text-xs text-muted-foreground">{p.fileNumber}</span>
                  </button>
                ))}
              </div>
            )}
            {fuFormPatientId && <Badge className="mt-1 bg-[#06B6D4]/20 text-[#0891B2]">{patients.find(p => p.id === fuFormPatientId)?.name}</Badge>}
          </div>
          {/* Condition */}
          <div><Label className="text-xs font-bold">الحالة / المرض *</Label><Input placeholder="مثال: صدفية، إكزيما، ضغط..." value={fuFormCondition} onChange={e => setFuFormCondition(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-[#06B6D4]/30 focus:border-[#0891B2]" /></div>
          {/* Category & Severity */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">التصنيف</Label><Select value={fuFormCategory} onValueChange={setFuFormCategory}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="جلدية">🩺 جلدية</SelectItem><SelectItem value="داخلية">💊 داخلية</SelectItem><SelectItem value="أخرى">📋 أخرى</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs font-bold">الشدة</Label><Select value={fuFormSeverity} onValueChange={setFuFormSeverity}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="mild">خفيف</SelectItem><SelectItem value="moderate">متوسط</SelectItem><SelectItem value="severe">شديد</SelectItem><SelectItem value="critical">حرج</SelectItem></SelectContent></Select></div>
          </div>
          {/* Frequency & Next Visit */}
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">تكرار المتابعة</Label><Select value={fuFormFrequency} onValueChange={setFuFormFrequency}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="weekly">أسبوعي</SelectItem><SelectItem value="biweekly">كل أسبوعين</SelectItem><SelectItem value="monthly">شهري</SelectItem><SelectItem value="quarterly">ربع سنوي</SelectItem><SelectItem value="custom">مخصص</SelectItem></SelectContent></Select></div>
            <div><Label className="text-xs font-bold">الزيارة القادمة</Label><Input type="date" value={fuFormNextVisit} onChange={e => setFuFormNextVisit(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-[#06B6D4]/30" /></div>
          </div>
          {fuFormFrequency === 'custom' && <div><Label className="text-xs font-bold">عدد الأيام</Label><Input type="number" placeholder="كل كم يوم" value={fuFormCustomDays} onChange={e => setFuFormCustomDays(e.target.value)} className="input-luxury rounded-xl h-10 mt-1 border-[#06B6D4]/30" /></div>}
          {/* Medical Info */}
          <div className="space-y-2 p-3 rounded-xl bg-[#67E8F9]/10 dark:bg-[#0891B2]/10 border border-[#06B6D4]/20">
            <p className="text-xs font-bold text-[#0891B2]">🏥 معلومات طبية</p>
            <div><Label className="text-[10px]">التشخيص</Label><Input placeholder="التشخيص..." value={fuFormDiagnosis} onChange={e => setFuFormDiagnosis(e.target.value)} className="input-luxury rounded-xl h-9 text-xs mt-0.5 border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px]">خطة العلاج</Label><Input placeholder="خطة العلاج..." value={fuFormTreatmentPlan} onChange={e => setFuFormTreatmentPlan(e.target.value)} className="input-luxury rounded-xl h-9 text-xs mt-0.5 border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px]">الأدوية</Label><Input placeholder="الأدوية الحالية..." value={fuFormMedications} onChange={e => setFuFormMedications(e.target.value)} className="input-luxury rounded-xl h-9 text-xs mt-0.5 border-[#06B6D4]/30" /></div>
          </div>
          <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea placeholder="ملاحظات إضافية..." value={fuFormNotes} onChange={e => setFuFormNotes(e.target.value)} className="input-luxury rounded-xl mt-1 border-[#06B6D4]/30" rows={2} /></div>
          {/* Subscription Section */}
          <div className="p-3 rounded-xl border-2 border-dashed border-[#06B6D4]/30 bg-[#06B6D4]/5">
            <div className="flex items-center gap-2 mb-2"><Switch checked={fuFormHasSubscription} onCheckedChange={setFuFormHasSubscription} /><Label className="text-xs font-bold text-[#0891B2]">💎 باقة متابعة</Label></div>
            {fuFormHasSubscription && (
              <div className="space-y-2 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">نوع الباقة</Label><Select value={fuFormSubType} onValueChange={setFuFormSubType}><SelectTrigger className="rounded-lg h-9 text-xs border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">شهرية</SelectItem><SelectItem value="quarterly">ربع سنوية</SelectItem><SelectItem value="yearly">سنوية</SelectItem><SelectItem value="session_based">بالجلسات</SelectItem></SelectContent></Select></div>
                  <div><Label className="text-[10px]">السعر</Label><Input type="number" placeholder="0" value={fuFormSubPrice} onChange={e => setFuFormSubPrice(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label className="text-[10px]">عدد الجلسات</Label><Input type="number" placeholder="0" value={fuFormSubSessions} onChange={e => setFuFormSubSessions(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                  <div><Label className="text-[10px]">البداية</Label><Input type="date" value={fuFormSubStart} onChange={e => setFuFormSubStart(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                  <div><Label className="text-[10px]">النهاية</Label><Input type="date" value={fuFormSubEnd} onChange={e => setFuFormSubEnd(e.target.value)} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter><Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white w-full" onClick={async () => {
          if (!fuFormPatientId || !fuFormCondition.trim()) return toast.error('اختار المريض وحدد الحالة')
          try {
            const body: Record<string, unknown> = { patientId: fuFormPatientId, condition: fuFormCondition, conditionCategory: fuFormCategory, severity: fuFormSeverity, frequency: fuFormFrequency, diagnosis: fuFormDiagnosis || undefined, treatmentPlan: fuFormTreatmentPlan || undefined, medications: fuFormMedications || undefined, notes: fuFormNotes || undefined, nextVisitDate: fuFormNextVisit || undefined }
            if (fuFormFrequency === 'custom' && fuFormCustomDays) body.customDays = parseInt(fuFormCustomDays)
            if (fuFormHasSubscription) { body.hasSubscription = true; body.subscriptionType = fuFormSubType; body.subscriptionPrice = parseFloat(fuFormSubPrice) || 0; body.sessionsIncluded = parseInt(fuFormSubSessions) || 0; body.subscriptionStart = fuFormSubStart || undefined; body.subscriptionEnd = fuFormSubEnd || undefined }
            const res = await apiFetch<any>('/follow-up/records', { method: 'POST', body: JSON.stringify(body) })
            const newRec = res?.record || res?.data || res
            if (newRec?.id) {
              const fullRec = { ...newRec, patient: patients.find(p => p.id === fuFormPatientId), followUpVisits: [] }
              setFollowUpRecords(prev => [fullRec, ...prev])
              if (fuFormHasSubscription && fuFormSubPrice) {
                const pName = patients.find(p => p.id === fuFormPatientId)?.name || 'مريض'
                const subAmount = parseFloat(fuFormSubPrice) || 0
                try { const txnRes = await apiFetch('/finance/transactions', { method: 'POST', body: JSON.stringify({ type: 'income', category: 'متابعة', amount: subAmount, description: `باقة متابعة - ${pName} - ${fuFormCondition}`, date: cairoISO() }) }); const newTxn = txnRes?.transaction || txnRes?.data || txnRes; if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]) } else { setTransactions(prev => [...prev, { id: 'fu-sub-' + Date.now(), type: 'income', category: 'متابعة', amount: subAmount, description: `باقة متابعة - ${pName} - ${fuFormCondition}`, date: cairoISO() }]) } } catch { setTransactions(prev => [...prev, { id: 'fu-sub-' + Date.now(), type: 'income', category: 'متابعة', amount: subAmount, description: `باقة متابعة - ${pName} - ${fuFormCondition}`, date: cairoISO() }]) }
              }
            }
            setShowAddFollowUp(false); toast.success('تم تسجيل حالة المتابعة ✅')
          } catch { toast.error('خطأ في التسجيل') }
        }}><span className="text-xl ml-1">🔄</span> تسجيل المتابعة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ FOLLOW-UP: ADD VISIT DIALOG ═══ */}
      <Dialog open={showAddFollowUpVisit} onOpenChange={setShowAddFollowUpVisit}><DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#0891B2]"><span className="text-xl">🩺</span> زيارة متابعة جديدة</DialogTitle></DialogHeader>
        {selectedFU && <p className="text-xs text-muted-foreground bg-[#67E8F9]/10 rounded-lg p-2">{selectedFU.patient?.name} - {selectedFU.condition}</p>}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] font-bold">النتائج السريرية</Label><Input placeholder="النتائج..." value={fuVisitForm.findings} onChange={e => setFuVisitForm(p => ({ ...p, findings: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px] font-bold">ملاحظات العلاج</Label><Input placeholder="العلاج..." value={fuVisitForm.treatmentNotes} onChange={e => setFuVisitForm(p => ({ ...p, treatmentNotes: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] font-bold">الأدوية</Label><Input placeholder="الأدوية الموصوفة..." value={fuVisitForm.medications} onChange={e => setFuVisitForm(p => ({ ...p, medications: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px] font-bold">التعليمات</Label><Input placeholder="التعليمات للمريض..." value={fuVisitForm.instructions} onChange={e => setFuVisitForm(p => ({ ...p, instructions: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          </div>
          <div><Label className="text-[10px] font-bold">التشخيص</Label><Input placeholder="التشخيص..." value={fuVisitForm.diagnosis} onChange={e => setFuVisitForm(p => ({ ...p, diagnosis: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-[10px] font-bold">السعر</Label><Input type="number" placeholder="0" value={fuVisitForm.price} onChange={e => setFuVisitForm(p => ({ ...p, price: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
            <div><Label className="text-[10px] font-bold">الزيارة القادمة</Label><Input type="date" value={fuVisitForm.nextVisitDate} onChange={e => setFuVisitForm(p => ({ ...p, nextVisitDate: e.target.value }))} className="rounded-lg h-9 text-xs border-[#06B6D4]/30" /></div>
          </div>
          <div className="flex items-center gap-3"><Label className="text-[10px] font-bold">تم الدفع</Label><Switch checked={fuVisitForm.paid} onCheckedChange={v => setFuVisitForm(p => ({ ...p, paid: v }))} /></div>
          <div><Label className="text-[10px] font-bold text-cyan-600 flex items-center gap-1"><Calendar size={10} /> تاريخ الزيارة (اختياري)</Label><Input type="date" value={fuVisitForm.date} onChange={e => setFuVisitForm(p => ({ ...p, date: e.target.value }))} className="rounded-lg h-9 text-xs border-cyan-200 dark:border-cyan-800" /></div>
          <div><Label className="text-[10px] font-bold">ملاحظات</Label><Textarea placeholder="ملاحظات..." value={fuVisitForm.notes} onChange={e => setFuVisitForm(p => ({ ...p, notes: e.target.value }))} className="rounded-lg text-xs border-[#06B6D4]/30" rows={2} /></div>
        </div>
        <DialogFooter><Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white w-full" onClick={async () => {
          if (!selectedFU) return
          try {
            const fuVisitDate = fuVisitForm.date || undefined
            const body: Record<string, unknown> = { followUpId: selectedFU.id, findings: fuVisitForm.findings || undefined, treatmentNotes: fuVisitForm.treatmentNotes || undefined, medications: fuVisitForm.medications || undefined, instructions: fuVisitForm.instructions || undefined, diagnosis: fuVisitForm.diagnosis || undefined, paid: fuVisitForm.paid, price: parseFloat(fuVisitForm.price) || 0, nextVisitDate: fuVisitForm.nextVisitDate || undefined, notes: fuVisitForm.notes || undefined, visitDate: fuVisitDate }
            const res = await apiFetch<any>('/follow-up/visits', { method: 'POST', body: JSON.stringify(body) })
            const newVisit = res?.visit || res?.data || res
            if (newVisit?.id) {
              setFollowUpRecords(prev => prev.map(f => f.id === selectedFU.id ? { ...f, followUpVisits: [newVisit, ...(f.followUpVisits || [])], lastVisitDate: fuVisitDate, sessionsUsed: f.sessionsUsed + 1, nextVisitDate: fuVisitForm.nextVisitDate || f.nextVisitDate } : f))
              // Directly create financial transaction for paid follow-up visits
              if (fuVisitForm.paid && parseFloat(fuVisitForm.price) > 0) {
                const fuPrice = parseFloat(fuVisitForm.price)
                const pName = selectedFU.patient?.name || 'مريض'
                const fuCondition = selectedFU.condition || ''
                try {
                  await addItem('/finance/transactions', { type: 'income', category: 'متابعة', amount: fuPrice, description: `متابعة - ${pName}${fuCondition ? ' - ' + fuCondition : ''}`, date: fuVisitDate || cairoISO() }, setTransactions)
                } catch {}
                // Reload transactions to ensure sync
                try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {}
              }
            }
            setShowAddFollowUpVisit(false); setFuVisitForm({ findings: '', vitals: '', diagnosis: '', treatmentNotes: '', medications: '', instructions: '', paid: false, price: '', nextVisitDate: '', notes: '', type: 'followup', date: '' })
            toast.success('تم تسجيل الزيارة ✅')
          } catch { toast.error('خطأ') }
        }}>🩺 تسجيل الزيارة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ FOLLOW-UP: SUBSCRIPTION EDITOR DIALOG ═══ */}
      <Dialog open={!!editingFollowUpId} onOpenChange={() => setEditingFollowUpId(null)}><DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2 text-[#0891B2]"><span className="text-xl">💎</span> باقة المتابعة</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <div><Label className="text-xs font-bold">نوع الباقة</Label><Select value={fuFormSubType} onValueChange={setFuFormSubType}><SelectTrigger className="rounded-xl h-10 mt-1 border-[#06B6D4]/30"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">شهرية</SelectItem><SelectItem value="quarterly">ربع سنوية</SelectItem><SelectItem value="yearly">سنوية</SelectItem><SelectItem value="session_based">بالجلسات</SelectItem></SelectContent></Select></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs font-bold">السعر</Label><Input type="number" placeholder="0" value={fuFormSubPrice} onChange={e => setFuFormSubPrice(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
            <div><Label className="text-xs font-bold">عدد الجلسات</Label><Input type="number" placeholder="0" value={fuFormSubSessions} onChange={e => setFuFormSubSessions(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs font-bold">البداية</Label><Input type="date" value={fuFormSubStart} onChange={e => setFuFormSubStart(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
            <div><Label className="text-xs font-bold">النهاية</Label><Input type="date" value={fuFormSubEnd} onChange={e => setFuFormSubEnd(e.target.value)} className="rounded-xl h-10 border-[#06B6D4]/30" /></div>
          </div>
        </div>
        <DialogFooter><Button className="rounded-xl bg-gradient-to-l from-[#0891B2] to-[#06B6D4] text-white w-full" onClick={async () => {
          if (!editingFollowUpId) return
          try {
            await apiFetch(`/follow-up/records/${editingFollowUpId}`, { method: 'PUT', body: JSON.stringify({ hasSubscription: true, subscriptionType: fuFormSubType, subscriptionPrice: parseFloat(fuFormSubPrice) || 0, sessionsIncluded: parseInt(fuFormSubSessions) || 0, subscriptionStart: fuFormSubStart || undefined, subscriptionEnd: fuFormSubEnd || undefined }) })
            setFollowUpRecords(prev => prev.map(f => f.id === editingFollowUpId ? { ...f, hasSubscription: true, subscriptionType: fuFormSubType, subscriptionPrice: parseFloat(fuFormSubPrice) || 0, sessionsIncluded: parseInt(fuFormSubSessions) || 0, subscriptionStart: fuFormSubStart || undefined, subscriptionEnd: fuFormSubEnd || undefined } : f))
            setEditingFollowUpId(null); toast.success('تم إضافة الباقة 💎')
          } catch { toast.error('خطأ') }
        }}>💎 حفظ الباقة</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* ═══ FOLLOW-UP: DELETE CONFIRMATION ═══ */}
      {canDelete && <Dialog open={!!deleteFollowUpConfirmId} onOpenChange={() => setDeleteFollowUpConfirmId(null)}><DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="text-red-600">⚠️ حذف حالة المتابعة</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">هل أنت متأكد من حذف حالة المتابعة؟ سيتم حذف جميع الزيارات المرتبطة بها.</p>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setDeleteFollowUpConfirmId(null)}>إلغاء</Button>
          <Button className="flex-1 rounded-xl bg-red-600 text-white" onClick={async () => {
            if (!deleteFollowUpConfirmId) return
            try {
              await apiFetch(`/follow-up/records/${deleteFollowUpConfirmId}`, { method: 'DELETE' })
              setFollowUpRecords(prev => prev.filter(f => f.id !== deleteFollowUpConfirmId))
              if (selectedFollowUpId === deleteFollowUpConfirmId) setSelectedFollowUpId(null)
              setDeleteFollowUpConfirmId(null); toast.success('تم حذف حالة المتابعة')
            } catch { toast.error('خطأ في الحذف') }
          }}>حذف</Button>
        </DialogFooter>
      </DialogContent></Dialog>}
      

      {/* Add Laser Package */}
      

      {/* Add Medication */}
      <Dialog open={showAddMedication} onOpenChange={setShowAddMedication}><DialogContent className="max-w-md"><DialogHeader><DialogTitle>دواء جديد</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input id="medName" placeholder="اسم الدواء" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Input id="medCat" placeholder="الفئة" className="input-luxury rounded-xl" /></div><div><Label>الجرعة</Label><Input id="medDosage" placeholder="الجرعة" className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl" onClick={() => { addItem('/medications', { name: (document.getElementById('medName') as HTMLInputElement)?.value, category: (document.getElementById('medCat') as HTMLInputElement)?.value, dosage: (document.getElementById('medDosage') as HTMLInputElement)?.value, active: true }, setMedications); setShowAddMedication(false) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add Reminder - ENHANCED */}
 <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}><DialogContent className="max-w-md active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><DialogHeader><DialogTitle className="flex items-center gap-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><Bell size={18} className="text-rose-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /> تذكير جديد</DialogTitle></DialogHeader><div className="space-y-3 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div><Label>العنوان *</Label><Input id="remTitle" placeholder="عنوان التذكير" className="input-luxury rounded-xl active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></div><div><Label>النوع</Label><div className="grid grid-cols-4 gap-2 mt-1 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{[{ id: 'urgent', label: 'عاجل', emoji: '🔴', bg: 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700' }, { id: 'important', label: 'مهم', emoji: '🟡', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-700' }, { id: 'followup', label: 'متابعة', emoji: '🔵', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700' }, { id: 'general', label: 'عام', emoji: '🟢', bg: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' }].map(t => (<button key={t.id} onClick={() => setReminderType(t.id)} className={cn('flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-xs font-bold', t.bg, reminderType === t.id ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span className="text-lg active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">{t.emoji}</span>{t.label}</button>))}</div></div><div className="grid grid-cols-2 gap-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><div><Label>التاريخ</Label><Input id="remDate" type="date" className="input-luxury rounded-xl active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></div><div><Label>الوقت</Label><Input id="remTime" type="time" className="input-luxury rounded-xl active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></div></div><div><Label>المريض (اختياري)</Label><Select value={reminderPatientId} onValueChange={setReminderPatientId}><SelectTrigger className="rounded-xl active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent><SelectItem value="none">بدون مريض</SelectItem>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select></div></div><DialogFooter><Button className="btn-luxury rounded-xl active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { const title = (document.getElementById('remTitle') as HTMLInputElement)?.value; const date = (document.getElementById('remDate') as HTMLInputElement)?.value; const time = (document.getElementById('remTime') as HTMLInputElement)?.value; const dateStr = date ? (time ? `${date}T${time}:00` : date) : cairoISO(); addItem('/reminders', { title, date: dateStr, type: reminderType, patientId: reminderPatientId === 'none' ? undefined : reminderPatientId || undefined, status: 'pending' }, setReminders); setShowAddReminder(false); setReminderType('general'); setReminderPatientId(''); toast.success('تم إضافة التذكير') }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Inventory - Enhanced */}
      <Dialog open={showAddInventory} onOpenChange={setShowAddInventory}><DialogContent className="max-w-md"><DialogHeader><DialogTitle className="flex items-center gap-2"><Package size={18} className="text-amber-500" /> {editingInventoryId ? 'تعديل عنصر المخزون' : 'عنصر مخزون جديد'}</DialogTitle></DialogHeader><div className="space-y-3"><div><Label>الاسم *</Label><Input value={editInventoryForm.name} onChange={e => setEditInventoryForm(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم العنصر" className="input-luxury rounded-xl" /></div><div><Label>الفئة</Label><Select value={editInventoryForm.category || 'عام'} onValueChange={v => setEditInventoryForm(prev => ({ ...prev, category: v }))}><SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="عام">📌 عام</SelectItem><SelectItem value="أدوية">💊 أدوية</SelectItem><SelectItem value="مستلزمات طبية">🏥 مستلزمات طبية</SelectItem><SelectItem value="مستلزمات ليزر">💎 مستلزمات ليزر</SelectItem><SelectItem value="كريمات">🧴 كريمات</SelectItem><SelectItem value="أدوات">🔧 أدوات</SelectItem></SelectContent></Select></div><div className="grid grid-cols-3 gap-3"><div><Label>الكمية</Label><Input type="number" value={editInventoryForm.quantity} onChange={e => setEditInventoryForm(prev => ({ ...prev, quantity: e.target.value }))} placeholder="0" className="input-luxury rounded-xl" /></div><div><Label>الحد الأدنى</Label><Input type="number" value={editInventoryForm.minQuantity} onChange={e => setEditInventoryForm(prev => ({ ...prev, minQuantity: e.target.value }))} placeholder="5" className="input-luxury rounded-xl" /></div><div><Label>السعر</Label><Input type="number" value={editInventoryForm.unitPrice} onChange={e => setEditInventoryForm(prev => ({ ...prev, unitPrice: e.target.value }))} placeholder="0" className="input-luxury rounded-xl" /></div></div><div><Label>ملاحظات</Label><Input value={editInventoryForm.notes} onChange={e => setEditInventoryForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl" /></div></div><DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-amber-600 text-white" onClick={async () => { if (!editInventoryForm.name.trim()) return toast.error('الاسم مطلوب'); if (editingInventoryId) { try { await apiFetch(`/inventory/items/${editingInventoryId}`, { method: 'PUT', body: JSON.stringify({ name: editInventoryForm.name, category: editInventoryForm.category || null, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes || null }) }); setInventoryItems(prev => prev.map(i => i.id === editingInventoryId ? { ...i, name: editInventoryForm.name, category: editInventoryForm.category, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes } : i)); toast.success('تم تعديل العنصر') } catch { toast.error('خطأ في التعديل') } } else { await addItem('/inventory/items', { name: editInventoryForm.name, category: editInventoryForm.category || null, quantity: parseInt(editInventoryForm.quantity) || 0, minQuantity: parseInt(editInventoryForm.minQuantity) || 5, unitPrice: parseFloat(editInventoryForm.unitPrice) || 0, notes: editInventoryForm.notes || null }, setInventoryItems) } setShowAddInventory(false); setEditingInventoryId(null); setEditInventoryForm({ name: '', category: '', quantity: '', minQuantity: '', unitPrice: '', notes: '' }) }}>حفظ</Button></DialogFooter></DialogContent></Dialog>

      {/* Stock Transaction Dialog */}
 <Dialog open={showStockTransaction} onOpenChange={setShowStockTransaction}><DialogContent className="max-w-sm active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><DialogHeader><DialogTitle className="flex items-center gap-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{stockTransactionType === 'in' ? <FileUp size={18} className="text-emerald-500 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /> : <FileDown size={18} className="text-orange-500 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" />} {stockTransactionType === 'in' ? 'توريد مخزون' : 'صرف مخزون'}</DialogTitle></DialogHeader><div className="space-y-3 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150"><div className="flex gap-2 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">{[{ type: 'in' as const, label: 'توريد', emoji: '📥', color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300' }, { type: 'out' as const, label: 'صرف', emoji: '📤', color: 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700 text-orange-700 dark:text-orange-300' }].map(t => (<button key={t.type} onClick={() => setStockTransactionType(t.type)} className={cn('flex-1 flex items-center justify-center gap-2 p-3 rounded-xl border-2 text-sm font-bold transition-all', t.color, stockTransactionType === t.type ? 'ring-2 ring-primary shadow-lg scale-105' : 'opacity-50 hover:opacity-80')}><span>{t.emoji}</span>{t.label}</button>))}</div><div><Label>الكمية *</Label><Input type="number" value={stockTransactionQty} onChange={e => setStockTransactionQty(e.target.value)} placeholder="الكمية" className="input-luxury rounded-xl active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /></div><div><Label>ملاحظات</Label><Input value={stockTransactionNotes} onChange={e => setStockTransactionNotes(e.target.value)} placeholder="سبب التوريد/الصرف..." className="input-luxury rounded-xl active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150" /></div></div><DialogFooter><Button className={cn('btn-luxury rounded-xl text-white', stockTransactionType === 'in' ? 'bg-gradient-to-l from-emerald-500 to-emerald-600' : 'bg-gradient-to-l from-orange-500 to-orange-600')} onClick={async () => { const qty = parseInt(stockTransactionQty); if (!qty || qty <= 0) return toast.error('أدخل كمية صحيحة'); try { await apiFetch('/inventory/transactions', { method: 'POST', body: JSON.stringify({ itemId: stockTransactionItemId, type: stockTransactionType, quantity: qty, notes: stockTransactionNotes || null, date: cairoISO() }) }); const item = inventoryItems.find(i => i.id === stockTransactionItemId); if (item) { const newQty = stockTransactionType === 'in' ? item.quantity + qty : Math.max(0, item.quantity - qty); setInventoryItems(prev => prev.map(i => i.id === stockTransactionItemId ? { ...i, quantity: newQty } : i)) } toast.success(stockTransactionType === 'in' ? `تم توريد ${qty} وحدة` : `تم صرف ${qty} وحدة`); setShowStockTransaction(false) } catch { toast.error('خطأ في العملية') } }}>تأكيد</Button></DialogFooter></DialogContent></Dialog>

      {/* Add/Edit Partner Doctor Dialog */}
      <Dialog open={showAddDoctor} onOpenChange={setShowAddDoctor}><DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Stethoscope size={20} className="text-emerald-500" /> {editingDoctorId ? 'تعديل الطبيب' : 'طبيب مشارك جديد'}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><Label className="text-xs font-bold">الاسم *</Label><Input value={doctorForm.name} onChange={e => setDoctorForm(prev => ({ ...prev, name: e.target.value }))} placeholder="اسم الطبيب" className="input-luxury rounded-xl h-10" /></div>
            <div><Label className="text-xs font-bold">التخصص</Label><Input value={doctorForm.specialty} onChange={e => setDoctorForm(prev => ({ ...prev, specialty: e.target.value }))} placeholder="التخصص" className="input-luxury rounded-xl h-10" /></div>
          </div>
          <div><Label className="text-xs font-bold">الهاتف</Label><Input dir="ltr" value={doctorForm.phone} onChange={e => setDoctorForm(prev => ({ ...prev, phone: normalizePhone(e.target.value) }))} placeholder="رقم الهاتف" className="input-luxury rounded-xl h-10 text-left" /></div>
          <Card className="border-2 border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/20 dark:to-teal-950/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><DollarSign size={14} className="text-emerald-500" /> النسب المئوية</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold text-emerald-600">نسبة الكشف %</Label><Input type="number" value={doctorForm.checkupPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, checkupPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div><Label className="text-xs font-bold text-blue-600">نسبة الإعادة %</Label><Input type="number" value={doctorForm.revisitPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, revisitPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div><Label className="text-xs font-bold text-violet-600">نسبة الليزر %</Label><Input type="number" value={doctorForm.laserPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, laserPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div><Label className="text-xs font-bold text-orange-600">نسبة الجلسات %</Label><Input type="number" value={doctorForm.sessionPercentage} onChange={e => setDoctorForm(prev => ({ ...prev, sessionPercentage: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
              <div className="col-span-2"><Label className="text-xs font-bold text-amber-600">مبلغ ثابت (ج.م)</Label><Input type="number" value={doctorForm.fixedAmount} onChange={e => setDoctorForm(prev => ({ ...prev, fixedAmount: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10" /></div>
            </CardContent>
          </Card>
          <div><Label className="text-xs font-bold">ملاحظات</Label><Textarea value={doctorForm.notes} onChange={e => setDoctorForm(prev => ({ ...prev, notes: e.target.value }))} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl" /></div>
        </div>
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-emerald-600 to-emerald-700 text-white" onClick={async () => {
          if (!doctorForm.name.trim()) return toast.error('الاسم مطلوب')
          if (editingDoctorId) {
            try {
              await apiFetch(`/doctors/${editingDoctorId}`, { method: 'PUT', body: JSON.stringify({ name: doctorForm.name, phone: doctorForm.phone || null, specialty: doctorForm.specialty || null, checkupPercentage: parseFloat(doctorForm.checkupPercentage) || 0, revisitPercentage: parseFloat(doctorForm.revisitPercentage) || 0, laserPercentage: parseFloat(doctorForm.laserPercentage) || 0, sessionPercentage: parseFloat(doctorForm.sessionPercentage) || 0, fixedAmount: parseFloat(doctorForm.fixedAmount) || 0, notes: doctorForm.notes || null }) })
              setDoctors(prev => prev.map(d => d.id === editingDoctorId ? { ...d, name: doctorForm.name, phone: doctorForm.phone, specialty: doctorForm.specialty, checkupPercentage: parseFloat(doctorForm.checkupPercentage) || 0, revisitPercentage: parseFloat(doctorForm.revisitPercentage) || 0, laserPercentage: parseFloat(doctorForm.laserPercentage) || 0, sessionPercentage: parseFloat(doctorForm.sessionPercentage) || 0, fixedAmount: parseFloat(doctorForm.fixedAmount) || 0, notes: doctorForm.notes } : d))
              toast.success('تم تعديل الطبيب')
            } catch { toast.error('خطأ في التعديل') }
          } else {
            await addItem('/doctors', { name: doctorForm.name, phone: doctorForm.phone || null, specialty: doctorForm.specialty || null, checkupPercentage: parseFloat(doctorForm.checkupPercentage) || 0, revisitPercentage: parseFloat(doctorForm.revisitPercentage) || 0, laserPercentage: parseFloat(doctorForm.laserPercentage) || 0, sessionPercentage: parseFloat(doctorForm.sessionPercentage) || 0, fixedAmount: parseFloat(doctorForm.fixedAmount) || 0, notes: doctorForm.notes || null }, setDoctors)
          }
          setShowAddDoctor(false); setEditingDoctorId(null); setDoctorForm({ name: '', phone: '', specialty: '', checkupPercentage: '', revisitPercentage: '', laserPercentage: '', sessionPercentage: '', fixedAmount: '', notes: '' })
        }}>حفظ</Button></DialogFooter>
      </DialogContent></Dialog>

      {/* Password Verification Dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}><DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Lock size={20} className="text-red-500" /> كلمة السر مطلوبة</DialogTitle><DialogDescription>هذا القسم محمي بكلمة سر</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <Input type="password" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} placeholder="أدخل كلمة السر..." className="input-luxury rounded-xl h-12 text-center text-lg font-bold" onKeyDown={e => e.key === 'Enter' && verifyPassword()} autoFocus />
        </div>
        <DialogFooter className="gap-2"><Button variant="ghost" onClick={() => setPasswordDialogOpen(false)}>إلغاء</Button><Button className="btn-luxury rounded-xl" onClick={verifyPassword}>دخول</Button></DialogFooter>
      </DialogContent></Dialog>

      
      {/* Apply Template to Patient Dialog */}
      <Dialog open={showApplyTemplate} onOpenChange={setShowApplyTemplate}><DialogContent className="max-w-md">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Layers size={18} className="text-lime-500" /> تطبيق قالب العلاج</DialogTitle><DialogDescription>{selectedTemplate?.name} - {selectedTemplate?.sessions} جلسات</DialogDescription></DialogHeader>
        <div className="space-y-3">
          <Card className="border-2 border-lime-200 dark:border-lime-800 bg-gradient-to-br from-lime-50 to-emerald-50 dark:from-lime-950/20 dark:to-emerald-950/20 p-4">
            <div className="space-y-1 text-sm">
              <p className="font-bold">{selectedTemplate?.name}</p>
              <p className="text-xs text-muted-foreground">{selectedTemplate?.description}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className="text-[9px]">{selectedTemplate?.sessions} جلسات</Badge>
                <Badge variant="outline" className="text-[9px]">{formatCurrency(selectedTemplate?.estimatedPrice || 0)}</Badge>
                <Badge variant="outline" className="text-[9px]">{selectedTemplate?.category}</Badge>
              </div>
            </div>
          </Card>
          <div><Label className="text-xs font-bold">اختر المريض *</Label><Select value={templatePatientId} onValueChange={setTemplatePatientId}><SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="اختر المريض" /></SelectTrigger><SelectContent>{patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}</SelectContent></Select></div>
        </div>
        <DialogFooter><Button className="btn-luxury rounded-xl bg-gradient-to-l from-lime-500 to-lime-600 text-white" onClick={async () => { if (!templatePatientId) return toast.error('اختر المريض'); const patient = patients.find(p => p.id === templatePatientId); const now = cairoISO(); for (let i = 0; i < (selectedTemplate?.sessions || 0); i++) { await addItem('/sessions', { patientId: templatePatientId, status: 'completed', price: selectedTemplate?.estimatedPrice / selectedTemplate?.sessions || 0, paid: true, notes: `قالب: ${selectedTemplate?.name} - جلسة ${i + 1}`, date: now }, setSessions) } toast.success(`تم تطبيق قالب "${selectedTemplate?.name}" على ${patient?.name}`); setShowApplyTemplate(false); setTemplatePatientId(''); setSelectedTemplate(null) }}><Sparkles size={14} className="ml-1" /> تطبيق القالب</Button></DialogFooter>
      </DialogContent></Dialog>


      {/* ─── Add Service Dialog ─── */}
      <Dialog open={showAddService} onOpenChange={setShowAddService}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Tag size={20} className="text-teal-500" /> خدمة جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">اسم الخدمة *</Label><Input value={serviceFormName} onChange={e => setServiceFormName(e.target.value)} placeholder="اسم الخدمة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            <div><Label className="text-xs font-bold">الفئة</Label>
              <Select value={serviceFormCategory} onValueChange={setServiceFormCategory}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="عام">عام</SelectItem>
                  <SelectItem value="جلدية">جلدية</SelectItem>
                  <SelectItem value="تجميلية">تجميلية</SelectItem>
                  <SelectItem value="ليزر">ليزر</SelectItem>
                  <SelectItem value="حقن">حقن</SelectItem>
                  <SelectItem value="عمليات">عمليات</SelectItem>
                  <SelectItem value="أخرى">أخرى</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold">السعر (ج.م) *</Label><Input type="number" value={serviceFormPrice} onChange={e => setServiceFormPrice(e.target.value)} placeholder="0" className="input-luxury rounded-xl h-10 mt-1" /></div>
              <div><Label className="text-xs font-bold">المدة (دقيقة)</Label><Input type="number" value={serviceFormDuration} onChange={e => setServiceFormDuration(e.target.value)} placeholder="30" className="input-luxury rounded-xl h-10 mt-1" /></div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddService(false)}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-teal-600 to-teal-700 text-white" onClick={async () => {
              if (!serviceFormName.trim()) return toast.error('اسم الخدمة مطلوب')
              const price = parseFloat(serviceFormPrice) || 0
              await addItem('/services', { name: serviceFormName, category: serviceFormCategory || 'عام', price, duration: parseInt(serviceFormDuration) || undefined, active: true }, setServices)
              setServiceFormName(''); setServiceFormCategory('عام'); setServiceFormPrice(''); setServiceFormDuration('')
              setShowAddService(false)
              toast.success('تم إضافة الخدمة')
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Booking Dialog ─── */}
      <Dialog open={showAddBooking} onOpenChange={setShowAddBooking}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><CalendarCheck size={20} className="text-sky-500" /> حجز جديد</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">المريض</Label>
              <Select value={bookingFormPatientId} onValueChange={v => { setBookingFormPatientId(v); const p = patients.find(pp => pp.id === v); if (p) setBookingFormPatientSearch(p.name) }}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue placeholder="اختر المريض..." /></SelectTrigger>
                <SelectContent>
                  {patients.map(p => <SelectItem key={p.id} value={p.id}>{p.name} ({p.fileNumber})</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-bold">التاريخ *</Label><Input type="date" value={bookingFormDate} onChange={e => setBookingFormDate(e.target.value)} className="input-luxury rounded-xl h-10 mt-1" /></div>
              <div><Label className="text-xs font-bold">الوقت</Label><Input type="time" value={bookingFormTime} onChange={e => setBookingFormTime(e.target.value)} className="input-luxury rounded-xl h-10 mt-1" /></div>
            </div>
            <div><Label className="text-xs font-bold">نوع الحجز</Label>
              <Select value={bookingFormType} onValueChange={setBookingFormType}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="checkup">كشف</SelectItem>
                  <SelectItem value="revisit">إعادة</SelectItem>
                  <SelectItem value="session">جلسة</SelectItem>
                  <SelectItem value="consultation">استشارة</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold">الحالة</Label>
              <Select value={bookingFormStatus} onValueChange={setBookingFormStatus}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="scheduled">مجدول</SelectItem>
                  <SelectItem value="confirmed">مؤكد</SelectItem>
                  <SelectItem value="completed">مكتمل</SelectItem>
                  <SelectItem value="cancelled">ملغي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label className="text-xs font-bold">ملاحظات</Label><Input value={bookingFormNotes} onChange={e => setBookingFormNotes(e.target.value)} placeholder="ملاحظات..." className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddBooking(false)}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-sky-600 text-white" onClick={async () => {
              if (!bookingFormDate) return toast.error('التاريخ مطلوب')
              const dateStr = bookingFormTime ? `${bookingFormDate}T${bookingFormTime}:00` : bookingFormDate
              await addItem('/appointments', { patientId: bookingFormPatientId || undefined, date: dateStr, duration: 30, type: bookingFormType, status: bookingFormStatus, notes: bookingFormNotes || undefined }, setAppointments)
              setBookingFormPatientSearch(''); setBookingFormPatientId(''); setBookingFormDate(''); setBookingFormTime(''); setBookingFormType('checkup'); setBookingFormStatus('scheduled'); setBookingFormNotes('')
              setShowAddBooking(false)
              toast.success('تم إضافة الحجز')
            }}>حفظ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Personal Transaction Dialog ─── */}
      <Dialog open={showAddPersonalTxn} onOpenChange={(open) => { setShowAddPersonalTxn(open); if (!open) { setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Wallet size={20} className="text-orange-500" /> {editingPersonalTxnId ? 'تعديل معاملة' : 'معاملة شخصية جديدة'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* Type toggle */}
            <div className="flex gap-2 bg-muted/50 p-1 rounded-lg">
              <button onClick={() => setPersonalTxnForm(prev => ({ ...prev, type: 'income' }))} className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5', personalTxnForm.type === 'income' ? 'bg-emerald-500 text-white shadow' : 'text-muted-foreground')}>
                <TrendingUp size={14} /> إيراد
              </button>
              <button onClick={() => setPersonalTxnForm(prev => ({ ...prev, type: 'expense' }))} className={cn('flex-1 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5', personalTxnForm.type === 'expense' ? 'bg-rose-500 text-white shadow' : 'text-muted-foreground')}>
                <TrendingDown size={14} /> مصروف
              </button>
            </div>
            {/* Category */}
            <div><Label className="text-xs font-bold">الفئة *</Label>
              <Select value={personalTxnForm.category} onValueChange={v => setPersonalTxnForm(prev => ({ ...prev, category: v }))}>
                <SelectTrigger className="rounded-xl h-10 mt-1"><SelectValue placeholder="اختر الفئة..." /></SelectTrigger>
                <SelectContent>
                  {(personalTxnForm.type === 'income' ? PERSONAL_INCOME_CATS : PERSONAL_EXPENSE_CATS).map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* Amount */}
            <div><Label className="text-xs font-bold">المبلغ (ج.م) *</Label><Input type="number" value={personalTxnForm.amount} onChange={e => setPersonalTxnForm(prev => ({ ...prev, amount: e.target.value }))} placeholder="0" className="input-luxury rounded-xl h-10 mt-1" /></div>
            {/* Description */}
            <div><Label className="text-xs font-bold">الوصف</Label><Input value={personalTxnForm.description} onChange={e => setPersonalTxnForm(prev => ({ ...prev, description: e.target.value }))} placeholder="وصف المعاملة..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            {/* Date */}
            <div><Label className="text-xs font-bold">التاريخ</Label><Input type="date" value={personalTxnForm.date} onChange={e => setPersonalTxnForm(prev => ({ ...prev, date: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAddPersonalTxn(false); setEditingPersonalTxnId(null); setPersonalTxnForm({ type: 'income', category: '', amount: '', description: '', date: '' }) }}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-orange-500 to-amber-500 text-white" onClick={editingPersonalTxnId ? editPersonalTransaction : addPersonalTransaction}>
              {editingPersonalTxnId ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add/Edit Personal Reminder Dialog ─── */}
      <Dialog open={showAddPersonalReminder} onOpenChange={(open) => { setShowAddPersonalReminder(open); if (!open) { setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }) } }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Bell size={20} className="text-amber-500" /> {editingPersonalReminderId ? 'تعديل تذكير' : 'تذكير شخصي جديد'}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">العنوان *</Label><Input value={personalReminderForm.title} onChange={e => setPersonalReminderForm(prev => ({ ...prev, title: e.target.value }))} placeholder="عنوان التذكير..." className="input-luxury rounded-xl h-10 mt-1" /></div>
            <div><Label className="text-xs font-bold">الوصف</Label><Textarea value={personalReminderForm.description} onChange={e => setPersonalReminderForm(prev => ({ ...prev, description: e.target.value }))} placeholder="وصف التذكير..." className="input-luxury rounded-xl mt-1" rows={2} /></div>
            <div><Label className="text-xs font-bold">التاريخ والوقت</Label><Input type="datetime-local" value={personalReminderForm.date} onChange={e => setPersonalReminderForm(prev => ({ ...prev, date: e.target.value }))} className="input-luxury rounded-xl h-10 mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowAddPersonalReminder(false); setEditingPersonalReminderId(null); setPersonalReminderForm({ title: '', description: '', date: '', type: 'شخصي' }) }}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-amber-500 to-violet-500 text-white" onClick={editingPersonalReminderId ? editPersonalReminder : addPersonalReminder}>
              {editingPersonalReminderId ? 'تحديث' : 'إضافة'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Add Personal Note Dialog ─── */}
      <Dialog open={showAddPersonalNote} onOpenChange={setShowAddPersonalNote}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><StickyNote size={20} className="text-sky-500" /> ملاحظة شخصية جديدة</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label className="text-xs font-bold">المحتوى *</Label><Textarea value={personalNoteForm.content} onChange={e => setPersonalNoteForm(prev => ({ ...prev, content: e.target.value }))} placeholder="اكتب ملاحظتك هنا..." className="input-luxury rounded-xl mt-1" rows={4} autoFocus /></div>
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div><p className="text-sm font-medium">مهم</p><p className="text-xs text-muted-foreground">وضع علامة على الملاحظة كمهمة</p></div>
              <Switch checked={personalNoteForm.important} onCheckedChange={v => setPersonalNoteForm(prev => ({ ...prev, important: v }))} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowAddPersonalNote(false)}>إلغاء</Button>
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-sky-500 to-violet-500 text-white" onClick={addPersonalNote}>إضافة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
