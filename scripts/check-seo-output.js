const fs = require("fs");
const path = require("path");
const {
  isPublishedArticle,
  loadArticles,
} = require("./content-store");

const siteRoot = path.resolve(process.env.PUBLIC_OUTPUT_DIR || "_site");
const siteUrl = "https://roelvanbergen.nl";
const errors = [];

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function routeFor(filePath) {
  const relative = path.relative(siteRoot, filePath).replace(/\\/g, "/");
  if (relative === "index.html") return "/";
  if (relative.endsWith("/index.html")) {
    return `/${relative.slice(0, -"index.html".length)}`;
  }
  return `/${relative}`;
}

function match(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function jsonLdBlocks(html) {
  return [...html.matchAll(
    /<script\b[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )].map((entry) => entry[1].trim());
}

function report(message) {
  errors.push(message);
}

if (!fs.existsSync(siteRoot)) {
  console.error("SEO output check requires a completed build in _site.");
  process.exit(1);
}

const htmlFiles = walk(siteRoot).filter((filePath) => filePath.endsWith(".html"));
const indexableRoutes = new Set();
const indexableTitles = new Map();
const builtRoutes = new Set(htmlFiles.map(routeFor));

for (const filePath of htmlFiles) {
  const html = fs.readFileSync(filePath, "utf8");
  const route = routeFor(filePath);
  const title = match(html, /<title>([\s\S]*?)<\/title>/i);
  const description = match(
    html,
    /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i,
  );
  const robots = match(
    html,
    /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i,
  ).toLowerCase();
  const canonical = match(
    html,
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
  );
  const noindex = robots.includes("noindex");
  const schemas = jsonLdBlocks(html);

  for (const entry of html.matchAll(/\bhref=["']([^"']+)["']/gi)) {
    const href = entry[1].split(/[?#]/, 1)[0];
    if (!href.startsWith("/") || href.startsWith("//")) continue;
    if (href.endsWith("/")) {
      if (!builtRoutes.has(href)) report(`${route} links to missing route ${href}.`);
      continue;
    }
    const target = path.join(siteRoot, href.slice(1));
    if (!fs.existsSync(target)) report(`${route} links to missing file ${href}.`);
  }

  if (!/<html\b/i.test(html)) report(`${route} is missing an <html> element.`);
  if (!title) report(`${route} is missing a title.`);
  if (!canonical) report(`${route} is missing a canonical URL.`);

  for (const schema of schemas) {
    try {
      JSON.parse(schema);
    } catch (error) {
      report(`${route} contains invalid JSON-LD: ${error.message}`);
    }
  }

  if (noindex) continue;

  if (!description) report(`${route} is missing a meta description.`);
  if (!robots.includes("index")) report(`${route} is missing an index directive.`);
  if (!schemas.length) report(`${route} is missing JSON-LD structured data.`);
  if (canonical !== `${siteUrl}${route}`) {
    report(`${route} should self-canonicalize to ${siteUrl}${route}, found ${canonical}.`);
  }

  if (indexableTitles.has(title)) {
    report(`${route} duplicates the title used by ${indexableTitles.get(title)}.`);
  } else {
    indexableTitles.set(title, route);
  }
  indexableRoutes.add(route);
}

for (const route of ["/search/", "/tags/", "/talks/", "/trainings/"]) {
  const filePath = path.join(siteRoot, route, "index.html");
  if (!fs.existsSync(filePath)) continue;
  const html = fs.readFileSync(filePath, "utf8");
  if (!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    report(`${route} must remain noindex.`);
  }
}

for (const route of ["/", "/about/", "/blog/", "/labs/ears/", "/work-with-me/"]) {
  if (!indexableRoutes.has(route)) report(`Required indexable route ${route} is missing.`);
}

for (const filePath of htmlFiles.filter((candidate) => routeFor(candidate).startsWith("/tags/"))) {
  const html = fs.readFileSync(filePath, "utf8");
  if (!/name=["']robots["'][^>]*content=["'][^"']*noindex/i.test(html)) {
    report(`${routeFor(filePath)} must remain noindex.`);
  }
}

const articles = loadArticles();
for (const article of articles.filter((item) => !isPublishedArticle(item))) {
  const draftOutput = path.join(siteRoot, "blog", article.effectiveSlug, "index.html");
  if (fs.existsSync(draftOutput)) {
    report(`Draft article ${article.effectiveSlug} was emitted into public output.`);
  }
}

const robotsPath = path.join(siteRoot, "robots.txt");
const sitemapPath = path.join(siteRoot, "sitemap.xml");
if (!fs.existsSync(robotsPath)) report("robots.txt is missing.");
if (!fs.existsSync(sitemapPath)) report("sitemap.xml is missing.");

if (fs.existsSync(robotsPath)) {
  const robots = fs.readFileSync(robotsPath, "utf8");
  if (!robots.includes(`Sitemap: ${siteUrl}/sitemap.xml`)) {
    report("robots.txt does not advertise the canonical sitemap URL.");
  }
}

if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, "utf8");
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((entry) =>
    entry[1].replace(/&amp;/g, "&"),
  );
  const locationSet = new Set(locations);

  if (locations.length !== locationSet.size) report("sitemap.xml contains duplicate URLs.");
  for (const route of indexableRoutes) {
    if (!locationSet.has(`${siteUrl}${route}`)) {
      report(`sitemap.xml is missing ${siteUrl}${route}.`);
    }
  }
  for (const location of locations) {
    const route = location.startsWith(siteUrl) ? location.slice(siteUrl.length) || "/" : "";
    if (!route || !indexableRoutes.has(route)) {
      report(`sitemap.xml contains a non-indexable or non-canonical URL: ${location}.`);
    }
  }
}

if (errors.length) {
  console.error("SEO output check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `SEO output check passed for ${indexableRoutes.size} indexable route(s); ` +
  `${articles.filter((item) => !isPublishedArticle(item)).length} draft article(s) remained private.`,
);
