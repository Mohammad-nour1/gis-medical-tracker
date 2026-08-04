import { Express } from 'express'
import { ApplicationContainer } from '../createContainer'
import { asyncHandler } from '../middleware/errorHandler'
import {
  parseAmbulanceQuery,
  parseFacilityQuery,
  parseManualDispatchBody,
  parseSimulationStartBody,
  requireTimestamp
} from '../validation/requestValidation'
import {
  toAmbulanceDto,
  toAmbulanceLocationSnapshotDto,
  toFacilityDto,
  toOccupancySnapshotDto,
  toRouteAssignmentDto
} from '../dto/responseDtos'

let simulationInterval: NodeJS.Timeout | null = null

export function registerRoutes(app: Express, container: ApplicationContainer): void {
  app.get('/api/facilities', asyncHandler(async (request, response) => {
    const filter = parseFacilityQuery(request.query as Record<string, unknown>)
    const facilities = await container.facilityRepository.findWithFilters(filter)
    response.json(facilities.map(toFacilityDto))
  }))

  app.get('/api/ambulances', asyncHandler(async (request, response) => {
    const filter = parseAmbulanceQuery(request.query as Record<string, unknown>)
    const ambulances = await container.ambulanceRepository.findAll(
      filter.status ? { status: filter.status } : undefined
    )
    response.json(ambulances.map(toAmbulanceDto))
  }))

  app.get('/api/history', asyncHandler(async (request, response) => {
    const timestamp = requireTimestamp(request.query.timestamp)
    const facilityId = typeof request.query.facilityId === 'string' && request.query.facilityId.length > 0
      ? request.query.facilityId
      : undefined

    if (facilityId) {
      const snapshot = await container.occupancySnapshotRepository.findClosestTo(facilityId, timestamp)
      response.json(snapshot ? toOccupancySnapshotDto(snapshot) : null)
      return
    }

    const occupancySnapshots = await container.occupancySnapshotRepository.findAllClosestToTimestamp(timestamp)
    const ambulanceSnapshots = await container.ambulanceLocationSnapshotRepository.findAllClosestToTimestamp(timestamp)

    response.json({
      occupancySnapshots: occupancySnapshots.map(toOccupancySnapshotDto),
      ambulanceSnapshots: ambulanceSnapshots.map(toAmbulanceLocationSnapshotDto)
    })
  }))

  app.get('/api/monitoring/run', asyncHandler(async (_request, response) => {
    const processedCount = await runMonitoring(container)
    response.json({ processedCount })
  }))

  app.post('/api/monitoring/run', asyncHandler(async (_request, response) => {
    const processedCount = await runMonitoring(container)
    response.json({ processedCount })
  }))

  app.post('/api/simulation/tick', asyncHandler(async (_request, response) => {
    const result = await container.runSimulationTick.execute()
    response.json(result)
  }))

  app.post('/api/simulation/start', asyncHandler(async (request, response) => {
    const intervalMs = parseSimulationStartBody(request.body)
    stopSimulationLoop()
    simulationInterval = setInterval(() => {
      container.runSimulationTick.execute().catch(() => undefined)
    }, intervalMs)
    response.json({ started: true, intervalMs })
  }))

  app.post('/api/simulation/stop', asyncHandler(async (_request, response) => {
    stopSimulationLoop()
    response.json({ stopped: true })
  }))

  app.post('/api/dispatch/manual', asyncHandler(async (request, response) => {
    const payload = parseManualDispatchBody(request.body)
    const assignment = await container.manualDispatchAmbulance.execute(
      payload.facilityId,
      payload.ambulanceId
    )
    response.json(toRouteAssignmentDto(assignment))
  }))
}

async function runMonitoring(container: ApplicationContainer): Promise<number> {
  const facilities = await container.facilityRepository.findAll()
  for (const facility of facilities) {
    await container.processFacilityMonitoringCycle.execute(facility)
  }
  return facilities.length
}

function stopSimulationLoop(): void {
  if (simulationInterval) {
    clearInterval(simulationInterval)
    simulationInterval = null
  }
}
