import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../src/app.js'

describe('error responses', () => {
  it('returns the standard envelope for an unknown route', async () => {
    const response = await request(createApp()).get('/api/v1/unknown').expect(404)

    expect(response.body).toEqual({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Route GET /api/v1/unknown was not found',
        details: [],
      },
    })
  })
})
