import { Facility, FacilityStatus } from '../entities/Facility'

export interface OccupancyThresholdStrategy {
  evaluate(facility: Facility): FacilityStatus
}

export class DefaultOccupancyThresholdStrategy implements OccupancyThresholdStrategy {
  constructor(private readonly thresholdPercent: number = 90) {}

  evaluate(facility: Facility): FacilityStatus {
    if (facility.totalBeds <= 0) return 'RED'
    const occupancyRate = (facility.occupiedBeds / facility.totalBeds) * 100
    return occupancyRate > this.thresholdPercent ? 'RED' : 'GREEN'
  }
}

export class EvaluateOccupancyStatus {
  constructor(private readonly strategy: OccupancyThresholdStrategy) {}

  execute(facility: Facility): FacilityStatus {
    return this.strategy.evaluate(facility)
  }
}
