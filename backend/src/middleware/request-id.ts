import { randomUUID } from 'node:crypto'

import type { NextFunction, Request, Response } from 'express'

export function requestId(request: Request, response: Response, next: NextFunction) {
  const existingRequestId = request.header('x-request-id')
  const id = existingRequestId && existingRequestId.length <= 128 ? existingRequestId : randomUUID()

  request.id = id
  response.setHeader('x-request-id', id)
  next()
}
