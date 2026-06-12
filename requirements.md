# Requirements

This document defines the functional and non-functional requirements of the personal website. It is the source of truth for what the site must do and how well it must do it.

---

## Functional Requirements

### FR-1 — Blog

| ID | Requirement |
|---|---|
| FR-1.1 | The site **must** publish blog posts authored in Markdown with YAML front matter. |
| FR-1.2 | Each post **must** display: title, publication date, reading time estimate, tags, and prose content. |
| FR-1.3 | Posts with `status: draft` or legacy `draft: true` in front matter **must not** appear in any listing, feed, or search index. |
| FR-1.4 | The blog listing page (`/blog/`) **must** show all published posts, newest first. |
| FR-1.5 | Each post page **must** display a table of contents (ToC) sidebar derived from `h2` and `h3` headings, visible on screens ≥ 1024 px wide. |
| FR-1.6 | Each post page **must** show up to 3 related posts, selected by shared tags. |
| FR-1.7 | Code blocks **must** be syntax-highlighted server-side. |
| FR-1.8 | A copy-to-clipboard button **must** appear on hover over code blocks. |
| FR-1.9 | Mermaid code blocks (` ```mermaid `) **must** render as SVG diagrams client-side. |
| FR-1.10 | Each post **must** support a featured image (`image` field) used in Open Graph and Twitter Card meta tags. |
| FR-1.11 | A blog post tagged `crosspost-medium` **must** be eligible for manual Medium draft creation through the crosspost script, unless `originalUrl` is already present. |
| FR-1.12 | Content authors **must** be able to scaffold a new article from a single local command that captures title, slug, description, pillar/tags, and draft/published status. |
| FR-1.13 | The scaffolded article **must** be created in `src/blog/` with valid front matter and a sensible starting template that does not duplicate the rendered page title. |

### FR-2 — Talks

| ID | Requirement |
|---|---|
| FR-2.1 | Talk Markdown **must** live outside Eleventy's public input and default to `visibility: private` and `showcase: false`. |
| FR-2.2 | The talks listing page (`/talks/`) **must** display only talks with `visibility: public` and `showcase: true`. |
| FR-2.3 | Individual public talk pages **must** use sanitized metadata and must not expose notes or Markdown working material. |
| FR-2.4 | Private or unshowcased talks **must not** appear in public pages, feeds, search indexes, or generated public data. |
| FR-2.5 | Speaking opportunities and submissions **must** remain private and outside the Eleventy build. |
| FR-2.6 | A submission **must** link one existing talk to one existing opportunity by slug, while allowing both talks and opportunities to have multiple submissions. |
| FR-2.7 | Submission notes, rejected outcomes, and CFP working material **must not** enter public output. |
| FR-2.8 | Public opportunity discovery **must** be preview-only by default and require an explicit write flag before creating Markdown files. |
| FR-2.9 | Opportunity discovery **must not** log in, scrape private pages, overwrite existing opportunities, or automate submissions. |
| FR-2.10 | The local calendar export **must** include opportunity CFP deadlines and event dates while remaining outside the public build. |

### FR-3 — Trainings

| ID | Requirement |
|---|---|
| FR-3.1 | The site **must** publish training/workshop pages authored in Markdown. |
| FR-3.2 | The trainings listing page (`/trainings/`) **must** display all published trainings. |
| FR-3.3 | Individual training pages **must** display: title, description, target audience, and duration. |
| FR-3.4 | Trainings with `draft: true` **must not** appear in any listing. |

### FR-4 — About Page

| ID | Requirement |
|---|---|
| FR-4.1 | The site **must** include a personal About page (`/about/`) with a bio, skills, technologies, and contact links. |

### FR-5 — Search

| ID | Requirement |
|---|---|
| FR-5.1 | The site **must** provide a full-text search page (`/search/`) that searches across all published blog posts, talks, and trainings. |
| FR-5.2 | The search index **must** be generated at build time (static; no server-side search). |
| FR-5.3 | The search input and results **must** be styled to match the site design system. |

### FR-6 — Tags

| ID | Requirement |
|---|---|
| FR-6.1 | The site **must** provide a tags index page (`/tags/`) listing all tags used across blog posts, with post counts. |
| FR-6.2 | Each tag **must** have a dedicated page (`/tags/<slug>/`) listing all posts with that tag. |

### FR-7 — RSS / Atom Feed

| ID | Requirement |
|---|---|
| FR-7.1 | The site **must** provide an Atom-compatible RSS feed at `/feed/feed.xml`. |
| FR-7.2 | The feed **must** contain an entry for every published blog post, including title, date, description, and full content. |
| FR-7.3 | The feed URL **must** be advertised via a `<link rel="alternate">` tag in the `<head>` of every page. |

### FR-8 — Sitemap

| ID | Requirement |
|---|---|
| FR-8.1 | The site **must** generate an XML sitemap at `/sitemap.xml` listing all published pages. |

### FR-9 — Navigation

| ID | Requirement |
|---|---|
| FR-9.1 | Every page **must** include a persistent top navigation bar with links to: Blog, Talks, Trainings, About, Search, and GitHub. |
| FR-9.2 | On screens narrower than 768 px, the navigation **must** collapse to a hamburger menu. |
| FR-9.3 | The hamburger menu **must** open and close correctly on tap/click. |
| FR-9.4 | Every page **must** include a footer with navigation links and social links (GitHub, Twitter/X, RSS). |

### FR-10 — Homepage

| ID | Requirement |
|---|---|
| FR-10.1 | The homepage **must** display a hero section with the site owner's name, tagline, and CTAs to Blog and Talks pages. |
| FR-10.2 | The homepage **must** display summary statistics: number of blog posts, talks, workshops, and years of experience. |
| FR-10.3 | The homepage **must** show the 3 most recent blog posts. |
| FR-10.4 | The homepage **must** include the interactive koi pond canvas animation. |

### FR-11 — SEO & Social Sharing

| ID | Requirement |
|---|---|
| FR-11.1 | Every page **must** include `<meta name="description">`, Open Graph tags (`og:title`, `og:description`, `og:image`, `og:url`), and Twitter Card tags. |
| FR-11.2 | Open Graph and Twitter Card images **must** default to a standard OG image when no post-specific image is provided. |

### FR-12 — Responsive Images

| ID | Requirement |
|---|---|
| FR-12.1 | Images included via the `{% image %}` shortcode **must** be processed at build time and output in AVIF, WebP, and JPEG formats at multiple widths (400 px, 800 px, 1200 px). |
| FR-12.2 | All processed images **must** have `loading="lazy"` and `decoding="async"` attributes. |

---

## Non-Functional Requirements

### NFR-1 — Performance

| ID | Requirement |
|---|---|
| NFR-1.1 | The site **must** be fully static (no server-side rendering at request time). |
| NFR-1.2 | CSS **must** be minified and contain only the utility classes used in source files (Tailwind purge). |
| NFR-1.3 | Images **must** be served in next-generation formats (AVIF, WebP) with JPEG fallback. |
| NFR-1.4 | All JavaScript **must** be deferred or loaded at the bottom of the `<body>` to avoid blocking page render. |

### NFR-2 — Accessibility

| ID | Requirement |
|---|---|
| NFR-2.1 | All navigation links and interactive elements **must** have discernible accessible labels. |
| NFR-2.2 | Images **must** have meaningful `alt` text. |
| NFR-2.3 | The reading progress bar and mobile menu toggle **must** have `aria-label` attributes. |
| NFR-2.4 | The page **must** use semantic HTML (`<header>`, `<main>`, `<footer>`, `<nav>`, `<article>`, `<time>`). |

### NFR-3 — Responsiveness

| ID | Requirement |
|---|---|
| NFR-3.1 | All pages **must** render without horizontal scroll at 375 px viewport width. |
| NFR-3.2 | The ToC sidebar **must** be hidden on screens narrower than 1024 px. |
| NFR-3.3 | Card grids **must** stack to a single column on mobile. |

### NFR-4 — Design System Compliance

| ID | Requirement |
|---|---|
| NFR-4.1 | All pages **must** use the Zen Garden / Washi Paper design system: `#f8f6f1` background, `stone` palette for text, `amber` for CTAs and accents. |
| NFR-4.2 | UI text **must** use the Inter font family. |
| NFR-4.3 | Prose content **must** use the Source Serif 4 font family. |
| NFR-4.4 | Code **must** use the JetBrains Mono font family. |
| NFR-4.5 | The site **must not** implement a dark mode. |

### NFR-5 — Build & CI

| ID | Requirement |
|---|---|
| NFR-5.1 | `npm run build` **must** exit with code 0 with no errors. |
| NFR-5.2 | The build **must** complete successfully in the GitHub Actions CI environment on every push to `main`. |
| NFR-5.3 | All absolute URL paths in templates **must** pass through the Eleventy `url` filter to support GitHub Pages sub-path deployment. |
| NFR-5.4 | The manual crosspost script **must** tolerate partial platform failures and **must not** block unrelated platform attempts. |
| NFR-5.5 | Pull requests **must** run the same publishing QA command used locally so content validation and builds stay aligned across local and CI environments. |

### NFR-6 — Content Authoring

| ID | Requirement |
|---|---|
| NFR-6.1 | Content authors **must** be able to scaffold articles, talks, speaking opportunities, and submissions with local commands. |
| NFR-6.2 | Draft articles and all private or unshowcased talks **must** reliably stay out of public-facing pages, feeds, search indexes, and generated public data. |
| NFR-6.3 | Content authors **must** be able to opt a post into Medium draft creation by adding a tag only; the final Medium publish action **must** remain manual. |
| NFR-6.4 | Blog content changes **must** be validated locally and in CI for required front matter, slug validity and uniqueness, valid dates, taxonomy compliance, internal links, preview descriptions, and successful builds. |
| NFR-6.5 | Markdown article content **must not** use em dashes. |
| NFR-6.6 | The publishing gate **must** build the site and scan generated output for private talk, opportunity, and submission values. |
| NFR-6.7 | A read-only content dashboard containing private data **must** be generated outside `_site` and excluded from version control. |
| NFR-6.10 | The development server **may** expose the read-only dashboard at `/dashboard/`, but production builds **must not** load its private data, show its navigation link, or generate the route. |
| NFR-6.8 | Discovery sources **must** be explicitly configured as public JSON, RSS, or Atom inputs with simple mappings and defaults. |
| NFR-6.9 | Generated calendar files **must** be written to a gitignored local directory. |

---

## Updating This Document

This document must be kept up to date. Update `requirements.md` whenever you:

- Add, change, or remove a user-visible feature or page
- Change the behavior of the draft system, collections, or navigation
- Add or change SEO, accessibility, or responsive design requirements
- Change the design system tokens or typography rules

See also: [architecture.md](./architecture.md) for the technical architecture that implements these requirements.
