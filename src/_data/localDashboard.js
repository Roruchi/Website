const { articleStatus, isPublicShowcaseTalk } = require("../../scripts/content-store");

function groupItems(
  items,
  getKey,
  getLabel,
  getSlug = (item) => item.effectiveSlug,
  getHref = () => "",
  isExternal = () => false,
) {
  const groups = new Map();

  for (const item of items) {
    const key = getKey(item) || "unknown";
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push({
      external: isExternal(item),
      href: getHref(item),
      label: getLabel(item),
      slug: getSlug(item),
    });
  }

  return [...groups.entries()]
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, groupedItems]) => ({ items: groupedItems, name }));
}

module.exports = function localDashboard() {
  if (process.env.LOCAL_DASHBOARD !== "true") {
    return { enabled: false };
  }

  const { validateContent } = require("../../scripts/content-validation");
  const report = validateContent();
  const talkBySlug = new Map(
    report.talks.map((talk) => [talk.effectiveSlug, talk]),
  );
  const opportunityBySlug = new Map(
    report.opportunities.map((opportunity) => [
      opportunity.effectiveSlug,
      opportunity,
    ]),
  );
  const submissions = report.submissions.map((submission) => ({
    opportunity:
      opportunityBySlug.get(submission.data.opportunity)?.data.name ||
      submission.data.opportunity,
    opportunityHref:
      opportunityBySlug.get(submission.data.opportunity)?.data.cfpUrl ||
      opportunityBySlug.get(submission.data.opportunity)?.data.url ||
      "",
    opportunitySlug: submission.data.opportunity,
    slug: submission.effectiveSlug,
    status: submission.data.status,
    talk:
      talkBySlug.get(submission.data.talk)?.data.title || submission.data.talk,
    talkHref:
      talkBySlug.has(submission.data.talk) &&
      isPublicShowcaseTalk(talkBySlug.get(submission.data.talk))
        ? `/talks/${submission.data.talk}/`
        : "",
    talkSlug: submission.data.talk,
  }));

  return {
    acceptedOrDelivered: submissions.filter((submission) =>
      ["accepted", "delivered"].includes(submission.status),
    ),
    articleGroups: groupItems(
      report.articles,
      articleStatus,
      (article) => article.data.title,
      (article) => article.effectiveSlug,
      (article) =>
        articleStatus(article) === "published"
          ? `/blog/${article.effectiveSlug}/`
          : "",
    ),
    enabled: true,
    errors: report.errors,
    generatedAt: new Date().toLocaleString(),
    metrics: {
      draftArticles: report.articles.filter(
        (article) => articleStatus(article) === "draft",
      ).length,
      opportunities: report.opportunities.length,
      privateTalks: report.talks.filter(
        (talk) => !isPublicShowcaseTalk(talk),
      ).length,
      publishedArticles: report.articles.filter(
        (article) => articleStatus(article) === "published",
      ).length,
      showcasedTalks: report.talks.filter(isPublicShowcaseTalk).length,
      submissions: report.submissions.length,
      warnings: report.warnings.length,
    },
    opportunityGroups: groupItems(
      report.opportunities,
      (opportunity) => opportunity.data.status,
      (opportunity) => opportunity.data.name,
      (opportunity) => opportunity.effectiveSlug,
      (opportunity) => opportunity.data.cfpUrl || opportunity.data.url || "",
      () => true,
    ),
    submissionsByOpportunity: groupItems(
      submissions,
      (submission) => submission.opportunity,
      (submission) => `${submission.talk} (${submission.status})`,
      (submission) => submission.slug,
      (submission) => submission.talkHref,
    ),
    submissionsByTalk: groupItems(
      submissions,
      (submission) => submission.talk,
      (submission) => `${submission.opportunity} (${submission.status})`,
      (submission) => submission.slug,
      (submission) => submission.opportunityHref,
      () => true,
    ),
    talkGroups: groupItems(
      report.talks,
      (talk) => talk.data.status,
      (talk) => talk.data.title,
      (talk) => talk.effectiveSlug,
      (talk) =>
        isPublicShowcaseTalk(talk) ? `/talks/${talk.effectiveSlug}/` : "",
    ),
    upcomingDeadlines: report.opportunities
      .filter(
        (opportunity) =>
          opportunity.data.deadline &&
          opportunity.data.status === "interesting",
      )
      .sort((left, right) =>
        String(left.data.deadline).localeCompare(String(right.data.deadline)),
      )
      .map((opportunity) => ({
        deadline: opportunity.data.deadline,
        href: opportunity.data.cfpUrl || opportunity.data.url || "",
        name: opportunity.data.name,
        slug: opportunity.effectiveSlug,
      })),
    warnings: report.warnings,
  };
};
