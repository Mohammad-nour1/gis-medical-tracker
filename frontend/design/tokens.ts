export const designTokens = {
  color: {
    surface: '#ffffff',
    surfaceMuted: '#f1f5f9',
    border: '#e2e8f0',
    text: '#0f172a',
    textMuted: '#64748b',
    statusGreen: '#16a34a',
    statusRed: '#dc2626',
    ambulanceAvailable: '#2563eb',
    ambulanceDispatched: '#ea580c',
    dangerSurface: '#fef2f2',
    dangerBorder: '#fecaca',
    dangerText: '#b91c1c',
    successSurface: '#ecfdf5',
    successBorder: '#a7f3d0',
    successText: '#047857',
    accent: '#0f172a',
    success: '#047857'
  },
  radius: {
    panel: '0.75rem',
    control: '0.5rem'
  },
  map: {
    centerLatitude: 34.8021,
    centerLongitude: 38.9968,
    zoom: 6,
    minZoom: 5,
    maxZoom: 12,
    facilityMarkerSize: 14,
    ambulanceMarkerSize: 12
  }
} as const
