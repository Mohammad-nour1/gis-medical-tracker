export const designTokens = {
  color: {
    surface: 'rgba(255, 255, 255, 0.08)',
    surfaceStrong: 'rgba(8, 24, 38, 0.72)',
    surfaceMuted: '#07131f',
    border: 'rgba(148, 210, 230, 0.22)',
    text: '#e8f4f8',
    textMuted: '#8fb4c4',
    statusGreen: '#2dd4a0',
    statusRed: '#ff5c7a',
    ambulanceAvailable: '#38bdf8',
    ambulanceDispatched: '#fbbf24',
    dangerSurface: 'rgba(255, 92, 122, 0.14)',
    dangerBorder: 'rgba(255, 92, 122, 0.35)',
    dangerText: '#ffb0bf',
    successSurface: 'rgba(45, 212, 160, 0.14)',
    successBorder: 'rgba(45, 212, 160, 0.35)',
    successText: '#9af0d0',
    warningText: '#fde68a',
    accent: '#14b8a6',
    accentSecondary: '#0ea5e9',
    success: '#14b8a6',
    markerBorder: 'rgba(255, 255, 255, 0.92)',
    ink: '#03141c',
    pageBackground: '#07131f'
  },
  radius: {
    panel: '1.25rem',
    control: '0.85rem'
  },
  map: {
    centerLatitude: 34.8021,
    centerLongitude: 38.9968,
    zoom: 6,
    minZoom: 5,
    maxZoom: 12,
    facilityMarkerSize: 16,
    ambulanceMarkerSize: 13,
    clusterRadius: 55,
    clusterSizeLarge: 46,
    clusterSizeSmall: 38,
    motionMsEnRoute: 2200,
    motionMsIdle: 900
  }
} as const

export type DesignColor = (typeof designTokens.color)[keyof typeof designTokens.color]

export function withAlpha(hexOrRgba: string, alpha: number): string {
  if (hexOrRgba.startsWith('#')) {
    const hex = hexOrRgba.slice(1)
    const full = hex.length === 3
      ? hex.split('').map(char => char + char).join('')
      : hex
    const value = Number.parseInt(full, 16)
    const red = (value >> 16) & 255
    const green = (value >> 8) & 255
    const blue = value & 255
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`
  }

  const match = hexOrRgba.match(/rgba?\(([^)]+)\)/i)
  if (!match) return hexOrRgba
  const [red, green, blue] = match[1].split(',').map(part => part.trim())
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`
}
