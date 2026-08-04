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

async function bootstrap(): Promise<void> {
  const app = express()
  app.set('trust proxy', 1)
  app.use(express.json({ limit: '1mb' }))

  let applicationReady = false

  app.get('/api/health', (_request, response) => {
    response.status(200).json({
      status: 'ok',
      ready: applicationReady,
      environment: process.env.NODE_ENV ?? 'development',
      timestamp: new Date().toISOString()
    })
  })

  const httpServer = createServer(app)
  const io = createSocketGateway(httpServer)

  await new Promise<void>((resolve, reject) => {
    httpServer.listen(port, hostname, () => {
      process.stdout.write(`Listening on ${hostname}:${port}\n`)
      resolve()
    })
    httpServer.on('error', reject)
  })

  const nextApp = next({ dev, hostname, port })
  const handle = nextApp.getRequestHandler()
  await nextApp.prepare()

  const container = createApplicationContainer(io)
  registerRoutes(app, container)
  app.use(errorHandler)
  app.all(/.*/, (request, response) => handle(request, response))
  applicationReady = true
  process.stdout.write(`Application ready on ${hostname}:${port}\n`)
}

bootstrap().catch(error => {
  process.stderr.write(`${error}\n`)
  process.exit(1)
})
