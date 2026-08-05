# Database migrations

Phase One adds the identity, RBAC, and immutable security-audit migration. No
business-domain tables are included.

When a database phase is approved:

1. Use the current Supabase CLI and inspect its `--help` output.
2. Create migration files with `supabase migration new <descriptive-name>`.
3. Keep committed migrations immutable and ordered.
4. Include constraints, indexes, grants, and RLS policies with their tables.
5. Verify migrations against a disposable local database before deployment.
6. Run Supabase database advisors and review the security results.

Do not make undocumented production-only schema changes.
