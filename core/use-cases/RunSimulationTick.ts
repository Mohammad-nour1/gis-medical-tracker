import { FacilityRepository } from '../ports/FacilityRepository'
import { AmbulanceRepository } from '../ports/AmbulanceRepository'
import { AmbulanceLocationSnapshotRepository } from '../ports/AmbulanceLocationSnapshotRepository'
import { ScenarioGenerator } from '../simulation/ScenarioGenerator'
import { ProcessFacilityMonitoringCycle } from './ProcessFacilityMonitoringCycle'
import { RealtimeBroadcaster } from '../ports/RealtimeBroadcaster'
import { NotFoundError } from '../errors/AppError'
import { AmbulanceLocationSnapshot } from '../entities/AmbulanceLocationSnapshot'
import { IdGenerator } from '../ports/IdGenerator'
import { Ambulance } from '../entities/Ambulance'
import { Coordinates } from '../entities/Facility'

export type SimulationTickResult = {
  processedCount: number
  emergencyFacilityId: string | null
  movedAmbulanceIds: string[]
}

function distanceSquared(left: Coordinates, right: Coordinates): number {
  const deltaLatitude = left.latitude - right.latitude
  const deltaLongitude = left.longitude - right.longitude
  return deltaLatitude * deltaLatitude + deltaLongitude * deltaLongitude
}

function pickNearestAmbulances(ambulances: Ambulance[], target: Coordinates, limit: number): Ambulance[] {
  return [...ambulances]
    .sort((left, right) => distanceSquared(left.location, target) - distanceSquared(right.location, target))
    .slice(0, limit)
}

export class RunSimulationTick {
  constructor(
    private readonly facilityRepository: FacilityRepository,
    private readonly ambulanceRepository: AmbulanceRepository,
    private readonly ambulanceLocationSnapshotRepository: AmbulanceLocationSnapshotRepository,
    private readonly processFacilityMonitoringCycle: ProcessFacilityMonitoringCycle,
    private readonly realtimeBroadcaster: RealtimeBroadcaster,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(): Promise<SimulationTickResult> {
    const facilities = await this.facilityRepository.findAll()
    if (facilities.length === 0) {
      return { processedCount: 0, emergencyFacilityId: null, movedAmbulanceIds: [] }
    }

    const facilityIds = facilities.map(facility => facility.id)
    const emergency = ScenarioGenerator.createRandomEmergency(facilityIds)
    const targetFacility = await this.facilityRepository.findById(emergency.facilityId)

    if (!targetFacility) {
      throw new NotFoundError('Facility', emergency.facilityId)
    }

    const nextOccupied = Math.min(
      targetFacility.totalBeds,
      targetFacility.occupiedBeds + emergency.occupiedBedsIncrease
    )

    await this.facilityRepository.updateOccupiedBeds(targetFacility.id, nextOccupied)

    const movedAmbulanceIds: string[] = []
    const ambulances = await this.ambulanceRepository.findAll()
    const available = ambulances.filter(ambulance => ambulance.status === 'available')
    const responding = pickNearestAmbulances(available, targetFacility.location, 2)
    const respondingIds = new Set(responding.map(ambulance => ambulance.id))
    const recordedAt = new Date()

    for (const ambulance of ambulances) {
      const movement = respondingIds.has(ambulance.id)
        ? ScenarioGenerator.createDirectedMovement(
          ambulance.id,
          ambulance.location,
          targetFacility.location,
          0.055
        )
        : ScenarioGenerator.createIncrementalMovement(ambulance.id, ambulance.location)

      await this.ambulanceRepository.updateLocation(ambulance.id, movement.newLocation)
      movedAmbulanceIds.push(ambulance.id)

      await this.ambulanceLocationSnapshotRepository.record(
        new AmbulanceLocationSnapshot(
          this.idGenerator.generate(),
          ambulance.id,
          movement.newLocation,
          ambulance.status,
          recordedAt
        )
      )

      await this.realtimeBroadcaster.broadcast('medical-stream', 'ambulance-location', {
        ambulanceId: ambulance.id,
        location: movement.newLocation,
        headingDeg: movement.headingDeg,
        targetFacilityId: respondingIds.has(ambulance.id) ? targetFacility.id : null
      })
    }

    const updatedFacilities = await this.facilityRepository.findAll()

    for (const facility of updatedFacilities) {
      await this.processFacilityMonitoringCycle.execute(facility)
    }

    await this.realtimeBroadcaster.broadcast('medical-stream', 'simulation-tick', {
      processedCount: updatedFacilities.length,
      triggeredAt: new Date().toISOString(),
      emergencyFacilityId: targetFacility.id,
      emergencyFacilityName: targetFacility.name,
      occupiedBedsIncrease: emergency.occupiedBedsIncrease
    })

    return {
      processedCount: updatedFacilities.length,
      emergencyFacilityId: targetFacility.id,
      movedAmbulanceIds
    }
  }
}
