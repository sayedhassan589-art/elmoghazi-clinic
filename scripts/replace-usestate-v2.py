#!/usr/bin/env python3
"""
V2 - Precision replacement of useState with Zustand in page.tsx.
Handles multi-line useState declarations correctly by tracking the full span.
"""

import re

filepath = '/home/z/my-project/src/app/page.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# ─── Define store mappings (var_name -> store_name) ──────────────────────────
# Same as V1 but simplified - just maps to store name
VAR_TO_STORE = {
    # UI Store
    'darkMode': 'useUIStore', 'smartSearchOpen': 'useUIStore', 'smartSearchQuery': 'useUIStore',
    'searchQuery': 'useUIStore', 'searchField': 'useUIStore', 'patientDisplayCount': 'useUIStore',
    'selectedPatient': 'useUIStore', 'moreSubTab': 'useUIStore', 'laserSubTab': 'useUIStore',
    'personalSubTab': 'useUIStore', 'patientDetailTab': 'useUIStore', 'laserDetailTab': 'useUIStore',
    'followUpDetailTab': 'useUIStore', 'showAddPatient': 'useUIStore', 'editingPatient': 'useUIStore',
    'deletePatientConfirmOpen': 'useUIStore', 'showImprovementSlider': 'useUIStore',
    'showPatientImport': 'useUIStore', 'showAddSessionProfile': 'useUIStore',
    'showAddVisitProfile': 'useUIStore', 'showAddService': 'useUIStore',
    'showAddTransaction': 'useUIStore', 'expandedFinanceDay': 'useUIStore',
    'showAddAppointment': 'useUIStore', 'showAddLaserRecord': 'useUIStore',
    'showAddLaserPackage': 'useUIStore', 'showAddLaserSessionForm': 'useUIStore',
    'selectedLaserRecordId': 'useUIStore', 'showAddMedication': 'useUIStore',
    'showAddReminder': 'useUIStore', 'showAddDoctor': 'useUIStore',
    'showAddInventory': 'useUIStore', 'showStockTransaction': 'useUIStore',
    'showAddWaiting': 'useUIStore', 'showAddBooking': 'useUIStore',
    'showAddFollowUp': 'useUIStore', 'showAddFollowUpVisit': 'useUIStore',
    'showAddNote': 'useUIStore', 'showAddPersonalTxn': 'useUIStore',
    'showAddPersonalReminder': 'useUIStore', 'showAddPersonalNote': 'useUIStore',
    'showBroadcast': 'useUIStore', 'showApplyTemplate': 'useUIStore',
    'deleteVisitConfirmId': 'useUIStore', 'deleteLaserRecordConfirmId': 'useUIStore',
    'deleteLaserSessionConfirmId': 'useUIStore', 'deleteInventoryConfirmId': 'useUIStore',
    'deleteFollowUpConfirmId': 'useUIStore', 'restoreConfirmOpen': 'useUIStore',
    'pendingRestoreData': 'useUIStore', 'celebratingId': 'useUIStore',
    'celebratingImprovement': 'useUIStore', 'celebratingPersonalId': 'useUIStore',
    'passwordDialogOpen': 'useUIStore', 'passwordTarget': 'useUIStore',
    'passwordInput': 'useUIStore', 'pendingTab': 'useUIStore',
    'sliderPos': 'useUIStore', 'isDragging': 'useUIStore',
    'loginRole': 'useUIStore', 'loginPassword': 'useUIStore', 'loginLoading': 'useUIStore',
    'seeded': 'useUIStore', 'patientFilter': 'useUIStore', 'patientCopySearch': 'useUIStore',
    'noteSearch': 'useUIStore', 'noteFilter': 'useUIStore', 'notesSearch': 'useUIStore',
    'notesFilterSection': 'useUIStore', 'notesFilterImportant': 'useUIStore',
    'visitFilterType': 'useUIStore', 'inventorySearch': 'useUIStore',
    'inventoryFilter': 'useUIStore', 'inventoryCategoryFilter': 'useUIStore',
    'bookingFilterStatus': 'useUIStore', 'bookingFilterDate': 'useUIStore',
    'followUpSearch': 'useUIStore', 'followUpFilter': 'useUIStore',
    'selectedFollowUpId': 'useUIStore', 'personalSearchQuery': 'useUIStore',
    'personalReportPeriod': 'useUIStore', 'personalTxnFilter': 'useUIStore',
    'personalTxnCategoryFilter': 'useUIStore', 'personalDateFrom': 'useUIStore',
    'personalDateTo': 'useUIStore', 'reportPeriod': 'useUIStore',
    'selectedTemplate': 'useUIStore', 'templatePatientId': 'useUIStore',
    'broadcastMessage': 'useUIStore', 'broadcastFilter': 'useUIStore',
    'broadcastSending': 'useUIStore', 'broadcastProgress': 'useUIStore',
    'broadcastSelectedIds': 'useUIStore',

    # Patient Form Store
    'newPatientName': 'usePatientFormStore', 'newPatientPhone': 'usePatientFormStore',
    'newPatientPhone2': 'usePatientFormStore', 'newPatientAddress': 'usePatientFormStore',
    'newPatientAge': 'usePatientFormStore', 'newPatientDiagnosis': 'usePatientFormStore',
    'newPatientNotes': 'usePatientFormStore', 'newPatientDate': 'usePatientFormStore',
    'selectedVisitType': 'usePatientFormStore', 'selectedServiceIds': 'usePatientFormStore',
    'customServicePrice': 'usePatientFormStore', 'visitPrice': 'usePatientFormStore',
    'quickNote': 'usePatientFormStore', 'editPatientForm': 'usePatientFormStore',
    'editingNoteId': 'usePatientFormStore', 'editingNoteContent': 'usePatientFormStore',
    'photoType': 'usePatientFormStore', 'photoDescription': 'usePatientFormStore',
    'profileSessionServiceId': 'usePatientFormStore', 'profileSessionPrice': 'usePatientFormStore',
    'profileSessionNotes': 'usePatientFormStore', 'profileSessionDate': 'usePatientFormStore',
    'profileVisitType': 'usePatientFormStore', 'profileVisitPrice': 'usePatientFormStore',
    'profileVisitNotes': 'usePatientFormStore', 'profileVisitDate': 'usePatientFormStore',
    'editingVisitId': 'usePatientFormStore', 'editVisitForm': 'usePatientFormStore',
    'editingSessionId': 'usePatientFormStore', 'editSessionForm': 'usePatientFormStore',
    'editingNoteIdMore': 'usePatientFormStore', 'editingNoteContentMore': 'usePatientFormStore',
    'editingNoteSectionMore': 'usePatientFormStore', 'newNoteContent': 'usePatientFormStore',
    'newNoteSection': 'usePatientFormStore', 'newNoteImportant': 'usePatientFormStore',
    'improvementSliderValue': 'usePatientFormStore', 'improvementNote': 'usePatientFormStore',
    'patientImportData': 'usePatientFormStore', 'patientImportPreview': 'usePatientFormStore',
    'patientImportFile': 'usePatientFormStore', 'patientImportLoading': 'usePatientFormStore',
    'patientImportProgress': 'usePatientFormStore', 'patientImportDragOver': 'usePatientFormStore',

    # Laser Form Store
    'laserFormArea': 'useLaserFormStore', 'laserFormSkinType': 'useLaserFormStore',
    'laserFormHairColor': 'useLaserFormStore', 'laserFormHairDensity': 'useLaserFormStore',
    'laserFormSessions': 'useLaserFormStore', 'laserFormNotes': 'useLaserFormStore',
    'laserFormPatientId': 'useLaserFormStore', 'laserFormPatientSearch': 'useLaserFormStore',
    'laserFormPrice': 'useLaserFormStore', 'laserFormPaid': 'useLaserFormStore',
    'laserFormMachine': 'useLaserFormStore', 'laserFormEnergy': 'useLaserFormStore',
    'laserFormPulse': 'useLaserFormStore', 'laserFormDoctorId': 'useLaserFormStore',
    'editingLaserSessionId': 'useLaserFormStore', 'editLaserSessionForm': 'useLaserFormStore',
    'newLaserSessionForm': 'useLaserFormStore', 'editingLaserRecordId': 'useLaserFormStore',
    'editLaserRecordForm': 'useLaserFormStore', 'laserFinancePatientId': 'useLaserFormStore',
    'laserFinancePrice': 'useLaserFormStore', 'laserFinanceNotes': 'useLaserFormStore',
    'treatmentTemplates': 'useLaserFormStore',

    # Finance Form Store
    'txnFormType': 'useFinanceFormStore', 'txnFormCategory': 'useFinanceFormStore',
    'txnFormAmount': 'useFinanceFormStore', 'txnFormDescription': 'useFinanceFormStore',
    'txnFormDate': 'useFinanceFormStore', 'serviceFormName': 'useFinanceFormStore',
    'serviceFormCategory': 'useFinanceFormStore', 'serviceFormPrice': 'useFinanceFormStore',
    'serviceFormDuration': 'useFinanceFormStore', 'editingServiceId': 'useFinanceFormStore',
    'editingServicePrice': 'useFinanceFormStore', 'editingServiceName': 'useFinanceFormStore',
    'editingDoctorId': 'useFinanceFormStore', 'doctorForm': 'useFinanceFormStore',
    'reminderType': 'useFinanceFormStore', 'reminderDate': 'useFinanceFormStore',
    'reminderTime': 'useFinanceFormStore', 'reminderPatientId': 'useFinanceFormStore',

    # Appointment Form Store
    'waitingFormName': 'useAppointmentFormStore', 'waitingFormPriority': 'useAppointmentFormStore',
    'waitingFormPatientId': 'useAppointmentFormStore', 'waitingFormNotes': 'useAppointmentFormStore',
    'bookingFormPatientSearch': 'useAppointmentFormStore', 'bookingFormPatientId': 'useAppointmentFormStore',
    'bookingFormDate': 'useAppointmentFormStore', 'bookingFormTime': 'useAppointmentFormStore',
    'bookingFormType': 'useAppointmentFormStore', 'bookingFormStatus': 'useAppointmentFormStore',
    'bookingFormNotes': 'useAppointmentFormStore', 'editingBookingId': 'useAppointmentFormStore',
    'stockTransactionItemId': 'useAppointmentFormStore', 'stockTransactionType': 'useAppointmentFormStore',
    'stockTransactionQty': 'useAppointmentFormStore', 'stockTransactionNotes': 'useAppointmentFormStore',
    'editingInventoryId': 'useAppointmentFormStore', 'editInventoryForm': 'useAppointmentFormStore',

    # Personal Form Store
    'personalTxnForm': 'usePersonalFormStore', 'editingPersonalTxnId': 'usePersonalFormStore',
    'personalReminderForm': 'usePersonalFormStore', 'editingPersonalReminderId': 'usePersonalFormStore',
    'personalNoteForm': 'usePersonalFormStore', 'editingPersonalNoteId': 'usePersonalFormStore',
    'editingPersonalNoteContent': 'usePersonalFormStore',

    # FollowUp Form Store
    'fuFormPatientSearch': 'useFollowUpFormStore', 'fuFormPatientId': 'useFollowUpFormStore',
    'fuFormCondition': 'useFollowUpFormStore', 'fuFormCategory': 'useFollowUpFormStore',
    'fuFormSeverity': 'useFollowUpFormStore', 'fuFormFrequency': 'useFollowUpFormStore',
    'fuFormCustomDays': 'useFollowUpFormStore', 'fuFormNextVisit': 'useFollowUpFormStore',
    'fuFormDiagnosis': 'useFollowUpFormStore', 'fuFormTreatmentPlan': 'useFollowUpFormStore',
    'fuFormMedications': 'useFollowUpFormStore', 'fuFormNotes': 'useFollowUpFormStore',
    'fuFormHasSubscription': 'useFollowUpFormStore', 'fuFormSubType': 'useFollowUpFormStore',
    'fuFormSubPrice': 'useFollowUpFormStore', 'fuFormSubStart': 'useFollowUpFormStore',
    'fuFormSubEnd': 'useFollowUpFormStore', 'fuFormSubSessions': 'useFollowUpFormStore',
    'fuVisitForm': 'useFollowUpFormStore', 'editingFollowUpId': 'useFollowUpFormStore',
}

# ─── Find Home() function boundaries ────────────────────────────────────────
home_marker = 'export default function Home()'
home_start = content.find(home_marker)
if home_start == -1:
    print('ERROR: Could not find Home()!')
    exit(1)

# Find the end of the Home function (last closing brace at the end of file)
# We'll only process content between home_start and end of file

# ─── Process content as text, not lines ────────────────────────────────────
# This approach handles multi-line useState correctly

# Step 1: Find all useState declarations in the Home() function
# Pattern: const [varName, setVarName] = useState<...>(...)
# This may span multiple lines for complex initial values

# We'll use a custom parser to find the complete extent of each useState declaration

# First, find the region of useState declarations
# This region starts after the existing store destructuring lines and ends before the first
# non-useState/non-comment/non-ref/non-function declaration

useDataStore_end = content.find('useDataStore()', home_start)
if useDataStore_end == -1:
    print('ERROR: Could not find useDataStore() destructuring!')
    exit(1)

# Find the end of the useDataStore line (the closing paren and newline)
useDataStore_line_end = content.find('\n', useDataStore_end)

# The useState region starts at the next line after useDataStore destructuring
useState_region_start = useDataStore_line_end + 1

# Find the end of the useState region
# It ends at the first line that's NOT a useState, NOT a comment, NOT a blank line,
# NOT a useRef, and NOT a function definition
# Actually, it ends when we encounter useEffect or the first real business logic

# We'll find the first useEffect after the useState region
useEffect_pattern = re.compile(r'\n\s*useEffect\(')
useEffect_matches = list(useEffect_pattern.finditer(content, useState_region_start))

# The useState region ends before the first useEffect
if useEffect_matches:
    useState_region_end = useEffect_matches[0].start()
else:
    # Find "// ─── Effects" comment
    effects_comment = content.find('// ─── Effects', useState_region_start)
    if effects_comment != -1:
        useState_region_end = effects_comment
    else:
        print('ERROR: Could not find end of useState region!')
        exit(1)

print(f'useState region: {useState_region_start} to {useState_region_end}')

# Extract the useState region content
region_content = content[useState_region_start:useState_region_end]

# Step 2: Parse and find all useState declarations in this region
# Each declaration starts with "const [" and ends with a closing ")" + optional newline
# For multi-line declarations, we need to track parenthesis depth

useState_decls = []  # List of (start_pos, end_pos, var_name, setter_name, store_name)

pos = 0
while pos < len(region_content):
    # Find "const ["
    match_start = region_content.find('const [', pos)
    if match_start == -1:
        break
    
    # Check if this is a useState declaration
    # Find the = useState part
    equals_pos = region_content.find('= useState', match_start)
    if equals_pos == -1 or equals_pos > match_start + 100:
        # Not a useState, skip
        pos = match_start + 7
        continue
    
    # Extract variable name
    bracket_content = region_content[match_start + 7:equals_pos].strip()
    # bracket_content should be like "darkMode, setDarkMode]"
    bracket_end = bracket_content.find(']')
    if bracket_end == -1:
        pos = match_start + 7
        continue
    
    vars_str = bracket_content[:bracket_end].strip()
    # Parse the two variable names
    parts = vars_str.split(',')
    if len(parts) < 2:
        pos = match_start + 7
        continue
    
    var_name = parts[0].strip()
    setter_name = parts[1].strip()
    
    # Check if this variable is mapped to a store
    if var_name not in VAR_TO_STORE:
        # Skip unmapped variables (like [, setTick] from Clock)
        pos = match_start + 7
        continue
    
    store_name = VAR_TO_STORE[var_name]
    
    # Now find the complete extent of this useState declaration
    # It starts at the beginning of the line containing "const ["
    line_start = region_content.rfind('\n', 0, match_start)
    if line_start == -1:
        line_start = 0
    else:
        line_start += 1
    
    # Find the end - we need to track parenthesis depth to handle multi-line declarations
    # Starting from "= useState("
    paren_start = region_content.find('(', equals_pos)
    if paren_start == -1:
        pos = match_start + 7
        continue
    
    depth = 1
    scan_pos = paren_start + 1
    while scan_pos < len(region_content) and depth > 0:
        ch = region_content[scan_pos]
        if ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        scan_pos += 1
    
    # The end is after the closing paren and the newline
    # Find the newline after the closing paren
    end_newline = region_content.find('\n', scan_pos - 1)
    if end_newline == -1:
        decl_end = len(region_content)
    else:
        decl_end = end_newline + 1  # Include the newline
    
    useState_decls.append((line_start, decl_end, var_name, setter_name, store_name))
    
    pos = decl_end

print(f'Found {len(useState_decls)} useState declarations to replace')

# Step 3: Remove useState declarations from the region
# Build a new region content without the useState declarations
# We need to handle this carefully to preserve non-useState content (comments, refs, functions)

# Find all the spans to remove (in region coordinates)
remove_spans = [(start, end) for start, end, _, _, _ in useState_decls]

# Also identify comment lines that are directly above removed useState blocks
# and only apply to those useState lines
lines = region_content.split('\n')
remove_line_ranges = []  # (start_line_idx, end_line_idx) in line numbers

for start, end, var_name, setter_name, store_name in useState_decls:
    start_line_idx = region_content[:start].count('\n')
    end_line_idx = region_content[:end].count('\n')
    remove_line_ranges.append((start_line_idx, end_line_idx))

# Find comment lines that should also be removed
# A comment line like "// Smart Patient Form" followed only by useState being removed
comment_lines_to_remove = set()
for i, line in enumerate(lines):
    stripped = line.strip()
    if stripped.startswith('//') and not stripped.startswith('// ───'):
        # Check if the next non-blank lines (until next comment or non-useState) are all removed
        all_removed = True
        j = i + 1
        found_any = False
        while j < len(lines):
            next_stripped = lines[j].strip()
            if next_stripped == '':
                j += 1
                continue
            if next_stripped.startswith('//') and not next_stripped.startswith('// ───'):
                break  # Next comment block
            # Check if this line is within a remove range
            is_in_remove = False
            for rs, re_ in remove_line_ranges:
                if rs <= j <= re_:
                    is_in_remove = True
                    found_any = True
                    break
            if not is_in_remove:
                all_removed = False
                break
            j += 1
        if found_any and all_removed:
            comment_lines_to_remove.add(i)

# Build list of lines to keep
keep_lines = set(range(len(lines)))
for rs, re_ in remove_line_ranges:
    for k in range(rs, re_ + 1):
        keep_lines.discard(k)
for k in comment_lines_to_remove:
    keep_lines.discard(k)

# Build the new region content
new_region_lines = [lines[i] for i in sorted(keep_lines)]

# Step 4: Generate store destructuring lines
# Group variables by store
store_groups = {}
for start, end, var_name, setter_name, store_name in useState_decls:
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
    destructure_lines.append(f'  const {{ {items_str} }} = {store_name}()')

# Step 5: Add import for new stores
import_line = f"import {{ {', '.join(sorted(store_groups.keys()))} }} from '@/store'"

# Find the last import line in the file
import_lines = []
for i, line in enumerate(content.split('\n')):
    if line.strip().startswith('import ') and 'from' in line:
        import_lines.append(i)

if import_lines:
    last_import_line_idx = import_lines[-1]
    # Insert after last import
    content_lines = content.split('\n')
    content_lines.insert(last_import_line_idx + 1, import_line)
    content = '\n'.join(content_lines)

# Step 6: Replace the useState region
# Re-find positions since content may have shifted after import insertion
home_start = content.find(home_marker)
useDataStore_end = content.find('useDataStore()', home_start)
useDataStore_line_end = content.find('\n', useDataStore_end)
useState_region_start = useDataStore_line_end + 1

# Re-find the region end
useEffect_pattern = re.compile(r'\n\s*useEffect\(')
useEffect_matches = list(useEffect_pattern.finditer(content, useState_region_start))
if useEffect_matches:
    useState_region_end = useEffect_matches[0].start()
else:
    effects_comment = content.find('// ─── Effects', useState_region_start)
    useState_region_end = effects_comment

# Build the replacement content
# Insert destructuring lines + remaining region content
replacement = '\n'.join(destructure_lines) + '\n' + '\n'.join(new_region_lines)

# Replace the region
new_content = content[:useState_region_start] + replacement + content[useState_region_end:]

# Clean up multiple consecutive empty lines
new_content = re.sub(r'\n{4,}', '\n\n\n', new_content)

# Step 7: Write the result
with open(filepath, 'w', encoding='utf-8') as f:
    f.write(new_content)

print(f'SUCCESS! Replaced {len(useState_decls)} useState declarations')
print(f'Stores: {sorted(store_groups.keys())}')
print(f'Variables mapped to stores: {len(VAR_TO_STORE)}')
