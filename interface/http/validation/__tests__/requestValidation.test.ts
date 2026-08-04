import assert from 'node:assert/strict'
import test from 'node:test'
import { ValidationError } from '../../../../core/errors/AppError'
import {
  parseAmbulanceQuery,
  parseFacilityQuery,
  parseManualDispatchBody,
  parseSimulationStartBody,
  requireTimestamp
} from '../requestValidation'

test('parseFacilityQuery accepts valid filters', () => {
  const filter = parseFacilityQuery({
    type: 'hospital',
    governorate: 'Damascus',
    status: 'RED'
  })
  assert.deepEqual(filter, {
    type: 'hospital',
    governorate: 'Damascus',
    status: 'RED'
  })
})

test('parseFacilityQuery rejects invalid status', () => {
  assert.throws(
    () => parseFacilityQuery({ status: 'YELLOW' }),
    (error: unknown) => error instanceof ValidationError
  )
})

test('parseAmbulanceQuery rejects invalid status', () => {
  assert.throws(
    () => parseAmbulanceQuery({ status: 'moving' }),
    (error: unknown) => error instanceof ValidationError
  )
})

test('parseManualDispatchBody requires both ids', () => {
  assert.throws(
    () => parseManualDispatchBody({ facilityId: 'f1' }),
    (error: unknown) => error instanceof ValidationError
  )
})

test('requireTimestamp rejects invalid values', () => {
  assert.throws(
    () => requireTimestamp('not-a-date'),
    (error: unknown) => error instanceof ValidationError
  )
})

test('parseSimulationStartBody validates interval bounds', () => {
  assert.throws(
    () => parseSimulationStartBody({ intervalMs: 200 }),
    (error: unknown) => error instanceof ValidationError
  )
  assert.equal(parseSimulationStartBody({ intervalMs: 4000 }), 4000)
})
