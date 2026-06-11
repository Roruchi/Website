<!--
Sync Impact Report
- Version change: template-placeholder -> 1.0.0
- Modified principles:
	- Placeholder Principle 1 -> I. Static-First Architecture
	- Placeholder Principle 2 -> II. PathPrefix-Safe URLs
	- Placeholder Principle 3 -> III. Build And Verification Gate
	- Placeholder Principle 4 -> IV. Content Model Integrity
	- Placeholder Principle 5 -> V. Performance And Search Compatibility
- Added sections:
	- Technical Constraints
	- Delivery Workflow & Quality Gates
- Removed sections:
	- None
- Templates requiring updates:
	- ✅ updated: .specify/templates/plan-template.md
	- ✅ updated: .specify/templates/spec-template.md
	- ✅ updated: .specify/templates/tasks-template.md
	- ⚠ pending: .specify/templates/commands/*.md (directory not present in repository)
- Follow-up TODOs:
	- None
-->

# PersonalWebsite Constitution

## Core Principles

### I. Static-First Architecture
All deliverables MUST remain compatible with the Eleventy static-site pipeline
(`src/` -> `_site/`) and MUST preserve the shared template inheritance model
(`src/_includes/base.njk` as layout root, `post.njk` for blog posts). Features that
require persistent server-side runtime or server-rendered dependencies are not
permitted unless the constitution is amended first.
Rationale: The deployment model, hosting, and build scripts assume static output.

### II. PathPrefix-Safe URLs
All absolute site paths in templates and content MUST be piped through the
Eleventy `url` filter so GitHub Pages sub-path hosting works correctly. Internal
navigation MUST resolve when hosted at a repository path prefix, not only at root.
Rationale: `pathPrefix` is set dynamically at build time and broken links are a
release blocker.

### III. Build And Verification Gate
Any change to templates, styles, filters, collections, or generated-page behavior
MUST pass `npm run build` before merge or release. UI-affecting changes MUST also
run the manual verification checklist in `TESTING.md`, and outcomes MUST be
captured in PR notes or task artifacts.
Rationale: This repository has no automated test runner, so build success and
manual verification are the enforceable quality gate.

### IV. Content Model Integrity
Content items MUST conform to declared collection contracts.
- Blog posts MUST include `tag: post`, `date`, and `description`.
- Talks MUST include `tag: talk` and event metadata (`event`, `location`; optional
	`slides`, `video`).
- Trainings MUST include `tag: training`.
Any item with `draft: true` MUST remain excluded from published collections and
final output. Changes to collection semantics require coordinated updates to
templates, docs, and existing content.
Rationale: Consistent metadata drives listing pages, feeds, and related-content
logic.

### V. Performance And Search Compatibility
Site features MUST preserve static search indexing and baseline performance.
- `pagefind` generation MUST continue to run as part of `npm run build`.
- New client-side scripts/styles MUST be justified and kept minimal.
- Large assets MUST use existing optimization patterns (for example, the image
	shortcode for local images).
Rationale: Fast static delivery and on-site search are core user-facing quality
attributes.

## Technical Constraints

The canonical stack is Eleventy 2.x + Nunjucks templates + Tailwind CSS v3 +
Pagefind. Changes MUST preserve:
- `src/assets/input.css` as Tailwind source and committed `src/assets/style.css`
	as served output.
- GitHub Pages deployment compatibility through static `_site/` artifacts.
- Existing design tokens and conventions documented in `.github/copilot-instructions.md`
	unless a deliberate design migration is approved.
- Mermaid and image shortcode behavior documented in guidance files.

## Delivery Workflow & Quality Gates

Work MUST be delivered with a traceable spec -> plan -> tasks flow when using
Speckit workflows. Each implementation plan MUST include an explicit
Constitution Check and each task list MUST include verification tasks for build,
manual UI checks, and path-prefix safety when applicable.

Reviewers MUST block merges when constitutional requirements are unmet, including
missing metadata contracts, skipped build gate, or path-prefix-unsafe links.

## Governance

This constitution supersedes informal workflow preferences. Changes follow this
procedure:
1. Propose amendment with rationale and impacted files.
2. Classify version bump using semantic versioning rules below.
3. Update dependent templates and guidance docs in the same change.
4. Record the Sync Impact Report in the constitution header.

Versioning policy:
- MAJOR: Breaking governance changes or principle removals/redefinitions.
- MINOR: New principle/section or materially expanded mandatory guidance.
- PATCH: Clarifications, wording improvements, typo/non-semantic fixes.

Compliance review expectations:
- Every feature plan and PR review MUST verify constitutional gates.
- Non-compliance MUST be resolved before merge.
- Exceptions are not allowed without a prior constitution amendment.

**Version**: 1.0.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23
