import { pinoHttp } from 'pino-http'

import { logger } from '../shared/logger.js'

export const requestLogger = pinoHttp({
  logger,
  genReqId: (request) => request.id,
  customProps: (request) => ({ requestId: request.id }),
  autoLogging: {
    ignore: (request) => request.url === '/api/v1/health',
  },
})
