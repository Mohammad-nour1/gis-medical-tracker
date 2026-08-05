import assert from 'node:assert/strict'
import test from 'node:test'
import { Facility } from '../../entities/Facility'
import { EvaluateOccupancyStatus, DefaultOccupancyThresholdStrategy } from '../EvaluateOccupancyStatus'
import { CalculateAvailableBeds } from '../CalculateAvailableBeds'

const sampleFacility = new Facility(
  'facility-1',
  'Test Hospital',
  'hospital',
  'Damascus',
  100,
  95,
  { latitude: 33.5, longitude: 36.3 },
  'GREEN'
)

test('CalculateAvailableBeds returns total minus occupied', () => {
  const useCase = new CalculateAvailableBeds()
  assert.equal(useCase.execute(sampleFacility), 5)
})

test('EvaluateOccupancyStatus marks RED above 90 percent', () => {
  const useCase = new EvaluateOccupancyStatus(new DefaultOccupancyThresholdStrategy())
  const availableBeds = new CalculateAvailableBeds().execute(sampleFacility)
  assert.equal(useCase.execute(sampleFacility, availableBeds), 'RED')
})

test('EvaluateOccupancyStatus marks GREEN at or below 90 percent', () => {
  const useCase = new EvaluateOccupancyStatus(new DefaultOccupancyThresholdStrategy())
  const greenFacility = new Facility(
    sampleFacility.id,
    sampleFacility.name,
    sampleFacility.type,
    sampleFacility.governorate,
    100,
    90,
    sampleFacility.location,
    'GREEN'
  )
  const availableBeds = new CalculateAvailableBeds().execute(greenFacility)
  assert.equal(useCase.execute(greenFacility, availableBeds), 'GREEN')
})
