const fs = require("fs");
const path = require("path");
const {
  isPublicShowcaseTalk,
  loadOpportunities,
  loadSubmissions,
  loadTalks,
} = require("./content-store");

const outputRoot = path.resolve(
  process.env.PUBLIC_OUTPUT_DIR || path.join(process.cwd(), "_site"),
);
const errors = [];

function walk(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(fullPath) : [fullPath];
  });
}

function meaningfulPrivateValues(item) {
  return [
    item.effectiveSlug,
    item.data.title,
    item.data.name,
    item.data.notes,
  ]
    .filter((value) => typeof value === "string" && value.trim().length >= 8)
    .map((value) => value.trim());
}

if (!fs.existsSync(outputRoot)) {
  console.error("Public output check requires a completed build in _site.");
  process.exit(1);
}

if (fs.existsSync(path.join(outputRoot, "dashboard"))) {
  console.error("Public output privacy check failed:");
  console.error("- _site/dashboard exists. The dashboard must remain local-only.");
  process.exit(1);
}

const publicText = walk(outputRoot)
  .filter((filePath) => /\.(html|xml|json)$/i.test(filePath))
  .map((filePath) => fs.readFileSync(filePath, "utf8"))
  .join("\n");

const privateItems = [
  ...loadTalks().filter((talk) => !isPublicShowcaseTalk(talk)),
  ...loadOpportunities(),
  ...loadSubmissions(),
];

for (const item of privateItems) {
  for (const value of meaningfulPrivateValues(item)) {
    if (publicText.includes(value)) {
      errors.push(
        `${path.relative(process.cwd(), item.filePath)} leaked private value "${value.slice(0, 80)}".`,
      );
    }
  }
}

if (errors.length) {
  console.error("Public output privacy check failed:");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(
  `Checked built output against ${privateItems.length} private talk/opportunity/submission file(s); no private values were found.`,
);
