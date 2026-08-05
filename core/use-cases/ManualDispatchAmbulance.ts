import { AmbulanceRepository } from '../ports/AmbulanceRepository'
import { FacilityRepository } from '../ports/FacilityRepository'
import { NotFoundError, ConflictError } from '../errors/AppError'
import { AssignRouteAndDispatch } from './AssignRouteAndDispatch'
import { RouteAssignment } from '../entities/RouteAssignment'

export class ManualDispatchAmbulance {
  constructor(
    private readonly facilityRepository: FacilityRepository,
    private readonly ambulanceRepository: AmbulanceRepository,
    private readonly assignRouteAndDispatch: AssignRouteAndDispatch
  ) {}

  async execute(facilityId: string, ambulanceId: string): Promise<RouteAssignment> {
    const facility = await this.facilityRepository.findById(facilityId)
    if (!facility) throw new NotFoundError('Facility', facilityId)

    const ambulance = await this.ambulanceRepository.findById(ambulanceId)
    if (!ambulance) throw new NotFoundError('Ambulance', ambulanceId)

    if (ambulance.status !== 'available') {
      throw new ConflictError(`Ambulance ${ambulanceId} is not available`)
    }

    return this.assignRouteAndDispatch.execute(facility, ambulance)
  }
}
