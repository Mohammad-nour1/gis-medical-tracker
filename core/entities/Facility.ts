export type FacilityType = 'hospital' | 'clinic' | 'field_unit'
export type FacilityStatus = 'RED' | 'GREEN'

export interface Coordinates {
  latitude: number
  longitude: number
}

export class Facility {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly type: FacilityType,
    public readonly governorate: string,
    public readonly totalBeds: number,
    public readonly occupiedBeds: number,
    public readonly location: Coordinates,
    public readonly status: FacilityStatus
  ) {}
}