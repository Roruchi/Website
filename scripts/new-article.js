const fs = require("fs");
const path = require("path");
const readline = require("readline/promises");
const { stdin: input, stdout: output } = require("process");
const {
  CONTENT_ROOT,
  loadArticles,
  normalizeStatus,
  parseCliArgs,
  slugify,
  splitCsv,
  taxonomy,
} = require("./content-workflow");

function renderFrontmatter({
  title,
  slug,
  description,
  pillar,
  status,
  tags,
}) {
  const tagLines = ["  - post", ...tags.map((tag) => `  - ${tag}`)].join("\n");

  return `---
title: "${title.replace(/"/g, '\\"')}"
slug: "${slug}"
date: ${new Date().toISOString().slice(0, 10)}
description: "${description.replace(/"/g, '\\"')}"
status: ${status}
pillar: ${pillar}
relatedTalks: []
tags:
${tagLines}
---

## Why this matters

Write the reader problem or tension here.

## The core idea

Explain the main point in plain language.

## Practical takeaway

- Add the first concrete takeaway.
- Add the second concrete takeaway.

## Closing thought

Leave the reader with one clear next step or reflection.
`;
}

async function promptForMissingFields(initialValues) {
  if (!process.stdin.isTTY) {
    return initialValues;
  }

  const rl = readline.createInterface({ input, output });
  const values = { ...initialValues };

  try {
    if (!values.title) {
      values.title = (await rl.question("Title: ")).trim();
    }

    if (!values.slug) {
      const suggested = slugify(values.title);
      const answer = await rl.question(`Slug [${suggested}]: `);
      values.slug = (answer || suggested).trim();
    }

    if (!values.description) {
      values.description = (await rl.question("Description: ")).trim();
    }

    if (!values.pillar) {
      const answer = await rl.question(
        `Pillar (${taxonomy.pillars.join("/")}): `,
      );
      values.pillar = answer.trim().toLowerCase();
    }

    if (!values.tags) {
      const answer = await rl.question(
        `Tags, comma-separated [optional; known tags: ${taxonomy.tags.join(
          ", ",
        )}]: `,
      );
      values.tags = answer.trim();
    }

    if (!values.status) {
      const answer = await rl.question("Status (draft/published) [draft]: ");
      values.status = (answer || "draft").trim().toLowerCase();
    }
  } finally {
    rl.close();
  }

  return values;
}

function validateInput(values, existingSlugs) {
  const errors = [];
  const slug = slugify(values.slug);
  const status = normalizeStatus(values.status || "draft");
  const tags = splitCsv(values.tags);

  if (!values.title) {
    errors.push("Missing title.");
  }

  if (!slug) {
    errors.push("Missing slug.");
  } else if (existingSlugs.has(slug)) {
    errors.push(`Slug "${slug}" already exists.`);
  }

  if (!values.description) {
    errors.push("Missing description.");
  }

  if (!values.pillar || !taxonomy.pillars.includes(values.pillar)) {
    errors.push(
      `Pillar must be one of: ${taxonomy.pillars.join(", ")}.`,
    );
  }

  if (!status) {
    errors.push('Status must be "draft" or "published".');
  }

  const unknownTags = tags.filter((tag) => !taxonomy.tags.includes(tag));
  if (unknownTags.length > 0) {
    errors.push(`Unknown tags: ${unknownTags.join(", ")}.`);
  }

  return {
    draft: status !== "published",
    errors,
    slug,
    status,
    tags,
  };
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const values = await promptForMissingFields({
    description: args.description || "",
    pillar: (args.pillar || "").toLowerCase(),
    slug: args.slug || "",
    status: (args.status || args.draft || "").toLowerCase(),
    tags: args.tags || "",
    title: args.title || "",
  });

  const existingSlugs = new Set(loadArticles().map((article) => article.effectiveSlug));
  const validated = validateInput(values, existingSlugs);

  if (validated.errors.length > 0) {
    console.error("Could not scaffold article:");
    for (const error of validated.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  const filePath = path.join(CONTENT_ROOT, `${validated.slug}.md`);
  if (fs.existsSync(filePath)) {
    console.error(`File already exists: ${filePath}`);
    process.exit(1);
  }

  const fileContents = renderFrontmatter({
    description: values.description,
    pillar: values.pillar,
    slug: validated.slug,
    status: validated.status,
    tags: validated.tags,
    title: values.title,
  });

  fs.writeFileSync(filePath, fileContents, "utf8");

  console.log(`Created ${path.relative(process.cwd(), filePath)}`);
  console.log(`Status: ${validated.status}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
