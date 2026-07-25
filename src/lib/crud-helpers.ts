'use client'
// ─── Shared CRUD helpers — eliminates duplication across 6+ components ────
import { apiFetch } from '@/lib/helpers'
import { toast } from 'sonner'

/**
 * Generic addItem — POST to API, prepend result to local state array.
 * Returns the created item (or null on failure).
 */
export async function addItem<T>(
  path: string,
  body: any,
  setter: React.Dispatch<React.SetStateAction<T[]>>,
  silent = false
): Promise<T | null> {
  try {
    const res = await apiFetch<any>(path, { method: 'POST', body: JSON.stringify(body) })
    const item = res?.data || res?.patient || res?.visit || res?.session || res?.service || res?.note || res?.alert || res?.reminder || res?.record || res?.package || res?.setting || res?.transaction || res?.appointment || res?.item || res?.plan || res?.medication || res?.prescription || res?.backup || res
    if (item?.id) setter(prev => [item, ...prev])
    if (!silent) toast.success('تمت الإضافة بنجاح')
    return item as T
  } catch (e: any) {
    if (!silent) toast.error(e.message || 'خطأ')
    return null
  }
}

/**
 * Generic deleteItem — DELETE from API, remove from local state array.
 */
export async function deleteItem<T>(
  path: string,
  id: string,
  setter: React.Dispatch<React.SetStateAction<T[]>>
): Promise<void> {
  try {
    await apiFetch(`${path}/${id}`, { method: 'DELETE' })
    setter(prev => prev.filter((item: any) => item.id !== id))
    toast.success('تم الحذف')
  } catch (e: any) {
    toast.error(e.message || 'خطأ')
  }
}
