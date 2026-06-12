'use strict';

function buildTotals(results, articlesEvaluated, articlesEligible) {
  const totals = {
    articlesEvaluated,
    articlesEligible,
    attempted: results.length,
    succeeded: 0,
    prepared: 0,
    failed: 0,
    skipped: 0,
    duplicateBlocked: 0,
  };

  for (const result of results) {
    if (result.status === 'success') {
      totals.succeeded += 1;
    } else if (result.status === 'prepared') {
      totals.prepared += 1;
    } else if (result.status === 'failed') {
      totals.failed += 1;
    } else if (result.status === 'duplicate_blocked') {
      totals.duplicateBlocked += 1;
    } else {
      totals.skipped += 1;
    }
  }

  return totals;
}

function determineOverallStatus(totals) {
  if (totals.articlesEligible === 0) {
    return 'no_eligible_posts';
  }
  if (totals.failed > 0 && totals.succeeded + totals.prepared > 0) {
    return 'partial_success';
  }
  if (totals.failed > 0 && totals.succeeded + totals.prepared === 0) {
    return 'failed';
  }
  return 'success';
}

function buildRunSummary({ releaseId, startedAt, completedAt, articlesEvaluated, articlesEligible, results }) {
  const totals = buildTotals(results, articlesEvaluated, articlesEligible);
  return {
    releaseId,
    overallStatus: determineOverallStatus(totals),
    startedAt,
    completedAt,
    totals,
    results,
  };
}

function printRunSummary(summary) {
  console.log(`Crosspost release: ${summary.releaseId}`);
  console.log(`Overall status: ${summary.overallStatus}`);
  console.log(
    `Totals: evaluated=${summary.totals.articlesEvaluated}, eligible=${summary.totals.articlesEligible}, succeeded=${summary.totals.succeeded}, prepared=${summary.totals.prepared}, failed=${summary.totals.failed}, skipped=${summary.totals.skipped}, duplicateBlocked=${summary.totals.duplicateBlocked}`
  );

  for (const result of summary.results) {
    const suffix = result.reason ? ` (${result.reason})` : '';
    console.log(`[${result.platform}] ${result.articleId}: ${result.status}${suffix}`);
  }
}

module.exports = {
  buildRunSummary,
  printRunSummary,
};
