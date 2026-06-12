const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const {
  OPPORTUNITY_ROOT,
  SUBMISSION_ROOT,
  TALK_ROOT,
  ensureDirectory,
  loadOpportunities,
  loadSubmissions,
  loadTalks,
  slugify,
} = require("./content-store");
const { parseCliArgs } = require("./content-workflow");

function quote(value) {
  return `"${String(value || "").replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

async function promptForTitleAndSlug(type, args) {
  const values = {
    title: args.title || args.name || "",
    slug: args.slug || "",
  };

  if (!process.stdin.isTTY) {
    return values;
  }

  const rl = readline.createInterface({ input, output });
  try {
    if (!values.title) {
      values.title = (await rl.question(`${type === "opportunity" ? "Name" : "Title"}: `)).trim();
    }
    if (!values.slug) {
      const suggested = slugify(values.title);
      values.slug = (await rl.question(`Slug [${suggested}]: `)).trim() || suggested;
    }
  } finally {
    rl.close();
  }

  return values;
}

function talkTemplate(title, slug) {
  return `---
title: ${quote(title)}
slug: ${quote(slug)}
description: ""
status: draft
visibility: private
showcase: false
audience: ""
takeaways: []
relatedArticles: []
slides: ""
recording: ""
notes: ""
---

## Working abstract

Write the talk idea in your own words.

## Development notes

Keep rough material here. Markdown body content is never included in public talk data.
`;
}

function opportunityTemplate(name, slug) {
  return `---
name: ${quote(name)}
slug: ${quote(slug)}
url: ""
cfpUrl: ""
platform: manual
location: ""
format: in-person
deadline: ""
eventDate: ""
status: interesting
topics: []
notes: ""
---

Add private event or CFP research here.
`;
}

function submissionTemplate(slug, talk, opportunity) {
  return `---
slug: ${quote(slug)}
talk: ${quote(talk)}
opportunity: ${quote(opportunity)}
status: draft
submittedAt: ""
decisionDate: ""
abstractVersion: ""
notes: ""
public: false
---

Keep submission-specific working notes here.
`;
}

async function scaffold(type) {
  const args = parseCliArgs(process.argv.slice(2));
  if (type === "submission") {
    return scaffoldSubmission(args);
  }
  const values = await promptForTitleAndSlug(type, args);
  const slug = slugify(values.slug || values.title);
  const directory = type === "talk" ? TALK_ROOT : OPPORTUNITY_ROOT;
  const existing = type === "talk" ? loadTalks() : loadOpportunities();
  const label = type === "talk" ? "talk" : "opportunity";

  if (!values.title || !slug) {
    console.error(`A ${type === "opportunity" ? "name" : "title"} and valid slug are required.`);
    process.exit(1);
  }

  if (existing.some((item) => item.effectiveSlug === slug)) {
    console.error(`Slug "${slug}" already exists.`);
    process.exit(1);
  }

  ensureDirectory(directory);
  const filePath = path.join(directory, `${slug}.md`);
  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`);
    process.exit(1);
  }

  const contents =
    type === "talk"
      ? talkTemplate(values.title, slug)
      : opportunityTemplate(values.title, slug);
  fs.writeFileSync(filePath, contents, "utf8");

  console.log(`Created ${path.relative(process.cwd(), filePath)}`);
  console.log(`The new ${label} stays outside the public site.`);
}

async function scaffoldSubmission(args) {
  const talk = String(args.talk || "").trim();
  const opportunity = String(args.opportunity || "").trim();
  const suggestedSlug = slugify(`${talk}-${opportunity}`);
  const slug = slugify(args.slug || suggestedSlug);

  if (!talk || !opportunity || !slug) {
    console.error(
      "Submission scaffolding requires --talk and --opportunity slugs.",
    );
    process.exit(1);
  }
  if (!loadTalks().some((item) => item.effectiveSlug === talk)) {
    console.error(`Talk "${talk}" does not exist.`);
    process.exit(1);
  }
  if (!loadOpportunities().some((item) => item.effectiveSlug === opportunity)) {
    console.error(`Opportunity "${opportunity}" does not exist.`);
    process.exit(1);
  }
  if (loadSubmissions().some((item) => item.effectiveSlug === slug)) {
    console.error(`Submission slug "${slug}" already exists.`);
    process.exit(1);
  }

  ensureDirectory(SUBMISSION_ROOT);
  const filePath = path.join(SUBMISSION_ROOT, `${slug}.md`);
  fs.writeFileSync(filePath, submissionTemplate(slug, talk, opportunity), "utf8");
  console.log(`Created ${path.relative(process.cwd(), filePath)}`);
  console.log("The new submission is private by default.");
}

module.exports = { scaffold };
