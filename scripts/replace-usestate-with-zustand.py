#!/usr/bin/env python3
"""
Precision script to replace useState declarations in page.tsx with Zustand store destructuring.
This script works on the Home() function ONLY (not other components like Clock or DebouncedInput).

Strategy:
1. Find the Home() function boundaries
2. Find all useState declarations within Home()  
3. Map each to the appropriate store
4. Remove useState lines and add store destructuring lines
5. Keep non-useState code intact (refs, functions, comments)
"""

import re

filepath = '/home/z/my-project/src/app/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    lines = f.readlines()

# ─── Define store mappings ──────────────────────────────────────────────────
# Maps: variable_name -> (store_name, setter_name_in_store)
# Setter names should match exactly what's in the store

ui_store_vars = {
    'darkMode': ('useUIStore', 'setDarkMode'),
    'smartSearchOpen': ('useUIStore', 'setSmartSearchOpen'),
    'smartSearchQuery': ('useUIStore', 'setSmartSearchQuery'),
    'searchQuery': ('useUIStore', 'setSearchQuery'),
    'searchField': ('useUIStore', 'setSearchField'),
    'patientDisplayCount': ('useUIStore', 'setPatientDisplayCount'),
    'selectedPatient': ('useUIStore', 'setSelectedPatient'),
    'moreSubTab': ('useUIStore', 'setMoreSubTab'),
    'laserSubTab': ('useUIStore', 'setLaserSubTab'),
    'personalSubTab': ('useUIStore', 'setPersonalSubTab'),
    'patientDetailTab': ('useUIStore', 'setPatientDetailTab'),
    'laserDetailTab': ('useUIStore', 'setLaserDetailTab'),
    'followUpDetailTab': ('useUIStore', 'setFollowUpDetailTab'),
    'showAddPatient': ('useUIStore', 'setShowAddPatient'),
    'editingPatient': ('useUIStore', 'setEditingPatient'),
    'deletePatientConfirmOpen': ('useUIStore', 'setDeletePatientConfirmOpen'),
    'showImprovementSlider': ('useUIStore', 'setShowImprovementSlider'),
    'showPatientImport': ('useUIStore', 'setShowPatientImport'),
    'showAddSessionProfile': ('useUIStore', 'setShowAddSessionProfile'),
    'showAddVisitProfile': ('useUIStore', 'setShowAddVisitProfile'),
    'showAddService': ('useUIStore', 'setShowAddService'),
    'showAddTransaction': ('useUIStore', 'setShowAddTransaction'),
    'expandedFinanceDay': ('useUIStore', 'setExpandedFinanceDay'),
    'showAddAppointment': ('useUIStore', 'setShowAddAppointment'),
    'showAddLaserRecord': ('useUIStore', 'setShowAddLaserRecord'),
    'showAddLaserPackage': ('useUIStore', 'setShowAddLaserPackage'),
    'showAddLaserSessionForm': ('useUIStore', 'setShowAddLaserSessionForm'),
    'selectedLaserRecordId': ('useUIStore', 'setSelectedLaserRecordId'),
    'showAddMedication': ('useUIStore', 'setShowAddMedication'),
    'showAddReminder': ('useUIStore', 'setShowAddReminder'),
    'showAddDoctor': ('useUIStore', 'setShowAddDoctor'),
    'showAddInventory': ('useUIStore', 'setShowAddInventory'),
    'showStockTransaction': ('useUIStore', 'setShowStockTransaction'),
    'showAddWaiting': ('useUIStore', 'setShowAddWaiting'),
    'showAddBooking': ('useUIStore', 'setShowAddBooking'),
    'showAddFollowUp': ('useUIStore', 'setShowAddFollowUp'),
    'showAddFollowUpVisit': ('useUIStore', 'setShowAddFollowUpVisit'),
    'showAddNote': ('useUIStore', 'setShowAddNote'),
    'showAddPersonalTxn': ('useUIStore', 'setShowAddPersonalTxn'),
    'showAddPersonalReminder': ('useUIStore', 'setShowAddPersonalReminder'),
    'showAddPersonalNote': ('useUIStore', 'setShowAddPersonalNote'),
    'showBroadcast': ('useUIStore', 'setShowBroadcast'),
    'showApplyTemplate': ('useUIStore', 'setShowApplyTemplate'),
    'deleteVisitConfirmId': ('useUIStore', 'setDeleteVisitConfirmId'),
    'deleteLaserRecordConfirmId': ('useUIStore', 'setDeleteLaserRecordConfirmId'),
    'deleteLaserSessionConfirmId': ('useUIStore', 'setDeleteLaserSessionConfirmId'),
    'deleteInventoryConfirmId': ('useUIStore', 'setDeleteInventoryConfirmId'),
    'deleteFollowUpConfirmId': ('useUIStore', 'setDeleteFollowUpConfirmId'),
    'restoreConfirmOpen': ('useUIStore', 'setRestoreConfirmOpen'),
    'pendingRestoreData': ('useUIStore', 'setPendingRestoreData'),
    'celebratingId': ('useUIStore', 'setCelebratingId'),
    'celebratingImprovement': ('useUIStore', 'setCelebratingImprovement'),
    'celebratingPersonalId': ('useUIStore', 'setCelebratingPersonalId'),
    'passwordDialogOpen': ('useUIStore', 'setPasswordDialogOpen'),
    'passwordTarget': ('useUIStore', 'setPasswordTarget'),
    'passwordInput': ('useUIStore', 'setPasswordInput'),
    'pendingTab': ('useUIStore', 'setPendingTab'),
    'sliderPos': ('useUIStore', 'setSliderPos'),
    'isDragging': ('useUIStore', 'setIsDragging'),
    'loginRole': ('useUIStore', 'setLoginRole'),
    'loginPassword': ('useUIStore', 'setLoginPassword'),
    'loginLoading': ('useUIStore', 'setLoginLoading'),
    'seeded': ('useUIStore', 'setSeeded'),
    'patientFilter': ('useUIStore', 'setPatientFilter'),
    'patientCopySearch': ('useUIStore', 'setPatientCopySearch'),
    'noteSearch': ('useUIStore', 'setNoteSearch'),
    'noteFilter': ('useUIStore', 'setNoteFilter'),
    'notesSearch': ('useUIStore', 'setNotesSearch'),
    'notesFilterSection': ('useUIStore', 'setNotesFilterSection'),
    'notesFilterImportant': ('useUIStore', 'setNotesFilterImportant'),
    'visitFilterType': ('useUIStore', 'setVisitFilterType'),
    'inventorySearch': ('useUIStore', 'setInventorySearch'),
    'inventoryFilter': ('useUIStore', 'setInventoryFilter'),
    'inventoryCategoryFilter': ('useUIStore', 'setInventoryCategoryFilter'),
    'bookingFilterStatus': ('useUIStore', 'setBookingFilterStatus'),
    'bookingFilterDate': ('useUIStore', 'setBookingFilterDate'),
    'followUpSearch': ('useUIStore', 'setFollowUpSearch'),
    'followUpFilter': ('useUIStore', 'setFollowUpFilter'),
    'selectedFollowUpId': ('useUIStore', 'setSelectedFollowUpId'),
    'personalSearchQuery': ('useUIStore', 'setPersonalSearchQuery'),
    'personalReportPeriod': ('useUIStore', 'setPersonalReportPeriod'),
    'personalTxnFilter': ('useUIStore', 'setPersonalTxnFilter'),
    'personalTxnCategoryFilter': ('useUIStore', 'setPersonalTxnCategoryFilter'),
    'personalDateFrom': ('useUIStore', 'setPersonalDateFrom'),
    'personalDateTo': ('useUIStore', 'setPersonalDateTo'),
    'reportPeriod': ('useUIStore', 'setReportPeriod'),
    'selectedTemplate': ('useUIStore', 'setSelectedTemplate'),
    'templatePatientId': ('useUIStore', 'setTemplatePatientId'),
    'broadcastMessage': ('useUIStore', 'setBroadcastMessage'),
    'broadcastFilter': ('useUIStore', 'setBroadcastFilter'),
    'broadcastSending': ('useUIStore', 'setBroadcastSending'),
    'broadcastProgress': ('useUIStore', 'setBroadcastProgress'),
    'broadcastSelectedIds': ('useUIStore', 'setBroadcastSelectedIds'),
}

patient_form_vars = {
    'newPatientName': ('usePatientFormStore', 'setNewPatientName'),
    'newPatientPhone': ('usePatientFormStore', 'setNewPatientPhone'),
    'newPatientPhone2': ('usePatientFormStore', 'setNewPatientPhone2'),
    'newPatientAddress': ('usePatientFormStore', 'setNewPatientAddress'),
    'newPatientAge': ('usePatientFormStore', 'setNewPatientAge'),
    'newPatientDiagnosis': ('usePatientFormStore', 'setNewPatientDiagnosis'),
    'newPatientNotes': ('usePatientFormStore', 'setNewPatientNotes'),
    'newPatientDate': ('usePatientFormStore', 'setNewPatientDate'),
    'selectedVisitType': ('usePatientFormStore', 'setSelectedVisitType'),
    'selectedServiceIds': ('usePatientFormStore', 'setSelectedServiceIds'),
    'customServicePrice': ('usePatientFormStore', 'setCustomServicePrice'),
    'visitPrice': ('usePatientFormStore', 'setVisitPrice'),
    'quickNote': ('usePatientFormStore', 'setQuickNote'),
    'editPatientForm': ('usePatientFormStore', 'setEditPatientForm'),
    'editingNoteId': ('usePatientFormStore', 'setEditingNoteId'),
    'editingNoteContent': ('usePatientFormStore', 'setEditingNoteContent'),
    'photoType': ('usePatientFormStore', 'setPhotoType'),
    'photoDescription': ('usePatientFormStore', 'setPhotoDescription'),
    'profileSessionServiceId': ('usePatientFormStore', 'setProfileSessionServiceId'),
    'profileSessionPrice': ('usePatientFormStore', 'setProfileSessionPrice'),
    'profileSessionNotes': ('usePatientFormStore', 'setProfileSessionNotes'),
    'profileSessionDate': ('usePatientFormStore', 'setProfileSessionDate'),
    'profileVisitType': ('usePatientFormStore', 'setProfileVisitType'),
    'profileVisitPrice': ('usePatientFormStore', 'setProfileVisitPrice'),
    'profileVisitNotes': ('usePatientFormStore', 'setProfileVisitNotes'),
    'profileVisitDate': ('usePatientFormStore', 'setProfileVisitDate'),
    'editingVisitId': ('usePatientFormStore', 'setEditingVisitId'),
    'editVisitForm': ('usePatientFormStore', 'setEditVisitForm'),
    'editingSessionId': ('usePatientFormStore', 'setEditingSessionId'),
    'editSessionForm': ('usePatientFormStore', 'setEditSessionForm'),
    'editingNoteIdMore': ('usePatientFormStore', 'setEditingNoteIdMore'),
    'editingNoteContentMore': ('usePatientFormStore', 'setEditingNoteContentMore'),
    'editingNoteSectionMore': ('usePatientFormStore', 'setEditingNoteSectionMore'),
    'newNoteContent': ('usePatientFormStore', 'setNewNoteContent'),
    'newNoteSection': ('usePatientFormStore', 'setNewNoteSection'),
    'newNoteImportant': ('usePatientFormStore', 'setNewNoteImportant'),
    'improvementSliderValue': ('usePatientFormStore', 'setImprovementSliderValue'),
    'improvementNote': ('usePatientFormStore', 'setImprovementNote'),
    'patientImportData': ('usePatientFormStore', 'setPatientImportData'),
    'patientImportPreview': ('usePatientFormStore', 'setPatientImportPreview'),
    'patientImportFile': ('usePatientFormStore', 'setPatientImportFile'),
    'patientImportLoading': ('usePatientFormStore', 'setPatientImportLoading'),
    'patientImportProgress': ('usePatientFormStore', 'setPatientImportProgress'),
    'patientImportDragOver': ('usePatientFormStore', 'setPatientImportDragOver'),
}

laser_form_vars = {
    'laserFormArea': ('useLaserFormStore', 'setLaserFormArea'),
    'laserFormSkinType': ('useLaserFormStore', 'setLaserFormSkinType'),
    'laserFormHairColor': ('useLaserFormStore', 'setLaserFormHairColor'),
    'laserFormHairDensity': ('useLaserFormStore', 'setLaserFormHairDensity'),
    'laserFormSessions': ('useLaserFormStore', 'setLaserFormSessions'),
    'laserFormNotes': ('useLaserFormStore', 'setLaserFormNotes'),
    'laserFormPatientId': ('useLaserFormStore', 'setLaserFormPatientId'),
    'laserFormPatientSearch': ('useLaserFormStore', 'setLaserFormPatientSearch'),
    'laserFormPrice': ('useLaserFormStore', 'setLaserFormPrice'),
    'laserFormPaid': ('useLaserFormStore', 'setLaserFormPaid'),
    'laserFormMachine': ('useLaserFormStore', 'setLaserFormMachine'),
    'laserFormEnergy': ('useLaserFormStore', 'setLaserFormEnergy'),
    'laserFormPulse': ('useLaserFormStore', 'setLaserFormPulse'),
    'laserFormDoctorId': ('useLaserFormStore', 'setLaserFormDoctorId'),
    'editingLaserSessionId': ('useLaserFormStore', 'setEditingLaserSessionId'),
    'editLaserSessionForm': ('useLaserFormStore', 'setEditLaserSessionForm'),
    'newLaserSessionForm': ('useLaserFormStore', 'setNewLaserSessionForm'),
    'editingLaserRecordId': ('useLaserFormStore', 'setEditingLaserRecordId'),
    'editLaserRecordForm': ('useLaserFormStore', 'setEditLaserRecordForm'),
    'laserFinancePatientId': ('useLaserFormStore', 'setLaserFinancePatientId'),
    'laserFinancePrice': ('useLaserFormStore', 'setLaserFinancePrice'),
    'laserFinanceNotes': ('useLaserFormStore', 'setLaserFinanceNotes'),
    'treatmentTemplates': ('useLaserFormStore', 'setTreatmentTemplates'),
}

finance_form_vars = {
    'txnFormType': ('useFinanceFormStore', 'setTxnFormType'),
    'txnFormCategory': ('useFinanceFormStore', 'setTxnFormCategory'),
    'txnFormAmount': ('useFinanceFormStore', 'setTxnFormAmount'),
    'txnFormDescription': ('useFinanceFormStore', 'setTxnFormDescription'),
    'txnFormDate': ('useFinanceFormStore', 'setTxnFormDate'),
    'serviceFormName': ('useFinanceFormStore', 'setServiceFormName'),
    'serviceFormCategory': ('useFinanceFormStore', 'setServiceFormCategory'),
    'serviceFormPrice': ('useFinanceFormStore', 'setServiceFormPrice'),
    'serviceFormDuration': ('useFinanceFormStore', 'setServiceFormDuration'),
    'editingServiceId': ('useFinanceFormStore', 'setEditingServiceId'),
    'editingServicePrice': ('useFinanceFormStore', 'setEditingServicePrice'),
    'editingServiceName': ('useFinanceFormStore', 'setEditingServiceName'),
    'editingDoctorId': ('useFinanceFormStore', 'setEditingDoctorId'),
    'doctorForm': ('useFinanceFormStore', 'setDoctorForm'),
    'reminderType': ('useFinanceFormStore', 'setReminderType'),
    'reminderDate': ('useFinanceFormStore', 'setReminderDate'),
    'reminderTime': ('useFinanceFormStore', 'setReminderTime'),
    'reminderPatientId': ('useFinanceFormStore', 'setReminderPatientId'),
}

appointment_form_vars = {
    'waitingFormName': ('useAppointmentFormStore', 'setWaitingFormName'),
    'waitingFormPriority': ('useAppointmentFormStore', 'setWaitingFormPriority'),
    'waitingFormPatientId': ('useAppointmentFormStore', 'setWaitingFormPatientId'),
    'waitingFormNotes': ('useAppointmentFormStore', 'setWaitingFormNotes'),
    'bookingFormPatientSearch': ('useAppointmentFormStore', 'setBookingFormPatientSearch'),
    'bookingFormPatientId': ('useAppointmentFormStore', 'setBookingFormPatientId'),
    'bookingFormDate': ('useAppointmentFormStore', 'setBookingFormDate'),
    'bookingFormTime': ('useAppointmentFormStore', 'setBookingFormTime'),
    'bookingFormType': ('useAppointmentFormStore', 'setBookingFormType'),
    'bookingFormStatus': ('useAppointmentFormStore', 'setBookingFormStatus'),
    'bookingFormNotes': ('useAppointmentFormStore', 'setBookingFormNotes'),
    'editingBookingId': ('useAppointmentFormStore', 'setEditingBookingId'),
    'stockTransactionItemId': ('useAppointmentFormStore', 'setStockTransactionItemId'),
    'stockTransactionType': ('useAppointmentFormStore', 'setStockTransactionType'),
    'stockTransactionQty': ('useAppointmentFormStore', 'setStockTransactionQty'),
    'stockTransactionNotes': ('useAppointmentFormStore', 'setStockTransactionNotes'),
    'editingInventoryId': ('useAppointmentFormStore', 'setEditingInventoryId'),
    'editInventoryForm': ('useAppointmentFormStore', 'setEditInventoryForm'),
}

personal_form_vars = {
    'personalTxnForm': ('usePersonalFormStore', 'setPersonalTxnForm'),
    'editingPersonalTxnId': ('usePersonalFormStore', 'setEditingPersonalTxnId'),
    'personalReminderForm': ('usePersonalFormStore', 'setPersonalReminderForm'),
    'editingPersonalReminderId': ('usePersonalFormStore', 'setEditingPersonalReminderId'),
    'personalNoteForm': ('usePersonalFormStore', 'setPersonalNoteForm'),
    'editingPersonalNoteId': ('usePersonalFormStore', 'setEditingPersonalNoteId'),
    'editingPersonalNoteContent': ('usePersonalFormStore', 'setEditingPersonalNoteContent'),
}

followup_form_vars = {
    'fuFormPatientSearch': ('useFollowUpFormStore', 'setFuFormPatientSearch'),
    'fuFormPatientId': ('useFollowUpFormStore', 'setFuFormPatientId'),
    'fuFormCondition': ('useFollowUpFormStore', 'setFuFormCondition'),
    'fuFormCategory': ('useFollowUpFormStore', 'setFuFormCategory'),
    'fuFormSeverity': ('useFollowUpFormStore', 'setFuFormSeverity'),
    'fuFormFrequency': ('useFollowUpFormStore', 'setFuFormFrequency'),
    'fuFormCustomDays': ('useFollowUpFormStore', 'setFuFormCustomDays'),
    'fuFormNextVisit': ('useFollowUpFormStore', 'setFuFormNextVisit'),
    'fuFormDiagnosis': ('useFollowUpFormStore', 'setFuFormDiagnosis'),
    'fuFormTreatmentPlan': ('useFollowUpFormStore', 'setFuFormTreatmentPlan'),
    'fuFormMedications': ('useFollowUpFormStore', 'setFuFormMedications'),
    'fuFormNotes': ('useFollowUpFormStore', 'setFuFormNotes'),
    'fuFormHasSubscription': ('useFollowUpFormStore', 'setFuFormHasSubscription'),
    'fuFormSubType': ('useFollowUpFormStore', 'setFuFormSubType'),
    'fuFormSubPrice': ('useFollowUpFormStore', 'setFuFormSubPrice'),
    'fuFormSubStart': ('useFollowUpFormStore', 'setFuFormSubStart'),
    'fuFormSubEnd': ('useFollowUpFormStore', 'setFuFormSubEnd'),
    'fuFormSubSessions': ('useFollowUpFormStore', 'setFuFormSubSessions'),
    'fuVisitForm': ('useFollowUpFormStore', 'setFuVisitForm'),
    'editingFollowUpId': ('useFollowUpFormStore', 'setEditingFollowUpId'),
}

# Merge all mappings
all_mappings = {}
for d in [ui_store_vars, patient_form_vars, laser_form_vars, finance_form_vars, appointment_form_vars, personal_form_vars, followup_form_vars]:
    all_mappings.update(d)

# ─── Find Home() function ──────────────────────────────────────────────────
home_start = -1
for i, line in enumerate(lines):
    if 'export default function Home()' in line:
        home_start = i
        break

if home_start == -1:
    print('ERROR: Could not find Home() function!')
    exit(1)

print(f'Home() function starts at line {home_start + 1}')

# ─── Find all useState lines within Home() ──────────────────────────────────
# Only process useState lines that are inside Home() component
# Skip useState in other components (Clock, DebouncedInput, etc.) which are before Home()

useState_line_pattern = re.compile(r'const\s+\[([\w]+),\s*set([\w]+)\]\s*=\s*useState')

lines_to_remove = []  # List of line indices to remove
mapped_vars = {}  # var_name -> (store, setter_in_store)
unmapped_vars = []

for i in range(home_start, len(lines)):
    line = lines[i]
    m = useState_line_pattern.search(line)
    if m:
        var_name = m.group(1)
        setter_name = m.group(2)  # e.g., "DarkMode" (without "set" prefix)
        if var_name in all_mappings:
            mapped_vars[var_name] = all_mappings[var_name]
            lines_to_remove.append(i)
        else:
            unmapped_vars.append(f'{var_name} (setter: set{setter_name})')

print(f'Found {len(mapped_vars)} mapped useState declarations')
print(f'Found {len(unmapped_vars)} unmapped variables: {unmapped_vars}')
print(f'Lines to remove: {len(lines_to_remove)}')

# ─── Add import for new stores ──────────────────────────────────────────────
# Find the last import line in the file
import_line_idx = -1
for i, line in enumerate(lines):
    if line.strip().startswith('import ') and 'from' in line:
        import_line_idx = i

if import_line_idx >= 0:
    # Determine which stores are needed
    used_stores = set(store for _, (store, _) in mapped_vars.items())
    store_names = sorted(used_stores)
    import_line = f"import {{ {', '.join(store_names)} }} from '@/store'\n"
    # Check if import already exists
    has_store_import = any('@/store' in line for line in lines)
    if not has_store_import:
        lines.insert(import_line_idx + 1, import_line)
        # Adjust line indices since we inserted a line
        lines_to_remove = [idx + 1 if idx >= import_line_idx + 1 else idx for idx in lines_to_remove]

# ─── Generate store destructuring lines ──────────────────────────────────────
# Group mapped vars by store
store_groups = {}
for var_name, (store_name, setter_name) in mapped_vars.items():
    if store_name not in store_groups:
        store_groups[store_name] = []
    store_groups[store_name].append((var_name, setter_name))

# Generate destructuring lines
destructure_lines = []
for store_name in sorted(store_groups.keys()):
    items = store_groups[store_name]
    destructure_items = []
    for var_name, setter_name in items:
        destructure_items.append(var_name)
        destructure_items.append(setter_name)
    items_str = ', '.join(destructure_items)
    destructure_lines.append(f'  const {{ {items_str} }} = {store_name}()\n')

# ─── Find insertion point for destructuring lines ───────────────────────────
# Insert after the useDataStore destructuring line
data_store_line_idx = -1
for i, line in enumerate(lines):
    if 'useDataStore()' in line:
        data_store_line_idx = i
        break

if data_store_line_idx >= 0:
    insert_idx = data_store_line_idx + 1
else:
    # Fall back to after Home() declaration
    insert_idx = home_start + 1

# ─── Remove useState lines ──────────────────────────────────────────────────
# Remove lines in reverse order to preserve indices
# Also remove associated comment lines if they only apply to removed useState

# First, identify which comment lines should be removed
# A comment line like "// Smart Patient Form" should be removed only if ALL
# useState lines below it (until the next comment or non-useState line) are removed

comment_line_pattern = re.compile(r'^\s*//\s+\S')

# Build a set of lines that are being removed
remove_set = set(lines_to_remove)

# Find comment lines that should be removed
comment_lines_to_remove = set()
for i in range(home_start, len(lines)):
    line = lines[i].strip()
    if comment_line_pattern.match(line):
        # Check if the next non-blank lines (up to the next comment) are all useState being removed
        all_removed = True
        j = i + 1
        while j < len(lines):
            next_line = lines[j].strip()
            if next_line == '':
                j += 1
                continue
            if comment_line_pattern.match(next_line):
                break
            if 'const [' in next_line and 'useState' in next_line:
                if j not in remove_set:
                    all_removed = False
                    break
                j += 1
            elif 'const ' in next_line and 'useRef' in next_line:
                # useRef declarations should stay
                all_removed = False
                break
            elif 'useEffect' in next_line:
                break
            elif 'const ' in next_line and '= async' in next_line:
                # Function declarations should stay
                all_removed = False
                break
            else:
                # Other code should stay
                all_removed = False
                break
        if all_removed:
            comment_lines_to_remove.add(i)

# Also remove blank lines that are between removed useState lines
# (only if both the line above and below are being removed)

# Combine all lines to remove
all_remove = sorted(set(lines_to_remove) | comment_lines_to_remove, reverse=True)

# Remove lines in reverse order
for idx in all_remove:
    lines.pop(idx)

# ─── Insert destructuring lines ──────────────────────────────────────────────
# Adjust insert_idx since we removed lines above it
# Count how many removed lines were before the insert point
removed_before = sum(1 for idx in all_remove if idx < insert_idx)
adjusted_insert_idx = insert_idx - removed_before

# Insert destructuring lines
for i, dline in enumerate(destructure_lines):
    lines.insert(adjusted_insert_idx + i, dline)

# ─── Remove unused useState import if no useState left ──────────────────────
# Check if useState is still used anywhere in the file
has_remaining_useState = any('useState' in line and 'import' not in line for line in lines)
if not has_remaining_useState:
    # Remove useState from the import line
    for i, line in enumerate(lines):
        if 'import { useState,' in line:
            # Remove useState from import
            new_import = line.replace('useState, ', '').replace(', useState', '')
            if 'useState' in new_import:
                # Handle edge case
                new_import = new_import.replace('useState', '')
            lines[i] = new_import
            break

# ─── Write the modified file ────────────────────────────────────────────────
with open(filepath, 'w', encoding='utf-8') as f:
    f.writelines(lines)

print(f'SUCCESS! Replaced {len(mapped_vars)} useState declarations with Zustand stores')
print(f'Removed {len(all_remove)} total lines (including comments)')
print(f'Stores used: {sorted(used_stores)}')
