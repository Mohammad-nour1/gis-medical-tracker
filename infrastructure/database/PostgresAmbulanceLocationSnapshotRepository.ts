import { AmbulanceLocationSnapshotRepository } from '../../core/ports/AmbulanceLocationSnapshotRepository'
import { AmbulanceLocationSnapshot } from '../../core/entities/AmbulanceLocationSnapshot'
import { AmbulanceStatus } from '../../core/entities/Ambulance'
import { getPostgresPool } from './PostgresConnection'

export class PostgresAmbulanceLocationSnapshotRepository implements AmbulanceLocationSnapshotRepository {
  private pool = getPostgresPool()

  async record(snapshot: AmbulanceLocationSnapshot): Promise<void> {
    await this.pool.query(`
      INSERT INTO ambulance_location_snapshots (id, ambulance_id, status, location, recorded_at)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)
    `, [
      snapshot.id,
      snapshot.ambulanceId,
      snapshot.status,
      snapshot.location.longitude,
      snapshot.location.latitude,
      snapshot.recordedAt
    ])
  }

  async findAllClosestToTimestamp(timestamp: Date): Promise<AmbulanceLocationSnapshot[]> {
    const result = await this.pool.query(`
      SELECT DISTINCT ON (ambulance_id)
        id, ambulance_id, status, recorded_at,
        ST_Y(location::geometry) as latitude,
        ST_X(location::geometry) as longitude
      FROM ambulance_location_snapshots
      ORDER BY ambulance_id, ABS(EXTRACT(EPOCH FROM (recorded_at - $1::timestamptz)))
    `, [timestamp])

    return result.rows.map(row => new AmbulanceLocationSnapshot(
      row.id as string,
      row.ambulance_id as string,
      { latitude: Number(row.latitude), longitude: Number(row.longitude) },
      row.status as AmbulanceStatus,
      row.recorded_at as Date
    ))
  }
}
