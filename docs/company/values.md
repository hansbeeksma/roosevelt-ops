# Values & Principles

> How Roosevelt Works - Core values and non-negotiable principles

---

## Core Values

### 🎯 Quality Over Speed

**What it means:**
We prioritize doing work right the first time over rushing to completion.

**In practice:**
- Test-driven development
- Code reviews before merge
- Architecture validation
- No "we'll fix it later" shortcuts

**Why it matters:**
Technical debt compounds. Quick fixes become expensive rewrites. Quality pays dividends.

---

### 🏗️ Architecture First

**What it means:**
Solid foundations enable scalability. We design before we build.

**In practice:**
- Architecture design documents (ADRs)
- System design reviews
- Technology evaluation
- Scalability planning upfront

**Why it matters:**
Without architecture, you build a house of cards. Good architecture prevents painful refactors.

---

### 🔄 Strategy + Execution Unity

**What it means:**
No handoff between "thinkers" and "doers". Same person, same vision.

**In practice:**
- Direct client access to technical expert
- Architectural decisions inform implementation
- Implementation reality shapes strategy
- Continuous feedback loop

**Why it matters:**
Handoffs lose context. Strategy divorced from reality fails. Unity delivers cohesion.

---

### 💬 Transparent Communication

**What it means:**
Open about progress, risks, and trade-offs. No surprises.

**In practice:**
- Regular status updates
- Honest risk assessment
- Trade-off discussions
- Bad news early, not late

**Why it matters:**
Trust requires transparency. Hidden problems become crises. Early communication enables adjustment.

---

### 🚀 Pragmatic Innovation

**What it means:**
Use proven tech for foundations, experiment at the edges.

**In practice:**
- Battle-tested core stack
- New tech in isolated experiments
- Risk-appropriate choices
- "Boring" is often correct

**Why it matters:**
Bleeding edge bleeds. Innovation where it matters, stability where it counts.

---

## Non-Negotiable Principles

### ✅ We ALWAYS Do

**Testing**
- Unit tests for logic
- Integration tests for APIs
- E2E tests for critical flows
- No untested code in production

**Security**
- Input validation
- Authentication/authorization
- Secret management
- Security reviews before deploy

**Documentation**
- Clear README files
- API documentation
- Architecture decision records
- Runbooks for operations

**Version Control**
- Git for all code
- Meaningful commit messages
- Pull request reviews
- Protected main branches

**Monitoring**
- Error tracking
- Performance monitoring
- User analytics
- Alert systems

---

### ❌ We NEVER Do

**No Half Work**
- No "temporary" hacks that become permanent
- No "we'll document it later"
- No "skip tests, we're in a hurry"

**No Scope Creep Without Discussion**
- Document requirements upfront
- Discuss changes before implementing
- Track scope changes
- Adjust timeline/budget accordingly

**No Silent Failures**
- Surface errors immediately
- Communicate risks early
- Escalate blockers promptly
- No hiding problems

**No Compromised Security**
- Never hardcode secrets
- Never skip authentication
- Never ignore vulnerabilities
- Security is non-negotiable

**No Technical Debt Without Plan**
- Document known tech debt
- Track debt in backlog
- Schedule refactoring
- Don't accumulate recklessly

---

## Decision Framework

### When Making Choices

**1. Does it align with quality standards?**
- If no → Don't compromise
- If yes → Proceed

**2. Does it support scalability?**
- If no → Re-evaluate architecture
- If yes → Proceed

**3. Is it transparent to stakeholders?**
- If no → Communicate before deciding
- If yes → Proceed

**4. Is there a better boring solution?**
- If yes → Choose boring
- If no → Justify innovation

---

## Cultural Principles

### How We Interact

**With Clients:**
- Direct, honest communication
- Realistic timelines
- Educate on trade-offs
- Partner, don't just execute

**With Code:**
- Treat code as craft
- Leave it better than you found it
- Refactor when necessary
- Pride in workmanship

**With Problems:**
- Surface issues early
- Propose solutions, not just problems
- Learn from mistakes
- Iterate and improve

**With Technology:**
- Continuous learning
- Share knowledge
- Experiment responsibly
- Stay pragmatic

---

## Quality Standards

### Code Quality

**Mandatory:**
- ✅ Linting passes (ESLint, Prettier)
- ✅ Type checking passes (TypeScript)
- ✅ Tests pass (80%+ coverage)
- ✅ No console.log statements
- ✅ No hardcoded values

**Preferred:**
- Immutable patterns
- Small functions (<50 lines)
- Focused files (<800 lines)
- Meaningful names
- Clear error handling

[→ See Coding Style Guide](../operations/coding-style.md) *(TBD)*

---

## Continuous Improvement

### We Believe In

**Learning:**
- Technology evolves, we evolve
- Every project teaches
- Mistakes are learning opportunities
- Share knowledge openly

**Iteration:**
- First version isn't final version
- Refactor without fear
- Measure and optimize
- Continuous delivery

**Feedback:**
- User feedback shapes product
- Code reviews improve quality
- Retrospectives drive improvement
- Data informs decisions

---

## Related Documents

- [Company Profile](profile.md) - Roosevelt overview
- [Founder Profile](founder.md) - Sam's background
- [Quality Assurance](../operations/quality-assurance.md) - QA procedures
- [Coding Standards](../operations/coding-style.md) - Technical guidelines *(TBD)*

---

*Last updated: 2026-02-03*
