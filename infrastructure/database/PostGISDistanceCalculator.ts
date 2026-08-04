import { GeoDistanceCalculator } from '../../core/ports/GeoDistanceCalculator'
import { Ambulance } from '../../core/entities/Ambulance'
import { Coordinates } from '../../core/entities/Facility'
import { getPostgresPool } from './PostgresConnection'

export class PostGISDistanceCalculator implements GeoDistanceCalculator {
  private pool = getPostgresPool()

  async findNearestAmbulance(origin: Coordinates, candidates: Ambulance[]): Promise<Ambulance | null> {
    if (candidates.length === 0) return null

    const candidateIds = candidates.map(ambulance => ambulance.id)

    const result = await this.pool.query(`
      SELECT id, code, status,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude,
             ST_Distance(location, ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography) as distance_meters
      FROM ambulances
      WHERE id = ANY($3::uuid[])
      ORDER BY distance_meters ASC
      LIMIT 1
    `, [origin.longitude, origin.latitude, candidateIds])

    if (result.rows.length === 0) return null

    const row = result.rows[0]
    return new Ambulance(
      row.id,
      row.code,
      { latitude: row.latitude, longitude: row.longitude },
      row.status
    )
  }
}