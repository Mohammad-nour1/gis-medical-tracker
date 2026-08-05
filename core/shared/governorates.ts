const GOVERNORATE_ALIASES: Record<string, string> = {
  دمشق: 'Damascus',
  حلب: 'Aleppo',
  حمص: 'Homs',
  حماة: 'Hama',
  اللاذقية: 'Latakia',
  طرطوس: 'Tartus',
  إدلب: 'Idlib',
  ادلب: 'Idlib',
  درعا: 'Daraa',
  السويداء: 'Sweida',
  سويداء: 'Sweida',
  القنيطرة: 'Quneitra',
  قنيطرة: 'Quneitra',
  الرقة: 'Raqqa',
  ديرالزور: 'Deir ez-Zor',
  'دير الزور': 'Deir ez-Zor',
  الحسكة: 'Hasakah',
  حسكة: 'Hasakah',
  'ريف دمشق': 'Rural Damascus'
}

export function normalizeGovernorate(value: string): string {
  const trimmed = value.trim()
  return GOVERNORATE_ALIASES[trimmed] ?? trimmed
}

export function governorateMatchValues(value: string): string[] {
  const normalized = normalizeGovernorate(value)
  const aliases = Object.entries(GOVERNORATE_ALIASES)
    .filter(([, english]) => english === normalized)
    .map(([arabic]) => arabic)
  return Array.from(new Set([normalized, value.trim(), ...aliases]))
}
