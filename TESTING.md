# Website Testing Protocol

This document defines the test checklist that **agents must run after every UI change**. Before marking any styling or layout todo as `done`, verify every item below.

---

## Pages to Test

Every check must be verified on **all** of the following URLs (run `npm run serve` and open in browser, or inspect the built HTML):

| Page | URL | Template |
|------|-----|----------|
| Homepage | `/` | `src/index.njk` |
| Blog listing | `/blog/` | `src/blog/index.njk` |
| Blog post | `/blog/typescript-tips-for-better-code/` | `src/_includes/post.njk` |
| Blog post (Mermaid) | `/blog/architecture-with-mermaid/` | `src/_includes/post.njk` |
| Talks listing | `/talks/` | `src/talks/index.njk` |
| Talk detail | `/talks/2024-10-building-internal-developer-platforms/` | `src/_includes/base.njk` |
| Trainings listing | `/trainings/` | `src/trainings/index.njk` |
| Training detail | `/trainings/platform-engineering-foundations/` | `src/_includes/base.njk` |
| About | `/about/` | `src/about/index.md` |
| Search | `/search/` | `src/search/index.njk` |
| Tags index | `/tags/` | `src/tags/index.njk` |
| Tag page | `/tags/typescript/` | `src/tags/tag.njk` |

---

## Checklist per Page

### ✅ Build
- [ ] `npm run build` exits with code 0, no errors or warnings
- [ ] Expected file exists in `_site/`

### ✅ Light Mode
- [ ] Page heading (h1) is dark/readable
- [ ] Body text is readable (not invisible or too low contrast)
- [ ] Cards/panels have visible background (white or light grey)
- [ ] Card borders are visible
- [ ] Links are violet/coloured, not default blue or invisible
- [ ] Nav bar is present and all links visible
- [ ] Footer is present and readable
- [ ] No unstyled / raw HTML visible

### ✅ Dark Mode
Toggle dark mode via the moon icon in the navbar, then verify:
- [ ] `<html>` element has `class="dark"` in DevTools
- [ ] Page background is dark (`bg-slate-900`)
- [ ] **Page heading (h1) is white/light** — most common failure point
- [ ] Body text is light (`text-slate-300` or similar), not invisible black-on-dark
- [ ] Cards/panels have dark background (`bg-slate-800`), not white
- [ ] Card borders are visible in dark (`border-slate-700`)
- [ ] Navbar and footer remain dark (they already are `bg-slate-900`)
- [ ] Reading progress bar gradient is visible
- [ ] Dark mode preference persists on page reload (`localStorage.theme === 'dark'`)

### ✅ Blog Post Specific
- [ ] Title appears **exactly once** (not duplicated from markdown h1 + layout h1)
- [ ] Code blocks are syntax-highlighted
- [ ] Copy-to-clipboard button appears on hover over code blocks
- [ ] Table of Contents appears in right sidebar on wide screens (≥1024px)
- [ ] ToC links are readable in both light and dark mode
- [ ] Related posts section shows ≤3 cards at the bottom
- [ ] Reading time is shown in the post header

### ✅ Mermaid Diagrams
On `/blog/architecture-with-mermaid/`:
- [ ] Mermaid code blocks render as SVG diagrams (not raw text)
- [ ] Diagrams are visible in both light and dark mode

### ✅ Search Page
- [ ] Pagefind UI search input is visible and styled
- [ ] In **dark mode**: input has dark background, light placeholder text
- [ ] In **dark mode**: result titles use violet/light colour (not invisible)
- [ ] In **dark mode**: result excerpts are readable (`text-slate-400`)
- [ ] Typing a query returns results

### ✅ Tag Pages
- [ ] `/tags/` lists all tags with correct post counts
- [ ] Each tag links to `/tags/<slug>/`
- [ ] Individual tag pages list correct posts
- [ ] All text readable in dark mode

### ✅ RSS Feed
- [ ] `/feed/feed.xml` returns valid XML
- [ ] Contains at least one `<entry>` per published blog post

### ✅ Responsive / Mobile
- [ ] Hamburger menu appears on narrow screens (<768px)
- [ ] Hamburger menu opens/closes correctly
- [ ] No horizontal scroll on any page at 375px width
- [ ] ToC sidebar is hidden on mobile (not broken layout)

---

## Agent Instructions

When an agent completes any task that touches templates or styles, it **must**:

1. Run `npm run build` — fix all errors before marking done
2. Grep for `text-slate-900` in modified files — every instance needs a `dark:text-white` or `dark:text-slate-100` counterpart
3. Grep for `bg-white` in modified files — every instance needs a `dark:bg-slate-800` counterpart
4. Grep for `border-slate-200` in modified files — every instance needs a `dark:border-slate-700` counterpart
5. Grep for `text-slate-600` or `text-slate-700` in modified files — needs `dark:text-slate-400` / `dark:text-slate-300`
6. Check the search page if base layout was modified
7. Report which pages from the checklist above were verified

### Quick grep commands to run after any template change:
```powershell
# Find text colors missing dark variants
Get-ChildItem src -Recurse -Include *.njk,*.md |
  Select-String "text-slate-[89]00|text-slate-700" |
  Where-Object { $_.Line -notmatch "dark:" }

# Find white backgrounds missing dark variants  
Get-ChildItem src -Recurse -Include *.njk,*.md |
  Select-String 'bg-white' |
  Where-Object { $_.Line -notmatch "dark:" }
```
