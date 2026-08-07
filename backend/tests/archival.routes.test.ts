import { describe, expect, it } from 'vitest'
import { createArchivalRouter } from '../src/modules/archival/http/archival.routes.js'
import { ArchivalService } from '../src/modules/archival/application/archival.service.js'

describe('Historical Academic Year Archival HTTP Routes & Security Rules', () => {
  it('instantiates archival router cleanly', () => {
    const mockService = {} as any
    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { requirePermission: () => {} } as any
    const mockAudit = { record: async () => {} } as any

    const router = createArchivalRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('validates academic year ID on archival request', async () => {
    const mockRepo = {} as any
    const service = new ArchivalService(mockRepo)

    await expect(service.archiveAcademicYear('actor-1', { academicYearId: '' })).rejects.toThrow(
      'Academic year ID is required'
    )
  })
})
