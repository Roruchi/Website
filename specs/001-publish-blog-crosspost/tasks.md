# Tasks: Post-Publish Blog Crossposting

**Input**: Design documents from `specs/001-publish-blog-crosspost/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/crosspost-workflow-contract.md`, `quickstart.md`

**Tests**: No automated test runner is defined in this repository; verification is performed via build plus manual and dry-run checks.

**Organization**: Tasks are grouped by user story so each story remains independently implementable and verifiable.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create baseline crosspost script structure and repository wiring.

- [X] T001 Create crosspost script entrypoint scaffold in `scripts/crosspost/publish.js`
- [X] T002 [P] Create crosspost package directory and module exports in `scripts/crosspost/index.js`
- [X] T003 [P] Add crosspost dry-run npm script in `package.json`
- [X] T004 [P] Create initial crosspost ledger file with schema version in `.github/crosspost-ledger.json`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Implement shared utilities and deploy workflow integration required by all stories.

**Critical**: No user story implementation should begin until this phase is complete.

- [X] T005 Implement markdown frontmatter extraction utility for blog sources in `scripts/crosspost/extract-article.js`
- [X] T006 [P] Implement ledger read/write helpers and schema validation in `scripts/crosspost/ledger.js`
- [X] T007 [P] Implement run-summary formatter and console reporter in `scripts/crosspost/summary.js`
- [X] T008 Implement CLI argument parsing and environment validation in `scripts/crosspost/publish.js`
- [X] T009 Integrate post-deploy crosspost invocation step with secrets in `.github/workflows/deploy.yml`
- [X] T010 Implement release-event gate and no-enabled-platform short-circuit in `scripts/crosspost/publish.js`

**Checkpoint**: Foundation complete - story work can proceed.

---

## Phase 3: User Story 1 - Publish to External Platforms After Successful Site Publish (Priority: P1) 🎯 MVP

**Goal**: Publish non-draft article content to enabled targets only after successful site deployment.

**Independent Test**: Run a dry-run/manual invocation for one `draft: false` article after a successful deploy context and verify per-platform publication attempts are generated.

- [X] T011 [P] [US1] Implement Medium publishing adapter for long-form article payloads in `scripts/crosspost/medium-publisher.js`
- [X] T012 [P] [US1] Implement platform-target configuration map and validation in `scripts/crosspost/platform-targets.js`
- [X] T013 [US1] Implement article discovery from `src/blog/*.md` and eligibility filtering in `scripts/crosspost/publish.js`
- [X] T014 [US1] Implement multi-platform orchestration loop with independent target execution in `scripts/crosspost/publish.js`
- [X] T015 [US1] Implement per-target outcome capture (success/failed/skipped + reason) in `scripts/crosspost/publish.js`
- [X] T016 [US1] Document post-deploy invocation command and expected summary output in `specs/001-publish-blog-crosspost/quickstart.md`

**Checkpoint**: User Story 1 is independently functional and demonstrable.

---

## Phase 4: User Story 2 - Generate LinkedIn AI Shortpost (Priority: P2)

**Goal**: Generate AI-written LinkedIn short posts from article content and publish to LinkedIn when enabled.

**Independent Test**: Execute crosspost for one eligible article with LinkedIn enabled and verify shortpost generation is performed before LinkedIn publish.

- [X] T017 [P] [US2] Implement AI shortpost generation module for LinkedIn content in `scripts/crosspost/linkedin-shortpost.js`
- [X] T018 [P] [US2] Implement LinkedIn publishing adapter for short-form content in `scripts/crosspost/linkedin-publisher.js`
- [X] T019 [US2] Integrate LinkedIn shortpost generation into target execution flow in `scripts/crosspost/publish.js`
- [X] T020 [US2] Enforce LinkedIn shortpost length constraints and truncation behavior in `scripts/crosspost/linkedin-shortpost.js`
- [X] T021 [US2] Handle shortpost generation failure as LinkedIn-only skip without stopping other targets in `scripts/crosspost/publish.js`

**Checkpoint**: User Story 2 is independently functional with AI-generated LinkedIn publishing.

---

## Phase 5: User Story 3 - Enforce Draft Exclusion And Duplicate Safety (Priority: P3)

**Goal**: Prevent draft publication and deduplicate repeated runs for the same release/article/platform.

**Independent Test**: Run one execution with a draft article and one rerun for the same release/article/platform and verify skip plus duplicate-block outcomes.

- [X] T022 [P] [US3] Enforce explicit `draft: true` exclusion and skip reasons in `scripts/crosspost/extract-article.js`
- [X] T023 [US3] Implement idempotency key check (`releaseId + articleId + platform`) in `scripts/crosspost/ledger.js`
- [X] T024 [US3] Record duplicate-blocked attempts and persist ledger updates in `scripts/crosspost/ledger.js`
- [X] T025 [US3] Integrate dedup guard into publish pipeline before target API calls in `scripts/crosspost/publish.js`
- [X] T026 [US3] Add rerun and duplicate-handling verification steps in `specs/001-publish-blog-crosspost/quickstart.md`

**Checkpoint**: User Story 3 is independently functional with draft gating and duplicate prevention.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final hardening, constitution checks, and release verification.

- [X] T027 [P] Update workflow and CLI contract details to match final implementation in `specs/001-publish-blog-crosspost/contracts/crosspost-workflow-contract.md`
- [X] T028 Validate path-prefix URL safety impact and record no-template-change result in `specs/001-publish-blog-crosspost/quickstart.md`
- [X] T029 Run build gate and record verification evidence in `specs/001-publish-blog-crosspost/quickstart.md`
- [X] T030 Execute `TESTING.md` manual checks and record crosspost verification outcomes in `specs/001-publish-blog-crosspost/quickstart.md`
- [X] T031 Validate Pagefind continuity and script/performance impact notes in `specs/001-publish-blog-crosspost/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- Setup (Phase 1) has no prerequisites.
- Foundational (Phase 2) depends on Setup and blocks all user stories.
- User Story phases depend on Foundational completion.
- Polish (Phase 6) depends on completion of selected user stories.

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 and delivers MVP independently.
- **US2 (P2)**: Starts after Phase 2 and builds on orchestration from US1 modules.
- **US3 (P3)**: Starts after Phase 2 and can progress in parallel with US2 once core pipeline hooks exist.

### Within Each User Story

- Create adapters/utilities before pipeline integration.
- Integrate orchestration only after module-level behavior is available.
- Complete story checkpoint verification before moving to final polish.

## Parallel Opportunities

- **Setup**: T002, T003, and T004 can run in parallel after T001.
- **Foundational**: T006 and T007 can run in parallel after T005.
- **US1**: T011 and T012 can run in parallel before T014.
- **US2**: T017 and T018 can run in parallel before T019.
- **US3**: T022 can run in parallel with T023 before T025.
- **Polish**: T027 can run in parallel with T028; T030 and T031 can run after T029.

## Parallel Example: User Story 1

- Run T011 and T012 together.
- Then run T013, followed by T014 and T015.

## Parallel Example: User Story 2

- Run T017 and T018 together.
- Then run T019, T020, and T021 in sequence.

## Parallel Example: User Story 3

- Run T022 and T023 together.
- Then run T024 and T025, followed by documentation update T026.

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete all US1 tasks (T011-T016).
3. Validate MVP behavior using quickstart dry-run and deploy-context verification.

### Incremental Delivery

1. Deliver MVP with US1.
2. Add US2 for LinkedIn AI shortpost generation.
3. Add US3 for draft exclusion and duplicate safety.
4. Finish with Phase 6 constitution-driven verification tasks.

### Parallel Team Strategy

1. One engineer owns foundational CLI/ledger utilities.
2. One engineer implements Medium and orchestration (US1).
3. One engineer implements LinkedIn AI path (US2).
4. One engineer implements dedup/draft hardening and verification docs (US3/Polish).
