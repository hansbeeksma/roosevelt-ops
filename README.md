# Roosevelt OPS

Operations hub voor Roosevelt - Professionele onderneming voor AI strategie en Digital product development.

## Project Overview

**Founded:** November 2024
**Location:** Amsterdam
**Founder:** Sam Swaab
**Focus:** AI Strategy & Digital Product Development

## 🚀 Quick Start

```bash
git clone https://github.com/hansbeeksma/roosevelt-ops.git
cd roosevelt-ops
npm install
supabase start
npm run dev
```

Open http://localhost:3000 - Dashboard draait met sample data!

**📚 Documentatie:**
- [Setup Guide](docs/SETUP.md) - Lokale development setup
- [Deployment Guide](DEPLOYMENT.md) - Cloud deployment naar Vercel + Supabase

---

## Engineering Metrics Dashboard (ROOSE-29) ✅ COMPLETED

DORA + SPACE metrics implementatie voor engineering performance tracking.

**🌐 Live Dashboard:** https://roosevelt-5hkg3z0c4-roosevelt-d9f64ff6.vercel.app

### Phase 1: DORA Baseline Collection ✅

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

### Phase 2: SPACE Framework ✅

**Infrastructure Complete:**
- ✅ Database schema (5 dimensions)
- ✅ Dashboard with SPACE scores
- ✅ Materialized views
- 🔄 Data collection (Planned - see Plane issues)

### Phase 3: Advanced Analytics (Planned)
- Trend analysis with ML
- Predictive alerts (burnout risk, bottleneck detection)
- Team comparison

---

## Performance Budgets (ROOSE-37.11) ✅ CONFIGURED

Automated performance budget enforcement via Lighthouse CI in GitHub Actions.

### Performance Budgets Overview

**Core Web Vitals Thresholds:**
- **First Contentful Paint (FCP)**: ≤ 2000ms
- **Largest Contentful Paint (LCP)**: ≤ 2500ms
- **Cumulative Layout Shift (CLS)**: ≤ 0.1
- **Total Blocking Time (TBT)**: ≤ 300ms
- **Speed Index**: ≤ 3000ms
- **Time to Interactive (TTI)**: ≤ 5000ms

**Resource Budgets:**
- **JavaScript**: 500KB (max)
- **CSS**: 100KB (max)
- **Images**: 300KB (max)
- **Fonts**: 150KB (max)
- **Total page weight**: 1.5MB (max)

**Score Requirements:**
- **Performance**: ≥ 85%
- **Accessibility**: ≥ 90%
- **Best Practices**: ≥ 90%
- **SEO**: ≥ 90%

### CI Integration

Performance budgets are enforced automatically in CI:
- ✅ Runs on every PR and push to main
- ✅ Fails build if budgets are exceeded
- ✅ Lighthouse reports uploaded as artifacts
- ✅ Results stored temporarily for review

### Local Testing

Run performance audits locally:

```bash
# Full Lighthouse CI run (build + start + audit)
npm run perf

# Individual commands
npm run lhci:collect    # Collect Lighthouse data
npm run lhci:assert     # Assert against budgets
npm run lhci:autorun    # Full automated run
```

### Configuration

Performance budgets are defined in `lighthouserc.json`. Adjust thresholds as needed based on:
- Page complexity
- Target audience (3G/4G/5G)
- Business requirements

**Viewing Results:**
1. Check GitHub Actions artifacts for Lighthouse HTML reports
2. Review assertion failures in CI logs
3. Use Chrome DevTools Lighthouse for interactive testing

### Budget Philosophy

**Why these budgets?**
- **2000ms FCP**: Good perceived load time on 4G
- **2500ms LCP**: Main content visible quickly
- **0.1 CLS**: Minimal layout shift for good UX
- **300ms TBT**: Interactive without lag
- **1.5MB total**: Reasonable on modern connections

**Adjusting budgets:**
- For marketing pages: Tighter budgets (FCP 1500ms, 1MB total)
- For dashboard apps: Looser budgets acceptable (FCP 3000ms, 2MB total)
- For mobile-first: Stricter budgets to account for slower networks

---

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
