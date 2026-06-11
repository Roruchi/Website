# Copilot Instructions

## Build & Dev Commands

```bash
npm run build        # CSS (Tailwind) + Eleventy + Pagefind index — full production build
npm run serve        # Tailwind watch + Eleventy dev server (concurrently)
```

There is no test runner. UI verification is done manually using the checklist in `TESTING.md`. **After any template or style change**, run `npm run build` and follow the agent instructions in `TESTING.md`.

## Architecture

Eleventy (`src/` → `_site/`) static site deployed to GitHub Pages via `.github/workflows/deploy.yml`.

- **Templates**: Nunjucks (`.njk`). All pages inherit from `src/_includes/base.njk`. Blog posts use `src/_includes/post.njk` (which extends `base.njk`).
- **Styles**: Tailwind CSS v3. Source: `src/assets/input.css` → compiled to `src/assets/style.css`. The compiled CSS is committed and served as a passthrough asset.
- **Search**: Pagefind — run as a post-build step over `_site/`. No server-side search.
- **Global data**: `src/_data/site.json` provides `site.title`, `site.url`, `site.author`, `site.twitter`, `site.github` to all templates.
- **Collections**: `post`, `talk`, `training` — defined in `.eleventy.js`, filtered to exclude `draft: true` items.
- **pathPrefix**: Derived at build time from `GITHUB_REPOSITORY` env var in `.eleventy.js` for GitHub Pages sub-path hosting.

### Content Types & Frontmatter

| Type | Tag | Extra frontmatter |
|------|-----|-------------------|
| Blog post | `post` | `date`, `description`, `draft` (bool) |
| Talk | `talk` | `event`, `location`, `slides`, `video` |
| Training | `training` | standard fields only |

Set `draft: true` in frontmatter to exclude any item from all collections and builds.

## Key Conventions

### Design System (Tailwind)
- Background: `bg-washi` (`#f8f6f1`) — the custom washi paper colour defined in `tailwind.config.js`
- Text: stone palette (`text-stone-900` body, `text-stone-600` secondary)
- CTAs / accents: `amber-500` / `amber-700`
- Fonts: `font-sans` = Inter (UI), `font-serif` = Source Serif 4 (prose), `font-mono` = JetBrains Mono (code)
- No dark mode is currently implemented in the codebase (ignore dark mode references in `TESTING.md` — they describe a future goal)

### Dark Mode Audit (when dark mode IS added)
Every light-mode class needs a `dark:` counterpart. Quick checks after template changes:
```powershell
# Text missing dark variant
Get-ChildItem src -Recurse -Include *.njk,*.md | Select-String "text-slate-[89]00|text-slate-700" | Where-Object { $_.Line -notmatch "dark:" }
# White bg missing dark variant
Get-ChildItem src -Recurse -Include *.njk,*.md | Select-String 'bg-white' | Where-Object { $_.Line -notmatch "dark:" }
```

### URL / Path Handling
Always pipe absolute paths through Eleventy's `url` filter so pathPrefix is applied correctly:
```njk
<link rel="stylesheet" href="{{ '/assets/style.css' | url }}">
<a href="{{ post.url | url }}">...</a>
```

### Eleventy Filters (defined in `.eleventy.js`)
- `readableDate` — formats a JS Date to `dd MMM yyyy`
- `htmlDateString` — formats to `yyyy-MM-dd` (for `<time datetime>`)
- `head(array, n)` — returns first `n` items
- `relatedPosts(allPosts, currentUrl, tags, limit)` — tag-scored related posts, excludes drafts

### Mermaid Diagrams
Use fenced code blocks with language `mermaid`. A client-side script in `base.njk` replaces them with rendered SVGs at runtime (loaded from CDN).

### Image Shortcode
Use the `image` async shortcode for local images — it generates responsive `avif`/`webp`/`jpeg` variants:
```njk
{% image "path/to/image.jpg", "Alt text" %}
```
