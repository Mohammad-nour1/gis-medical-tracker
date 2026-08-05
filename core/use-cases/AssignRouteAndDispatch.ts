import { Facility } from '../entities/Facility'
import { Ambulance } from '../entities/Ambulance'
import { RouteAssignment } from '../entities/RouteAssignment'
import { RouteAssignmentRepository } from '../ports/RouteAssignmentRepository'
import { AmbulanceRepository } from '../ports/AmbulanceRepository'
import { RealtimeBroadcaster } from '../ports/RealtimeBroadcaster'
import { IdGenerator } from '../ports/IdGenerator'

export class AssignRouteAndDispatch {
  constructor(
    private readonly routeAssignmentRepository: RouteAssignmentRepository,
    private readonly ambulanceRepository: AmbulanceRepository,
    private readonly realtimeBroadcaster: RealtimeBroadcaster,
    private readonly idGenerator: IdGenerator
  ) {}

  async execute(facility: Facility, ambulance: Ambulance | null): Promise<RouteAssignment> {
    if (!ambulance) {
      const assignment = RouteAssignment.none(facility.id, facility.location, this.idGenerator)
      await this.routeAssignmentRepository.save(assignment)
      await this.realtimeBroadcaster.broadcast('medical-stream', 'status-changed', {
        facilityId: facility.id,
        status: facility.status
      })
      return assignment
    }

    const assignment = RouteAssignment.dispatched(
      facility.id,
      ambulance.id,
      facility.location,
      this.idGenerator
    )
    await this.routeAssignmentRepository.save(assignment)
    await this.ambulanceRepository.updateStatus(ambulance.id, 'dispatched')
    await this.realtimeBroadcaster.broadcast('medical-stream', 'status-changed', {
      facilityId: facility.id,
      status: facility.status
    })
    await this.realtimeBroadcaster.broadcast('medical-stream', 'ambulance-dispatched', {
      facilityId: facility.id,
      ambulanceId: ambulance.id,
      destination: facility.location
    })
    return assignment
  }
}
