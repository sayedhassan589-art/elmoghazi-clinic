#!/usr/bin/env python3
"""Fix MoreSection.tsx - add all 18 missing references for self-containment."""

filepath = '/home/z/my-project/src/components/MoreSection.tsx'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add setActiveTab to useClinicStore destructuring
old_clinic = "const { theme, setTheme, THEME_CONFIGS: _TC } = useClinicStore()"
new_clinic = "const { theme, setTheme, THEME_CONFIGS: _TC, setActiveTab } = useClinicStore()"
content = content.replace(old_clinic, new_clinic)

# 2. Add deleteInventoryConfirmId, setDeleteInventoryConfirmId, setSelectedPatient to useUIStore destructuring
# The useUIStore destructuring is a massive one-line string. Find the end of it to insert new vars.
# Insert after "showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement"
old_ui_end = "showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement } = useUIStore()"
new_ui_end = "showImprovementSlider, setShowImprovementSlider, celebratingImprovement, setCelebratingImprovement, deleteInventoryConfirmId, setDeleteInventoryConfirmId, setSelectedPatient } = useUIStore()"
content = content.replace(old_ui_end, new_ui_end)

# 3. Add editingServiceId, setEditingServiceId, editingServiceName, setEditingServiceName, editingServicePrice, setEditingServicePrice to useFinanceFormStore
old_finance = "const { serviceFormName, setServiceFormName, serviceFormCategory, setServiceFormCategory, serviceFormPrice, setServiceFormPrice, serviceFormDuration, setServiceFormDuration, doctorForm, setDoctorForm, editingDoctorId, setEditingDoctorId, reminderType, setReminderType, reminderPatientId, setReminderPatientId } = useFinanceFormStore()"
new_finance = "const { serviceFormName, setServiceFormName, serviceFormCategory, setServiceFormCategory, serviceFormPrice, setServiceFormPrice, serviceFormDuration, setServiceFormDuration, editingServiceId, setEditingServiceId, editingServiceName, setEditingServiceName, editingServicePrice, setEditingServicePrice, doctorForm, setDoctorForm, editingDoctorId, setEditingDoctorId, reminderType, setReminderType, reminderPatientId, setReminderPatientId } = useFinanceFormStore()"
content = content.replace(old_finance, new_finance)

# 4. Add editingNoteId, setEditingNoteId, editingNoteContent, setEditingNoteContent, editingNoteSectionMore, setEditingNoteSectionMore to usePatientFormStore
old_patient = "const { quickNote, setQuickNote } = usePatientFormStore()"
new_patient = "const { quickNote, setQuickNote, editingNoteId, setEditingNoteId, editingNoteContent, setEditingNoteContent, editingNoteSectionMore, setEditingNoteSectionMore } = usePatientFormStore()"
content = content.replace(old_patient, new_patient)

# 5. Add canDelete, servicesByCategory, markSessionPaid after the store destructuring block
# Find the isDoctor definition
old_is_doctor = "  const isDoctor = userRole === 'doctor'"
new_is_doctor = """  const isDoctor = userRole === 'doctor'
  const canDelete = isDoctor

  // ─── Services grouped by category ────────────────────────────────────
  const servicesByCategory = useMemo(() => {
    const cats: Record<string, Service[]> = {}
    services.filter(s => s.active).forEach(s => { const cat = s.category || 'عام'; if (!cats[cat]) cats[cat] = []; cats[cat].push(s) })
    return cats
  }, [services])

  // ─── CRUD helpers ──────────────────────────────────────────────
  const addItem = async <T,>(path: string, body: any, setter: React.Dispatch<React.SetStateAction<T[]>>, silent = false) => {
    try { const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) }); const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res; if (item?.id) setter(prev => [item, ...prev]); if (!silent) toast.success('تمت الإضافة بنجاح'); return item } catch (e: any) { if (!silent) toast.error(e.message || 'خطأ'); return null }
  }
  const deleteItem = async <T,>(path: string, id: string, setter: React.Dispatch<React.SetStateAction<T[]>>) => {
    try { await apiFetch(`${path}/${id}`, { method: 'DELETE' }); setter(prev => prev.filter((item: any) => item.id !== id)); toast.success('تم الحذف') } catch (e: any) { toast.error(e.message || 'خطأ') }
  }

  // ─── Mark session as paid + create finance transaction ──────────────
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
  }"""
content = content.replace(old_is_doctor, new_is_doctor)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print("✅ MoreSection.tsx fixed successfully!")
