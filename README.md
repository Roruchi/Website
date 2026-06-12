# Personal Website

Static Eleventy site for [roelvanbergen.nl](https://roelvanbergen.nl).

## Content Workflow

Markdown is the source of truth:

- Articles: `src/blog/*.md`
- Talks: `content/talks/*.md`
- Speaking opportunities: `content/opportunities/*.md`
- Submissions: `content/submissions/*.md`

Talks and opportunities live outside Eleventy's `src/` directory so private working material cannot be copied into the public site by default.

### Create an article

```bash
npm run new:article
```

Or provide values non-interactively:

```bash
npm run new:article -- --title "A Practical Note on Calm Systems" --slug "a-practical-note-on-calm-systems" --description "How slower feedback loops help teams make better engineering decisions." --pillar engineering --tags ai,software-engineering --status draft
```

New articles use `status: draft` or `status: published`. Imported legacy posts using `draft: true` or `draft: false` remain supported.

### Create a talk

```bash
npm run new:talk
```

Or:

```bash
npm run new:talk -- --title "The Agentic Engineer" --slug "the-agentic-engineer"
```

Every new talk starts with:

```yaml
status: draft
visibility: private
showcase: false
```

To publish a curated talk, complete its public metadata and set both:

```yaml
visibility: public
showcase: true
```

Both flags are required. The public loader exports only `title`, `slug`, `description`, `status`, `audience`, `takeaways`, `relatedArticles`, `slides`, and `recording`. It never exports private notes or the Markdown body.

### Track a speaking opportunity

```bash
npm run new:opportunity
```

Opportunities are stored in `content/opportunities/`, which is never read by Eleventy. Use these files for event and CFP facts such as URLs, deadlines, dates, format, topics, and private research notes.

### Track a submission

Create an opportunity and talk first, then link them:

```bash
npm run new:submission -- --talk the-agentic-engineer --opportunity example-conf-2026
```

Submissions are stored in `content/submissions/`. A submission owns the status, submission and decision dates, abstract version, and submission-specific notes. A talk and an opportunity can each have any number of submissions.

All submissions must keep:

```yaml
public: false
```

The workflow does not scrape platforms or submit CFPs.

## Discover Public Opportunities

Public discovery sources are configured in:

```text
content/discovery-sources.json
```

Discovery is preview-only by default:

```bash
npm run speaker:discover
```

After reviewing the preview, explicitly create new opportunity Markdown files:

```bash
npm run speaker:discover -- --write
```

The importer:

- Reads public JSON, RSS, or Atom URLs
- Also accepts repository-relative files for testing or downloaded public feeds
- Skips disabled sources
- Skips existing matches by slug, event URL, or CFP URL
- Never overwrites an existing opportunity
- Creates only `status: interesting` opportunity files
- Adds the source name and discovery date for review
- Does not log in, scrape private pages, or submit CFPs

Example JSON source:

```json
{
  "sources": [
    {
      "name": "Example public CFP feed",
      "enabled": true,
      "type": "json",
      "url": "https://example.com/public-events.json",
      "itemsPath": "events",
      "fields": {
        "name": "title",
        "url": "website",
        "cfpUrl": "callForPapers.url",
        "location": "venue.city",
        "format": "format",
        "deadline": "callForPapers.closesAt",
        "eventDate": "startsAt",
        "topics": "topics"
      },
      "defaults": {
        "platform": "other"
      }
    }
  ]
}
```

Field paths use dot notation. Optional `defaults` fill values that are constant for a source. RSS and Atom sources use the feed title and link, with optional defaults for `platform`, `format`, `location`, `deadline`, `eventDate`, and `topics`.

## Export The Speaking Calendar

Generate an iCalendar file from opportunity deadlines and event dates:

```bash
npm run speaker:calendar
```

The generated file is:

```text
.speaker-calendar/speaking-opportunities.ics
```

Each opportunity can produce:

- `CFP deadline: <name>` from `deadline`
- `Event: <name>` from `eventDate`

Ignored opportunities are skipped. The output directory is gitignored and never enters the website build. Import the `.ics` file into a calendar application or rerun the command whenever opportunity Markdown changes.

## Links Between Content

Articles reference talks with `relatedTalks`; talks reference articles with `relatedArticles`. Both fields contain YAML lists of slugs:

```yaml
relatedTalks:
  - the-agentic-engineer
```

Validation requires referenced slugs to exist. Published article pages omit private or unshowcased talks, so a private relationship cannot reveal the talk publicly.

## Validation And Publishing

Run content checks without building:

```bash
npm run check:content
```

The validator checks required fields, statuses, dates, slug format and uniqueness, article/talk references, submission talk/opportunity references, public talk metadata, internal article links, image text coverage, and public em dashes. Imported Medium articles report existing em dashes as warnings so legacy imports do not block unrelated work.

Run the complete publishing gate:

```bash
npm run publish:check
```

This runs content validation, the production build, and a built-output privacy scan. The privacy scan checks generated HTML, XML, and JSON for private talk, opportunity, and submission values. CI runs the same command through `npm run qa:publish`.

## Local Dashboard

Start the local site:

```bash
npm run serve
```

Then open:

```text
http://localhost:8080/dashboard/
```

The local navigation includes a Dashboard link while this server is running. The read-only page shows article and talk status counts, opportunities by status and deadline, submissions grouped by talk and opportunity, accepted or delivered submissions, validation errors, and warnings.

`npm run serve` sets `LOCAL_DASHBOARD=true` only for the local Eleventy process. Normal production builds do not load private dashboard data, do not show the menu item, and do not generate `/dashboard/`.

To generate a standalone local snapshot instead:

```bash
npm run dashboard:content
```

This writes `.content-dashboard/index.html`, which is gitignored and outside `_site`.

## Public Versus Private

- Published articles are public.
- Draft articles are excluded from public collections, feeds, and search.
- Talks are private unless both public flags are explicitly enabled.
- Talk notes and Markdown bodies are always private, including for showcased talks.
- Speaking opportunities and submissions are always private.
- The public talks listing and detail pages use only sanitized talk data.
- The `/dashboard/` route and navigation item exist only under `npm run serve`.
- `npm run publish:check` verifies the generated output against private values.

## Discovery Later

Future source adapters can cover public Sessionize event APIs, Meetup feeds, conference-specific APIs, or other structured public sources. They should keep the same preview-first behavior and never automate submissions.
