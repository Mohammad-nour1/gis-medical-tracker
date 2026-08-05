import { Facility } from '../entities/Facility'
import { FacilityRepository } from '../ports/FacilityRepository'
import { OccupancySnapshotRepository } from '../ports/OccupancySnapshotRepository'
import { OccupancySnapshot } from '../entities/OccupancySnapshot'
import { CalculateAvailableBeds } from './CalculateAvailableBeds'
import { EvaluateOccupancyStatus } from './EvaluateOccupancyStatus'
import { FindNearestAmbulance } from './FindNearestAmbulance'
import { AssignRouteAndDispatch } from './AssignRouteAndDispatch'
import { RealtimeBroadcaster } from '../ports/RealtimeBroadcaster'
import { IdGenerator } from '../ports/IdGenerator'

export class ProcessFacilityMonitoringCycle {
  constructor(
    private readonly facilityRepository: FacilityRepository,
    private readonly occupancySnapshotRepository: OccupancySnapshotRepository,
    private readonly calculateAvailableBeds: CalculateAvailableBeds,
    private readonly evaluateOccupancyStatus: EvaluateOccupancyStatus,
    private readonly findNearestAmbulance: FindNearestAmbulance,
    private readonly assignRouteAndDispatch: AssignRouteAndDispatch,
    private readonly realtimeBroadcaster: RealtimeBroadcaster,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(facility: Facility): Promise<void> {
    const previousStatus = facility.status
    const availableBeds = this.calculateAvailableBeds.execute(facility)
    const status = this.evaluateOccupancyStatus.execute(facility, availableBeds)
    await this.facilityRepository.updateStatus(facility.id, status)

    const updatedFacility = new Facility(
      facility.id,
      facility.name,
      facility.type,
      facility.governorate,
      facility.totalBeds,
      facility.occupiedBeds,
      facility.location,
      status
    )

    if (status === 'RED') {
      if (previousStatus !== 'RED') {
        await this.realtimeBroadcaster.broadcast('medical-stream', 'occupancy-critical', {
          facilityId: facility.id,
          facilityName: facility.name,
          availableBeds
        })
        const nearestAmbulance = await this.findNearestAmbulance.execute(updatedFacility)
        await this.assignRouteAndDispatch.execute(updatedFacility, nearestAmbulance)
      } else {
        await this.realtimeBroadcaster.broadcast('medical-stream', 'status-changed', {
          facilityId: facility.id,
          status,
          availableBeds
        })
      }
    } else {
      await this.assignRouteAndDispatch.execute(updatedFacility, null)
    }

    await this.occupancySnapshotRepository.record(
      new OccupancySnapshot(
        this.idGenerator.generate(),
        facility.id,
        facility.occupiedBeds,
        facility.totalBeds,
        status,
        new Date()
      )
    )
  }
}
