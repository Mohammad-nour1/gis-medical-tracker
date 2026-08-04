import { OccupancySnapshot } from '../entities/OccupancySnapshot'

export interface OccupancySnapshotRepository {
  record(snapshot: OccupancySnapshot): Promise<void>
  findClosestTo(facilityId: string, timestamp: Date): Promise<OccupancySnapshot | null>
  findAllClosestToTimestamp(timestamp: Date): Promise<OccupancySnapshot[]>
}
