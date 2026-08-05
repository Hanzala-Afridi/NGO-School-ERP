import { describe, expect, it, vi } from 'vitest'

import { SupabaseAuthGateway } from '../src/modules/auth/infrastructure/supabase-auth.gateway.js'

function publicClient() {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: '00000000-0000-4000-8000-000000000001' } },
        error: null,
      }),
      getClaims: vi.fn().mockResolvedValue({
        data: { claims: { session_id: '00000000-0000-4000-8000-000000000002' } },
        error: null,
      }),
    },
  }
}

describe('SupabaseAuthGateway token verification', () => {
  it('accepts a token only while its Auth session exists', async () => {
    const publicApi = publicClient()
    const adminApi = {
      rpc: vi.fn().mockResolvedValue({ data: true, error: null }),
    }
    const gateway = new SupabaseAuthGateway(publicApi as never, adminApi as never)

    await expect(gateway.verify('access-token')).resolves.toMatchObject({
      sessionId: '00000000-0000-4000-8000-000000000002',
    })
    expect(adminApi.rpc).toHaveBeenCalledWith('is_auth_session_active', {
      target_session_id: '00000000-0000-4000-8000-000000000002',
      target_user_id: '00000000-0000-4000-8000-000000000001',
    })
  })

  it('rejects a JWT whose Auth session has been revoked', async () => {
    const publicApi = publicClient()
    const gateway = new SupabaseAuthGateway(
      publicApi as never,
      { rpc: vi.fn().mockResolvedValue({ data: false, error: null }) } as never,
    )

    await expect(gateway.verify('access-token')).rejects.toThrow('REVOKED_ACCESS_TOKEN')
  })

  it('revokes the current Auth session through the server Admin API', async () => {
    const signOut = vi.fn().mockResolvedValue({ data: null, error: null })
    const gateway = new SupabaseAuthGateway(
      publicClient() as never,
      { auth: { admin: { signOut } } } as never,
    )

    await expect(gateway.logout('access-token')).resolves.toBeUndefined()
    expect(signOut).toHaveBeenCalledWith('access-token', 'local')
  })
})
