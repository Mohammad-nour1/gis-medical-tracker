import { RouteAssignment } from '../entities/RouteAssignment'

export interface RouteAssignmentRepository {
  save(assignment: RouteAssignment): Promise<void>
}