'use strict';

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

function resolveLinkedInAuthorUrn() {
  const authorUrn = process.env.LINKEDIN_AUTHOR_URN || process.env.LINKEDIN_PERSON_URN || '';
  if (!authorUrn.trim()) {
    return null;
  }
  return authorUrn.trim();
}

function buildLinkedInPostPayload(authorUrn, text) {
  return {
    author: authorUrn,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: {
          text,
        },
        shareMediaCategory: 'NONE',
      },
    },
    visibility: {
      'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
    },
  };
}

async function publishLinkedInPost(token, payload) {
  const response = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(payload),
  });

  let body = null;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    const errorMessage =
      body && body.message ? body.message : body && body.serviceErrorCode ? String(body.serviceErrorCode) : `http_${response.status}`;
    throw new Error(`linkedin_api_error:${errorMessage}`);
  }

  // LinkedIn commonly returns URN/id in x-restli-id header for create.
  const restliId = response.headers.get('x-restli-id');
  const idFromBody = body && (body.id || body.urn) ? body.id || body.urn : null;
  return restliId || idFromBody || null;
}

async function publishToLinkedIn({ article, shortpost, releaseId, dryRun }) {
  if (!shortpost || !shortpost.text) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: 'missing_linkedin_shortpost',
    };
  }

  if (dryRun) {
    return {
      status: 'success',
      externalPostId: `dry-run:linkedin:${releaseId}:${article.articleId}`,
      reason: null,
    };
  }

  const safeMode = process.env.CROSSPOST_LINKEDIN_SAFE_MODE !== 'false';
  if (safeMode) {
    return {
      status: 'success',
      externalPostId: `simulated:linkedin:${releaseId}:${article.articleId}`,
      reason: 'linkedin_safe_mode_simulated',
    };
  }

  if (!process.env.LINKEDIN_ACCESS_TOKEN) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: 'missing_linkedin_access_token',
    };
  }

  const authorUrn = resolveLinkedInAuthorUrn();
  if (!authorUrn) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: 'missing_linkedin_author_urn',
    };
  }

  try {
    const payload = buildLinkedInPostPayload(authorUrn, shortpost.text);
    const postId = await publishLinkedInPost(process.env.LINKEDIN_ACCESS_TOKEN, payload);

    return {
      status: 'success',
      externalPostId: postId || `linkedin:${releaseId}:${article.articleId}`,
      reason: null,
    };
  } catch (error) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: error && error.message ? error.message : 'linkedin_publish_failed',
    };
  }
}

module.exports = {
  publishToLinkedIn,
};
