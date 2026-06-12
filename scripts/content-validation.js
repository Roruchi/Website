const path = require("path");
const {
  articleStatus,
  isPublicShowcaseTalk,
  loadArticles,
  loadOpportunities,
  loadSubmissions,
  loadTalks,
} = require("./content-store");
const {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  collectKnownRoutes,
  descriptionLengthOk,
  fileExistsFromSitePath,
  findLinks,
  normalizeInternalHref,
  taxonomy,
} = require("./content-workflow");

const ARTICLE_STATUSES = ["draft", "published"];
const TALK_STATUSES = ["draft", "submitted", "accepted", "delivered", "archived"];
const TALK_VISIBILITIES = ["private", "public"];
const OPPORTUNITY_STATUSES = ["interesting", "ignored", "closed"];
const OPPORTUNITY_FORMATS = ["online", "in-person", "hybrid"];
const OPPORTUNITY_PLATFORMS = ["sessionize", "meetup", "manual", "other"];
const SUBMISSION_STATUSES = [
  "draft",
  "ready",
  "submitted",
  "accepted",
  "rejected",
  "waitlisted",
  "withdrawn",
  "delivered",
];
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function addIssue(collection, item, message) {
  collection.push({
    fileName: path.relative(process.cwd(), item.filePath),
    message,
    type: item.type,
  });
}

function hasValue(value) {
  return value !== undefined && value !== null && value !== "";
}

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  return String(value || "");
}

function validDate(value, optional = false) {
  const normalized = normalizeDate(value);
  if (!normalized && optional) {
    return true;
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    return false;
  }
  const parsed = new Date(`${normalized}T00:00:00Z`);
  return (
    !Number.isNaN(parsed.valueOf()) &&
    parsed.toISOString().slice(0, 10) === normalized
  );
}

function validateSlug(item, slugCounts, errors) {
  if (!SLUG_PATTERN.test(item.effectiveSlug)) {
    addIssue(errors, item, `Invalid slug "${item.effectiveSlug}". Use lowercase kebab-case.`);
  }
  if ((slugCounts.get(item.effectiveSlug) || 0) > 1) {
    addIssue(errors, item, `Duplicate ${item.type} slug "${item.effectiveSlug}".`);
  }
  if (item.data.slug && item.data.slug !== item.fileSlug) {
    addIssue(errors, item, "Slug frontmatter must match the Markdown file name.");
  }
}

function validateReferences(item, field, knownSlugs, errors) {
  const references = item.data[field] || [];
  if (!Array.isArray(references)) {
    addIssue(errors, item, `"${field}" must be a YAML list.`);
    return;
  }

  for (const reference of references) {
    if (!knownSlugs.has(reference)) {
      addIssue(errors, item, `"${field}" references missing slug "${reference}".`);
    }
  }
}

function validateArticle(article, context) {
  const { errors, warnings, articleSlugCounts, talkSlugs, talkBySlug, knownRoutes } =
    context;
  const { data, body } = article;

  for (const field of ["title", "description", "date", "pillar", "tags"]) {
    if (!hasValue(data[field])) {
      addIssue(errors, article, `Missing required frontmatter field "${field}".`);
    }
  }

  validateSlug(article, articleSlugCounts, errors);
  const status = articleStatus(article);
  if (!ARTICLE_STATUSES.includes(status)) {
    addIssue(errors, article, `Status must be one of: ${ARTICLE_STATUSES.join(", ")}.`);
  }
  if (!validDate(data.date)) {
    addIssue(errors, article, `Date must be a valid YYYY-MM-DD value.`);
  }
  if (!taxonomy.pillars.includes(data.pillar)) {
    addIssue(errors, article, `Unknown pillar "${data.pillar}".`);
  }
  if (!Array.isArray(data.tags) || !data.tags.includes("post")) {
    addIssue(errors, article, 'Tags must be a YAML list containing "post".');
  } else {
    const unknownTags = data.tags.filter(
      (tag) => tag !== "post" && !taxonomy.tags.includes(tag),
    );
    if (unknownTags.length) {
      addIssue(errors, article, `Unknown tags: ${unknownTags.join(", ")}.`);
    }
  }
  if (typeof data.description === "string" && !descriptionLengthOk(data.description.trim())) {
    addIssue(
      warnings,
      article,
      `Description should be ${DESCRIPTION_MIN}-${DESCRIPTION_MAX} characters.`,
    );
  }

  validateReferences(article, "relatedTalks", talkSlugs, errors);
  if (status === "published" && Array.isArray(data.relatedTalks)) {
    for (const slug of data.relatedTalks) {
      const talk = talkBySlug.get(slug);
      if (talk && !isPublicShowcaseTalk(talk)) {
        addIssue(
          warnings,
          article,
          `Related talk "${slug}" is private or not showcased and will be hidden publicly.`,
        );
      }
    }
  }

  if (status === "published" && body.includes("—")) {
    const severity = data.originalUrl ? warnings : errors;
    addIssue(severity, article, "Public Markdown content contains an em dash.");
  }

  validateLinks(article, knownRoutes, errors);
  validateImages(article, warnings);
}

function validateTalk(talk, context) {
  const { errors, articleSlugs, talkSlugCounts } = context;
  const { data } = talk;

  for (const field of ["title", "status", "visibility", "showcase"]) {
    if (!hasValue(data[field])) {
      addIssue(errors, talk, `Missing required frontmatter field "${field}".`);
    }
  }

  validateSlug(talk, talkSlugCounts, errors);
  if (!TALK_STATUSES.includes(data.status)) {
    addIssue(errors, talk, `Status must be one of: ${TALK_STATUSES.join(", ")}.`);
  }
  if (!TALK_VISIBILITIES.includes(data.visibility)) {
    addIssue(
      errors,
      talk,
      `Visibility must be one of: ${TALK_VISIBILITIES.join(", ")}.`,
    );
  }
  if (typeof data.showcase !== "boolean") {
    addIssue(errors, talk, '"showcase" must be true or false.');
  }
  if (data.showcase === true && data.visibility !== "public") {
    addIssue(errors, talk, 'A showcased talk must also set "visibility: public".');
  }

  validateReferences(talk, "relatedArticles", articleSlugs, errors);

  if (isPublicShowcaseTalk(talk)) {
    for (const field of ["title", "description", "audience"]) {
      if (!hasValue(data[field])) {
        addIssue(errors, talk, `Public showcased talk is missing "${field}".`);
      }
    }
    if (!Array.isArray(data.takeaways) || data.takeaways.length === 0) {
      addIssue(errors, talk, "Public showcased talk needs at least one takeaway.");
    }
    const publicText = [
      data.title,
      data.description,
      data.audience,
      ...(Array.isArray(data.takeaways) ? data.takeaways : []),
    ].join("\n");
    if (publicText.includes("—")) {
      addIssue(errors, talk, "Public talk metadata contains an em dash.");
    }
  }
}

function validateOpportunity(opportunity, context) {
  const { errors, opportunitySlugCounts } = context;
  const { data } = opportunity;

  for (const field of ["name", "platform", "format", "status"]) {
    if (!hasValue(data[field])) {
      addIssue(errors, opportunity, `Missing required frontmatter field "${field}".`);
    }
  }

  validateSlug(opportunity, opportunitySlugCounts, errors);
  const platform = String(data.platform || "").toLowerCase();
  if (!OPPORTUNITY_PLATFORMS.includes(platform)) {
    addIssue(
      errors,
      opportunity,
      `Platform must be one of: ${OPPORTUNITY_PLATFORMS.join(", ")}.`,
    );
  }
  if (!OPPORTUNITY_FORMATS.includes(data.format)) {
    addIssue(
      errors,
      opportunity,
      `Format must be one of: ${OPPORTUNITY_FORMATS.join(", ")}.`,
    );
  }
  if (!OPPORTUNITY_STATUSES.includes(data.status)) {
    addIssue(
      errors,
      opportunity,
      `Status must be one of: ${OPPORTUNITY_STATUSES.join(", ")}.`,
    );
  }
  for (const field of ["deadline", "eventDate"]) {
    if (!validDate(data[field], true)) {
      addIssue(
        errors,
        opportunity,
        `"${field}" must be empty or a valid YYYY-MM-DD value.`,
      );
    }
  }
  if (data.topics !== undefined && !Array.isArray(data.topics)) {
    addIssue(errors, opportunity, '"topics" must be a YAML list.');
  }
}

function validateSubmission(submission, context) {
  const {
    errors,
    opportunitySlugs,
    submissionSlugCounts,
    talkSlugs,
  } = context;
  const { data } = submission;

  for (const field of ["talk", "opportunity", "status", "public"]) {
    if (!hasValue(data[field])) {
      addIssue(errors, submission, `Missing required frontmatter field "${field}".`);
    }
  }

  validateSlug(submission, submissionSlugCounts, errors);
  if (!talkSlugs.has(data.talk)) {
    addIssue(errors, submission, `Talk "${data.talk}" does not exist.`);
  }
  if (!opportunitySlugs.has(data.opportunity)) {
    addIssue(
      errors,
      submission,
      `Opportunity "${data.opportunity}" does not exist.`,
    );
  }
  if (!SUBMISSION_STATUSES.includes(data.status)) {
    addIssue(
      errors,
      submission,
      `Status must be one of: ${SUBMISSION_STATUSES.join(", ")}.`,
    );
  }
  if (data.public !== false) {
    addIssue(errors, submission, '"public" must remain false in phase 1.');
  }
  for (const field of ["submittedAt", "decisionDate"]) {
    if (!validDate(data[field], true)) {
      addIssue(
        errors,
        submission,
        `"${field}" must be empty or a valid YYYY-MM-DD value.`,
      );
    }
  }
}

function validateLinks(article, knownRoutes, errors) {
  for (const href of findLinks(article.body)) {
    if (/^(https?:|mailto:|tel:|#)/i.test(href)) {
      continue;
    }
    if (href.startsWith("/")) {
      const normalized = normalizeInternalHref(href);
      if (!knownRoutes.has(normalized) && !fileExistsFromSitePath(normalized)) {
        addIssue(errors, article, `Broken internal link "${href}".`);
      }
    }
  }
}

function validateImages(article, warnings) {
  const markdownImages = /!\[([^\]]*)]\(([^)]+)\)/g;
  const htmlImages = /<img\b[^>]*>/gi;

  for (const match of article.body.matchAll(markdownImages)) {
    if (!match[1].trim()) {
      addIssue(warnings, article, `Image "${match[2]}" is missing alt text.`);
    }
  }
  for (const match of article.body.matchAll(htmlImages)) {
    const alt = match[0].match(/\balt=["']([^"']*)["']/i);
    const nearbyFigure = article.body.slice(
      Math.max(0, match.index - 20),
      match.index + match[0].length + 300,
    );
    if ((!alt || !alt[1].trim()) && !/<figcaption>[\s\S]*?<\/figcaption>/i.test(nearbyFigure)) {
      addIssue(warnings, article, "An HTML image is missing alt text or a figure caption.");
    }
  }
}

function countSlugs(items) {
  const counts = new Map();
  for (const item of items) {
    counts.set(item.effectiveSlug, (counts.get(item.effectiveSlug) || 0) + 1);
  }
  return counts;
}

function validateContent() {
  const articles = loadArticles();
  const talks = loadTalks();
  const opportunities = loadOpportunities();
  const submissions = loadSubmissions();
  const errors = [];
  const warnings = [];
  const articleSlugs = new Set(articles.map((item) => item.effectiveSlug));
  const talkSlugs = new Set(talks.map((item) => item.effectiveSlug));
  const context = {
    articleSlugCounts: countSlugs(articles),
    articleSlugs,
    errors,
    knownRoutes: collectKnownRoutes(articles),
    opportunitySlugCounts: countSlugs(opportunities),
    opportunitySlugs: new Set(
      opportunities.map((item) => item.effectiveSlug),
    ),
    submissionSlugCounts: countSlugs(submissions),
    talkBySlug: new Map(talks.map((talk) => [talk.effectiveSlug, talk])),
    talkSlugCounts: countSlugs(talks),
    talkSlugs,
    warnings,
  };

  for (const article of articles) validateArticle(article, context);
  for (const talk of talks) validateTalk(talk, context);
  for (const opportunity of opportunities) {
    validateOpportunity(opportunity, context);
  }
  for (const submission of submissions) {
    validateSubmission(submission, context);
  }

  return {
    articles,
    errors,
    opportunities,
    submissions,
    talks,
    warnings,
  };
}

module.exports = {
  ARTICLE_STATUSES,
  OPPORTUNITY_STATUSES,
  SUBMISSION_STATUSES,
  TALK_STATUSES,
  validateContent,
};
