export type StreamEventName =
  | 'occupancy-critical'
  | 'status-changed'
  | 'ambulance-dispatched'
  | 'ambulance-location'
  | 'simulation-tick'

export type StreamPayloadMap = {
  'occupancy-critical': {
    facilityId: string
    facilityName: string
  }
  'status-changed': {
    facilityId: string
    status: 'RED' | 'GREEN'
  }
  'ambulance-dispatched': {
    facilityId: string
    ambulanceId: string
    destination: { latitude: number; longitude: number }
  }
  'ambulance-location': {
    ambulanceId: string
    location: { latitude: number; longitude: number }
    headingDeg?: number
    targetFacilityId?: string | null
  }
  'simulation-tick': {
    processedCount: number
    triggeredAt: string
    emergencyFacilityId: string | null
    emergencyFacilityName: string | null
    occupiedBedsIncrease: number | null
  }
}

export type StreamEvent<T extends StreamEventName = StreamEventName> = {
  id: string
  channel: string
  name: T
  payload: StreamPayloadMap[T]
  receivedAt: string
}

export type GeoMedStreamSnapshot = {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'
  events: StreamEvent[]
  lastError: string | null
}

export type GeoMedStreamConfig = {
  serverUrl: string
  maxEvents?: number
}
