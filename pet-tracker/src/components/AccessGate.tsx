import type { ReactNode } from 'react'
import { useAccess } from '../contexts/AccessContext'
import { useAuth } from '../contexts/AuthContext'
import { formatDateDe } from '../lib/dateUtils'

export function AccessGate({ children }: { children: ReactNode }) {
  const { loading, hasAccess, account } = useAccess()
  const { logout } = useAuth()

  if (loading) {
    return <div className="flex h-full items-center justify-center text-neutral-400">Lädt…</div>
  }

  if (!hasAccess) {
    const expired = account?.accessUntil != null && account.accessUntil <= Date.now()
    return (
      <div className="flex h-full items-center justify-center px-4">
        <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 text-center shadow-sm">
          <div className="mb-3 text-3xl">🔒</div>
          <h1 className="mb-2 text-lg font-semibold text-neutral-900">
            {expired ? 'Zugang abgelaufen' : 'Zugang noch nicht freigeschaltet'}
          </h1>
          <p className="text-sm text-neutral-500">
            {expired
              ? `Dein Zugang ist am ${formatDateDe(
                  new Date(account!.accessUntil!).toISOString().slice(0, 10)
                )} abgelaufen. Bitte wende dich an den Betreiber, um ihn zu verlängern.`
              : 'Dein Konto wurde erstellt, aber noch nicht freigeschaltet. Bitte wende dich an den Betreiber.'}
          </p>
          <button
            onClick={logout}
            className="mt-4 text-sm font-medium text-brand-700 hover:underline"
          >
            Abmelden
          </button>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
