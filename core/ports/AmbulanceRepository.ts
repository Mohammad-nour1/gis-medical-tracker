import { Ambulance, AmbulanceStatus } from '../entities/Ambulance'
import { Coordinates } from '../entities/Facility'

export type AmbulanceFilter = {
  status?: AmbulanceStatus
}

export interface AmbulanceRepository {
  findAll(filter?: AmbulanceFilter): Promise<Ambulance[]>
  findAvailable(): Promise<Ambulance[]>
  findById(id: string): Promise<Ambulance | null>
  updateStatus(id: string, status: AmbulanceStatus): Promise<void>
  updateLocation(id: string, location: Coordinates): Promise<void>
}
