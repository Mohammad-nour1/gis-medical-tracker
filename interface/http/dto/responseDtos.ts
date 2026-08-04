import { Facility } from '../../../core/entities/Facility'
import { Ambulance } from '../../../core/entities/Ambulance'
import { OccupancySnapshot } from '../../../core/entities/OccupancySnapshot'
import { RouteAssignment } from '../../../core/entities/RouteAssignment'
import { AmbulanceLocationSnapshot } from '../../../core/entities/AmbulanceLocationSnapshot'

export type FacilityDto = {
  id: string
  name: string
  type: Facility['type']
  governorate: string
  totalBeds: number
  occupiedBeds: number
  location: Facility['location']
  status: Facility['status']
}

export type AmbulanceDto = {
  id: string
  code: string
  location: Ambulance['location']
  status: Ambulance['status']
}

export type OccupancySnapshotDto = {
  id: string
  facilityId: string
  occupiedBeds: number
  totalBeds: number
  status: OccupancySnapshot['status']
  recordedAt: string
}

export type AmbulanceLocationSnapshotDto = {
  id: string
  ambulanceId: string
  location: AmbulanceLocationSnapshot['location']
  status: AmbulanceLocationSnapshot['status']
  recordedAt: string
}

export type RouteAssignmentDto = {
  id: string
  facilityId: string
  ambulanceId: string | null
  destination: RouteAssignment['destination']
  dispatchedAt: string
}

export type HistoryBundleDto = {
  occupancySnapshots: OccupancySnapshotDto[]
  ambulanceSnapshots: AmbulanceLocationSnapshotDto[]
}

export function toFacilityDto(facility: Facility): FacilityDto {
  return {
    id: facility.id,
    name: facility.name,
    type: facility.type,
    governorate: facility.governorate,
    totalBeds: facility.totalBeds,
    occupiedBeds: facility.occupiedBeds,
    location: facility.location,
    status: facility.status
  }
}

export function toAmbulanceDto(ambulance: Ambulance): AmbulanceDto {
  return {
    id: ambulance.id,
    code: ambulance.code,
    location: ambulance.location,
    status: ambulance.status
  }
}

export function toOccupancySnapshotDto(snapshot: OccupancySnapshot): OccupancySnapshotDto {
  return {
    id: snapshot.id,
    facilityId: snapshot.facilityId,
    occupiedBeds: snapshot.occupiedBeds,
    totalBeds: snapshot.totalBeds,
    status: snapshot.status,
    recordedAt: snapshot.recordedAt.toISOString()
  }
}

export function toAmbulanceLocationSnapshotDto(snapshot: AmbulanceLocationSnapshot): AmbulanceLocationSnapshotDto {
  return {
    id: snapshot.id,
    ambulanceId: snapshot.ambulanceId,
    location: snapshot.location,
    status: snapshot.status,
    recordedAt: snapshot.recordedAt.toISOString()
  }
}

export function toRouteAssignmentDto(assignment: RouteAssignment): RouteAssignmentDto {
  return {
    id: assignment.id,
    facilityId: assignment.facilityId,
    ambulanceId: assignment.ambulanceId,
    destination: assignment.destination,
    dispatchedAt: assignment.dispatchedAt.toISOString()
  }
}
