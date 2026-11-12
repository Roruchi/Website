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
- [ ] Links match the [design system](./architecture.md#design-system) and are readable
- [ ] Nav bar is present and all links visible
- [ ] Footer is present and readable
- [ ] No unstyled / raw HTML visible

The supported appearance is defined by the [design system](./architecture.md#design-system).

### ✅ Blog Post Specific
- [ ] Title appears **exactly once** (not duplicated from markdown h1 + layout h1)
- [ ] Code blocks are syntax-highlighted
- [ ] Copy-to-clipboard button appears on hover over code blocks
- [ ] Table of Contents appears in right sidebar on wide screens (≥1024px)
- [ ] ToC links are readable
- [ ] Related posts section shows ≤3 cards at the bottom
- [ ] Reading time is shown in the post header

### ✅ Mermaid Diagrams
On `/blog/architecture-with-mermaid/`:
- [ ] Mermaid code blocks render as SVG diagrams (not raw text)
- [ ] Diagrams are visible against the page background

### ✅ Search Page
- [ ] Pagefind UI search input is visible and styled
- [ ] Input, placeholder text, result titles, and excerpts are readable
- [ ] Typing a query returns results

### ✅ Tag Pages
- [ ] `/tags/` lists all tags with correct post counts
- [ ] Each tag links to `/tags/<slug>/`
- [ ] Individual tag pages list correct posts
- [ ] All text is readable

### ✅ RSS Feed
- [ ] `/feed/feed.xml` returns valid XML
- [ ] Contains at least one `<entry>` per published blog post

### ✅ Responsive / Mobile
- [ ] Hamburger menu appears on narrow screens (<768px)
- [ ] Hamburger menu opens/closes correctly
- [ ] Menu button's `aria-controls` identifies the mobile menu and `aria-expanded` matches its state
- [ ] No horizontal scroll on any page at 375px width
- [ ] At 390 × 844, navigation, focus indicators, contrast, and search remain usable
- [ ] ToC sidebar is hidden on mobile (not broken layout)

### ✅ Keyboard Navigation
- [ ] The first Tab reveals the skip-to-content link
- [ ] Activating the skip link moves focus to the main content
- [ ] Navigation, menu button, and search work with the keyboard and show visible focus

### ✅ Homepage Motion
- [ ] Reduced motion shows a still pond without continuously scheduling animation frames
- [ ] Animation pauses when the pond is offscreen or the document is hidden
- [ ] Animation resumes only when visible and reduced motion is disabled, including after preference changes
- [ ] Mouse and touch feeding still work

---

## Agent Instructions

### Documentation Maintenance

Every contributor and agent **must** keep the following documentation files up to date:

- **[architecture.md](./architecture.md)** — Update when you add/remove/upgrade a dependency or plugin, change the build pipeline or deployment workflow, add a new content type or Eleventy collection, change the source directory structure, or change a design system token.
- **[requirements.md](./requirements.md)** — Update when you add, change, or remove a user-visible feature or page, change the draft system or navigation behaviour, add/change SEO or accessibility requirements, or change the design system rules.

These documents are the canonical reference for the project's architecture and requirements. Failing to keep them current leaves future contributors and agents without accurate context.

### UI/Style Changes

When an agent completes any task that touches templates or styles, it **must**:

1. Run `npm run build` — fix all errors before marking done
2. Check modified styles against the [design system](./architecture.md#design-system)
3. Check the search page if base layout was modified
4. Report which pages from the checklist above were verified
