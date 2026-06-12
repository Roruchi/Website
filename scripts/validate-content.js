const { validateContent } = require("./content-validation");

function printIssues(label, issues, method) {
  if (!issues.length) {
    return;
  }
  method(`${label}:`);
  for (const issue of issues) {
    method(`- ${issue.fileName}: ${issue.message}`);
  }
}

const report = validateContent();
printIssues("Content warnings", report.warnings, console.log);
printIssues("Content validation failed", report.errors, console.error);

if (report.errors.length) {
  process.exit(1);
}

console.log(
  `Validated ${report.articles.length} article(s), ${report.talks.length} talk(s), ${report.opportunities.length} opportunity file(s), and ${report.submissions.length} submission file(s).`,
);
