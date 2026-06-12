const fs = require("fs");
const path = require("path");
const { loadOpportunities } = require("./content-store");
const { parseCliArgs } = require("./content-workflow");

const DEFAULT_OUTPUT = path.join(
  process.cwd(),
  ".speaker-calendar",
  "speaking-opportunities.ics",
);

function normalizeDate(value) {
  if (value instanceof Date && !Number.isNaN(value.valueOf())) {
    return value.toISOString().slice(0, 10);
  }
  const text = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(text) ? text : "";
}

function compactDate(value) {
  return value.replace(/-/g, "");
}

function nextDate(value) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

function escapeIcs(value) {
  return String(value || "")
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

function foldLine(line) {
  const chunks = [];
  let remaining = line;
  while (Buffer.byteLength(remaining, "utf8") > 73) {
    let index = Math.min(73, remaining.length);
    while (Buffer.byteLength(remaining.slice(0, index), "utf8") > 73) {
      index -= 1;
    }
    chunks.push(remaining.slice(0, index));
    remaining = remaining.slice(index);
  }
  chunks.push(remaining);
  return chunks.join("\r\n ");
}

function eventLines(opportunity, kind, date) {
  const data = opportunity.data;
  const isDeadline = kind === "deadline";
  const label = isDeadline ? "CFP deadline" : "Event";
  const url = isDeadline ? data.cfpUrl || data.url : data.url || data.cfpUrl;
  const description = [
    `Status: ${data.status}`,
    data.platform ? `Platform: ${data.platform}` : "",
    data.format ? `Format: ${data.format}` : "",
    url ? `URL: ${url}` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return [
    "BEGIN:VEVENT",
    `UID:${escapeIcs(`${opportunity.effectiveSlug}-${kind}@roelvanbergen.nl`)}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    `DTSTART;VALUE=DATE:${compactDate(date)}`,
    `DTEND;VALUE=DATE:${compactDate(nextDate(date))}`,
    `SUMMARY:${escapeIcs(`${label}: ${data.name}`)}`,
    data.location ? `LOCATION:${escapeIcs(data.location)}` : "",
    `DESCRIPTION:${escapeIcs(description)}`,
    url ? `URL:${escapeIcs(url)}` : "",
    "TRANSP:TRANSPARENT",
    "END:VEVENT",
  ].filter(Boolean);
}

function renderCalendar(opportunities) {
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//roelvanbergen.nl//Speaking Opportunities//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "X-WR-CALNAME:Speaking opportunities",
  ];
  let eventCount = 0;

  for (const opportunity of opportunities) {
    if (opportunity.data.status === "ignored") continue;
    const deadline = normalizeDate(opportunity.data.deadline);
    const eventDate = normalizeDate(opportunity.data.eventDate);
    if (deadline) {
      lines.push(...eventLines(opportunity, "deadline", deadline));
      eventCount += 1;
    }
    if (eventDate) {
      lines.push(...eventLines(opportunity, "event", eventDate));
      eventCount += 1;
    }
  }

  lines.push("END:VCALENDAR");
  return {
    contents: `${lines.map(foldLine).join("\r\n")}\r\n`,
    eventCount,
  };
}

function main() {
  const args = parseCliArgs(process.argv.slice(2));
  const outputPath = path.resolve(args.output || DEFAULT_OUTPUT);
  const opportunities = loadOpportunities();
  const calendar = renderCalendar(opportunities);

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, calendar.contents, "utf8");
  console.log(
    `Exported ${calendar.eventCount} calendar event(s) from ${opportunities.length} opportunity file(s) to ${path.relative(process.cwd(), outputPath)}.`,
  );
}

main();
