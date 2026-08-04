import { AmbulanceLocationSnapshot } from '../entities/AmbulanceLocationSnapshot'

export interface AmbulanceLocationSnapshotRepository {
  record(snapshot: AmbulanceLocationSnapshot): Promise<void>
  findAllClosestToTimestamp(timestamp: Date): Promise<AmbulanceLocationSnapshot[]>
}
