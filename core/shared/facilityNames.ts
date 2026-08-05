const FACILITY_NAME_ALIASES: Record<string, string> = {
  'مشفى دمشق المركزي': 'Damascus Central Hospital',
  'مشفى حلب الجامعي': 'Aleppo University Hospital',
  'مشفى اللاذقية الوطني': 'Latakia National Hospital',
  'مستوصف باب توما': 'Bab Tuma Clinic'
}

const ARABIC_SCRIPT = /[\u0600-\u06FF]/

export function normalizeFacilityName(value: string): string {
  const trimmed = value.normalize('NFC').replace(/\s+/g, ' ').trim()
  return FACILITY_NAME_ALIASES[trimmed] ?? trimmed
}

export function isArabicLabel(value: string): boolean {
  return ARABIC_SCRIPT.test(value)
}
