import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { usePets } from '../contexts/PetContext'
import { useAuth } from '../contexts/AuthContext'
import { PhotoCapture } from '../components/PhotoCapture'
import { Button, Card, Checkbox, ErrorText, Field, Input, PageTitle, Select } from '../components/ui'
import { DEFAULT_FOOD_COMPONENTS, SPECIES_LABELS } from '../lib/foodComponents'
import type { Pet, PetGender, PetSpecies } from '../types'

const SPECIES: PetSpecies[] = ['hund', 'katze', 'pferd']

export function PetProfilePage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const { pets, reservePetId, createPet, updatePet, deletePet } = usePets()
  const { user } = useAuth()
  const navigate = useNavigate()

  const existing = useMemo(() => pets.find((p) => p.id === id), [pets, id])
  const petId = useMemo(() => id ?? reservePetId(), [id, reservePetId])

  const [species, setSpecies] = useState<PetSpecies>('hund')
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [weightKg, setWeightKg] = useState('')
  const [gender, setGender] = useState<PetGender>('unbekannt')
  const [breed, setBreed] = useState('')
  const [neutered, setNeutered] = useState<'ja' | 'nein' | ''>('')
  const [chipNumber, setChipNumber] = useState('')
  const [insuranceNumber, setInsuranceNumber] = useState('')
  const [insuranceName, setInsuranceName] = useState('')
  const [insuranceType, setInsuranceType] = useState('')
  const [mealsPerDay, setMealsPerDay] = useState(3)
  const [customComponent, setCustomComponent] = useState('')
  const [enabledComponents, setEnabledComponents] = useState<string[]>(DEFAULT_FOOD_COMPONENTS.hund)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setSpecies(existing.species)
      setPhotoUrl(existing.photoUrl)
      setName(existing.name)
      setWeightKg(String(existing.weightKg))
      setGender(existing.gender)
      setBreed(existing.breed)
      setNeutered(existing.neutered ? 'ja' : 'nein')
      setChipNumber(existing.chipNumber ?? '')
      setInsuranceNumber(existing.insuranceNumber ?? '')
      setInsuranceName(existing.insuranceName ?? '')
      setInsuranceType(existing.insuranceType ?? '')
      setMealsPerDay(existing.mealsPerDay)
      setEnabledComponents(existing.enabledFoodComponents)
    }
  }, [existing])

  // Switching species (only relevant when creating) resets suggested components.
  function handleSpeciesChange(next: PetSpecies) {
    setSpecies(next)
    if (!isEdit) setEnabledComponents(DEFAULT_FOOD_COMPONENTS[next])
  }

  function toggleComponent(comp: string) {
    setEnabledComponents((cur) => (cur.includes(comp) ? cur.filter((c) => c !== comp) : [...cur, comp]))
  }

  function addCustomComponent() {
    const trimmed = customComponent.trim()
    if (trimmed && !enabledComponents.includes(trimmed)) {
      setEnabledComponents((cur) => [...cur, trimmed])
    }
    setCustomComponent('')
  }

  const allComponentOptions = useMemo(() => {
    const base = DEFAULT_FOOD_COMPONENTS[species]
    const extra = enabledComponents.filter((c) => !base.includes(c))
    return [...base, ...extra]
  }, [species, enabledComponents])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    if (!name.trim() || !weightKg || !breed.trim() || neutered === '') {
      setError('Bitte alle Pflichtfelder ausfüllen.')
      return
    }
    if (enabledComponents.length === 0) {
      setError('Bitte mindestens eine Futterkomponente auswählen.')
      return
    }
    setSaving(true)
    try {
      const payload: Omit<Pet, 'id' | 'ownerId' | 'createdAt'> = {
        species,
        photoUrl,
        name: name.trim(),
        weightKg: Number(weightKg),
        gender,
        breed: breed.trim(),
        neutered: neutered === 'ja',
        chipNumber: chipNumber.trim() || undefined,
        insuranceNumber: insuranceNumber.trim() || undefined,
        insuranceName: insuranceName.trim() || undefined,
        insuranceType: insuranceType.trim() || undefined,
        mealsPerDay,
        enabledFoodComponents: enabledComponents,
      }
      if (isEdit && id) {
        await updatePet(id, payload)
      } else {
        await createPet(petId, payload)
      }
      navigate('/log')
    } catch {
      setError('Speichern fehlgeschlagen. Bitte erneut versuchen.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!id) return
    if (!confirm(`${existing?.name} und alle zugehörigen Protokolle wirklich löschen?`)) return
    await deletePet(id)
    navigate('/pets')
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <PageTitle>{isEdit ? `${existing?.name ?? 'Tier'} bearbeiten` : 'Neues Haustier anlegen'}</PageTitle>
      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <Card className="space-y-4">
          <h2 className="font-semibold text-brand-700">Stammdaten (Pflichtfelder)</h2>

          <Field label="Tierart *">
            <div className="flex gap-2">
              {SPECIES.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSpeciesChange(s)}
                  className={`flex-1 rounded-lg border-2 px-3 py-2 text-sm font-medium capitalize transition ${
                    species === s
                      ? 'border-brand-600 bg-brand-600 text-white'
                      : 'border-neutral-200 text-neutral-600 hover:border-brand-300'
                  }`}
                >
                  {SPECIES_LABELS[s]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Foto *">
            <PhotoCapture
              label="Foto aufnehmen"
              photoUrl={photoUrl}
              storagePath={`pet-photos/${user!.uid}/${petId}/profile.jpg`}
              onUploaded={setPhotoUrl}
              onRemove={() => setPhotoUrl(null)}
            />
          </Field>

          <Field label="Name *">
            <Input required value={name} onChange={(e) => setName(e.target.value)} />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Gewicht (kg) *">
              <Input type="number" step="0.1" min="0" required value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
            </Field>
            <Field label="Geschlecht *">
              <Select value={gender} onChange={(e) => setGender(e.target.value as PetGender)}>
                <option value="weiblich">weiblich</option>
                <option value="maennlich">männlich</option>
                <option value="unbekannt">unbekannt</option>
              </Select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Rasse *">
              <Input required value={breed} onChange={(e) => setBreed(e.target.value)} />
            </Field>
            <Field label="Kastriert *">
              <Select value={neutered} onChange={(e) => setNeutered(e.target.value as 'ja' | 'nein')}>
                <option value="" disabled>
                  Bitte wählen
                </option>
                <option value="ja">Ja</option>
                <option value="nein">Nein</option>
              </Select>
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-brand-700">Zusatzangaben (optional)</h2>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chipnummer">
              <Input value={chipNumber} onChange={(e) => setChipNumber(e.target.value)} />
            </Field>
            <Field label="Versicherungsnummer">
              <Input value={insuranceNumber} onChange={(e) => setInsuranceNumber(e.target.value)} />
            </Field>
            <Field label="Name der Versicherung">
              <Input value={insuranceName} onChange={(e) => setInsuranceName(e.target.value)} />
            </Field>
            <Field label="Art der Versicherung">
              <Input placeholder="z.B. Kranken-, OP-Versicherung" value={insuranceType} onChange={(e) => setInsuranceType(e.target.value)} />
            </Field>
          </div>
        </Card>

        <Card className="space-y-4">
          <h2 className="font-semibold text-brand-700">App-Einstellungen</h2>
          <Field label="Mahlzeiten pro Tag" hint="2-5, bestimmt die Spalten im Tagesprotokoll">
            <Select value={mealsPerDay} onChange={(e) => setMealsPerDay(Number(e.target.value))}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Futterkomponenten" hint="Nur ausgewählte Komponenten erscheinen im Tagesprotokoll-Dropdown">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-3">
              {allComponentOptions.map((comp) => (
                <Checkbox
                  key={comp}
                  label={comp}
                  checked={enabledComponents.includes(comp)}
                  onChange={() => toggleComponent(comp)}
                />
              ))}
            </div>
            <div className="mt-3 flex gap-2">
              <Input
                placeholder="Eigene Komponente hinzufügen"
                value={customComponent}
                onChange={(e) => setCustomComponent(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addCustomComponent()
                  }
                }}
              />
              <Button type="button" variant="secondary" onClick={addCustomComponent}>
                Hinzufügen
              </Button>
            </div>
          </Field>
        </Card>

        <ErrorText>{error}</ErrorText>

        <div className="flex items-center justify-between">
          <Button type="submit" disabled={saving}>
            {saving ? 'Speichert…' : 'Speichern'}
          </Button>
          {isEdit && (
            <Button type="button" variant="danger" onClick={handleDelete}>
              Haustier löschen
            </Button>
          )}
        </div>
      </form>
    </div>
  )
}
