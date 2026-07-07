import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
} from 'firebase/firestore'
import { db } from '../firebase'
import type { Account } from '../types'

const ACCOUNTS_COLLECTION = 'accounts'
const ADMINS_COLLECTION = 'admins'
export const TRIAL_DURATION_MS = 30 * 24 * 60 * 60 * 1000

// Creates the account record on first login, granting a one-time 30-day
// trial. Since this only runs when no account doc exists yet, the trial
// can't be re-granted to the same account later (e.g. after an admin
// revokes access) - trialUsed stays true forever as a record of that.
export async function ensureAccountDoc(uid: string, email: string): Promise<void> {
  const ref = doc(db, ACCOUNTS_COLLECTION, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, {
      email,
      accessUntil: Date.now() + TRIAL_DURATION_MS,
      trialUsed: true,
      createdAt: Date.now(),
    })
  }
}

export function subscribeToAccount(uid: string, cb: (account: Account | null) => void) {
  return onSnapshot(doc(db, ACCOUNTS_COLLECTION, uid), (snap) => {
    cb(snap.exists() ? ({ uid: snap.id, ...snap.data() } as Account) : null)
  })
}

export function subscribeToAllAccounts(cb: (accounts: Account[]) => void) {
  const q = query(collection(db, ACCOUNTS_COLLECTION), orderBy('createdAt', 'asc'))
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ uid: d.id, ...d.data() }) as Account))
  })
}

export async function setAccountAccess(uid: string, accessUntil: number | null): Promise<void> {
  await updateDoc(doc(db, ACCOUNTS_COLLECTION, uid), { accessUntil })
}

export async function checkIsAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, ADMINS_COLLECTION, uid))
  return snap.exists()
}
