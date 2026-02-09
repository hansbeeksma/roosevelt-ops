# Changelog

## 1.0.0 (2026-02-09)


### Features

* **ab-testing:** Activate A/B testing infrastructure ([36d7fcd](https://github.com/hansbeeksma/roosevelt-ops/commit/36d7fcd80a5de389870f2aa5c77672c4960d8b8f))
* **ab-testing:** Add lightweight A/B testing implementation (ROOSE-37.13) ([fb9b90a](https://github.com/hansbeeksma/roosevelt-ops/commit/fb9b90a475f6124ba7336bdab7af381963c34a67))
* add PagerDuty integration for critical incident paging (ROOSE-31) ([355ab8c](https://github.com/hansbeeksma/roosevelt-ops/commit/355ab8c3ab3d8366768c54ec80012bcaf9900d0e))
* add Plane integration for incident tracking (ROOSE-31) ([d0f6866](https://github.com/hansbeeksma/roosevelt-ops/commit/d0f68663147386c535847251f977dab5da000cf4))
* add Status Page integration for public incident updates (ROOSE-31) ([a895efc](https://github.com/hansbeeksma/roosevelt-ops/commit/a895efcdec0cac6dd2963229f0c3050d4d1785ae))
* **alerts:** Add alert deduplication with 1-hour cooldown ([2f8ce65](https://github.com/hansbeeksma/roosevelt-ops/commit/2f8ce65caddb4ba93480001f1ae9aa27cb6e130d))
* **ci:** Configure performance budget in CI pipeline ([b9ff4e0](https://github.com/hansbeeksma/roosevelt-ops/commit/b9ff4e0b754ea5ab1abc409e7f4ba8ad8289a273))
* **docs:** Add comprehensive Performance Playbook (ROOSE-37.14) ([e3edf1e](https://github.com/hansbeeksma/roosevelt-ops/commit/e3edf1e01babece5c3f6a25cc2774d2f82bef2dc))
* implement DORA + SPACE metrics dashboard ([b452937](https://github.com/hansbeeksma/roosevelt-ops/commit/b45293714c57ba81d796766b952a7faca2839515))
* implement incident management process with runbooks and postmortem templates (ROOSE-31) ([2e3c349](https://github.com/hansbeeksma/roosevelt-ops/commit/2e3c3490ea95f3479bfeda8ed4c3fc573ec310f6))
* implement infrastructure monitoring & alerts (ROOSE-24) ([72abb86](https://github.com/hansbeeksma/roosevelt-ops/commit/72abb86437ced3b7d6e06229336c6426b37cf0b7))
* implement metrics alert workflow (ROOSE-29 Phase 3) ([e74e12d](https://github.com/hansbeeksma/roosevelt-ops/commit/e74e12d29ccdc8cd34065c999275d8d04a2a4ad5))
* implement OpenTelemetry observability stack (ROOSE-30) ([e658612](https://github.com/hansbeeksma/roosevelt-ops/commit/e658612fb23a88e62984c9dde52dfe78da8d7fb0))
* implement Phase 2 incident workflow automation (ROOSE-31) ([9681eaf](https://github.com/hansbeeksma/roosevelt-ops/commit/9681eaf6dc0465e7e550b4e6cc85e97ee639979c))
* implement Phase 3 blameless culture training (ROOSE-31) ([ae1b8fc](https://github.com/hansbeeksma/roosevelt-ops/commit/ae1b8fc233033ef59e4556e8efca30bbafbf8877))
* implement Slack incident bot with database integration (ROOSE-31) ([461747d](https://github.com/hansbeeksma/roosevelt-ops/commit/461747d3ad3b18da392166a6be695d4d4812cbc7))
* **monitoring:** Setup RUM dashboard voor Core Web Vitals ([8b14def](https://github.com/hansbeeksma/roosevelt-ops/commit/8b14def4b34a45c1140a9c87c6f4798d79dd3230))
* **observability:** ROOSE-51 herschrijving - Sentry hardening + docs ([86a3d0e](https://github.com/hansbeeksma/roosevelt-ops/commit/86a3d0e12b903ab2508bc342a0355729a409aae3))
* **security:** add rate limiting and CORS middleware (ROOSE-40) ([8556627](https://github.com/hansbeeksma/roosevelt-ops/commit/8556627c375682a3d946c36b1c3a841a2979fe02))
* **security:** establish Security Champions Program (ROOSE-97) ([f872620](https://github.com/hansbeeksma/roosevelt-ops/commit/f872620f4fc374430688fa48b0b6ceef5b697816))
* **security:** implement DAST with OWASP ZAP (ROOSE-94) ([41c0ceb](https://github.com/hansbeeksma/roosevelt-ops/commit/41c0cebfcec9abf8c777ba90960b6e0301733095))
* **security:** implement Error Handling Security Framework (ROOSE-96) ([1ff9949](https://github.com/hansbeeksma/roosevelt-ops/commit/1ff994989212fb36603510cee2a24052972e3e90))
* **security:** implement ROOSE-91 pre-commit security hooks ([d2dd38e](https://github.com/hansbeeksma/roosevelt-ops/commit/d2dd38ef5947505de9bb5a48a91c710ba27c9d7c))
* **security:** implement ROOSE-92 CI SAST with Semgrep ([425c49c](https://github.com/hansbeeksma/roosevelt-ops/commit/425c49cdde1867ddb27694ad29bac6df329edcc2))
* **security:** implement ROOSE-93 CI SCA with Snyk/Dependabot ([6138304](https://github.com/hansbeeksma/roosevelt-ops/commit/6138304e7dfa2d90adaeef1967a1c13036a2416c))
* **security:** implement ROOSE-95 security misconfiguration checks ([4b5257e](https://github.com/hansbeeksma/roosevelt-ops/commit/4b5257e6c21f38928367271e6e750d8563edf69d))
* **security:** quarterly penetration testing program (ROOSE-98) ([66c352b](https://github.com/hansbeeksma/roosevelt-ops/commit/66c352bd492de3ba861dcf8d9f8d7ab8733d4a1c))
* **sentry:** migrate Sentry init to instrumentation.ts ([efd431d](https://github.com/hansbeeksma/roosevelt-ops/commit/efd431dfccfba1acf50e89b8b547cf0be4668fa0))


### Bug Fixes

* **ci:** disable inapplicable Lighthouse assertions ([9ae50bd](https://github.com/hansbeeksma/roosevelt-ops/commit/9ae50bdb999be4aca6ca41116f30cb29c9fea35f))
* **ci:** fix Snyk SARIF upload and upgrade CodeQL action to v4 ([ee3370c](https://github.com/hansbeeksma/roosevelt-ops/commit/ee3370c77277a02f4e1e743c58792762478fbc31))
* **ci:** graceful handling of missing Supabase secrets in metrics-alerts ([95a3c44](https://github.com/hansbeeksma/roosevelt-ops/commit/95a3c44683fdb8f21dcb0a0cf35b5e016c2adf36))
* **ci:** Improve gitleaks secret scanning for pull requests ([ecf78d6](https://github.com/hansbeeksma/roosevelt-ops/commit/ecf78d67402423599d2ca62b7a3b947b08bdea4f))
* **ci:** remove lighthouse:recommended preset, keep explicit assertions ([0ea0123](https://github.com/hansbeeksma/roosevelt-ops/commit/0ea0123c1a1eaa430eeb9a7dcf9030d20bb95975))
* **ci:** resolve Dependency Audit and Performance Budget failures ([944a877](https://github.com/hansbeeksma/roosevelt-ops/commit/944a87704f0f75183cc0ab297bb302a7ad54cc05))
* use correct Supabase auth in GitHub Actions ([fdef595](https://github.com/hansbeeksma/roosevelt-ops/commit/fdef595b8ed3c620e1b3903063be309d5a38589c))
