import { createApp } from './app.js'
import { environment } from './config/env.js'
import { logger } from './shared/logger.js'

const app = createApp()

const server = app.listen(environment.PORT, () => {
  logger.info({ port: environment.PORT }, 'API server started')
})

function shutdown(signal: NodeJS.Signals) {
  logger.info({ signal }, 'Shutting down API server')
  server.close((error) => {
    if (error) {
      logger.error({ error }, 'API server shutdown failed')
      process.exitCode = 1
    }
  })
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
