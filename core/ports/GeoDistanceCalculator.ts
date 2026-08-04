import { Ambulance } from '../entities/Ambulance'
import { Coordinates } from '../entities/Facility'

export interface GeoDistanceCalculator {
  findNearestAmbulance(origin: Coordinates, candidates: Ambulance[]): Promise<Ambulance | null>
}