export const designTokens = {
  color: {
    surface: 'rgba(255, 255, 255, 0.72)',
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
    accent: '#14b8a6',
    success: '#14b8a6'
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
    ambulanceMarkerSize: 13
  }
} as const
