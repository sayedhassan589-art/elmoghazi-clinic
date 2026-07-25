#!/usr/bin/env python3
"""
Step 2: Extract PatientProfile from page.tsx - FINAL VERSION

Uses verified exact line numbers (0-indexed):
- Interfaces: lines 46-69
- Helpers section: lines 71-374 (excluding useDebouncedValue 298-306 and CairoClock 375-383)
- useDebouncedValue: lines 298-306 
- CairoClock: lines 375-383
- Home() function: starts at line 385
- Profile JSX: lines 1954-2612 (comment + conditional + content + closing + blank)
  - Inner div: lines 1956-2610

Strategy: Build all files from scratch, then assemble modified page.tsx.
"""

import os, shutil

BASE = '/home/z/my-project'
SRC = f'{BASE}/src'
PAGE = f'{SRC}/app/page.tsx'

with open(PAGE, 'r') as f:
    lines = f.read().split('\n')
total = len(lines)
print(f"Original: {total} lines")

# ─── A1: Create types.ts ─────────────────────────────────────────────
# Interfaces: 0-indexed lines 46-69
iface_lines = lines[46:70]  # +1 for inclusive end
types_ts = """// ─── Shared Type Definitions ─────────────────────────────────────────
// Extracted from page.tsx for use by all components

""" + '\n'.join(iface_lines) + "\n"

with open(f'{SRC}/lib/types.ts', 'w') as f:
    f.write(types_ts)
print("✅ Created /src/lib/types.ts")

# ─── A2: Create helpers.ts ────────────────────────────────────────────
# Extract all module-level helpers (lines 71-374), excluding React hooks/components
# Exclude ranges (0-indexed):
# - useDebouncedValue: lines 296-306 (include preceding comment/blank)
# - CairoClock: lines 374-383 (include preceding comment)

# Build helper lines: from line 71 to line 374 (inclusive), skipping excluded ranges
exclude_ranges = [(296, 306), (374, 383)]  # 0-indexed

helper_lines = []
for i in range(71, 384):  # 71 to 383 inclusive
    excluded = any(s <= i <= e for s, e in exclude_ranges)
    if not excluded:
        helper_lines.append(lines[i])

helpers_ts = """// ─── Shared Helper Functions & Constants ──────────────────────────
// Extracted from page.tsx for use by all components

""" + '\n'.join(helper_lines) + "\n"

with open(f'{SRC}/lib/helpers.ts', 'w') as f:
    f.write(helpers_ts)
print(f"✅ Created /src/lib/helpers.ts ({len(helper_lines)} lines)")

# ─── A3: Create PatientProfile.tsx ────────────────────────────────────
# Inner JSX: 0-indexed lines 1956-2610 (the <div className="space-y-4"> through </div>)
inner_jsx_lines = lines[1956:2611]  # inclusive of line 2610

# Measure indentation of first line to know the base indent
base_indent = len(inner_jsx_lines[0]) - len(inner_jsx_lines[0].lstrip())
# Target indent for component return: 2 spaces
indent_diff = base_indent - 2  # How much to reduce

# Adjust indentation: reduce each line's leading spaces by indent_diff
adjusted_lines = []
for line in inner_jsx_lines:
    if line.strip() == '':
        adjusted_lines.append('')
    else:
        current_indent = len(line) - len(line.lstrip())
        new_indent = max(0, current_indent - indent_diff)
        adjusted_lines.append(' ' * new_indent + line.lstrip())

adjusted_jsx = '\n'.join(adjusted_lines)

# Icons used in Patient Profile
icons = [
    'Activity', 'AlertTriangle', 'Bell', 'Calendar', 'CheckCircle',
    'ChevronDown', 'ClipboardCheck', 'Clock', 'DollarSign', 'Edit3',
    'FileText', 'Hash', 'Heart', 'Lock', 'MapPin', 'Phone', 'Plus',
    'Receipt', 'Send', 'Shield', 'Sparkles', 'Star', 'Stethoscope',
    'StickyNote', 'ThumbsUp', 'Timer', 'Trash2', 'Zap', 'X',
]

patient_profile = f"""'use client'

import {{ useAuthStore, useClinicStore }} from '@/lib/store'
import {{ useDataStore }} from '@/lib/data-store'
import {{ useUIStore, usePatientFormStore }} from '@/store'
import {{ cn, safeName, formatCurrency, formatDate, formatTime }} from '@/lib/utils'
import {{ ImprovementEntry, Patient, Visit, Session, Service, Note, LaserRecord, Transaction, Reminder }} from '@/lib/types'
import {{ apiFetch, waPhone, normalizePhone, cairoISO, cairoDateTime, getImprovementColor, getImprovementEmoji, getImprovementHistory, getVisitCategory, VISIT_TYPES }} from '@/lib/helpers'
import {{ toast }} from 'sonner'
import {{ motion }} from 'framer-motion'
import {{ {', '.join(icons)} }} from 'lucide-react'
import {{ Button }} from '@/components/ui/button'
import {{ Card, CardContent, CardFooter }} from '@/components/ui/card'
import {{ Input }} from '@/components/ui/input'
import {{ Textarea }} from '@/components/ui/textarea'
import {{ Label }} from '@/components/ui/label'
import {{ Badge }} from '@/components/ui/badge'
import {{ Separator }} from '@/components/ui/separator'
import {{ Avatar, AvatarFallback }} from '@/components/ui/avatar'
import {{ Tabs, TabsContent, TabsList, TabsTrigger }} from '@/components/ui/tabs'
import {{ Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription }} from '@/components/ui/dialog'
import {{ Select, SelectContent, SelectItem, SelectTrigger, SelectValue }} from '@/components/ui/select'
import {{ AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter, AlertDialogCancel, AlertDialogAction }} from '@/components/ui/alert-dialog'

// ─── PatientProfile Component ──────────────────────────────────────
interface PatientProfileProps {{
  addItem: <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent?: boolean) => Promise<any>
  deleteItem: <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => Promise<void>
  markSessionPaid: (s: Session) => Promise<void>
}}

export default function PatientProfile({{ addItem, deleteItem, markSessionPaid }}: PatientProfileProps) {{
  // ─── Stores ────────────────────────────────────────────────────
  const {{ userRole }} = useAuthStore()
  const {{ defaultCheckupPrice, defaultRevisitPrice, activeTab, setActiveTab }} = useClinicStore()
  const {{ patients, setPatients, visits, setVisits, sessions, setSessions, services, notes, setNotes, laserRecords, setLaserRecords, transactions, setTransactions, reminders, setReminders, waitingQueue, setWaitingQueue, patientPhotos, setPatientPhotos, refreshPatientPhotos }} = useDataStore()
  const {{ selectedPatient, setSelectedPatient, patientDetailTab, setPatientDetailTab, editingPatient, setEditingPatient, deletePatientConfirmOpen, setDeletePatientConfirmOpen, showAddSessionProfile, setShowAddSessionProfile, showAddVisitProfile, setShowAddVisitProfile, showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement, showAddLaserRecord, setShowAddLaserRecord, laserFormPatientId, setLaserFormPatientId, laserFormPatientSearch, setLaserFormPatientSearch }} = useUIStore()
  const {{ editPatientForm, setEditPatientForm, profileSessionServiceId, setProfileSessionServiceId, profileSessionPrice, setProfileSessionPrice, profileSessionNotes, setProfileSessionNotes, profileSessionDate, setProfileSessionDate, profileVisitType, setProfileVisitType, profileVisitPrice, setProfileVisitPrice, profileVisitNotes, setProfileVisitNotes, profileVisitDate, setProfileVisitDate, quickNote, setQuickNote, editingNoteId, setEditingNoteId, editingNoteContent, setEditingNoteContent, editingVisitId, setEditingVisitId, editVisitForm, setEditVisitForm, editingSessionId, setEditingSessionId, editSessionForm, setEditSessionForm, improvementSliderValue, setImprovementSliderValue, improvementNote, setImprovementNote }} = usePatientFormStore()

  // ─── Role-based access ─────────────────────────────────────────
  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor
  const canEditPatientFull = isDoctor

  // ─── Render ────────────────────────────────────────────────────
  if (activeTab !== 'patients' || !selectedPatient) return null

  return (
{adjusted_jsx}
  )
}}
"""

with open(f'{SRC}/components/PatientProfile.tsx', 'w') as f:
    f.write(patient_profile)
print("✅ Created /src/components/PatientProfile.tsx")

# ─── B: Build modified page.tsx ────────────────────────────────────────
# Backup first
shutil.copy2(PAGE, PAGE + '.bak3')
print("✅ Backed up page.tsx")

# Assemble from pieces:
# Piece 1: Lines 0-44 (original imports including 'use client')
# Piece 2: New import lines (types, helpers, PatientProfile)  
# Piece 3: useDebouncedValue hook (lines 296-306)
# Piece 4: CairoClock component (lines 374-383)
# Piece 5: Home() function (lines 385+), with Profile JSX replaced

# Piece 1: Original imports
p1 = '\n'.join(lines[0:45])

# Piece 2: New imports
p2 = """import { ImprovementEntry, Patient, Visit, Session, Service, Note, LaserRecord, LaserSession, Transaction, Reminder, WaitingItem, InventoryItem, Medication, Prescription, Notification, Backup, PatientPhoto, PartnerDoctor, FollowUpRecord, FollowUpVisit, Alert, LaserPackage, LaserSetting, Appointment } from '@/lib/types'
import { CHART_COLORS, normalizePhone, waPhone, getLocalDateStr, getCairoWeekday, getCairoDateLabel, getCairoDateParts, getEgyptianWeekDays, cairoISO, cairoTodayInput, cairoTimeInput, cairoDateTime, apiFetch, BODY_AREAS, SKIN_TYPES, HAIR_COLORS, getImprovementColor, getImprovementEmoji, getImprovementHistory, normalizeArabic, fuzzyMatch, smartSearch, getVisitCategory, VISIT_TYPES } from '@/lib/helpers'
import PatientProfile from '@/components/PatientProfile'"""

# Piece 3: useDebouncedValue (lines 296-306 0-indexed)
# Include preceding comments if any
deb_start = 296
# Check for preceding comment
for k in range(295, 290, -1):
    if lines[k].strip().startswith('//') or lines[k].strip() == '':
        deb_start = k
    else:
        break
p3 = '\n'.join(lines[deb_start:307])

# Piece 4: CairoClock (lines 374-383 0-indexed)
# Include preceding comment (Isolated Cairo Clock)
clock_start = 374
for k in range(373, 370, -1):
    if lines[k].strip().startswith('//') or lines[k].strip() == '':
        clock_start = k
    else:
        break
p4 = '\n'.join(lines[clock_start:384])

# Piece 5: Home() function, replacing Profile JSX
# Home() starts at line 385 (0-indexed)
# Profile JSX to replace: lines 1954-2612 (0-indexed)
# (comment line 1954, conditional 1955, content through 2611 closing, blank 2612)

home_lines = lines[385:]
profile_start_in_home = 1954 - 385  # = 1569
profile_end_in_home = 2612 - 385    # = 2227

# Build modified Home() lines
modified_home = []
skip = False
for i in range(len(home_lines)):
    if i == profile_start_in_home:
        # Replace the entire Profile section with PatientProfile component
        modified_home.append("            {/* ═══ PATIENT DETAIL - DEDICATED PROFILE ═══ */}")
        modified_home.append("            <PatientProfile addItem={addItem} deleteItem={deleteItem} markSessionPaid={markSessionPaid} />")
        skip = True
        continue
    elif i == profile_end_in_home:
        skip = False
        continue
    elif skip:
        continue
    else:
        modified_home.append(home_lines[i])

p5 = '\n'.join(modified_home)

# Assemble final page.tsx
new_content = f"""{p1}
{p2}

{p3}

{p4}

{p5}
"""

with open(PAGE, 'w') as f:
    f.write(new_content)

new_total = len(new_content.split('\n'))
print(f"✅ Modified page.tsx: {total} → {new_total} lines (saved {total - new_total} lines)")
