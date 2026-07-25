#!/usr/bin/env python3
"""
Step 1: Extract More section JSX from page.tsx and create MoreSection.tsx
Simple, surgical approach: 
1. Read page.tsx
2. Extract the More section JSX between markers
3. Create MoreSection.tsx with imports and component wrapper
4. Replace More section in page.tsx with <MoreSection />
"""

import re

PAGE = '/home/z/my-project/src/app/page.tsx'
OUT = '/home/z/my-project/src/components/MoreSection.tsx'

with open(PAGE, 'r', encoding='utf-8') as f:
    text = f.read()

# ─── Find markers ──────────────────────────────────────────────────────
# More section starts with: {/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}
# and the {activeTab === 'more' && ( line
# It ends right before: {/* ═══ SETTINGS direct ═══ */}

more_comment = '{/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}'
settings_comment = '{/* ═══ SETTINGS direct ═══ */}'

more_idx = text.find(more_comment)
settings_idx = text.find(settings_comment)

print(f"More comment at char {more_idx}")
print(f"Settings comment at char {settings_idx}")

# Extract the entire More block (from comment to just before settings)
more_block = text[more_idx:settings_idx]

# The block looks like:
#            {/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}
#            {activeTab === 'more' && (
#              <div className="space-y-5">
#                ...
#              </div>
#            )}
#
# We need to unwrap the {activeTab === 'more' && ( ... )} wrapper
# since MoreSection component is only rendered when activeTab === 'more'

# Find {activeTab === 'more' && (
match = re.search(r"\{activeTab === 'more' && \(\s*\n", more_block)
if match:
    inner_start = match.end()
    # Find the closing )} - it should be the last )} in the block
    # Search from the end
    rest = more_block[inner_start:]
    # Find last )} 
    last_close = -1
    for i in range(len(rest) - 1, -1, -1):
        if rest[i:i+2] == ')}':
            last_close = i
            break
    if last_close >= 0:
        inner_jsx = rest[:last_close].rstrip()
    else:
        inner_jsx = rest.rstrip()
else:
    print("WARNING: Could not find activeTab === 'more' pattern")
    inner_jsx = more_block

# Remove trailing whitespace
inner_jsx = inner_jsx.rstrip('\n')

print(f"Extracted More JSX: {len(inner_jsx)} chars, ~{inner_jsx.count(chr(10))} lines")

# ─── Build MoreSection.tsx ──────────────────────────────────────────────
# The component needs: imports, store destructuring, computed values, helper functions,
# and the JSX content

imports_section = """'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useAuthStore, useClinicStore, THEME_CONFIGS } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useFinanceFormStore, useFollowUpFormStore, usePatientFormStore, usePersonalFormStore, useAppointmentFormStore } from '@/store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { apiFetch, getLocalDateStr, getCairoDateParts, getEgyptianWeekDays, cairoISO, cairoDateTime, cairoTodayInput, getCairoWeekday, getCairoDateLabel, normalizePhone, waPhone, CHART_COLORS, getVisitCategory, VISIT_TYPES, smartSearch, BODY_AREAS, getImprovementColor, getImprovementEmoji } from '@/lib/helpers'
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
  ClipboardCheck, AlertCircle, UsersRound, RefreshCw, Camera, Pill
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '@/components/ui/alert-dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts'
import { ImprovementEntry, Patient, Visit, Session, Service, Note, LaserRecord, LaserSession, Transaction, Reminder, WaitingItem, InventoryItem, Medication, Prescription, Notification, Backup, PatientPhoto, PartnerDoctor, FollowUpRecord, FollowUpVisit, Alert, LaserPackage, LaserSetting, Appointment } from '@/lib/types'
"""

# Fix the typo in separator import
imports_section = imports_section.replace('@/@/components/ui/separator', '@/components/ui/separator')

stores_section = """
export default function MoreSection() {
  const { userRole } = useAuthStore()
  const { theme, setTheme, THEME_CONFIGS: _TC } = useClinicStore()
  const { patients, setPatients, visits, setVisits, sessions, setSessions, services, setServices, notes, setNotes, alerts, setAlerts, reminders, setReminders, transactions, setTransactions, appointments, setAppointments, waitingQueue, setWaitingQueue, inventoryItems, setInventoryItems, medications, setMedications, prescriptions, setPrescriptions, backups, setBackups, notifications, setNotifications, doctors, setDoctors, followUpRecords, setFollowUpRecords, laserRecords, personalTransactions, setPersonalTransactions, personalReminders, setPersonalReminders, personalNotes, setPersonalNotes } = useDataStore()
  const { moreSubTab, setMoreSubTab, showAddService, setShowAddService, showAddDoctor, setShowAddDoctor, showAddInventory, setShowAddInventory, editingInventoryId, setEditingInventoryId, editInventoryForm, setEditInventoryForm, showStockTransaction, setShowStockTransaction, stockTransactionItemId, setStockTransactionItemId, stockTransactionType, setStockTransactionType, stockTransactionQty, setStockTransactionQty, stockTransactionNotes, setStockTransactionNotes, showAddBooking, setShowAddBooking, bookingFormPatientSearch, setBookingFormPatientSearch, bookingFormPatientId, setBookingFormPatientId, bookingFormDate, setBookingFormDate, bookingFormTime, setBookingFormTime, bookingFormType, setBookingFormType, bookingFormStatus, setBookingFormStatus, bookingFormNotes, setBookingFormNotes, editingBookingId, setEditingBookingId, showAddMedication, setShowAddMedication, showAddReminder, setShowAddReminder, showApplyTemplate, setShowApplyTemplate, selectedTemplate, setSelectedTemplate, templatePatientId, setTemplatePatientId, showAddFollowUp, setShowAddFollowUp, showAddFollowUpVisit, setShowAddFollowUpVisit, deleteFollowUpConfirmId, setDeleteFollowUpConfirmId, selectedFollowUpId, setSelectedFollowUpId, followUpDetailTab, setFollowUpDetailTab, followUpSearch, setFollowUpSearch, followUpFilter, setFollowUpFilter, reportPeriod, setReportPeriod, personalSubTab, setPersonalSubTab, personalReportPeriod, setPersonalReportPeriod, personalSearchQuery, setPersonalSearchQuery, showAddPersonalTxn, setShowAddPersonalTxn, showAddPersonalReminder, setShowAddPersonalReminder, showAddPersonalNote, setShowAddPersonalNote, personalTxnFilter, setPersonalTxnFilter, personalTxnCategoryFilter, setPersonalTxnCategoryFilter, personalDateFrom, setPersonalDateFrom, personalDateTo, setPersonalDateTo, celebratingPersonalId, setCelebratingPersonalId, notesSearch, setNotesSearch, notesFilterSection, setNotesFilterSection, notesFilterImportant, setNotesFilterImportant, showAddNote, setShowAddNote, inventorySearch, setInventorySearch, inventoryFilter, setInventoryFilter, inventoryCategoryFilter, setInventoryCategoryFilter, visitFilterType, setVisitFilterType, deleteVisitConfirmId, setDeleteVisitConfirmId, celebratingId, setCelebratingId, showBroadcast, setShowBroadcast, broadcastMessage, setBroadcastMessage, broadcastFilter, setBroadcastFilter, broadcastSending, setBroadcastSending, broadcastProgress, setBroadcastProgress, broadcastSelectedIds, setBroadcastSelectedIds, showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement } = useUIStore()
  const { serviceFormName, setServiceFormName, serviceFormCategory, setServiceFormCategory, serviceFormPrice, setServiceFormPrice, serviceFormDuration, setServiceFormDuration, doctorForm, setDoctorForm, editingDoctorId, setEditingDoctorId, reminderType, setReminderType, reminderPatientId, setReminderPatientId } = useFinanceFormStore()
  const { fuFormPatientSearch, setFuFormPatientSearch, fuFormPatientId, setFuFormPatientId, fuFormCondition, setFuFormCondition, fuFormCategory, setFuFormCategory, fuFormSeverity, setFuFormSeverity, fuFormFrequency, setFuFormFrequency, fuFormCustomDays, setFuFormCustomDays, fuFormNextVisit, setFuFormNextVisit, fuFormDiagnosis, setFuFormDiagnosis, fuFormTreatmentPlan, setFuFormTreatmentPlan, fuFormMedications, setFuFormMedications, fuFormNotes, setFuFormNotes, fuFormHasSubscription, setFuFormHasSubscription, fuFormSubType, setFuFormSubType, fuFormSubPrice, setFuFormSubPrice, fuFormSubStart, setFuFormSubStart, fuFormSubEnd, setFuFormSubEnd, fuFormSubSessions, setFuFormSubSessions, fuVisitForm, setFuVisitForm, editingFollowUpId, setEditingFollowUpId } = useFollowUpFormStore()
  const { quickNote, setQuickNote } = usePatientFormStore()
  const { personalTxnForm, setPersonalTxnForm, editingPersonalTxnId, setEditingPersonalTxnId, personalReminderForm, setPersonalReminderForm, editingPersonalReminderId, setEditingPersonalReminderId, personalNoteForm, setPersonalNoteForm, editingPersonalNoteId, setEditingPersonalNoteId } = usePersonalFormStore()

  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor
  const canEditPatientFull = isDoctor

  // ─── Helper functions ────────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }
"""

computed_section = """
  // ─── Computed values (local to MoreSection) ──────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString('en-CA', { timeZone: 'Africa/Cairo' }), [transactions.length, visits.length, sessions.length])
  const cairoNow = useMemo(() => getCairoDateParts(), [todayStr, patients.length, visits.length, sessions.length])
  const clinicTransactions = useMemo(() => transactions.filter(t => t.category !== 'personal'), [transactions])

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

  const clinicFinancials = useMemo(() => {
    let totalIncome = 0, totalExpense = 0, checkupRev = 0, revisitRev = 0, laserRev = 0, followUpRev = 0, sessionRev = 0, monthIncome = 0
    for (const t of clinicTransactions) { if (t.type === 'income') { totalIncome += t.amount; if (t.category === 'كشف') checkupRev += t.amount; else if (t.category === 'إعادة') revisitRev += t.amount; else if (t.category === 'ليزر') laserRev += t.amount; else if (t.category === 'متابعة') followUpRev += t.amount; else if (t.category === 'جلسات') sessionRev += t.amount; const td = getCairoDateParts(t.date); if (td.year === cairoNow.year && td.month === cairoNow.month) monthIncome += t.amount } else { totalExpense += t.amount } }
    return { totalIncome, totalExpense, checkupRevenue: checkupRev, revisitRevenue: revisitRev, laserRevenue: laserRev, followUpRevenue: followUpRev, sessionRevenue: sessionRev, thisMonthIncome: monthIncome }
  }, [clinicTransactions, cairoNow])

  const topPatientsByVisits = useMemo(() => {
    const countMap: Record<string, { patient: Patient; visitCount: number; sessionCount: number; totalSpent: number }> = {}
    patients.forEach(p => { const pVisits = visits.filter(v => v.patientId === p.id).length; const pSessions = sessions.filter(s => s.patientId === p.id).length; const pSpent = transactions.filter(t => t.type === 'income' && t.category !== 'personal' && t.description?.includes(p.name)).reduce((s, t) => s + t.amount, 0); if (pVisits + pSessions > 0) countMap[p.id] = { patient: p, visitCount: pVisits, sessionCount: pSessions, totalSpent: pSpent } })
    return Object.values(countMap).sort((a, b) => (b.visitCount + b.sessionCount) - (a.visitCount + a.sessionCount)).slice(0, 5)
  }, [patients, visits, sessions, transactions])

  const laserProgressData = useMemo(() => {
    return laserRecords.filter(r => r.status === 'active').map(r => { const total = r.laserSessions?.length || r.totalSessions || 0; const done = r.laserSessions?.filter((ls: any) => ls.status === 'completed').length || r.completedSessions || 0; const pct = total > 0 ? Math.round((done / total) * 100) : 0; return { id: r.id, name: r.patient?.name || patients.find(p => p.id === r.patientId)?.name || 'مريض', area: r.area, progress: pct, done, total } }).filter(d => d.total > 0).sort((a, b) => b.progress - a.progress)
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
"""

# ─── Combine all sections ──────────────────────────────────────────────
full_content = imports_section + stores_section + computed_section

# Add the JSX content
full_content += "\n  return (\n"
full_content += inner_jsx
full_content += "\n  )\n}\n"

# Write MoreSection.tsx
with open(OUT, 'w', encoding='utf-8') as f:
    f.write(full_content)

line_count = full_content.count('\n') + 1
print(f"\nCreated MoreSection.tsx: {line_count} lines")

# ─── Modify page.tsx ────────────────────────────────────────────────────
# Replace the More section block with just <MoreSection />
# The block to replace is from more_comment to just before settings_comment

replacement = "            {/* ═══ MORE ═══ - ALL SUB-TABS WORKING */}\n            <MoreSection />\n\n"

# Replace the entire More block
new_text = text[:more_idx] + replacement + text[settings_idx:]

# Add import for MoreSection
import_line = "import MoreSection from '@/components/MoreSection'\n"
# Find existing import line for components
laser_import_idx = new_text.find("import LaserCenter from '@/components/LaserCenter'")
finance_import_idx = new_text.find("import FinanceCenter from '@/components/FinanceCenter'")
last_import_idx = max(laser_import_idx, finance_import_idx)
if last_import_idx >= 0:
    # Find the end of this line
    line_end = new_text.find('\n', last_import_idx) + 1
    new_text = new_text[:line_end] + import_line + new_text[line_end:]
    print(f"Added MoreSection import after line {last_import_idx}")

# Remove personal section computed values and CRUD handlers from page.tsx
# These are now in MoreSection.tsx
personal_comment = "// ─── Personal Section Computed ──────────────────────────────────"
personal_comment_idx = new_text.find(personal_comment)
if personal_comment_idx >= 0:
    # Find the end of personal section (after togglePersonalNoteImportance)
    toggle_end = new_text.find("togglePersonalNoteImportance")
    if toggle_end >= 0:
        # Find the next comment or empty line after the toggle function
        next_section = new_text.find("\n\n  // ───", toggle_end)
        if next_section >= 0:
            new_text = new_text[:personal_comment_idx] + new_text[next_section:]
            print(f"Removed personal section from page.tsx")

with open(PAGE, 'w', encoding='utf-8') as f:
    f.write(new_text)

new_lines = new_text.count('\n')
print(f"\nModified page.tsx: {text.count(chr(10))} -> {new_lines} chars")
print(f"page.tsx now has ~{new_lines} lines (approx)")
print(f"\n✅ Step 1 complete: More JSX section extracted")
