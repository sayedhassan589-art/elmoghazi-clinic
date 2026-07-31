'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useAuthStore, useClinicStore, THEME_CONFIGS } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, Stethoscope, Zap, MoreHorizontal,
  Search, Bell, Moon, Sun, LogOut, Plus, Edit3,
  Trash2, Star, StarOff, Phone, Calendar, Clock, DollarSign,
  Package, FileText, Activity, AlertTriangle, CheckCircle,
  ChevronDown, Settings, Shield, BarChart3, TrendingUp, Eye,
  Camera, Pill, Heart, Send, RefreshCw, Download, Upload,
  Filter, UserPlus, Sparkles, Hash, MapPin, Palette, X,
  Database, HardDrive, Archive, FileDown, FileUp, Timer, Tag,
  Scissors, Syringe, Layers, Wand2, ThermometerSun, Lock,
  CircleDot, Armchair, ScanFace, Hand, Circle,
  MousePointerClick, Target, ZapOff, BarChart2, Receipt,
  CalendarCheck, UsersRound, ClipboardCheck, AlertCircle,
  Wallet, TrendingDown, StickyNote, Coffee, Home as HomeIcon,
  GraduationCap, Shirt, Flame, Gift, Award, Building2, Car,
  Utensils, Gamepad2, HeartPulse, PiggyBank, CheckCircle2,
  Lightbulb, Sparkle, Copy, ThumbsUp
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { useAppointmentFormStore, useFinanceFormStore, usePatientFormStore, useUIStore } from '@/store'

import { ImprovementEntry, Patient, Visit, Session, Service, Note, LaserRecord, LaserSession, Transaction, Reminder, WaitingItem, InventoryItem, Medication, Prescription, Notification, Backup, PatientPhoto, PartnerDoctor, FollowUpRecord, FollowUpVisit, Alert, LaserPackage, LaserSetting, Appointment } from '@/lib/types'
import { CHART_COLORS, normalizePhone, waPhone, getLocalDateStr, getCairoWeekday, getCairoDateLabel, getCairoDateParts, getEgyptianWeekDays, cairoISO, cairoTodayInput, cairoTimeInput, cairoDateTime, apiFetch, BODY_AREAS, SKIN_TYPES, HAIR_COLORS, getImprovementColor, getImprovementEmoji, getImprovementHistory, normalizeArabic, fuzzyMatch, smartSearch, getVisitCategory, VISIT_TYPES } from '@/lib/helpers'
import PatientProfile from '@/components/PatientProfile'
import LaserCenter from '@/components/LaserCenter'
import FinanceCenter from '@/components/FinanceCenter'
import MoreSection from '@/components/MoreSection'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import WaitingSection from '@/components/WaitingSection'
import CairoClock from '@/components/CairoClock'
import DashboardSection from '@/components/DashboardSection'
import MessageSection from '@/components/MessageSection'

// ─── Smart Search Helpers ────────────────────────────────────────────
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])
  return debounced
}



export default function Home() {
  const { user, isAuthenticated, login, logout, userRole, setUserRole } = useAuthStore()
  const { activeTab, setActiveTab, theme, setTheme, autoBackup, setAutoBackup, backupInterval, setBackupInterval, setLastBackup, sectionPasswords, setSectionPasswords, defaultCheckupPrice, defaultRevisitPrice, setDefaultCheckupPrice, setDefaultRevisitPrice } = useClinicStore()
  const { patients, setPatients, visits, setVisits, sessions, setSessions, services, setServices, notes, setNotes, alerts, setAlerts, reminders, setReminders, laserRecords, setLaserRecords, transactions, setTransactions, appointments, setAppointments, waitingQueue, setWaitingQueue, inventoryItems, setInventoryItems, medications, setMedications, prescriptions, setPrescriptions, backups, setBackups, notifications, setNotifications, doctors, setDoctors, followUpRecords, setFollowUpRecords, loading, setLoading, patientPhotos, setPatientPhotos, loadAllData, refreshPatientPhotos } = useDataStore()
  const { bookingFormPatientSearch, setBookingFormPatientSearch } = useAppointmentFormStore()
  const { setTxnFormDate } = useFinanceFormStore()

  const { newPatientName, setNewPatientName, newPatientPhone, setNewPatientPhone, newPatientAddress, setNewPatientAddress, newPatientAge, setNewPatientAge, newPatientDiagnosis, setNewPatientDiagnosis, newPatientNotes, setNewPatientNotes, selectedVisitType, setSelectedVisitType, selectedServiceIds, setSelectedServiceIds, customServicePrice, setCustomServicePrice, visitPrice, setVisitPrice, quickNote, setQuickNote, setEditingVisitId, setEditingSessionId, newPatientDate, setNewPatientDate, patientImportData, setPatientImportData, patientImportPreview, setPatientImportPreview, patientImportFile, setPatientImportFile, patientImportLoading, setPatientImportLoading, patientImportProgress, setPatientImportProgress, patientImportDragOver, setPatientImportDragOver } = usePatientFormStore()

  const { darkMode, setDarkMode, smartSearchOpen, setSmartSearchOpen, smartSearchQuery, setSmartSearchQuery, searchQuery, setSearchQuery, searchField, setSearchField, patientDisplayCount, setPatientDisplayCount, selectedPatient, setSelectedPatient, showAddPatient, setShowAddPatient, showAddTransaction, setShowAddTransaction, showAddLaserRecord, setShowAddLaserRecord, setShowAddAppointment, loginRole, setLoginRole, loginPassword, setLoginPassword, loginLoading, setLoginLoading, seeded, setSeeded, restoreConfirmOpen, setRestoreConfirmOpen, pendingRestoreData, setPendingRestoreData, patientFilter, setPatientFilter, editingPatient, setEditingPatient, deletePatientConfirmOpen, setDeletePatientConfirmOpen, passwordDialogOpen, setPasswordDialogOpen, passwordTarget, setPasswordTarget, passwordInput, setPasswordInput, pendingTab, setPendingTab, selectedFollowUpId } = useUIStore()
  // Login
  const patientImportInputRef = useRef<HTMLInputElement>(null)
  // Full restore from backup file — uses dedicated import endpoint
  const restoreFromBackup = async (backupData: any) => {
    try {
      // apiFetch already parses JSON and throws on non-ok responses
      const result: any = await apiFetch('/backups/import', {
        method: 'POST',
        body: JSON.stringify(backupData),
      })
      await loadAllData()
      setRestoreConfirmOpen(false)
      setPendingRestoreData(null)
      toast.success(`تمت الاستعادة بنجاح - ${result.totalRestored || ''} عنصر`)
    } catch (e: any) {
      toast.error('خطأ في الاستعادة: ' + (e.message || ''))
    }
  }

  // Patient Import
  // ─── Password is verified server-side via /auth/login API ─────────────
  // No password stored on client - all verification is server-side

  // ─── Effects ──────────────────────────────────────────────────────────
  useEffect(() => { document.documentElement.classList.toggle('dark', darkMode) }, [darkMode])
  useEffect(() => { if (!seeded) { apiFetch('/seed', { method: 'POST' }).then(() => setSeeded(true)).catch(() => setSeeded(true)) } }, [seeded])
  useEffect(() => {
    if (!autoBackup) return
    // Run first backup immediately on enable
    const runBackup = async () => {
      try {
        await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'auto' }) })
        setLastBackup(cairoISO())
        toast.success('تم النسخ الاحتياطي التلقائي ✓')
      } catch (e) {
        console.error('Auto backup failed:', e)
      }
    }
    runBackup()
    const interval = setInterval(runBackup, backupInterval * 60 * 1000)
    return () => clearInterval(interval)
  }, [autoBackup, backupInterval, setLastBackup])

  // Data loading is now handled by useDataStore().loadAllData
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { if (isAuthenticated) loadAllData() }, [isAuthenticated, loadAllData])

  // Load patient photos when selectedPatient changes
  useEffect(() => {
    if (selectedPatient) {
      refreshPatientPhotos(selectedPatient.id)
    } else {
      setPatientPhotos([])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPatient?.id])

  // ─── Auto-suggest patient names ──────────────────────────────────────
  const patientSearchSuggestions = useMemo(() => {
    if (newPatientName.length < 1) return []
    const q = newPatientName.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [newPatientName, patients])

  // Booking patient search
  const bookingPatientSuggestions = useMemo(() => {
    if (!bookingFormPatientSearch) return []
    const q = bookingFormPatientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [bookingFormPatientSearch, patients])

  // ─── CRUD ─────────────────────────────────────────────────────────────
  const handleLogin = async () => {
    if (!loginRole) { toast.error('اختر الدور أولاً'); return }
    if (!loginPassword) { toast.error('أدخل كلمة المرور'); return }
    setLoginLoading(true)
    try {
      const res = await apiFetch<{user: any}>('/auth/login', { method: 'POST', body: JSON.stringify({ role: loginRole, password: loginPassword }) })
      login(res.user, loginRole)
      toast.success(loginRole === 'doctor' ? 'مرحباً دكتور 🩺' : 'مرحباً 👩‍💼')
      if (loginRole === 'secretary') setActiveTab('waiting')
    } catch (e: any) { toast.error(e.message === 'Invalid password' ? 'كلمة السر غير صحيحة' : e.message || 'خطأ في تسجيل الدخول') }
    setLoginLoading(false)
  }
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Mark session as paid + create finance transaction (fixes: "pay" button was not recording revenue)
  const markSessionPaid = async (s: Session) => {
    try {
      await apiFetch(`/sessions/${s.id}`, { method: 'PUT', body: JSON.stringify({ paid: true }) })
      // Create corresponding finance transaction
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

  // Delete patient with full finance cleanup
  const deletePatientWithFinance = async (patient: Patient) => {
    try {
      // Find all finance transactions related to this patient (by name in description)
      const relatedTxns = transactions.filter(t => t.description?.includes(patient.name))
      // Delete each related finance transaction
      for (const txn of relatedTxns) {
        try { await apiFetch(`/finance/transactions/${txn.id}`, { method: 'DELETE' }) } catch {}
      }
      // Remove deleted transactions from state
      const deletedTxnIds = new Set(relatedTxns.map(t => t.id))
      setTransactions(prev => prev.filter(t => !deletedTxnIds.has(t.id)))
      // Delete the patient (API should cascade delete visits, sessions, notes, etc.)
      await apiFetch(`/patients/${patient.id}`, { method: 'DELETE' })
      // Remove patient and related data from state
      setPatients(prev => prev.filter(p => p.id !== patient.id))
      setVisits(prev => prev.filter(v => v.patientId !== patient.id))
      setSessions(prev => prev.filter(s => s.patientId !== patient.id))
      setNotes(prev => prev.filter(n => n.patientId !== patient.id))
      setLaserRecords(prev => prev.filter(l => l.patientId !== patient.id))
      setSelectedPatient(null)
      setDeletePatientConfirmOpen(false)
      toast.success(`تم حذف المريض ${patient.name} وجميع البيانات المرتبطة`)
    } catch (e: any) { toast.error(e.message || 'خطأ في حذف المريض') }
  }

  // Delete visit with finance sync
  const deleteVisitWithFinance = async (visit: Visit, patientName: string) => {
    try {
      // Find and delete the corresponding finance transaction
      const visitCategory = getVisitCategory(visit.type)
      const visitDate = visit.date?.split('T')[0]
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        t.category === visitCategory &&
        t.date?.startsWith(visitDate || '')
      )
      if (relatedTxn) {
        try { await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'DELETE' }) } catch {}
        setTransactions(prev => prev.filter(t => t.id !== relatedTxn.id))
      }
      // Delete the visit
      await apiFetch(`/visits/${visit.id}`, { method: 'DELETE' })
      setVisits(prev => prev.filter(v => v.id !== visit.id))
      toast.success('تم حذف الزيارة والمعاملة المالية المرتبطة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Edit visit with finance sync
  const editVisitWithFinance = async (visit: Visit, newType: string, newNotes: string, patientName: string) => {
    try {
      const oldCategory = getVisitCategory(visit.type)
      const newCategory = getVisitCategory(newType)
      // Find related finance transaction
      const visitDate = visit.date?.split('T')[0]
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        t.category === oldCategory &&
        t.date?.startsWith(visitDate || '')
      )
      // Update visit
      await apiFetch(`/visits/${visit.id}`, { method: 'PUT', body: JSON.stringify({ type: newType, notes: newNotes || undefined }) })
      setVisits(prev => prev.map(v => v.id === visit.id ? { ...v, type: newType, notes: newNotes } : v))
      // Update finance transaction if category changed
      if (relatedTxn && oldCategory !== newCategory) {
        await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'PUT', body: JSON.stringify({ category: newCategory, description: relatedTxn.description?.replace(oldCategory, newCategory) }) })
        setTransactions(prev => prev.map(t => t.id === relatedTxn.id ? { ...t, category: newCategory, description: t.description?.replace(oldCategory, newCategory) } : t))
      }
      setEditingVisitId(null)
      toast.success('تم تعديل الزيارة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Delete session with finance sync
  const deleteSessionWithFinance = async (session: Session, patientName: string) => {
    try {
      // Find and delete the corresponding finance transaction
      const sessionDate = session.date?.split('T')[0]
      const svcName = services.find(sv => sv.id === session.serviceId)?.name || 'جلسة'
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        (t.category === 'جلسات' || t.category === 'ليزر') &&
        t.date?.startsWith(sessionDate || '') &&
        t.amount === session.price
      )
      if (relatedTxn) {
        try { await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'DELETE' }) } catch {}
        setTransactions(prev => prev.filter(t => t.id !== relatedTxn.id))
      }
      // Delete the session
      await apiFetch(`/sessions/${session.id}`, { method: 'DELETE' })
      setSessions(prev => prev.filter(s => s.id !== session.id))
      toast.success('تم حذف الجلسة والمعاملة المالية المرتبطة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // Edit session with finance sync
  const editSessionWithFinance = async (session: Session, newPrice: number, newNotes: string, newStatus: string, patientName: string) => {
    try {
      // Find related finance transaction
      const sessionDate = session.date?.split('T')[0]
      const relatedTxn = transactions.find(t =>
        t.description?.includes(patientName) &&
        (t.category === 'جلسات' || t.category === 'ليزر') &&
        t.date?.startsWith(sessionDate || '') &&
        t.amount === session.price
      )
      // Update session
      await apiFetch(`/sessions/${session.id}`, { method: 'PUT', body: JSON.stringify({ price: newPrice, notes: newNotes || undefined, status: newStatus }) })
      setSessions(prev => prev.map(s => s.id === session.id ? { ...s, price: newPrice, notes: newNotes, status: newStatus } : s))
      // Update finance transaction if price changed
      if (relatedTxn && newPrice !== session.price) {
        await apiFetch(`/finance/transactions/${relatedTxn.id}`, { method: 'PUT', body: JSON.stringify({ amount: newPrice }) })
        setTransactions(prev => prev.map(t => t.id === relatedTxn.id ? { ...t, amount: newPrice } : t))
      }
      setEditingSessionId(null)
      toast.success('تم تعديل الجلسة')
    } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // ─── Computed ─────────────────────────────────────────────────────────
  // Live Cairo time — computed ONCE on mount, NOT re-rendering the whole app every second
  // The actual clock display is in a separate <CairoClock /> component that isolates re-renders
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [transactions.length, visits.length, sessions.length]) // Cairo timezone - re-computed only when data changes
  // Memoized Cairo date parts for "now" — derived from todayStr
  const cairoNow = useMemo(() => getCairoDateParts(), [todayStr, patients.length, visits.length, sessions.length])
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
  const todayVisits = useMemo(() => visits.filter(v => getLocalDateStr(v.date) === todayStr), [visits, todayStr])

  // Daily finance data - grouped by real date (Cairo timezone)
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
  const todayAppointments = useMemo(() => appointments.filter(a => getLocalDateStr(a.date) === todayStr), [appointments, todayStr])
  const activeAlerts = useMemo(() => alerts.filter(a => a.active), [alerts])

  // Daily visit/session stats for reports (Cairo timezone)
  const dailyVisitStats = useMemo(() => {
    const dayMap: Record<string, { date: string; checkupCount: number; revisitCount: number; sessionCount: number; checkupRevenue: number; revisitRevenue: number; sessionRevenue: number }> = {}
    // Process visits (counts only, NOT revenue - revenue comes from transactions)
    visits.forEach(v => {
      const key = getLocalDateStr(v.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      if (v.type === 'checkup' || v.type === 'checkup_session') dayMap[key].checkupCount++
      else if (v.type === 'revisit' || v.type === 'revisit_session') dayMap[key].revisitCount++
    })
    // Count completed sessions (counts only, NOT revenue - to avoid double-counting with transactions)
    sessions.filter(s => s.status === 'completed').forEach(s => {
      const key = getLocalDateStr(s.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      dayMap[key].sessionCount++
    })
    // Process ALL revenue from transactions ONLY (single source of truth - matches Finance section)
    transactions.filter(t => t.category !== 'personal').forEach(t => {
      const key = getLocalDateStr(t.date)
      if (!dayMap[key]) dayMap[key] = { date: key, checkupCount: 0, revisitCount: 0, sessionCount: 0, checkupRevenue: 0, revisitRevenue: 0, sessionRevenue: 0 }
      if (t.type === 'income' && t.category === 'كشف') dayMap[key].checkupRevenue += t.amount || 0
      else if (t.type === 'income' && t.category === 'إعادة') dayMap[key].revisitRevenue += t.amount || 0
      else if (t.type === 'income' && (t.category === 'جلسات' || t.category === 'ليزر' || t.category === 'متابعة')) dayMap[key].sessionRevenue += t.amount || 0
    })
    return Object.values(dayMap).sort((a, b) => b.date.localeCompare(a.date))
  }, [visits, sessions, transactions])
  const lowStockItems = useMemo(() => inventoryItems.filter(i => i.quantity <= i.minQuantity), [inventoryItems])
  const patientGenderCounts = useMemo(() => ({ male: patients.filter(p => p.gender === 'male').length, female: patients.filter(p => p.gender === 'female').length }), [patients])
  const maleCount = patientGenderCounts.male
  const femaleCount = patientGenderCounts.female
  const revenueChartData = useMemo(() => {
    // Pre-compute transaction date map for O(1) lookup
    const txByDate: Record<string, { income: number; expense: number }> = {}
    for (const t of transactions) {
      if (t.category === 'personal') continue
      const ds = getLocalDateStr(t.date)
      if (!txByDate[ds]) txByDate[ds] = { income: 0, expense: 0 }
      if (t.type === 'income') txByDate[ds].income += t.amount
      else txByDate[ds].expense += t.amount
    }
    // Use Egyptian week days (Saturday→Friday) for consistent week display
    const weekDays = getEgyptianWeekDays()
    const days: { name: string; إيراد: number; مصروف: number }[] = weekDays.map(wd => {
      const dayData = txByDate[wd.dateStr] || { income: 0, expense: 0 }
      return { name: wd.dayName, إيراد: dayData.income, مصروف: dayData.expense }
    })
    return days
  }, [transactions])
  const genderData = [{ name: 'ذكور', value: maleCount || 1 }, { name: 'إناث', value: femaleCount || 1 }]
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 250)

  // ─── Lookup maps for O(1) access instead of O(N) .filter() per patient ──
  const visitsByPatient = useMemo(() => {
    const m = new Map<string, Visit[]>(); for (const v of visits) { const a = m.get(v.patientId) || []; a.push(v); m.set(v.patientId, a) }; return m
  }, [visits])
  const sessionsByPatient = useMemo(() => {
    const m = new Map<string, Session[]>(); for (const s of sessions) { const a = m.get(s.patientId) || []; a.push(s); m.set(s.patientId, a) }; return m
  }, [sessions])

  const filteredPatients = useMemo(() => {
    let list = patients
    if (debouncedSearchQuery) {
      const results = patients.map(p => {
        // O(1) lookup instead of O(N) .filter()
        const patientVisits = visitsByPatient.get(p.id) || []
        const visitDiagnoses = patientVisits.map(v => v.diagnosis).filter(Boolean).join(' ')
        const visitNotes = patientVisits.map(v => v.notes).filter(Boolean).join(' ')
        const patientSessions = sessionsByPatient.get(p.id) || []
        const sessionNotes = patientSessions.map(s => s.notes).filter(Boolean).join(' ')

        // Determine which fields to search based on searchField filter
        let fields: (string | undefined)[]
        switch(searchField) {
          case 'name': fields = [p.name]; break
          case 'address': fields = [p.address]; break
          case 'diagnosis': fields = [visitDiagnoses, p.medicalHistory]; break
          case 'phone': fields = [p.phone, p.phone2]; break
          case 'notes': fields = [p.notes, visitNotes, sessionNotes]; break
          default: fields = [p.name, p.phone, p.phone2, p.fileNumber, p.notes, p.address, p.allergies, p.medicalHistory, p.bloodType, p.gender, visitDiagnoses, visitNotes, sessionNotes]
        }

        const { match, score } = smartSearch(debouncedSearchQuery, fields)
        return { patient: p, match, score }
      }).filter(r => r.match).sort((a, b) => b.score - a.score).map(r => r.patient)
      list = results
    }
    if (patientFilter === 'starred') list = list.filter(p => p.starred)
    if (patientFilter === 'improved') list = list.filter(p => p.improved)
    if (patientFilter === 'publishable') list = list.filter(p => p.publishable)
    if (patientFilter === 'dangerous') list = list.filter(p => p.dangerous)
    return list
  }, [patients, visitsByPatient, sessionsByPatient, debouncedSearchQuery, patientFilter, searchField])
  useEffect(() => { setPatientDisplayCount(50) }, [debouncedSearchQuery])

  // ─── Financial Computed Values ──────────────────────────────
  // All clinic financials EXCLUDE personal transactions (category !== 'personal')
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
  const thisWeekIncome = revenueChartData.reduce((s, d) => s + (d.إيراد || 0), 0)
  const revenueByCategory = useMemo(() => [
    { name: 'كشف', value: checkupRevenue || 0 },
    { name: 'إعادة', value: revisitRevenue || 0 },
    { name: 'جلسات', value: sessionRevenue || 0 },
    { name: 'ليزر', value: laserRevenue || 0 },
    { name: 'متابعة', value: followUpRevenue || 0 },
    { name: 'أخرى', value: otherRevenue || 0 },
  ].filter(d => d.value > 0), [checkupRevenue, revisitRevenue, sessionRevenue, laserRevenue, followUpRevenue, otherRevenue])

  // ─── Weekly Revenue Comparison (Saturday–Friday Egyptian week) ───
  const weeklyComparison = useMemo(() => {
    // Calculate Saturday-to-Friday week boundaries in Cairo timezone
    const nowCairo = new Date(new Date().toLocaleString('en-US', { timeZone: 'Africa/Cairo' }))
    const dayOfWeek = nowCairo.getDay() // 0=Sun, 6=Sat
    const daysSinceSaturday = (dayOfWeek + 1) % 7 // Sat=0, Sun=1, ..., Fri=6
    // This week: from Saturday to today
    const thisWeekDays = new Set<string>()
    for (let i = daysSinceSaturday; i >= 0; i--) {
      const d = new Date(nowCairo)
      d.setDate(d.getDate() - i)
      thisWeekDays.add(d.toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }))
    }
    // Last week: the 7 days before this Saturday
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

  // ─── Top Patients by Visits (O(N) using lookup maps instead of O(N²) filter-per-patient) ───
  const topPatientsByVisits = useMemo(() => {
    // Build O(1) lookup maps once
    const visitCountByPatient: Record<string, number> = {}
    for (const v of visits) visitCountByPatient[v.patientId] = (visitCountByPatient[v.patientId] || 0) + 1
    const sessionCountByPatient: Record<string, number> = {}
    for (const s of sessions) sessionCountByPatient[s.patientId] = (sessionCountByPatient[s.patientId] || 0) + 1
    const spentByPatient: Record<string, number> = {}
    for (const t of transactions) {
      if (t.type === 'income' && t.category !== 'personal' && t.description) {
        // Match patient by name — fragile but preserves existing logic
        const matched = patients.find(p => t.description?.includes(p.name))
        if (matched) spentByPatient[matched.id] = (spentByPatient[matched.id] || 0) + t.amount
      }
    }
    // Build result using O(1) lookups
    const countMap: Record<string, { patient: Patient; visitCount: number; sessionCount: number; totalSpent: number }> = {}
    patients.forEach(p => {
      const vc = visitCountByPatient[p.id] || 0
      const sc = sessionCountByPatient[p.id] || 0
      if (vc + sc > 0) countMap[p.id] = { patient: p, visitCount: vc, sessionCount: sc, totalSpent: spentByPatient[p.id] || 0 }
    })
    return Object.values(countMap).sort((a, b) => (b.visitCount + b.sessionCount) - (a.visitCount + a.sessionCount)).slice(0, 5)
  }, [patients, visits, sessions, transactions])

  // ─── WhatsApp Daily Summary ───
  const shareDailySummary = () => {
    const cairoNow = getCairoDateParts()
    const todayStats = dailyVisitStats.find(d => d.date === todayStr)
    const summary = `🏥 *تقرير عيادة المجازي اليومي*
📅 ${new Date().toLocaleDateString('ar-EG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'Africa/Cairo' })}

🩺 كشف: ${todayStats?.checkupCount || 0} (${formatCurrency(todayStats?.checkupRevenue || 0)})
🔄 إعادة: ${todayStats?.revisitCount || 0} (${formatCurrency(todayStats?.revisitRevenue || 0)})
⚡ جلسات: ${todayStats?.sessionCount || 0} (${formatCurrency(todayStats?.sessionRevenue || 0)})

💰 إيراد اليوم: ${formatCurrency(todayIncome)}
📉 مصروفات: ${formatCurrency(todayExpense)}
📊 صافي الربح: ${formatCurrency(todayNetProfit)}

👥 إجمالي المرضى: ${patients.length}
📅 مواعيد اليوم: ${todayAppointments.length}`
    window.open(`https://wa.me/?text=${encodeURIComponent(summary)}`, '_blank')
  }

  // Laser hair removal sessions - pre-computed for performance and stability
  const laserHairSessions = useMemo(() => sessions.filter(s => {
    try {
      const svc = services.find(sv => sv.id === s.serviceId)
      if (svc?.category?.includes('ليزر')) return true
      if (s.notes?.startsWith('ليزر')) return true
      return false
    } catch { return false }
  }), [sessions, services])

  // Smart search
  const smartSearchResults = useMemo(() => {
    if (!smartSearchQuery.trim()) return []
    const r: { type: string; label: string; sub: string; id: string; icon: React.ReactNode }[] = []
    patients.forEach(p => {
      const patientVisits = visits.filter(v => v.patientId === p.id)
      const visitDiagnoses = patientVisits.map(v => v.diagnosis).filter(Boolean).join(' ')
      const { match } = smartSearch(smartSearchQuery, [p.name, p.phone, p.phone2, p.fileNumber, p.notes, p.address, p.allergies, p.medicalHistory, p.bloodType, p.gender, visitDiagnoses])
      if (match) r.push({ type: 'patient', label: p.name, sub: `${p.fileNumber} | ${p.phone || ''}`, id: p.id, icon: <Users size={16} className="text-blue-500" /> })
    })
    services.forEach(s => { if (s.name.toLowerCase().includes(smartSearchQuery.toLowerCase())) r.push({ type: 'service', label: s.name, sub: formatCurrency(s.price), id: s.id, icon: <Activity size={16} className="text-orange-500" /> }) })
    return r.slice(0, 20)
  }, [smartSearchQuery, patients, services, visits])
  useEffect(() => { const h = (e: KeyboardEvent) => { if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSmartSearchOpen(true) } if (e.key === 'Escape') setSmartSearchOpen(false) }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h) }, [])

  // ─── Patient Import Parser (supports JSON, CSV, TSV, XLSX) ───
  const parsePatientFile = async (file: File): Promise<any[]> => {
    const fileName = file.name.toLowerCase()
    const text = await file.text()

    // Remove BOM if present
    const cleanText = text.replace(/^\uFEFF/, '')

    // ─── JSON ───
    if (fileName.endsWith('.json')) {
      const data = JSON.parse(cleanText)
      // Support multiple JSON formats:
      // 1. { patients: [...] }
      // 2. { type: 'patients-only', patients: [...] }
      // 3. [ {...}, {...} ]  (array directly)
      // 4. { data: [...] }
      const patientList = data?.patients || data?.data || (Array.isArray(data) ? data : [])
      if (!Array.isArray(patientList) || patientList.length === 0) throw new Error('الملف لا يحتوي على بيانات مرضى')
      return patientList.map(normalizePatientFields)
    }

    // ─── XLSX ───
    if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const XLSX = await import('xlsx')
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' })
      const firstSheet = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheet]
      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, { defval: '' })
      if (!jsonData.length) throw new Error('ملف Excel فارغ')
      return jsonData.map(normalizePatientFields)
    }

    // ─── CSV / TSV / TXT ───
    if (fileName.endsWith('.csv') || fileName.endsWith('.tsv') || fileName.endsWith('.txt')) {
      // Auto-detect delimiter: tab for TSV, comma for CSV, semicolon as fallback
      const firstLine = cleanText.split('\n')[0] || ''
      let delimiter = ','
      if (fileName.endsWith('.tsv') || firstLine.includes('\t')) delimiter = '\t'
      else if (!firstLine.includes(',') && firstLine.includes(';')) delimiter = ';'

      const lines = cleanText.split(/\r?\n/).filter(l => l.trim())
      if (lines.length < 2) throw new Error('الملف فارغ أو لا يحتوي على بيانات')

      // Parse headers
      const headers = parseCSVLine(lines[0], delimiter).map(h => h.trim().replace(/^"|"$/g, ''))

      // Parse data rows
      const patients: any[] = []
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i], delimiter)
        const obj: Record<string, string> = {}
        headers.forEach((h, idx) => {
          obj[h] = (values[idx] || '').trim().replace(/^"|"$/g, '')
        })
        patients.push(normalizePatientFields(obj))
      }
      const validPatients = patients.filter(p => p.name)
      if (!validPatients.length) throw new Error('لم يتم العثور على أسماء مرضى في الملف')
      return validPatients
    }

    throw new Error('صيغة الملف غير مدعومة. استخدم JSON أو CSV أو Excel')
  }

  // Parse a single CSV line respecting quoted fields
  const parseCSVLine = (line: string, delimiter: string): string[] => {
    const result: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (inQuotes) {
        if (char === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"' // Escaped quote
            i++
          } else {
            inQuotes = false // End of quoted field
          }
        } else {
          current += char
        }
      } else {
        if (char === '"') {
          inQuotes = true
        } else if (char === delimiter) {
          result.push(current)
          current = ''
        } else {
          current += char
        }
      }
    }
    result.push(current)
    return result
  }

  // Normalize patient fields from various header names (Arabic/English)
  const normalizePatientFields = (raw: any): any => {
    const find = (...keys: string[]): any => {
      for (const k of keys) {
        if (raw[k] !== undefined && raw[k] !== null && String(raw[k]).trim() !== '') return raw[k]
      }
      return undefined
    }
    const name = find('name', 'الاسم', 'Name', 'اسم المريض', 'اسم', 'Patient Name', 'patient_name')
    const phone = find('phone', 'الموبايل', 'هاتف', 'Phone', 'موبايل', 'موبايل ١', 'رقم الهاتف', 'التليفون', 'phone1')
    const phone2 = find('phone2', 'الموبايل ٢', 'موبايل ٢', 'Phone2', 'هاتف ٢', 'رقم هاتف ٢', 'phone_2')
    const age = find('age', 'العمر', 'Age', 'عمر')
    const gender = find('gender', 'الجنس', 'Gender', 'جنس')
    const bloodType = find('bloodType', 'فصيلة الدم', 'BloodType', 'فصيلة', 'blood_type')
    const address = find('address', 'العنوان', 'Address', 'عنوان')
    const notes = find('notes', 'ملاحظات', 'Notes', 'الملاحظات', 'ملاحظه', 'ملاحظة')
    const allergies = find('allergies', 'الحساسية', 'Allergies', 'حساسية', 'حساسيه')
    const medicalHistory = find('medicalHistory', 'التاريخ المرضي', 'MedicalHistory', 'تاريخ مرضي', 'medical_history', 'أمراض مزمنة', 'امراض')

    // Normalize gender
    let normalizedGender: string | null = null
    const genderStr = gender?.toString().trim().toLowerCase()
    if (genderStr) {
      if (['male', 'm', 'ذكر', 'ذكرى'].includes(genderStr)) normalizedGender = 'male'
      else if (['female', 'f', 'أنثى', 'انثى'].includes(genderStr)) normalizedGender = 'female'
      else normalizedGender = genderStr
    }

    return {
      name: name?.toString().trim() || '',
      phone: phone?.toString().trim() || null,
      phone2: phone2?.toString().trim() || null,
      age: age ? (parseInt(String(age)) || null) : null,
      gender: normalizedGender,
      bloodType: bloodType?.toString().trim() || null,
      address: address?.toString().trim() || null,
      notes: notes?.toString().trim() || null,
      allergies: allergies?.toString().trim() || null,
      medicalHistory: medicalHistory?.toString().trim() || null,
    }
  }

  // ─── Backup Functions ─────────────────────────────────────────────────
  const createBackup = async () => { try { await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'manual' }) }); setLastBackup(cairoISO()); toast.success('تم إنشاء نسخة احتياطية'); loadAllData() } catch { toast.error('فشل إنشاء النسخة') } }
  // Strip virtual/relation fields that aren't real DB columns (e.g. _count, patient, visits, etc.)
  const stripVirtualFields = (record: any) => {
    if (!record || typeof record !== 'object') return record
    const virtualFields = ['_count', 'patient', 'doctor', 'user', 'service', 'laserRecord',
      'laserPackage', 'inventoryItem', 'treatmentPlan', 'phase', 'followUpVisits',
      'visits', 'sessions', 'alerts', 'patientNotes', 'laserRecords',
      'appointments', 'photos', 'treatmentPlans', 'reminders',
      'waitingQueue', 'prescriptions', 'followUpRecords', 'items', 'transactions', 'notes', 'medications']
    const cleaned = { ...record }
    for (const f of virtualFields) delete cleaned[f]
    return cleaned
  }

  const exportBackup = async (format: string) => {
    try {
      // Use server-side backup for comprehensive JSON export (includes ALL data types)
      if (format === 'json') {
        const backupRes: any = await apiFetch('/backups', { method: 'POST', body: JSON.stringify({ type: 'export' }) })
        // Now fetch the backup data
        const backupDetail: any = await apiFetch(`/backups/${backupRes.backup?.id || ''}`)
        const backupData = backupDetail?.data
        if (backupData) {
          const parsed = typeof backupData === 'string' ? JSON.parse(backupData) : backupData
          const content = JSON.stringify(parsed, null, 2)
          const blob = new Blob([content], { type: 'application/json' })
          const url = URL.createObjectURL(blob)
          const a = document.createElement('a')
          a.href = url; a.download = `elmoghazi-full-${todayStr}.json`; a.click()
          URL.revokeObjectURL(url)
          toast.success('تم تصدير نسخة احتياطية كاملة')
          return
        }
      }
      // Fallback: client-side export (strips virtual fields for safe re-import)
      const data = {
        patients: patients.map(stripVirtualFields),
        visits, sessions, services, transactions, appointments: laserRecords.map(stripVirtualFields), inventoryItems, medications, reminders, notes, alerts,
        followUpRecords: followUpRecords.map(stripVirtualFields),
        exportDate: cairoISO()
      }
      let content: string; let filename: string; let mimeType: string
      if (format === 'csv') { const headers = Object.keys(patients[0] || {}).join(','); const rows = patients.map(p => Object.values(p).join(',')).join('\n'); content = headers + '\n' + rows; filename = `elmoghazi-${todayStr}.csv`; mimeType = 'text/csv' }
      else { content = JSON.stringify(data, null, 2); filename = `elmoghazi-${todayStr}.json`; mimeType = 'application/json' }
      const blob = new Blob([content], { type: mimeType }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = filename; a.click(); URL.revokeObjectURL(url); toast.success(`تم تصدير النسخة ${format.toUpperCase()}`)
    } catch (e: any) { console.error('Export error:', e); toast.error('فشل التصدير: ' + (e.message || '')) }
  }
  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return
    try {
      const text = await file.text()
      if (file.name.endsWith('.json')) {
        const data = JSON.parse(text)
        // Support both backup formats:
        // 1. Full backup with wrapper: { exportedAt, version, data: { ... } }
        // 2. Direct data format: { patients: [...], visits: [...], ... }
        const backupData = data?.data || data
        // Check if this looks like a full backup
        const knownKeys = ['users','patients','services','visits','sessions','transactions','laserRecords','laserSessions','laserNotes','laserPackages','laserSettings','appointments','notes','alerts','reminders','medications','inventoryItems','inventoryTransactions','treatmentPlans','treatmentPhases','treatmentPlanSessions','patientPhotos','prescriptions','prescriptionItems','notifications','auditLogs','partnerDoctors','followUpRecords','followUpVisits']
        const hasBackupData = knownKeys.some(k => Array.isArray(backupData?.[k]) && backupData[k].length > 0)
        if (hasBackupData) {
          // Full backup restore via dedicated import endpoint
          setRestoreConfirmOpen(true)
          setPendingRestoreData(backupData)
        } else if (data?.patients && Array.isArray(data.patients)) {
          // Simple patient import (only patients, no other data)
          for (const p of data.patients) await addItem('/patients', p, setPatients)
          toast.success(`تم استيراد ${data.patients.length} مريض`)
        } else {
          toast.error('صيغة الملف غير مدعومة - الملف لا يحتوي على بيانات صالحة')
        }
      } else { toast.error('صيغة غير مدعومة - يجب أن يكون الملف بامتداد .json') }
    } catch (err: any) { toast.error('فشل الاستيراد: ' + (err.message || 'ملف تالف')) }
    e.target.value = ''
  }

  // ─── Handle Smart Patient Registration ────────────────────────────────
  const handleSmartPatientSubmit = async () => {
    if (!newPatientName.trim()) return toast.error('الاسم مطلوب')
    // Create patient
    const patient = await addItem('/patients', { name: newPatientName, phone: newPatientPhone, age: parseInt(newPatientAge) || null, gender: newPatientDiagnosis || null, address: newPatientAddress, notes: newPatientNotes }, setPatients)
    if (!patient) return

    const patientId = patient.id
    // Combine any picked date with current Cairo time so the stored timestamp reflects
    // the actual moment of entry. A bare "YYYY-MM-DD" would be saved as Cairo midnight,
    // producing a multi-hour offset vs. the real entry time.
    const customDate = cairoDateTime(newPatientDate)
    const effectiveVisitPrice = visitPrice || (selectedVisitType === 'checkup' || selectedVisitType === 'checkup_session' ? String(defaultCheckupPrice) : selectedVisitType === 'revisit' || selectedVisitType === 'revisit_session' ? String(defaultRevisitPrice) : '')
    const vPrice = parseFloat(effectiveVisitPrice) || 0
    const sPrice = parseFloat(customServicePrice) || 0

    // Determine visit and session needs based on selected type (including combos)
    const needsVisit = ['checkup', 'revisit', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const needsSession = ['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType)
    const visitType = selectedVisitType === 'checkup_session' ? 'checkup' : selectedVisitType === 'revisit_session' ? 'revisit' : selectedVisitType
    const visitCategory = getVisitCategory(visitType)

    // Create visit if needed + financial transaction for كشف/إعادة
    if (needsVisit && (visitType === 'checkup' || visitType === 'revisit')) {
      await addItem('/visits', { patientId, type: visitType, date: customDate }, setVisits)
      // Auto-create income transaction for كشف/إعادة
      if (vPrice > 0) {
        await addItem('/finance/transactions', { type: 'income', category: visitCategory, amount: vPrice, description: `${visitCategory} - ${newPatientName}`, date: customDate }, setTransactions)
      }
    }

    // Create sessions for selected services - use custom price entered by user
    if (needsSession && selectedServiceIds.length > 0) {
      for (const serviceId of selectedServiceIds) {
        await addItem('/sessions', { patientId, serviceId, status: 'completed', price: sPrice, paid: true, date: customDate }, setSessions)
      }
      // Auto-create income transaction for sessions
      if (sPrice > 0) {
        const svcNames = selectedServiceIds.map(id => services.find(s => s.id === id)?.name).filter(Boolean).join(', ')
        await addItem('/finance/transactions', { type: 'income', category: 'جلسات', amount: sPrice, description: `${svcNames || 'جلسة'} - ${newPatientName}`, date: customDate }, setTransactions)
      }
    }

    // Reset form
    setNewPatientName(''); setNewPatientPhone(''); setNewPatientAddress(''); setNewPatientAge(''); setNewPatientDiagnosis(''); setNewPatientNotes(''); setSelectedVisitType(''); setSelectedServiceIds([]); setCustomServicePrice(''); setVisitPrice(''); setNewPatientDate(''); setShowAddPatient(false)
    // Reload transactions from DB to ensure financial data is in sync
    try { const txnRes = await apiFetch<any>('/finance/transactions?limit=100000'); const dbTxns = txnRes?.transactions || []; if (dbTxns.length > 0) setTransactions(dbTxns) } catch {}
    toast.success(`تم تسجيل المريض ${newPatientName} بنجاح`)
  }

  // Services grouped by category for smart form (must be before early return - Rules of Hooks)
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, Service[]> = {}
    services.filter(s => s.active).forEach(s => { const cat = s.category || 'عام'; if (!cats[cat]) cats[cat] = []; cats[cat].push(s) })
    return cats
  }, [services])

  // Selected follow-up record (component-level so dialogs can access it)
  const selectedFU = useMemo(() => followUpRecords.find(f => f.id === selectedFollowUpId), [followUpRecords, selectedFollowUpId])

  // ─── Quick Notes helper - Professional Animated ────────────────────
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

  // ─── Role-based access control ────────────────────────────────────────
  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor
  const canEditPatientFull = isDoctor
  const canAddPatient = isDoctor
  const allowedTabs = isDoctor ? ['dashboard', 'patients', 'sessions', 'laser', 'finance', 'messages', 'more', 'settings'] : ['patients', 'laser', 'waiting']
  const handleTabSwitch = (tab: string) => {
    if (!allowedTabs.includes(tab)) {
      toast.error('هذا القسم غير متاح للسكرتيرة'); return
    }
    // Check section password protection
    if (sectionPasswords[tab]) {
      setPendingTab(tab)
      setPasswordTarget(tab)
      setPasswordInput('')
      setPasswordDialogOpen(true)
      return
    }
    setActiveTab(tab)
    if (tab === 'patients') setSelectedPatient(null)
  }
  const verifyPassword = () => {
    const storedPassword = sectionPasswords[passwordTarget]
    if (passwordInput === storedPassword) {
      setPasswordDialogOpen(false)
      setActiveTab(pendingTab)
      if (pendingTab === 'patients') setSelectedPatient(null)
      toast.success('تم التحقق بنجاح ✓')
    } else {
      toast.error('كلمة السر غير صحيحة')
    }
  }

  // ─── Doctor financial calculations ────────────────────────────────────
  const doctorEarnings = useMemo(() => {
    return doctors.map(d => {
      const checkupEarn = checkupRevenue * (d.checkupPercentage / 100)
      const revisitEarn = revisitRevenue * (d.revisitPercentage / 100)
      const laserEarn = sessionRevenue * (d.laserPercentage / 100)
      const sessionEarn = sessionRevenue * (d.sessionPercentage / 100)
      const total = checkupEarn + revisitEarn + laserEarn + sessionEarn + d.fixedAmount
      return { ...d, checkupEarn, revisitEarn, laserEarn, sessionEarn, totalEarn: total }
    })
  }, [doctors, checkupRevenue, revisitRevenue, sessionRevenue])

  // ─── Bottom Nav ───────────────────────────────────────────────────────
  const allNavItems = [
    { id: 'dashboard', label: 'الرئيسية', emoji: '🏠', icon: <LayoutDashboard size={20} />, activeColor: 'from-emerald-400 to-teal-500', activeShadow: 'shadow-emerald-500/40', labelColor: 'text-emerald-600 dark:text-emerald-400' },
    { id: 'patients', label: 'المرضى', emoji: '👥', icon: <Users size={20} />, activeColor: 'from-blue-400 to-indigo-500', activeShadow: 'shadow-blue-500/40', labelColor: 'text-blue-600 dark:text-blue-400' },
    { id: 'laser', label: 'الليزر', emoji: '💎', icon: <Zap size={20} />, activeColor: 'from-cyan-400 to-violet-500', activeShadow: 'shadow-cyan-500/40', labelColor: 'text-cyan-600 dark:text-cyan-400' },
    { id: 'finance', label: 'المالية', emoji: '💰', icon: <DollarSign size={20} />, activeColor: 'from-amber-400 to-orange-500', activeShadow: 'shadow-amber-500/40', labelColor: 'text-amber-600 dark:text-amber-400' },
    { id: 'messages', label: 'الرسائل', emoji: '📩', icon: <Send size={20} />, activeColor: 'from-[#075E54] to-[#128C7E]', activeShadow: 'shadow-green-500/40', labelColor: 'text-green-600 dark:text-green-400' },
    { id: 'more', label: 'المزيد', emoji: '📋', icon: <MoreHorizontal size={20} />, activeColor: 'from-rose-400 to-pink-500', activeShadow: 'shadow-rose-500/40', labelColor: 'text-rose-600 dark:text-rose-400' },
  ]
  const bottomNavItems = isDoctor ? allNavItems : allNavItems.filter(i => ['patients', 'laser'].includes(i.id)).concat([{ id: 'waiting', label: 'الانتظار', emoji: '⏳', icon: <Timer size={20} />, activeColor: 'from-orange-400 to-red-500', activeShadow: 'shadow-orange-500/40', labelColor: 'text-orange-600 dark:text-orange-400' }])

  // ─── LOGIN ────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-900 via-emerald-800 to-emerald-950 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"><div className="absolute top-20 right-20 w-72 h-72 bg-amber-400 rounded-full blur-3xl animate-float" /><div className="absolute bottom-20 left-20 w-96 h-96 bg-emerald-400 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} /></div>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-md mx-4">
          <Card className="glass-heavy border-emerald-700/30 shadow-2xl">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto w-24 h-24 rounded-2xl bg-gradient-to-br from-emerald-500 via-emerald-600 to-teal-700 flex items-center justify-center mb-4 shadow-lg glow-emerald"><Stethoscope className="text-amber-300" size={48} /></div>
              <h1 className="text-3xl font-bold text-gradient-luxury">Elmoghazi Clinic</h1>
              <p className="text-emerald-200/80 mt-1">عيادة المغازى للجلدية والتجميل</p>
            </CardHeader>
            <CardContent className="space-y-4 pt-4">
              {!loginRole ? (
                <div className="space-y-3">
                  <p className="text-emerald-200 text-center text-sm font-bold mb-2">اختر دورك للدخول</p>
 <button onClick={() => setLoginRole('doctor')} className="w-full p-4 rounded-2xl border-2 border-amber-400/30 bg-gradient-to-l from-amber-900/30 to-emerald-900/30 hover:from-amber-900/50 hover:to-emerald-900/50 transition-all flex items-center gap-4 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-lg"><Stethoscope className="text-white" size={28} /></div>
                    <div className="text-right"><p className="text-white font-bold text-lg">طبيب</p><p className="text-emerald-200/60 text-xs">دخول كامل لجميع الأقسام</p></div>
                  </button>
 <button onClick={() => setLoginRole('secretary')} className="w-full p-4 rounded-2xl border-2 border-cyan-400/30 bg-gradient-to-l from-cyan-900/30 to-emerald-900/30 hover:from-cyan-900/50 hover:to-emerald-900/50 transition-all flex items-center gap-4 active:scale-[0.95] hover:scale-[1.05] transition-transform duration-150">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-700 flex items-center justify-center shadow-lg"><Users size={28} className="text-white" /></div>
                    <div className="text-right"><p className="text-white font-bold text-lg">سكرتيرة</p><p className="text-emerald-200/60 text-xs">إدخال البيانات وتعديل الأسماء والتواريخ فقط — الحذف والتعديل الكامل للطبيب</p></div>
                  </button>
                </div>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-900/30 border border-emerald-600/20">
                    <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', loginRole === 'doctor' ? 'bg-gradient-to-br from-amber-500 to-amber-700' : 'bg-gradient-to-br from-cyan-500 to-cyan-700')}>
                      {loginRole === 'doctor' ? <Stethoscope className="text-white" size={18} /> : <Users size={18} className="text-white" />}
                    </div>
                    <div><p className="text-white font-bold text-sm">{loginRole === 'doctor' ? 'طبيب' : 'سكرتيرة'}</p><p className="text-emerald-200/60 text-[10px]">{loginRole === 'doctor' ? 'دخول كامل' : 'إدخال البيانات — الحذف والتعديل الكامل للطبيب'}</p></div>
                    <button onClick={() => { setLoginRole(null); setLoginPassword('') }} className="mr-auto text-emerald-200/60 hover:text-white text-xs">تغيير</button>
                  </div>
                  <div><Label className="text-emerald-200">كلمة المرور</Label><Input type="password" value={loginPassword} onChange={e => setLoginPassword(e.target.value)} placeholder="أدخل كلمة السر..." className="bg-emerald-900/50 border-emerald-600/30 text-white input-luxury rounded-xl h-12 text-center text-lg" onKeyDown={e => e.key === 'Enter' && handleLogin()} autoFocus /></div>
                </motion.div>
              )}
            </CardContent>
            {loginRole && (
              <CardFooter><Button onClick={handleLogin} disabled={loginLoading || !loginPassword} className="w-full bg-gradient-to-l from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold py-6 text-lg btn-luxury rounded-xl shadow-lg">{loginLoading ? <RefreshCw className="animate-spin ml-2" size={20} /> : <Sparkles className="ml-2" size={20} />}دخول</Button></CardFooter>
            )}
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ─── Top Bar ──────────────────────────────────────────────────── */}
      <header className="h-14 border-b border-border bg-card/80 backdrop-blur-sm flex items-center gap-3 px-4 sticky top-0 z-30">
        <div className="flex items-center gap-2"><div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center"><Stethoscope className="text-amber-300" size={16} /></div><span className="font-bold text-sm text-gradient-luxury hidden sm:block">Elmoghazi</span></div>
        <button onClick={() => setSmartSearchOpen(true)} className="flex-1 max-w-md flex items-center gap-2 px-4 py-2 rounded-xl bg-muted/50 border border-border/50 text-muted-foreground text-sm hover:bg-muted transition-colors cursor-pointer"><Search size={16} /><span>بحث ذكي...</span><kbd className="mr-auto text-[10px] bg-muted px-1.5 py-0.5 rounded border border-border hidden sm:block">Ctrl+K</kbd></button>
        <div className="flex items-center gap-1 mr-auto">
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-l from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20">
            <Clock size={14} className="text-amber-600 dark:text-amber-400" />
            <CairoClock className="text-xs font-bold text-amber-700 dark:text-amber-300 font-mono" />
          </div>

          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={18} /> : <Moon size={18} />}</Button>
          <Button variant="ghost" size="icon" className="h-9 w-9" onClick={loadAllData}><RefreshCw size={16} className={loading ? 'animate-spin' : ''} /></Button>
          <DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-9 w-9"><Avatar className="h-8 w-8 border-2 border-primary/30"><AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">{user?.name?.charAt(0) || 'د'}</AvatarFallback></Avatar></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem onClick={() => handleTabSwitch('settings')}><Settings size={14} className="ml-2" /> الإعدادات</DropdownMenuItem><DropdownMenuItem onClick={() => { logout(); toast.success('تم تسجيل الخروج') }} className="text-red-500"><LogOut size={14} className="ml-2" /> خروج</DropdownMenuItem></DropdownMenuContent></DropdownMenu>
        </div>
      </header>

      {/* ─── Content ────────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 md:px-6 pt-4">
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.25 }}>

            {/* ═══ DASHBOARD — Professional Design ═══ */}
            {activeTab === 'dashboard' && <ErrorBoundary><DashboardSection /></ErrorBoundary>}

            {/* ═══ MESSAGES ═══ */}
            {activeTab === 'messages' && <ErrorBoundary><MessageSection /></ErrorBoundary>}

            {/* ═══ PATIENTS ═══ */}
            {activeTab === 'patients' && !selectedPatient && (
              <div className="space-y-5">
                <div className="section-header-animated rounded-2xl bg-gradient-to-l from-blue-50 via-indigo-50 to-violet-50 dark:from-blue-950/30 dark:via-indigo-950/20 dark:to-violet-950/30 relative overflow-hidden">
                  {/* Floating decorative dots */}
                  <div className="float-dot w-3 h-3 bg-blue-400 dark:bg-blue-500 top-3 right-10" style={{animationDelay: '0s'}} />
                  <div className="float-dot w-2 h-2 bg-indigo-400 dark:bg-indigo-500 top-8 right-24" style={{animationDelay: '1s'}} />
                  <div className="float-dot w-4 h-4 bg-violet-300 dark:bg-violet-600 bottom-3 left-16" style={{animationDelay: '2s'}} />
                  <div className="float-dot w-2 h-2 bg-pink-400 dark:bg-pink-500 bottom-6 left-8" style={{animationDelay: '0.5s'}} />
                  <div className="relative z-10 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="header-3d-icon">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/30" style={{transformStyle: 'preserve-3d'}}>
                          <Users size={28} className="text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-2xl font-bold">إدارة المرضى</h1>
                        <p className="text-sm"><span className="patient-count-animated font-black text-lg">{patients.length}</span> <span className="text-muted-foreground">مريض</span></p>
                      </div>
                    </div>
                    {canAddPatient && <Button className="btn-luxury bg-gradient-to-l from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 transition-shadow" onClick={() => setShowAddPatient(true)}>
                      <UserPlus size={16} className="ml-2" /> تسجيل مريض
                    </Button>}
                  </div>
                </div>
                {/* Search + Smart Filters */}
                <div className="space-y-3">
                  {/* Enhanced Search Bar */}
                  <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-l from-violet-500 via-fuchsia-500 to-rose-500 rounded-2xl opacity-20 group-hover:opacity-40 blur transition-opacity" />
                    <div className="relative">
                      <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                      <Input 
                        placeholder="بحث ذكي... الاسم أو الهاتف أو العنوان أو التشخيص" 
                        value={searchQuery} 
                        onChange={e => setSearchQuery(e.target.value)} 
                        className="pr-12 input-luxury rounded-2xl h-14 text-base border-2 border-transparent focus:border-violet-400 bg-background" 
                      />
                      {searchQuery && (
                        <button onClick={() => setSearchQuery('')} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                          <X size={18} />
                        </button>
                      )}
                    </div>
                  </div>
                  {searchQuery && debouncedSearchQuery !== searchQuery && <p className="text-[10px] text-muted-foreground animate-pulse">جاري البحث...</p>}
                  {debouncedSearchQuery && filteredPatients.length === 0 && patients.length > 0 && (
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                      <Search size={14} className="text-amber-500" />
                      <p className="text-[10px] text-amber-700 dark:text-amber-400">لا توجد نتائج لـ &quot;{debouncedSearchQuery}&quot; — يتم البحث بتصحيح تلقائي</p>
                    </div>
                  )}
                  {debouncedSearchQuery && filteredPatients.length > 0 && filteredPatients.length < patients.length && (
                    <p className="text-[10px] text-muted-foreground">عُثر على {filteredPatients.length} نتيجة</p>
                  )}

                  {/* Smart Filter Chips */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      { id: 'all', label: 'الكل', emoji: '🏷️', gradient: 'from-violet-500 to-fuchsia-500' },
                      { id: 'name', label: 'الاسم', emoji: '👤', gradient: 'from-blue-500 to-cyan-500' },
                      { id: 'address', label: 'العنوان', emoji: '📍', gradient: 'from-emerald-500 to-teal-500' },
                      { id: 'diagnosis', label: 'التشخيص', emoji: '🩺', gradient: 'from-rose-500 to-pink-500' },
                      { id: 'phone', label: 'الهاتف', emoji: '📞', gradient: 'from-amber-500 to-orange-500' },
                      { id: 'notes', label: 'الملاحظات', emoji: '📋', gradient: 'from-purple-500 to-violet-500' },
                    ].map(chip => (
                      <button
                        key={chip.id}
                        onClick={() => setSearchField(chip.id as 'all' | 'name' | 'address' | 'diagnosis' | 'phone' | 'notes')}
                        className={cn(
                          'flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-bold transition-all border-2 shadow-sm active:scale-[0.93] hover:scale-[1.05] transition-transform duration-150',
                          searchField === chip.id
                            ? `bg-gradient-to-l ${chip.gradient} text-white border-transparent shadow-md`
                            : 'bg-card border-border text-muted-foreground hover:border-violet-300 dark:hover:border-violet-700'
                        )}
                      >
                        <span className="text-base">{chip.emoji}</span>
                        <span style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{chip.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Starred/Improved filters */}
                  <div className="flex items-center gap-2">
 <button onClick={() => setPatientFilter(patientFilter === 'starred' ? 'all' : 'starred')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', patientFilter === 'starred' ? 'bg-amber-100 dark:bg-amber-900/30 border-amber-400 dark:border-amber-600 text-amber-700 dark:text-amber-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-amber-50 dark:hover:bg-amber-950/20')}><Star size={16} className={patientFilter === 'starred' ? 'text-amber-500 fill-amber-500' : ''} /> ⭐ المميزة</button>
 <button onClick={() => setPatientFilter(patientFilter === 'improved' ? 'all' : 'improved')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', patientFilter === 'improved' ? 'bg-pink-100 dark:bg-pink-900/30 border-pink-400 dark:border-pink-600 text-pink-700 dark:text-pink-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-pink-50 dark:hover:bg-pink-950/20')}><Heart size={16} className={patientFilter === 'improved' ? 'text-pink-500 fill-pink-500' : ''} /> 💗 المتحسنين</button>
 <button onClick={() => setPatientFilter(patientFilter === 'publishable' ? 'all' : 'publishable')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', patientFilter === 'publishable' ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-700 dark:text-green-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-green-50 dark:hover:bg-green-950/20')}><ThumbsUp size={16} className={patientFilter === 'publishable' ? 'text-green-500 fill-green-500' : ''} /> 👍 للنشر</button>
 <button onClick={() => setPatientFilter(patientFilter === 'dangerous' ? 'all' : 'dangerous')} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all border-2 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', patientFilter === 'dangerous' ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-700 dark:text-red-300 shadow-lg' : 'bg-muted/50 border-transparent text-muted-foreground hover:bg-red-50 dark:hover:bg-red-950/20')}><AlertTriangle size={16} className={patientFilter === 'dangerous' ? 'text-red-500' : ''} /> 💀 خطر</button>
                    {patientFilter !== 'all' && <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPatientFilter('all')}>إلغاء الفلتر</Button>}
                  </div>
                </div>
                <div className="space-y-2">
                  {filteredPatients.length === 0 && <Card className="card-luxury p-8 text-center"><p className="text-muted-foreground">{patientFilter === 'starred' ? 'لا توجد حالات مميزة بعد' : patientFilter === 'improved' ? 'لا توجد حالات متحسنة بعد' : patientFilter === 'publishable' ? 'لا توجد حالات للنشر بعد' : patientFilter === 'dangerous' ? 'لا توجد حالات خطر بعد' : 'لا توجد نتائج'}</p></Card>}
                  {filteredPatients.slice(0, patientDisplayCount).map(p => {
                    const stripeGradient = p.gender === 'female' ? 'bg-gradient-to-b from-pink-400 to-rose-500' : p.gender === 'male' ? 'bg-gradient-to-b from-blue-400 to-indigo-500' : 'bg-gradient-to-b from-gray-400 to-gray-500'
                    // Get latest diagnosis from visits
                    const latestDiagnosis = visits.filter(v => v.patientId === p.id && v.diagnosis).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.diagnosis
                    return (
                      <motion.div key={p.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className={cn('patient-card-3d rounded-2xl border bg-card text-card-foreground p-4 cursor-pointer relative transition-all', p.dangerous ? 'border-red-400 dark:border-red-600 shadow-md shadow-red-200 dark:shadow-red-900/30' : 'border-border')} onClick={() => setSelectedPatient(p)}>
                        <div className={`patient-stripe ${p.dangerous ? 'bg-gradient-to-b from-red-500 to-red-700' : stripeGradient}`} />
                        <div className="flex items-center gap-3">
                          <Avatar className="h-14 w-14 border-2 shadow-md" style={{ borderColor: p.colorTag || (p.gender === 'female' ? '#ec4899' : '#3b82f6') }}>
                            <AvatarFallback className="bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-blue-600 dark:text-blue-400 font-black text-xl" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{p.name?.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-black text-base truncate" style={{ fontFamily: "'Noto Sans SC', 'Segoe UI', sans-serif" }}>{safeName(p.name)}</p>
                              {p.starred && <span className="badge-glow text-amber-500 text-sm">⭐</span>}
                              {p.improved && <span className="badge-glow text-pink-500 text-sm" style={{animationDelay: '0.5s'}}>💗</span>}
                              {p.publishable && <span className="badge-glow text-green-500 text-sm" style={{animationDelay: '1s'}}>👍</span>}
                              {p.dangerous && <span className="badge-glow text-red-500 text-sm" style={{animationDelay: '1.5s'}}>💀</span>}
                            </div>
                            <div className="flex items-center gap-2 flex-wrap mt-1">
                              <span className="flex items-center gap-1 px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-[10px] font-bold rounded-full"><Hash size={9} />{p.fileNumber}</span>
                              {p.phone && <span className="flex items-center gap-1 px-2 py-0.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold rounded-full"><Phone size={9} />{p.phone}</span>}
                              {p.age && <span className="flex items-center gap-1 px-2 py-0.5 bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 text-[10px] font-bold rounded-full">🎂 {p.age} سنة</span>}
                            </div>
                            {p.address && <p className="text-[10px] text-muted-foreground mt-1 truncate flex items-center gap-1"><MapPin size={9} className="text-teal-500 flex-shrink-0" />{p.address}</p>}
                            {latestDiagnosis && <p className="text-[10px] text-muted-foreground mt-0.5 truncate flex items-center gap-1"><Stethoscope size={9} className="text-rose-500 flex-shrink-0" />{latestDiagnosis}</p>}
                          </div>
                          {p.gender && <Badge className={cn('text-[10px] font-bold', p.gender === 'female' ? 'bg-gradient-to-r from-pink-100 to-rose-100 text-pink-700 dark:from-pink-900/30 dark:to-rose-900/30 dark:text-pink-400' : 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 dark:from-blue-900/30 dark:to-indigo-900/30 dark:text-blue-400')}>{p.gender === 'female' ? '♀' : '♂'} {p.gender}</Badge>}
                        </div>
                        {/* Waiting status badge + quick send to waiting */}
                        {(() => {
                          const inQueue = waitingQueue.find(w => w.patientId === p.id && (w.status === 'waiting' || w.status === 'in-progress'))
                          return (
                            <div className="flex items-center gap-1.5 mt-2">
                              {inQueue ? (
                                <Badge className={cn('text-[9px] font-bold animate-pulse', inQueue.status === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white')}>
                                  {inQueue.status === 'in-progress' ? '🩺 جاري الكشف' : '⏳ في الانتظار'}
                                </Badge>
                              ) : (
 <button onClick={async (e) => { e.stopPropagation(); await addItem('/waiting', { patientId: p.id, patientName: p.name, priority: p.dangerous ? 2 : 1, status: 'waiting', notes: p.dangerous ? '⚠️ حالة خطر' : undefined }, setWaitingQueue); toast.success(p.dangerous ? 'تم الإضافة كحالة عاجلة ⏳🚨' : 'تم إضافة ⏳ لقائمة الانتظار') }} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/40 transition-all border border-orange-200 dark:border-orange-800 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150">
                                  <Timer size={10} /> إرسال للانتظار
                                </button>
                              )}
                            </div>
                          )
                        })()}
                      </motion.div>
                    )
                  })}
                </div>
                {filteredPatients.length > patientDisplayCount && (
                  <Button variant="outline" className="w-full rounded-xl text-sm font-bold" onClick={() => setPatientDisplayCount(c => c + 50)}>
                    عرض المزيد ({filteredPatients.length - patientDisplayCount} متبقي)
                  </Button>
                )}
                {renderQuickNotes('patients')}
              </div>
            )}

            {/* ═══ PATIENT DETAIL - only mounted when patients tab + selected patient ═══ */}
            {activeTab === 'patients' && selectedPatient && <ErrorBoundary><PatientProfile /></ErrorBoundary>}
            
            {/* ═══ LASER - only mounted when laser tab ═══ */}
            {activeTab === 'laser' && <ErrorBoundary><><LaserCenter />{renderQuickNotes('laser')}</></ErrorBoundary>}

            {/* ═══ FINANCE - only mounted when finance tab ═══ */}
            {activeTab === 'finance' && <ErrorBoundary><FinanceCenter /></ErrorBoundary>}

            {/* ═══ MORE / SETTINGS - only mounted when more/settings tab ═══ */}
            {['more', 'settings'].includes(activeTab) && <ErrorBoundary><MoreSection /></ErrorBoundary>}

            {/* ═══ SETTINGS direct (quick theme picker) ═══ */}
            {activeTab === 'settings' && (<div className="space-y-4"><div className="section-header-animated rounded-2xl bg-indigo-50 dark:bg-indigo-950/30"><div className="relative z-10 flex items-center gap-3"><div className="text-4xl animate-spin-slow">🎨</div><div><h1 className="text-2xl font-bold">الإعدادات</h1></div></div></div><Card className="card-luxury"><CardHeader><CardTitle>ألوان التطبيق</CardTitle></CardHeader><CardContent><div className="grid grid-cols-5 gap-3">{THEME_CONFIGS.map(tc => <button key={tc.id} onClick={() => setTheme(tc.id)} className={cn('theme-swatch flex flex-col items-center justify-center gap-1 p-2', theme === tc.id && 'selected')} style={{ background: `linear-gradient(135deg, ${tc.primary}, ${tc.primaryDark})` }}><span className="text-xl">{tc.icon}</span><span className="text-[9px] font-bold text-white/90 truncate w-full text-center">{tc.name}</span>{theme === tc.id && <CheckCircle className="text-white absolute top-1 right-1" size={14} />}</button>)}</div></CardContent></Card></div>)}

            {/* ═══ WAITING - only mounted when waiting tab (secretary) ═══ */}
            {activeTab === 'waiting' && <WaitingSection />}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ─── Global Confirmation Dialogs (work across all tabs) ─── */}
      
      {/* Restore Backup Confirmation Dialog */}
      <AlertDialog open={restoreConfirmOpen} onOpenChange={setRestoreConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-amber-500" />
              استعادة نسخة احتياطية
            </AlertDialogTitle>
            <AlertDialogDescription>
              <span className="text-red-600 font-bold">تحذير: سيتم حذف جميع البيانات الحالية واستبدالها ببيانات النسخة الاحتياطية!</span>
              <br />هذا الإجراء لا يمكن التراجع عنه. هل تريد المتابعة؟
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction className="bg-amber-600" onClick={() => { if (pendingRestoreData) restoreFromBackup(pendingRestoreData) }}>استعادة</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Bottom Navigation ──────────────────────────────────────────── */}
      <nav className="bottom-nav"><div className="flex items-center justify-around max-w-lg mx-auto">
        {bottomNavItems.map(item => {
          const isActive = activeTab === item.id || (item.id === 'more' && ['more', 'settings'].includes(activeTab))
          const isLocked = !isDoctor && !['patients', 'laser'].includes(item.id)
          return (
            <button key={item.id} onClick={() => handleTabSwitch(item.id)} className={cn('bottom-nav-item', isActive && 'active')} style={isActive ? { '--active-color-from': item.activeColor?.split(' ')[0]?.replace('from-', ''), '--active-color-to': item.activeColor?.split(' ')[1]?.replace('to-', '') } as React.CSSProperties : undefined}>
              <div className={cn('nav-icon-wrapper', isActive && `bg-gradient-to-br ${item.activeColor} ${item.activeShadow} shadow-lg`)}>
                {isActive ? <span className="text-xl">{item.emoji}</span> : item.icon}
                {isLocked && <Lock size={8} className="absolute -top-1 -left-1 text-amber-500" />}
              </div>
              <span className={cn('nav-label', isActive && item.labelColor)}>{item.label}</span>
            </button>
          )
        })}
      </div></nav>

      {/* ─── Smart Search ────────────────────────────────────────────────── */}
      <AnimatePresence>{smartSearchOpen && (<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><div className="smart-search-overlay" onClick={() => setSmartSearchOpen(false)} /><div className="smart-search-panel"><Card className="border-0 shadow-2xl">
        <div className="p-4 border-b border-border"><div className="flex items-center gap-3"><Search size={20} className="text-primary" /><Input value={smartSearchQuery} onChange={e => setSmartSearchQuery(e.target.value)} placeholder="بحث ذكي..." className="border-0 focus-visible:ring-0 text-lg" autoFocus /><Button variant="ghost" size="icon" onClick={() => setSmartSearchOpen(false)}><X size={18} /></Button></div></div>
        <ScrollArea className="max-h-[50vh]">
          {smartSearchQuery && smartSearchResults.length === 0 && <div className="p-8 text-center text-muted-foreground"><p>لا توجد نتائج</p></div>}
          {smartSearchResults.map((r, i) => (<button key={`${r.type}-${r.id}`} onClick={() => { if (r.type === 'patient') { const p = patients.find(pt => pt.id === r.id); if (p) { setSelectedPatient(p); setActiveTab('patients') } } setSmartSearchOpen(false); setSmartSearchQuery('') }} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-right"><div className="p-1.5 rounded-lg bg-muted">{r.icon}</div><div className="flex-1 min-w-0"><p className="font-medium text-sm truncate">{r.label}</p><p className="text-xs text-muted-foreground truncate">{r.sub}</p></div><Badge variant="outline" className="text-[9px]">{r.type === 'patient' ? 'مريض' : 'خدمة'}</Badge></button>))}
        </ScrollArea>
      </Card></div></motion.div>)}</AnimatePresence>

      {/* ═══ SMART PATIENT REGISTRATION DIALOG - REDESIGNED — Doctor Only ═══ */}
      {canAddPatient && <Dialog open={showAddPatient} onOpenChange={setShowAddPatient}>
        <DialogContent className="max-w-lg max-h-[92vh] overflow-y-auto">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-lg"><UserPlus size={20} className="text-primary" /> تسجيل مريض جديد</DialogTitle><DialogDescription>أدخل بيانات المريض واختر نوع الزيارة</DialogDescription></DialogHeader>
          <div className="space-y-4">

            {/* ─── 1. NAME FIELD - PROMINENT AT TOP ─── */}
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="relative">
              <div className={cn('rounded-2xl p-4 border-2 transition-all', newPatientName.trim() ? 'border-emerald-400 dark:border-emerald-600 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30' : 'border-amber-300 dark:border-amber-700 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20')}>
                <Label className="text-sm font-bold flex items-center gap-1.5 mb-2 text-amber-700 dark:text-amber-400">
                  <span className="animate-pulse-scale-lg">✏️</span>
                  اسم المريض <span className="text-red-500">*</span>
                </Label>
                <Input value={newPatientName} onChange={e => setNewPatientName(e.target.value)} placeholder="اكتب اسم المريض أو ابحث عن مريض موجود..." className={cn('rounded-xl h-12 text-base font-bold border-2 transition-all', newPatientName.trim() ? 'border-emerald-300 dark:border-emerald-700 bg-white dark:bg-black/20 focus:border-emerald-500' : 'border-amber-200 dark:border-amber-700 bg-white/80 dark:bg-black/10 focus:border-amber-500')} autoFocus />
                {patientSearchSuggestions.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="absolute top-full left-0 right-0 z-50 mt-2 bg-card border-2 border-emerald-300 dark:border-emerald-800 rounded-xl shadow-2xl overflow-hidden">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 border-b border-emerald-200 dark:border-emerald-800"><p className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1"><Search size={12} /> مرضى موجودين</p></div>
                    {patientSearchSuggestions.map(p => (
                      <button key={p.id} onClick={() => { setSelectedPatient(p); setShowAddPatient(false); setActiveTab('patients') }} className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-right text-sm border-b border-border/50 last:border-0 transition-colors">
                        <Avatar className="h-9 w-9 border-2 border-emerald-300 dark:border-emerald-700"><AvatarFallback className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400 text-xs font-bold">{p.name?.charAt(0)}</AvatarFallback></Avatar>
                        <div className="flex-1 min-w-0"><p className="font-bold truncate text-sm">{p.name}</p><p className="text-xs text-muted-foreground flex items-center gap-2"><Hash size={10} />{p.fileNumber}{p.phone && <><Phone size={10} />{p.phone}</>}</p></div>
                        <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[9px]">فتح</Badge>
                      </button>
                    ))}
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* ─── 2. VISIT TYPE SELECTION - WITH COMBOS ─── */}
            <div>
              <Label className="text-sm font-bold text-violet-600 dark:text-violet-400 flex items-center gap-1 mb-2"><Stethoscope size={14} /> نوع الزيارة</Label>
              <div className="grid grid-cols-3 gap-1.5">
                {/* First row: كشف / إعادة / جلسة */}
                {VISIT_TYPES.slice(0, 3).map(vt => (
 <button key={vt.id} onClick={() => setSelectedVisitType(selectedVisitType === vt.id ? '' : vt.id)} className={cn('flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-white font-medium active:scale-[0.92] hover:scale-[1.03] transition-transform duration-150', vt.bg, selectedVisitType === vt.id ? 'ring-2 shadow-lg scale-[1.02]' : 'opacity-50 hover:opacity-80', selectedVisitType === vt.id && vt.ring)}>
                    <span className="text-sm">{vt.emoji}</span>
                    <span className="text-[10px] font-bold">{vt.label}</span>
                  </button>
                ))}
              </div>
              {/* Second row: Combo types - كشف+جلسة / إعادة+جلسة */}
              <div className="grid grid-cols-2 gap-1.5 mt-1.5">
                {VISIT_TYPES.slice(3).map(vt => (
 <button key={vt.id} onClick={() => setSelectedVisitType(selectedVisitType === vt.id ? '' : vt.id)} className={cn('flex flex-col items-center gap-0.5 p-1.5 rounded-lg border-2 transition-all text-white font-medium active:scale-[0.92] hover:scale-[1.03] transition-transform duration-150', vt.bg, selectedVisitType === vt.id ? 'ring-2 shadow-lg scale-[1.02]' : 'opacity-50 hover:opacity-80', selectedVisitType === vt.id && vt.ring)}>
                    <span className="text-xs">{vt.emoji}</span>
                    <span className="text-[9px] font-bold">{vt.label}</span>
                  </button>
                ))}
              </div>
              {/* Combo indicator */}
              {['checkup_session', 'revisit_session'].includes(selectedVisitType) && (
                <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className="mt-2 p-2.5 rounded-xl bg-gradient-to-l from-violet-50 to-blue-50 dark:from-violet-950/20 dark:to-blue-950/20 border border-violet-200 dark:border-violet-800">
                  <p className="text-xs font-bold text-violet-700 dark:text-violet-400 flex items-center gap-1"><Sparkles size={12} /> زيارة مدمجة: سيتم تسجيل {selectedVisitType === 'checkup_session' ? 'كشف + جلسة' : 'إعادة + جلسة'} معاً</p>
                </motion.div>
              )}
              {/* Service Value - Manual Input */}
              {['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType) && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-emerald-300 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30">
                  <Label className="text-sm font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                    <span className="animate-pulse-scale-lg">💰</span>
                    قيمة الخدمة (ج.م) <span className="text-red-500">*</span>
                  </Label>
                  <Input type="number" value={customServicePrice} onChange={e => setCustomServicePrice(e.target.value)} placeholder="اكتب قيمة الخدمة بالجنيه المصري..." className="rounded-xl h-12 text-lg font-bold border-2 border-emerald-200 dark:border-emerald-700 bg-white dark:bg-black/20 focus:border-emerald-500 text-emerald-700 dark:text-emerald-300" />
                  <p className="text-[10px] text-muted-foreground mt-1.5">سيتم تسجيل هذا المبلغ في المالية تلقائياً</p>
                </motion.div>
              )}
            </div>

            {/* ─── 3. CONTACT INFO - Side by side ─── */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1"><Phone size={14} /> الهاتف</Label>
                <Input dir="ltr" value={newPatientPhone} onChange={e => setNewPatientPhone(normalizePhone(e.target.value))} placeholder="01xxxxxxxxx" className="input-luxury rounded-xl h-11 mt-1 border-emerald-200 dark:border-emerald-800 focus:border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 text-left" />
              </div>
              <div>
                <Label className="text-sm font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1"><MapPin size={14} /> العنوان</Label>
                <Input value={newPatientAddress} onChange={e => setNewPatientAddress(e.target.value)} placeholder="العنوان" className="input-luxury rounded-xl h-11 mt-1 border-indigo-200 dark:border-indigo-800 focus:border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/10" />
              </div>
            </div>

            {/* ─── 4. PERSONAL INFO ROW ─── */}
            <div className="grid grid-cols-2 gap-3">
              <Input value={newPatientAge} onChange={e => setNewPatientAge(e.target.value)} type="number" placeholder="🎂 العمر" className="input-luxury rounded-xl h-11 border-amber-200 dark:border-amber-800 focus:border-amber-500 bg-amber-50/30 dark:bg-amber-950/10" />
              <Input value={newPatientDiagnosis} onChange={e => setNewPatientDiagnosis(e.target.value)} placeholder="🔬 التشخيص" className="rounded-xl h-11 border-pink-200 dark:border-pink-800 bg-pink-50/30 dark:bg-pink-950/10" />
            </div>

            {/* ─── 5. VISIT PRICE (for كشف/إعادة) ─── */}
            {['checkup', 'revisit', 'checkup_session', 'revisit_session'].includes(selectedVisitType) && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 rounded-2xl border-2 border-blue-300 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30">
                <Label className="text-sm font-bold text-blue-700 dark:text-blue-400 flex items-center gap-1.5 mb-2">
                  <span className="animate-pulse-scale-lg">🩺</span>
                  قيمة {selectedVisitType === 'checkup' || selectedVisitType === 'checkup_session' ? 'الكشف' : 'الإعادة'} (ج.م)
                </Label>
                <Input type="number" value={visitPrice || (selectedVisitType === 'checkup' || selectedVisitType === 'checkup_session' ? String(defaultCheckupPrice) : String(defaultRevisitPrice))} onChange={e => setVisitPrice(e.target.value)} placeholder={selectedVisitType === 'checkup' || selectedVisitType === 'checkup_session' ? String(defaultCheckupPrice) : String(defaultRevisitPrice)} className="rounded-xl h-12 text-lg font-bold border-2 border-blue-200 dark:border-blue-700 bg-white dark:bg-black/20 focus:border-blue-500 text-blue-700 dark:text-blue-300" />
                <p className="text-[10px] text-muted-foreground mt-1.5">سيتم تسجيل هذا المبلغ في المالية تلقائياً — القيمة الافتراضية من إعدادات الخدمات</p>
              </motion.div>
            )}

            {/* ─── 6. NOTES ─── */}
            <div>
              <Label className="text-sm font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1"><FileText size={14} /> ملاحظات</Label>
              <Textarea value={newPatientNotes} onChange={e => setNewPatientNotes(e.target.value)} placeholder="ملاحظات إضافية..." className="input-luxury rounded-xl mt-1 border-purple-300 dark:border-purple-800 focus:border-purple-500 min-h-[60px] bg-gradient-to-br from-purple-50/50 to-fuchsia-50/50 dark:from-purple-950/10 dark:to-fuchsia-950/10" />
            </div>

            {/* ─── 6.5. CUSTOM DATE - Optional date override ─── */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-3 rounded-2xl border-2 border-dashed border-cyan-300 dark:border-cyan-700 bg-gradient-to-br from-cyan-50/50 to-sky-50/50 dark:from-cyan-950/10 dark:to-sky-950/10">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={14} className="text-cyan-600 dark:text-cyan-400" />
                <Label className="text-xs font-bold text-cyan-700 dark:text-cyan-400">تاريخ الزيارة (اختياري)</Label>
              </div>
              <Input type="date" value={newPatientDate} onChange={e => setNewPatientDate(e.target.value)} className="rounded-xl h-10 border-cyan-200 dark:border-cyan-800 bg-white dark:bg-black/20 text-sm" />
              <p className="text-[10px] text-muted-foreground mt-1.5 flex items-center gap-1">
                <CalendarCheck size={10} />
                {newPatientDate
                  ? <span className="text-cyan-600 dark:text-cyan-400 font-bold">سيتم التسجيل بتاريخ {newPatientDate} بدلاً من اليوم</span>
                  : <span>اتركه فارغاً للتسجيل بتاريخ اليوم تلقائياً — أو اختر تاريخ إذا تأخرت السكرتيرة في التسجيل</span>
                }
              </p>
            </motion.div>

            {/* ─── 7. SERVICES - AT THE BOTTOM, ELEGANT ─── */}
            {['session', 'checkup_session', 'revisit_session'].includes(selectedVisitType) && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-3">
                <div className="p-4 rounded-2xl border-2 border-orange-200 dark:border-orange-800 bg-gradient-to-br from-orange-50/80 to-amber-50/80 dark:from-orange-950/20 dark:to-amber-950/20">
                  <Label className="text-sm font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5 mb-3">
                    <span className="animate-wiggle-wide">⚡</span>
                    اختر الخدمة
                  </Label>
                  {Object.entries(servicesByCategory).length === 0 && (
                    <div className="text-center py-4"><p className="text-sm text-muted-foreground">لا توجد خدمات متاحة</p><p className="text-xs text-muted-foreground mt-1">أضف خدمات من قسم المزيد ← الخدمات</p></div>
                  )}
                  {Object.entries(servicesByCategory).map(([cat, svcs]) => (
                    <div key={cat} className="mb-3 last:mb-0">
                      <p className="text-xs text-muted-foreground mb-1.5 font-bold flex items-center gap-1"><Tag size={10} /> {cat}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {svcs.map(s => {
                          const isSelected = selectedServiceIds.includes(s.id)
                          return (
 <button key={s.id} onClick={() => setSelectedServiceIds(prev => isSelected ? prev.filter(id => id !== s.id) : [...prev, s.id])} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 text-xs font-medium transition-all active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150', isSelected ? 'bg-orange-500 text-white border-orange-600 shadow-lg shadow-orange-200 dark:shadow-orange-900/30' : 'bg-white/80 dark:bg-black/10 border-orange-200 dark:border-orange-800 hover:border-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/20')}>
                              {isSelected ? <CheckCircle size={12} /> : <Circle size={12} className="text-orange-300" />}
                              <span className="font-bold">{s.name}</span>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  {selectedServiceIds.length > 0 && customServicePrice && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 p-3 rounded-xl bg-orange-500/10 border border-orange-300 dark:border-orange-700 flex items-center justify-between">
                      <span className="text-sm font-bold text-orange-700 dark:text-orange-400 flex items-center gap-1.5"><DollarSign size={14} /> قيمة الجلسة</span>
                      <span className="text-lg font-bold text-orange-700 dark:text-orange-300">{parseFloat(customServicePrice) || 0} ج.م</span>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button className="btn-luxury rounded-xl bg-gradient-to-l from-blue-600 to-blue-700 text-white font-bold h-12 text-base w-full" onClick={handleSmartPatientSubmit}>
              <Sparkles size={16} className="ml-2" /> تسجيل المريض
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>}
      
    </div>
  )
}
