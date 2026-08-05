import { Coordinates, Facility } from '../entities/Facility'

export type EmergencyScenario = {
  facilityId: string
  occupiedBedsIncrease: number
  triggeredAt: Date
}

export type AmbulanceMovement = {
  ambulanceId: string
  newLocation: Coordinates
  headingDeg: number
}

const SYRIA_BOUNDS = {
  minLatitude: 32.3,
  maxLatitude: 37.3,
  minLongitude: 35.9,
  maxLongitude: 42.4
}

export class ScenarioGenerator {
  static createRandomEmergency(facilities: Facility[]): EmergencyScenario {
    const greenCandidates = facilities.filter(facility => facility.status === 'GREEN' && facility.totalBeds > 0)
    const pool = greenCandidates.length > 0 ? greenCandidates : facilities
    const target = pool[Math.floor(Math.random() * pool.length)]

    const thresholdOccupied = Math.floor(target.totalBeds * 0.9) + 1
    const neededToCross = Math.max(0, thresholdOccupied - target.occupiedBeds)
    const occupiedBedsIncrease = Math.min(
      target.totalBeds - target.occupiedBeds,
      Math.max(neededToCross, 8) + Math.floor(Math.random() * 5)
    )

    return {
      facilityId: target.id,
      occupiedBedsIncrease: Math.max(1, occupiedBedsIncrease),
      triggeredAt: new Date()
    }
  }

  static bearingDegrees(from: Coordinates, to: Coordinates): number {
    const deltaLongitude = to.longitude - from.longitude
    const deltaLatitude = to.latitude - from.latitude
    const degrees = Math.atan2(deltaLongitude, deltaLatitude) * (180 / Math.PI)
    return (degrees + 360) % 360
  }

  static createDirectedMovement(
    ambulanceId: string,
    currentLocation: Coordinates,
    targetLocation: Coordinates,
    stepDegrees = 0.045
  ): AmbulanceMovement {
    const deltaLatitude = targetLocation.latitude - currentLocation.latitude
    const deltaLongitude = targetLocation.longitude - currentLocation.longitude
    const distance = Math.hypot(deltaLatitude, deltaLongitude)
    const headingDeg = this.bearingDegrees(currentLocation, targetLocation)

    if (distance < 0.008) {
      return {
        ambulanceId,
        newLocation: {
          latitude: this.clamp(targetLocation.latitude, SYRIA_BOUNDS.minLatitude, SYRIA_BOUNDS.maxLatitude),
          longitude: this.clamp(
            targetLocation.longitude,
            this.minSafeLongitude(targetLocation.latitude),
            SYRIA_BOUNDS.maxLongitude
          )
        },
        headingDeg
      }
    }

    const ratio = Math.min(1, stepDegrees / distance)
    const newLatitude = this.clamp(
      currentLocation.latitude + deltaLatitude * ratio,
      SYRIA_BOUNDS.minLatitude,
      SYRIA_BOUNDS.maxLatitude
    )
    const newLongitude = this.clamp(
      currentLocation.longitude + deltaLongitude * ratio,
      this.minSafeLongitude(newLatitude),
      SYRIA_BOUNDS.maxLongitude
    )

    return {
      ambulanceId,
      newLocation: { latitude: newLatitude, longitude: newLongitude },
      headingDeg
    }
  }

  static createIncrementalMovement(ambulanceId: string, currentLocation: Coordinates): AmbulanceMovement {
    const deltaLatitude = (Math.random() - 0.5) * 0.01
    const deltaLongitude = (Math.random() - 0.5) * 0.01

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
      newLocation: { latitude: newLatitude, longitude: newLongitude },
      headingDeg: this.bearingDegrees(currentLocation, { latitude: newLatitude, longitude: newLongitude })
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
