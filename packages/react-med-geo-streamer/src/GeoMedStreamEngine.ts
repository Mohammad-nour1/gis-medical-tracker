import { io, Socket } from 'socket.io-client'
import {
  GeoMedStreamConfig,
  GeoMedStreamSnapshot,
  StreamEvent,
  StreamEventName,
  StreamPayloadMap
} from './types'

type Listener = () => void

export class GeoMedStreamEngine {
  private socket: Socket | null = null
  private listeners = new Set<Listener>()
  private snapshot: GeoMedStreamSnapshot = {
    connectionStatus: 'disconnected',
    events: [],
    lastError: null
  }
  private maxEvents: number

  constructor(private readonly config: GeoMedStreamConfig) {
    this.maxEvents = config.maxEvents ?? 200
  }

  connect(): void {
    if (this.socket?.connected) return

    this.updateSnapshot({ connectionStatus: 'connecting', lastError: null })

    this.socket = io(this.config.serverUrl, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10
    })

    this.socket.on('connect', () => {
      this.updateSnapshot({ connectionStatus: 'connected', lastError: null })
    })

    this.socket.on('disconnect', () => {
      this.updateSnapshot({ connectionStatus: 'disconnected' })
    })

    this.socket.on('connect_error', (error: Error) => {
      this.updateSnapshot({
        connectionStatus: 'error',
        lastError: error.message
      })
    })

    const eventNames: StreamEventName[] = [
      'occupancy-critical',
      'status-changed',
      'ambulance-dispatched',
      'ambulance-location',
      'simulation-tick'
    ]

    for (const eventName of eventNames) {
      this.socket.on(eventName, (payload: StreamPayloadMap[typeof eventName]) => {
        this.pushEvent({
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          channel: 'medical-stream',
          name: eventName,
          payload,
          receivedAt: new Date().toISOString()
        })
      })
    }
  }

  disconnect(): void {
    this.socket?.disconnect()
    this.socket = null
    this.updateSnapshot({ connectionStatus: 'disconnected' })
  }

  subscribe(listener: Listener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  getSnapshot(): GeoMedStreamSnapshot {
    return this.snapshot
  }

  clearEvents(): void {
    this.updateSnapshot({ events: [] })
  }

  private pushEvent(event: StreamEvent): void {
    const events = [event, ...this.snapshot.events].slice(0, this.maxEvents)
    this.updateSnapshot({ events })
  }

  private updateSnapshot(partial: Partial<GeoMedStreamSnapshot>): void {
    this.snapshot = { ...this.snapshot, ...partial }
    this.listeners.forEach(listener => listener())
  }
}
