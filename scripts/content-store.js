const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const ROOT = process.cwd();
const ARTICLE_ROOT = path.join(ROOT, "src", "blog");
const TALK_ROOT = path.join(ROOT, "content", "talks");
const OPPORTUNITY_ROOT = path.join(ROOT, "content", "opportunities");
const SUBMISSION_ROOT = path.join(ROOT, "content", "submissions");

function slugify(input) {
  return String(input || "")
    .toLowerCase()
    .trim()
    .replace(/['".,!?():[\]{}]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

function listMarkdownFiles(directory) {
  if (!fs.existsSync(directory)) {
    return [];
  }

  return fs
    .readdirSync(directory)
    .filter((fileName) => fileName.endsWith(".md"))
    .sort();
}

function readMarkdownFile(directory, fileName, type) {
  const filePath = path.join(directory, fileName);
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = matter(raw);
  const fileSlug = path.basename(fileName, ".md");

  return {
    body: parsed.content,
    data: parsed.data,
    effectiveSlug: parsed.data.slug || fileSlug,
    fileName,
    filePath,
    fileSlug,
    raw,
    type,
  };
}

function loadDirectory(directory, type) {
  return listMarkdownFiles(directory).map((fileName) =>
    readMarkdownFile(directory, fileName, type),
  );
}

function loadArticles() {
  return loadDirectory(ARTICLE_ROOT, "article");
}

function loadTalks() {
  return loadDirectory(TALK_ROOT, "talk");
}

function loadOpportunities() {
  return loadDirectory(OPPORTUNITY_ROOT, "opportunity");
}

function loadSubmissions() {
  return loadDirectory(SUBMISSION_ROOT, "submission");
}

function articleStatus(article) {
  if (article.data.status) {
    return String(article.data.status).toLowerCase();
  }

  return article.data.draft === true ? "draft" : "published";
}

function isPublishedArticle(article) {
  return articleStatus(article) === "published";
}

function isPublicShowcaseTalk(talk) {
  return talk.data.visibility === "public" && talk.data.showcase === true;
}

function sanitizePublicTalk(talk) {
  const data = talk.data;
  return {
    audience: data.audience || "",
    description: data.description || "",
    recording: data.recording || "",
    relatedArticles: Array.isArray(data.relatedArticles)
      ? data.relatedArticles
      : [],
    slides: data.slides || "",
    slug: talk.effectiveSlug,
    status: data.status || "",
    takeaways: Array.isArray(data.takeaways) ? data.takeaways : [],
    title: data.title || "",
  };
}

module.exports = {
  ARTICLE_ROOT,
  OPPORTUNITY_ROOT,
  SUBMISSION_ROOT,
  TALK_ROOT,
  articleStatus,
  ensureDirectory,
  isPublicShowcaseTalk,
  isPublishedArticle,
  listMarkdownFiles,
  loadArticles,
  loadOpportunities,
  loadSubmissions,
  loadTalks,
  readMarkdownFile,
  sanitizePublicTalk,
  slugify,
};
