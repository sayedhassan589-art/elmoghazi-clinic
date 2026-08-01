// ─── Functional Update Helper ───────────────────────────────────────────────
// Supports both direct values and functional updates: setter(prev => newValue)
// Usage: setX: (v) => set({ x: applyUpdater(v, get().x) })

export type Updater<T> = T | ((prev: T) => T)

export function applyUpdater<T>(val: Updater<T>, prev: T): T {
  return typeof val === 'function' ? (val as (prev: T) => T)(prev) : val
}
