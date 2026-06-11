# Contract: Crosspost Workflow And CLI Interface

## Purpose
Define the integration contract between GitHub Actions deployment workflow and the crosspost orchestration script.

## Workflow Invocation Contract
- Trigger point: Post-deploy step in `.github/workflows/deploy.yml` after successful `actions/deploy-pages@v4`.
- Invocation command shape:
  - `node scripts/crosspost/publish.js --source <path-or-glob> --platform medium --platform linkedin --release-id <id> [--dry-run]`

## Required Inputs
- Command/flags:
  - `--source` (string): Source markdown path or glob, default `src/blog/*.md`.
  - `--platform` (repeatable string): One or more platform names (`medium`, `linkedin`).
  - `--release-id` (string): Release identifier, typically GitHub run ID.
  - `--dry-run` (boolean, optional): Disable external API calls while preserving validation/report behavior.
- Environment variables:
  - `CROSSPOST_POST_DEPLOY=true` in CI for non-dry-run execution gate.
  - `CROSSPOST_ALLOW_MANUAL=true` for local/manual non-dry-run override.
  - `MEDIUM_TOKEN` (required for non-dry-run Medium publishing)
  - `CROSSPOST_LINKEDIN_SAFE_MODE` (optional, default enabled)
  - `LINKEDIN_ACCESS_TOKEN` (required only when safe mode is disabled and live publish path is implemented)
  - `AI_PROVIDER_API_KEY` (required only when safe mode is disabled and live generation is attempted)
  - `GITHUB_RUN_ID` (recommended fallback for release ID)

## Eligibility Rules Contract
- Only process posts where frontmatter `draft` is absent or evaluates to `false`.
- Crossposting MUST execute only when deployment status is successful.
- Missing/invalid frontmatter MUST mark article as skipped with explicit reason.

## Idempotency Contract
- Deduplication key: `releaseId + articleId + platform`.
- If dedup key already exists with success status in ledger, publish call MUST be skipped and status set to `duplicate_blocked`.
- Ledger location: `.github/crosspost-ledger.json`.

## Platform Behavior Contract
- Medium:
  - Input: article title + full markdown-derived content.
  - Output: external post ID or failure reason.
- LinkedIn:
  - Input: shortpost generated from article content before publish attempt.
  - Length rule: generated text is constrained to `<= 3000` chars with deterministic truncation.
  - Safe mode default: deterministic local generation and simulated publish to avoid unsafe live posting.
  - Output: external post ID or failure/skip reason.
  - Failure to generate shortpost MUST produce `status=skipped` for LinkedIn only and MUST NOT fail unrelated targets.
  - When safe mode is disabled without AI credential support, reason MUST be `linkedin_shortpost_generation_failed:<message>`.

## Output Contract
Script MUST emit a machine-readable summary JSON to stdout at end of run.

### Summary Schema
```json
{
  "releaseId": "string",
  "overallStatus": "success|partial_success|failed|no_eligible_posts",
  "startedAt": "ISO-8601",
  "completedAt": "ISO-8601",
  "totals": {
    "articlesEvaluated": 0,
    "articlesEligible": 0,
    "attempted": 0,
    "succeeded": 0,
    "failed": 0,
    "skipped": 0,
    "duplicateBlocked": 0
  },
  "results": [
    {
      "articleId": "string",
      "platform": "medium|linkedin",
      "status": "success|failed|skipped|duplicate_blocked",
      "externalPostId": "string|null",
      "reason": "string|null"
    }
  ]
}
```

## Exit Code Contract
- `0`: At least one target succeeded, or dry-run completed successfully.
- `1`: No targets succeeded due to operational failure, or workflow preconditions not met.

## Logging Contract
- MUST log per-target outcomes and final run summary.
- MUST NOT log secrets, auth tokens, or raw credential-bearing payloads.

## Error Handling Contract
- Platform failures MUST NOT abort other enabled targets.
- Transient API errors SHOULD use bounded retry policy.
- Ledger read/write failure MUST fail run with explicit error message.

## Deterministic Safe Mode Contract
- LinkedIn safe mode is enabled unless `CROSSPOST_LINKEDIN_SAFE_MODE=false`.
- Safe mode behavior:
  - Uses deterministic shortpost templating.
  - Uses simulated LinkedIn publish response with non-secret synthetic post IDs.
  - Avoids any outbound LinkedIn or AI-provider calls.
- This mode is acceptable for CI validation and local verification when live posting is not configured.
