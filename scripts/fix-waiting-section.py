#!/usr/bin/env python3
"""Fix WaitingSection.tsx - add missing computed values, functions, and imports."""

import re

filepath = '/home/z/my-project/src/components/WaitingSection.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add Sparkles to lucide-react import
old_import = "Clock, Plus, Trash2, Edit3, CheckCircle, Timer, Users, Phone, X, ChevronDown,\n  Star, Hash, Badge as BadgeIcon"
new_import = "Clock, Plus, Trash2, Edit3, CheckCircle, Timer, Users, Phone, X, ChevronDown,\n  Star, Hash, Badge as BadgeIcon, Sparkles"
content = content.replace(old_import, new_import)

# 2. Add canDelete and deleteItem after isDoctor definition
old_is_doctor = "  const isDoctor = userRole === 'doctor'"
new_is_doctor = """  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor

  // ─── CRUD helpers ────────────────────────────────────────────
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }"""
content = content.replace(old_is_doctor, new_is_doctor)

# 3. Add useMemo computed values after deleteItem definition
# Find the position right before "return ("
insert_before_return = "  return (\n    <>"
computed_values = """
  // ─── Computed values ────────────────────────────────────────────
  const waitingItems = useMemo(() => waitingQueue.filter(w => w.status === 'waiting').sort((a, b) => b.priority - a.priority || new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [waitingQueue])
  const inProgressItems = useMemo(() => waitingQueue.filter(w => w.status === 'in-progress').sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()), [waitingQueue])
  const doneItems = useMemo(() => waitingQueue.filter(w => w.status === 'done' || w.status === 'left'), [waitingQueue])
  const totalWaiting = waitingItems.length
  const totalInProgress = inProgressItems.length
  const totalDone = doneItems.length

"""
content = content.replace(insert_before_return, computed_values + insert_before_return)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ WaitingSection.tsx fixed successfully!")
