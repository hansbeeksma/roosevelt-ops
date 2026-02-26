# NX Workspace Guide — Roosevelt OPS

## Overview

Roosevelt OPS uses an NX monorepo to manage multiple applications and shared packages under a single repository. NX provides task orchestration, dependency tracking, and build caching across all projects.

## Project Graph

NX builds a project graph by analysing imports between packages. When `apps/web` imports from `packages/analytics-layer`, NX registers a dependency edge. This graph drives:

- **Affected detection** — only rebuild/retest projects touched by a change
- **Task ordering** — `build` targets wait for upstream `^build` to complete
- **Cache invalidation** — cache keys include all transitive inputs

Visualise the graph locally:

```bash
npx nx graph
```

## Workspace Layout

```
roosevelt-ops/
├── apps/
│   ├── web/          # Next.js frontend (scope:frontend)
│   ├── api/          # Node.js API (scope:backend)
│   └── portal/       # Client portal — planned (scope:frontend)
└── packages/
    └── analytics-layer/  # Shared analytics utilities (scope:shared)
```

Configuration is split across:

| File | Purpose |
|------|---------|
| `nx.json` | Task runner options, target defaults, workspace layout |
| `apps/*/project.json` | Per-app targets and tags |
| `packages/*/project.json` | Per-library targets and tags |

## Adding a New Application

1. Create the directory under `apps/`:

   ```bash
   mkdir -p apps/portal/src
   ```

2. Add `apps/portal/project.json` with the appropriate executor and tags:

   ```json
   {
     "name": "portal",
     "root": "apps/portal",
     "sourceRoot": "apps/portal/src",
     "projectType": "application",
     "targets": {
       "build": { "executor": "@nx/next:build" },
       "dev":   { "executor": "@nx/next:dev" },
       "test":  { "executor": "@nx/vite:test" }
     },
     "tags": ["scope:frontend", "type:app"]
   }
   ```

3. Install NX plugin if needed (e.g. `npm install -D @nx/next`).

## Adding a New Library

1. Create the directory under `packages/`:

   ```bash
   mkdir -p packages/ui/src
   ```

2. Add `packages/ui/project.json`:

   ```json
   {
     "name": "ui",
     "root": "packages/ui",
     "projectType": "library",
     "targets": {
       "build": { "executor": "@nx/js:tsc" },
       "test":  { "executor": "@nx/vite:test" }
     },
     "tags": ["scope:shared", "type:lib"]
   }
   ```

3. Add a `tsconfig.json` and export barrel (`src/index.ts`).

## Build and Test Commands

| Command | Description |
|---------|-------------|
| `npx nx build web` | Build the web app |
| `npx nx build api` | Build the API |
| `npx nx build analytics-layer` | Build the shared library |
| `npx nx test web` | Run tests for the web app |
| `npx nx test analytics-layer` | Run tests for the shared library |
| `npx nx run-many -t build` | Build all projects in dependency order |
| `npx nx run-many -t test` | Test all projects |
| `npx nx run-many -t lint` | Lint all projects |

## Affected Commands for CI Optimisation

NX detects which projects are affected by a code change relative to a base branch. Use these in CI to skip unchanged projects:

```bash
# Test only projects affected since branching from main
npx nx affected -t test --base=main --head=HEAD

# Build only affected projects
npx nx affected -t build --base=main --head=HEAD

# Lint only affected projects
npx nx affected -t lint --base=main --head=HEAD

# Show which projects would be affected (dry-run)
npx nx affected:graph --base=main --head=HEAD
```

In GitHub Actions, set `NX_BASE` and `NX_HEAD` environment variables to control the comparison range:

```yaml
- name: Run affected tests
  run: npx nx affected -t test --base=${{ github.event.pull_request.base.sha }} --head=${{ github.sha }}
```

## Caching

Cacheable operations are declared in `nx.json`:

```json
"cacheableOperations": ["build", "test", "lint"]
```

NX stores results in `.nx/cache/` locally. On CI, configure remote caching via Nx Cloud or the `--cache-directory` flag pointing to a shared volume.

## Module Boundaries

Tags on `project.json` files enable enforcement of architectural boundaries via ESLint rules (`@nx/enforce-module-boundaries`). Current tag taxonomy:

| Tag | Meaning |
|-----|---------|
| `scope:frontend` | Browser-only code |
| `scope:backend` | Server-only code |
| `scope:shared` | Safe to import from either scope |
| `type:app` | Deployable application |
| `type:lib` | Importable library |

A `scope:frontend` app may import `scope:shared` but never `scope:backend`, and vice versa.
