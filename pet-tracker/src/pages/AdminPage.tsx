import { useEffect, useState } from 'react'
import { useAccess } from '../contexts/AccessContext'
import { subscribeToAllAccounts, setAccountAccess } from '../lib/accounts'
import { formatDateDe } from '../lib/dateUtils'
import { Button, Card, Input, PageTitle } from '../components/ui'
import type { Account } from '../types'

function accountStatus(acc: Account): { label: string; className: string } {
  if (acc.accessUntil == null) return { label: 'Kein Zugang', className: 'bg-neutral-100 text-neutral-600' }
  if (acc.accessUntil <= Date.now()) return { label: 'Abgelaufen', className: 'bg-red-100 text-red-700' }
  return { label: 'Aktiv', className: 'bg-green-100 text-green-700' }
}

function toDateInputValue(ms: number | null): string {
  if (ms == null) return ''
  return new Date(ms).toISOString().slice(0, 10)
}

function AccountRow({ account }: { account: Account }) {
  const [dateValue, setDateValue] = useState(toDateInputValue(account.accessUntil))
  const [saving, setSaving] = useState(false)
  const status = accountStatus(account)

  async function extend(days: number) {
    setSaving(true)
    const base = account.accessUntil != null && account.accessUntil > Date.now() ? account.accessUntil : Date.now()
    const next = base + days * 24 * 60 * 60 * 1000
    await setAccountAccess(account.uid, next)
    setDateValue(toDateInputValue(next))
    setSaving(false)
  }

  async function applyDate() {
    setSaving(true)
    const ms = dateValue ? new Date(`${dateValue}T23:59:59`).getTime() : null
    await setAccountAccess(account.uid, ms)
    setSaving(false)
  }

  async function block() {
    setSaving(true)
    await setAccountAccess(account.uid, null)
    setDateValue('')
    setSaving(false)
  }

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-semibold text-neutral-900">{account.email}</p>
          <p className="text-xs text-neutral-400">
            Registriert: {formatDateDe(new Date(account.createdAt).toISOString().slice(0, 10))} · UID: {account.uid}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.className}`}>{status.label}</span>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input
          type="date"
          value={dateValue}
          onChange={(e) => setDateValue(e.target.value)}
          className="w-auto"
        />
        <Button variant="secondary" onClick={applyDate} disabled={saving}>
          Datum speichern
        </Button>
        <Button variant="secondary" onClick={() => extend(30)} disabled={saving}>
          +30 Tage
        </Button>
        <Button variant="secondary" onClick={() => extend(365)} disabled={saving}>
          +1 Jahr
        </Button>
        <Button variant="danger" onClick={block} disabled={saving}>
          Sperren
        </Button>
      </div>
    </Card>
  )
}

export function AdminPage() {
  const { isAdmin, loading } = useAccess()
  const [accounts, setAccounts] = useState<Account[]>([])

  useEffect(() => {
    if (!isAdmin) return
    return subscribeToAllAccounts(setAccounts)
  }, [isAdmin])

  if (loading) return null

  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center text-neutral-500">
        Kein Zugriff – diese Seite ist nur für Administratoren.
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <PageTitle>Admin – Zugänge verwalten</PageTitle>
      <p className="mt-1 text-sm text-neutral-500">{accounts.length} Konto(en)</p>
      <div className="mt-6 space-y-4">
        {accounts.map((acc) => (
          <AccountRow key={acc.uid} account={acc} />
        ))}
      </div>
    </div>
  )
}
