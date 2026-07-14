import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { DailyLog, MealComponentAmount, MealEntry } from '../types'

function logsCollection(petId: string) {
  return collection(db, 'pets', petId, 'logs')
}

export function emptyLog(petId: string, date: string, mealsPerDay: number): DailyLog {
  const meals: MealEntry[] = Array.from({ length: mealsPerDay }, (_, i) => ({
    index: i,
    photoUrl: null,
    components: [],
  }))
  return { id: date, petId, date, meals, excrements: [], updatedAt: Date.now() }
}

// Older logs stored components as plain strings (and some had a manual
// totalAmount/totalAmountG field that no longer exists). Normalizing on read
// keeps already-saved days working after switching to per-component gram
// amounts and dropping the manual total.
function normalizeMeal(raw: Record<string, unknown>): MealEntry {
  const rawComponents = raw.components
  const components: MealComponentAmount[] = Array.isArray(rawComponents)
    ? rawComponents.map((c) =>
        typeof c === 'string' ? { name: c, amountG: null } : (c as MealComponentAmount)
      )
    : []

  return {
    index: raw.index as number,
    photoUrl: (raw.photoUrl as string | null) ?? null,
    components,
  }
}

function normalizeLog(raw: Record<string, unknown>): DailyLog {
  const meals = Array.isArray(raw.meals) ? raw.meals.map((m) => normalizeMeal(m as Record<string, unknown>)) : []
  return { ...(raw as unknown as DailyLog), meals }
}

export function subscribeToLog(
  petId: string,
  date: string,
  cb: (log: DailyLog | null) => void
) {
  return onSnapshot(doc(logsCollection(petId), date), (snap) => {
    cb(snap.exists() ? normalizeLog({ id: snap.id, ...snap.data() }) : null)
  })
}

export async function saveLog(log: DailyLog): Promise<void> {
  await setDoc(doc(logsCollection(log.petId), log.date), {
    petId: log.petId,
    date: log.date,
    meals: log.meals,
    excrements: log.excrements,
    updatedAt: Date.now(),
  })
}

export function subscribeToAllLogs(petId: string, cb: (logs: DailyLog[]) => void) {
  const q = query(logsCollection(petId), orderBy('date', 'desc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => normalizeLog({ id: d.id, ...d.data() })))
  })
}

export async function fetchAllLogsOnce(petId: string): Promise<DailyLog[]> {
  const q = query(logsCollection(petId), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => normalizeLog({ id: d.id, ...d.data() }))
}

// Sums each component's amount across all meals of a day.
export function dailyComponentTotals(meals: MealEntry[]): Record<string, number> {
  const totals: Record<string, number> = {}
  for (const meal of meals) {
    for (const c of meal.components) {
      if (c.amountG != null) totals[c.name] = (totals[c.name] ?? 0) + c.amountG
    }
  }
  return totals
}
