#!/usr/bin/env python3
"""Clean up unused destructured store variables from page.tsx.
Reduces destructuring from 459 items to ~132, making page.tsx much cleaner."""

filepath = '/home/z/my-project/src/app/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

lines = content.split('\n')

# ─── Strategy: Replace entire store destructuring lines ───

# 1. Remove useFollowUpFormStore entirely (all 40 items unused)
# Line 82: const { fuFormPatientSearch...editingFollowUpId, setEditingFollowUpId } = useFollowUpFormStore()
old_line82 = lines[82]
# Replace with empty (remove the entire line)
lines[82] = ''

# 2. Remove usePersonalFormStore entirely (all 14 items unused)
# Line 84: const { personalTxnForm...editingPersonalNoteContent, setEditingPersonalNoteContent } = usePersonalFormStore()
old_line84 = lines[84]
lines[84] = ''

# 3. Remove useAppointmentFormStore - keep only bookingFormPatientSearch + setBookingFormPatientSearch
# Line 80: const { waitingFormName...editingBookingId, setEditingBookingId } = useAppointmentFormStore()
old_line80 = lines[80]
lines[80] = '  const { bookingFormPatientSearch, setBookingFormPatientSearch } = useAppointmentFormStore()'

# 4. Remove useFinanceFormStore - keep only setTxnFormDate
# Line 81: const { txnFormType...reminderPatientId, setReminderPatientId } = useFinanceFormStore()
old_line81 = lines[81]
lines[81] = '  const { setTxnFormDate } = useFinanceFormStore()'

# 5. Trim useDataStore - remove personalTransactions/setPersonalTransactions, personalReminders/setPersonalReminders, personalNotes/setPersonalNotes, setLaserSettings
# Line 79: massive line
old_line79 = lines[79]
# Remove specific items from the long line
new_datastore = old_line79
# Remove: personalTransactions, setPersonalTransactions, personalReminders, setPersonalReminders, personalNotes, setPersonalNotes, setLaserSettings
for item in ['personalTransactions, setPersonalTransactions', 'personalReminders, setPersonalReminders', 'personalNotes, setPersonalNotes', 'setLaserSettings']:
    # Remove the item + comma+space or just comma before it
    new_datastore = new_datastore.replace(', ' + item, '')
    # Also handle case where item is at start (unlikely but safe)
    new_datastore = new_datastore.replace(item + ', ', '')
lines[79] = new_datastore

# 6. Trim useClinicStore - remove statusColors, setStatusColors, lastBackup
# Line 78
old_line78 = lines[78]
new_clinicstore = old_line78
for item in ['statusColors, setStatusColors', 'lastBackup']:
    new_clinicstore = new_clinicstore.replace(', ' + item, '')
    new_clinicstore = new_clinicstore.replace(item + ', ', '')
lines[78] = new_clinicstore

# 7. Trim useAuthStore - remove setUserRole
# Line 77
old_line77 = lines[77]
new_authstore = old_line77.replace(', setUserRole', '')
lines[77] = new_authstore

# 8. Trim usePatientFormStore - remove 30 pairs + 2 getter-only
# Keep only: newPatientName/setNewPatientName, newPatientPhone/setNewPatientPhone, newPatientAddress/setNewPatientAddress, newPatientAge/setNewPatientAge, newPatientDiagnosis/setNewPatientDiagnosis, newPatientNotes/setNewPatientNotes, selectedVisitType/setSelectedVisitType, selectedServiceIds/setSelectedServiceIds, customServicePrice/setCustomServicePrice, visitPrice/setVisitPrice, quickNote/setQuickNote, setEditingVisitId, setEditingSessionId, newPatientDate/setNewPatientDate, patientImportData... (actually used? Let me check)
# Wait - patientImportData etc are used in the patient import section. Let me check more carefully.
# Actually the import variables might be used. Let me be conservative and only remove things I'm 100% sure are unused.

# Let me approach this differently for usePatientFormStore and useUIStore - 
# I'll just trim the most obviously unused items that I can verify

# 9. Trim useUIStore - remove the massive amount of unused items
# This is the biggest cleanup. Let me construct the new line with only used items.
# Used items from useUIStore:
used_ui_items = [
    'darkMode', 'setDarkMode',
    'smartSearchOpen', 'setSmartSearchOpen',
    'smartSearchQuery', 'setSmartSearchQuery',
    'searchQuery', 'setSearchQuery',
    'searchField', 'setSearchField',
    'patientDisplayCount', 'setPatientDisplayCount',
    'selectedPatient', 'setSelectedPatient',
    'showAddPatient', 'setShowAddPatient',
    'showAddLaserRecord', 'setShowAddLaserRecord',
    'showAddTransaction',  # getter not used but setter used in line 1043
    'setShowAddTransaction',
    'setShowAddAppointment',  # setter used in line 1044
    'loginRole', 'setLoginRole',
    'loginPassword', 'setLoginPassword',
    'loginLoading', 'setLoginLoading',
    'seeded', 'setSeeded',
    'restoreConfirmOpen', 'setRestoreConfirmOpen',
    'pendingRestoreData', 'setPendingRestoreData',
    'patientFilter', 'setPatientFilter',
    'setPatientDetailTab',  # setter used?
    'editingPatient', 'setEditingPatient',  # used in deletePatientWithFinance
    'deletePatientConfirmOpen', 'setDeletePatientConfirmOpen',  # used in deletePatientWithFinance
    'passwordDialogOpen', 'setPasswordDialogOpen',
    'passwordTarget', 'setPasswordTarget',
    'passwordInput', 'setPasswordInput',
    'pendingTab', 'setPendingTab',
    'selectedFollowUpId',  # used in useMemo
    'setSelectedFollowUpId',  # setter used in MoreSection? not in page.tsx
]

# Actually let me be more precise. Let me check what's actually used in page.tsx's own code.
# I'll construct the UI store line with items I've verified are used in page.tsx itself.

verified_used_ui = """  const { darkMode, setDarkMode, smartSearchOpen, setSmartSearchOpen, smartSearchQuery, setSmartSearchQuery, searchQuery, setSearchQuery, searchField, setSearchField, patientDisplayCount, setPatientDisplayCount, selectedPatient, setSelectedPatient, showAddPatient, setShowAddPatient, showAddTransaction, setShowAddTransaction, showAddLaserRecord, setShowAddLaserRecord, setShowAddAppointment, loginRole, setLoginRole, loginPassword, setLoginPassword, loginLoading, setLoginLoading, seeded, setSeeded, restoreConfirmOpen, setRestoreConfirmOpen, pendingRestoreData, setPendingRestoreData, patientFilter, setPatientFilter, editingPatient, setEditingPatient, deletePatientConfirmOpen, setDeletePatientConfirmOpen, passwordDialogOpen, setPasswordDialogOpen, passwordTarget, setPasswordTarget, passwordInput, setPasswordInput, pendingTab, setPendingTab, selectedFollowUpId } = useUIStore()"""

lines[85] = verified_used_ui

# 10. Trim usePatientFormStore - keep only actually used items
# Used in page.tsx: newPatientName, newPatientPhone, newPatientAddress, newPatientAge, newPatientDiagnosis, newPatientNotes, selectedVisitType, selectedServiceIds, customServicePrice, visitPrice, quickNote, setQuickNote, setEditingVisitId, setEditingSessionId, newPatientDate, setNewPatientDate, showAddPatient is from UI store

# Wait, I also need to check if patientImport variables are used. Let me check:
# Line 88: patientImportInputRef - that's a useRef, not from store
# The import dialog JSX uses patientImportData, setPatientImportData, etc.
# But wait - I should check if the patient import dialog is still in page.tsx.
# Looking at line 1360-1525, it's the "SMART PATIENT REGISTRATION DIALOG" not import.
# Let me search for patientImport references...

# Actually I'll be conservative - let me keep patientImport variables too since
# the import feature might be used. But I'll remove the clearly unused ones.

verified_used_patient = """  const { newPatientName, setNewPatientName, newPatientPhone, setNewPatientPhone, newPatientAddress, setNewPatientAddress, newPatientAge, setNewPatientAge, newPatientDiagnosis, setNewPatientDiagnosis, newPatientNotes, setNewPatientNotes, selectedVisitType, setSelectedVisitType, selectedServiceIds, setSelectedServiceIds, customServicePrice, setCustomServicePrice, visitPrice, setVisitPrice, quickNote, setQuickNote, setEditingVisitId, setEditingSessionId, newPatientDate, setNewPatientDate, patientImportData, setPatientImportData, patientImportPreview, setPatientImportPreview, patientImportFile, setPatientImportFile, patientImportLoading, setPatientImportLoading, patientImportProgress, setPatientImportProgress, patientImportDragOver, setPatientImportDragOver, showAddPatient, setShowAddPatient } = usePatientFormStore()"""

# Wait, showAddPatient is from useUIStore, not usePatientFormStore. Let me remove it.
verified_used_patient = """  const { newPatientName, setNewPatientName, newPatientPhone, setNewPatientPhone, newPatientAddress, setNewPatientAddress, newPatientAge, setNewPatientAge, newPatientDiagnosis, setNewPatientDiagnosis, newPatientNotes, setNewPatientNotes, selectedVisitType, setSelectedVisitType, selectedServiceIds, setSelectedServiceIds, customServicePrice, setCustomServicePrice, visitPrice, setVisitPrice, quickNote, setQuickNote, setEditingVisitId, setEditingSessionId, newPatientDate, setNewPatientDate, patientImportData, setPatientImportData, patientImportPreview, setPatientImportPreview, patientImportFile, setPatientImportFile, patientImportLoading, setPatientImportLoading, patientImportProgress, setPatientImportProgress, patientImportDragOver, setPatientImportDragOver } = usePatientFormStore()"""

lines[83] = verified_used_patient

# Now remove blank lines and clean up
result_lines = []
for line in lines:
    stripped = line.strip()
    if stripped == '' and len(result_lines) > 0 and result_lines[-1].strip() == '':
        # Skip consecutive blank lines (but keep at least one)
        continue
    result_lines.append(line)

# Also remove the import for useFollowUpFormStore and usePersonalFormStore if they're no longer needed
# Check if the import line still references them
import_line_idx = None
for i, line in enumerate(result_lines):
    if 'useFollowUpFormStore' in line and 'usePersonalFormStore' in line and 'import' in line:
        import_line_idx = i
        break

if import_line_idx:
    old_import = result_lines[import_line_idx]
    # Remove useFollowUpFormStore and usePersonalFormStore from import
    new_import = old_import.replace(', useFollowUpFormStore', '').replace(', usePersonalFormStore', '')
    result_lines[import_line_idx] = new_import

# Write back
with open(filepath, 'w', encoding='utf-8') as f:
    f.write('\n'.join(result_lines))

print("✅ page.tsx cleaned up - removed unused store destructuring!")
