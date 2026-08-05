import { Server as SocketServer } from 'socket.io'
import { PostgresFacilityRepository } from '../../infrastructure/database/PostgresFacilityRepository'
import { PostgresAmbulanceRepository } from '../../infrastructure/database/PostgresAmbulanceRepository'
import { PostgresOccupancySnapshotRepository } from '../../infrastructure/database/PostgresOccupancySnapshotRepository'
import { PostgresRouteAssignmentRepository } from '../../infrastructure/database/PostgresRouteAssignmentRepository'
import { PostgresAmbulanceLocationSnapshotRepository } from '../../infrastructure/database/PostgresAmbulanceLocationSnapshotRepository'
import { PostGISDistanceCalculator } from '../../infrastructure/database/PostGISDistanceCalculator'
import { SocketIOBroadcaster } from '../../infrastructure/realtime/SocketIOBroadcaster'

import { CalculateAvailableBeds } from '../../core/use-cases/CalculateAvailableBeds'
import { EvaluateOccupancyStatus, DefaultOccupancyThresholdStrategy } from '../../core/use-cases/EvaluateOccupancyStatus'
import { FindNearestAmbulance } from '../../core/use-cases/FindNearestAmbulance'
import { AssignRouteAndDispatch } from '../../core/use-cases/AssignRouteAndDispatch'
import { ProcessFacilityMonitoringCycle } from '../../core/use-cases/ProcessFacilityMonitoringCycle'
import { ManualDispatchAmbulance } from '../../core/use-cases/ManualDispatchAmbulance'
import { RunSimulationTick } from '../../core/use-cases/RunSimulationTick'
import { CryptoIdGenerator } from '../../core/ports/IdGenerator'

export function createApplicationContainer(io: SocketServer) {
  const facilityRepository = new PostgresFacilityRepository()
  const ambulanceRepository = new PostgresAmbulanceRepository()
  const occupancySnapshotRepository = new PostgresOccupancySnapshotRepository()
  const ambulanceLocationSnapshotRepository = new PostgresAmbulanceLocationSnapshotRepository()
  const routeAssignmentRepository = new PostgresRouteAssignmentRepository()
  const geoDistanceCalculator = new PostGISDistanceCalculator()
  const realtimeBroadcaster = new SocketIOBroadcaster(io)
  const idGenerator = new CryptoIdGenerator()

  const calculateAvailableBeds = new CalculateAvailableBeds()
  const evaluateOccupancyStatus = new EvaluateOccupancyStatus(new DefaultOccupancyThresholdStrategy())
  const findNearestAmbulance = new FindNearestAmbulance(ambulanceRepository, geoDistanceCalculator)
  const assignRouteAndDispatch = new AssignRouteAndDispatch(
    routeAssignmentRepository,
    ambulanceRepository,
    realtimeBroadcaster,
    idGenerator
  )

  const processFacilityMonitoringCycle = new ProcessFacilityMonitoringCycle(
    facilityRepository,
    occupancySnapshotRepository,
    calculateAvailableBeds,
    evaluateOccupancyStatus,
    findNearestAmbulance,
    assignRouteAndDispatch,
    realtimeBroadcaster,
    idGenerator
  )

  const manualDispatchAmbulance = new ManualDispatchAmbulance(
    facilityRepository,
    ambulanceRepository,
    assignRouteAndDispatch
  )

  const runSimulationTick = new RunSimulationTick(
    facilityRepository,
    ambulanceRepository,
    ambulanceLocationSnapshotRepository,
    processFacilityMonitoringCycle,
    realtimeBroadcaster,
    idGenerator
  )

  return {
    facilityRepository,
    ambulanceRepository,
    occupancySnapshotRepository,
    ambulanceLocationSnapshotRepository,
    routeAssignmentRepository,
    processFacilityMonitoringCycle,
    manualDispatchAmbulance,
    runSimulationTick
  }
}

export type ApplicationContainer = ReturnType<typeof createApplicationContainer>
