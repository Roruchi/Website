# Quickstart: Manual Blog Crossposting

## 1. Preconditions
- Node.js dependencies installed: `npm ci`
- Site builds successfully: `npm run build`
- A blog markdown source exists under `src/blog/`
- Target article frontmatter includes `draft: false`
- Target article includes tag `crosspost-medium` if it should be drafted on Medium
- For local Medium runs, save auth once with `npm run crosspost:medium:auth`

## 2. Configure Local Environment
Set these locally before a non-dry-run:
- `MEDIUM_STORAGE_STATE_PATH` or `MEDIUM_STORAGE_STATE`
- `LINKEDIN_ACCESS_TOKEN`
- `AI_PROVIDER_API_KEY`
- `CROSSPOST_ALLOW_MANUAL=true`

Notes:
- `MEDIUM_STORAGE_STATE` should contain a Playwright `storageState` JSON blob for a logged-in Medium session, or you can point `MEDIUM_STORAGE_STATE_PATH` to the saved file.
- LinkedIn safe mode is enabled by default and does not require live LinkedIn/AI calls.
- Keep credentials out of the repository and do not print them in script logs.

## 3. Manual Run
Run the script yourself after the article is live on the website.

Example:
```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'
$env:MEDIUM_STORAGE_STATE_PATH='.playwright/medium-auth.json'
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-manual-run
```

## 4. Local Dry-Run Validation
Run crosspost in dry-run mode to validate parsing, draft gating, and summary output without external posting:

```bash
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-dry-run --dry-run
```

Expected outcomes:
- Draft posts are skipped.
- Posts with `originalUrl` are skipped for Medium.
- Posts tagged `crosspost-medium` and missing `originalUrl` are marked as Medium draft candidates.
- A run summary is printed with per-platform statuses.
- LinkedIn shortpost generation runs in deterministic mode and returns a valid short-form payload.

## 5. Medium Auth Bootstrap
Create a local Playwright auth file for Medium:

```powershell
npm run crosspost:medium:auth
```

Default output path:
- `.playwright/medium-auth.json`

## 6. Recovery / Manual Re-Run
After the website publish is live, manually re-run the crosspost command to confirm dedup behavior or to retry failed targets.

Verification expectations:
- Existing `success` or `prepared` records for the same `articleId + platform` are blocked as duplicates.
- Failed targets can be retried with clear summary output.

Manual non-dry-run override for local verification:

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'
$env:MEDIUM_STORAGE_STATE_PATH='.playwright/medium-auth.json'
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-manual-run
```

LinkedIn generation-failure isolation check (LinkedIn-only skip, Medium continues):

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'
$env:CROSSPOST_LINKEDIN_SAFE_MODE='false'
$env:MEDIUM_STORAGE_STATE='{}'
Remove-Item Env:AI_PROVIDER_API_KEY -ErrorAction SilentlyContinue
node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-linkedin-gen-fail
```

Expected result:
- Medium statuses remain `prepared` or `skipped`, depending on article eligibility.
- LinkedIn statuses become `skipped` with reason `linkedin_shortpost_generation_failed:missing_ai_provider_api_key`.
- Overall run remains non-blocked for other targets.

## 7. Verification Checklist
- Build gate passes: `npm run build`
- Website publish completes before you run crosspost
- Crosspost runs only when invoked manually
- `draft: true` posts are not externally published
- Medium drafts are created only for posts tagged for Medium and missing `originalUrl`
- Final Medium publish is still performed manually in Medium
- LinkedIn receives generated shortpost (safe-mode deterministic by default)
- Final run summary includes success/failure/skipped reasons

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
$env:CROSSPOST_ALLOW_MANUAL='true'; $env:CROSSPOST_LINKEDIN_SAFE_MODE='false'; $env:MEDIUM_STORAGE_STATE='{}'; Remove-Item Env:AI_PROVIDER_API_KEY -ErrorAction SilentlyContinue; node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-linkedin-gen-fail-20260323
```

Outcome:
- `overallStatus=success`
- `prepared=0` or higher for Medium-eligible drafts
- `skipped=4` (LinkedIn generation failures)
- LinkedIn reasons: `linkedin_shortpost_generation_failed:missing_ai_provider_api_key`

### Rerun duplicate handling
Command (same as above, same release ID):

```powershell
$env:CROSSPOST_ALLOW_MANUAL='true'; $env:CROSSPOST_LINKEDIN_SAFE_MODE='false'; $env:MEDIUM_STORAGE_STATE='{}'; Remove-Item Env:AI_PROVIDER_API_KEY -ErrorAction SilentlyContinue; node scripts/crosspost/publish.js --source "src/blog/*.md" --platform medium --platform linkedin --release-id local-linkedin-gen-fail-20260323
```

Outcome:
- `duplicateBlocked` increases when the same article/platform was already prepared or published
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
