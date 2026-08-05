import { Facility, FacilityStatus } from '../entities/Facility'
import { OCCUPANCY_CRITICAL_THRESHOLD_PERCENT } from '../shared/occupancy'

export interface OccupancyThresholdStrategy {
  evaluate(facility: Facility, availableBeds: number): FacilityStatus
}

export class DefaultOccupancyThresholdStrategy implements OccupancyThresholdStrategy {
  constructor(private readonly thresholdPercent: number = OCCUPANCY_CRITICAL_THRESHOLD_PERCENT) {}

  evaluate(facility: Facility, availableBeds: number): FacilityStatus {
    if (facility.totalBeds <= 0) return 'RED'
    const occupiedBeds = facility.totalBeds - availableBeds
    const occupancyRate = (occupiedBeds / facility.totalBeds) * 100
    return occupancyRate > this.thresholdPercent ? 'RED' : 'GREEN'
  }
}

export class EvaluateOccupancyStatus {
  constructor(private readonly strategy: OccupancyThresholdStrategy) {}

  execute(facility: Facility, availableBeds: number): FacilityStatus {
    return this.strategy.evaluate(facility, availableBeds)
  }
}
