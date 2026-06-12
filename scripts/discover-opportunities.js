const fs = require("fs");
const path = require("path");
const {
  OPPORTUNITY_ROOT,
  ensureDirectory,
  loadOpportunities,
  slugify,
} = require("./content-store");
const { parseCliArgs } = require("./content-workflow");

const DEFAULT_SOURCES_PATH = path.join(
  process.cwd(),
  "content",
  "discovery-sources.json",
);

function quote(value) {
  return `"${String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/"/g, '\\"')}"`;
}

function getPath(value, dottedPath) {
  if (!dottedPath) return value;
  return dottedPath.split(".").reduce((current, key) => {
    if (current === undefined || current === null) return undefined;
    if (/^\d+$/.test(key) && Array.isArray(current)) {
      return current[Number(key)];
    }
    return current[key];
  }, value);
}

function normalizeDate(value) {
  if (!value) return "";
  const text = String(value).trim();
  const direct = text.match(/^(\d{4}-\d{2}-\d{2})/);
  if (direct) return direct[1];
  const parsed = new Date(text);
  return Number.isNaN(parsed.valueOf()) ? "" : parsed.toISOString().slice(0, 10);
}

function normalizePlatform(value) {
  const platform = String(value || "other").trim().toLowerCase();
  return ["sessionize", "meetup", "manual", "other"].includes(platform)
    ? platform
    : "other";
}

function normalizeFormat(value) {
  const format = String(value || "").trim().toLowerCase();
  if (["online", "in-person", "hybrid"].includes(format)) return format;
  if (/online|virtual|remote/.test(format)) return "online";
  if (/hybrid/.test(format)) return "hybrid";
  return "in-person";
}

function normalizeTopics(value) {
  if (Array.isArray(value)) {
    return value.map((topic) => String(topic).trim()).filter(Boolean);
  }
  return String(value || "")
    .split(",")
    .map((topic) => topic.trim())
    .filter(Boolean);
}

function decodeXml(value) {
  return String(value || "")
    .replace(/<!\[CDATA\[([\s\S]*?)]]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}

function xmlTag(block, names) {
  for (const name of names) {
    const escaped = name.replace(":", "\\:");
    const match = block.match(
      new RegExp(`<${escaped}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escaped}>`, "i"),
    );
    if (match) return decodeXml(match[1]).replace(/<[^>]+>/g, "").trim();
  }
  return "";
}

function xmlLink(block) {
  const atomLink = block.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*\/?>/i);
  if (atomLink) return decodeXml(atomLink[1]);
  return xmlTag(block, ["link"]);
}

function parseFeed(xml) {
  const blocks =
    xml.match(/<item\b[\s\S]*?<\/item>/gi) ||
    xml.match(/<entry\b[\s\S]*?<\/entry>/gi) ||
    [];

  return blocks.map((block) => ({
    description: xmlTag(block, ["description", "summary", "content"]),
    eventDate: xmlTag(block, ["eventDate", "event-date", "start", "dtstart"]),
    link: xmlLink(block),
    published: xmlTag(block, ["pubDate", "published", "updated"]),
    title: xmlTag(block, ["title"]),
  }));
}

async function readSource(source, sourcesPath) {
  if (/^https?:\/\//i.test(source.url)) {
    const response = await fetch(source.url, {
      headers: { "user-agent": "personal-website-speaking-discovery/1.0" },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return response.text();
  }

  const filePath = path.resolve(path.dirname(sourcesPath), source.url);
  return fs.readFileSync(filePath, "utf8");
}

function mapJsonItem(item, source) {
  const fields = source.fields || {};
  const defaults = source.defaults || {};
  const value = (field) => {
    const mapped = fields[field] ? getPath(item, fields[field]) : undefined;
    return mapped === undefined || mapped === null ? defaults[field] : mapped;
  };

  return {
    cfpUrl: value("cfpUrl") || "",
    deadline: normalizeDate(value("deadline")),
    eventDate: normalizeDate(value("eventDate")),
    format: normalizeFormat(value("format")),
    location: value("location") || "",
    name: value("name") || "",
    notes: value("notes") || "",
    platform: normalizePlatform(value("platform")),
    topics: normalizeTopics(value("topics")),
    url: value("url") || "",
  };
}

function mapFeedItem(item, source) {
  const defaults = source.defaults || {};
  return {
    cfpUrl: defaults.cfpUrl || item.link || "",
    deadline: normalizeDate(defaults.deadline),
    eventDate: normalizeDate(defaults.eventDate || item.eventDate),
    format: normalizeFormat(defaults.format),
    location: defaults.location || "",
    name: item.title,
    notes: defaults.notes || "",
    platform: normalizePlatform(defaults.platform),
    topics: normalizeTopics(defaults.topics),
    url: item.link,
  };
}

async function loadCandidates(source, sourcesPath) {
  const raw = await readSource(source, sourcesPath);
  if (source.type === "json") {
    const parsed = JSON.parse(raw);
    const items = getPath(parsed, source.itemsPath);
    if (!Array.isArray(items)) {
      throw new Error(`itemsPath "${source.itemsPath || ""}" did not resolve to an array`);
    }
    return items.map((item) => mapJsonItem(item, source));
  }
  if (source.type === "rss" || source.type === "atom") {
    return parseFeed(raw).map((item) => mapFeedItem(item, source));
  }
  throw new Error(`unsupported source type "${source.type}"`);
}

function renderOpportunity(candidate, source) {
  const topicLines = candidate.topics.length
    ? `\n${candidate.topics.map((topic) => `  - ${quote(topic)}`).join("\n")}`
    : " []";
  const discoveryNote = `Discovered from ${source.name || source.url}. Review all metadata before using this opportunity.`;
  const notes = [candidate.notes, discoveryNote].filter(Boolean).join("\n\n");

  return `---
name: ${quote(candidate.name)}
slug: ${quote(candidate.slug)}
url: ${quote(candidate.url)}
cfpUrl: ${quote(candidate.cfpUrl)}
platform: ${candidate.platform}
location: ${quote(candidate.location)}
format: ${candidate.format}
deadline: ${candidate.deadline || '""'}
eventDate: ${candidate.eventDate || '""'}
status: interesting
topics:${topicLines}
notes: ${quote(notes)}
discoveredFrom: ${quote(source.name || source.url)}
discoveredAt: ${new Date().toISOString().slice(0, 10)}
---

Review the imported opportunity and add any private research notes here.
`;
}

function candidateKey(candidate) {
  return candidate.cfpUrl || candidate.url || candidate.slug;
}

async function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const shouldWrite = args.write === "true";
  const sourcesPath = path.resolve(args.sources || DEFAULT_SOURCES_PATH);
  const registry = JSON.parse(fs.readFileSync(sourcesPath, "utf8"));
  const sources = Array.isArray(registry.sources)
    ? registry.sources.filter((source) => source.enabled !== false)
    : [];
  const existing = loadOpportunities();
  const existingSlugs = new Set(existing.map((item) => item.effectiveSlug));
  const existingKeys = new Set(
    existing.flatMap((item) =>
      [item.data.cfpUrl, item.data.url, item.effectiveSlug].filter(Boolean),
    ),
  );
  const discoveredKeys = new Set();
  const candidates = [];
  const failures = [];

  for (const source of sources) {
    try {
      const sourceCandidates = await loadCandidates(source, sourcesPath);
      for (const candidate of sourceCandidates) {
        candidate.slug = slugify(candidate.name);
        const key = candidateKey(candidate);
        if (!candidate.name || !candidate.slug) continue;
        if (
          existingSlugs.has(candidate.slug) ||
          existingKeys.has(key) ||
          discoveredKeys.has(key)
        ) {
          continue;
        }
        discoveredKeys.add(key);
        candidates.push({ candidate, source });
      }
    } catch (error) {
      failures.push(`${source.name || source.url}: ${error.message}`);
    }
  }

  if (!sources.length) {
    console.log(`No enabled sources in ${path.relative(process.cwd(), sourcesPath)}.`);
  }

  for (const { candidate, source } of candidates) {
    console.log(
      `${shouldWrite ? "Import" : "Found"}: ${candidate.name} (${candidate.deadline || "no deadline"}) from ${source.name || source.url}`,
    );
  }

  if (shouldWrite && candidates.length) {
    ensureDirectory(OPPORTUNITY_ROOT);
    for (const { candidate, source } of candidates) {
      const filePath = path.join(OPPORTUNITY_ROOT, `${candidate.slug}.md`);
      fs.writeFileSync(filePath, renderOpportunity(candidate, source), "utf8");
    }
  }

  for (const failure of failures) {
    console.error(`Source failed: ${failure}`);
  }

  console.log(
    `${shouldWrite ? "Imported" : "Previewed"} ${candidates.length} new opportunity candidate(s); skipped existing matches.`,
  );

  if (failures.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
