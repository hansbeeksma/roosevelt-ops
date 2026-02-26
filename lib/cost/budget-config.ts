/**
 * Budget Configuration
 *
 * Default monthly spending limits and alert thresholds for a small digital
 * agency. Values are in EUR and intentionally conservative — adjust per actual
 * contract / plan as the agency grows.
 */

import type { CostBudget, CostCategory } from './cost-tracker'

// ── Default budgets ───────────────────────────────────────────────────────────

export const DEFAULT_BUDGETS: CostBudget[] = [
  {
    service: 'vercel',
    monthlyLimit: 50,
    alertThreshold: 0.8, // alert at 80%
  },
  {
    service: 'supabase',
    monthlyLimit: 25,
    alertThreshold: 0.8,
  },
  {
    service: 'anthropic',
    monthlyLimit: 100,
    alertThreshold: 0.7, // alert at 70% — AI costs can spike quickly
  },
  {
    service: 'github',
    monthlyLimit: 20,
    alertThreshold: 0.9, // alert at 90% — very predictable spend
  },
  {
    service: 'sentry',
    monthlyLimit: 26,
    alertThreshold: 0.8,
  },
  {
    service: 'clerk',
    monthlyLimit: 25,
    alertThreshold: 0.8,
  },
  {
    service: 'slack',
    monthlyLimit: 15,
    alertThreshold: 0.9,
  },
  {
    service: 'resend',
    monthlyLimit: 20,
    alertThreshold: 0.8,
  },
]

// ── Category descriptions ─────────────────────────────────────────────────────

export const COST_CATEGORIES: Record<CostCategory, string> = {
  infrastructure: 'Hosting, databases, and compute (Vercel, Supabase)',
  api: 'Third-party API usage billed per request (Anthropic, Resend)',
  tooling: 'Developer tools and SaaS subscriptions (GitHub, Sentry, Clerk, Slack)',
}

// ── Service → category mapping ────────────────────────────────────────────────

export const SERVICE_CATEGORIES: Record<string, CostCategory> = {
  vercel: 'infrastructure',
  supabase: 'infrastructure',
  anthropic: 'api',
  resend: 'api',
  github: 'tooling',
  sentry: 'tooling',
  clerk: 'tooling',
  slack: 'tooling',
}

// ── Total budget ceiling ──────────────────────────────────────────────────────

/** Sum of all default monthly limits — useful for top-level budget checks. */
export const TOTAL_MONTHLY_BUDGET = DEFAULT_BUDGETS.reduce((sum, b) => sum + b.monthlyLimit, 0)
