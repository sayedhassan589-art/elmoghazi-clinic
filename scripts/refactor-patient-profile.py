#!/usr/bin/env python3
"""
Step 2 Refactor: Make PatientProfile.tsx self-contained
- Remove props interface (addItem, deleteItem, markSessionPaid)
- Add internal addItem, deleteItem, markSessionPaid functions
- Add useMemo hooks for filtered patient data
- Import useMemo from React
"""

import re

PP_PATH = '/home/z/my-project/src/components/PatientProfile.tsx'

with open(PP_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# ─── 1. Add useMemo import ───────────────────────────────────
old_import = "import { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'"
new_import = "import { useMemo } from 'react'\nimport { cn, safeName, formatCurrency, formatDate, formatTime } from '@/lib/utils'"
content = content.replace(old_import, new_import)

# ─── 2. Remove props interface ───────────────────────────────
# Remove lines 26-30 (interface PatientProfileProps block)
interface_pattern = r'''// ─── PatientProfile Component ──────────────────────────────────────
interface PatientProfileProps \{
  addItem: <T,>\(path: string, body: any, setter: React\.Dispatch<React\.SetStateAction<T\[\]>>, silent\?: boolean\) => Promise<any>
  deleteItem: <T,>\(path: string, id: string, setter: React\.Dispatch<React\.SetStateAction<T\[\]>>\) => Promise<void>
  markSessionPaid: \(s: Session\) => Promise<void>
\}

export default function PatientProfile\(\{ addItem, deleteItem, markSessionPaid \}: PatientProfileProps\)'''

interface_replacement = '''// ─── PatientProfile Component (self-contained) ──────────────────────────────────
export default function PatientProfile()'''

content = re.sub(interface_pattern, interface_replacement, content, flags=re.MULTILINE)

# ─── 3. Add internal helper functions + useMemo after store declarations ────
# Find the line after "const canEditPatientFull = isDoctor" to insert new functions
# We need to insert before "if (activeTab !== 'patients' || !selectedPatient) return null"

marker = "  // ─── Render ────────────────────────────────────────────────────\n  if (activeTab !== 'patients' || !selectedPatient) return null"

new_code = """  // ─── Internal Helpers (self-contained) ─────────────────────────────
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

  // ─── useMemo: Filtered Patient Data ──────────────────────────────
  const pVisits = useMemo(() => visits.filter(v => selectedPatient && v.patientId === selectedPatient.id), [visits, selectedPatient])
  const pSessions = useMemo(() => sessions.filter(s => selectedPatient && s.patientId === selectedPatient.id), [sessions, selectedPatient])
  const pLaser = useMemo(() => laserRecords.filter(l => selectedPatient && l.patientId === selectedPatient.id), [laserRecords, selectedPatient])
  const pNotes = useMemo(() => notes.filter(n => selectedPatient && n.patientId === selectedPatient.id), [notes, selectedPatient])
  const pReminders = useMemo(() => reminders.filter(r => selectedPatient && r.patientId === selectedPatient.id), [reminders, selectedPatient])
  const pTransactions = useMemo(() => transactions.filter(t => selectedPatient && t.description?.includes(selectedPatient.name)), [transactions, selectedPatient])
  const pLaserSessions = useMemo(() => pLaser.flatMap(r => r.laserSessions || []), [pLaser])

  // ─── Render ────────────────────────────────────────────────────
  if (activeTab !== 'patients' || !selectedPatient) return null"""

content = content.replace(marker, new_code)

# ─── 4. Replace inline .filter() calls with useMemo variables ──────
# In the Overview tab IIFE, replace the local variable declarations
overview_iife_vars = """          const pVisits = visits.filter(v => v.patientId === selectedPatient.id)
          const pSessions = sessions.filter(s => s.patientId === selectedPatient.id)
          const pLaser = laserRecords.filter(l => l.patientId === selectedPatient.id)
          const pLaserSessions = pLaser.flatMap(r => r.laserSessions || [])
          const pNotes = notes.filter(n => n.patientId === selectedPatient.id)"""

overview_iife_vars_replacement = """          // Already computed via useMemo above: pVisits, pSessions, pLaser, pLaserSessions, pNotes
          const totalSpent = pSessions.reduce((a, s) => a + s.price, 0) + pLaserSessions.reduce((a, s) => a + (s.price || 0), 0)
          const totalPaid = pSessions.filter(s => s.paid).reduce((a, s) => a + s.price, 0) + pLaserSessions.filter(s => s.paid).reduce((a, s) => a + (s.price || 0), 0)
          const totalUnpaid = totalSpent - totalPaid
          const latestVisit = pVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          const latestDiagnosis = latestVisit?.diagnosis || latestVisit?.notes"""

# Find the original block including the derived calculations
original_overview_block = """          const pVisits = visits.filter(v => v.patientId === selectedPatient.id)
          const pSessions = sessions.filter(s => s.patientId === selectedPatient.id)
          const pLaser = laserRecords.filter(l => l.patientId === selectedPatient.id)
          const pLaserSessions = pLaser.flatMap(r => r.laserSessions || [])
          const pNotes = notes.filter(n => n.patientId === selectedPatient.id)
          const totalSpent = pSessions.reduce((a, s) => a + s.price, 0) + pLaserSessions.reduce((a, s) => a + (s.price || 0), 0)
          const totalPaid = pSessions.filter(s => s.paid).reduce((a, s) => a + s.price, 0) + pLaserSessions.filter(s => s.paid).reduce((a, s) => a + (s.price || 0), 0)
          const totalUnpaid = totalSpent - totalPaid
          const latestVisit = pVisits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          const latestDiagnosis = latestVisit?.diagnosis || latestVisit?.notes"""

content = content.replace(original_overview_block, overview_iife_vars_replacement)

# ─── 5. Replace inline filters in Sessions tab ───────────────────
# "sessions.filter(s => s.patientId === selectedPatient.id)" -> "pSessions"
content = content.replace(
    "{sessions.filter(s => s.patientId === selectedPatient.id).map(s => {",
    "{pSessions.map(s => {"
)

# ─── 6. Replace inline filters in Visits tab ────────────────────
content = content.replace(
    "{visits.filter(v => v.patientId === selectedPatient.id).map(v => {",
    "{pVisits.map(v => {"
)

# ─── 7. Replace inline filters in Reminders tab ──────────────────
content = content.replace(
    "{reminders.filter(r => r.patientId === selectedPatient.id).sort",
    "{pReminders.sort"
)

# ─── 8. Replace inline filters in Laser tab ────────────────────
content = content.replace(
    "{laserRecords.filter(l => l.patientId === selectedPatient.id).map",
    "{pLaser.map"
)

# ─── 9. Replace inline filters in Finance tab ──────────────────
content = content.replace(
    "{transactions.filter(t => t.description?.includes(selectedPatient.name)).map",
    "{pTransactions.map"
)

# ─── 10. Replace inline filters in Notes tab ──────────────────
content = content.replace(
    "{notes.filter(n => n.patientId === selectedPatient.id).map",
    "{pNotes.map"
)

# ─── 11. Replace inline filters in Activity Timeline (overview) ──
content = content.replace(
    "const pV = visits.filter(v => v.patientId === selectedPatient.id).map",
    "const pV = pVisits.map"
)
content = content.replace(
    "const pS = sessions.filter(s => s.patientId === selectedPatient.id).map",
    "const pS = pSessions.map"
)
content = content.replace(
    "const pN = notes.filter(n => n.patientId === selectedPatient.id).map",
    "const pN = pNotes.map"
)

# ─── 12. Replace inline visit filter in session edit/delete ───────
# In sessions tab, edit handler references: transactions.find(t => t.description?.includes(selectedPatient!.name)...
# This is fine since it's using the full transactions array for cross-referencing, not pTransactions
# Leave it as-is since it needs the full transactions list for matching

# ─── 13. Replace the delete patient inline block with internal function ──
# The AlertDialogAction onClick for delete patient currently has a huge inline block
# We'll create an internal deletePatientWithFinance function

# Add it to the internal helpers section (before useMemo)
delete_patient_func = """  // Delete patient with full cascade cleanup
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
"""

# Insert before useMemo section
usemem_marker = "  // ─── useMemo: Filtered Patient Data ──────────────────────────────"
content = content.replace(usemem_marker, delete_patient_func + usemem_marker)

# ─── 14. Replace the inline delete patient AlertDialogAction ─────
# Find the massive onClick block and replace with simple deletePatientWithFinance()

# The current onClick for delete patient AlertDialogAction is a huge inline block
# Pattern: onClick={async () => { if (!selectedPatient) return; try { ...massive block... } catch { ... } }}
# Replace it with: onClick={deletePatientWithFinance}

old_delete_action = r'''onClick=\{async \(\) => \{ if \(!selectedPatient\) return; try \{ const pVisits = visits\.filter\(v => v\.patientId === selectedPatient\.id\); const pSessions = sessions\.filter\(s => s\.patientId === selectedPatient\.id\); for \(const v of pVisits\) \{ await apiFetch\(`/visits/\$\{v\.id\}`, \{ method: 'DELETE' \}\); \} for \(const s of pSessions\) \{ await apiFetch\(`/sessions/\$\{s\.id\}`, \{ method: 'DELETE' \}\); \} const relatedTx = transactions\.filter\(t => t\.description\?\.includes\(selectedPatient\.name\)\); for \(const tx of relatedTx\) \{ await apiFetch\(`/finance/transactions/\$\{tx\.id\}`, \{ method: 'DELETE' \}\); \} const relatedNotes = notes\.filter\(n => n\.patientId === selectedPatient\.id\); for \(const n of relatedNotes\) \{ await apiFetch\(`/notes/\$\{n\.id\}`, \{ method: 'DELETE' \}\); \} await apiFetch\(`/patients/\$\{selectedPatient\.id\`, \{ method: 'DELETE' \}\); setPatients\(prev => prev\.filter\(p => p\.id !== selectedPatient\.id\)\); setVisits\(prev => prev\.filter\(v => v\.patientId !== selectedPatient\.id\)\); setSessions\(prev => prev\.filter\(s => s\.patientId !== selectedPatient\.id\)\); setTransactions\(prev => prev\.filter\(t => !t\.description\?\.includes\(selectedPatient\.name\)\)\); setNotes\(prev => prev\.filter\(n => n\.patientId !== selectedPatient\.id\)\); setLaserRecords\(prev => prev\.filter\(r => r\.patientId !== selectedPatient\.id\)\); setSelectedPatient\(null\); setDeletePatientConfirmOpen\(false\); toast\.success\('تم حذف المريض وكل البيانات المرتبطة ✅'\) \} catch \{ toast\.error\('خطأ في الحذف'\) \} \}\}'''

# The regex above might not match due to formatting. Let's use a simpler approach.
# Find and replace the specific text pattern for the AlertDialogAction onClick

# Use string replacement instead of regex for the delete action
old_action_text = '''onClick={async () => { if (!selectedPatient) return; try { const pVisits = visits.filter(v => v.patientId === selectedPatient.id); const pSessions = sessions.filter(s => s.patientId === selectedPatient.id); for (const v of pVisits) { await apiFetch(`/visits/${v.id}`, { method: 'DELETE' }); } for (const s of pSessions) { await apiFetch(`/sessions/${s.id}`, { method: 'DELETE' }); } const relatedTx = transactions.filter(t => t.description?.includes(selectedPatient.name)); for (const tx of relatedTx) { await apiFetch(`/finance/transactions/${tx.id}`, { method: 'DELETE' }); } const relatedNotes = notes.filter(n => n.patientId === selectedPatient.id); for (const n of relatedNotes) { await apiFetch(`/notes/${n.id}`, { method: 'DELETE' }); } await apiFetch(`/patients/${selectedPatient.id}`, { method: 'DELETE' }); setPatients(prev => prev.filter(p => p.id !== selectedPatient.id)); setVisits(prev => prev.filter(v => v.patientId !== selectedPatient.id)); setSessions(prev => prev.filter(s => s.patientId !== selectedPatient.id)); setTransactions(prev => prev.filter(t => !t.description?.includes(selectedPatient.name))); setNotes(prev => prev.filter(n => n.patientId !== selectedPatient.id)); setLaserRecords(prev => prev.filter(r => r.patientId !== selectedPatient.id)); setSelectedPatient(null); setDeletePatientConfirmOpen(false); toast.success('تم حذف المريض وكل البيانات المرتبطة ✅') } catch { toast.error('خطأ في الحذف') } }}'''

new_action_text = '''onClick={deletePatientWithFinance}'''

content = content.replace(old_action_text, new_action_text)

# ─── Write the modified file ───────────────────────────────────
with open(PP_PATH, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ PatientProfile.tsx refactored successfully!")
print(f"   File size: {len(content)} chars")

# Verify key changes
checks = [
    ("export default function PatientProfile()", "Props removed ✓"),
    ("const addItem = async <T,>", "addItem internal ✓"),
    ("const deleteItem = async <T,>", "deleteItem internal ✓"),
    ("const markSessionPaid = async", "markSessionPaid internal ✓"),
    ("const pVisits = useMemo", "pVisits useMemo ✓"),
    ("const pSessions = useMemo", "pSessions useMemo ✓"),
    ("const pLaser = useMemo", "pLaser useMemo ✓"),
    ("const pNotes = useMemo", "pNotes useMemo ✓"),
    ("const pReminders = useMemo", "pReminders useMemo ✓"),
    ("const pTransactions = useMemo", "pTransactions useMemo ✓"),
    ("const deletePatientWithFinance", "deletePatientWithFinance ✓"),
    ("onClick={deletePatientWithFinance}", "Delete action simplified ✓"),
    ("import { useMemo } from 'react'", "useMemo import ✓"),
    ("{pSessions.map(s => {", "Sessions filter replaced ✓"),
]

print("\n── Verification ──")
for pattern, label in checks:
    if pattern in content:
        print(f"  ✅ {label}")
    else:
        print(f"  ❌ {label} NOT FOUND!")

# Check that old patterns are removed
bad_patterns = [
    ("PatientProfileProps", "Props interface"),
    ("{ addItem, deleteItem, markSessionPaid }", "Props destructuring"),
    ("visits.filter(v => v.patientId === selectedPatient.id).map(v =>", "Inline visits filter"),
    ("sessions.filter(s => s.patientId === selectedPatient.id).map(s =>", "Inline sessions filter"),
    ("laserRecords.filter(l => l.patientId === selectedPatient.id).map", "Inline laser filter"),
]

print("\n── Removal Check ──")
for pattern, label in bad_patterns:
    if pattern in content:
        print(f"  ⚠️  {label} STILL EXISTS (may be in other contexts)")
    else:
        print(f"  ✅ {label} removed")
