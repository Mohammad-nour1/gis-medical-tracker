import next from 'next'
import express from 'express'
import { createServer } from 'http'
import { createSocketGateway } from './interface/websocket-gateway/SocketGateway'
import { createApplicationContainer } from './interface/http/createContainer'
import { registerRoutes } from './interface/http/routes/registerRoutes'
import { errorHandler } from './interface/http/middleware/errorHandler'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME ?? 'localhost'
const port = Number(process.env.PORT ?? 3000)

const nextApp = next({ dev, hostname, port })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()
  app.use(express.json())

  const httpServer = createServer(app)
  const io = createSocketGateway(httpServer)
  const container = createApplicationContainer(io)

  registerRoutes(app, container)

  app.use(errorHandler)

  app.all(/.*/, (request, response) => handle(request, response))

  httpServer.listen(port, () => {
    process.stdout.write(`Server ready at http://${hostname}:${port}\n`)
  })
}).catch(error => {
  process.stderr.write(`${error}\n`)
  process.exit(1)
})
