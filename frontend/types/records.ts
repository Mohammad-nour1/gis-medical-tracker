export type FacilityType = 'hospital' | 'clinic' | 'field_unit'
export type FacilityStatus = 'RED' | 'GREEN'
export type AmbulanceStatus = 'available' | 'dispatched'

export type Coordinates = {
  latitude: number
  longitude: number
}

export type FacilityRecord = {
  id: string
  name: string
  type: FacilityType
  governorate: string
  totalBeds: number
  occupiedBeds: number
  location: Coordinates
  status: FacilityStatus
}

export type AmbulanceRecord = {
  id: string
  code: string
  location: Coordinates
  status: AmbulanceStatus
}

export type OccupancySnapshotRecord = {
  id: string
  facilityId: string
  occupiedBeds: number
  totalBeds: number
  status: FacilityStatus
  recordedAt: string
}

export type AmbulanceLocationSnapshotRecord = {
  id: string
  ambulanceId: string
  location: Coordinates
  status: AmbulanceStatus
  recordedAt: string
}

export type HistoryBundleRecord = {
  occupancySnapshots: OccupancySnapshotRecord[]
  ambulanceSnapshots: AmbulanceLocationSnapshotRecord[]
}

export type FacilityFilterState = {
  type: FacilityType | 'all'
  governorate: string | 'all'
  status: FacilityStatus | 'all'
  ambulanceStatus: AmbulanceStatus | 'all'
}
