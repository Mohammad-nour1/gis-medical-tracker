import { RouteAssignmentRepository } from '../../core/ports/RouteAssignmentRepository'
import { RouteAssignment } from '../../core/entities/RouteAssignment'
import { getPostgresPool } from './PostgresConnection'

export class PostgresRouteAssignmentRepository implements RouteAssignmentRepository {
  private pool = getPostgresPool()

  async save(assignment: RouteAssignment): Promise<void> {
    await this.pool.query(`
      INSERT INTO route_assignments (id, facility_id, ambulance_id, destination, dispatched_at)
      VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6)
    `, [
      assignment.id,
      assignment.facilityId,
      assignment.ambulanceId,
      assignment.destination.longitude,
      assignment.destination.latitude,
      assignment.dispatchedAt
    ])
  }
}