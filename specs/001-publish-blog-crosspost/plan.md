# Implementation Plan: Post-Publish Blog Crossposting

**Branch**: `001-publish-blog-crosspost` | **Date**: 2026-03-23 | **Spec**: `c:\Repo\Personal\PersonalWebsite\specs\001-publish-blog-crosspost\spec.md`
**Input**: Feature specification from `c:\Repo\Personal\PersonalWebsite\specs\001-publish-blog-crosspost\spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Add an automated post-publish distribution step that runs after successful GitHub Pages deployment, reads canonical blog markdown content, and publishes eligible non-draft posts to Medium and LinkedIn (with AI-generated short-form LinkedIn copy). Implementation is centered on a Node.js orchestration script integrated into `.github/workflows/deploy.yml`, with explicit per-target result reporting, partial-failure tolerance, and duplicate-prevention tracking.

## Technical Context

**Language/Version**: JavaScript on Node.js 20.x (GitHub Actions runtime and local CLI execution)  
**Primary Dependencies**: Existing Node toolchain, GitHub Actions runtime, platform APIs (Medium, LinkedIn), AI text generation provider for LinkedIn short post  
**Storage**: File-based inputs (`src/blog/*.md`) and file-based publication ledger (`.github/crosspost-ledger.json`)  
**Testing**: `npm run build`, local dry-run CLI invocation, manual GitHub Actions run verification, checklist validation in `TESTING.md`  
**Target Platform**: GitHub Actions `ubuntu-latest` deployment pipeline, optional local Node execution for dry-run/recovery
**Project Type**: Static website automation with CI/CD-integrated publish script  
**Performance Goals**: Crosspost orchestration starts immediately after successful deploy and finishes per release within 10 minutes (including external API latency)  
**Constraints**: Must run only post-deploy success; must skip `draft: true`; must not block one platform when another fails; must not expose secrets in logs; must avoid duplicate publish for same article/platform/release  
**Scale/Scope**: Typical release volume 1-5 eligible posts and 2 initial platforms (Medium and LinkedIn) with extensible target model

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] Static-first compatibility confirmed (no required server-side runtime).
- [x] All internal absolute paths will use Eleventy `url` filter.
- [x] Build gate defined: `npm run build` required before merge/release.
- [x] Manual verification scope defined per `TESTING.md` for UI-impacting changes.
- [x] Content/frontmatter contract impacts identified (post/talk/training + draft behavior).
- [x] Search/performance impact evaluated (Pagefind, scripts, styles, assets).

Pre-Phase 0 gate status: PASS

## Project Structure

### Documentation (this feature)

```text
specs/001-publish-blog-crosspost/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
.github/
├── workflows/
│   └── deploy.yml                 # Add post-deploy crosspost step
└── crosspost-ledger.json          # New dedup/audit ledger (feature scope)

scripts/
└── crosspost/
    ├── publish.js                 # Main CLI/orchestration entry point
    ├── extract-article.js         # Markdown/frontmatter extraction and draft gating
    ├── linkedin-shortpost.js      # AI shortpost generation adapter
    ├── medium-publisher.js        # Medium target adapter
    ├── linkedin-publisher.js      # LinkedIn target adapter
    └── ledger.js                  # Idempotency and run history helpers

src/blog/
└── *.md                           # Canonical blog markdown input files

specs/001-publish-blog-crosspost/
├── research.md
├── data-model.md
├── quickstart.md
└── contracts/
```

**Structure Decision**: Use existing single-repo static-site structure and introduce a focused `scripts/crosspost/` automation module plus workflow integration in `.github/workflows/deploy.yml`. This keeps user-facing Eleventy output unchanged while adding deployment-time automation.

## Phase 0: Research Plan

1. Confirm post-deployment hook point in `.github/workflows/deploy.yml` after `deploy-pages@v4` success.
2. Confirm minimal draft-gating extraction strategy from markdown frontmatter.
3. Define multi-target orchestration pattern for partial failure tolerance and run summaries.
4. Define secure secret handling and AI generation behavior for LinkedIn shortpost.
5. Confirm idempotency/duplicate strategy for reruns.

Phase 0 output: `c:\Repo\Personal\PersonalWebsite\specs\001-publish-blog-crosspost\research.md`

## Phase 1: Design And Contracts

1. Define entities and lifecycle/state transitions in `data-model.md`.
2. Define CLI/workflow interface contract for crosspost invocation and result schema.
3. Define quickstart for local dry-run, secret configuration, and release verification.
4. Update Copilot agent context with any new technology surface.

Phase 1 outputs:
- `c:\Repo\Personal\PersonalWebsite\specs\001-publish-blog-crosspost\data-model.md`
- `c:\Repo\Personal\PersonalWebsite\specs\001-publish-blog-crosspost\contracts\crosspost-workflow-contract.md`
- `c:\Repo\Personal\PersonalWebsite\specs\001-publish-blog-crosspost\quickstart.md`

## Phase 2: Implementation Planning Approach

1. Sequence work as: content extraction and gating -> platform adapters -> orchestration and ledger -> workflow integration -> verification tasks.
2. Keep initial platform set fixed to Medium and LinkedIn while keeping adapter interfaces extensible.
3. Include explicit tasks for build gate (`npm run build`) and manual release-path validation.
4. Include failure-injection tasks for partial target outages and duplicate-run protection.

## Post-Design Constitution Re-Check

- [x] Static-first compatibility confirmed (automation only, no runtime hosting changes).
- [x] PathPrefix URL safety preserved (no template URL regressions introduced by this design).
- [x] Build gate remains mandatory (`npm run build` in implementation tasks and release verification).
- [x] Manual verification scope defined (deploy success plus crosspost outcomes and draft exclusion checks).
- [x] Content model integrity preserved (uses existing `draft` frontmatter semantics for blog content).
- [x] Search/performance compatibility preserved (no Pagefind pipeline disruption, no client bundle impact).

Post-Phase 1 gate status: PASS

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| None | N/A | N/A |
