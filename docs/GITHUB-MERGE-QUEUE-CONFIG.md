# GitHub Merge Queue Config voor Agent Branches

> **Issue:** ROOSE-166
> **Datum:** 2026-02-09
> **Status:** Geimplementeerd

---

## Agent Branch Pattern

Multi-agent terminals gebruiken de volgende branch naming convention:

```
agent-feature/{issue-id}     # Feature work
agent-fix/{issue-id}         # Bug fixes
agent-t{terminal-id}         # Terminal-specific worktrees
```

## 1. Concurrency Groups (GitHub Actions)

Voorkomt dat meerdere CI runs van dezelfde branch tegelijk draaien. Wanneer een agent meerdere commits pusht naar dezelfde branch, wordt alleen de laatste CI run afgemaakt.

### Implementatie

Voeg toe aan elke workflow:

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: ${{ github.event_name == 'pull_request' }}
```

**Uitleg:**
- `group`: Unieke identifier per workflow + branch combinatie
- `cancel-in-progress`: Alleen bij PRs worden outdated runs gecanceld. Push naar main/staging draait altijd volledig af.

### Status per repo

| Repo | CI | Security | Release | Dependabot |
|------|:--:|:--------:|:-------:|:----------:|
| vino12 | Toegevoegd | - | - | - |
| roosevelt-ops | Toegevoegd | - | - | - |
| vetteshirts | Toegevoegd | - | - | - |
| h2ww-platform | Toegevoegd | - | - | - |

## 2. Auto-Delete Branches na Merge

GitHub repo instelling die automatisch feature branches verwijdert na merge.

### Configuratie (per repo)

**GitHub UI:** Settings > General > Pull Requests

```
[x] Automatically delete head branches
```

**Of via GitHub API:**

```bash
gh api repos/hansbeeksma/{repo} --method PATCH \
  -f delete_branch_on_merge=true
```

### Toe te passen op:

- [ ] `hansbeeksma/vino12`
- [ ] `hansbeeksma/roosevelt-ops`
- [ ] `hansbeeksma/vetteshirts`
- [ ] `hansbeeksma/h2ww-platform`

## 3. Path-Based Filtering voor Agent Branches

Workflows draaien alleen bij relevante file changes. Voorkomt onnodige CI runs bij docs-only changes.

### Implementatie (optioneel, per workflow)

```yaml
on:
  push:
    branches: [main, staging]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.claude/**'
      - '.cleo/**'
      - '.planning/**'
  pull_request:
    branches: [main, staging]
    paths-ignore:
      - '**.md'
      - 'docs/**'
      - '.claude/**'
      - '.cleo/**'
      - '.planning/**'
```

**Let op:** Voeg dit NIET toe aan security workflows - die moeten altijd draaien.

## 4. Branch Protection Rules

### Main branch bescherming

**GitHub UI:** Settings > Branches > Branch protection rules > `main`

```
[x] Require a pull request before merging
    [x] Require approvals (1)
    [ ] Dismiss stale pull request approvals (optioneel)
[x] Require status checks to pass before merging
    [x] Require branches to be up to date before merging
    Status checks: ci, security (als beschikbaar)
[x] Require conversation resolution before merging
[ ] Require merge queue (optioneel, voor hoog-volume repos)
[x] Do not allow bypassing the above settings
```

### Merge Queue (optioneel, voor hoog-volume)

Als meerdere agents tegelijk PRs mergen:

```
[x] Require merge queue
    Build concurrency: 2
    Merge method: Squash and merge
    Maximum pull requests to build: 3
    Minimum pull requests to merge: 1
```

**Wanneer merge queue inschakelen:**
- 3+ agents tegelijk actief op dezelfde repo
- Merge conflicten komen regelmatig voor
- CI pipeline duurt >5 minuten

**Wanneer NIET:**
- 1-2 agents per repo (standaard workflow volstaat)
- Korte CI pipelines (<3 min)

## 5. Recommended PR Settings

**GitHub UI:** Settings > General > Pull Requests

```
[x] Allow squash merging (default)
    Default commit message: Pull request title and description
[ ] Allow merge commits
[ ] Allow rebase merging
[x] Automatically delete head branches
[x] Always suggest updating pull request branches
```

---

## Implementatie Volgorde

1. **Direct:** Concurrency groups aan CI workflows (alle repos)
2. **Direct:** Auto-delete branches instellen (per repo via UI/API)
3. **Later:** Path-based filtering evalueren per workflow
4. **Later:** Branch protection rules versterken als nodig
5. **Optioneel:** Merge queue activeren bij hoog volume

---

*Onderdeel van ROOSE-158: Multi-Agent Issue Claiming & Conflict-Free Git Workflow*
