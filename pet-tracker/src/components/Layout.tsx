import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { usePets } from '../contexts/PetContext'
import { SPECIES_LABELS } from '../lib/foodComponents'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition ${
    isActive ? 'bg-brand-600 text-white' : 'text-neutral-600 hover:bg-brand-50 hover:text-brand-700'
  }`

export function Layout() {
  const { logout } = useAuth()
  const { pets, selectedPetId, selectPet } = usePets()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-full flex-col">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-3">
          <NavLink to="/log" className="flex items-center gap-2 text-lg font-bold text-brand-700">
            <span>🐾</span> Pfotenprotokoll
          </NavLink>

          {pets.length > 0 && (
            <select
              value={selectedPetId ?? ''}
              onChange={(e) => selectPet(e.target.value)}
              className="ml-0 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm sm:ml-4"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({SPECIES_LABELS[p.species]})
                </option>
              ))}
            </select>
          )}

          <nav className="ml-auto flex items-center gap-1">
            <NavLink to="/log" className={navLinkClass}>
              Tagesprotokoll
            </NavLink>
            <NavLink to="/protocols" className={navLinkClass}>
              Verlauf
            </NavLink>
            <NavLink to="/pets" className={navLinkClass}>
              Haustiere
            </NavLink>
            <button
              onClick={async () => {
                await logout()
                navigate('/login')
              }}
              className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-500 hover:bg-neutral-100"
            >
              Abmelden
            </button>
          </nav>
        </div>
      </header>
      <main className="flex-1 bg-neutral-50">
        <Outlet />
      </main>
    </div>
  )
}
