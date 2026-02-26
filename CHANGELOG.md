# Changelog

## [0.2.0](https://github.com/hansbeeksma/roosevelt-ops/compare/v0.1.0...v0.2.0) (2026-02-26)


### Features

* **analytics:** integrate @rooseveltops/analytics-layer (ROOSE-133) ([830ebd8](https://github.com/hansbeeksma/roosevelt-ops/commit/830ebd81cbbfecd307ada7ddcc1904ecf5cc7d67))
* **api:** add Fastify route modules, Clerk auth, Inngest SDK, and security hardening ([#27](https://github.com/hansbeeksma/roosevelt-ops/issues/27)) ([f489c4e](https://github.com/hansbeeksma/roosevelt-ops/commit/f489c4e9c55ac4dcf53f6c842fb14ee1c36f4947))
* **api:** setup Fastify v5 server with TypeScript ([d295485](https://github.com/hansbeeksma/roosevelt-ops/commit/d295485eb61d85cd8c3646768674d518fbcfe114))
* **auth:** integreer Clerk authenticatie (ROOSE-346) en fix incidents schema (ROOSE-312) ([539d053](https://github.com/hansbeeksma/roosevelt-ops/commit/539d053fd891640f96122dbb4c4457b2d7108297))
* **auth:** voeg Clerk auth utilities en multi-tenant database schema toe ([782bc7c](https://github.com/hansbeeksma/roosevelt-ops/commit/782bc7cace887e3dc38e77b0ab82d6e73c565318))
* **compliance:** add IN_PROGRESS lifecycle compliance files ([a60301e](https://github.com/hansbeeksma/roosevelt-ops/commit/a60301e25071ae19f08fe73ee506baf2ef7c2af2))
* **dashboard:** replace hardcoded values with Supabase RPC calls ([384b11a](https://github.com/hansbeeksma/roosevelt-ops/commit/384b11a596c8176e86101cf14b59cc085b767a42))
* **design:** Add Figma workflow integration ([e817117](https://github.com/hansbeeksma/roosevelt-ops/commit/e81711784380bfdab17751c70c6898ad29cba337))
* **design:** Add localhost prototype phase to Figma workflow ([d8acaf4](https://github.com/hansbeeksma/roosevelt-ops/commit/d8acaf4b8c6d6d35cd60161cbbd108a4ce0ecb80))
* **infra:** add Metabase deployment IaC (ROOSE-181) ([72e02b4](https://github.com/hansbeeksma/roosevelt-ops/commit/72e02b41795137b5b9e3b4ea2bb4b93b76764011))
* **metrics:** add domain setup tooling and SPACE data collection ([76f21ba](https://github.com/hansbeeksma/roosevelt-ops/commit/76f21baa42291a6e1ed8ecb57f29033fa8269071))
* monorepo foundation, Clerk auth, Fastify API (ROOSE-336/346/365/312) ([289f73d](https://github.com/hansbeeksma/roosevelt-ops/commit/289f73db1dff36968cb80c42fa8c014c1994604b))
* monorepo foundation, Clerk auth, Fastify API (ROOSE-336/346/365/312) ([289f73d](https://github.com/hansbeeksma/roosevelt-ops/commit/289f73db1dff36968cb80c42fa8c014c1994604b))
* **ops:** add Agent HQ system and MCP expansion ([5a1a45d](https://github.com/hansbeeksma/roosevelt-ops/commit/5a1a45d86166fd4449e2ab11e1340204abe2c302))
* **portal-auth:** client authentication with magic links (ROOSE-352) ([#26](https://github.com/hansbeeksma/roosevelt-ops/issues/26)) ([1fe956c](https://github.com/hansbeeksma/roosevelt-ops/commit/1fe956c6b6a6235b84b9eb0165272f6a3572aed9))
* **workspace:** initialiseer NX workspace met pnpm ([64829e7](https://github.com/hansbeeksma/roosevelt-ops/commit/64829e72df8fdc84b3b52a9eea43693ec18ebea2))
* **workspace:** migreer Next.js app naar apps/web/ (ROOSE-340) ([76991cc](https://github.com/hansbeeksma/roosevelt-ops/commit/76991cc73a89eac4922181ac6b6b1f637dcb81f6))


### Bug Fixes

* **build:** rename dynamic import to avoid conflict with Next.js export ([c135c19](https://github.com/hansbeeksma/roosevelt-ops/commit/c135c19fc43ac6f8ef528949a84908d1d6defe90))
* **ci:** Clerk build key en Vale reporter voor grote PRs ([e4c3d70](https://github.com/hansbeeksma/roosevelt-ops/commit/e4c3d702d7725163ff2d9c3bc914b01834507d06))
* **ci:** e2e.yml monorepo paden + pnpm action volgorde in deploy/e2e ([2f9065c](https://github.com/hansbeeksma/roosevelt-ops/commit/2f9065c38da0524e15d2c44c956c5eb9715fc74f))
* **ci:** force-dynamic op alle Clerk pagina's om prerendering te voorkomen ([4dfd5f7](https://github.com/hansbeeksma/roosevelt-ops/commit/4dfd5f734dc81bb385af490e7978b178ecd164d6))
* **ci:** gebruik Clerk secret uit GitHub Actions ([445d799](https://github.com/hansbeeksma/roosevelt-ops/commit/445d7994782e8f410691512477c620c5f2e90ea7))
* **ci:** repareer build, tests en resterende CI-failures ([9f9ff3a](https://github.com/hansbeeksma/roosevelt-ops/commit/9f9ff3a9642caaa3741f6e26bd9cf1e8e20b724a))
* **ci:** skip ClerkProvider zonder geldige key in CI build ([bfd2b7c](https://github.com/hansbeeksma/roosevelt-ops/commit/bfd2b7c30a0da0d3c7defc5a9ad930d3200d64b2))
* **ci:** sync pnpm versie naar 9 (match packageManager in package.json) ([4a7605a](https://github.com/hansbeeksma/roosevelt-ops/commit/4a7605afcdfcd307b960e282be85a81184230133))
* **ci:** update security-config.yml voor monorepo structuur ([db8e621](https://github.com/hansbeeksma/roosevelt-ops/commit/db8e621fbd1bee115c999c89c5b7e2c91fc97f9f))
* **ci:** use real Supabase secrets + fix Clerk SSR build error ([96310a0](https://github.com/hansbeeksma/roosevelt-ops/commit/96310a0a2a9f4fb4a3ed41a8be908a686bc4de3d))
* **ci:** Vale Linter continue-on-error voor grote PR diffs ([91e03f2](https://github.com/hansbeeksma/roosevelt-ops/commit/91e03f2251fbd48e428e625a67b6fe764d64cb31))
* **ci:** verplaats analytics-layer naar monorepo en fix gitleaks ([c04517e](https://github.com/hansbeeksma/roosevelt-ops/commit/c04517e665910c1b9c9e6573a555dc044c6bf01c))
* **ci:** vervang hashFiles job-conditie door step-level check in e2e.yml ([#25](https://github.com/hansbeeksma/roosevelt-ops/issues/25)) ([df586ab](https://github.com/hansbeeksma/roosevelt-ops/commit/df586ab8c342a4206134b5fbaa3c735e72256c93))
* **ci:** vervang reusable npm workflow door inline pnpm stappen ([49e4663](https://github.com/hansbeeksma/roosevelt-ops/commit/49e4663264e365ef38b12b52030b2984efe4412a))
* **ci:** verwijder next/dynamic naamconflict met force-dynamic export ([c84da2b](https://github.com/hansbeeksma/roosevelt-ops/commit/c84da2b4e2d409865412bc6ba82e9ab1b5140fcd))
* **db:** resolve dual incidents table conflict in migrations ([8393ab9](https://github.com/hansbeeksma/roosevelt-ops/commit/8393ab97a763be9eed6c6d06bfa8aae0323c9578))
* lib/types/incidents.ts comment gecorrigeerd naar ops_incidents table schema. ([539d053](https://github.com/hansbeeksma/roosevelt-ops/commit/539d053fd891640f96122dbb4c4457b2d7108297))
* **package:** correct project name from metrics to roosevelt-ops ([11d36fc](https://github.com/hansbeeksma/roosevelt-ops/commit/11d36fc99ef00a5d8783e87b147ffc5856a47e6f))
* **security:** whitelist SETUP.md example JWT tokens ([88d6e07](https://github.com/hansbeeksma/roosevelt-ops/commit/88d6e07a0b1f33da859184158f11029f8634a6e9))

## Changelog

All notable changes to this project will be documented in this file.

This changelog is automatically generated by [release-please](https://github.com/googleapis/release-please).
See [Conventional Commits](https://www.conventionalcommits.org/) for commit guidelines.
