# Portal Authentication Architecture

## Overview

Client authenticatie voor het Roosevelt OPS client portal, gebouwd op Clerk magic links. Externe clients ontvangen een uitnodigingslink via email, waarmee ze zonder wachtwoord toegang krijgen tot hun projecten.

## Package

`@roosevelt/portal-auth` (`packages/portal-auth/`) -- shared library die door de portal app (`apps/portal/`) wordt geconsumeerd.

## Magic Link Flow

```
1. Admin maakt uitnodiging aan
   -> createMagicLinkInvite({ email, organizationId, projectIds })

2. Clerk verstuurt email met magic link
   -> Client ontvangt link naar /accept-invite?invitation_id=xxx

3. Client klikt op link
   -> Clerk sign-in/sign-up (geen wachtwoord nodig)
   -> Automatische toevoeging aan organization

4. Portal middleware checkt authenticatie
   -> portalAuthMiddleware beschermt alle non-public routes

5. Server Components gebruiken helpers
   -> getPortalUser() haalt user + metadata op
   -> requirePortalAuth() gooit error als niet ingelogd
   -> hasProjectAccess(user, projectId) checkt project toegang
```

## Clerk Metadata Structuur

Portal-specifieke data wordt opgeslagen in de `publicMetadata` van de Clerk organization membership:

```typescript
interface PortalMembershipMetadata {
  portalRole: string        // 'client' (maps naar RBAC client rol)
  projectIds: string[]      // UUIDs van toegankelijke projecten
  expiresAt: string         // ISO 8601 expiration timestamp
}
```

## Client Uitnodigen

### Via code (admin dashboard / API route)

```typescript
import { createMagicLinkInvite } from '@roosevelt/portal-auth'

const result = await createMagicLinkInvite({
  email: 'client@bedrijf.nl',
  organizationId: 'org_xxx',
  projectIds: ['project-uuid-1', 'project-uuid-2'],
  role: 'client',
  expiresInDays: 30,
})
```

### Parameters

| Parameter | Type | Default | Beschrijving |
|-----------|------|---------|--------------|
| `email` | `string` | required | Email van de client |
| `organizationId` | `string` | required | Clerk organization ID |
| `projectIds` | `string[]` | required | Project UUIDs waartoe client toegang krijgt |
| `role` | `string` | `'client'` | Portal rol (mapped naar RBAC) |
| `expiresInDays` | `number` | `30` | Dagen tot uitnodiging verloopt |

## Role Mapping naar RBAC

| Clerk Org Role | Portal Role (metadata) | RBAC Role (Supabase) |
|---------------|------------------------|---------------------|
| `org:admin` | -- | `admin` |
| `org:member` | `'client'` | `client` |
| `org:member` | `'viewer'` | `client` (read-only) |

De `portalRole` in Clerk metadata wordt gekoppeld aan de RBAC `client` rol uit `supabase/migrations/20260226200002_seed_rbac.sql`.

## Portal Middleware

De middleware beschermt alle routes behalve:
- `/sign-in(.*)` -- Clerk sign-in pagina
- `/accept-invite(.*)` -- Uitnodiging acceptatie
- `/api/webhooks(.*)` -- Clerk webhooks

```typescript
// apps/portal/src/middleware.ts
import { portalAuthMiddleware } from '@roosevelt/portal-auth'

export default portalAuthMiddleware

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
}
```

## Helpers voor Server Components

```typescript
import { getPortalUser, requirePortalAuth, requireProjectAccess } from '@roosevelt/portal-auth'

// Nullable -- voor conditional rendering
const user = await getPortalUser()

// Throws als niet ingelogd -- voor protected pages
const user = await requirePortalAuth()

// Throws als geen project toegang -- voor project-specifieke pages
const user = await requireProjectAccess('project-uuid')
```

## Componenten

### AcceptInvite

Client-side component voor de uitnodiging-acceptatie pagina:

```tsx
import { AcceptInvite } from '@roosevelt/portal-auth'

export default function AcceptInvitePage({ searchParams }) {
  return <AcceptInvite invitationId={searchParams.invitation_id} />
}
```

## Relatie met Andere Modules

| Module | Relatie |
|--------|--------|
| `apps/web/src/lib/auth.ts` | Admin auth helpers (bestaand) |
| `apps/web/src/middleware.ts` | Admin middleware met CORS/rate limiting |
| `apps/portal/` (ROOSE-349) | Consumer van dit package |
| RBAC systeem (ROOSE-350) | `client` rol definitie in Supabase |
| Clerk (ROOSE-346) | Underlying auth provider |
