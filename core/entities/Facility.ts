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

  static create(params: {
    id: string
    name: string
    type: FacilityType
    governorate: string
    totalBeds: number
    occupiedBeds: number
    location: Coordinates
  }): Facility {
    return new Facility(
      params.id,
      params.name,
      params.type,
      params.governorate,
      params.totalBeds,
      params.occupiedBeds,
      params.location,
      'GREEN'
    )
  }
}