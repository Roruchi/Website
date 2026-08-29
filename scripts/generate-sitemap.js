const fs = require("fs");
const path = require("path");

const outputRoot = path.resolve(process.env.PUBLIC_OUTPUT_DIR || "_site");
const canonicalOrigin = "https://roelvanbergen.nl";

function walk(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function extract(html, pattern) {
  return html.match(pattern)?.[1]?.trim() || "";
}

function escapeXml(value) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

const locations = walk(outputRoot)
  .filter((filePath) => filePath.endsWith(".html"))
  .map((filePath) => fs.readFileSync(filePath, "utf8"))
  .filter((html) => {
    const robots = extract(
      html,
      /<meta\s+name=["']robots["']\s+content=["']([^"']*)["']/i,
    );
    return !robots.toLowerCase().includes("noindex");
  })
  .map((html) => extract(
    html,
    /<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i,
  ))
  .filter((url) => url.startsWith(canonicalOrigin))
  .filter((url, index, all) => all.indexOf(url) === index)
  .sort();

const body = locations.map((url) => `  <url><loc>${escapeXml(url)}</loc></url>`).join("\n");
const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  body,
  '</urlset>',
  '',
].join("\n");

fs.writeFileSync(path.join(outputRoot, "sitemap.xml"), xml, "utf8");
console.log(`Generated sitemap.xml with ${locations.length} canonical URL(s).`);
