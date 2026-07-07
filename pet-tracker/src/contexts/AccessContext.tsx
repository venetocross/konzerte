import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { checkIsAdmin, ensureAccountDoc, subscribeToAccount } from '../lib/accounts'
import type { Account } from '../types'

interface AccessContextValue {
  loading: boolean
  isAdmin: boolean
  account: Account | null
  hasAccess: boolean
}

const AccessContext = createContext<AccessContextValue | undefined>(undefined)

export function AccessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const [account, setAccount] = useState<Account | null>(null)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      setIsAdmin(false)
      setAccount(null)
      return
    }
    let cancelled = false
    let unsubscribeAccount: (() => void) | undefined
    setLoading(true)

    checkIsAdmin(user.uid).then((admin) => {
      if (!cancelled) setIsAdmin(admin)
    })

    ensureAccountDoc(user.uid, user.email ?? '').then(() => {
      if (cancelled) return
      unsubscribeAccount = subscribeToAccount(user.uid, (acc) => {
        setAccount(acc)
        setLoading(false)
      })
    })

    return () => {
      cancelled = true
      unsubscribeAccount?.()
    }
  }, [user])

  const hasAccess = isAdmin || (account?.accessUntil != null && account.accessUntil > Date.now())

  return (
    <AccessContext.Provider value={{ loading, isAdmin, account, hasAccess }}>
      {children}
    </AccessContext.Provider>
  )
}

export function useAccess() {
  const ctx = useContext(AccessContext)
  if (!ctx) throw new Error('useAccess muss innerhalb von AccessProvider verwendet werden')
  return ctx
}
