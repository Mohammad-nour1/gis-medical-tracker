import { FacilityRepository, FacilityFilter } from '../../core/ports/FacilityRepository'
import { Facility, FacilityStatus, FacilityType } from '../../core/entities/Facility'
import { getPostgresPool } from './PostgresConnection'

export class PostgresFacilityRepository implements FacilityRepository {
  private pool = getPostgresPool()

  async findAll(): Promise<Facility[]> {
    const result = await this.pool.query(`
      SELECT id, name, type, governorate, total_beds, occupied_beds, status,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM facilities
      ORDER BY name
    `)
    return result.rows.map(row => this.mapRowToFacility(row))
  }

  async findById(id: string): Promise<Facility | null> {
    const result = await this.pool.query(`
      SELECT id, name, type, governorate, total_beds, occupied_beds, status,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM facilities WHERE id = $1
    `, [id])
    if (result.rows.length === 0) return null
    return this.mapRowToFacility(result.rows[0])
  }

  async findWithFilters(filter: FacilityFilter): Promise<Facility[]> {
    const conditions: string[] = []
    const values: unknown[] = []

    if (filter.type) {
      values.push(filter.type)
      conditions.push(`type = $${values.length}`)
    }
    if (filter.governorate) {
      values.push(filter.governorate)
      conditions.push(`governorate = $${values.length}`)
    }
    if (filter.status) {
      values.push(filter.status)
      conditions.push(`status = $${values.length}`)
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

    const result = await this.pool.query(`
      SELECT id, name, type, governorate, total_beds, occupied_beds, status,
             ST_Y(location::geometry) as latitude,
             ST_X(location::geometry) as longitude
      FROM facilities
      ${whereClause}
      ORDER BY name
    `, values)

    return result.rows.map(row => this.mapRowToFacility(row))
  }

  async updateStatus(id: string, status: FacilityStatus): Promise<void> {
    await this.pool.query(`UPDATE facilities SET status = $1 WHERE id = $2`, [status, id])
  }

  async updateOccupiedBeds(id: string, occupiedBeds: number): Promise<void> {
    await this.pool.query(`UPDATE facilities SET occupied_beds = $1 WHERE id = $2`, [occupiedBeds, id])
  }

  private mapRowToFacility(row: Record<string, unknown>): Facility {
    return new Facility(
      row.id as string,
      row.name as string,
      row.type as FacilityType,
      row.governorate as string,
      Number(row.total_beds),
      Number(row.occupied_beds),
      { latitude: Number(row.latitude), longitude: Number(row.longitude) },
      row.status as FacilityStatus
    )
  }
}
