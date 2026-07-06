import { Link, useNavigate } from 'react-router-dom'
import { usePets } from '../contexts/PetContext'
import { Button, Card, PageTitle } from '../components/ui'
import { SPECIES_LABELS } from '../lib/foodComponents'

const SPECIES_EMOJI: Record<string, string> = { hund: '🐶', katze: '🐱', pferd: '🐴' }

export function PetListPage() {
  const { pets, loading, selectPet } = usePets()
  const navigate = useNavigate()

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="flex items-center justify-between">
        <PageTitle>Meine Haustiere</PageTitle>
        <Link to="/pets/new">
          <Button>+ Neues Haustier</Button>
        </Link>
      </div>

      {loading && <p className="mt-6 text-neutral-400">Lädt…</p>}

      {!loading && pets.length === 0 && (
        <Card className="mt-6 text-center text-neutral-500">
          Noch kein Haustier angelegt. Lege dein erstes Profil an, um mit dem Tracking zu starten.
        </Card>
      )}

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {pets.map((pet) => (
          <Card key={pet.id} className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => {
                selectPet(pet.id)
                navigate('/log')
              }}
              className="flex flex-1 items-center gap-4 text-left"
            >
              <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-brand-50 text-2xl">
                {pet.photoUrl ? <img src={pet.photoUrl} alt={pet.name} className="h-full w-full object-cover" /> : SPECIES_EMOJI[pet.species]}
              </div>
              <div>
                <p className="font-semibold text-neutral-900">{pet.name}</p>
                <p className="text-sm text-neutral-500">
                  {SPECIES_LABELS[pet.species]} · {pet.breed}
                </p>
              </div>
            </button>
            <Link to={`/pets/${pet.id}/edit`} className="text-sm text-brand-700 hover:underline">
              Bearbeiten
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
}
