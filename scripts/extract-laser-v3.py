#!/usr/bin/env python3
"""
Step 3: Extract Laser Center from page.tsx into LaserCenter.tsx
Uses known line ranges for reliability.
"""
import os, re

PAGE = '/home/z/my-project/src/app/page.tsx'
LASER = '/home/z/my-project/src/components/LaserCenter.tsx'

lines = open(PAGE, 'r', encoding='utf-8').readlines()
total = len(lines)
print(f"page.tsx: {total} lines")

# ─── Known line ranges (1-indexed → 0-indexed) ──────────────────
# Laser JSX: comment at 1644, conditional 1645-2281
LASER_COMMENT = 1643  # {/* ═══ LASER ═══ */}
LASER_START = 1644    # {activeTab === 'laser' && (
LASER_END = 2280      # )}

# Laser dialogs:
DLR_START = 5282      # {/* Delete Laser Record */}
DLR_END = 5323        # </AlertDialog>}
DLS_START = 5325      # {/* Delete Laser Session */}
DLS_END = 5359        # </AlertDialog>}
ALR_START = 5743      # <Dialog open={showAddLaserRecord}
ALR_END = 6104        # </Dialog>
ALP_START = 6107      # <Dialog open={showAddLaserPackage}
ALP_END = 6107        # </Dialog> (single line)

# ─── 1. Extract Laser JSX inner content ─────────────────────────
laser_jsx = lines[LASER_START:LASER_END+1]  # includes {activeTab... through )}
laser_jsx_text = ''.join(laser_jsx)

# Strip the conditional wrapper
inner = laser_jsx_text
# Remove first line: {activeTab === 'laser' && (
inner_lines = inner.split('\n')
# Find <div className="space-y-5"> and extract from there
content_start = None
for idx, ln in enumerate(inner_lines):
    if '<div className="space-y-5">' in ln:
        content_start = idx
        break

if content_start:
    inner_lines = inner_lines[content_start:]
    # Remove last line (the closing )})
    # Remove )} lines at end
    while inner_lines and inner_lines[-1].strip() in [')}', '']:
        inner_lines.pop()
    # Replace renderQuickNotes('laser') with comment
    inner_lines = [l.replace("{renderQuickNotes('laser')}", "{/* renderQuickNotes called from page.tsx */}") for l in inner_lines]
    inner_content = '\n'.join(inner_lines)
else:
    print("WARNING: Could not find <div className='space-y-5'>")
    inner_content = inner

print(f"Laser inner content: {len(inner_content)} chars, ~{len(inner_lines)} lines")

# ─── 2. Extract Laser dialog content ────────────────────────────
dlr_content = ''.join(lines[DLR_START:DLR_END+1])
dls_content = ''.join(lines[DLS_START:DLS_END+1])
alr_content = ''.join(lines[ALR_START:ALR_END+1])
alp_content = ''.join(lines[ALP_START:ALP_END+1])

# Verify ALR end - find </Dialog> on the correct line
for i in range(ALR_START, min(ALR_START+400, len(lines))):
    if '</Dialog>' in lines[i] and 'showAddLaserRecord' not in lines[i]:
        # Check this is the closing tag, not an inner Dialog
        # The line should contain just </Dialog> or </Dialog>\n
        if lines[i].strip().endswith('</Dialog>') or lines[i].strip() == '</Dialog>':
            ALR_END = i
            break

print(f"Add Laser Record dialog end: line {ALR_END+1}")
alr_content = ''.join(lines[ALR_START:ALR_END+1])

dialogs_content = f"""
{dlr_content}

{dls_content}

{alr_content}

{alp_content}
"""

print(f"Dialogs content: {len(dialogs_content)} chars")

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
""" + inner_content + """
  )

""" + dialogs_content + """
}
"""

# Write LaserCenter.tsx
os.makedirs('/home/z/my-project/src/components', exist_ok=True)
with open(LASER, 'w', encoding='utf-8') as f:
    f.write(component)

lc_lines = component.count('\n')
print(f"\n✅ LaserCenter.tsx created: {lc_lines} lines, {len(component)} chars")

# ─── 4. Modify page.tsx ────────────────────────────────────────

content = ''.join(lines)

# 4a. Add import
content = content.replace(
    "import PatientProfile from '@/components/PatientProfile'\n",
    "import PatientProfile from '@/components/PatientProfile'\nimport LaserCenter from '@/components/LaserCenter'\n"
)

# 4b. Replace laser JSX block with <LaserCenter /> + renderQuickNotes
laser_block = ''.join(lines[LASER_COMMENT:LASER_END+1])  # includes comment through )}

replacement = "\n            {/* ═══ LASER ═══ */}\n            <LaserCenter />\n            {renderQuickNotes('laser')}\n"
content = content.replace(laser_block, replacement)

# 4c. Remove laser dialogs from page.tsx
# Remove Delete Laser Record dialog (lines 5282-5324 in original)
dlr_block = ''.join(lines[DLR_START:DLR_END+1])
# Also check for preceding comment lines
for k in range(max(0, DLR_START-3), DLR_START):
    if 'Delete Laser Record' in lines[k] or 'Global Confirmation' in lines[k]:
        dlr_block = lines[k] + dlr_block

# Remove preceding blank line
content = content.replace('\n\n' + dlr_block, '')
content = content.replace(dlr_block, '')

# Remove Delete Laser Session dialog (lines 5325-5360)
dls_block = ''.join(lines[DLS_START:DLS_END+1])
content = content.replace('\n\n' + dls_block, '')
content = content.replace(dls_block, '')

# Remove Add Laser Record Dialog (lines 5744-6105)
alr_block = ''.join(lines[ALR_START:ALR_END+1])
content = content.replace('\n\n' + alr_block, '')
content = content.replace(alr_block, '')

# Remove Add Laser Package Dialog (line 6108)
alp_block = ''.join(lines[ALP_START:ALP_END+1])
content = content.replace('\n\n' + alp_block, '')
content = content.replace(alp_block, '')

# 4d. Remove laser-specific useMemo hooks
# laserPatientSuggestions
content = re.sub(
    r'\n  // Laser patient search\n  const laserPatientSuggestions = useMemo\(\(\) => \{[\s\S]*?\}, \[laserFormPatientSearch, patients\]\)\n',
    '\n', content
)

# laserProgressData
content = re.sub(
    r'\n  // ─── Laser Session Progress ───\n  const laserProgressData = useMemo\(\(\) => \{[\s\S]*?\}, \[laserRecords, patients\]\)\n',
    '\n', content
)

# laserHairSessions
content = re.sub(
    r'\n  // Laser hair removal sessions - pre-computed[\s\S]*?\}, \[sessions, services\]\)\n',
    '\n', content
)

# laserRevenueByArea + laserRevenueByPackage
content = re.sub(
    r'\n  // Laser financial computed values[\s\S]*?\}, \[laserRecords, laserPackages\]\)\n',
    '\n', content
)

# 4e. Remove laser-specific fields from useUIStore destructuring
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

# 4f. Remove useLaserFormStore line entirely
lfm_pattern = r'\s*const \{[^}]*\} = useLaserFormStore\(\)\s*\n'
content = re.sub(lfm_pattern, '', content)

# 4g. Remove useLaserFormStore from import
content = content.replace(
    "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, useLaserFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'",
    "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'"
)

# 4h. Remove laser data fields from useDataStore
laser_data_fields = ['laserRecords', 'setLaserRecords', 'laserPackages', 'setLaserPackages', 'laserSettings']
for field in laser_data_fields:
    content = re.sub(r',\s*' + re.escape(field) + r'\b', '', content)
    content = re.sub(re.escape(field) + r'\b\s*,\s*', '', content)

# ─── 5. Write modified page.tsx ─────────────────────────────────
with open(PAGE, 'w', encoding='utf-8') as f:
    f.write(content)

new_total = content.count('\n')
print(f"\n✅ page.tsx: {new_total} lines (reduced from {total})")
print(f"   Lines removed: ~{total - new_total}")

# ─── Verification ────────────────────────────────────────────────
print("\n── Key Checks ──")
checks = {
    "<LaserCenter />": "LaserCenter in page.tsx",
    "import LaserCenter": "LaserCenter import",
    "renderQuickNotes('laser')": "renderQuickNotes call preserved",
    "useLaserFormStore": "useLaserFormStore NOT in page (should be removed)",
}

for pattern, label in checks.items():
    if "NOT" in label:
        found = pattern not in content
    else:
        found = pattern in content
    status = "✅" if found else "❌"
    print(f"  {status} {label}")

# Check LaserCenter.tsx
lc = open(LASER, 'r').read()
lc_checks = {
    "export default function LaserCenter()": "Component export",
    "useLaserFormStore": "Laser form store",
    "const addItem = async": "addItem internal",
    "const markSessionPaid = async": "markSessionPaid internal",
    "const laserHairSessions = useMemo": "laserHairSessions useMemo",
    "const laserProgressData = useMemo": "laserProgressData useMemo",
    "const laserRevenueByArea = useMemo": "laserRevenueByArea useMemo",
    "deleteLaserRecordConfirmId": "deleteLaserRecord dialog",
    "showAddLaserRecord": "addLaserRecord dialog",
}

print("\n── LaserCenter.tsx Checks ──")
for pattern, label in lc_checks.items():
    status = "✅" if pattern in lc else "❌"
    print(f"  {status} {label}")
