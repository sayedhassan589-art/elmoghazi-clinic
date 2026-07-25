#!/usr/bin/env python3
"""
Step 3: Extract Laser Center into LaserCenter.tsx
Strategy: Extract content via line ranges, create component, remove from page.tsx
"""
import os, re

PAGE = '/home/z/my-project/src/app/page.tsx'
LASER = '/home/z/my-project/src/components/LaserCenter.tsx'

lines = open(PAGE, 'r', encoding='utf-8').readlines()
total = len(lines)
print(f"page.tsx: {total} lines")

# ─── 1. Extract Laser JSX block (lines 1644-2281, 0-indexed) ───
# Comment at 1643, conditional at 1644, closing )} at 2280
laser_jsx = lines[1643:2281]  # includes comment line
laser_jsx_text = ''.join(laser_jsx)

# Remove the wrapping: comment + {activeTab === 'laser' && ( ... )}
# Keep inner content: <div className="space-y-5"> ... </div>
inner = laser_jsx_text
inner = inner.replace('{/* ═══ LASER ═══ - Professional Laser Center Management */}\n', '')
# Strip first line: {activeTab === 'laser' && (
inner_lines = inner.split('\n')
# Find and remove the conditional wrapper
first_content_line = None
for idx, ln in enumerate(inner_lines):
    if '<div className="space-y-5">' in ln:
        first_content_line = idx
        break

if first_content_line:
    # Remove lines before the <div> (the conditional wrapper)
    inner_lines = inner_lines[first_content_line:]
    # Remove the last )} line
    inner_lines = [l for l in inner_lines if l.strip() != ')}']
    # Remove renderQuickNotes call (it's shared, will be called from page.tsx)
    inner_lines = [l.replace("{renderQuickNotes('laser')}", "{/* renderQuickNotes called from page.tsx */}") for l in inner_lines]
    inner_content = '\n'.join(inner_lines)
else:
    print("WARNING: Could not find <div className='space-y-5'>")
    inner_content = inner

print(f"Laser inner content: {len(inner_content)} chars")

# ─── 2. Extract Laser Dialogs ──────────────────────────────────

# Find Delete Laser Record AlertDialog
dlr_start = dlr_end = None
for i, line in enumerate(lines):
    if 'deleteLaserRecordConfirmId' in line and 'AlertDialog' in line and 'open=' in line:
        dlr_start = i
        depth = 0
        for j in range(i, len(lines)):
            if '<AlertDialog' in lines[j] and '</AlertDialog>' not in lines[j]:
                depth += 1
            if '</AlertDialog>' in lines[j]:
                depth -= 1
            if depth <= 0 and '</AlertDialog>' in lines[j]:
                dlr_end = j
                break
        break

print(f"Delete Laser Record: lines {dlr_start+1}-{dlr_end+1}")

# Find Delete Laser Session AlertDialog
dls_start = dls_end = None
for i, line in enumerate(lines):
    if 'deleteLaserSessionConfirmId' in line and 'AlertDialog' in line and 'open=' in line:
        dls_start = i
        depth = 0
        for j in range(i, len(lines)):
            if '<AlertDialog' in lines[j] and '</AlertDialog>' not in lines[j]:
                depth += 1
            if '</AlertDialog>' in lines[j]:
                depth -= 1
            if depth <= 0 and '</AlertDialog>' in lines[j]:
                dls_end = j
                break
        break

print(f"Delete Laser Session: lines {dls_start+1}-{dls_end+1}")

# Find Add Laser Record Dialog
alr_start = alr_end = None
for i, line in enumerate(lines):
    if '<Dialog open={showAddLaserRecord}' in line:
        alr_start = i
        depth = 0
        for j in range(i, len(lines)):
            if '<Dialog' in lines[j] and 'open=' in lines[j] and '</Dialog>' not in lines[j]:
                depth += 1
            if '</Dialog>' in lines[j]:
                depth -= 1
            if depth <= 0:
                alr_end = j
                break
        break

print(f"Add Laser Record: lines {alr_start+1}-{alr_end+1}")

# Find Add Laser Package Dialog
alp_start = alp_end = None
for i, line in enumerate(lines):
    if '<Dialog open={showAddLaserPackage}' in line:
        alp_start = i
        for j in range(i, min(i+5, len(lines))):
            if '</Dialog>' in lines[j]:
                alp_end = j
                break
        break

print(f"Add Laser Package: lines {alp_start+1}-{alp_end+1}")

# Collect all dialog content
# Include comment lines before each dialog
dialogs_content = ''

# Delete Laser Record dialog - include preceding comment
for k in range(max(0, dlr_start-2), dlr_start):
    if '{/* Delete Laser Record' in lines[k] or '{/* ─── Global Confirmation' in lines[k]:
        dialogs_content += lines[k]
dialogs_content += ''.join(lines[dlr_start:dlr_end+1])
dialogs_content += '\n\n'

# Delete Laser Session dialog - include preceding comment  
for k in range(max(0, dls_start-2), dls_start):
    if '{/* Delete Laser Session' in lines[k]:
        dialogs_content += lines[k]
dialogs_content += ''.join(lines[dls_start:dls_end+1])
dialogs_content += '\n\n'

# Add Laser Record Dialog
for k in range(max(0, alr_start-2), alr_start):
    if 'Laser' in lines[k] and '{/*' in lines[k]:
        dialogs_content += lines[k]
dialogs_content += ''.join(lines[alr_start:alr_end+1])
dialogs_content += '\n\n'

# Add Laser Package Dialog
for k in range(max(0, alp_start-2), alp_start):
    if 'Package' in lines[k] and '{/*' in lines[k]:
        dialogs_content += lines[k]
dialogs_content += ''.join(lines[alp_start:alp_end+1])

print(f"Dialogs content: {len(dialogs_content)} chars")

# ─── 3. Create LaserCenter.tsx ─────────────────────────────────

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
import { Badge } from '@/@/components/ui/badge'
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
""" + inner_content + """
  )

""" + dialogs_content + """
}
"""

# Fix the typo in Badge import
component = component.replace("@@/components/ui/badge", "@/components/ui/badge")

# Write LaserCenter.tsx
os.makedirs('/home/z/my-project/src/components', exist_ok=True)
with open(LASER, 'w', encoding='utf-8') as f:
    f.write(component)

print(f"\n✅ LaserCenter.tsx created: {len(component)} chars, {component.count(chr(10))} lines")

# ─── 4. Modify page.tsx ────────────────────────────────────────

content = ''.join(lines)

# 4a. Add import for LaserCenter
content = content.replace(
    "import PatientProfile from '@/components/PatientProfile'",
    "import PatientProfile from '@/components/PatientProfile'\nimport LaserCenter from '@/components/LaserCenter'"
)

# 4b. Replace laser JSX block with <LaserCenter /> + renderQuickNotes
# Find the exact laser block text and replace it
laser_block = ''.join(lines[1643:2281])  # lines 1644-2281 (1-indexed)

replacement = """
            {/* ═══ LASER ═══ */}
            <LaserCenter />
            {renderQuickNotes('laser')}
"""

content = content.replace(laser_block, replacement)

# 4c. Remove laser dialogs from page.tsx
# Delete Laser Record dialog
# Find and remove the complete dialog blocks

# Delete Laser Record
dlr_block = ''.join(lines[dlr_start:dlr_end+1])
# Also include preceding comments
for k in range(max(0, dlr_start-2), dlr_start):
    prefix = lines[k]
    if 'Delete Laser Record' in prefix or 'Global Confirmation' in prefix:
        dlr_block = prefix + dlr_block
content = content.replace(dlr_block, '')

# Delete Laser Session  
dls_block = ''.join(lines[dls_start:dls_end+1])
for k in range(max(0, dls_start-2), dls_start):
    prefix = lines[k]
    if 'Delete Laser Session' in prefix:
        dls_block = prefix + dls_block
content = content.replace(dls_block, '')

# Add Laser Record Dialog
alr_block = ''.join(lines[alr_start:alr_end+1])
content = content.replace(alr_block, '')

# Add Laser Package Dialog
alp_block = ''.join(lines[alp_start:alp_end+1])
content = content.replace(alp_block, '')

# 4d. Remove laser-specific useMemo hooks from page.tsx
# laserPatientSuggestions
content = re.sub(
    r'\n\s*// Laser patient search\s*\n\s*const laserPatientSuggestions = useMemo\(\(\) => \{[\s\S]*?\}, \[laserFormPatientSearch, patients\]\)\s*\n',
    '\n', content
)

# laserProgressData  
content = re.sub(
    r'\n\s*// ─── Laser Session Progress ───\s*\n\s*const laserProgressData = useMemo\(\(\) => \{[\s\S]*?\}, \[laserRecords, patients\]\)\s*\n',
    '\n', content
)

# laserHairSessions
content = re.sub(
    r'\n\s*// Laser hair removal sessions - pre-computed[\s\S]*?\}, \[sessions, services\]\)\s*\n',
    '\n', content
)

# laserRevenueByArea + laserRevenueByPackage (together)
content = re.sub(
    r'\n\s*// Laser financial computed values[\s\S]*?\}, \[laserRecords, laserPackages\]\)\s*\n',
    '\n', content
)

# 4e. Remove laser-specific store fields from page.tsx destructuring
# These are now consumed only in LaserCenter.tsx

# Remove from useUIStore
laser_ui_fields = [
    'laserSubTab', 'setLaserSubTab',
    'laserDetailTab', 'setLaserDetailTab', 
    'selectedLaserRecordId', 'setSelectedLaserRecordId',
    'showAddLaserRecord', 'setShowAddLaserRecord',
    'showAddLaserPackage', 'setShowAddLaserPackage',
    'showAddLaserSessionForm', 'setShowAddLaserSessionForm',
    'deleteLaserRecordConfirmId', 'setDeleteLaserRecordConfirmId',
    'deleteLaserSessionConfirmId', 'setDeleteLaserSessionConfirmId',
]

for field in laser_ui_fields:
    # Remove from destructuring: , field or field,
    content = re.sub(r',\s*' + re.escape(field) + r'\b', '', content)
    content = re.sub(re.escape(field) + r'\b\s*,\s*', '', content)

# Remove from useLaserFormStore
laser_form_fields = [
    'laserFormArea', 'setLaserFormArea',
    'laserFormSkinType', 'setLaserFormSkinType',
    'laserFormHairColor', 'setLaserFormHairColor',
    'laserFormHairDensity', 'setLaserFormHairDensity',
    'laserFormSessions', 'setLaserFormSessions',
    'laserFormNotes', 'setLaserFormNotes',
    'laserFormPatientId', 'setLaserFormPatientId',
    'laserFormPatientSearch', 'setLaserFormPatientSearch',
    'laserFormPrice', 'setLaserFormPrice',
    'laserFormPaid', 'setLaserFormPaid',
    'laserFormMachine', 'setLaserFormMachine',
    'laserFormEnergy', 'setLaserFormEnergy',
    'laserFormPulse', 'setLaserFormPulse',
    'laserFormDoctorId', 'setLaserFormDoctorId',
    'editingLaserSessionId', 'setEditingLaserSessionId',
    'editLaserSessionForm', 'setEditLaserSessionForm',
    'newLaserSessionForm', 'setNewLaserSessionForm',
    'editingLaserRecordId', 'setEditingLaserRecordId',
    'editLaserRecordForm', 'setEditLaserRecordForm',
    'laserFinancePatientId', 'setLaserFinancePatientId',
    'laserFinancePrice', 'setLaserFinancePrice',
    'laserFinanceNotes', 'setLaserFinanceNotes',
    'treatmentTemplates',
]

# Remove useLaserFormStore line entirely if all its fields are laser-specific
# Find the useLaserFormStore line
lfm_pattern = r'\s*const \{[^}]*\} = useLaserFormStore\(\)'
lfm_match = re.search(lfm_pattern, content)
if lfm_match:
    lfm_line = lfm_match.group()
    # Check if it only contains laser fields
    remaining_fields = [f for f in laser_form_fields if f in lfm_line]
    if len(remaining_fields) > 0:
        # Remove the entire line since all fields are laser-specific
        content = content.replace(lfm_line, '')
        print("Removed entire useLaserFormStore line")

# Remove useLaserFormStore from imports
content = content.replace(
    "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, useLaserFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'",
    "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'"
)

# Remove laser data store fields
laser_data_fields = ['laserRecords', 'setLaserRecords', 'laserPackages', 'setLaserPackages', 'laserSettings']
for field in laser_data_fields:
    content = re.sub(r',\s*' + re.escape(field) + r'\b', '', content)
    content = re.sub(re.escape(field) + r'\b\s*,\s*', '', content)

# ─── 5. Write modified page.tsx ─────────────────────────────────
with open(PAGE, 'w', encoding='utf-8') as f:
    f.write(content)

new_lines = content.count('\n')
print(f"\n✅ page.tsx: {new_lines} lines (reduced from {total})")
print(f"   Lines removed: ~{total - new_lines}")

# ─── Verification ────────────────────────────────────────────────
print("\n── Key Checks ──")
checks = [
    ("<LaserCenter />", "LaserCenter in page.tsx"),
    ("import LaserCenter", "LaserCenter import"),
    ("renderQuickNotes('laser')", "renderQuickNotes call preserved"),
    ("useLaserFormStore", "useLaserFormStore removed from page"),
]

for pattern, label in checks:
    found = pattern in content
    # For removal checks, we want NOT found
    if "removed" in label:
        found = pattern not in content
    status = "✅" if found else "❌"
    print(f"  {status} {label}")

# Check LaserCenter.tsx
lc = open(LASER, 'r').read()
lc_checks = [
    ("export default function LaserCenter()", "Component export"),
    ("useLaserFormStore", "Laser form store"),
    ("const addItem = async", "addItem internal"),
    ("const markSessionPaid = async", "markSessionPaid internal"),
    ("const laserHairSessions = useMemo", "laserHairSessions useMemo"),
    ("const laserProgressData = useMemo", "laserProgressData useMemo"),
    ("const laserRevenueByArea = useMemo", "laserRevenueByArea useMemo"),
]

print("\n── LaserCenter.tsx Checks ──")
for pattern, label in lc_checks:
    status = "✅" if pattern in lc else "❌"
    print(f"  {status} {label}")
