import { AmbulanceRepository, AmbulanceFilter } from '../../core/ports/AmbulanceRepository'
import { Ambulance, AmbulanceStatus } from '../../core/entities/Ambulance'
import { Coordinates } from '../../core/entities/Facility'
import { getPostgresPool } from './PostgresConnection'

export class PostgresAmbulanceRepository implements AmbulanceRepository {
  private pool = getPostgresPool()

  async findAll(filter?: AmbulanceFilter): Promise<Ambulance[]> {
    const values: unknown[] = []
    let whereClause = ''

    if (filter?.status) {
      values.push(filter.status)
      whereClause = `WHERE status = $${values.length}`
    }

    const result = await this.pool.query(`
      SELECT id, code, status,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM ambulances
      ${whereClause}
      ORDER BY code
    `, values)

    return result.rows.map(row => this.mapRowToAmbulance(row))
  }

  async findAvailable(): Promise<Ambulance[]> {
    return this.findAll({ status: 'available' })
  }

  async findById(id: string): Promise<Ambulance | null> {
    const result = await this.pool.query(`
      SELECT id, code, status,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM ambulances WHERE id = $1
    `, [id])
    if (result.rows.length === 0) return null
    return this.mapRowToAmbulance(result.rows[0])
  }

  async updateStatus(id: string, status: AmbulanceStatus): Promise<void> {
    await this.pool.query(`UPDATE ambulances SET status = $1 WHERE id = $2`, [status, id])
  }

  async updateLocation(id: string, location: Coordinates): Promise<void> {
    await this.pool.query(`
      UPDATE ambulances
      SET location = ST_SetSRID(ST_MakePoint($1, $2), 4326)
      WHERE id = $3
    `, [location.longitude, location.latitude, id])
  }

  private mapRowToAmbulance(row: Record<string, unknown>): Ambulance {
    return new Ambulance(
      row.id as string,
      row.code as string,
      { latitude: Number(row.latitude), longitude: Number(row.longitude) },
      row.status as AmbulanceStatus
    )
  }
}
