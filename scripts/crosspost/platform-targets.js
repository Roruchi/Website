'use strict';

const { publishToMedium } = require('./medium-publisher');
const { publishToLinkedIn } = require('./linkedin-publisher');

const SUPPORTED_PLATFORMS = ['medium', 'linkedin'];

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
        publish: ({ article, releaseId, dryRun }) => publishToMedium({ article, releaseId, dryRun }),
      };
    }

    return {
      name,
      publish: ({ article, shortpost, releaseId, dryRun }) =>
        publishToLinkedIn({ article, shortpost, releaseId, dryRun }),
    };
  });
}

module.exports = {
  SUPPORTED_PLATFORMS,
  normalizePlatforms,
  getPlatformTargets,
};
