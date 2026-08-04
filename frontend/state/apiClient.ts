import {
  FacilityFilterState,
  FacilityRecord,
  AmbulanceRecord,
  OccupancySnapshotRecord,
  HistoryBundleRecord
} from '../types/records'

export class ApiClientError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message)
    this.name = 'ApiClientError'
  }
}

function toApiError(error: unknown, fallback: string): ApiClientError {
  if (error instanceof ApiClientError) return error
  if (error instanceof Error && error.message) return new ApiClientError(error.message, 0)
  return new ApiClientError(fallback, 0)
}

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = await response.json().catch(() => ({ message: response.statusText }))
    throw new ApiClientError(body.message ?? 'Request failed', response.status)
  }
  return response.json() as Promise<T>
}

export async function fetchFacilities(filter: FacilityFilterState): Promise<FacilityRecord[]> {
  try {
    const params = new URLSearchParams()
    if (filter.type !== 'all') params.set('type', filter.type)
    if (filter.governorate !== 'all') params.set('governorate', filter.governorate)
    if (filter.status !== 'all') params.set('status', filter.status)
    const query = params.toString()
    const response = await fetch(`/api/facilities${query ? `?${query}` : ''}`)
    return parseResponse<FacilityRecord[]>(response)
  } catch (error) {
    throw toApiError(error, 'Failed to load facilities')
  }
}

export async function fetchAmbulances(ambulanceStatus: FacilityFilterState['ambulanceStatus']): Promise<AmbulanceRecord[]> {
  try {
    if (ambulanceStatus === 'hidden') return []
    const params = new URLSearchParams()
    if (ambulanceStatus !== 'all') params.set('status', ambulanceStatus)
    const query = params.toString()
    const response = await fetch(`/api/ambulances${query ? `?${query}` : ''}`)
    return parseResponse<AmbulanceRecord[]>(response)
  } catch (error) {
    throw toApiError(error, 'Failed to load ambulances')
  }
}

export async function fetchHistorySnapshot(timestamp: string, facilityId?: string): Promise<OccupancySnapshotRecord | HistoryBundleRecord | null> {
  try {
    const params = new URLSearchParams({ timestamp })
    if (facilityId) params.set('facilityId', facilityId)
    const response = await fetch(`/api/history?${params.toString()}`)
    return parseResponse(response)
  } catch (error) {
    throw toApiError(error, 'Failed to load historical data')
  }
}

export async function triggerSimulationTick(): Promise<{ processedCount: number }> {
  try {
    const response = await fetch('/api/simulation/tick', { method: 'POST' })
    return parseResponse(response)
  } catch (error) {
    throw toApiError(error, 'Simulation tick failed')
  }
}

export async function startSimulation(intervalMs = 5000): Promise<void> {
  try {
    const response = await fetch('/api/simulation/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intervalMs })
    })
    await parseResponse(response)
  } catch (error) {
    throw toApiError(error, 'Failed to start simulation')
  }
}

export async function stopSimulation(): Promise<void> {
  try {
    const response = await fetch('/api/simulation/stop', { method: 'POST' })
    await parseResponse(response)
  } catch (error) {
    throw toApiError(error, 'Failed to stop simulation')
  }
}

export async function manualDispatch(facilityId: string, ambulanceId: string): Promise<void> {
  try {
    const response = await fetch('/api/dispatch/manual', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ facilityId, ambulanceId })
    })
    await parseResponse(response)
  } catch (error) {
    throw toApiError(error, 'Manual dispatch failed')
  }
}

export async function runMonitoringCycle(): Promise<{ processedCount: number }> {
  try {
    const response = await fetch('/api/monitoring/run', { method: 'POST' })
    return parseResponse(response)
  } catch (error) {
    throw toApiError(error, 'Monitoring cycle failed')
  }
}
