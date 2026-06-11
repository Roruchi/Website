# Phase 0 Research: Post-Publish Blog Crossposting

## Decision 1: Trigger crossposting from deploy workflow after successful Pages deployment
- Decision: Add crosspost invocation as a post-deploy step in `.github/workflows/deploy.yml` after `actions/deploy-pages@v4` succeeds.
- Rationale: This guarantees external publication happens only after the website is actually published, directly satisfying the post-publish gating requirement.
- Alternatives considered: Trigger from `npm run build` (too early, pre-deploy), manual-only execution (not automatic), scheduled follow-up workflow (added latency and complexity).

## Decision 2: Use Node.js script-based orchestration in repository scripts
- Decision: Implement a Node.js CLI script under `scripts/crosspost/` as the orchestration entry point.
- Rationale: The repository already uses Node tooling; script execution in GitHub Actions is straightforward and locally testable.
- Alternatives considered: Shell-only logic in YAML (hard to maintain), separate service/application (over-scoped for this static-site workflow).

## Decision 3: Read canonical markdown sources directly from `src/blog/*.md`
- Decision: Source publication content from blog markdown files in `src/blog/` and parse frontmatter/body from that canonical source.
- Rationale: Keeps one source of truth and aligns with existing content model conventions.
- Alternatives considered: Parse generated HTML from `_site/` (fragile and lossy), maintain duplicate publish-specific content files (drifts from canonical content).

## Decision 4: Gate eligibility with frontmatter `draft: false`
- Decision: Explicitly parse and enforce frontmatter draft rules so only non-draft posts are crossposted.
- Rationale: Directly maps to feature requirement and repository constitution content-integrity principle.
- Alternatives considered: Filename/date heuristics (not reliable), manual allowlist file (extra operational burden and error-prone).

## Decision 5: Platform adapter pattern for Medium and LinkedIn
- Decision: Define separate publisher adapters for Medium and LinkedIn and orchestrate them through one runner.
- Rationale: Isolates platform-specific payload and auth behavior while preserving shared retry, logging, and summary behavior.
- Alternatives considered: Single monolithic publish function (harder to extend/test), separate scripts per platform (duplicate orchestration logic).

## Decision 6: Generate LinkedIn short post at publish time using AI provider
- Decision: For LinkedIn target, generate short-form copy from article content during crosspost execution.
- Rationale: Ensures generated content reflects latest article edits and supports fully automated promotion workflow.
- Alternatives considered: Manual shortpost authoring (not automated), pre-generated shortpost in frontmatter (extra maintenance and drift risk).

## Decision 7: Continue on per-platform failure and produce structured run summary
- Decision: Execute platform targets independently, collect status for each, and continue when one fails.
- Rationale: Meets requirement to avoid all-or-nothing behavior while still exposing failures for remediation.
- Alternatives considered: Fail-fast global abort (violates requirement), silent skip on failures (poor observability).

## Decision 8: Add idempotency via publication ledger keyed by article + platform + release ID
- Decision: Use a local ledger file (for example `.github/crosspost-ledger.json`) to prevent duplicate publish for same article/platform/release context.
- Rationale: Provides deterministic duplicate prevention and auditable outcomes with minimal infrastructure.
- Alternatives considered: No dedup (risk of duplicate posts), external datastore (unnecessary complexity for this scope).

## Decision 9: Use GitHub Actions Secrets and environment variables for credentials
- Decision: Pass Medium, LinkedIn, and AI-provider credentials through GitHub Secrets into workflow env for script consumption.
- Rationale: Standard secure CI practice and avoids credential leakage in repository files.
- Alternatives considered: Hardcoded tokens (insecure), plaintext config file in repo (insecure), manually entered credentials per run (not scalable).

## Decision 10: Provide dry-run/manual replay mode
- Decision: Support manual script invocation with dry-run option for validation and post-failure recovery.
- Rationale: Improves operability and satisfies requirement for manual invocation after successful website publish.
- Alternatives considered: CI-only invocation without local/manual mode (harder recovery and testing).
