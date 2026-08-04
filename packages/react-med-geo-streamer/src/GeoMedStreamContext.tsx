'use client'

import { createContext, useContext, useEffect, useMemo, ReactNode } from 'react'
import { GeoMedStreamEngine } from './GeoMedStreamEngine'
import { GeoMedStreamConfig } from './types'

const GeoMedStreamContext = createContext<GeoMedStreamEngine | null>(null)

export type GeoMedStreamProviderProps = {
  config: GeoMedStreamConfig
  children: ReactNode
}

export function GeoMedStreamProvider({ config, children }: GeoMedStreamProviderProps) {
  const serverUrl = config.serverUrl
  const maxEvents = config.maxEvents
  const engine = useMemo(
    () => new GeoMedStreamEngine({ serverUrl, maxEvents }),
    [serverUrl, maxEvents]
  )

  useEffect(() => {
    engine.connect()
    return () => engine.disconnect()
  }, [engine])

  return (
    <GeoMedStreamContext.Provider value={engine}>
      {children}
    </GeoMedStreamContext.Provider>
  )
}

export function useGeoMedStreamEngine(): GeoMedStreamEngine {
  const engine = useContext(GeoMedStreamContext)
  if (!engine) {
    throw new Error('GeoMedStreamProvider is required')
  }
  return engine
}
