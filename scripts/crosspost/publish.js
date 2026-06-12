'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const { extractArticleFromFile } = require('./extract-article');
const {
  loadLedger,
  writeLedger,
  hasBlockingAttempt,
  buildAttemptRecord,
  recordAttempt,
} = require('./ledger');
const { buildRunSummary, printRunSummary } = require('./summary');
const { getPlatformTargets } = require('./platform-targets');
const { generateLinkedInShortpost } = require('./linkedin-shortpost');

const DEFAULT_SOURCE = 'src/blog/*.md';
const DEFAULT_LEDGER_PATH = path.resolve(process.cwd(), '.github/crosspost-ledger.json');
const BLOCKING_STATUSES = ['success', 'prepared'];

function parseArgs(argv) {
  const options = {
    source: DEFAULT_SOURCE,
    platforms: [],
    releaseId: process.env.GITHUB_RUN_ID || `local-${Date.now()}`,
    dryRun: false,
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];

    if (arg === '--source') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) {
        throw new Error('Missing value for --source');
      }
      options.source = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--platform') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) {
        throw new Error('Missing value for --platform');
      }
      options.platforms.push(argv[i + 1]);
      i += 1;
      continue;
    }

    if (arg === '--release-id') {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) {
        throw new Error('Missing value for --release-id');
      }
      options.releaseId = argv[i + 1];
      i += 1;
      continue;
    }

    if (arg === '--dry-run') {
      options.dryRun = true;
      continue;
    }

    throw new Error(`Unknown argument: ${arg}`);
  }

  if (!options.source) {
    throw new Error('Missing required --source value');
  }

  if (!options.releaseId) {
    throw new Error('Missing required --release-id value');
  }

  return options;
}

function validateExecutionContext(options) {
  if (options.dryRun) {
    return;
  }

  const manualAllowed = process.env.CROSSPOST_ALLOW_MANUAL === 'true';
  const postDeployContext = process.env.CROSSPOST_POST_DEPLOY === 'true';

  if (!postDeployContext && !manualAllowed) {
    throw new Error(
      'Non-dry-run execution is restricted to post-deploy context. Set CROSSPOST_POST_DEPLOY=true in CI or CROSSPOST_ALLOW_MANUAL=true for manual override.'
    );
  }
}

async function resolveSourceFiles(source) {
  if (!source.includes('*')) {
    return [path.resolve(process.cwd(), source)];
  }

  const normalized = source.replace(/\\/g, '/');
  const starIndex = normalized.indexOf('*');
  const slashBeforeStar = normalized.lastIndexOf('/', starIndex);
  const dirPart = slashBeforeStar > -1 ? normalized.slice(0, slashBeforeStar) : '.';
  const patternPart = normalized.slice(slashBeforeStar + 1);

  const extension = path.extname(patternPart).toLowerCase();
  const directory = path.resolve(process.cwd(), dirPart);
  const entries = await fs.readdir(directory, { withFileTypes: true });

  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(directory, entry.name))
    .filter((absolutePath) => {
      if (!extension) {
        return true;
      }
      return path.extname(absolutePath).toLowerCase() === extension;
    })
    .sort((a, b) => a.localeCompare(b));
}

async function discoverArticles(source) {
  const files = await resolveSourceFiles(source);
  const parsed = await Promise.all(files.map((file) => extractArticleFromFile(file)));

  return {
    evaluated: parsed,
    eligible: parsed.filter((article) => article.eligible && !article.parseError),
  };
}

async function runCrosspost(options) {
  validateExecutionContext(options);

  const startedAt = new Date().toISOString();
  const ledger = options.dryRun ? null : await loadLedger(DEFAULT_LEDGER_PATH);
  const targets = getPlatformTargets(options.platforms);
  const { evaluated, eligible } = await discoverArticles(options.source);

  if (!targets.length) {
    const summary = buildRunSummary({
      releaseId: options.releaseId,
      startedAt,
      completedAt: new Date().toISOString(),
      articlesEvaluated: evaluated.length,
      articlesEligible: eligible.length,
      results: [],
    });
    printRunSummary(summary);
    console.log(JSON.stringify(summary));
    return summary;
  }
  const results = [];

  for (const article of evaluated) {
    if (!article.eligible || article.parseError) {
      for (const target of targets) {
        results.push({
          articleId: article.articleId,
          platform: target.name,
          status: 'skipped',
          externalPostId: null,
          reason: article.parseError || article.skipReason || 'ineligible_article',
        });
      }
      continue;
    }

    for (const target of targets) {
      const targetEligibility =
        typeof target.getEligibility === 'function'
          ? target.getEligibility(article)
          : { eligible: true, reason: null };

      if (!targetEligibility.eligible) {
        results.push({
          articleId: article.articleId,
          platform: target.name,
          status: 'skipped',
          externalPostId: null,
          reason: targetEligibility.reason || 'target_ineligible',
        });
        continue;
      }

      if (
        ledger &&
        hasBlockingAttempt(ledger, article.articleId, target.name, BLOCKING_STATUSES)
      ) {
        const duplicateResult = {
          articleId: article.articleId,
          platform: target.name,
          status: 'duplicate_blocked',
          externalPostId: null,
          reason: 'article_platform_already_processed',
        };
        results.push(duplicateResult);

        recordAttempt(
          ledger,
          buildAttemptRecord({
            releaseId: options.releaseId,
            articleId: article.articleId,
            platform: target.name,
            status: duplicateResult.status,
            reason: duplicateResult.reason,
            externalPostId: null,
            startedAt,
            completedAt: new Date().toISOString(),
          })
        );
        continue;
      }

      const attemptStartedAt = new Date().toISOString();
      try {
        let shortpost = null;
        if (target.name === 'linkedin') {
          try {
            shortpost = await generateLinkedInShortpost({
              article,
              releaseId: options.releaseId,
              dryRun: options.dryRun,
            });
          } catch (error) {
            const generationFailureReason =
              error && error.message
                ? `linkedin_shortpost_generation_failed:${error.message}`
                : 'linkedin_shortpost_generation_failed';

            const result = {
              articleId: article.articleId,
              platform: target.name,
              status: 'skipped',
              externalPostId: null,
              reason: generationFailureReason,
            };

            results.push(result);

            if (ledger) {
              recordAttempt(
                ledger,
                buildAttemptRecord({
                  releaseId: options.releaseId,
                  articleId: article.articleId,
                  platform: target.name,
                  status: result.status,
                  reason: result.reason,
                  externalPostId: null,
                  startedAt: attemptStartedAt,
                  completedAt: new Date().toISOString(),
                })
              );
            }

            continue;
          }
        }

        const outcome = await target.publish({
          article,
          shortpost,
          releaseId: options.releaseId,
          dryRun: options.dryRun,
        });

        const result = {
          articleId: article.articleId,
          platform: target.name,
          status: outcome.status || 'failed',
          externalPostId: outcome.externalPostId || null,
          reason: outcome.reason || null,
        };

        results.push(result);

        if (ledger) {
          recordAttempt(
            ledger,
            buildAttemptRecord({
              releaseId: options.releaseId,
              articleId: article.articleId,
              platform: target.name,
              status: result.status,
              reason: result.reason,
              externalPostId: result.externalPostId,
              startedAt: attemptStartedAt,
              completedAt: new Date().toISOString(),
            })
          );
        }
      } catch (error) {
        const result = {
          articleId: article.articleId,
          platform: target.name,
          status: 'failed',
          externalPostId: null,
          reason: error && error.message ? error.message : 'publish_exception',
        };

        results.push(result);

        if (ledger) {
          recordAttempt(
            ledger,
            buildAttemptRecord({
              releaseId: options.releaseId,
              articleId: article.articleId,
              platform: target.name,
              status: result.status,
              reason: result.reason,
              externalPostId: null,
              startedAt: attemptStartedAt,
              completedAt: new Date().toISOString(),
            })
          );
        }
      }
    }
  }

  if (ledger) {
    await writeLedger(DEFAULT_LEDGER_PATH, ledger);
  }

  const summary = buildRunSummary({
    releaseId: options.releaseId,
    startedAt,
    completedAt: new Date().toISOString(),
    articlesEvaluated: evaluated.length,
    articlesEligible: eligible.length,
    results,
  });

  printRunSummary(summary);
  console.log(JSON.stringify(summary));

  return summary;
}

async function main() {
  try {
    const options = parseArgs(process.argv.slice(2));
    const summary = await runCrosspost(options);

    if (summary.overallStatus === 'failed') {
      process.exitCode = 1;
    } else {
      process.exitCode = 0;
    }
  } catch (error) {
    console.error(`Crosspost failed: ${error.message}`);
    process.exitCode = 1;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  parseArgs,
  validateExecutionContext,
  resolveSourceFiles,
  discoverArticles,
  runCrosspost,
};
