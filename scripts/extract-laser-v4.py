#!/usr/bin/env python3
"""
Step 3: Extract Laser Center into LaserCenter.tsx
Uses content-based search instead of hardcoded line numbers.
"""
import os, re

PAGE = '/home/z/my-project/src/app/page.tsx'
LASER = '/home/z/my-project/src/components/LaserCenter.tsx'

content = open(PAGE, 'r', encoding='utf-8').read()
total_lines = content.count('\n')
print(f"page.tsx: {total_lines} lines")

# ─── 1. Extract Laser JSX block ─────────────────────────────────
# Find: {/* ═══ LASER ═══ */} ... {activeTab === 'laser' && ( ... )}
laser_start_marker = '{/* ═══ LASER ═══ - Professional Laser Center Management */}'
laser_end_marker = '            )}\n\n            {/* ═══ FINANCE ═══ */}'

# Find start position
start_pos = content.find(laser_start_marker)
if start_pos == -1:
    # Try simpler marker
    laser_start_marker = '{/* ═══ LASER ═══ */}'
    start_pos = content.find(laser_start_marker)

end_pos = content.find(laser_end_marker)
if end_pos == -1:
    # Try finding the FINANCE section directly
    fin_pos = content.find('{/* ═══ FINANCE ═══ */}')
    if fin_pos == -1:
        fin_pos = content.find("activeTab === 'finance'")
    # The )} should be just before this
    end_pos = content.rfind(')}\n', start_pos, fin_pos) + 2

print(f"Laser JSX: positions {start_pos}-{end_pos}")

laser_block = content[start_pos:end_pos]
print(f"Laser JSX block: {len(laser_block)} chars, ~{laser_block.count(chr(10))} lines")

# Extract inner content (strip wrapper)
inner = laser_block
# Remove comment
inner = inner.replace(laser_start_marker, '').strip()
# Remove {activeTab === 'laser' && ( prefix
active_laser_prefix = "{activeTab === 'laser' && (\n"
if inner.startswith(active_laser_prefix):
    inner = inner[len(active_laser_prefix):]
# Remove trailing )}
if inner.rstrip().endswith(')}'):
    inner = inner.rstrip()[:-2]
# Replace renderQuickNotes call
inner = inner.replace("{renderQuickNotes('laser')}", "{/* renderQuickNotes called from page.tsx */}")

print(f"Inner content: {len(inner)} chars, ~{inner.count(chr(10))} lines")

# ─── 2. Extract Laser Dialogs ──────────────────────────────────

# Delete Laser Record AlertDialog
dlr_pattern = r'\{/\* Delete Laser Record \*/\}\s*\{canDelete && <AlertDialog open=\{\{!!deleteLaserRecordConfirmId\}\}[\s\S]*?</AlertDialog>\}'
dlr_match = re.search(dlr_pattern, content)
dlr_block = dlr_match.group() if dlr_match else ''
print(f"Delete Laser Record: {len(dlr_block)} chars")

# Delete Laser Session AlertDialog
dls_pattern = r'\{/\* Delete Laser Session \*/\}\s*\{canDelete && <AlertDialog open=\{\{!!deleteLaserSessionConfirmId\}\}[\s\S]*?</AlertDialog>\}'
dls_match = re.search(dls_pattern, content)
dls_block = dls_match.group() if dls_match else ''
print(f"Delete Laser Session: {len(dls_block)} chars")

# Add Laser Record Dialog (big block)
alr_pattern = r'<Dialog open=\{showAddLaserRecord\}[\s\S]*?</Dialog>'
alr_match = re.search(alr_pattern, content)
alr_block = alr_match.group() if alr_match else ''
print(f"Add Laser Record: {len(alr_block)} chars")

# Add Laser Package Dialog
alp_pattern = r'<Dialog open=\{showAddLaserPackage\}[\s\S]*?</Dialog>'
alp_match = re.search(alp_pattern, content)
alp_block = alp_match.group() if alp_match else ''
print(f"Add Laser Package: {len(alp_block)} chars")

# Check total dialog content
total_dialog = len(dlr_block) + len(dls_block) + len(alr_block) + len(alp_block)
print(f"Total dialogs: {total_dialog} chars")
if total_dialog < 5000:
    print("⚠️  WARNING: Dialog content seems too small!")

# ─── 3. Create LaserCenter.tsx ──────────────────────────────────

component = """'use client'

import { useMemo } from 'react'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore, useLaserFormStore } from '@/store'
import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { LaserRecord, LaserSession, LaserPackage, LaserSetting, Session, Service, Transaction, Patient } from '@/lib/types'
import { apiFetch, getLocalDateStr, cairoISO, cairoDateTime, BODY_AREAS } from '@/lib/helpers'
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
  const { activeTab } = useClinicStore()
  const { patients, setPatients, visits, sessions, setSessions, services, laserRecords, setLaserRecords, laserPackages, setLaserPackages, laserSettings, transactions, setTransactions, notes, setNotes } = useDataStore()
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

  // ─── Role-based access ─────────────────────────────────────────
  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor

  // ─── Internal Helpers ──────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }
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
  if (activeTab !== 'laser') return null

  return (
""" + inner + """
  )

""" + dlr_block + """

""" + dls_block + """

""" + alr_block + """

""" + alp_block + """
}
"""

os.makedirs('/home/z/my-project/src/components', exist_ok=True)
with open(LASER, 'w', encoding='utf-8') as f:
    f.write(component)

lc_lines = component.count('\n')
print(f"\n✅ LaserCenter.tsx created: {lc_lines} lines, {len(component)} chars")

# ─── 4. Modify page.tsx ────────────────────────────────────────

# Replace laser JSX block with <LaserCenter /> + renderQuickNotes
laser_replacement = "\n            {/* ═══ LASER ═══ */}\n            <LaserCenter />\n            {renderQuickNotes('laser')}\n"
content = content.replace(laser_block, laser_replacement)

# Remove laser dialogs
content = content.replace(dlr_block, '')
content = content.replace(dls_block, '')
content = content.replace(alr_block, '')
content = content.replace(alp_block, '')

# Remove laser-specific useMemo hooks
content = re.sub(
    r'\n  // Laser patient search\n  const laserPatientSuggestions = useMemo\(\(\) => \{[\s\S]*?\}, \[laserFormPatientSearch, patients\]\)\n',
    '\n', content
)

content = re.sub(
    r'\n  // ─── Laser Session Progress ───\n  const laserProgressData = useMemo\(\(\) => \{[\s\S]*?\}, \[laserRecords, patients\]\)\n',
    '\n', content
)

content = re.sub(
    r'\n  // Laser hair removal sessions - pre-computed[\s\S]*?\}, \[sessions, services\]\)\s*\n',
    '\n', content
)

content = re.sub(
    r'\n  // Laser financial computed values[\s\S]*?\}, \[laserRecords, laserPackages\]\)\n',
    '\n', content
)

# Remove laser-specific store fields from page.tsx destructuring
laser_ui_fields = [
    'laserSubTab', 'setLaserSubTab',
    'laserDetailTab', 'setLaserDetailTab',
    'selectedLaserRecordId', 'setSelectedLaserRecordId',
    'showAddLaserRecord', 'setShowAddLaserRecord',
    'showAddLaserPackage', 'setShowAddLaserPackage',
    'showAddLaserSessionForm', 'setShowAddLaserSessionForm',
    'deleteLaserRecordConfirmId', 'setDeleteLaserRecordConfirmId',
    'deleteLaserSessionConfirmId', 'setDeleteLaserSessionConfirmId',
    'laserFormPatientId', 'setLaserFormPatientId',
    'laserFormPatientSearch', 'setLaserFormPatientSearch',
]

for field in laser_ui_fields:
    content = re.sub(r',\s*' + re.escape(field) + r'\b', '', content)
    content = re.sub(re.escape(field) + r'\b\s*,\s*', '', content)

# Remove useLaserFormStore line
content = re.sub(r'\s*const \{[^}]*\} = useLaserFormStore\(\)\s*\n', '', content)

# Remove useLaserFormStore from import
content = content.replace(
    "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, useLaserFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'",
    "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'"
)

# Remove laser data fields from useDataStore
laser_data_fields = ['laserRecords', 'setLaserRecords', 'laserPackages', 'setLaserPackages', 'laserSettings']
for field in laser_data_fields:
    content = re.sub(r',\s*' + re.escape(field) + r'\b', '', content)
    content = re.sub(re.escape(field) + r'\b\s*,\s*', '', content)

# Add LaserCenter import
content = content.replace(
    "import PatientProfile from '@/components/PatientProfile'",
    "import PatientProfile from '@/components/PatientProfile'\nimport LaserCenter from '@/components/LaserCenter'"
)

# ─── 5. Write modified page.tsx ─────────────────────────────────
with open(PAGE, 'w', encoding='utf-8') as f:
    f.write(content)

new_lines = content.count('\n')
print(f"\n✅ page.tsx: {new_lines} lines (reduced from {total_lines})")
print(f"   Lines removed: ~{total_lines - new_lines}")

# ─── Verification ────────────────────────────────────────────────
print("\n── Key Checks ──")
checks_ok = True
for pattern in ["<LaserCenter />", "import LaserCenter", "renderQuickNotes('laser')"]:
    if pattern in content:
        print(f"  ✅ {pattern}")
    else:
        print(f"  ❌ {pattern} NOT FOUND!")
        checks_ok = False

for pattern in ["useLaserFormStore"]:
    if pattern not in content:
        print(f"  ✅ {pattern} removed from page.tsx")
    else:
        print(f"  ❌ {pattern} still in page.tsx")
        checks_ok = False

lc = open(LASER, 'r').read()
for pattern in ["export default function LaserCenter()", "useLaserFormStore", "const addItem", "const markSessionPaid", "laserHairSessions", "laserProgressData", "deleteLaserRecordConfirmId", "showAddLaserRecord"]:
    if pattern in lc:
        print(f"  ✅ LC: {pattern}")
    else:
        print(f"  ❌ LC: {pattern} NOT FOUND!")
        checks_ok = False

if not checks_ok:
    print("\n⚠️  Some checks failed - may need manual fix!")
