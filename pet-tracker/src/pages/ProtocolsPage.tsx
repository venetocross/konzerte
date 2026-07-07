import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePets } from '../contexts/PetContext'
import { subscribeToAllLogs } from '../lib/logs'
import { exportLogsToPdf } from '../lib/pdfExport'
import { formatDateDe, isoWeekKey } from '../lib/dateUtils'
import { Button, Card, PageTitle } from '../components/ui'
import type { DailyLog, Pet } from '../types'

type ViewMode = 'day' | 'week'

function groupByWeek(logs: DailyLog[]): Map<string, DailyLog[]> {
  const map = new Map<string, DailyLog[]>()
  for (const log of logs) {
    const key = isoWeekKey(log.date)
    if (!map.has(key)) map.set(key, [])
    map.get(key)!.push(log)
  }
  return map
}

async function exportAndDeliver(pet: Pet, logs: DailyLog[], label: string, setBusy: (b: boolean) => void) {
  setBusy(true)
  try {
    const blob = await exportLogsToPdf(pet, logs, label)
    const filename = `pfotenprotokoll-${pet.name}-${label}.pdf`.replace(/\s+/g, '_')
    const file = new File([blob], filename, { type: 'application/pdf' })

    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: filename, text: `Pfotenprotokoll für ${pet.name}` })
    } else {
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    }
  } finally {
    setBusy(false)
  }
}

export function ProtocolsPage() {
  const { selectedPet } = usePets()
  const [logs, setLogs] = useState<DailyLog[]>([])
  const [mode, setMode] = useState<ViewMode>('day')
  const [busyKey, setBusyKey] = useState<string | null>(null)

  useEffect(() => {
    if (!selectedPet) return
    return subscribeToAllLogs(selectedPet.id, setLogs)
  }, [selectedPet])

  const weeks = useMemo(() => groupByWeek(logs), [logs])

  if (!selectedPet) {
    return (
      <div className="mx-auto max-w-xl px-4 py-12 text-center">
        <p className="text-neutral-500">Bitte zuerst ein Haustierprofil anlegen.</p>
        <Link to="/pets/new" className="mt-4 inline-block">
          <Button>Haustier anlegen</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Verlauf · {selectedPet.name}</PageTitle>
        <div className="flex gap-1 rounded-lg bg-neutral-100 p-1">
          <button
            onClick={() => setMode('day')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === 'day' ? 'bg-white text-brand-700 shadow-sm' : 'text-neutral-500'}`}
          >
            Tageweise
          </button>
          <button
            onClick={() => setMode('week')}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${mode === 'week' ? 'bg-white text-brand-700 shadow-sm' : 'text-neutral-500'}`}
          >
            Wochenweise
          </button>
        </div>
      </div>

      {logs.length === 0 && <p className="mt-8 text-center text-neutral-400">Noch keine Protokolle vorhanden.</p>}

      {mode === 'day' && (
        <div className="mt-6 space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-neutral-900">{formatDateDe(log.date)}</p>
                <p className="text-sm text-neutral-500">
                  {log.meals.filter((m) => m.totalAmountG != null || m.photoUrl).length}/{log.meals.length} Mahlzeiten erfasst ·{' '}
                  {log.excrements.length} Ausscheidungsfoto(s)
                </p>
              </div>
              <Button
                variant="secondary"
                disabled={busyKey === log.id}
                onClick={() => exportAndDeliver(selectedPet, [log], formatDateDe(log.date), (b) => setBusyKey(b ? log.id : null))}
              >
                {busyKey === log.id ? 'Erstellt PDF…' : 'Als PDF verschicken'}
              </Button>
            </Card>
          ))}
        </div>
      )}

      {mode === 'week' && (
        <div className="mt-6 space-y-3">
          {[...weeks.entries()].map(([week, weekLogs]) => (
            <Card key={week} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-neutral-900">{week}</p>
                <p className="text-sm text-neutral-500">{weekLogs.length} Tag(e) protokolliert</p>
              </div>
              <Button
                variant="secondary"
                disabled={busyKey === week}
                onClick={() => exportAndDeliver(selectedPet, weekLogs, week, (b) => setBusyKey(b ? week : null))}
              >
                {busyKey === week ? 'Erstellt PDF…' : 'Als PDF verschicken'}
              </Button>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
