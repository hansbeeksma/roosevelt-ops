# [Service/API Name] API Reference

> **Version**: X.Y.Z
> **Base URL**: `https://api.example.com/v1`
> **Authentication**: Bearer token

---

## Overview

Korte beschrijving van de API en het doel.

---

## Authentication

```bash
curl -H "Authorization: Bearer <your-token-here>" \
  https://api.example.com/v1/resource
```

| Header | Value | Required |
|--------|-------|----------|
| `Authorization` | `Bearer <token>` | Yes |
| `Content-Type` | `application/json` | Yes |

---

## Endpoints

### GET /resource

Beschrijving van wat dit endpoint doet.

**Parameters**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Pagina nummer (default: 1) |
| `limit` | integer | No | Items per pagina (default: 20, max: 100) |

**Response**

```json
{
  "success": true,
  "data": [],
  "meta": {
    "total": 0,
    "page": 1,
    "limit": 20
  }
}
```

**Status Codes**

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized |
| 404 | Not found |

---

### POST /resource

Beschrijving van het create endpoint.

**Request Body**

```json
{
  "name": "string",
  "description": "string"
}
```

**Response**

```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "string",
    "created_at": "ISO 8601"
  }
}
```

---

## Error Handling

Alle errors volgen dit format:

```json
{
  "success": false,
  "error": "Human-readable error message",
  "code": "ERROR_CODE"
}
```

| Error Code | HTTP Status | Description |
|------------|-------------|-------------|
| `INVALID_INPUT` | 400 | Validatie fout |
| `UNAUTHORIZED` | 401 | Ongeldige of ontbrekende token |
| `NOT_FOUND` | 404 | Resource niet gevonden |
| `RATE_LIMITED` | 429 | Te veel requests |

---

## Rate Limiting

| Tier | Limit | Window |
|------|-------|--------|
| Free | 100 requests | Per minuut |
| Pro | 1000 requests | Per minuut |

Rate limit headers:
- `X-RateLimit-Limit`: Maximum requests
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Reset timestamp (Unix)

---

## Changelog

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | YYYY-MM-DD | Initial release |

---

*Last updated: YYYY-MM-DD*
