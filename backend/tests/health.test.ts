import request from 'supertest'
import { describe, expect, it } from 'vitest'

import { createApp } from '../src/app.js'

describe('operational endpoints', () => {
  it('returns a safe liveness response', async () => {
    const response = await request(createApp()).get('/api/v1/health').expect(200)

    expect(response.body).toMatchObject({
      success: true,
      data: {
        status: 'ok',
        service: 'ngo-school-erp-api',
        environment: 'test',
      },
      meta: {},
    })
    expect(response.headers['x-request-id']).toEqual(expect.any(String))
    expect(JSON.stringify(response.body)).not.toMatch(/secret|password|database_url/i)
  })

  it('reports Phase Zero configuration readiness only', async () => {
    const response = await request(createApp()).get('/api/v1/ready').expect(200)

    expect(response.body).toMatchObject({
      success: true,
      data: {
        checks: { configuration: 'ready' },
      },
    })
    expect(JSON.stringify(response.body)).not.toContain('"database"')
  })
})
