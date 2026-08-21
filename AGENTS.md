# Project Hub Agent Boundary

This repository uses a shared Supabase **Project Hub**.

Application: `CommercialIQ`
Assigned app slug/schema: `commercialiq`

## Mandatory before any Supabase write

1. Read `SUPABASE_HUB_RULES.md`.
2. Read `hub.read_me_first`.
3. Verify this app in `hub.apps`.
4. Run:

```sql
select hub.assert_app_scope('commercialiq', 'commercialiq');
```

If any check fails, stop.

## Allowed boundary

```text
commercialiq.*
```

plus explicitly registered `commercialiq`-prefixed resources.

## Protected

```text
hub.*
public.*
auth.*
storage.*
realtime.*
every other application schema
project-wide configuration
```

Never:
- modify another app
- create ordinary app tables in `public`
- run unscoped destructive SQL
- disable RLS as a shortcut
- expose or commit project-level secret/service-role credentials
- change project-wide settings without explicit user approval

When a requested change could affect another project/app, stop and ask the user.
