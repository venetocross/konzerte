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
import type { DailyLog, MealEntry } from '../types'

function logsCollection(petId: string) {
  return collection(db, 'pets', petId, 'logs')
}

export function emptyLog(petId: string, date: string, mealsPerDay: number): DailyLog {
  const meals: MealEntry[] = Array.from({ length: mealsPerDay }, (_, i) => ({
    index: i,
    totalAmount: '',
    photoUrl: null,
    components: [],
  }))
  return { id: date, petId, date, meals, excrements: [], updatedAt: Date.now() }
}

export function subscribeToLog(
  petId: string,
  date: string,
  cb: (log: DailyLog | null) => void
) {
  return onSnapshot(doc(logsCollection(petId), date), (snap) => {
    cb(snap.exists() ? ({ id: snap.id, ...snap.data() } as DailyLog) : null)
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
    cb(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DailyLog))
  })
}

export async function fetchAllLogsOnce(petId: string): Promise<DailyLog[]> {
  const q = query(logsCollection(petId), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as DailyLog)
}
