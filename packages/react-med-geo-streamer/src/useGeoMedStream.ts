'use client'

import { useSyncExternalStore } from 'react'
import { useGeoMedStreamEngine } from './GeoMedStreamContext'
import { GeoMedStreamSnapshot, StreamEvent, StreamEventName } from './types'

export function useGeoMedStream(): GeoMedStreamSnapshot {
  const engine = useGeoMedStreamEngine()
  return useSyncExternalStore(
    listener => engine.subscribe(listener),
    () => engine.getSnapshot(),
    () => engine.getSnapshot()
  )
}

export function useGeoMedStreamEvents<T extends StreamEventName>(name: T): StreamEvent<T>[] {
  const snapshot = useGeoMedStream()
  return snapshot.events.filter((event): event is StreamEvent<T> => event.name === name)
}

export function useGeoMedConnectionStatus(): GeoMedStreamSnapshot['connectionStatus'] {
  return useGeoMedStream().connectionStatus
}
