# Roosevelt OPS

Operations hub voor Roosevelt - Professionele onderneming voor AI strategie en Digital product development.

## Project Overview

**Founded:** November 2024
**Location:** Amsterdam
**Founder:** Sam Swaab
**Focus:** AI Strategy & Digital Product Development

## Engineering Metrics Dashboard (ROOSE-29)

DORA + SPACE metrics implementatie voor engineering performance tracking.

### Phase 1: DORA Baseline Collection ✅ COMPLETED

**Stack:**
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Authentication)
- Tremor React (Data Visualization)
- GitHub Actions (Automated Metrics Collection)

**DORA Metrics Tracked:**
1. **Deployment Frequency** - How often code is deployed to production
2. **Lead Time for Changes** - Time from commit to production
3. **Change Failure Rate** - Percentage of deployments causing failures
4. **Mean Time to Recovery (MTTR)** - Time to restore service after incident

**Performance Tiers:**
- **Elite**: Multiple deployments/day, <1 day lead time, <15% failure rate, <1 hour recovery
- **High**: Daily-weekly deployments, 1-7 days lead time, 16-30% failure rate, <1 day recovery
- **Medium**: Weekly-monthly deployments, 1-6 months lead time, 31-45% failure rate, <1 week recovery
- **Low**: Monthly+ deployments, 6+ months lead time, 46%+ failure rate, 1+ week recovery

### Setup Instructions

#### 1. Environment Configuration

```bash
cp .env.local.example .env.local
```

Fill in your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

#### 2. Database Setup

Run the Supabase migration:
```bash
# If using Supabase CLI:
supabase db push

# Or manually in Supabase Dashboard SQL Editor:
# Execute supabase/migrations/20260205_dora_metrics_schema.sql
```

#### 3. GitHub Actions Setup

**Required GitHub Secrets:**
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Your Supabase anonymous key

Add in: Repository Settings → Secrets and variables → Actions

#### 4. Run Dashboard

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Dashboard Features

- **Sprint Overview** - Current sprint progress and velocity
- **Performance Tier** - DORA classification (Elite/High/Medium/Low)
- **DORA Metrics Charts**:
  - Deployment Frequency
  - Lead Time for Changes
  - Change Failure Rate
  - Mean Time to Recovery

### Next Phases

**Phase 2: SPACE Framework** (Planned)
- Developer satisfaction surveys
- Activity tracking (commits, PRs, reviews)
- Collaboration metrics
- Efficiency tracking (focus time, context switches)

**Phase 3: Advanced Analytics** (Planned)
- Trend analysis with ML
- Predictive alerts (burnout risk, bottleneck detection)
- Team comparison

## Documentation

- [Branding Questionnaire](docs/branding-questionnaire.md) - Complete company profile en merkidentiteit vragenlijst
- [Brand Guidelines](docs/brand-guidelines.md) - *Coming soon*
- [Templates](docs/templates/) - *Coming soon*

## Plane Project

**Plane Workspace:** rooseveltdigital
**Project ID:** ROOSE
**Project URL:** https://app.plane.so/rooseveltdigital/projects/c7d0b955-a97f-40b6-be03-7c05c2d0b1c3

## Products & Services

### Active Products
- **VetteShirts** - E-commerce platform (PRODUCTION)
- **How To Work With AI (H2WAI)** - Educational platform (IN_PROGRESS)
- **Roosevelt OPS** - Operations hub (this project)

### Services
- AI strategie trajecten
- Digital product development
- Technical architecture consulting

## Project Status

### Completed
- [x] Project initialized
- [x] Questionnaire extracted and documented
- [x] Engineering metrics infrastructure (ROOSE-29 Phase 1)
- [x] DORA metrics dashboard
- [x] Automated metrics collection

### In Progress
- [ ] Brand identity development
- [ ] Wiki documentation
- [ ] Marketing materials
- [ ] Landing page
- [ ] Operational workflows
- [ ] SPACE framework implementation (ROOSE-29 Phase 2)

## Project Structure

```
roosevelt-ops/
├── .github/workflows/          # GitHub Actions for metrics
├── supabase/migrations/        # Database schema
├── app/                        # Next.js application
├── lib/supabase/              # Supabase utilities
├── docs/                       # Documentation
└── README.md                   # This file
```

---

*Last Updated: 2026-02-05*
