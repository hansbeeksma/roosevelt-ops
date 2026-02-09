---
project: "Roosevelt OPS"
version: "1.0.0"
last_updated: "2026-02-08"
maturity: "foundation"
status: "draft"
owner: "Sam Swaab"
---

# Roosevelt OPS UX Documentation

> Client Flows, Service Design, Information Architecture

---

## User Personas

### Persona 1: De Beslisser (CTO/CDO)

| Attribute | Details |
|-----------|---------|
| **Age** | 35-50 |
| **Role** | CTO, CDO, Head of Digital |
| **Company** | Midsize (50-500 medewerkers) |
| **Goals** | AI strategie valideren, concrete roadmap, betrouwbare partner |
| **Frustrations** | Consultants die alleen PowerPoints leveren, geen hands-on execution |
| **Quote** | "Ik zoek iemand die het niet alleen bedenkt, maar ook kan bouwen." |

### Persona 2: De Ondernemer

| Attribute | Details |
|-----------|---------|
| **Age** | 28-45 |
| **Role** | Founder, CEO |
| **Company** | Startup / Scale-up |
| **Goals** | Digitaal product bouwen, snel naar markt, technisch solide |
| **Frustrations** | Agencies die te duur zijn, freelancers die geen architectuur begrijpen |
| **Quote** | "Ik heb een idee en budget, maar geen technisch team." |

---

## Information Architecture

### Sitemap (Planned)

```
Roosevelt OPS
├── Home (/)
├── Diensten (/diensten)
│   ├── AI Strategie (/diensten/ai-strategie)
│   └── Digital Products (/diensten/digital-products)
├── Portfolio (/portfolio)
│   └── Case Study (/portfolio/[slug])
├── Over Ons (/over-ons)
├── Contact (/contact)
├── Blog (/blog)
│   └── Artikel (/blog/[slug])
└── Legal
    ├── Voorwaarden (/voorwaarden)
    └── Privacy (/privacy)
```

### Navigation

| Level | Type | Items |
|-------|------|-------|
| Primary | Header | Diensten, Portfolio, Over Ons, Contact |
| Utility | Header right | Blog |
| Footer | Link grid | Legal, social links |

---

## Key Flows

### Flow 1: Prospect → Contact

```
Landing → Diensten → Case Study → Contact Form → Confirmation
```

### Flow 2: Content → Trust

```
Blog Article → Related Articles → Diensten → Contact
```

---

*Template: ~/Development/shared/communicating-design/templates/03-ux-documentation.md*
