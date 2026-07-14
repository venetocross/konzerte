import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePets } from '../contexts/PetContext'
import { useAuth } from '../contexts/AuthContext'
import { dailyComponentTotals, emptyLog, saveLog, subscribeToLog } from '../lib/logs'
import { formatDateDe, formatTimestampDe, todayKey } from '../lib/dateUtils'
import { PhotoCapture } from '../components/PhotoCapture'
import { MultiSelectDropdown } from '../components/MultiSelectDropdown'
import { Lightbox } from '../components/Lightbox'
import { Button, Card, Input, PageTitle } from '../components/ui'
import type { DailyLog, MealEntry } from '../types'

export function DailyLogPage() {
  const { selectedPet } = usePets()
  const { user } = useAuth()
  const [dateKey, setDateKey] = useState(todayKey())
  const [log, setLog] = useState<DailyLog | null>(null)
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null)
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!selectedPet) return
    const unsubscribe = subscribeToLog(selectedPet.id, dateKey, (existing) => {
      setLog(existing ?? emptyLog(selectedPet.id, dateKey, selectedPet.mealsPerDay))
    })
    return unsubscribe
  }, [selectedPet, dateKey])

  function scheduleSave(next: DailyLog) {
    setLog(next)
    setSaveState('saving')
    if (saveTimeout.current) clearTimeout(saveTimeout.current)
    saveTimeout.current = setTimeout(async () => {
      await saveLog(next)
      setSaveState('saved')
    }, 600)
  }

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

  if (!log) return null

  function updateMeal(index: number, patch: Partial<DailyLog['meals'][number]>) {
    if (!log) return
    const meals = log.meals.map((m) => (m.index === index ? { ...m, ...patch } : m))
    scheduleSave({ ...log, meals })
  }

  function updateMealComponentNames(meal: MealEntry, names: string[]) {
    const next = names.map((name) => meal.components.find((c) => c.name === name) ?? { name, amountG: null })
    updateMeal(meal.index, { components: next })
  }

  function updateComponentAmount(meal: MealEntry, name: string, amountG: number | null) {
    const next = meal.components.map((c) => (c.name === name ? { ...c, amountG } : c))
    updateMeal(meal.index, { components: next })
  }

  function addExcrementPhoto(photoUrl: string) {
    if (!log) return
    scheduleSave({ ...log, excrements: [...log.excrements, { photoUrl, takenAt: Date.now() }] })
  }

  function removeExcrementPhoto(idx: number) {
    if (!log) return
    scheduleSave({ ...log, excrements: log.excrements.filter((_, i) => i !== idx) })
  }

  const totals = dailyComponentTotals(log.meals)
  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0)

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle>Tagesprotokoll · {selectedPet.name}</PageTitle>
        <div className="flex items-center gap-2">
          <Input type="date" value={dateKey} max={todayKey()} onChange={(e) => setDateKey(e.target.value)} className="w-auto" />
          <span className="text-sm text-neutral-400">
            {saveState === 'saving' && 'Speichert…'}
            {saveState === 'saved' && 'Gespeichert ✓'}
          </span>
        </div>
      </div>
      <p className="mt-1 text-sm text-neutral-500">{formatDateDe(dateKey)}</p>

      {Object.keys(totals).length > 0 && (
        <Card className="mt-6">
          <h3 className="font-semibold text-brand-700">Tagesübersicht Futter</h3>
          <div className="mt-2 space-y-1 text-sm text-neutral-700">
            {Object.entries(totals).map(([name, amount]) => (
              <div key={name} className="flex justify-between">
                <span>{name}</span>
                <span>{amount} g</span>
              </div>
            ))}
          </div>
          <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 text-sm font-semibold text-neutral-900">
            <span>Gesamt</span>
            <span>{grandTotal} g</span>
          </div>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {log.meals.map((meal) => (
          <Card key={meal.index} className="space-y-3">
            <h3 className="font-semibold text-brand-700">Mahlzeit {meal.index + 1}</h3>
            <label className="block text-sm font-medium text-neutral-700">
              Futterkomponenten
              <div className="mt-1">
                <MultiSelectDropdown
                  options={selectedPet.enabledFoodComponents}
                  selected={meal.components.map((c) => c.name)}
                  onChange={(names) => updateMealComponentNames(meal, names)}
                />
              </div>
            </label>
            {meal.components.length > 0 && (
              <div className="space-y-1.5">
                {meal.components.map((c) => (
                  <div key={c.name} className="flex items-center justify-between gap-2 text-sm text-neutral-600">
                    <span>{c.name}</span>
                    <Input
                      type="number"
                      min="0"
                      className="w-24"
                      placeholder="g"
                      value={c.amountG ?? ''}
                      onChange={(e) =>
                        updateComponentAmount(meal, c.name, e.target.value === '' ? null : Number(e.target.value))
                      }
                    />
                  </div>
                ))}
              </div>
            )}
            <div>
              <p className="mb-1 text-sm font-medium text-neutral-700">Foto vom Futter</p>
              <PhotoCapture
                label="Futter fotografieren"
                photoUrl={meal.photoUrl}
                storagePath={`pet-photos/${user!.uid}/${selectedPet.id}/logs/${dateKey}/meal-${meal.index}.jpg`}
                onUploaded={(url) => updateMeal(meal.index, { photoUrl: url })}
                onRemove={() => updateMeal(meal.index, { photoUrl: null })}
                onView={setLightboxUrl}
              />
            </div>
          </Card>
        ))}

        <Card className="space-y-3">
          <h3 className="font-semibold text-brand-700">Ausscheidungen</h3>
          <div className="flex flex-wrap gap-3">
            {log.excrements.map((ex, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <button type="button" onClick={() => setLightboxUrl(ex.photoUrl)}>
                  <img
                    src={ex.photoUrl}
                    alt="Ausscheidung"
                    className="h-20 w-20 cursor-pointer rounded-lg object-cover"
                  />
                </button>
                <span className="text-[10px] text-neutral-400">{formatTimestampDe(ex.takenAt)}</span>
                <button onClick={() => removeExcrementPhoto(i)} className="text-xs text-red-600 hover:underline">
                  Entfernen
                </button>
              </div>
            ))}
            <PhotoCapture
              label="Foto hinzufügen"
              photoUrl={null}
              storagePath={`pet-photos/${user!.uid}/${selectedPet.id}/logs/${dateKey}/excrement-${Date.now()}.jpg`}
              onUploaded={addExcrementPhoto}
            />
          </div>
        </Card>
      </div>

      <Lightbox url={lightboxUrl} onClose={() => setLightboxUrl(null)} />
    </div>
  )
}
