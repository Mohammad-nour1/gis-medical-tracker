import { Coordinates } from './Facility'

export type AmbulanceStatus = 'available' | 'dispatched'

export class Ambulance {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly location: Coordinates,
    public readonly status: AmbulanceStatus
  ) {}
}