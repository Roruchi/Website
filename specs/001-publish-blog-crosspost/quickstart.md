# Quickstart: Post-Publish Blog Crossposting

## 1. Preconditions
- Node.js dependencies installed: `npm ci`
- Site builds successfully: `npm run build`
- A blog markdown source exists under `src/blog/`
- Target article frontmatter includes `draft: false`

## 2. Configure Secrets For CI
Add repository secrets in GitHub:
- `MEDIUM_TOKEN`
- `LINKEDIN_ACCESS_TOKEN`
- `AI_PROVIDER_API_KEY`

Notes:
- LinkedIn safe mode is enabled by default and does not require live LinkedIn/AI calls.
- Keep credentials in GitHub Actions secrets only. Do not print tokens in script logs.

## 3. Wire Post-Deploy Step
In `.github/workflows/deploy.yml`, add a step after deploy success to execute crosspost CLI.

Expected invocation shape:
```bash
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id "$GITHUB_RUN_ID"
```

Current workflow implementation uses:
- `CROSSPOST_POST_DEPLOY=true`
- `MEDIUM_TOKEN`, `LINKEDIN_ACCESS_TOKEN`, `AI_PROVIDER_API_KEY`

## 4. Local Dry-Run Validation
Run crosspost in dry-run mode to validate parsing, draft gating, and summary output without external posting:

```bash
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-dry-run --dry-run
```

Expected outcomes:
- Draft posts are skipped.
- Non-draft posts are marked as publish candidates.
- A run summary is printed with per-platform statuses.
- LinkedIn shortpost generation runs in deterministic mode and returns a valid short-form payload.

## 5. Recovery / Manual Re-Run
After a successful website publish, manually re-run crosspost command with the same release ID to confirm dedup behavior or with a new release ID for replay scenarios.

Verification expectations:
- Existing successful `releaseId + articleId + platform` entries are blocked as duplicates.
- Failed targets can be retried with clear summary output.

Manual non-dry-run override for local verification:

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-manual-run
```

LinkedIn generation-failure isolation check (LinkedIn-only skip, Medium continues):

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'
$env:CROSSPOST_LINKEDIN_SAFE_MODE='false'
$env:MEDIUM_TOKEN='dummy-token'
Remove-Item Env:AI_PROVIDER_API_KEY -ErrorAction SilentlyContinue
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-linkedin-gen-fail
```

Expected result:
- Medium statuses remain `success`.
- LinkedIn statuses become `skipped` with reason `linkedin_shortpost_generation_failed:missing_ai_provider_api_key`.
- Overall run remains non-blocked for other targets.

## 6. Verification Checklist
- Build gate passes: `npm run build`
- Deployment completes on GitHub Pages
- Crosspost step runs only post-deploy success
- `draft: true` posts are not externally published
- Medium receives long-form content
- LinkedIn receives generated shortpost (safe-mode deterministic by default)
- Final run summary includes success/failure/skipped reasons

## 7. Verification Evidence (2026-03-23)

### Module load checks
Command:

```bash
node -e "const mods=['./scripts/crosspost/index.js','./scripts/crosspost/publish.js','./scripts/crosspost/extract-article.js','./scripts/crosspost/ledger.js','./scripts/crosspost/summary.js','./scripts/crosspost/platform-targets.js','./scripts/crosspost/medium-publisher.js','./scripts/crosspost/linkedin-shortpost.js','./scripts/crosspost/linkedin-publisher.js']; for (const m of mods) { require(m); console.log('loaded', m); }"
```

Outcome: all modules loaded successfully.

### Dry-run medium + linkedin
Command:

```bash
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-dry-run-20260323 --dry-run
```

Outcome:
- `overallStatus=success`
- `articlesEvaluated=4`
- `articlesEligible=4`
- `succeeded=8`, `failed=0`, `skipped=0`, `duplicateBlocked=0`

### LinkedIn generation failure isolation
Command:

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'; $env:CROSSPOST_LINKEDIN_SAFE_MODE='false'; $env:MEDIUM_TOKEN='dummy-token'; Remove-Item Env:AI_PROVIDER_API_KEY -ErrorAction SilentlyContinue; node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-linkedin-gen-fail-20260323
```

Outcome:
- `overallStatus=success`
- `succeeded=4` (Medium)
- `skipped=4` (LinkedIn generation failures)
- LinkedIn reasons: `linkedin_shortpost_generation_failed:missing_ai_provider_api_key`

### Rerun duplicate handling
Command (same as above, same release ID):

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'; $env:CROSSPOST_LINKEDIN_SAFE_MODE='false'; $env:MEDIUM_TOKEN='dummy-token'; Remove-Item Env:AI_PROVIDER_API_KEY -ErrorAction SilentlyContinue; node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-linkedin-gen-fail-20260323
```

Outcome:
- `duplicateBlocked=4` (Medium prior successes)
- `skipped=4` (LinkedIn generation failures, unchanged)

### Build gate and artifacts
Command:

```bash
npm run build
```

Outcome:
- Build completed successfully (Tailwind + Eleventy + Pagefind)
- Pagefind indexed 25 pages / 980 words
- Expected files present:
  - `_site/index.html`
  - `_site/blog/index.html`
  - `_site/blog/typescript-tips-for-better-code/index.html`
  - `_site/search/index.html`
  - `_site/feed/feed.xml`

### TESTING.md outcomes (crosspost-scope)
- `npm run build` check: PASS
- Expected built-file checks: PASS
- Template/style visual checklist: not executed because no template/style files changed in this feature slice.

## 8. Path Prefix And Template Impact
- Path-prefix safety impact: no change.
- No Eleventy templates were modified for this feature.
- No URL filter (`| url`) behavior changed.

## 9. Pagefind Continuity And Performance Notes
- Pagefind continuity: PASS (`_site/pagefind/pagefind.js`, `_site/pagefind/pagefind-entry.json`, `_site/pagefind/wasm.en.pagefind` exist after build).
- Client-side site performance impact: none expected from crosspost scripts because they run in CI/CLI only and are not bundled into site pages.
- Build-time impact: no material slowdown observed beyond normal Tailwind/Eleventy/Pagefind run.

## 10. Artifacts
- Ledger file: `.github/crosspost-ledger.json`
- Feature spec docs:
  - `specs/001-publish-blog-crosspost/spec.md`
  - `specs/001-publish-blog-crosspost/plan.md`
  - `specs/001-publish-blog-crosspost/research.md`
  - `specs/001-publish-blog-crosspost/data-model.md`
  - `specs/001-publish-blog-crosspost/contracts/crosspost-workflow-contract.md`
