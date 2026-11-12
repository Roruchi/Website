const fs = require("fs");
const matter = require("gray-matter");
const { DateTime } = require("luxon");

// Read only this page's explicit front matter, never Eleventy's fallback file date.
module.exports = function sourceLastmod(inputPath) {
  if (!inputPath || !fs.existsSync(inputPath)) return "";
  const { data } = matter(fs.readFileSync(inputPath, "utf8"));
  const value = data.updated || data.date;
  if (value instanceof Date) {
    return Number.isNaN(value.valueOf()) ? "" : value.toISOString().slice(0, 10);
  }
  if (typeof value !== "string") return "";
  const parsed = DateTime.fromISO(value, { zone: "utc" });
  return parsed.isValid ? parsed.toUTC().toISODate() : "";
};
