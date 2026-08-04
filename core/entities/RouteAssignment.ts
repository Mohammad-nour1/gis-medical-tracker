import { Coordinates } from './Facility'
import { IdGenerator } from '../ports/IdGenerator'

export class RouteAssignment {
  constructor(
    public readonly id: string,
    public readonly facilityId: string,
    public readonly ambulanceId: string | null,
    public readonly destination: Coordinates,
    public readonly dispatchedAt: Date
  ) {}

  static none(facilityId: string, destination: Coordinates, idGenerator: IdGenerator): RouteAssignment {
    return new RouteAssignment(
      idGenerator.generate(),
      facilityId,
      null,
      destination,
      new Date()
    )
  }

  static dispatched(
    facilityId: string,
    ambulanceId: string,
    destination: Coordinates,
    idGenerator: IdGenerator
  ): RouteAssignment {
    return new RouteAssignment(
      idGenerator.generate(),
      facilityId,
      ambulanceId,
      destination,
      new Date()
    )
  }
}
