# Solo Dev Agency Workflow Playbook

Practical guide for running a solo developer agency efficiently. Covers daily rhythms,
client communication, and decision-making frameworks for one-person operations.

---

## Morning Standup (5 min)

Run every morning before writing any code. The goal is situational awareness, not planning.

### Checklist

- [ ] Check incidents & uptime (Sentry, Vercel dashboard)
- [ ] Review Plane board — scan In Progress + Backlog top 5
- [ ] Process email/Slack messages — flag anything needing a same-day response
- [ ] Set daily focus task in CLEO (`cleo focus set T###`)
- [ ] Check CI/CD status — any failing pipelines blocking work?

### Rules

- Hard cap: 5 minutes. Use a timer.
- Do not start coding during standup.
- If an incident is found, switch to incident protocol immediately — skip the rest.
- One focus task per day. If it is multi-day, pick the next subtask.

---

## Async Client Communication Templates

### Project Update (weekly)

```
Subject: [Project Name] Week of [Date] — Update

Hi [Name],

This week:
- [Completed item 1]
- [Completed item 2]

Next week:
- [Planned item 1]
- [Planned item 2]

Blockers I need from you:
- [Specific ask, if any]

Questions? Reply here or book a slot: [Calendly link]
```

### Scope Creep Response

```
Hi [Name],

Happy to add [request]. Before I start, I want to flag this falls outside
the current scope defined in [document/date].

Options:
A) Add to current sprint — delays [current deliverable] by ~[estimate]
B) Queue for next sprint — I'll add it to the backlog now
C) Separate task — I can send a quick estimate

Which works best?
```

### Delay Notice

```
Hi [Name],

[Deliverable] will be delayed by approximately [timeframe]. Reason: [1-sentence cause].

New expected delivery: [date].

No action needed from you. I'll update you if anything changes.
```

### Clarification Request (before starting work)

```
Hi [Name],

Before I start [task], I need clarity on one thing:

[Single specific question]

This affects [what]. If I don't hear back by [date], I'll proceed with
[default assumption] so we stay on track.
```

---

## Weekly Review Cadence

Run every Friday afternoon. Block 45 minutes.

### Metrics Review (15 min)

- DORA metrics: deployment frequency, lead time, MTTR, change failure rate
- Active client count vs capacity
- Time logged this week vs estimate
- Any tasks drifting past estimate by >50%?

### Billing Check (10 min)

- Outstanding invoices — anything overdue?
- Hours logged vs contract limits per client
- Upcoming renewals or contract end dates
- New work quotes that need to go out

### Plane Grooming (20 min)

1. Move completed issues to Done
2. Reprioritize Backlog top 10
3. Close stale issues (no activity in 30+ days)
4. Check epic progress vs timeline
5. Create issues for anything discovered during the week

---

## Context Switching Protocol

Solo agency work means constant interruptions. This protocol minimises damage.

### When an Interruption Arrives

1. **Finish the current sentence** — complete the thought you are in, not the whole task
2. **Save state** — commit WIP, add a CLEO note (`cleo focus note "stopped at X"`)
3. **Classify the interruption:**
   - Urgent client fire → switch immediately, max 2 hours
   - New request → log in Plane, respond with "I'll get back to you by [time]"
   - Internal idea → add to Plane backlog, do not act now
4. **Set a return timer** — when switching, set a 90-min or 2-hour timer
5. **Resume** — read your saved state note before picking up the original task

### Interruption Budget

| Type | Max time today | Response SLA |
|------|---------------|--------------|
| Production incident | Unlimited | Immediate |
| Client urgent | 2 hours | 30 min |
| Client normal | Next day slot | 4 hours |
| Internal | Queue in Plane | N/A |

### End-of-Day Close

Before stopping:
- Commit or stash all changes with a descriptive message
- Update the active Plane issue with current status
- Write tomorrow's one-sentence focus in CLEO notes

---

## When to Use AI Agents vs Do Manually

### Delegate to AI Agents

| Task | Agent / Tool | Reason |
|------|-------------|--------|
| Boilerplate scaffolding | Claude Code | No judgement needed, pattern-based |
| Writing first draft docs | Claude Code | Fast, edit is faster than write |
| Test generation | tdd-guide agent | Consistent, tedious manually |
| Code review pass | code-reviewer agent | Catches patterns you are blind to |
| Research & comparison | Perplexity / Gemini | Faster than reading 10 tabs |
| PR description | commit-agent | Context already in git diff |
| Incident postmortem draft | Claude Code | Templates + facts = 80% done |
| SQL query drafting | Claude Code | Error-prone manually, easy to verify |
| Regex writing | Claude Code | Hard to write, trivial to verify |

### Do Manually

| Task | Reason |
|------|--------|
| Client relationship conversations | Trust, nuance, accountability |
| Architecture decisions | You own the consequences |
| Pricing and scope negotiations | Strategic, not mechanical |
| Security reviews of AI-generated code | Never skip — AI hallucinates auth |
| Hiring / subcontractor selection | Judgement call with long-term impact |
| Final code review before production | You deploy, you verify |
| Reading client requirements | Misreads here compound downstream |

### Decision Rule

> If the output is easy to verify and the cost of being wrong is low, delegate.
> If being wrong has client, security, or financial impact, do it yourself.

---

## Reference Links

- Plane board: [ROOSE project](https://app.plane.so)
- Incident runbook: `docs/runbooks/`
- Time tracking: Roosevelt OPS dashboard → `/workflow`
- Client templates: `templates/client/`
