import { Server as HttpServer } from 'http'
import { Server as SocketServer } from 'socket.io'

export function createSocketGateway(httpServer: HttpServer): SocketServer {
  return new SocketServer(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling']
  })
}
