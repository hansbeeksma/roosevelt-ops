# Setup Guide - Roosevelt OPS Metrics Dashboard

Complete setup guide voor lokale development en productie deployment.

## Table of Contents

1. [Lokale Development Setup](#lokale-development-setup)
2. [Database Schema](#database-schema)
3. [Environment Variables](#environment-variables)
4. [Running the Dashboard](#running-the-dashboard)
5. [Testing](#testing)

---

## Lokale Development Setup

### Vereisten

- Node.js 18+
- npm of yarn
- Docker Desktop (voor lokale Supabase)
- Git

### Installatie Stappen

#### 1. Clone Repository

```bash
git clone https://github.com/hansbeeksma/roosevelt-ops.git
cd roosevelt-ops
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Supabase CLI Installeren

```bash
# macOS
brew install supabase/tap/supabase

# Windows
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
scoop install supabase

# Linux
brew install supabase/tap/supabase
```

#### 4. Start Lokale Supabase

```bash
# Initialize (eenmalig)
supabase init

# Start alle services (PostgreSQL, API, Studio, etc.)
supabase start
```

Dit start:
- **PostgreSQL** op localhost:54322
- **Supabase Studio** op http://127.0.0.1:54323
- **API** op http://127.0.0.1:54321

Bewaar de credentials die getoond worden!

#### 5. Database Migraties

```bash
# Migraties zijn automatisch toegepast tijdens 'supabase start'
# Controleer met:
supabase db reset
```

Verwachte output:
```
✅ DORA Metrics Schema Setup Complete! (59 rows)
✅ SPACE Metrics Schema Setup Complete! (21 rows)
```

#### 6. Environment Variables

```bash
# Kopieer example file
cp .env.local.example .env.local

# Edit .env.local met lokale credentials
```

`.env.local` inhoud:
```env
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key-from-supabase-start>
```

#### 7. Start Development Server

```bash
npm run dev
```

Open http://localhost:3000 in je browser.

---

## Database Schema

### DORA Metrics Tables

#### `dora_metrics`
Rauwe DORA metrics data van GitHub Actions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| event_type | TEXT | deployment, push, pull_request, workflow_run |
| repository | TEXT | Repository naam |
| timestamp | TIMESTAMPTZ | Event timestamp |
| deployment_frequency | INTEGER | Deployment count |
| environment | TEXT | production, staging, development |
| lead_time_hours | NUMERIC | Tijd van commit tot deployment |
| deployment_failed | BOOLEAN | Deployment failure indicator |

#### `incidents`
Productie incidents voor MTTR tracking.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| incident_number | INTEGER | Issue number |
| title | TEXT | Incident beschrijving |
| severity | TEXT | critical, high, medium, low |
| created_at | TIMESTAMPTZ | Incident start |
| resolved_at | TIMESTAMPTZ | Incident resolved |
| mttr_hours | NUMERIC | Mean time to recovery |

#### `dora_summary` (Materialized View)
Daily aggregaties voor dashboard visualisatie.

### SPACE Framework Tables

#### `developer_surveys`
Developer satisfaction metrics (NPS, work satisfaction, etc.).

| Column | Type | Description |
|--------|------|-------------|
| survey_date | DATE | Survey datum |
| developer_id | TEXT | Developer identifier |
| nps_score | INTEGER | 0-10 NPS score |
| work_satisfaction | INTEGER | 1-5 scale |
| team_collaboration | INTEGER | 1-5 scale |

#### `code_quality_metrics`
Code quality per PR.

| Column | Type | Description |
|--------|------|-------------|
| pr_number | INTEGER | PR nummer |
| code_coverage_pct | NUMERIC | Test coverage percentage |
| complexity_score | INTEGER | Cyclomatic complexity |
| review_comments | INTEGER | Review comments count |

#### `developer_activity`
Daily developer activity tracking.

| Column | Type | Description |
|--------|------|-------------|
| activity_date | DATE | Activity datum |
| developer_id | TEXT | Developer identifier |
| commits | INTEGER | Commits count |
| prs_created | INTEGER | PRs created |
| prs_reviewed | INTEGER | PRs reviewed |

#### `code_review_metrics`
Code review interaction metrics.

| Column | Type | Description |
|--------|------|-------------|
| pr_number | INTEGER | PR nummer |
| reviewer | TEXT | Reviewer identifier |
| first_response_time_minutes | INTEGER | Time to first response |
| cross_team | BOOLEAN | Cross-team collaboration |

#### `efficiency_metrics`
Developer efficiency tracking.

| Column | Type | Description |
|--------|------|-------------|
| efficiency_date | DATE | Efficiency datum |
| developer_id | TEXT | Developer identifier |
| focus_time_minutes | INTEGER | Deep work time |
| meeting_time_minutes | INTEGER | Meeting time |
| context_switches | INTEGER | Context switch count |

#### `space_summary` (Materialized View)
Weekly aggregaties voor SPACE framework dashboard.

---

## Environment Variables

### Lokale Development

```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Productie (Vercel)

```env
# Vercel Environment Variables
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Let op:** Altijd `NEXT_PUBLIC_` prefix gebruiken voor client-side variabelen!

---

## Running the Dashboard

### Development Mode

```bash
npm run dev
```

Features:
- Hot reload
- Source maps
- Detailed error messages
- Runs op http://localhost:3000

### Production Build (Lokaal Testen)

```bash
# Build
npm run build

# Start production server
npm start
```

Features:
- Optimized bundles
- Minified code
- Runs op http://localhost:3000

### Supabase Studio

```bash
# Open Supabase Studio (database UI)
supabase studio
```

Of ga naar http://127.0.0.1:54323

Features:
- Table editor
- SQL editor
- Database explorer
- Authentication management

---

## Testing

### Database Queries Testen

```bash
# Via Supabase Studio
supabase studio

# Of via psql
psql postgresql://postgres:postgres@127.0.0.1:54322/postgres
```

Voorbeeld queries:

```sql
-- Test DORA performance tier
SELECT * FROM get_dora_performance_tier();

-- Test SPACE scores
SELECT * FROM get_space_scores();

-- View recent DORA metrics
SELECT * FROM dora_summary ORDER BY date DESC LIMIT 7;

-- View SPACE summary
SELECT * FROM space_summary ORDER BY week_start DESC LIMIT 4;
```

### Frontend Components Testen

```bash
# Start dev server
npm run dev

# Open browser
open http://localhost:3000
```

Verifieer:
- [ ] Dashboard laadt zonder errors
- [ ] DORA Performance Tier tabel toont data
- [ ] 4 DORA charts renderen correct
- [ ] SPACE Scores tabel toont 5 dimensies
- [ ] 6 SPACE charts renderen correct

### GitHub Actions Lokaal Testen

```bash
# Install act (GitHub Actions lokaal runner)
brew install act

# Test DORA metrics workflow
act push -W .github/workflows/dora-metrics.yml

# Test MTTR workflow
act issues -W .github/workflows/dora-mttr.yml
```

---

## Troubleshooting

### Supabase start faalt

**Probleem:** Docker not running

**Oplossing:**
```bash
# Start Docker Desktop
open -a Docker

# Wacht tot Docker draait
docker ps

# Probeer opnieuw
supabase start
```

### Migratie errors

**Probleem:** Duplicate key errors

**Oplossing:**
```bash
# Reset database
supabase db reset

# Verifieer migraties
ls -la supabase/migrations/
```

### Dashboard toont "No data available"

**Probleem:** Sample data niet geladen

**Oplossing:**
```bash
# Reset database (laadt sample data opnieuw)
supabase db reset

# Verifieer via Studio
supabase studio
# Check tables: dora_metrics, developer_surveys, etc.
```

### Build errors

**Probleem:** Missing dependencies

**Oplossing:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Charts niet zichtbaar

**Probleem:** Tremor chart rendering issues

**Oplossing:**
- Check browser console voor errors
- Verifieer dat data niet null/undefined is
- Hard refresh browser (Cmd+Shift+R)

---

## Handige Commands

```bash
# Supabase
supabase start          # Start lokale instance
supabase stop           # Stop alle services
supabase db reset       # Reset + reload sample data
supabase db push        # Push migraties naar cloud
supabase studio         # Open database UI

# Next.js
npm run dev             # Development server
npm run build           # Production build
npm start               # Start production server
npm run lint            # Run ESLint

# Git
git status              # Check changes
git log --oneline       # View commits
```

---

## Volgende Stappen

1. **Lokale development** - Setup compleet, begin met development
2. **Cloud deployment** - Volg `DEPLOYMENT.md` voor productie setup
3. **Custom features** - Voeg eigen metrics toe
4. **Team onboarding** - Share deze guide met team

---

**Setup Status:** ✅ Complete

*Laatste update: 2026-02-05*
