# Data Model: Post-Publish Blog Crossposting

## Entity: ArticlePublicationCandidate
- Description: Canonical blog article eligible for external publication evaluation.
- Fields:
  - `articleId` (string): Stable identifier derived from source file path or slug.
  - `sourcePath` (string): Absolute or repo-relative path to markdown source (for example `src/blog/2025-01-10-architecture-with-mermaid.md`).
  - `title` (string): Article title extracted from frontmatter.
  - `bodyMarkdown` (string): Markdown content body excluding frontmatter.
  - `publishedDate` (datetime): Article date from frontmatter.
  - `draft` (boolean): Draft flag from frontmatter.
  - `canonicalUrl` (string, optional): Published URL after deployment.
- Validation rules:
  - `sourcePath` MUST exist and be readable.
  - `title` MUST be non-empty.
  - `draft` MUST be explicitly treated as boolean (`true` blocks publishing).
- State transitions:
  - `discovered` -> `eligible` when parsed successfully and `draft=false`.
  - `discovered` -> `ineligible` when `draft=true` or parsing fails.

## Entity: ReleaseEvent
- Description: A successful website deployment event used as a gate for external publishing.
- Fields:
  - `releaseId` (string): Unique release identifier (for example GitHub `run_id`).
  - `commitSha` (string): Git revision associated with deployment.
  - `completedAt` (datetime): Time deployment completed.
  - `status` (enum): `success`, `failure`.
  - `environment` (string): Deployment target environment (for example `github-pages`).
- Validation rules:
  - Crossposting allowed only when `status=success`.
  - `releaseId` MUST be present for idempotency keying.
- State transitions:
  - `started` -> `success` or `failure`.

## Entity: PlatformTarget
- Description: Destination platform configuration for publication run.
- Fields:
  - `name` (enum): `medium`, `linkedin`.
  - `enabled` (boolean): Whether target is active for this run.
  - `mode` (enum): `longform`, `shortform_ai`.
  - `credentialRefs` (array[string]): Required secret/env variable names.
  - `limits` (object): Platform-specific constraints (for example char limits).
- Validation rules:
  - Target MUST be skipped when required credentials are missing.
  - `linkedin` target MUST use `shortform_ai` mode in this feature scope.

## Entity: GeneratedShortpost
- Description: AI-generated LinkedIn-ready promotional content.
- Fields:
  - `sourceArticleId` (string): Link to `ArticlePublicationCandidate.articleId`.
  - `text` (string): Generated short-form post body.
  - `provider` (string): AI generation provider identifier.
  - `model` (string): Model identifier used for generation.
  - `generatedAt` (datetime): Generation timestamp.
  - `truncated` (boolean): Whether output was truncated to platform limit.
- Validation rules:
  - `text` MUST be non-empty when LinkedIn publish is attempted.
  - `text` MUST satisfy LinkedIn character limit.
- State transitions:
  - `pending` -> `generated` or `failed`.

## Entity: PublicationAttempt
- Description: One execution attempt to publish one article to one platform for one release event.
- Fields:
  - `attemptId` (string): Unique ID for attempt record.
  - `releaseId` (string): Link to `ReleaseEvent.releaseId`.
  - `articleId` (string): Link to `ArticlePublicationCandidate.articleId`.
  - `platform` (string): Link to `PlatformTarget.name`.
  - `status` (enum): `success`, `failed`, `skipped`, `duplicate_blocked`.
  - `reason` (string, optional): Human-readable explanation for non-success states.
  - `externalPostId` (string, optional): Identifier returned by target platform.
  - `startedAt` (datetime): Attempt start time.
  - `completedAt` (datetime): Attempt completion time.
- Validation rules:
  - (`releaseId`, `articleId`, `platform`) triple MUST be unique for successful publish.
  - `externalPostId` required when `status=success`.

## Entity: PublicationLedger
- Description: Durable record of publication attempts used for idempotency and reporting.
- Fields:
  - `schemaVersion` (string): Ledger schema version.
  - `records` (array[PublicationAttempt]): Stored attempt records.
  - `lastUpdatedAt` (datetime): Last mutation timestamp.
- Validation rules:
  - Ledger MUST be readable and writable before publish execution.
  - Dedup check MUST occur before calling external publish API.
- State transitions:
  - `loaded` -> `updated` on successful write.
  - `loaded` -> `error` on corruption/write failure.

## Relationships
- `ReleaseEvent` 1 -> N `PublicationAttempt`
- `ArticlePublicationCandidate` 1 -> N `PublicationAttempt`
- `PlatformTarget` 1 -> N `PublicationAttempt`
- `ArticlePublicationCandidate` 0..1 -> 1 `GeneratedShortpost` (LinkedIn path only)
- `PublicationLedger` aggregates all `PublicationAttempt` records over time
