const fs = require("fs");
const path = require("path");
const { articleStatus, isPublicShowcaseTalk } = require("./content-store");
const { validateContent } = require("./content-validation");

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function groupBy(items, getKey) {
  return items.reduce((groups, item) => {
    const key = getKey(item) || "unknown";
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {});
}

function itemList(items, titleField = "title") {
  if (!items.length) return '<p class="empty">None</p>';
  return `<ul>${items
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.data[titleField])}</strong><code>${escapeHtml(
          item.effectiveSlug,
        )}</code></li>`,
    )
    .join("")}</ul>`;
}

function groupedSections(groups, titleField) {
  return Object.keys(groups)
    .sort()
    .map(
      (key) => `<section class="group">
        <h3>${escapeHtml(key)} <span>${groups[key].length}</span></h3>
        ${itemList(groups[key], titleField)}
      </section>`,
    )
    .join("");
}

function issueList(issues) {
  if (!issues.length) return '<p class="empty">No issues</p>';
  return `<ul>${issues
    .map(
      (issue) =>
        `<li><strong>${escapeHtml(issue.fileName)}</strong><span>${escapeHtml(
          issue.message,
        )}</span></li>`,
    )
    .join("")}</ul>`;
}

function submissionList(items, talkBySlug, opportunityBySlug) {
  if (!items.length) return '<p class="empty">None</p>';
  return `<ul>${items
    .map((submission) => {
      const talk = talkBySlug.get(submission.data.talk);
      const opportunity = opportunityBySlug.get(submission.data.opportunity);
      return `<li>
        <strong>${escapeHtml(talk?.data.title || submission.data.talk)}</strong>
        <span>${escapeHtml(
          opportunity?.data.name || submission.data.opportunity,
        )} &middot; ${escapeHtml(submission.data.status)}</span>
        <code>${escapeHtml(submission.effectiveSlug)}</code>
      </li>`;
    })
    .join("")}</ul>`;
}

function submissionGroups(groups, talkBySlug, opportunityBySlug, labelMap) {
  return Object.keys(groups)
    .sort()
    .map(
      (key) => `<section class="group">
        <h3>${escapeHtml(labelMap.get(key) || key)} <span>${groups[key].length}</span></h3>
        ${submissionList(groups[key], talkBySlug, opportunityBySlug)}
      </section>`,
    )
    .join("");
}

const report = validateContent();
const drafts = report.articles.filter((article) => articleStatus(article) === "draft");
const published = report.articles.filter(
  (article) => articleStatus(article) === "published",
);
const privateTalks = report.talks.filter((talk) => !isPublicShowcaseTalk(talk));
const showcasedTalks = report.talks.filter(isPublicShowcaseTalk);
const upcomingDeadlines = report.opportunities
  .filter(
    (opportunity) =>
      opportunity.data.deadline && opportunity.data.status === "interesting",
  )
  .sort((a, b) =>
    String(a.data.deadline).localeCompare(String(b.data.deadline)),
  );
const acceptedOrDelivered = report.submissions.filter((submission) =>
  ["accepted", "delivered"].includes(submission.data.status),
);
const talkBySlug = new Map(
  report.talks.map((talk) => [talk.effectiveSlug, talk]),
);
const opportunityBySlug = new Map(
  report.opportunities.map((opportunity) => [
    opportunity.effectiveSlug,
    opportunity,
  ]),
);
const talkLabels = new Map(
  report.talks.map((talk) => [talk.effectiveSlug, talk.data.title]),
);
const opportunityLabels = new Map(
  report.opportunities.map((opportunity) => [
    opportunity.effectiveSlug,
    opportunity.data.name,
  ]),
);
const outputDirectory = path.join(process.cwd(), ".content-dashboard");
const outputPath = path.join(outputDirectory, "index.html");

const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Content dashboard</title>
  <style>
    :root { color-scheme: light; font-family: Inter, system-ui, sans-serif; background: #f8f6f1; color: #292524; }
    body { margin: 0; }
    main { width: min(1180px, calc(100% - 2rem)); margin: 0 auto; padding: 3rem 0 5rem; }
    h1 { font-size: clamp(2rem, 5vw, 4rem); margin: 0; }
    h2 { font-size: 1.2rem; margin: 0 0 1rem; }
    h3 { display: flex; justify-content: space-between; text-transform: capitalize; font-size: .95rem; }
    p { color: #57534e; }
    .health { display: inline-flex; padding: .35rem .7rem; border-radius: 999px; font-weight: 700; background: ${report.errors.length ? "#fee2e2" : "#dcfce7"}; color: ${report.errors.length ? "#991b1b" : "#166534"}; }
    .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 1rem; margin: 2rem 0; }
    .metric, .panel { border: 1px solid #d6d3d1; border-radius: 14px; background: rgba(255,255,255,.7); padding: 1.25rem; }
    .metric strong { display: block; font-size: 2rem; }
    .metric span, code { color: #78716c; font-size: .8rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem; margin-top: 1rem; align-items: start; }
    ul { list-style: none; padding: 0; margin: 0; display: grid; gap: .65rem; }
    li { display: grid; gap: .2rem; padding-top: .65rem; border-top: 1px solid #e7e5e4; }
    li:first-child { border-top: 0; padding-top: 0; }
    code { overflow-wrap: anywhere; }
    .group + .group { margin-top: 1.5rem; }
    .group h3 span { font-variant-numeric: tabular-nums; color: #a16207; }
    .empty { font-style: italic; }
    .private { border-color: #f59e0b; }
    .note { margin-top: 2rem; font-size: .9rem; }
  </style>
</head>
<body>
<main>
  <span class="health">${report.errors.length ? `${report.errors.length} validation error(s)` : "Content checks pass"}</span>
  <h1>Content dashboard</h1>
  <p>Generated locally from Markdown on ${escapeHtml(new Date().toLocaleString())}. This file is excluded from the public build.</p>

  <div class="metrics">
    <div class="metric"><strong>${drafts.length}</strong><span>draft articles</span></div>
    <div class="metric"><strong>${published.length}</strong><span>published articles</span></div>
    <div class="metric"><strong>${privateTalks.length}</strong><span>private or unshowcased talks</span></div>
    <div class="metric"><strong>${showcasedTalks.length}</strong><span>public showcased talks</span></div>
    <div class="metric"><strong>${report.opportunities.length}</strong><span>speaking opportunities</span></div>
    <div class="metric"><strong>${report.submissions.length}</strong><span>submissions</span></div>
    <div class="metric"><strong>${report.warnings.length}</strong><span>content warnings</span></div>
  </div>

  <div class="grid">
    <div class="panel"><h2>Articles by status</h2>${groupedSections(
      groupBy(report.articles, articleStatus),
      "title",
    )}</div>
    <div class="panel private"><h2>Talks by status</h2>${groupedSections(
      groupBy(report.talks, (talk) => talk.data.status),
      "title",
    )}</div>
    <div class="panel private"><h2>Opportunities by status</h2>${groupedSections(
      groupBy(report.opportunities, (opportunity) => opportunity.data.status),
      "name",
    )}</div>
    <div class="panel private"><h2>Upcoming CFP deadlines</h2>${itemList(
      upcomingDeadlines,
      "name",
    )}</div>
    <div class="panel private"><h2>Submissions by talk</h2>${submissionGroups(
      groupBy(report.submissions, (submission) => submission.data.talk),
      talkBySlug,
      opportunityBySlug,
      talkLabels,
    )}</div>
    <div class="panel private"><h2>Submissions by opportunity</h2>${submissionGroups(
      groupBy(report.submissions, (submission) => submission.data.opportunity),
      talkBySlug,
      opportunityBySlug,
      opportunityLabels,
    )}</div>
    <div class="panel private"><h2>Accepted or delivered</h2>${submissionList(
      acceptedOrDelivered,
      talkBySlug,
      opportunityBySlug,
    )}</div>
    <div class="panel"><h2>Validation errors</h2>${issueList(report.errors)}</div>
    <div class="panel"><h2>Warnings and missing metadata</h2>${issueList(
      report.warnings,
    )}</div>
  </div>
  <p class="note">Privacy rule: only talks with <code>visibility: public</code> and <code>showcase: true</code> enter Eleventy public data. Opportunities and submissions never enter the public build.</p>
</main>
</body>
</html>`;

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(outputPath, html, "utf8");
console.log(`Generated private dashboard: ${path.relative(process.cwd(), outputPath)}`);
