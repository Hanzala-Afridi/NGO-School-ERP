import { describe, expect, it, vi } from 'vitest'
import { fetchWithTimeout } from '../src/infrastructure/supabase/client.js'
import { errorHandler } from '../src/middleware/error-handler.js'

describe('Database Query Timeout & AbortSignal Enforcement', () => {
  it('aborts stalled HTTP fetch requests exceeding configured timeout', async () => {
    vi.useFakeTimers()

    const slowFetch = vi.fn().mockImplementation((_url, options) => {
      return new Promise((_resolve, reject) => {
        if (options?.signal) {
          options.signal.addEventListener('abort', () => {
            const err = new Error('The operation was aborted')
            err.name = 'AbortError'
            reject(err)
          })
        }
      })
    })

    vi.stubGlobal('fetch', slowFetch)

    const promise = fetchWithTimeout('http://localhost:54321/rest/v1/test', {})
    vi.advanceTimersByTime(6000)

    await expect(promise).rejects.toThrow('The operation was aborted')
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('maps AbortError to standardized QUERY_TIMEOUT response without leaking secrets', () => {
    const abortErr = new Error('This operation was aborted')
    abortErr.name = 'AbortError'

    const req = { id: 'req-test-123' } as any
    let statusSent = 0
    let jsonSent: any = null

    const res = {
      status: (s: number) => {
        statusSent = s
        return res
      },
      json: (j: any) => {
        jsonSent = j
        return res
      },
    } as any

    errorHandler(abortErr, req, res, () => {})

    expect(statusSent).toBe(504)
    expect(jsonSent).toEqual({
      success: false,
      error: {
        code: 'QUERY_TIMEOUT',
        message: 'Database request timed out',
        details: [],
      },
    })
    expect(JSON.stringify(jsonSent)).not.toContain('SUPABASE_SECRET_KEY')
    expect(JSON.stringify(jsonSent)).not.toContain('stack')
  })
})
