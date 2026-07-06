import type { PetSpecies } from '../types'

// Vorschlagslisten je Tierart. Nutzer können im Profil zusätzlich eigene
// Komponenten hinzufügen - siehe `enabledFoodComponents` auf dem Pet.
export const DEFAULT_FOOD_COMPONENTS: Record<PetSpecies, string[]> = {
  hund: [
    'Trockenfutter',
    'Nassfutter',
    'Rohfleisch (BARF)',
    'Innereien',
    'Gemüse',
    'Obst',
    'Reis',
    'Nudeln',
    'Kartoffeln',
    'Leckerli',
    'Kausnack',
    'Ergänzungsfutter',
    'Öl',
  ],
  katze: [
    'Trockenfutter',
    'Nassfutter',
    'Rohfleisch (BARF)',
    'Innereien',
    'Leckerli',
    'Ergänzungsfutter',
    'Katzengras',
    'Öl',
  ],
  pferd: [
    'Heu',
    'Heulage',
    'Stroh',
    'Hafer',
    'Müsli',
    'Pellets',
    'Mineralfutter',
    'Möhren',
    'Äpfel',
    'Öl',
    'Ergänzungsfutter',
  ],
}

export const SPECIES_LABELS: Record<PetSpecies, string> = {
  hund: 'Hund',
  katze: 'Katze',
  pferd: 'Pferd',
}
