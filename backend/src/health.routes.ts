import { Router } from 'express'

import { environment } from './config/env.js'
import { successResponse } from './shared/api-response.js'

export const healthRouter = Router()

function operationalDetails(requestId: string) {
  return {
    status: 'ok' as const,
    service: 'ngo-school-erp-api',
    environment: environment.NODE_ENV,
    version: process.env.npm_package_version ?? '0.1.0',
    timestamp: new Date().toISOString(),
    requestId,
  }
}

healthRouter.get('/health', (request, response) => {
  void request
  const requestId = response.getHeader('x-request-id')
  response
    .status(200)
    .json(
      successResponse(operationalDetails(typeof requestId === 'string' ? requestId : 'unknown')),
    )
})

healthRouter.get('/ready', (request, response) => {
  void request
  const requestId = response.getHeader('x-request-id')
  response.status(200).json(
    successResponse({
      ...operationalDetails(typeof requestId === 'string' ? requestId : 'unknown'),
      checks: {
        configuration: 'ready' as const,
      },
    }),
  )
})
