import assert from 'node:assert/strict'
import test from 'node:test'
import { Facility } from '../../entities/Facility'
import { ScenarioGenerator } from '../../simulation/ScenarioGenerator'
import { CalculateAvailableBeds } from '../CalculateAvailableBeds'
import { DefaultOccupancyThresholdStrategy, EvaluateOccupancyStatus } from '../EvaluateOccupancyStatus'

test('simulation emergency prefers GREEN and pushes occupancy past 90 percent', () => {
  ScenarioGenerator.resetDemoFocus()
  const green = new Facility(
    'green-1',
    'Stable Hospital',
    'hospital',
    'Damascus',
    100,
    80,
    { latitude: 33.5, longitude: 36.3 },
    'GREEN'
  )
  const red = new Facility(
    'red-1',
    'Critical Hospital',
    'hospital',
    'Damascus',
    100,
    95,
    { latitude: 33.51, longitude: 36.31 },
    'RED'
  )

  for (let index = 0; index < 20; index += 1) {
    const emergency = ScenarioGenerator.createRandomEmergency([green, red])
    assert.equal(emergency.facilityId, green.id)
    const nextOccupied = Math.min(green.totalBeds, green.occupiedBeds + emergency.occupiedBedsIncrease)
    const updated = new Facility(
      green.id,
      green.name,
      green.type,
      green.governorate,
      green.totalBeds,
      nextOccupied,
      green.location,
      green.status
    )
    const availableBeds = new CalculateAvailableBeds().execute(updated)
    const status = new EvaluateOccupancyStatus(new DefaultOccupancyThresholdStrategy()).execute(
      updated,
      availableBeds
    )
    assert.equal(status, 'RED')
  }
})

test('directed ambulance movement advances toward the target facility', () => {
  const current = { latitude: 33.50, longitude: 36.25 }
  const target = { latitude: 33.52, longitude: 36.30 }
  const movement = ScenarioGenerator.createDirectedMovement('amb-1', current, target, 0.18)
  const before = Math.hypot(target.latitude - current.latitude, target.longitude - current.longitude)
  const after = Math.hypot(
    target.latitude - movement.newLocation.latitude,
    target.longitude - movement.newLocation.longitude
  )
  assert.equal(after < before, true)
  assert.equal(typeof movement.headingDeg, 'number')
})
