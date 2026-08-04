import { Facility } from '../entities/Facility'

export class CalculateAvailableBeds {
  execute(facility: Facility): number {
    return facility.totalBeds - facility.occupiedBeds
  }
}