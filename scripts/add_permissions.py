#!/usr/bin/env python3
"""Add canDelete && conditionals to key delete buttons for secretary role restrictions."""

filepath = '/home/z/my-project/src/app/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# Use regex-based replacements since the inline JSX is complex
# We need to wrap specific delete buttons with {canDelete && ...} and close with }

changes_made = 0

# 1. Dashboard notes delete button (line 1888) - wrap with canDelete
old1 = '<Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem(\'/notes\', n.id, setNotes)}><Trash2 size={10} className="text-red-400" /></Button>'
new1 = '{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem(\'/notes\', n.id, setNotes)}><Trash2 size={10} className="text-red-400" /></Button>}'
if old1 in content:
    content = content.replace(old1, new1)
    changes_made += 1
    print("1. Wrapped dashboard note delete with canDelete")

# 2. Reminder delete in patient profile (line 2779) - wrap with canDelete
old2 = '<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem(\'/reminders\', r.id, setReminders)}><Trash2 size={10} className="text-red-500" /></Button>'
new2 = '{canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => deleteItem(\'/reminders\', r.id, setReminders)}><Trash2 size={10} className="text-red-500" /></Button>}'
if old2 in content:
    content = content.replace(old2, new2)
    changes_made += 1
    print("2. Wrapped reminder delete with canDelete")

# 3. Transaction delete in patient profile (line 2826) - the one with 'تم حذف المعاملة المالية'
old3 = '<Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success(\'تم حذف المعاملة المالية\') } catch { toast.error(\'خطأ في الحذف\') } }}><Trash2 size={9} className="text-red-400" /></Button>'
new3 = '{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success(\'تم حذف المعاملة المالية\') } catch { toast.error(\'خطأ في الحذف\') } }}><Trash2 size={9} className="text-red-400" /></Button>}'
if old3 in content:
    content = content.replace(old3, new3)
    changes_made += 1
    print("3. Wrapped patient profile transaction delete with canDelete")

# 4. Note delete in laser/patient profile section (line 3385)
old4 = '<Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem(\'/notes\', n.id, setNotes)}><Trash2 size={9} className="text-red-500" /></Button>'
new4 = '{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => deleteItem(\'/notes\', n.id, setNotes)}><Trash2 size={9} className="text-red-500" /></Button>}'
if old4 in content:
    content = content.replace(old4, new4)
    changes_made += 1
    print("4. Wrapped laser note delete with canDelete")

# 5. Finance transaction delete in laser section (line 3720) - 'تم حذف المعاملة' (without المالية)
old5 = '<Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success(\'تم حذف المعاملة\') } catch { toast.error(\'خطأ في الحذف\') } }}><Trash2 size={9} className="text-red-500" /></Button>'
new5 = '{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5" onClick={async () => { try { await apiFetch(`/finance/transactions/${t.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(tx => tx.id !== t.id)); toast.success(\'تم حذف المعاملة\') } catch { toast.error(\'خطأ في الحذف\') } }}><Trash2 size={9} className="text-red-500" /></Button>}'
if old5 in content:
    content = content.replace(old5, new5)
    changes_made += 1
    print("5. Wrapped laser finance delete with canDelete")

# 6. Laser session delete button (larger version - line 3230)
old6 = '<Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px] font-bold" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={10} className="ml-0.5" /> حذف</Button>'
new6 = '{canDelete && <Button size="sm" variant="outline" className="h-7 px-2.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px] font-bold" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={10} className="ml-0.5" /> حذف</Button>}'
if old6 in content:
    content = content.replace(old6, new6)
    changes_made += 1
    print("6. Wrapped laser session delete (large) with canDelete")

# 7. Laser session delete button (smaller version - line 3346)
old7 = '<Button size="sm" variant="outline" className="h-6 px-1.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px]" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={9} className="ml-0.5" /> حذف</Button>'
new7 = '{canDelete && <Button size="sm" variant="outline" className="h-6 px-1.5 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[9px]" onClick={() => setDeleteLaserSessionConfirmId(ls.id)}><Trash2 size={9} className="ml-0.5" /> حذف</Button>}'
if old7 in content:
    content = content.replace(old7, new7)
    changes_made += 1
    print("7. Wrapped laser session delete (small) with canDelete")

# 8. Laser record delete button (line 3444)
old8 = '<Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[10px] font-bold" onClick={e => { e.stopPropagation(); setDeleteLaserRecordConfirmId(r.id) }}><Trash2 size={12} className="ml-1" /> حذف</Button>'
new8 = '{canDelete && <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-red-500 border-red-200 dark:border-red-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-[10px] font-bold" onClick={e => { e.stopPropagation(); setDeleteLaserRecordConfirmId(r.id) }}><Trash2 size={12} className="ml-1" /> حذف</Button>}'
if old8 in content:
    content = content.replace(old8, new8)
    changes_made += 1
    print("8. Wrapped laser record delete with canDelete")

# 9. Laser package delete button (line 3502)
old9 = '<Button variant="outline" size="sm" className="rounded-lg flex-1" onClick={() => deleteItem(\'/laser/packages\', pkg.id, setLaserPackages)}><Trash2 size={12} className="ml-1" /> حذف</Button>'
new9 = '{canDelete && <Button variant="outline" size="sm" className="rounded-lg flex-1" onClick={() => deleteItem(\'/laser/packages\', pkg.id, setLaserPackages)}><Trash2 size={12} className="ml-1" /> حذف</Button>}'
if old9 in content:
    content = content.replace(old9, new9)
    changes_made += 1
    print("9. Wrapped laser package delete with canDelete")

# 10. Follow-up delete button (line 3929)
old10 = '<Button size="sm" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => setDeleteFollowUpConfirmId(fu.id)}><Trash2 size={14} /></Button>'
new10 = '{canDelete && <Button size="sm" variant="ghost" className="h-8 w-8 text-white/70 hover:text-white" onClick={() => setDeleteFollowUpConfirmId(fu.id)}><Trash2 size={14} /></Button>}'
if old10 in content:
    content = content.replace(old10, new10)
    changes_made += 1
    print("10. Wrapped follow-up delete with canDelete")

# 11. Follow-up visit delete (line 3986) 
old11 = '<Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { await apiFetch(`/follow-up/visits/${v.id}`, { method: \'DELETE\' }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, followUpVisits: (f.followUpVisits || []).filter(fv => fv.id !== v.id), sessionsUsed: Math.max(0, f.sessionsUsed - 1) } : f)); toast.success(\'تم حذف الزيارة\') } catch { toast.error(\'خطأ\') } }}><Trash2 size={10} className="text-red-500" /></Button>'
new11 = '{canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { await apiFetch(`/follow-up/visits/${v.id}`, { method: \'DELETE\' }); setFollowUpRecords(prev => prev.map(f => f.id === fu.id ? { ...f, followUpVisits: (f.followUpVisits || []).filter(fv => fv.id !== v.id), sessionsUsed: Math.max(0, f.sessionsUsed - 1) } : f)); toast.success(\'تم حذف الزيارة\') } catch { toast.error(\'خطأ\') } }}><Trash2 size={10} className="text-red-500" /></Button>}'
if old11 in content:
    content = content.replace(old11, new11)
    changes_made += 1
    print("11. Wrapped follow-up visit delete with canDelete")

# 12. Visit edit and delete buttons in patient profile (line 2716)
# The visit buttons are: edit (Edit3) and delete (Trash2) in a flex div
# We need to wrap the entire flex div buttons with canEditPatientFull/canDelete
# Pattern: <div className="flex gap-0.5"><Button...Edit3...><Button...Trash2...></div>

# Find the visit section pattern - edit + delete buttons for visits
old_visit_edit = '<Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || \'\', price: String(transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === getVisitCategory(v.type))?.amount || \'\') }) }}><Edit3 size={10} className="text-violet-500" /></Button>'
new_visit_edit = '{canEditPatientFull && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setEditingVisitId(v.id); setEditVisitForm({ type: v.type, notes: v.notes || \'\', price: String(transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === getVisitCategory(v.type))?.amount || \'\') }) }}><Edit3 size={10} className="text-violet-500" /></Button>}'
if old_visit_edit in content:
    content = content.replace(old_visit_edit, new_visit_edit)
    changes_made += 1
    print("12. Wrapped visit edit button with canEditPatientFull")

old_visit_delete = '<Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { const cat = getVisitCategory(v.type); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === cat); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/visits/${v.id}`, { method: \'DELETE\' }); setVisits(prev => prev.filter(vv => vv.id !== v.id)); toast.success(\'تم الحذف\') } catch { toast.error(\'خطأ\') } }}><Trash2 size={10} className="text-red-500" /></Button>'
new_visit_delete = '{canDelete && <Button variant="ghost" size="icon" className="h-6 w-6" onClick={async () => { try { const cat = getVisitCategory(v.type); const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && t.category === cat); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/visits/${v.id}`, { method: \'DELETE\' }); setVisits(prev => prev.filter(vv => vv.id !== v.id)); toast.success(\'تم الحذف\') } catch { toast.error(\'خطأ\') } }}><Trash2 size={10} className="text-red-500" /></Button>}'
if old_visit_delete in content:
    content = content.replace(old_visit_delete, new_visit_delete)
    changes_made += 1
    print("13. Wrapped visit delete button with canDelete")

# 13. Session edit and delete buttons in patient profile (line 2731)
old_session_edit = '<Button variant="ghost" size="icon" className="h-5 w-5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { setEditingSessionId(s.id); setEditSessionForm({ price: String(s.price), notes: s.notes || \'\', status: s.status, paid: s.paid }) }}><Edit3 size={9} className="text-orange-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></Button>'
new_session_edit = '{canEditPatientFull && <Button variant="ghost" size="icon" className="h-5 w-5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={() => { setEditingSessionId(s.id); setEditSessionForm({ price: String(s.price), notes: s.notes || \'\', status: s.status, paid: s.paid }) }}><Edit3 size={9} className="text-orange-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></Button>}'
if old_session_edit in content:
    content = content.replace(old_session_edit, new_session_edit)
    changes_made += 1
    print("14. Wrapped session edit button with canEditPatientFull")

# Session delete - this is inline and very long. Let me find it by the beginning pattern
old_session_del_start = '<Button variant="ghost" size="icon" className="h-5 w-5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={async () => { try { const sDateStr = s.date ? new Date(s.date).toLocaleDateString(\'en-CA\', { timeZone: \'Africa/Cairo\' }) : \'\'; const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && (t.category === \'جلسات\' || t.category === \'ليزر\') && t.amount === s.price && (sDateStr ? new Date(t.date).toLocaleDateString(\'en-CA\', { timeZone: \'Africa/Cairo\' }) === sDateStr : true)); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/sessions/${s.id}`, { method: \'DELETE\' }); setSessions(prev => prev.filter(ss => ss.id !== s.id)); toast.success(\'تم الحذف\') } catch { toast.error(\'خطأ\') } }}><Trash2 size={9} className="text-red-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></Button>'
new_session_del_start = '{canDelete && <Button variant="ghost" size="icon" className="h-5 w-5 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" onClick={async () => { try { const sDateStr = s.date ? new Date(s.date).toLocaleDateString(\'en-CA\', { timeZone: \'Africa/Cairo\' }) : \'\'; const relatedTx = transactions.find(t => t.description?.includes(selectedPatient!.name) && (t.category === \'جلسات\' || t.category === \'ليزر\') && t.amount === s.price && (sDateStr ? new Date(t.date).toLocaleDateString(\'en-CA\', { timeZone: \'Africa/Cairo\' }) === sDateStr : true)); if (relatedTx) { await apiFetch(`/finance/transactions/${relatedTx.id}`, { method: \'DELETE\' }); setTransactions(prev => prev.filter(t => t.id !== relatedTx.id)); } await apiFetch(`/sessions/${s.id}`, { method: \'DELETE\' }); setSessions(prev => prev.filter(ss => ss.id !== s.id)); toast.success(\'تم الحذف\') } catch { toast.error(\'خطأ\') } }}><Trash2 size={9} className="text-red-500 active:scale-[0.9] hover:scale-[1.05] transition-transform duration-150" /></Button>}'
if old_session_del_start in content:
    content = content.replace(old_session_del_start, new_session_del_start)
    changes_made += 1
    print("15. Wrapped session delete button with canDelete")

# 14. More section notes delete (line 5793)
old_more_note_del = '<button className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" onClick={() => deleteItem(\'/notes\', n.id, setNotes)}><Trash2 size={14} className="text-red-500 active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" /></button>'
new_more_note_del = '{canDelete && <button className="h-8 w-8 rounded-lg flex items-center justify-center bg-muted/50 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" onClick={() => deleteItem(\'/notes\', n.id, setNotes)}><Trash2 size={14} className="text-red-500 active:scale-[0.85] hover:scale-[1.15] transition-transform duration-150" /></button>}'
if old_more_note_del in content:
    content = content.replace(old_more_note_del, new_more_note_del)
    changes_made += 1
    print("16. Wrapped more-tab note delete with canDelete")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nTotal changes made: {changes_made}")
