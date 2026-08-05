import pino from 'pino'

import { environment } from '../config/env.js'

export const logger = pino({
  level: environment.LOG_LEVEL,
  base: {
    service: 'ngo-school-erp-api',
    environment: environment.NODE_ENV,
  },
  redact: {
    paths: [
      'req.headers.authorization',
      'req.headers.cookie',
      'req.body.password',
      'req.body.newPassword',
      'accessToken',
      'refreshToken',
      'res.headers["set-cookie"]',
      '*.password',
      '*.token',
      '*.secret',
      '*.phone',
      '*.email',
      '*.address',
    ],
    censor: '[REDACTED]',
  },
})
