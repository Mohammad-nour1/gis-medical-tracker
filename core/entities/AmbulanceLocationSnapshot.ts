import { Coordinates } from './Facility'
import { AmbulanceStatus } from './Ambulance'

export class AmbulanceLocationSnapshot {
  constructor(
    public readonly id: string,
    public readonly ambulanceId: string,
    public readonly location: Coordinates,
    public readonly status: AmbulanceStatus,
    public readonly recordedAt: Date
  ) {}
}
