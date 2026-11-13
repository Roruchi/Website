const fs = require("fs");
const matter = require("gray-matter");
const yaml = require("js-yaml");
const { DateTime } = require("luxon");

const sourceDateSchema = new yaml.Schema({
  include: [yaml.DEFAULT_SAFE_SCHEMA],
  implicit: [new yaml.Type("tag:yaml.org,2002:timestamp", {
    kind: "scalar",
    resolve: yaml.DEFAULT_SAFE_SCHEMA.compiledImplicit.find(
      (type) => type.tag === "tag:yaml.org,2002:timestamp",
    ).resolve,
    construct: (value) => value,
  })],
});

// Read only this page's explicit front matter, never Eleventy's fallback file date.
module.exports = function sourceLastmod(inputPath) {
  if (!inputPath || !fs.existsSync(inputPath)) return "";
  const { data } = matter(fs.readFileSync(inputPath, "utf8"), {
    engines: { yaml: (source) => yaml.safeLoad(source, { schema: sourceDateSchema }) },
  });
  const value = data.updated || data.date;
  if (typeof value !== "string") return "";
  const parsed = DateTime.fromISO(value, { zone: "utc" });
  return parsed.isValid ? parsed.toUTC().toISODate() : "";
};
