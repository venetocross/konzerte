export type PetSpecies = 'hund' | 'katze' | 'pferd'
export type PetGender = 'maennlich' | 'weiblich' | 'unbekannt'

export interface Pet {
  id: string
  ownerId: string
  species: PetSpecies
  name: string
  photoUrl: string | null
  weightKg: number
  gender: PetGender
  breed: string
  neutered: boolean
  // Optional fields
  chipNumber?: string
  insuranceNumber?: string
  insuranceName?: string
  insuranceType?: string
  // App configuration for this pet
  mealsPerDay: number // 2-5
  enabledFoodComponents: string[]
  createdAt: number
}

export interface MealEntry {
  index: number
  totalAmount: string // e.g. "150 g" - free text so it works for kg/g/Portionen
  photoUrl: string | null
  components: string[]
}

export interface ExcrementEntry {
  photoUrl: string
  takenAt: number
}

export interface DailyLog {
  id: string // YYYY-MM-DD
  petId: string
  date: string // YYYY-MM-DD
  meals: MealEntry[]
  excrements: ExcrementEntry[]
  updatedAt: number
}
