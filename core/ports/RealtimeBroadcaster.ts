export interface RealtimeBroadcaster {
  broadcast(channel: string, event: string, payload: unknown): Promise<void>
}