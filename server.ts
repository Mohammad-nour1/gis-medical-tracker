import next from 'next'
import express from 'express'
import { createServer } from 'http'
import { createSocketGateway } from './interface/websocket-gateway/SocketGateway'
import { createApplicationContainer } from './interface/http/createContainer'
import { registerRoutes } from './interface/http/routes/registerRoutes'
import { errorHandler } from './interface/http/middleware/errorHandler'

const dev = process.env.NODE_ENV !== 'production'
const hostname = process.env.HOSTNAME ?? '0.0.0.0'
const port = Number(process.env.PORT ?? 3000)

const nextApp = next({ dev, hostname, port })
const handle = nextApp.getRequestHandler()

nextApp.prepare().then(() => {
  const app = express()
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '1mb' }))

  const httpServer = createServer(app)
  const io = createSocketGateway(httpServer)
  const container = createApplicationContainer(io)

  app.get('/api/health', (_request, response) => {
    response.json({
      status: 'ok',
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString()
    })
  })

  registerRoutes(app, container)
  app.use(errorHandler)
  app.all(/.*/, (request, response) => handle(request, response))

  httpServer.listen(port, hostname, () => {
    process.stdout.write(`Server ready on ${hostname}:${port}\n`)
  })
}).catch(error => {
  process.stderr.write(`${error}\n`)
  process.exit(1)
})
