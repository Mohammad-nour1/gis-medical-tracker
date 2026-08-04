'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import { GeoMedStreamProvider, useGeoMedConnectionStatus, useGeoMedStreamEvents } from 'react-med-geo-streamer'
import { FacilityFilters } from '../features/filters/FacilityFilters'
import { AlertsPanel } from '../features/alerts/AlertsPanel'
import { TimeMachinePicker } from '../features/time-machine/TimeMachinePicker'
import { ManualDispatchPanel } from '../features/dispatch/ManualDispatchPanel'
import { MapLegend } from '../features/map/MapLegend'
import {
  ApiClientError,
  fetchAmbulances,
  fetchFacilities,
  fetchHistorySnapshot,
  runMonitoringCycle,
  startSimulation,
  stopSimulation,
  triggerSimulationTick
} from '../state/apiClient'
import {
  AmbulanceRecord,
  FacilityFilterState,
  FacilityRecord,
  HistoryBundleRecord
} from '../types/records'

const SyriaMap = dynamic(
  () => import('../features/map/SyriaMap').then(module => module.SyriaMap),
  {
    ssr: false,
    loading: () => <div className="map-shell map-loading">Loading map...</div>
  }
)

const defaultFilter: FacilityFilterState = {
  type: 'all',
  governorate: 'all',
  status: 'all',
  ambulanceStatus: 'all'
}

function resolveSocketUrl(): string {
  if (typeof window === 'undefined') return ''
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? window.location.origin
}

function resolveUserMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiClientError) return error.message
  if (error instanceof Error && error.message) return error.message
  return fallback
}

function DashboardBody() {
  const [filter, setFilter] = useState<FacilityFilterState>(defaultFilter)
  const [facilities, setFacilities] = useState<FacilityRecord[]>([])
  const [ambulances, setAmbulances] = useState<AmbulanceRecord[]>([])
  const [timeMachineValue, setTimeMachineValue] = useState('')
  const [isHistoricalView, setIsHistoricalView] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [simulationRunning, setSimulationRunning] = useState(false)
  const [isBusy, setIsBusy] = useState(false)

  const connectionStatus = useGeoMedConnectionStatus()
  const simulationTicks = useGeoMedStreamEvents('simulation-tick')
  const latestTickId = simulationTicks[0]?.id

  const governorates = useMemo(
    () => Array.from(new Set(facilities.map(facility => facility.governorate))).sort(),
    [facilities]
  )

  const stats = useMemo(() => {
    const red = facilities.filter(facility => facility.status === 'RED').length
    const green = facilities.filter(facility => facility.status === 'GREEN').length
    const available = ambulances.filter(ambulance => ambulance.status === 'available').length
    const dispatched = ambulances.filter(ambulance => ambulance.status === 'dispatched').length
    return { red, green, available, dispatched }
  }, [facilities, ambulances])

  const refreshData = useCallback(async () => {
    setErrorMessage(null)
    try {
      const [nextFacilities, nextAmbulances] = await Promise.all([
        fetchFacilities(filter),
        fetchAmbulances(filter.ambulanceStatus)
      ])
      setFacilities(nextFacilities)
      setAmbulances(nextAmbulances)
    } catch (error) {
      setErrorMessage(resolveUserMessage(error, 'Failed to load dashboard data'))
    }
  }, [filter])

  useEffect(() => {
    if (isHistoricalView) return
    refreshData()
  }, [refreshData, isHistoricalView])

  useEffect(() => {
    if (!latestTickId || isHistoricalView) return
    refreshData()
  }, [latestTickId, isHistoricalView, refreshData])

  async function applyHistoricalView() {
    if (!timeMachineValue) {
      setErrorMessage('Select a date and time first')
      return
    }
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsBusy(true)
    try {
      const timestamp = new Date(timeMachineValue).toISOString()
      const history = await fetchHistorySnapshot(timestamp)
      if (!history || Array.isArray(history) || !('occupancySnapshots' in history)) {
        setErrorMessage('No historical snapshots found for the selected time')
        return
      }
      const bundle = history as HistoryBundleRecord
      if (bundle.occupancySnapshots.length === 0) {
        setErrorMessage('No occupancy history found for the selected time')
        return
      }

      const occupancyMap = new Map(bundle.occupancySnapshots.map(snapshot => [snapshot.facilityId, snapshot]))
      setFacilities(current =>
        current.map(facility => {
          const snapshot = occupancyMap.get(facility.id)
          if (!snapshot) return facility
          return {
            ...facility,
            occupiedBeds: snapshot.occupiedBeds,
            totalBeds: snapshot.totalBeds,
            status: snapshot.status
          }
        })
      )

      const ambulanceMap = new Map(bundle.ambulanceSnapshots.map(snapshot => [snapshot.ambulanceId, snapshot]))
      setAmbulances(current =>
        current.map(ambulance => {
          const snapshot = ambulanceMap.get(ambulance.id)
          if (!snapshot) return ambulance
          return {
            ...ambulance,
            location: snapshot.location,
            status: snapshot.status
          }
        })
      )

      setIsHistoricalView(true)
      setSuccessMessage('Historical snapshot loaded')
    } catch (error) {
      setErrorMessage(resolveUserMessage(error, 'Failed to load historical snapshot'))
    } finally {
      setIsBusy(false)
    }
  }

  async function resetHistoricalView() {
    setIsHistoricalView(false)
    setSuccessMessage(null)
    await refreshData()
  }

  async function handleSimulationTick() {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsBusy(true)
    try {
      const result = await triggerSimulationTick()
      setSuccessMessage(`Simulation tick processed ${result.processedCount} facilities`)
    } catch (error) {
      setErrorMessage(resolveUserMessage(error, 'Simulation tick failed'))
    } finally {
      setIsBusy(false)
    }
  }

  async function toggleSimulation() {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsBusy(true)
    try {
      if (simulationRunning) {
        await stopSimulation()
        setSimulationRunning(false)
        setSuccessMessage('Simulation stopped')
        return
      }
      await startSimulation(5000)
      setSimulationRunning(true)
      setSuccessMessage('Simulation started')
    } catch (error) {
      setErrorMessage(resolveUserMessage(error, 'Simulation control failed'))
    } finally {
      setIsBusy(false)
    }
  }

  async function handleMonitoringRun() {
    setErrorMessage(null)
    setSuccessMessage(null)
    setIsBusy(true)
    try {
      const result = await runMonitoringCycle()
      await refreshData()
      setSuccessMessage(`Monitoring processed ${result.processedCount} facilities`)
    } catch (error) {
      setErrorMessage(resolveUserMessage(error, 'Monitoring cycle failed'))
    } finally {
      setIsBusy(false)
    }
  }

  return (
    <div className="dashboard-shell">
      <header className="dashboard-header">
        <div className="dashboard-header-inner">
          <div className="brand-row">
            <div className="brand-mark" aria-hidden="true" />
            <div className="min-w-0">
              <h1 className="dashboard-title">GIS Medical Dashboard</h1>
              <p className="dashboard-subtitle">Syria health sector real-time monitoring</p>
              <span className="live-chip">
                {isHistoricalView ? 'Historical mode' : 'Live feed'} · {connectionStatus}
              </span>
            </div>
          </div>
          <div className="dashboard-actions">
            <div className="action-group">
              <button type="button" className="btn btn-secondary" disabled={isBusy} onClick={handleMonitoringRun}>
                Run Monitoring
              </button>
              <span className="action-hint">Apply flowchart once on current facilities</span>
            </div>
            <div className="action-group">
              <button type="button" className="btn btn-secondary" disabled={isBusy} onClick={handleSimulationTick}>
                Simulation Tick
              </button>
              <span className="action-hint">One fake occupancy update + monitor</span>
            </div>
            <div className="action-group">
              <button type="button" className="btn btn-primary" disabled={isBusy} onClick={toggleSimulation}>
                {simulationRunning ? 'Stop Simulation' : 'Start Simulation'}
              </button>
              <span className="action-hint">
                {simulationRunning ? 'Stop the auto live feed loop' : 'Auto-run ticks every few seconds'}
              </span>
            </div>
          </div>
        </div>
      </header>

      <div className="stats-strip">
        <article className="stat-card">
          <p className="stat-label">Critical RED</p>
          <p className="stat-value stat-red">{stats.red}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Stable GREEN</p>
          <p className="stat-value stat-green">{stats.green}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Available units</p>
          <p className="stat-value stat-cyan">{stats.available}</p>
        </article>
        <article className="stat-card">
          <p className="stat-label">Dispatched</p>
          <p className="stat-value stat-amber">{stats.dispatched}</p>
        </article>
      </div>

      <main className="dashboard-main">
        <div className="dashboard-primary">
          <FacilityFilters filter={filter} governorates={governorates} onChange={setFilter} />
          {errorMessage && <p className="alert-error" role="alert">{errorMessage}</p>}
          {successMessage && <p className="alert-success" role="status">{successMessage}</p>}
          <section className="panel !p-0 overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-4 pt-4 pb-3">
              <h2 className="panel-title mb-0">Operations Map</h2>
              {isHistoricalView ? (
                <span className="historical-badge">Snapshot view</span>
              ) : (
                <span className="status-pill" data-state={connectionStatus}>{connectionStatus}</span>
              )}
            </div>
            <div className="map-frame border-0 rounded-none shadow-none">
              <MapLegend />
              <SyriaMap facilities={facilities} ambulances={ambulances} historicalMode={isHistoricalView} />
            </div>
          </section>
        </div>

        <aside className="dashboard-aside">
          <AlertsPanel />
          <TimeMachinePicker
            value={timeMachineValue}
            onChange={setTimeMachineValue}
            onApply={applyHistoricalView}
            onReset={resetHistoricalView}
            isActive={isHistoricalView}
          />
          <ManualDispatchPanel
            facilities={facilities}
            ambulances={ambulances}
            onDispatched={refreshData}
          />
        </aside>
      </main>
    </div>
  )
}

export function MedicalDashboard() {
  return (
    <GeoMedStreamProvider config={{ serverUrl: resolveSocketUrl() }}>
      <DashboardBody />
    </GeoMedStreamProvider>
  )
}
