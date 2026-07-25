#!/usr/bin/env python3
"""
Extract FinanceCenter component from page.tsx into FinanceCenter.tsx
- Creates FinanceCenter.tsx as a self-contained 'use client' component
- Uses Zustand stores directly (no props)
- Includes its own financial computed values using useMemo
- Includes Add Transaction dialog
- Includes CairoClock component
- Includes shareDailySummary function
- Includes renderQuickNotes for finance section
- Modifies page.tsx to import and use <FinanceCenter />
- Removes Add Transaction Dialog from page.tsx
"""

PAGE_PATH = '/home/z/my-project/src/app/page.tsx'
FINANCE_CENTER_PATH = '/home/z/my-project/src/components/FinanceCenter.tsx'

# ─── Read page.tsx ──────────────────────────────────────────────
with open(PAGE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')
total_lines = len(lines)
print(f"Original page.tsx: {total_lines} lines")

# ─── Phase 1: Extract key sections from page.tsx ──────────────

# 1a. CairoClock component - known on lines 64-70 (0-indexed: 63-69)
# Line 63 (0-indexed): // ─── Isolated Cairo Clock...
# Line 64 (0-indexed): function CairoClock...
# Line 69 (0-indexed): return <>{className...
# Line 70 (0-indexed): } (closing brace)
cairo_clock_code = '\n'.join(lines[63:70])  # Lines 64-70 (0-indexed 63-69)
# Add the closing brace on line 70 (0-indexed 69)
cairo_clock_code = lines[64-1] + '\n' + lines[65-1] + '\n' + lines[66-1] + '\n' + lines[67-1] + '\n' + lines[68-1] + '\n' + lines[69-1] + '\n' + lines[70-1]
print(f"Extracted CairoClock: {len(cairo_clock_code)} chars")

# 1b. Finance JSX section
# We need to find the finance block boundaries using unique markers
# Start: {/* ═══ FINANCE ═══ */} followed by {activeTab === 'finance' && (
# End: renderQuickNotes('finance') followed by </div> and )}

# Find the start using unique markers
finance_comment = '{/* ═══ FINANCE ═══ */}'
finance_cond = '{activeTab === \'finance\' && ('
finance_notes = '{renderQuickNotes(\'finance\')}'

# Find the position of the finance comment
finance_comment_pos = content.find(finance_comment)
if finance_comment_pos == -1:
    print("ERROR: Could not find finance comment marker")
    raise SystemExit(1)

# Find the position of {activeTab === 'finance' && ( right after
finance_cond_pos = content.find(finance_cond, finance_comment_pos)
if finance_cond_pos == -1:
    print("ERROR: Could not find finance conditional")
    raise SystemExit(1)

# Find the inner <div className="space-y-5"> after the conditional
finance_div = '<div className="space-y-5">'
finance_div_pos = content.find(finance_div, finance_cond_pos)
if finance_div_pos == -1:
    print("ERROR: Could not find finance div")
    raise SystemExit(1)

# Find renderQuickNotes('finance') to mark the end
finance_notes_pos = content.find(finance_notes, finance_div_pos)
if finance_notes_pos == -1:
    print("ERROR: Could not find renderQuickNotes('finance')")
    raise SystemExit(1)

# Find </div> after notes
finance_end_div = '</div>'
finance_end_div_pos = content.find(finance_end_div, finance_notes_pos)
if finance_end_div_pos == -1:
    print("ERROR: Could not find closing div after finance notes")
    raise SystemExit(1)

# Find the closing )} after </div>
finance_close = '            )}'
finance_close_pos = content.find(finance_close, finance_end_div_pos)
if finance_close_pos == -1:
    print("ERROR: Could not find finance close )}")
    raise SystemExit(1)

# Extract the FULL finance block (comment + conditional + div + closing)
# This is what we'll replace in page.tsx
finance_full_block = content[finance_comment_pos:finance_close_pos + len(finance_close)]
print(f"Full finance block for replacement: {len(finance_full_block)} chars")

# Extract the INNER content (conditional + div + closing) for FinanceCenter.tsx
# This includes {activeTab === 'finance' && ( ... )}
finance_inner_with_cond = content[finance_cond_pos:finance_close_pos + len(finance_close)]
print(f"Inner finance content with condition: {len(finance_inner_with_cond)} chars")

# 1c. Add Transaction Dialog
txn_dialog_comment = '{/* ─── Add Transaction Dialog ─── */}'
txn_dialog_comment_pos = content.find(txn_dialog_comment)
if txn_dialog_comment_pos == -1:
    print("ERROR: Could not find Add Transaction Dialog comment")
    raise SystemExit(1)

# Find <Dialog open={showAddTransaction}
dialog_open = '<Dialog open={showAddTransaction}'
dialog_open_pos = content.find(dialog_open, txn_dialog_comment_pos)
if dialog_open_pos == -1:
    print("ERROR: Could not find Dialog open tag")
    raise SystemExit(1)

# Find the closing </Dialog> after DialogContent and DialogFooter
# Strategy: find "</DialogContent>" then find "</Dialog>" after it
dialog_content_close = '</DialogContent>'
dc_close_pos = content.find(dialog_content_close, dialog_open_pos)
if dc_close_pos == -1:
    print("ERROR: Could not find DialogContent close")
    raise SystemExit(1)

dialog_close = '</Dialog>'
d_close_pos = content.find(dialog_close, dc_close_pos)
if d_close_pos == -1:
    print("ERROR: Could not find Dialog close")
    raise SystemExit(1)

# Calculate the end position - from the comment line to </Dialog> + newline
# Find the line that contains the comment
comment_line_start = content.rfind('\n', 0, txn_dialog_comment_pos) + 1
# Find end of </Dialog> line
dialog_end_line_end = content.find('\n', d_close_pos)
if dialog_end_line_end == -1:
    dialog_end_line_end = len(content)

txn_dialog_block = content[comment_line_start:dialog_end_line_end + 1]
print(f"Add Transaction Dialog block: {len(txn_dialog_block)} chars")

# ─── Phase 2: Construct FinanceCenter.tsx ────────────────────────

# Build the FinanceCenter component
# The finance_inner_with_cond contains the full conditional wrapper which we need
# in FinanceCenter since it's rendered inside the tab-switching AnimatePresence context

finance_center_tsx = """'use client'

import { useState, useEffect, useMemo } from 'react'
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


// ─── Isolated Cairo Clock (re-renders only itself every second, NOT the whole app) ──
""" + cairo_clock_code + """


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

  // ─── Helper functions ────────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

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
""" + finance_inner_with_cond + "\n\n" + txn_dialog_block + """
  )
}
"""

# ─── Phase 3: Write FinanceCenter.tsx ────────────────────────────
with open(FINANCE_CENTER_PATH, 'w', encoding='utf-8') as f:
    f.write(finance_center_tsx)

print(f"Created FinanceCenter.tsx: {len(finance_center_tsx)} chars")

# ─── Phase 4: Modify page.tsx ────────────────────────────────────

# 4a. Add import for FinanceCenter (after LaserCenter import)
import_marker = "import LaserCenter from '@/components/LaserCenter'"
import_replacement = import_marker + "\nimport FinanceCenter from '@/components/FinanceCenter'"
content = content.replace(import_marker, import_replacement)
print("Added FinanceCenter import")

# 4b. Replace the full finance block with <FinanceCenter />
# Replace the entire block from {/* ═══ FINANCE ═══ */} to )}
finance_replacement = '            {/* ═══ FINANCE ═══ */}\n            <FinanceCenter />'
content = content.replace(finance_full_block, finance_replacement)
print("Replaced finance section with <FinanceCenter />")

# 4c. Remove the Add Transaction Dialog from page.tsx
content = content.replace(txn_dialog_block, '')
print("Removed Add Transaction Dialog from page.tsx")

# ─── Phase 5: Write modified page.tsx ────────────────────────────
with open(PAGE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

new_lines = content.split('\n')
print(f"Modified page.tsx: {len(new_lines)} lines (was {total_lines} lines)")
print(f"Removed {total_lines - len(new_lines)} lines")

# ─── Phase 6: Verification ────────────────────────────────────────
assert "import FinanceCenter from '@/components/FinanceCenter'" in content, "FinanceCenter import not found"
assert "<FinanceCenter />" in content, "FinanceCenter component usage not found"
assert finance_full_block not in content, "Finance full block still present (should be removed)"
assert txn_dialog_block not in content, "Add Transaction Dialog still present (should be removed)"

print("\n✅ All verifications passed!")
print("Run: cd /home/z/my-project && npm run build")
