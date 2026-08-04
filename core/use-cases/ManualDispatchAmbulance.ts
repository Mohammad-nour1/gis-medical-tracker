import { Facility } from '../entities/Facility'
import { Ambulance } from '../entities/Ambulance'
import { RouteAssignment } from '../entities/RouteAssignment'
import { AmbulanceRepository } from '../ports/AmbulanceRepository'
import { FacilityRepository } from '../ports/FacilityRepository'
import { NotFoundError, ConflictError } from '../errors/AppError'

export class ManualDispatchAmbulance {
  constructor(
    private readonly facilityRepository: FacilityRepository,
    private readonly ambulanceRepository: AmbulanceRepository,
    private readonly assignRouteAndDispatch: AssignRouteAndDispatchLike
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

interface AssignRouteAndDispatchLike {
  execute(facility: Facility, ambulance: Ambulance | null): Promise<RouteAssignment>
}
