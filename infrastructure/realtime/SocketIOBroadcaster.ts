import { Server as SocketServer } from 'socket.io'
import { RealtimeBroadcaster } from '../../core/ports/RealtimeBroadcaster'

export class SocketIOBroadcaster implements RealtimeBroadcaster {
  constructor(private readonly socketServer: SocketServer) {}

  async broadcast(channel: string, event: string, payload: unknown): Promise<void> {
    this.socketServer.emit(event, payload)
  }
}
