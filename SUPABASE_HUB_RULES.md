# Supabase Project Hub Rules — CommercialIQ

App slug/schema: `commercialiq`

This application shares a Supabase project with independent applications.

## Core boundary

This app may normally modify only:

```text
commercialiq.*
```

It must not modify another application's objects.

## Mandatory first checks

```sql
select * from hub.read_me_first;

select
  app_number,
  slug,
  display_name,
  schema_name,
  status,
  safety_contract_version,
  safety_contract_acknowledged_at
from hub.apps
where slug = 'commercialiq';

select hub.assert_app_scope('commercialiq', 'commercialiq');
```

If any check fails: STOP.

## Database rules

- use fully-qualified names
- one app = one schema
- keep `public` empty as practical
- enable RLS on every user-facing table
- test cross-user access
- do not create cross-app foreign keys
- keep migrations app-prefixed

## Shared Auth

All Hub apps share `auth.users`.

Do not edit `auth.users` directly.

Use app membership/authorization rules where required.

## Storage

Use only app-prefixed buckets, e.g.:

```text
commercialiq-avatars
commercialiq-files
```

## Functions

Use app-prefixed Edge Function names or functions inside the `commercialiq` schema.

## Secrets

Never expose:
- service-role key
- secret key
- database password
- third-party API secrets

Project-level privileged credentials are Hub-admin only.

## High-risk operations

Ask the user before:
- project-wide Auth changes
- key rotation
- extensions
- billing/compute/region changes
- project pause/delete
- any cross-app operation

## Destructive operations

Before DROP/DELETE/TRUNCATE:
- verify exact schema/object
- verify it belongs to this app
- verify data-loss impact
- verify no cross-app dependency

If uncertain: STOP.
