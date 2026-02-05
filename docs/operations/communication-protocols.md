# Communication Protocols SOP

> Internal and client communication standards

**Version:** 1.0.0
**Last Updated:** 2026-02-03

---

## Purpose

Establish clear, consistent communication standards for internal and client interactions. Ensure transparency, responsiveness, and professionalism.

---

## Core Principles

1. **Transparency** - Share progress, risks, and blockers openly
2. **Responsiveness** - Reply within defined timeframes
3. **Clarity** - Clear, actionable communication
4. **Documentation** - Record decisions and agreements
5. **Respect** - Professional tone, reasonable hours

---

## Response Time Standards

| Channel | Response Time | Use For |
|---------|---------------|---------|
| **Urgent** (Phone/SMS) | Within 2 hours | Production issues, critical blocks |
| **Email** | Within 24 hours (business days) | Regular communication |
| **Slack/Chat** | Within 4 hours (business hours) | Quick questions, clarifications |
| **Plane Comments** | Within 48 hours | Task discussions, technical decisions |

---

## Client Communication

### Status Updates

**Weekly Status Report** (Every Friday)
- **Format:** Email
- **Template:** [Status Report Template](../templates/status-report.md)
- **Contents:**
  - Progress this week
  - Planned for next week
  - Risks/blockers
  - Questions/decisions needed

**Bi-Weekly Demo Calls** (Every other Friday)
- **Duration:** 30-45 minutes
- **Agenda:**
  - Demo of completed work
  - Feedback collection
  - Next milestone review
  - Q&A

### Email Guidelines

**Subject Lines:**
```
[Project Name] - [Topic]

Examples:
- [VetteShirts] - Week 3 Status Update
- [H2WAI] - Architecture Decision Needed
- [Roosevelt OPS] - Demo Scheduled
```

**Email Structure:**
1. **Greeting** - Professional, consistent
2. **Context** - Brief background if needed
3. **Main Content** - Clear, scannable (bullets/lists)
4. **Action Items** - Explicit next steps
5. **Closing** - Professional sign-off

**Template:**
```
Hi [Name],

[Brief context if needed]

**Progress:**
- Completed X
- In progress Y

**Next Steps:**
- Action 1 (Owner: [Name], Due: [Date])
- Action 2 (Owner: [Name], Due: [Date])

**Questions:**
- Decision needed on Z

Best,
Sam
```

### Meeting Protocol

**Before Meeting:**
- Send agenda 24 hours in advance
- Share relevant documents
- Test video conference link

**During Meeting:**
- Start on time
- Follow agenda
- Take notes (use [Meeting Notes Template](../templates/meeting-notes.md))
- Capture action items
- Respect time limits

**After Meeting:**
- Send meeting notes within 24 hours
- Confirm action items and owners
- Schedule follow-up if needed

---

## Internal Communication

### Git Commits

**Format:** Conventional Commits

```
<type>: <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code refactoring
- `docs`: Documentation
- `test`: Tests
- `chore`: Maintenance

**Examples:**
```
feat: add JWT authentication middleware

Implements token-based auth for API endpoints.
Includes token refresh logic and error handling.

Closes #123
```

### Plane Issue Updates

**When to Update:**
- Starting work on issue
- Significant progress made
- Blocked or needs help
- Completed

**Update Format:**
```markdown
**Progress:**
- [What was accomplished]

**Next:**
- [What's planned]

**Blockers:**
- [Any blockers] (or "None")

**Questions:**
- [Any questions] (or "None")
```

### Decision Documentation

**For Architecture Decisions:**
- Create ADR in `docs/decisions/`
- Follow ADR template
- Reference in Plane issue

**For Smaller Decisions:**
- Comment in relevant Plane issue
- Tag stakeholders
- Document rationale

---

## Communication Channels

### Email
**Use for:**
- Formal communication
- Status updates
- Important decisions
- Client communication

### Slack (if applicable)
**Use for:**
- Quick questions
- Coordination
- Informal updates

**Don't use for:**
- Important decisions (use email)
- Long discussions (schedule call)
- Sensitive information

### Plane
**Use for:**
- Technical discussions
- Task progress
- Feature specifications
- Bug reports

### Video Calls
**Use for:**
- Demos
- Architecture discussions
- Complex problem-solving
- Relationship building

---

## Escalation Path

### Level 1: Normal Communication
- Use standard channels
- Follow response time guidelines

### Level 2: Important (Needs Attention)
- Email with "IMPORTANT" in subject
- Follow up if no response in 24 hours

### Level 3: Urgent (Immediate Action)
- Phone/SMS
- Followed by email summary

### Level 4: Critical (Production Down)
- Phone call immediately
- Don't wait for response timeframes

---

## Communication Anti-Patterns

### ❌ Don't Do

**Vague Updates:**
- ❌ "Making progress"
- ✅ "Completed authentication module, starting on payment integration"

**Hiding Problems:**
- ❌ Working overtime to fix issue silently
- ✅ "Encountered blocker with API, will delay by 2 days"

**Email Overload:**
- ❌ Sending 10 emails a day
- ✅ Batch updates into daily/weekly summaries

**Assumptions:**
- ❌ "Thought you wanted it this way"
- ✅ "Confirming: should we implement X or Y?"

**No Context:**
- ❌ "The thing is broken"
- ✅ "Production API endpoint /users returning 500 errors since 2pm"

---

## Templates

All communication templates available in `docs/templates/`:

- [Meeting Notes](../templates/meeting-notes.md)
- [Status Report](../templates/status-report.md)
- [Project Brief](../templates/project-brief.md)
- [Technical Specification](../templates/technical-specification.md)

---

## Troubleshooting

**Issue:** Client not responding to communications
**Action:**
1. Follow up after 48 hours
2. Try alternative channel (email → phone)
3. Escalate if project-critical

**Issue:** Miscommunication about requirements
**Action:**
1. Document understanding in writing
2. Request explicit confirmation
3. Reference in all future communications

**Issue:** Too many communication channels
**Action:**
1. Consolidate to 2-3 primary channels
2. Define purpose of each channel
3. Redirect conversations to appropriate channel

---

## Related Documents

- [Client Onboarding](client-onboarding.md)
- [Project Initiation](project-initiation.md)
- [Meeting Notes Template](../templates/meeting-notes.md)
- [Status Report Template](../templates/status-report.md)

---

*Maintained by: Technical Writing Department*
