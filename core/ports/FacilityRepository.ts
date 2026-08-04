import { Facility, FacilityStatus, FacilityType } from '../entities/Facility'

export type FacilityFilter = {
  type?: FacilityType
  governorate?: string
  status?: FacilityStatus
}

export interface FacilityRepository {
  findAll(): Promise<Facility[]>
  findById(id: string): Promise<Facility | null>
  findByGovernorate(governorate: string): Promise<Facility[]>
  findWithFilters(filter: FacilityFilter): Promise<Facility[]>
  updateStatus(id: string, status: FacilityStatus): Promise<void>
  updateOccupiedBeds(id: string, occupiedBeds: number): Promise<void>
}
