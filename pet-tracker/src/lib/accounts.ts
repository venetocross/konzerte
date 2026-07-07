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

// Creates the account record on first login. New accounts start with no
// access (accessUntil: null) until an admin manually grants it.
export async function ensureAccountDoc(uid: string, email: string): Promise<void> {
  const ref = doc(db, ACCOUNTS_COLLECTION, uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) {
    await setDoc(ref, { email, accessUntil: null, createdAt: Date.now() })
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
