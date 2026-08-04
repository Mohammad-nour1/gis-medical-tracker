import { ValidationError } from '../../../core/errors/AppError'
import { FacilityType, FacilityStatus } from '../../../core/entities/Facility'
import { AmbulanceStatus } from '../../../core/entities/Ambulance'

const facilityTypes: FacilityType[] = ['hospital', 'clinic', 'field_unit']
const facilityStatuses: FacilityStatus[] = ['RED', 'GREEN']
const ambulanceStatuses: AmbulanceStatus[] = ['available', 'dispatched']

export function requireNonEmptyString(value: unknown, fieldName: string): string {
  if (typeof value !== 'string' || value.trim().length === 0) {
    throw new ValidationError(`${fieldName} is required`)
  }
  return value.trim()
}

export function optionalEnum<T extends string>(value: unknown, allowed: T[], fieldName: string): T | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value !== 'string' || !allowed.includes(value as T)) {
    throw new ValidationError(`${fieldName} is invalid`)
  }
  return value as T
}

export function requireTimestamp(value: unknown): Date {
  const raw = requireNonEmptyString(value, 'timestamp')
  const timestamp = new Date(raw)
  if (Number.isNaN(timestamp.getTime())) {
    throw new ValidationError('timestamp is invalid')
  }
  return timestamp
}

export function parseFacilityQuery(query: Record<string, unknown>) {
  return {
    type: optionalEnum(query.type, facilityTypes, 'type'),
    governorate: typeof query.governorate === 'string' && query.governorate.length > 0
      ? query.governorate
      : undefined,
    status: optionalEnum(query.status, facilityStatuses, 'status')
  }
}

export function parseAmbulanceQuery(query: Record<string, unknown>) {
  return {
    status: optionalEnum(query.status, ambulanceStatuses, 'status')
  }
}

export function parseManualDispatchBody(body: unknown) {
  if (!body || typeof body !== 'object') {
    throw new ValidationError('request body is required')
  }
  const payload = body as Record<string, unknown>
  return {
    facilityId: requireNonEmptyString(payload.facilityId, 'facilityId'),
    ambulanceId: requireNonEmptyString(payload.ambulanceId, 'ambulanceId')
  }
}

export function parseSimulationStartBody(body: unknown): number {
  if (!body || typeof body !== 'object') return 5000
  const payload = body as Record<string, unknown>
  const value = payload.intervalMs
  const parsed = typeof value === 'number' ? value : Number(value ?? 5000)
  if (Number.isNaN(parsed) || parsed < 1000 || parsed > 60000) {
    throw new ValidationError('intervalMs must be between 1000 and 60000')
  }
  return parsed
}
