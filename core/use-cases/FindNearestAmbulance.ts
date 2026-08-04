import { Facility } from '../entities/Facility'
import { Ambulance } from '../entities/Ambulance'
import { AmbulanceRepository } from '../ports/AmbulanceRepository'
import { GeoDistanceCalculator } from '../ports/GeoDistanceCalculator'

export class FindNearestAmbulance {
  constructor(
    private readonly ambulanceRepository: AmbulanceRepository,
    private readonly geoDistanceCalculator: GeoDistanceCalculator
  ) {}

  async execute(facility: Facility): Promise<Ambulance | null> {
    const availableAmbulances = await this.ambulanceRepository.findAvailable()
    if (availableAmbulances.length === 0) return null
    return this.geoDistanceCalculator.findNearestAmbulance(facility.location, availableAmbulances)
  }
}