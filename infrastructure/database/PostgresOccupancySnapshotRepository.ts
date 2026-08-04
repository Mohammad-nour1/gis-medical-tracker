import { OccupancySnapshotRepository } from '../../core/ports/OccupancySnapshotRepository'
import { OccupancySnapshot } from '../../core/entities/OccupancySnapshot'
import { getPostgresPool } from './PostgresConnection'

export class PostgresOccupancySnapshotRepository implements OccupancySnapshotRepository {
  private pool = getPostgresPool()

  async record(snapshot: OccupancySnapshot): Promise<void> {
    await this.pool.query(`
      INSERT INTO occupancy_snapshots (id, facility_id, occupied_beds, total_beds, status, recorded_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `, [
      snapshot.id,
      snapshot.facilityId,
      snapshot.occupiedBeds,
      snapshot.totalBeds,
      snapshot.status,
      snapshot.recordedAt
    ])
  }

  async findClosestTo(facilityId: string, timestamp: Date): Promise<OccupancySnapshot | null> {
    const result = await this.pool.query(`
      SELECT id, facility_id, occupied_beds, total_beds, status, recorded_at
      FROM occupancy_snapshots
      WHERE facility_id = $1
      ORDER BY ABS(EXTRACT(EPOCH FROM (recorded_at - $2::timestamptz)))
      LIMIT 1
    `, [facilityId, timestamp])

    if (result.rows.length === 0) return null
    return this.mapRow(result.rows[0])
  }

  async findAllClosestToTimestamp(timestamp: Date): Promise<OccupancySnapshot[]> {
    const result = await this.pool.query(`
      SELECT DISTINCT ON (facility_id)
        id, facility_id, occupied_beds, total_beds, status, recorded_at
      FROM occupancy_snapshots
      ORDER BY facility_id, ABS(EXTRACT(EPOCH FROM (recorded_at - $1::timestamptz)))
    `, [timestamp])

    return result.rows.map(row => this.mapRow(row))
  }

  private mapRow(row: Record<string, unknown>): OccupancySnapshot {
    return new OccupancySnapshot(
      row.id as string,
      row.facility_id as string,
      Number(row.occupied_beds),
      Number(row.total_beds),
      row.status as 'RED' | 'GREEN',
      row.recorded_at as Date
    )
  }
}
