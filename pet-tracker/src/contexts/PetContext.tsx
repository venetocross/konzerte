import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase'
import { useAuth } from './AuthContext'
import type { Pet } from '../types'

interface PetContextValue {
  pets: Pet[]
  loading: boolean
  selectedPetId: string | null
  selectedPet: Pet | null
  selectPet: (id: string) => void
  reservePetId: () => string
  createPet: (id: string, pet: Omit<Pet, 'id' | 'ownerId' | 'createdAt'>) => Promise<void>
  updatePet: (id: string, pet: Record<string, unknown>) => Promise<void>
  deletePet: (id: string) => Promise<void>
}

const PetContext = createContext<PetContextValue | undefined>(undefined)

const PETS_COLLECTION = 'pets'
const LAST_SELECTED_KEY = 'pfotenprotokoll:lastSelectedPetId'

export function PetProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPetId, setSelectedPetId] = useState<string | null>(
    () => localStorage.getItem(LAST_SELECTED_KEY)
  )

  useEffect(() => {
    if (!user) {
      setPets([])
      setLoading(false)
      return
    }
    setLoading(true)
    const q = query(
      collection(db, PETS_COLLECTION),
      where('ownerId', '==', user.uid),
      orderBy('createdAt', 'asc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Pet)
      setPets(list)
      setLoading(false)
    })
    return unsubscribe
  }, [user])

  useEffect(() => {
    if (selectedPetId && !pets.some((p) => p.id === selectedPetId)) {
      setSelectedPetId(pets[0]?.id ?? null)
    } else if (!selectedPetId && pets.length > 0) {
      setSelectedPetId(pets[0].id)
    }
  }, [pets, selectedPetId])

  const selectPet = (id: string) => {
    setSelectedPetId(id)
    localStorage.setItem(LAST_SELECTED_KEY, id)
  }

  const reservePetId = () => doc(collection(db, PETS_COLLECTION)).id

  const createPet: PetContextValue['createPet'] = async (id, pet) => {
    if (!user) throw new Error('Nicht angemeldet')
    await setDoc(doc(db, PETS_COLLECTION, id), {
      ...pet,
      ownerId: user.uid,
      createdAt: Date.now(),
    })
    selectPet(id)
  }

  const updatePet: PetContextValue['updatePet'] = async (id, pet) => {
    await updateDoc(doc(db, PETS_COLLECTION, id), pet)
  }

  const deletePet: PetContextValue['deletePet'] = async (id) => {
    await deleteDoc(doc(db, PETS_COLLECTION, id))
  }

  const selectedPet = useMemo(
    () => pets.find((p) => p.id === selectedPetId) ?? null,
    [pets, selectedPetId]
  )

  const value: PetContextValue = {
    pets,
    loading,
    selectedPetId,
    selectedPet,
    selectPet,
    reservePetId,
    createPet,
    updatePet,
    deletePet,
  }

  return <PetContext.Provider value={value}>{children}</PetContext.Provider>
}

export function usePets() {
  const ctx = useContext(PetContext)
  if (!ctx) throw new Error('usePets muss innerhalb von PetProvider verwendet werden')
  return ctx
}
