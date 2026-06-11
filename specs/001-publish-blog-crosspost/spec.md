# Feature Specification: Post-Publish Blog Crossposting

**Feature Branch**: `001-publish-blog-crosspost`  
**Created**: 2026-03-23  
**Status**: Implemented  
**Input**: User description: "Allow running a script to publish the markdown file blog (based on src/blog/blog.md) to different target platforms i.e. medium and a linkedIn shortpost (Written by AI). This script should be invoked once the website is published. Only if draft is false."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Publish blog post to external platforms after site publish (Priority: P1)

As a site owner, I want the system to publish a selected blog article to external platforms only after the website release succeeds, so external audiences receive content that matches the live website.

**Why this priority**: This is the core business outcome and primary value of the feature.

**Independent Test**: Can be fully tested by completing one website publish with a non-draft blog article and verifying that publication requests are created for each configured platform.

**Acceptance Scenarios**:

1. **Given** a website publish has completed successfully and the target article has `draft: false`, **When** the post-publish publishing step runs, **Then** the article is submitted for publication to each enabled platform target.
2. **Given** a website publish has not completed successfully, **When** a release attempt ends, **Then** no external publication is started.

---

### User Story 2 - Generate LinkedIn short post from article content (Priority: P2)

As a site owner, I want a LinkedIn short post to be generated from the source article in AI-written style, so I can promote the article quickly without drafting separate copy.

**Why this priority**: This drives additional audience reach with minimal manual effort after core publication is in place.

**Independent Test**: Can be fully tested by triggering the process for one non-draft article and confirming a short LinkedIn post is generated and used for LinkedIn publication.

**Acceptance Scenarios**:

1. **Given** a non-draft article is eligible for post-publish distribution, **When** LinkedIn targeting is enabled, **Then** the system generates a short-form AI-written LinkedIn post from the article before LinkedIn publication.
2. **Given** generated LinkedIn short post content is unavailable due to a generation failure, **When** publication runs, **Then** LinkedIn publication is skipped and the failure reason is reported without blocking other enabled targets.

---

### User Story 3 - Respect draft and duplicate-safety rules (Priority: P3)

As a site owner, I want draft content excluded and duplicate publishing prevented, so external channels stay clean and only finalized content is distributed once per release event.

**Why this priority**: Reduces reputational risk and operational noise while preserving confidence in automated publishing.

**Independent Test**: Can be fully tested by running one release with a draft article and one release replay for an already-published article and confirming no unintended duplicate external posts are created.

**Acceptance Scenarios**:

1. **Given** an article is marked `draft: true`, **When** post-publish distribution runs, **Then** no external publication attempts are made for that article.
2. **Given** an article was already published to a specific platform for the same website release event, **When** the process is re-run, **Then** the system does not create a duplicate publication for that platform.

### Edge Cases

- A target article path is missing or unreadable at publish time.
- One platform returns a failure while another succeeds.
- The process is triggered with no enabled external platforms.
- The source article exceeds a platform's content limits and requires truncation/summarization behavior.
- A release includes multiple eligible non-draft articles and publication must process all without skipping or duplicating.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST provide a post-publish publishing step that runs only after a successful website publish event.
- **FR-002**: The system MUST accept article source content from the canonical blog markdown source (default path `src/blog/blog.md`, or an explicitly provided blog markdown file path).
- **FR-003**: The system MUST evaluate the article `draft` state and publish externally only when `draft` is `false`.
- **FR-004**: The system MUST support publishing the same eligible article to multiple platform targets in one run, including Medium and LinkedIn.
- **FR-005**: The system MUST generate a short-form, AI-written LinkedIn post from the source article when LinkedIn target publishing is enabled.
- **FR-006**: The system MUST preserve article fidelity for long-form platform targets by using the source article title and body content.
- **FR-007**: The system MUST record a per-platform publication result for each run, including success, failure, skipped, and reason.
- **FR-008**: The system MUST continue processing remaining enabled targets when one target fails.
- **FR-009**: The system MUST prevent duplicate publication to the same platform for the same article and release event.
- **FR-010**: The system MUST provide a human-readable run summary listing each target platform outcome.
- **FR-011**: The system MUST skip external publishing entirely when no target platforms are enabled.
- **FR-012**: Users MUST be able to invoke the publishing step manually after a successful website publish for re-run and recovery scenarios.

### Key Entities *(include if feature involves data)*

- **Article Publication Candidate**: A blog article selected for distribution, including title, body content, source path, and draft status.
- **Release Event**: A completed website publish instance that gates whether external distribution is allowed.
- **Platform Target**: A destination channel (for example Medium or LinkedIn) with enablement status and destination-specific content expectations.
- **Publication Attempt**: A per-platform execution record containing timestamp, status, and failure/skip reason.
- **Publication Ledger**: Historical record used to detect duplicate publishes for the same article, platform, and release event.

## Assumptions

- Website publish completion is represented by a reliable success signal that the publishing step can read.
- Medium receives long-form article content derived from the source markdown article.
- LinkedIn receives short-form promotional content derived from the same article.
- AI-written LinkedIn short post content is acceptable for this workflow and does not require manual approval in the first release.
- If multiple eligible articles are included in one release event, each is processed independently using the same rules.

## Constitution Alignment *(mandatory)*

- **Static-First Impact**: Feature operates as release automation around static site output and does not require runtime server behavior on the deployed site.
- **URL Safety**: No template URL changes are required; existing website links continue to use Eleventy `url` filter where applicable.
- **Build Verification Plan**: Validate `npm run build` completes successfully and confirm post-publish invocation behavior in release verification.
- **Manual Verification Scope**: Verify published site renders normally, then verify post-publish distribution outcomes for draft and non-draft scenarios using the checklist process in `TESTING.md`.
- **Content Model Impact**: No new collection type is required; existing blog frontmatter `draft` flag is used as the publication gate.
- **Search & Performance Impact**: No change to page rendering path, Pagefind indexing logic, or visitor-facing runtime performance.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of non-draft articles included in a successful website release are submitted to all enabled external targets within 10 minutes of release completion.
- **SC-002**: 0 draft articles are externally published across release verification runs.
- **SC-003**: At least 95% of release runs produce a complete per-target publication summary without missing status entries.
- **SC-004**: On simulated single-platform failure, remaining enabled platforms still complete publication in at least 95% of validation runs.
- **SC-005**: Duplicate external posts for the same article, platform, and release event are reduced to 0 across repeated re-run tests.
