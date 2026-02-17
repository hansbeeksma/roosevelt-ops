# Multi-Version Support Strategy

> SemVer for design system releases with LTS support

## Semantic Versioning Policy

The Roosevelt OPS design system follows [Semantic Versioning 2.0.0](https://semver.org/):

```
MAJOR.MINOR.PATCH

MAJOR: Breaking changes (removed components, changed APIs, token renames)
MINOR: New features (new components, new variants, new tokens)
PATCH: Bug fixes (visual fixes, a11y improvements, typo fixes)
```

## Version Lifecycle

```
                    ┌─────────┐
                    │  Alpha  │  Pre-release, unstable
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │  Beta   │  Feature complete, testing
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │   RC    │  Release candidate, final testing
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │ Stable  │  Production ready
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │   LTS   │  Long-term support (security only)
                    └────┬────┘
                         │
                    ┌────▼────┐
                    │   EOL   │  End of life (no updates)
                    └─────────┘
```

## LTS (Long-Term Support) Policy

| Version Type | Active Support | Security Support | Total Lifetime |
|-------------|---------------|-----------------|----------------|
| **Current** | Until next major | N/A | Until next major |
| **LTS** | 6 months | 12 months | 18 months |
| **EOL** | None | None | Archived |

### LTS Schedule

| Version | Release | LTS Start | Security End | EOL |
|---------|---------|-----------|-------------|-----|
| v1.x | Q1 2026 | Q1 2026 | Q3 2027 | Q3 2027 |
| v2.x | Q3 2026 | When v3 ships | +12 months | TBD |

## Version Compatibility Matrix

```
Component Consumer  │ DS v1.x  │ DS v2.x  │ DS v3.x
────────────────────┼──────────┼──────────┼──────────
React 18            │    ✅    │    ✅    │    ✅
React 19            │    ⚠️    │    ✅    │    ✅
Next.js 14          │    ✅    │    ✅    │    ⚠️
Next.js 15          │    ⚠️    │    ✅    │    ✅
Tailwind CSS 3.x    │    ✅    │    ✅    │    ❌
Tailwind CSS 4.x    │    ❌    │    ⚠️    │    ✅

✅ = Fully supported
⚠️ = Works but not officially tested
❌ = Not supported
```

## Version Branches

```
main ────────────────────────────────────────── (current development)
  │
  ├── release/v1.x ─── v1.0.0 ── v1.0.1 ── v1.1.0 (LTS)
  │
  ├── release/v2.x ─── v2.0.0-alpha.1 ─── v2.0.0 (next)
  │
  └── (future: release/v3.x)
```

### Branch Protection Rules

| Branch | Merge requires | Auto-delete |
|--------|---------------|-------------|
| `main` | PR + 1 review + CI pass | No |
| `release/*` | PR + 1 review + CI pass | No |
| `feature/*` | CI pass | Yes |
| `fix/*` | CI pass | Yes |

## Release Process

### 1. Feature Freeze

```bash
# Create release branch
git checkout -b release/v2.0
git push -u origin release/v2.0
```

### 2. Release Candidate

```bash
# Tag RC
npm version 2.0.0-rc.1
git push --tags
```

### 3. Stable Release

```bash
# Merge RC to main
git checkout main
git merge release/v2.0
npm version 2.0.0
git push --tags
```

### 4. Post-Release

- [ ] Update changelog
- [ ] Publish to npm registry
- [ ] Update documentation site
- [ ] Notify teams via Slack
- [ ] Create migration guide (if major)

## Consuming Versions

```json
// package.json - Conservative (recommended for production)
{
  "dependencies": {
    "@rooseveltops/design-system": "~1.0.0"
  }
}

// package.json - Progressive (recommended for development)
{
  "dependencies": {
    "@rooseveltops/design-system": "^1.0.0"
  }
}

// package.json - Pinned (for maximum stability)
{
  "dependencies": {
    "@rooseveltops/design-system": "1.0.0"
  }
}
```

## Breaking Change Policy

Before shipping a breaking change:

1. **RFC**: Publish RFC document explaining the change
2. **Deprecation**: Add runtime warnings in current version (minimum 1 release prior)
3. **Migration Guide**: Document step-by-step migration path
4. **Code Mod**: Provide automated migration where possible
5. **Timeline**: Minimum 3 months from deprecation to removal
