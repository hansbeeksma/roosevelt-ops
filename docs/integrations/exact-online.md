# Exact Online Integration

Exact Online is a Dutch ERP/accounting SaaS widely used by Dutch SMBs.
Roosevelt OPS integrates with it for financial data sync (invoices, contacts).

---

## Setup

### 1. Create an Exact Online App

1. Log in to the [Exact Online App Center](https://apps.exactonline.com/).
2. Navigate to **Your Apps** > **Register a new app**.
3. Set the redirect URI to your callback URL:
   - Production: `https://app.rooseveltops.nl/api/auth/exact/callback`
   - Local dev: `http://localhost:3001/api/auth/exact/callback`
4. Note your **Client ID** and **Client Secret**.

### 2. Configure Environment Variables

Add the following to your `.env` (API server):

```env
# Exact Online OAuth
EXACT_CLIENT_ID=your-client-id
EXACT_CLIENT_SECRET=your-client-secret
EXACT_REDIRECT_URI=https://app.rooseveltops.nl/api/auth/exact/callback

# AES-256-GCM token encryption key (32 bytes = 64 hex chars)
# Generate: openssl rand -hex 32
EXACT_ENCRYPTION_KEY=your-64-char-hex-key
```

`EXACT_ENCRYPTION_KEY` must be a 64-character hex string (32 bytes).
Generate one with: `openssl rand -hex 32`

### 3. Run the Migration

```bash
supabase db push
# or
psql $DATABASE_URL < supabase/migrations/20260226800008_exact_online.sql
```

---

## OAuth Flow

```
User browser                Roosevelt OPS API           Exact Online
     |                             |                         |
     |  GET /api/auth/exact/connect?org_id=xxx               |
     |----------------------------->                         |
     |                             |                         |
     |  Store PKCE session         |                         |
     |  (state -> code_verifier)   |                         |
     |                             |                         |
     |  302 Redirect to Exact Online auth URL                |
     |<----------------------------                          |
     |                             |                         |
     |  User authorises app        |                         |
     |-------------------------------------------------->   |
     |                             |                         |
     |  302 Redirect /api/auth/exact/callback?code=&state=   |
     |<----------------------------------------------------  |
     |                             |                         |
     |  GET /api/auth/exact/callback?code=...&state=...      |
     |----------------------------->                         |
     |                             |                         |
     |  Validate state + PKCE      |                         |
     |  POST /api/oauth2/token     |                         |
     |                             |-----------------------> |
     |                             |  { access_token, ... }  |
     |                             |<----------------------- |
     |                             |                         |
     |  Fetch /current/Me          |                         |
     |  (resolve division ID)      |-----------------------> |
     |                             |<----------------------- |
     |                             |                         |
     |  Encrypt + store tokens     |                         |
     |  in exact_connections       |                         |
     |                             |                         |
     |  302 /settings/integrations?connected=exact           |
     |<----------------------------                          |
```

---

## API Reference

### Base URLs

| Resource       | URL                                              |
|----------------|--------------------------------------------------|
| Auth endpoint  | `https://start.exactonline.nl/api/oauth2/auth`   |
| Token endpoint | `https://start.exactonline.nl/api/oauth2/token`  |
| API base       | `https://start.exactonline.nl/api/v1`            |

### Endpoints (Roosevelt OPS)

| Method   | Path                          | Description                          |
|----------|-------------------------------|--------------------------------------|
| GET      | `/api/auth/exact/connect`     | Initiate OAuth flow                  |
| GET      | `/api/auth/exact/callback`    | Handle OAuth callback (do not call directly) |
| GET      | `/api/auth/exact/status`      | Check connection status for an org   |
| DELETE   | `/api/auth/exact/disconnect`  | Revoke tokens and remove connection  |

#### GET /api/auth/exact/connect

Query parameters:

| Parameter | Required | Description              |
|-----------|----------|--------------------------|
| `org_id`  | Yes      | Organisation UUID        |

Redirects to Exact Online authorization URL.

#### GET /api/auth/exact/status

Query parameters:

| Parameter | Required | Description       |
|-----------|----------|-------------------|
| `org_id`  | Yes      | Organisation UUID |

Response:

```json
{
  "connected": true,
  "token_expired": false,
  "org_id": "uuid",
  "division_id": 12345,
  "connected_at": "2026-02-26T12:00:00Z",
  "expires_at": "2026-02-26T13:00:00Z"
}
```

#### DELETE /api/auth/exact/disconnect

Request body:

```json
{ "org_id": "uuid" }
```

Response:

```json
{ "disconnected": true, "org_id": "uuid" }
```

---

## Available API Resources

These resources are available via the API client (`lib/integrations/exact-online/client.ts`):

### Sales Invoices

```typescript
import { fetchInvoices } from '@/lib/integrations/exact-online/client'

const invoices = await fetchInvoices(orgId)
// With year filter:
const invoices2026 = await fetchInvoices(orgId, '2026')
```

Fields: `InvoiceID`, `InvoiceNumber`, `OrderedBy`, `AmountDC`, `VATAmountDC`, `InvoiceDate`, `Status`

Invoice statuses:

| Value | Meaning            |
|-------|--------------------|
| 20    | Draft              |
| 50    | On hold            |
| 55    | Partially delivered|
| 70    | Delivered          |

### Contacts (CRM)

```typescript
import { fetchContacts } from '@/lib/integrations/exact-online/client'

const contacts = await fetchContacts(orgId)
```

Fields: `ID`, `FullName`, `Email`, `AccountName`

### Generic API Access

```typescript
import { fetchExactResource } from '@/lib/integrations/exact-online/client'

const data = await fetchExactResource(orgId, `/${divisionId}/financial/GLAccounts`)
```

---

## Security

- Access and refresh tokens are encrypted with **AES-256-GCM** before storage.
- The `EXACT_ENCRYPTION_KEY` is never exposed to the client.
- PKCE (S256) is used for every authorization flow to prevent code interception.
- PKCE sessions expire after **10 minutes** and are deleted after use.
- RLS policies on `exact_connections` allow org members to read only their own row.
- Token revocation is attempted on disconnect (best-effort).
- Tokens are auto-refreshed when within 60 seconds of expiry.

---

## Troubleshooting

| Symptom                              | Likely cause                              | Fix                                          |
|--------------------------------------|-------------------------------------------|----------------------------------------------|
| 503 on `/connect`                    | Missing env vars                          | Check `EXACT_CLIENT_ID`, `EXACT_REDIRECT_URI`|
| `Invalid or expired OAuth session`   | PKCE session expired (>10 min)            | Restart the connect flow                     |
| `Token decryption failed`            | `EXACT_ENCRYPTION_KEY` changed            | Reconnect the organisation                   |
| `division_id` is 0 after connect     | `/current/Me` call failed during callback | Check Exact Online API access; reconnect     |
| `No Exact Online connection found`   | Org not connected                         | Direct user to `/api/auth/exact/connect`     |

---

## Source Files

| File                                                                 | Purpose                         |
|----------------------------------------------------------------------|---------------------------------|
| `lib/integrations/exact-online/auth.ts`                             | OAuth flow, token storage       |
| `lib/integrations/exact-online/client.ts`                           | API client, resource helpers    |
| `apps/api/src/modules/integrations/exact.routes.ts`                 | Fastify route handlers          |
| `supabase/migrations/20260226800008_exact_online.sql`               | DB schema (connections + PKCE)  |
