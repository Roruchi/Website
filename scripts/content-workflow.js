const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");
const taxonomy = require("../src/_data/content-taxonomy");

const CONTENT_ROOT = path.join(process.cwd(), "src", "blog");
const DESCRIPTION_MIN = 70;
const DESCRIPTION_MAX = 160;

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['".,!?():[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCliArgs(argv) {
  const args = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      continue;
    }

    const [rawKey, inlineValue] = token.slice(2).split("=", 2);
    const nextToken = argv[index + 1];
    const value =
      inlineValue !== undefined
        ? inlineValue
        : nextToken && !nextToken.startsWith("--")
          ? nextToken
          : "true";

    args[rawKey] = value;

    if (inlineValue === undefined && nextToken && !nextToken.startsWith("--")) {
      index += 1;
    }
  }

  return args;
}

function listArticleFiles() {
  return fs
    .readdirSync(CONTENT_ROOT)
    .filter((file) => file.endsWith(".md"))
    .sort();
}

function readArticle(fileName) {
  const fullPath = path.join(CONTENT_ROOT, fileName);
  const raw = fs.readFileSync(fullPath, "utf8");
  const parsed = matter(raw);
  const fileSlug = path.basename(fileName, ".md");
  const effectiveSlug = parsed.data.slug || fileSlug;

  return {
    body: parsed.content,
    data: parsed.data,
    effectiveSlug,
    fileName,
    filePath: fullPath,
    raw,
  };
}

function loadArticles() {
  return listArticleFiles().map(readArticle);
}

function splitCsv(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function normalizeStatus(input) {
  const value = String(input || "").trim().toLowerCase();
  if (value === "draft" || value === "published") {
    return value;
  }

  return "";
}

function descriptionLengthOk(description) {
  return (
    description.length >= DESCRIPTION_MIN &&
    description.length <= DESCRIPTION_MAX
  );
}

function normalizeInternalHref(href) {
  const [withoutHash] = href.split("#", 1);
  const [withoutQuery] = withoutHash.split("?", 1);
  if (!withoutQuery) {
    return "/";
  }

  return withoutQuery.endsWith("/") ? withoutQuery : `${withoutQuery}/`;
}

function fileExistsFromSitePath(sitePath) {
  const cleaned = sitePath.replace(/^\/+/, "");
  if (!cleaned) {
    return true;
  }

  const directPath = path.join(process.cwd(), "src", cleaned);
  if (fs.existsSync(directPath)) {
    return true;
  }

  const imagePath = path.join(process.cwd(), cleaned);
  return fs.existsSync(imagePath);
}

function collectKnownRoutes(articles) {
  const routes = new Set([
    "/",
    "/about/",
    "/blog/",
    "/feed/",
    "/feed/feed.xml/",
    "/search/",
    "/tags/",
    "/talks/",
    "/trainings/",
  ]);

  for (const article of articles) {
    routes.add(`/blog/${article.effectiveSlug}/`);
  }

  for (const tag of taxonomy.tags) {
    routes.add(`/tags/${slugify(tag)}/`);
  }

  return routes;
}

function findLinks(body) {
  const hrefs = [];
  const markdownLinkPattern = /!?\[[^\]]*]\(([^)\s]+)(?:\s+"[^"]*")?\)/g;
  const htmlLinkPattern = /<(?:a|img)\b[^>]+(?:href|src)=["']([^"']+)["'][^>]*>/g;

  for (const match of body.matchAll(markdownLinkPattern)) {
    hrefs.push(match[1]);
  }

  for (const match of body.matchAll(htmlLinkPattern)) {
    hrefs.push(match[1]);
  }

  return hrefs;
}

module.exports = {
  CONTENT_ROOT,
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  collectKnownRoutes,
  descriptionLengthOk,
  fileExistsFromSitePath,
  findLinks,
  listArticleFiles,
  loadArticles,
  normalizeInternalHref,
  normalizeStatus,
  parseCliArgs,
  readArticle,
  slugify,
  splitCsv,
  taxonomy,
};
