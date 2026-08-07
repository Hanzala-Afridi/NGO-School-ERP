import { describe, expect, it } from 'vitest'

import { createExamsRouter } from '../src/modules/exams/http/exams.routes.js'
import { SupabaseExamsRepository } from '../src/modules/exams/infrastructure/supabase-exams.repository.js'

describe('Exams Module HTTP Routes', () => {
  it('creates exams router instance cleanly', () => {
    const mockService = {
      listExams: async () => [],
      createExam: async () => ({} as any),
      getExamById: async () => null,
      updateExamStatus: async () => ({} as any),
      listExamComponents: async () => [],
      createExamComponent: async () => ({} as any),
      getComponentResults: async () => [],
      bulkEnterMarks: async () => [],
      approveExamResults: async () => ({} as any),
      publishExamResults: async () => ({} as any),
      getStudentReportCard: async () => null,
      getParentChildResults: async () => [],
    } as any

    const mockAuth = { authenticate: () => (_req: any, _res: any, next: any) => next() } as any
    const mockRbac = { checkPermission: async () => true } as any
    const mockAudit = { log: async () => {} } as any

    const router = createExamsRouter({
      service: mockService,
      authentication: mockAuth,
      authorization: mockRbac,
      audit: mockAudit,
    })

    expect(router).toBeDefined()
  })

  it('validates negative marks logic in service layer', async () => {
    const { ExamsService } = await import('../src/modules/exams/application/exams.service.js')
    const mockRepo = {
      bulkEnterMarks: async () => [],
    } as any

    const service = new ExamsService(mockRepo)

    await expect(
      service.bulkEnterMarks('profile-1', {
        componentId: 'comp-1',
        results: [{ studentId: 'stu-1', marksObtained: -5 }],
      })
    ).rejects.toThrow('Negative marks not allowed')
  })

  it('invokes atomic rpc_bulk_enter_marks function in repository', async () => {
    const mockSupabase = {
      rpc: async (fnName: string, args: any) => {
        expect(fnName).toBe('rpc_bulk_enter_marks')
        expect(args.p_component_id).toBe('comp-1')
        return { data: { success: true }, error: null }
      },
      from: () => ({
        select: () => ({
          eq: async () => ({ data: [], error: null }),
        }),
      }),
    } as any

    const repo = new SupabaseExamsRepository(mockSupabase)
    const results = await repo.bulkEnterMarks('actor-1', {
      componentId: 'comp-1',
      results: [{ studentId: 'stu-1', marksObtained: 85 }],
    })
    expect(results).toEqual([])
  })

  it('invokes atomic rpc_approve_exam_results function in repository', async () => {
    const mockSupabase = {
      rpc: async (fnName: string, args: any) => {
        expect(fnName).toBe('rpc_approve_exam_results')
        expect(args.p_exam_id).toBe('exam-1')
        return { data: { success: true }, error: null }
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: 'exam-1',
                academic_year_id: 'y-1',
                term_id: 't-1',
                name: 'Mid-Term',
                start_date: '2026-09-01',
                end_date: '2026-09-10',
                status: 'approved',
                created_by: 'actor-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }),
    } as any

    const repo = new SupabaseExamsRepository(mockSupabase)
    const exam = await repo.approveExamResults('actor-1', 'exam-1')
    expect(exam.status).toBe('approved')
  })

  it('invokes atomic rpc_publish_exam_results function in repository', async () => {
    const mockSupabase = {
      rpc: async (fnName: string, args: any) => {
        expect(fnName).toBe('rpc_publish_exam_results')
        expect(args.p_exam_id).toBe('exam-1')
        return { data: { success: true }, error: null }
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: {
                id: 'exam-1',
                academic_year_id: 'y-1',
                term_id: 't-1',
                name: 'Mid-Term',
                start_date: '2026-09-01',
                end_date: '2026-09-10',
                status: 'published',
                created_by: 'actor-1',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
              error: null,
            }),
          }),
        }),
      }),
    } as any

    const repo = new SupabaseExamsRepository(mockSupabase)
    const exam = await repo.publishExamResults('actor-1', 'exam-1')
    expect(exam.status).toBe('published')
  })
})
