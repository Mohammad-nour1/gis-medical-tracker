import { Coordinates } from '../entities/Facility'

export type EmergencyScenario = {
  facilityId: string
  occupiedBedsIncrease: number
  triggeredAt: Date
}

export type AmbulanceMovement = {
  ambulanceId: string
  newLocation: Coordinates
}

const SYRIA_BOUNDS = {
  minLatitude: 32.3,
  maxLatitude: 37.3,
  minLongitude: 35.9,
  maxLongitude: 42.4
}

export class ScenarioGenerator {
  static createRandomEmergency(facilityIds: string[]): EmergencyScenario {
    const randomFacilityId = facilityIds[Math.floor(Math.random() * facilityIds.length)]
    return {
      facilityId: randomFacilityId,
      occupiedBedsIncrease: Math.floor(Math.random() * 20) + 5,
      triggeredAt: new Date()
    }
  }

  static createIncrementalMovement(ambulanceId: string, currentLocation: Coordinates): AmbulanceMovement {
    const deltaLatitude = (Math.random() - 0.5) * 0.008
    const deltaLongitude = (Math.random() - 0.5) * 0.008

    const newLatitude = this.clamp(
      currentLocation.latitude + deltaLatitude,
      SYRIA_BOUNDS.minLatitude,
      SYRIA_BOUNDS.maxLatitude
    )
    const newLongitude = this.clamp(
      currentLocation.longitude + deltaLongitude,
      this.minSafeLongitude(newLatitude),
      SYRIA_BOUNDS.maxLongitude
    )

    return {
      ambulanceId,
      newLocation: { latitude: newLatitude, longitude: newLongitude }
    }
  }

  private static minSafeLongitude(latitude: number): number {
    if (latitude >= 34.4 && latitude <= 36.2) return 35.92
    return SYRIA_BOUNDS.minLongitude
  }

  private static clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max)
  }
}
