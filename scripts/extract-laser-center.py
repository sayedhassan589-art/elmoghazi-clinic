#!/usr/bin/env python3
"""
Step 3: Extract Laser Center from page.tsx into LaserCenter.tsx
- Extracts Laser JSX block (lines 1645-2281)
- Extracts Laser dialogs (5284-5360, 5744-6108)
- Creates LaserCenter.tsx as self-contained component
- Removes extracted code from page.tsx
- Adds import for LaserCenter in page.tsx
"""

import re

PAGE_PATH = '/home/z/my-project/src/app/page.tsx'

with open(PAGE_PATH, 'r', encoding='utf-8') as f:
    lines = f.readlines()

total_lines = len(lines)
print(f"Original page.tsx: {total_lines} lines")

# ─── Phase 1: Extract the Laser JSX block (lines 1645-2281) ────
# The laser JSX starts at line 1645 (0-indexed: 1644) with {activeTab === 'laser' && (
# and ends at line 2281 (0-indexed: 2280) with )}
laser_jsx_start = 1644  # 0-indexed
laser_jsx_end = 2281    # 0-indexed (the closing )}

# Verify boundaries
assert '{activeTab === 'laser' && (' in lines[laser_jsx_start], f"Expected laser start at line {laser_jsx_start+1}"
# Find the exact closing )} - it should be right after </div> on line 2280
laser_jsx_lines = lines[laser_jsx_start:laser_jsx_end+1]
laser_jsx_content = ''.join(laser_jsx_lines)

# Also grab the comment before it (line 1644)
laser_comment_line = lines[laser_jsx_start - 1]  # {/* ═══ LASER ═══ */}
laser_jsx_content = laser_comment_line + laser_jsx_content

print(f"Laser JSX block: {laser_jsx_start+1} to {laser_jsx_end+1} ({laser_jsx_end - laser_jsx_start + 1} lines)")

# ─── Phase 2: Extract Laser dialogs ────────────────────────────
# Dialog 1: Delete Laser Record (5284-5324)
# Dialog 2: Delete Laser Session (5327-5360)
# Dialog 3: Add Laser Record (5744-6105)
# Dialog 4: Add Laser Package (6108)

# Find exact line numbers for laser dialogs
dlg_start_markers = []
for i, line in enumerate(lines):
    if 'Delete Laser Record' in line and 'AlertDialog' in line:
        dlg_start_markers.append(('delete_record', i))
    if 'Delete Laser Session' in line and 'AlertDialog' in line:
        dlg_start_markers.append(('delete_session', i))
    if 'showAddLaserRecord' in line and 'Dialog open=' in line:
        dlg_start_markers.append(('add_record', i))
    if 'showAddLaserPackage' in line and 'Dialog open=' in line:
        dlg_start_markers.append(('add_package', i))

print(f"Laser dialog markers found: {dlg_start_markers}")

# Extract dialog blocks by finding their boundaries
def find_dialog_block(lines, start_idx, dialog_type):
    """Find the complete dialog block starting from start_idx"""
    if dialog_type == 'alert':
        # AlertDialog: find matching closing tags
        depth = 0
        end_idx = start_idx
        for i in range(start_idx, len(lines)):
            line = lines[i]
            if '<AlertDialog' in line and 'open=' in line:
                depth += 1
            if '</AlertDialog>' in line:
                depth -= 1
                if depth == 0:
                    # Find the closing )}
                    for j in range(i, min(i+5, len(lines))):
                        if ')}' in lines[j] or lines[j].strip() == '}':
                            end_idx = j
                            break
                    end_idx = i
                    break
        return start_idx, end_idx
    elif dialog_type == 'dialog':
        # Dialog: find matching closing </Dialog>
        depth = 0
        end_idx = start_idx
        for i in range(start_idx, len(lines)):
            line = lines[i]
            if '<Dialog' in line and 'open=' in line and '</Dialog>' not in line:
                depth += 1
            if '</Dialog>' in line:
                depth -= 1
                if depth == 0:
                    end_idx = i
                    break
        return start_idx, end_idx

# Find Delete Laser Record AlertDialog block
del_record_start = None
del_record_end = None
for i, line in enumerate(lines):
    if '{canDelete && <AlertDialog open={!!deleteLaserRecordConfirmId}' in line:
        del_record_start = i
        # Find closing </AlertDialog>}
        depth = 0
        for j in range(i, len(lines)):
            if '<AlertDialog' in lines[j] and not '</AlertDialog>' in lines[j]:
                depth += 1
            if '</AlertDialog>' in lines[j]:
                depth -= 1
            if depth == 0 and '</AlertDialog>' in lines[j]:
                # Check if } is on same line or next
                if '}>' in lines[j] or lines[j].strip().endswith('}'):
                    del_record_end = j
                else:
                    for k in range(j+1, min(j+3, len(lines))):
                        if '}' in lines[k]:
                            del_record_end = k
                            break
                break
        break

print(f"Delete Laser Record dialog: lines {del_record_start+1} to {del_record_end+1}")

# Find Delete Laser Session AlertDialog block
del_session_start = None
del_session_end = None
for i, line in enumerate(lines):
    if '{canDelete && <AlertDialog open={!!deleteLaserSessionConfirmId}' in line:
        del_session_start = i
        depth = 0
        for j in range(i, len(lines)):
            if '<AlertDialog' in lines[j] and not '</AlertDialog>' in lines[j]:
                depth += 1
            if '</AlertDialog>' in lines[j]:
                depth -= 1
            if depth == 0 and '</AlertDialog>' in lines[j]:
                if '}>' in lines[j] or lines[j].strip().endswith('}'):
                    del_session_end = j
                else:
                    for k in range(j+1, min(j+3, len(lines))):
                        if '}' in lines[k]:
                            del_session_end = k
                            break
                break
        break

print(f"Delete Laser Session dialog: lines {del_session_start+1} to {del_session_end+1}")

# Find Add Laser Record Dialog block
add_record_start = None
add_record_end = None
for i, line in enumerate(lines):
    if '<Dialog open={showAddLaserRecord}' in line:
        add_record_start = i
        depth = 0
        for j in range(i, len(lines)):
            if '<Dialog' in lines[j] and 'open=' in lines[j] and '</Dialog>' not in lines[j]:
                depth += 1
            if '</Dialog>' in lines[j]:
                depth -= 1
            if depth == 0 and '</Dialog>' in lines[j]:
                add_record_end = j
                break
        break

print(f"Add Laser Record dialog: lines {add_record_start+1} to {add_record_end+1}")

# Find Add Laser Package Dialog
add_package_start = None
add_package_end = None
for i, line in enumerate(lines):
    if '<Dialog open={showAddLaserPackage}' in line:
        add_package_start = i
        # This is typically a single-line dialog
        # Find </Dialog> on same or nearby line
        for j in range(i, min(i+5, len(lines))):
            if '</Dialog>' in lines[j]:
                add_package_end = j
                break
        break

print(f"Add Laser Package dialog: lines {add_package_start+1} to {add_package_end+1}")

# ─── Phase 3: Collect all laser dialog content ──────────────────
laser_dialogs = []

# Collect comment before each dialog block
# Delete Laser Record
pre_del_record = lines[del_record_start - 1] if del_record_start > 0 else ''
laser_dialogs.append(pre_del_record)
laser_dialogs.extend(lines[del_record_start:del_record_end+1])

# Gap between delete_record and delete_session (add blank line + comment)
laser_dialogs.append('\n')

# Delete Laser Session
pre_del_session = ''
# Find comment before delete_session
for k in range(del_session_start - 3, del_session_start):
    if '{/* Delete Laser Session' in lines[k]:
        pre_del_session = lines[k]
        break
laser_dialogs.append(pre_del_session if pre_del_session else '      {/* Delete Laser Session */}\n')
laser_dialogs.extend(lines[del_session_start:del_session_end+1])

# Gap
laser_dialogs.append('\n\n')

# Add Laser Record Dialog
# Find comment before add_record
pre_add_record = ''
for k in range(add_record_start - 3, add_record_start):
    if 'Add Laser Record' in lines[k] or 'سجل ليزر' in lines[k]:
        pre_add_record = lines[k]
        break
if not pre_add_record:
    pre_add_record = '      {/* Add Laser Record Dialog */}\n'
laser_dialogs.append(pre_add_record)
laser_dialogs.extend(lines[add_record_start:add_record_end+1])

# Gap
laser_dialogs.append('\n\n')

# Add Laser Package Dialog
pre_add_package = ''
for k in range(add_package_start - 3, add_package_start):
    if 'Add Laser Package' in lines[k] or 'باقة ليزر' in lines[k]:
        pre_add_package = lines[k]
        break
if not pre_add_package:
    pre_add_package = '      {/* Add Laser Package */}\n'
laser_dialogs.append(pre_add_package)
laser_dialogs.extend(lines[add_package_start:add_package_end+1])

laser_dialogs_content = ''.join(laser_dialogs)

# ─── Phase 4: Remove renderQuickNotes('laser') from laser JSX ───
# The renderQuickNotes function is defined in page.tsx and shared across sections
# We'll keep the call but pass it as a section parameter
# Actually, renderQuickNotes is a function defined in Home() and used in multiple tabs.
# We need to handle this carefully - either pass it as a prop or replicate it.
# For now, we'll keep renderQuickNotes in page.tsx and call it after <LaserCenter />
# since it's shared infrastructure.

# Remove the renderQuickNotes('laser') call from the extracted JSX
laser_jsx_content = laser_jsx_content.replace(
    "{renderQuickNotes('laser')}",
    "{/* renderQuickNotes('laser') will be called from page.tsx */}"
)

# ─── Phase 5: Create LaserCenter.tsx ────────────────────────────

# Build the component file
component_code = '''\'use client\'

import { useMemo } from \'react\'
import { useAuthStore, useClinicStore } from \'@/lib/store\'
import { useDataStore } from \'@/lib/data-store\'
import { useUIStore, useLaserFormStore } from \'@/store\'
import { cn, safeName, formatCurrency, formatDate, formatTime } from \'@/lib/utils\'
import { LaserRecord, LaserSession, LaserPackage, LaserSetting, Session, Service, Transaction, Patient } from \'@/lib/types\'
import { apiFetch, getLocalDateStr, cairoISO, cairoDateTime, BODY_AREAS } from \'@/lib/helpers\'
import { toast } from \'sonner\'
import { motion } from \'framer-motion\'
import {
  Activity, AlertTriangle, Bell, Calendar, CheckCircle, ChevronDown, Clock, DollarSign,
  Edit3, FileText, Hash, Heart, Lock, MapPin, Phone, Plus, Receipt, Send, Shield,
  Sparkles, Star, Stethoscope, StickyNote, ThumbsUp, Timer, Trash2, Zap, X,
  Package, Settings, Wand2, Scissors, Users, Search, Eye
} from \'lucide-react\'
import { Button } from \'@/components/ui/button\'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from \'@/components/ui/card\'
import { Input } from \'@/components/ui/input\'
import { Textarea } from \'@/components/ui/textarea\'
import { Label } from \'@/components/ui/label\'
import { Badge } from \'@/components/ui/badge\'
import { Separator } from \'@/components/ui/separator\'
import { Tabs, TabsContent, TabsList, TabsTrigger } from \'@/components/ui/tabs\'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from \'@/components/ui/dialog\'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from \'@/components/ui/select\'
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from \'@/components/ui/alert-dialog\'
import { Progress } from \'@/components/ui/progress\'

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
  const isDoctor = userRole === \'doctor\'
  const canDelete = isDoctor

  // ─── Internal Helpers ──────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: \'POST\', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success(\'تمت الإضافة بنجاح\'); return item } catch (e: any) { if (!silent) toast.error(e.message || \'خطأ\'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: \'DELETE\' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success(\'تم الحذف\') } catch (e: any) { toast.error(e.message || \'خطأ\') }
  }
  const markSessionPaid = async (s: Session) => {
    try {
      await apiFetch(`/sessions/${s.id}`, { method: \'PUT\', body: JSON.stringify({ paid: true }) })
      const patientName = patients.find(p => p.id === s.patientId)?.name || \'مريض\'
      const svc = services.find(sv => sv.id === s.serviceId)
      const category = s.notes?.includes(\'ليزر\') ? \'ليزر\' : \'جلسات\'
      const description = `${svc?.name || (category === \'ليزر\' ? \'جلسة ليزر\' : \'جلسة\')} - ${patientName}`
      const txnDate = s.date || cairoISO()
      try {
        const txnRes = await apiFetch(\'/finance/transactions\', { method: \'POST\', body: JSON.stringify({ type: \'income\', category, amount: s.price, description, date: txnDate }) })
        const newTxn = txnRes?.transaction || txnRes?.data || txnRes
        if (newTxn?.id) { setTransactions(prev => [newTxn, ...prev]) }
        else { setTransactions(prev => [...prev, { id: \'sp-\' + Date.now(), type: \'income\', category, amount: s.price, description, date: txnDate }]) }
      } catch { setTransactions(prev => [...prev, { id: \'sp-\' + Date.now(), type: \'income\', category, amount: s.price, description, date: txnDate }]) }
      setSessions(prev => prev.map(ss => ss.id === s.id ? { ...ss, paid: true } : ss))
      toast.success(\'تم الدفع ✅\')
    } catch { toast.error(\'خطأ\') }
  }

  // ─── useMemo: Laser Data ──────────────────────────────────────
  const todayStr = useMemo(() => new Date().toLocaleDateString(\'en-CA\', { timeZone: \'Africa/Cairo\' }), [sessions.length, transactions.length])

  const laserPatientSuggestions = useMemo(() => {
    if (!laserFormPatientSearch) return []
    const q = laserFormPatientSearch.toLowerCase()
    return patients.filter(p => p.name.toLowerCase().includes(q) || p.phone?.includes(q) || p.fileNumber?.toLowerCase().includes(q)).slice(0, 5)
  }, [laserFormPatientSearch, patients])

  const laserHairSessions = useMemo(() => sessions.filter(s => {
    try {
      const svc = services.find(sv => sv.id === s.serviceId)
      if (svc?.category?.includes(\'ليزر\')) return true
      if (s.notes?.startsWith(\'ليزر\')) return true
      return false
    } catch { return false }
  }), [sessions, services])

  const laserRevenue = useMemo(() => transactions.filter(t => t.type === \'income\' && t.category === \'ليزر\').reduce((s, t) => s + (t.amount || 0), 0), [transactions])

  const laserProgressData = useMemo(() => {
    return laserRecords.filter(r => r.status === \'active\').map(r => {
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
      const area = r.bodyArea || \'غير محدد\'
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
  if (activeTab !== \'laser\') return null

'''

# Now we need to extract the actual JSX content from the laser block
# The JSX content is between {activeTab === 'laser' && ( and )}
# We need to extract the inner <div className="space-y-5"> ... </div> content

# Strip the wrapping conditional
inner_content = laser_jsx_content
# Remove the comment line at start
inner_content = inner_content.replace('{/* ═══ LASER ═══ - Professional Laser Center Management */}\n', '')
# Remove {activeTab === 'laser' && (\n
inner_content = re.sub(r'^\{activeTab === \'laser\' && \(\n', '', inner_content)
# Remove the trailing )}\n
inner_content = inner_content.rstrip()
if inner_content.endswith(')}'):
    inner_content = inner_content[:-2]
inner_content = inner_content.rstrip() + '\n'

# Now add the return block and inner content
component_code += '  return (\n' + inner_content + '  )\n'

# Add the dialog sections after the return
component_code += '\n' + laser_dialogs_content

# Close the function
component_code += '}\n'

# ─── Phase 6: Write LaserCenter.tsx ─────────────────────────────
LASER_PATH = '/home/z/my-project/src/components/LaserCenter.tsx'
with open(LASER_PATH, 'w', encoding='utf-8') as f:
    f.write(component_code)

print(f"\n✅ LaserCenter.tsx created: {len(component_code)} chars")

# ─── Phase 7: Modify page.tsx ──────────────────────────────────

# 7a. Add import for LaserCenter
import_insert_line = None
for i, line in enumerate(lines):
    if 'import PatientProfile from' in line:
        import_insert_line = i + 1
        break

if import_insert_line:
    lines.insert(import_insert_line, "import LaserCenter from '@/components/LaserCenter'\n")
    print(f"Added LaserCenter import at line {import_insert_line+1}")
    # Adjust all line indices after this insertion
    laser_jsx_start += 1
    laser_jsx_end += 1
    del_record_start += 1
    del_record_end += 1
    del_session_start += 1
    del_session_end += 1
    add_record_start += 1
    add_record_end += 1
    add_package_start += 1
    add_package_end += 1

# 7b. Replace laser JSX block with <LaserCenter />
# Remove lines from laser_jsx_start-1 (comment) to laser_jsx_end
# and replace with <LaserCenter /> + renderQuickNotes('laser')
replacement_lines = [
    '\n',
    '            {/* ═══ LASER ═══ */}\n',
    '            <LaserCenter />\n',
    '            {renderQuickNotes(\'laser\')}\n',
    '\n',
]

# Remove the laser JSX block (comment + conditional block)
lines_to_remove = range(laser_jsx_start - 1, laser_jsx_end + 1)
new_lines = lines[:laser_jsx_start - 1] + replacement_lines + lines[laser_jsx_end + 1:]

print(f"Replaced laser JSX block ({laser_jsx_end - laser_jsx_start + 2} lines) with <LaserCenter /> (5 lines)")

# 7c. Remove laser dialogs from the new_lines
# We need to find the dialog lines in the new array and remove them
# Since line numbers shifted, we need to find them by content patterns

# Find and remove Delete Laser Record dialog
content = ''.join(new_lines)

# Remove Delete Laser Record AlertDialog block
# Pattern: {/* Delete Laser Record */}...through...</AlertDialog>}
del_record_pattern = r'\{/\* Delete Laser Record \*/\}[\s\S]*?</AlertDialog>\}'
# Actually, let's find it more carefully
# The dialog starts with: {canDelete && <AlertDialog open={!!deleteLaserRecordConfirmId}
# And ends with: </AlertDialog>}

# Use a regex to find and remove each dialog block
# Delete Laser Record
content = re.sub(
    r'\{/\*[^*]*Delete Laser Record[^*]*\*/\}\s*\{canDelete && <AlertDialog open=\{\{!!deleteLaserRecordConfirmId\}\}[^}]*onOpenChange[^>]*>\s*<AlertDialogContent>[\s\S]*?</AlertDialog>\}',
    '', content, count=1
)

# Delete Laser Session
content = re.sub(
    r'\{/\*[^*]*Delete Laser Session[^*]*\*/\}\s*\{canDelete && <AlertDialog open=\{\{!!deleteLaserSessionConfirmId\}\}[^}]*onOpenChange[^>]*>\s*<AlertDialogContent>[\s\S]*?</AlertDialog>\}',
    '', content, count=1
)

# Add Laser Record Dialog - this is a big block
content = re.sub(
    r'\s*<Dialog open=\{showAddLaserRecord\}[\s\S]*?</Dialog>\s*\n',
    '\n', content, count=1
)

# Add Laser Package Dialog - usually single line
content = re.sub(
    r'\s*\{/\*[^*]*Add Laser Package[^*]*\*/\}[\s\S]*?<Dialog open=\{showAddLaserPackage\}[\s\S]*?</Dialog>\s*\n',
    '\n', content, count=1
)

# ─── Phase 8: Remove laser-specific useMemo hooks from page.tsx ──
# These are now in LaserCenter.tsx

# Remove laserPatientSuggestions
content = re.sub(
    r'\s*// Laser patient search\s*\n\s*const laserPatientSuggestions = useMemo\(\(\) => \{[\s\S]*?\}, \[laserFormPatientSearch, patients\]\)\s*\n',
    '\n', content
)

# Remove laserProgressData
content = re.sub(
    r'\s*// ─── Laser Session Progress ───\s*\n\s*const laserProgressData = useMemo\(\(\) => \{[\s\S]*?\}, \[laserRecords, patients\]\)\s*\n',
    '\n', content
)

# Remove laserHairSessions
content = re.sub(
    r'\s*// Laser hair removal sessions - pre-computed for performance and stability\s*\n\s*const laserHairSessions = useMemo\(\(\) => sessions\.filter[\s\S]*?\}, \[sessions, services\]\)\s*\n',
    '\n', content
)

# Remove laserRevenueByArea and laserRevenueByPackage
content = re.sub(
    r'\s*// Laser financial computed values[\s\S]*?\}, \[laserRecords, laserPackages\]\)\s*\n',
    '\n', content
)

# ─── Phase 9: Remove laser-related Zustand store field imports from page.tsx ──
# The laser-specific UI store fields are now consumed only in LaserCenter.tsx
# We need to remove them from the useUIStore destructuring in page.tsx

# Remove laser-specific fields from useUIStore destructuring
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
    # Remove each field from the destructuring
    # Pattern: , field or field, or field } or { field
    content = re.sub(r',\s*' + field + r'\s*', '', content)
    content = re.sub(r field + r'\s*,\s*', '', content)

# Remove laser-specific fields from useLaserFormStore destructuring (if it exists)
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

for field in laser_form_fields:
    content = re.sub(r',\s*' + field + r'\s*', '', content)
    content = re.sub(field + r'\s*,\s*', '', content)

# Remove useLaserFormStore import if it's only used in laser section
# Check if useLaserFormStore is still referenced in page.tsx
if 'useLaserFormStore' not in content or content.count('useLaserFormStore') <= 1:
    # Remove the import
    content = content.replace("import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, useLaserFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'\n",
                              "import { useAppointmentFormStore, useFinanceFormStore, useFollowUpFormStore, usePatientFormStore, usePersonalFormStore, useUIStore } from '@/store'\n")

# Remove laser-specific data store fields from useDataStore destructuring
laser_data_fields = ['laserRecords', 'setLaserRecords', 'laserPackages', 'setLaserPackages', 'laserSettings']
for field in laser_data_fields:
    content = re.sub(r',\s*' + field + r'\s*', '', content)
    content = re.sub(field + r'\s*,\s*', '', content)

# ─── Phase 10: Write modified page.tsx ──────────────────────────
with open(PAGE_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

new_line_count = content.count('\n')
print(f"\n✅ page.tsx modified: {new_line_count} lines (reduced from {total_lines})")
print(f"   Lines removed: ~{total_lines - new_line_count}")

# ─── Verification ────────────────────────────────────────────────
LASER_PATH = '/home/z/my-project/src/components/LaserCenter.tsx'
with open(LASER_PATH, 'r') as f:
    laser_content = f.read()

checks = [
    ("export default function LaserCenter()", "Component export ✓"),
    ("useLaserFormStore", "Laser form store ✓"),
    ("const addItem = async", "addItem internal ✓"),
    ("const markSessionPaid = async", "markSessionPaid internal ✓"),
    ("const laserHairSessions = useMemo", "laserHairSessions useMemo ✓"),
    ("const laserProgressData = useMemo", "laserProgressData useMemo ✓"),
    ("const laserRevenueByArea = useMemo", "laserRevenueByArea useMemo ✓"),
    ("<LaserCenter />", "LaserCenter in page.tsx ✓"),
]

print("\n── Verification ──")
for pattern, label in checks:
    if pattern in laser_content or pattern in content:
        print(f"  ✅ {label}")
    else:
        print(f"  ❌ {label} NOT FOUND!")

# Check laser-specific items removed from page.tsx
removed_checks = [
    ("laserFormPatientSearch", "laserFormPatientSearch removed from page ✓"),
    ("deleteLaserRecordConfirmId", "deleteLaserRecordConfirmId removed from page ✓"),
    ("laserRevenueByArea", "laserRevenueByArea removed from page ✓"),
]

print("\n── Removal Check ──")
for pattern, label in removed_checks:
    # Check in the useUIStore/useLaserFormStore destructuring lines only
    ui_store_line = [l for l in content.split('\n') if 'useUIStore' in l and '=' in l]
    if any(pattern in l for l in ui_store_line):
        print(f"  ⚠️  {label} - still in UI store line")
    else:
        print(f"  ✅ {label}")
