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

const ARABIC_SCRIPT = /[\u0600-\u06FF]/

export function normalizeGovernorate(value: string): string {
  const trimmed = value.normalize('NFC').replace(/\s+/g, ' ').trim()
  return GOVERNORATE_ALIASES[trimmed] ?? trimmed
}

export function uniqueGovernorateOptions(values: string[]): string[] {
  const normalized = values.map(normalizeGovernorate)
  return Array.from(new Set(normalized))
    .filter(value => value.length > 0 && !ARABIC_SCRIPT.test(value))
    .sort((left, right) => left.localeCompare(right))
}

export function governorateMatchValues(value: string): string[] {
  const normalized = normalizeGovernorate(value)
  const aliases = Object.entries(GOVERNORATE_ALIASES)
    .filter(([, english]) => english === normalized)
    .map(([arabic]) => arabic)
  return Array.from(new Set([normalized, value.trim(), ...aliases]))
}
