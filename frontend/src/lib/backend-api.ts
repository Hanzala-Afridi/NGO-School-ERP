import type { ApiResponse, AuthSession, CurrentIdentity } from '@ngo-school-erp/contracts'

import { serverEnvironment } from '@/lib/env'

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(`${serverEnvironment.BACKEND_URL}/api/v1${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      'content-type': 'application/json',
      ...init.headers,
    },
  })
  const payload = (await response.json()) as ApiResponse<T>
  if (!payload.success) throw new Error(payload.error.message)
  return payload.data
}

export function login(email: string, password: string): Promise<AuthSession> {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
}

export function requestPasswordRecovery(email: string): Promise<{ message: string }> {
  return request('/auth/password-recovery', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export function updatePassword(accessToken: string, newPassword: string): Promise<void> {
  return request('/auth/password', {
    method: 'PATCH',
    headers: { authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ newPassword }),
  }).then(() => undefined)
}

export function logout(accessToken: string): Promise<void> {
  return request('/auth/logout', {
    method: 'POST',
    headers: { authorization: `Bearer ${accessToken}` },
  }).then(() => undefined)
}

export function getCurrentIdentity(accessToken: string): Promise<CurrentIdentity> {
  return request('/auth/me', {
    method: 'GET',
    headers: { authorization: `Bearer ${accessToken}` },
  })
}
