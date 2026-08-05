import { environment } from '../config/env.js'
import {
  createAdminSupabaseClient,
  createPublicSupabaseClient,
} from '../infrastructure/supabase/client.js'
import { AuditService } from '../modules/audit/application/audit.service.js'
import { SupabaseAuditRepository } from '../modules/audit/infrastructure/supabase-audit.repository.js'
import { SupabaseAuthGateway } from '../modules/auth/infrastructure/supabase-auth.gateway.js'
import { SupabaseIdentityRepository } from '../modules/identity/infrastructure/supabase-identity.repository.js'
import { SupabaseRbacRepository } from '../modules/rbac/infrastructure/supabase-rbac.repository.js'

async function bootstrapAdmin() {
  const email = environment.BOOTSTRAP_ADMIN_EMAIL
  const password = environment.BOOTSTRAP_ADMIN_PASSWORD
  const fullName = environment.BOOTSTRAP_ADMIN_FULL_NAME
  if (!email || !password || !fullName) {
    throw new Error(
      'BOOTSTRAP_ADMIN_EMAIL, BOOTSTRAP_ADMIN_PASSWORD, and BOOTSTRAP_ADMIN_FULL_NAME are required',
    )
  }

  const adminClient = createAdminSupabaseClient()
  const gateway = new SupabaseAuthGateway(createPublicSupabaseClient(), adminClient)
  const identities = new SupabaseIdentityRepository(adminClient)
  const rbac = new SupabaseRbacRepository(adminClient)
  const adminRole = (await rbac.listRoles()).find((role) => role.name === 'Admin' && role.isSystem)
  if (!adminRole) throw new Error('Run the Phase One migration before bootstrapping the Admin')

  const { data: existingAssignments, error: assignmentError } = await adminClient
    .from('user_roles')
    .select('user_id')
    .eq('role_id', adminRole.id)
    .limit(1)
  if (assignmentError) throw new Error(assignmentError.message)
  const existingAssignment = existingAssignments?.[0] ?? null
  if (existingAssignment) {
    const existingUserId: unknown = existingAssignment.user_id
    if (typeof existingUserId !== 'string') throw new Error('Invalid Admin assignment data')
    const existingProfile = await identities.findById(existingUserId)
    if (existingProfile?.email.toLowerCase() === email.toLowerCase()) {
      process.stdout.write(`Admin bootstrap already completed for ${email}\n`)
      return
    }
    throw new Error('An Admin assignment already exists; bootstrap is intentionally one-time')
  }

  const user = await gateway.createConfirmedUser(email, password, fullName)
  const profile = await identities.findAuthorizationIdentity(user.id)
  if (!profile) throw new Error('Admin Auth user was created but profile provisioning failed')
  await identities.replaceRoles(profile.id, [adminRole.id], profile.id)
  await new AuditService(new SupabaseAuditRepository(adminClient)).record({
    actorProfileId: profile.id,
    action: 'identity.admin.bootstrapped',
    outcome: 'success',
    entityType: 'profile',
    entityId: profile.id,
  })
  process.stdout.write(`Admin bootstrap completed for ${email}\n`)
}

bootstrapAdmin().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown bootstrap error'
  process.stderr.write(`Admin bootstrap failed: ${message}\n`)
  process.exitCode = 1
})
