import { describe, expect, it } from 'vitest'
import { createCommunicationRouter } from '../src/modules/communication/http/communication.routes.js'

describe('Communication Module HTTP Routes', () => {
  it('creates communication router instance cleanly', () => {
    const mockService = {
      listConversations: async () => [],
      createConversation: async () => ({} as any),
      getConversationById: async () => null,
      isParticipant: async () => true,
      getMessages: async () => [],
      sendMessage: async () => ({} as any),
      listComplaints: async () => [],
      createComplaint: async () => ({} as any),
      getComplaintById: async () => null,
      getComplaintTimeline: async () => [],
      assignComplaint: async () => ({} as any),
      updateComplaintStatus: async () => ({} as any),
      resolveComplaint: async () => ({} as any),
    } as any

    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { checkPermission: async () => true } as any
    const mockAudit = { log: async () => {} } as any

    const router = createCommunicationRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('validates resolution note in service layer', async () => {
    const { CommunicationService } = await import('../src/modules/communication/application/communication.service.js')
    const mockRepo = {
      resolveComplaint: async () => ({} as any),
    } as any

    const service = new CommunicationService(mockRepo)

    await expect(
      service.resolveComplaint('admin-1', 'comp-1', { resolution: '   ' })
    ).rejects.toThrow('Resolution note is required')
  })
})
