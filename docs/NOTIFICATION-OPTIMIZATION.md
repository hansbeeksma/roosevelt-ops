# GitHub Notification Optimization

**Target:** 90% email reduction via intelligent notification routing and filtering.

**Related:** ROOSE-131, ROOSE-116 (Release Infrastructure)

---

## Quick Wins Checklist

- [x] Configure repo-specific watching settings (done: 2026-02-09)
- [x] Clear 50 CI notification backlog (done: 2026-02-09)
- [x] Create notification cleanup script (`scripts/gh-notify-cleanup.sh`)
- [x] Create Gmail filter XML (`scripts/github-notification-filters.xml`)
- [ ] Configure GitHub notification preferences in UI (5 min, manual)
- [ ] Import Gmail filters from XML (2 min, manual)
- [ ] Enable scheduled digest mode (2 min, manual)

**Automated:** Repo subscriptions, notification cleanup, filter XML
**Manual remaining:** ~9 minutes of UI configuration

---

## 1. GitHub Account Settings

### A. Default Notification Preferences

1. **Go to:** https://github.com/settings/notifications

2. **Automatically watch repositories:** ❌ Disable
   - Prevents notification flood when added to new repos
   - Opt-in model: only watch what you need

3. **Automatically watch teams:** ❌ Disable
   - Same reason as above

4. **Participating and @mentions:**
   - Email: ✅ Enabled (critical notifications)
   - Web: ✅ Enabled

5. **Watching:**
   - Email: ❌ Disabled (use web notifications only)
   - Web: ✅ Enabled

6. **CI activity:**
   - Email: ❌ **DISABLE THIS** (biggest noise source)
   - Web: ✅ Enabled (check dashboard when needed)

7. **Dependabot alerts:**
   - Email: ⚠️ Security alerts only
   - Web: ✅ Enabled

### B. Email Routing

Configure notification routing:

1. **Go to:** https://github.com/settings/notifications
2. **Notification email:** Use dedicated address
   - Example: `github+notifications@yourdomain.com`
   - Enables easy filtering in email client

---

## 2. Repository-Specific Settings

### Critical Repos (Active Development)

**Repositories:** `roosevelt-ops`, `vino12`, `h2ww-platform`

**Watch level:** Custom
- Issues: ❌
- Pull Requests: ✅ (only your team)
- Releases: ✅
- Discussions: ❌
- Security alerts: ✅

**Access:**
1. Go to repo: https://github.com/hansbeeksma/roosevelt-ops
2. Click "Watch" dropdown (top right)
3. Select "Custom"
4. Configure as above

### Supporting Repos (Low Activity)

**Repositories:** `vetteshirts`, archived projects

**Watch level:** Releases only
- Gets version notifications
- No CI/PR noise

### Archived/Inactive Repos

**Watch level:** Ignoring
- Zero notifications

---

## 3. Email Filters (Gmail)

### Filter Strategy

**Philosophy:** Archive CI noise, surface actionable items.

### A. CI/CD Workflow Notifications → Archive

**Filter 1: CI Success/Failure**
```
Matches:
  from:(notifications@github.com)
  subject:(completed OR passed OR failed)
  OR subject:([CI])

Do this:
  Skip Inbox (Archive)
  Apply label: "GitHub/CI"
  Mark as read
```

**Why:** CI results visible in GitHub UI, email not needed.

### B. Dependabot PRs → Archive

**Filter 2: Dependabot Updates**
```
Matches:
  from:(notifications@github.com)
  from:(dependabot[bot])
  OR subject:(Bump)

Do this:
  Skip Inbox (Archive)
  Apply label: "GitHub/Dependabot"
  Mark as read
```

**Why:** Auto-merge handles these, review failures only.

### C. PR Review Requests → Important

**Filter 3: Review Requests (KEEP)**
```
Matches:
  from:(notifications@github.com)
  subject:("requested your review" OR "review requested")

Do this:
  Apply label: "GitHub/Review Needed"
  Mark as important
  Never send to spam
```

**Why:** Actionable, requires your input.

### D. Direct @mentions → Important

**Filter 4: @Mentions (KEEP)**
```
Matches:
  from:(notifications@github.com)
  subject:(@hansbeeksma OR @yourusername)

Do this:
  Apply label: "GitHub/Mentioned"
  Mark as important
  Star
```

**Why:** Direct communication, highest priority.

### E. Security Alerts → Critical

**Filter 5: Security Alerts (KEEP)**
```
Matches:
  from:(notifications@github.com)
  subject:(security OR vulnerability OR CVE)

Do this:
  Apply label: "GitHub/Security"
  Mark as important
  Star
  Never send to spam
```

**Why:** Requires immediate attention.

### F. Releases → Optional Archive

**Filter 6: Release Notifications**
```
Matches:
  from:(notifications@github.com)
  subject:(released OR release)
  -subject:(security)

Do this:
  Skip Inbox (Archive)
  Apply label: "GitHub/Releases"
```

**Why:** Nice to have, check label when needed.

---

## 4. Creating Gmail Filters

### Via Gmail Web UI

1. **Open Gmail** → Settings → "See all settings"
2. **Filters and Blocked Addresses** tab
3. **Create new filter**
4. Paste filter criteria from above
5. **Create filter with this search →**
6. Configure actions
7. **Apply filter to existing messages** (optional cleanup)
8. **Create filter**

### Via Gmail Search Operators

Test filters before creating:

```
# In Gmail search bar
from:(notifications@github.com) subject:(completed OR passed OR failed)
```

When satisfied → "Create filter from this search"

---

## 5. Alternative: Outlook Rules

### Create Rule (Outlook Desktop)

1. **Home tab** → Rules → "Manage Rules & Alerts"
2. **New Rule**
3. **Apply rule on messages I receive**
4. **From:** `notifications@github.com`
5. **Subject contains:** `completed` OR `passed` OR `failed`
6. **Move to folder:** `GitHub/CI`
7. **Mark as read**

### Outlook Web (OWA)

1. **Settings** → Mail → Rules
2. **Add new rule**
3. Configure as above

---

## 6. GitHub Scheduled Reminders

Enable daily digest instead of real-time spam:

1. **Go to:** https://github.com/settings/reminders
2. **Enable scheduled reminders**
3. **Time:** 09:00 (start of workday)
4. **Days:** Monday-Friday
5. **Include:**
   - Pull requests waiting on your review
   - Pull requests assigned to you

**Result:** Single daily summary email instead of 20+ individual notifications.

---

## 7. Notification Hygiene

### Weekly Cleanup Routine

**Every Friday (5 min):**

1. Check `GitHub/CI` label for recurring failures
2. Review `GitHub/Dependabot` for stuck PRs
3. Clear archived notifications >30 days:
   ```
   label:GitHub/CI older_than:30d
   ```
4. Adjust filters if new noise patterns emerge

### Quarterly Review

**Every quarter:**

1. Review watching settings for all repos
2. Unwatch inactive projects
3. Update filters for new repo patterns
4. Check notification volume metrics

---

## 8. Metrics & Success Tracking

### Baseline (Before Optimization)

**Measure for 1 week:**
- Total GitHub emails received: `___`
- Actionable emails: `___`
- Noise ratio: `___`%

### Target (After Optimization)

**90% reduction target:**
- Expected emails: ~10-20/week
- Only actionable items:
  - @mentions
  - Review requests
  - Security alerts
  - Failed workflows (manual)

### Measurement Query (Gmail)

```
from:(notifications@github.com) after:2026/02/01 before:2026/02/08
```

Count results, compare before/after.

---

## 9. Advanced: GitHub CLI Notification Management

**Install GitHub CLI:**
```bash
brew install gh
gh auth login
```

**Check notifications:**
```bash
# List unread notifications
gh api notifications

# Mark all notifications as read
gh api notifications -X PUT

# Get notification count
gh api notifications | jq 'length'
```

**Automate cleanup** (cron job):
```bash
# Add to crontab (daily at 6 PM)
0 18 * * * /usr/local/bin/gh api notifications -X PUT
```

---

## 10. Team Collaboration

### Notify Team of Changes

**After configuring:**

1. Share this guide with team
2. Encourage consistent notification hygiene
3. Establish team norms:
   - Use @mentions sparingly (real urgency only)
   - Use PR review requests (not email threads)
   - Update PR descriptions (not comment walls)

### Team Dashboard

**Create shared view:**
- Slack channel: `#github-notifications`
- GitHub webhook → Slack (critical only)
- Filter: Security alerts + workflow failures

---

## 11. Troubleshooting

### "I'm missing important notifications"

**Check:**
1. Gmail Spam folder
2. Filter accidentally archiving @mentions
3. GitHub notification settings → Participating enabled

**Fix:** Add `Never send to spam` to critical filters (#3, #4, #5).

### "Still getting too much noise"

**Audit:**
```bash
# In Gmail, group by subject
from:(notifications@github.com) after:2026/02/01
```

**Identify patterns** → Create new filter.

### "Notifications delayed"

**GitHub side:**
- Settings → Notifications → Delivery settings
- Enable "Real-time" (not digest mode)

**Gmail side:**
- Check "All Mail" folder (not just Inbox)
- Verify filters not marking as read prematurely

---

## 12. Expected Results

### Week 1 (Post-Setup)

- Email volume: -70% (CI noise eliminated)
- Inbox: Only actionable items
- Time saved: ~15 min/day

### Week 4 (Fully Optimized)

- Email volume: -90% (all noise filtered)
- Inbox zero achievable
- GitHub dashboard becomes primary interface

### Long-term

- Stress reduction: No more notification anxiety
- Faster response: Only see what matters
- Better focus: Inbox is signal, not noise

---

## Related Documentation

- **GitHub Docs:** https://docs.github.com/en/account-and-profile/managing-subscriptions-and-notifications-on-github
- **Gmail Filters:** https://support.google.com/mail/answer/6579
- **Outlook Rules:** https://support.microsoft.com/en-us/office/manage-email-messages-by-using-rules-c24f5dea-9465-4df4-ad17-a50704d66c59

---

## 13. Ready-to-Use Gmail Filter XML

### Import All Filters at Once

**Download this XML and import via Gmail:**

```xml
<?xml version='1.0' encoding='UTF-8'?>
<feed xmlns='http://www.w3.org/2005/Atom' xmlns:apps='http://schemas.google.com/apps/2006'>
  <!-- Filter 1: CI/CD Noise → Archive -->
  <entry>
    <category term='filter'></category>
    <title>GitHub CI Notifications</title>
    <apps:property name='from' value='notifications@github.com'/>
    <apps:property name='subject' value='completed|passed|failed|[CI]'/>
    <apps:property name='shouldArchive' value='true'/>
    <apps:property name='label' value='GitHub/CI'/>
    <apps:property name='shouldMarkAsRead' value='true'/>
  </entry>

  <!-- Filter 2: Dependabot → Archive -->
  <entry>
    <category term='filter'></category>
    <title>Dependabot Updates</title>
    <apps:property name='from' value='notifications@github.com'/>
    <apps:property name='hasTheWord' value='from:dependabot[bot] OR subject:Bump'/>
    <apps:property name='shouldArchive' value='true'/>
    <apps:property name='label' value='GitHub/Dependabot'/>
    <apps:property name='shouldMarkAsRead' value='true'/>
  </entry>

  <!-- Filter 3: Review Requests → Important -->
  <entry>
    <category term='filter'></category>
    <title>PR Review Requests</title>
    <apps:property name='from' value='notifications@github.com'/>
    <apps:property name='subject' value='requested your review|review requested'/>
    <apps:property name='label' value='GitHub/Review Needed'/>
    <apps:property name='shouldAlwaysMarkAsImportant' value='true'/>
    <apps:property name='shouldNeverSpam' value='true'/>
  </entry>

  <!-- Filter 4: @Mentions → Important + Star -->
  <entry>
    <category term='filter'></category>
    <title>GitHub Mentions</title>
    <apps:property name='from' value='notifications@github.com'/>
    <apps:property name='subject' value='@hansbeeksma'/>
    <apps:property name='label' value='GitHub/Mentioned'/>
    <apps:property name='shouldAlwaysMarkAsImportant' value='true'/>
    <apps:property name='shouldStar' value='true'/>
  </entry>

  <!-- Filter 5: Security Alerts → Critical -->
  <entry>
    <category term='filter'></category>
    <title>Security Alerts</title>
    <apps:property name='from' value='notifications@github.com'/>
    <apps:property name='subject' value='security|vulnerability|CVE'/>
    <apps:property name='label' value='GitHub/Security'/>
    <apps:property name='shouldAlwaysMarkAsImportant' value='true'/>
    <apps:property name='shouldStar' value='true'/>
    <apps:property name='shouldNeverSpam' value='true'/>
  </entry>

  <!-- Filter 6: Releases → Archive -->
  <entry>
    <category term='filter'></category>
    <title>Release Notifications</title>
    <apps:property name='from' value='notifications@github.com'/>
    <apps:property name='hasTheWord' value='subject:(released|release) -subject:security'/>
    <apps:property name='shouldArchive' value='true'/>
    <apps:property name='label' value='GitHub/Releases'/>
  </entry>
</feed>
```

### Import Instructions

1. Save XML to `github-filters.xml`
2. Gmail → Settings → Filters and Blocked Addresses
3. **Import filters** (bottom of page)
4. Choose file → `github-filters.xml`
5. Click **Create filters**
6. ✅ Check "Apply filter to matching conversations"

**Note:** Update `@hansbeeksma` in Filter 4 to your GitHub username.

---

## 14. Automation Script (Bash)

### One-Command Setup

Save as `setup-github-notifications.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 GitHub Notification Optimization Setup"
echo "=========================================="
echo ""

# Check if gh CLI is installed
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI not found. Installing..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        brew install gh
    else
        echo "Install gh CLI manually: https://cli.github.com"
        exit 1
    fi
fi

# Authenticate
echo "🔐 Authenticating with GitHub..."
gh auth status || gh auth login

# Get username
USERNAME=$(gh api user -q .login)
echo "✅ Logged in as: $USERNAME"
echo ""

# Configure notification settings via API
echo "⚙️  Configuring notification preferences..."

# Disable CI activity emails
gh api --method PATCH /user \
  -f notification_email="$USERNAME@users.noreply.github.com"

echo "✅ Notification email routed to noreply"

# List repositories
echo ""
echo "📦 Your repositories:"
gh repo list --limit 100 --json name,isArchived --jq '.[] | select(.isArchived == false) | .name'

echo ""
echo "🎯 Manual steps remaining:"
echo "1. GitHub Settings → Notifications → Disable 'CI activity' email"
echo "2. Import Gmail filters from github-filters.xml"
echo "3. Enable Scheduled Reminders (9:00 AM)"
echo ""
echo "📚 Full guide: docs/NOTIFICATION-OPTIMIZATION.md"
```

### Run Script

```bash
chmod +x setup-github-notifications.sh
./setup-github-notifications.sh
```

---

## 15. Team Rollout Plan

### Phase 1: Pilot (Week 1)

**Participants:** 1-2 developers

**Actions:**
1. Test notification settings
2. Measure email volume (before/after)
3. Collect feedback
4. Refine filters

**Success Criteria:**
- 80%+ email reduction
- No missed critical notifications
- Positive feedback

### Phase 2: Team Rollout (Week 2-3)

**Communication:**
```markdown
Subject: GitHub Notification Cleanup - Action Required

Hi team,

We're optimizing GitHub notifications to reduce email noise by 90%.

**Action Required (15 min):**
1. Follow guide: docs/NOTIFICATION-OPTIMIZATION.md
2. Import filters: github-filters.xml
3. Update GitHub settings (link in guide)

**Benefits:**
- 90% less email noise
- Only see actionable notifications
- Daily digest instead of real-time spam

**Support:** #tech-support on Slack
**Deadline:** End of week

Thanks!
```

**Support:**
- Create `#notification-cleanup` Slack channel
- Office hours: 2pm daily for questions
- Document common issues

### Phase 3: Monitoring (Week 4+)

**Metrics to track:**
- Email volume per person (before/after)
- Missed critical notifications (should be 0)
- Time saved (survey)
- Adoption rate

**Weekly check-in:**
- Share metrics in team meeting
- Collect new filter patterns
- Update guide as needed

---

## 16. Gmail Filter Management Script

### Export Current Filters

```bash
#!/bin/bash
# save as: export-gmail-filters.sh

echo "📤 Exporting Gmail filters..."
echo "1. Go to: https://mail.google.com/mail/u/0/#settings/filters"
echo "2. Click 'Export'"
echo "3. Save as gmail-filters-backup.xml"
echo ""
echo "✅ Backup your filters before making changes!"
```

### Bulk Delete Old Filters

```bash
#!/bin/bash
# save as: cleanup-old-filters.sh

echo "🧹 Gmail Filter Cleanup"
echo "1. Go to: https://mail.google.com/mail/u/0/#settings/filters"
echo "2. Select filters to delete:"
echo "   - Look for old GitHub notification filters"
echo "   - Delete any duplicates"
echo "3. Click 'Delete' for each"
echo ""
echo "💡 Tip: Export filters first as backup"
```

---

## 17. Monitoring & Maintenance

### Weekly Dashboard

Track these metrics weekly:

```bash
#!/bin/bash
# save as: notification-metrics.sh

echo "📊 GitHub Notification Metrics (Last 7 Days)"
echo "==========================================="
echo ""

# Total notifications
TOTAL=$(gh api notifications --paginate | jq length)
echo "Total notifications: $TOTAL"

# Unread count
UNREAD=$(gh api notifications | jq length)
echo "Unread: $UNREAD"

# By reason
echo ""
echo "By type:"
gh api notifications --paginate | jq -r '.[].reason' | sort | uniq -c | sort -rn

echo ""
echo "📈 Compare with baseline: [record your numbers]"
echo "Target: <20 notifications/week"
```

### Monthly Review Checklist

**First Monday of each month:**

- [ ] Run metrics script
- [ ] Review `GitHub/CI` label for patterns
- [ ] Check for new notification types
- [ ] Update filters if needed
- [ ] Survey team satisfaction
- [ ] Share results in team meeting

### Alert Thresholds

**Set up Gmail alerts for high volume:**

```
Search: label:GitHub/Mentioned newer_than:1d
If > 10 results → Review @mention usage with team
```

---

## 18. Troubleshooting Playbook

### Issue: "I missed a PR review request"

**Debug:**
```bash
# Check Gmail spam
label:spam from:notifications@github.com subject:"review requested"

# Check GitHub notification settings
open https://github.com/settings/notifications

# Verify filter not over-archiving
label:GitHub/Review-Needed
```

**Fix:**
- Add `shouldNeverSpam` to review request filter
- Check GitHub email verification status
- Disable aggressive spam filters

### Issue: "Still getting 50+ emails/day"

**Audit:**
```bash
# In Gmail search
from:notifications@github.com after:2026/02/08
```

**Group by subject** → Identify patterns → Create new filter

**Common culprits:**
- Watching too many repos → Unwatch inactive ones
- Team mentions (not just you) → Adjust team notification settings
- Issue comments → Consider disabling "Participating" email

### Issue: "Filters not applying to old emails"

**Bulk Apply Filters:**

1. Search: `from:notifications@github.com older_than:7d`
2. Select all (top checkbox)
3. Click "Select all conversations that match this search"
4. More → Filter messages like these
5. Apply existing filter

---

## 19. Advanced: GitHub App for Custom Routing

### Concept

Build GitHub App that:
- Filters notifications server-side
- Routes to Slack channels
- Only sends email for critical items

### Benefits

- More control than Gmail filters
- Team-wide consistency
- Integrate with other tools (Jira, Linear)

### Example Flow

```
GitHub Webhook → Cloud Function → Filter Logic → Route:
  - Critical → Email
  - Review → Slack #code-review
  - CI → Slack #ci-alerts (collapsed)
  - Dependabot → Auto-merge bot
```

**Implementation:** Out of scope for ROOSE-131, but document as future enhancement.

---

## 20. Success Stories (Template)

### Baseline (Week 0)

```
GitHub emails received: 127/week
Time spent managing: 30 min/week
Stress level: 😫 High
```

### After Optimization (Week 4)

```
GitHub emails received: 12/week (-90%)
Time spent managing: 5 min/week (-83%)
Stress level: 😌 Low
```

**Key wins:**
- CI noise completely eliminated
- Only actionable notifications in inbox
- Scheduled digest for reviews (9am daily)
- Team adopted same settings → Consistent experience

### ROI Calculation

```
Time saved per person: 25 min/week
Team size: 5 developers
Annual savings: 25 min × 5 × 52 weeks = 108 hours
Hourly rate: $100
Value: $10,800/year
```

---

*Last Updated: 2026-02-09*
*Target: 90% email reduction*
*ROOSE-131*
