#!/usr/bin/env python3
"""
Step 2: Extract WaitingSection from page.tsx
"""

PAGE = '/home/z/my-project/src/app/page.tsx'
OUT = '/home/z/my-project/src/components/WaitingSection.tsx'

with open(PAGE, 'r', encoding='utf-8') as f:
    text = f.read()

# ─── Find Waiting section boundaries ────────────────────────────────
waiting_marker = '{/* ═══ WAITING TAB - Professional Secretary Queue Management ═══ */}'
# Find the end of the Waiting section - it's wrapped in {activeTab === 'waiting' && (() => { ... })()}
# The })()} pattern marks the end

waiting_start_idx = text.find(waiting_marker)
print(f"Waiting marker at char {waiting_start_idx}")

# Find the })()} that closes the waiting section
# It should be the first })()} after the waiting marker
iife_close = text.find('})()', waiting_start_idx + len(waiting_marker))
print(f"IIFE close at char {iife_close}")

# Also capture the newline after })()}
waiting_end_idx = text.find('\n', iife_close + 3) + 1
print(f"Waiting end at char {waiting_end_idx}")

waiting_block = text[waiting_start_idx:waiting_end_idx]
print(f"Waiting block: {len(waiting_block)} chars")

# ─── Extract inner JSX from Waiting block ──────────────────────────────
# The block is: {/* ═══ WAITING ... ═══ */}\n{activeTab === 'waiting' && (() => {
#   ... local variables ...
#   return (
#     <div>...JSX...</div>
#   )
# })()}

import re

# Find {activeTab === 'waiting' && (() => {
match = re.search(r"\{activeTab === 'waiting' && \(\(\) => \{", waiting_block)
if match:
    inner_start = match.end()
    # Find })()}
    iife_close_inner = waiting_block.find('})()', inner_start)
    # The inner content is between { and })()}
    inner = waiting_block[inner_start:iife_close_inner]
    
    # Remove the "return (" wrapper
    ret_match = re.search(r'\n\s*return \(\s*\n', inner)
    if ret_match:
        inner_content = inner[ret_match.end():]
    else:
        inner_content = inner
    
    # Remove trailing ) 
    inner_content = inner_content.rstrip()
    if inner_content.endswith(')'):
        inner_content = inner_content[:-1].rstrip()
    
    inner_content = inner_content.rstrip('\n')
else:
    print("WARNING: Could not find waiting pattern")
    inner_content = waiting_block

print(f"Inner JSX: {len(inner_content)} chars")

# ─── Find Add Waiting Queue Dialog ────────────────────────────────────
dialog_marker = '{/* Add to Waiting Queue Dialog */}'
dialog_start_idx = text.find(dialog_marker)
# Find </Dialog> after this
dialog_close_idx = text.find('</DialogContent></Dialog>', dialog_start_idx)
dialog_end_idx = text.find('\n', dialog_close_idx + len('</DialogContent></Dialog>')) + 1
dialog_block = text[dialog_start_idx:dialog_end_idx]
print(f"Waiting Queue dialog: {len(dialog_block)} chars")

# ─── Build WaitingSection.tsx ────────────────────────────────────────
imports = """'use client'

import { useMemo } from 'react'
import { useAuthStore, useClinicStore } from '@/lib/store'
import { useDataStore } from '@/lib/data-store'
import { useUIStore } from '@/store'
import { cn, formatCurrency } from '@/lib/utils'
import { apiFetch } from '@/lib/helpers'
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Clock, Plus, Trash2, Edit3, CheckCircle, Timer, Users, Phone, X, ChevronDown,
  Star, Hash, Badge as BadgeIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { WaitingItem } from '@/lib/types'
"""

stores = """
export default function WaitingSection() {
  const { userRole } = useAuthStore()
  const { activeTab, setActiveTab } = useClinicStore()
  const { patients, waitingQueue, setWaitingQueue } = useDataStore()
  const { showAddWaiting, setShowAddWaiting, waitingFormName, setWaitingFormName, waitingFormPriority, setWaitingFormPriority, waitingFormPatientId, setWaitingFormPatientId, waitingFormNotes, setWaitingFormNotes, setSelectedPatient } = useUIStore()

  const isDoctor = userRole === 'doctor'

  // ─── Helper functions ────────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.item || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }
"""

full_content = imports + stores + "\n  return (\n    <>\n" + inner_content + "\n\n" + dialog_block + "\n    </>\n  )\n}\n"

with open(OUT, 'w', encoding='utf-8') as f:
    f.write(full_content)

line_count = full_content.count('\n') + 1
print(f"\nCreated WaitingSection.tsx: {line_count} lines")

# ─── Modify page.tsx ──────────────────────────────────────────────────
# 1. Add import for WaitingSection
import_line = "import WaitingSection from '@/components/WaitingSection'\n"
more_import_idx = text.find("import MoreSection from '@/components/MoreSection'")
if more_import_idx >= 0:
    line_end = text.find('\n', more_import_idx) + 1
    text = text[:line_end] + import_line + text[line_end:]
    print(f"Added WaitingSection import")

# 2. Replace the Waiting section block with <WaitingSection />
# Find the markers again (they shifted after import insertion)
waiting_start_idx = text.find(waiting_marker)
iife_close = text.find('})()', waiting_start_idx + len(waiting_marker))
waiting_end_idx = text.find('\n', iife_close + 3) + 1

replacement = "            {/* ═══ WAITING TAB - Professional Secretary Queue Management ═══ */}\n            <WaitingSection />\n"
text = text[:waiting_start_idx] + replacement + text[waiting_end_idx:]
print(f"Replaced Waiting section with <WaitingSection />")

# 3. Remove Add Waiting Queue Dialog from page.tsx
dialog_marker = '{/* Add to Waiting Queue Dialog */}'
dialog_start_idx = text.find(dialog_marker)
dialog_close_idx = text.find('</DialogContent></Dialog>', dialog_start_idx)
dialog_end_idx = text.find('\n', dialog_close_idx + len('</DialogContent></Dialog>')) + 1
text = text[:dialog_start_idx] + text[dialog_end_idx:]
print(f"Removed Add Waiting Queue dialog from page.tsx")

with open(PAGE, 'w', encoding='utf-8') as f:
    f.write(text)

new_lines = text.count('\n')
print(f"\nModified page.tsx: now ~{new_lines} lines")
print(f"\n✅ Step 2 complete: WaitingSection extracted")
