'use strict';

const { publishToMedium } = require('./medium-publisher');
const { publishToLinkedIn } = require('./linkedin-publisher');

const SUPPORTED_PLATFORMS = ['medium', 'linkedin'];
const DEFAULT_MEDIUM_TAG = 'crosspost-medium';

function normalizeTag(tag) {
  return String(tag || '')
    .trim()
    .toLowerCase();
}

function getRequiredMediumTag() {
  return normalizeTag(process.env.CROSSPOST_MEDIUM_TAG || DEFAULT_MEDIUM_TAG);
}

function isTaggedForMedium(article) {
  const requiredTag = getRequiredMediumTag();
  return article.tags.some((tag) => normalizeTag(tag) === requiredTag);
}

function normalizePlatforms(platforms) {
  const source = platforms && platforms.length ? platforms : [];
  const normalized = [...new Set(source.map((name) => String(name || '').trim().toLowerCase()).filter(Boolean))];

  const unknown = normalized.filter((name) => !SUPPORTED_PLATFORMS.includes(name));
  if (unknown.length) {
    throw new Error(`Unsupported platform(s): ${unknown.join(', ')}`);
  }

  return normalized;
}

function getPlatformTargets(platforms) {
  const normalized = normalizePlatforms(platforms);

  return normalized.map((name) => {
    if (name === 'medium') {
      return {
        name,
        getEligibility: (article) => {
          if (article.originalUrl) {
            return { eligible: false, reason: 'medium_original_url_present' };
          }

          if (!isTaggedForMedium(article)) {
            return {
              eligible: false,
              reason: `missing_medium_tag:${getRequiredMediumTag()}`,
            };
          }

          return { eligible: true, reason: null };
        },
        publish: ({ article, releaseId, dryRun }) => publishToMedium({ article, releaseId, dryRun }),
      };
    }

    return {
      name,
      getEligibility: () => ({ eligible: true, reason: null }),
      publish: ({ article, shortpost, releaseId, dryRun }) =>
        publishToLinkedIn({ article, shortpost, releaseId, dryRun }),
    };
  });
}

module.exports = {
  SUPPORTED_PLATFORMS,
  DEFAULT_MEDIUM_TAG,
  normalizePlatforms,
  getPlatformTargets,
};
