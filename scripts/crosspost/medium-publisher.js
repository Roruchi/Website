'use strict';

const MEDIUM_API_BASE = 'https://api.medium.com/v1';

function toMediumPayload(article) {
  const title = String(article && article.title ? article.title : article.articleId || 'Untitled').trim();
  const content = String(article && article.bodyMarkdown ? article.bodyMarkdown : '').trim();
  const publishStatus = process.env.MEDIUM_PUBLISH_STATUS || 'public';

  return {
    title,
    contentFormat: 'markdown',
    content,
    publishStatus,
  };
}

async function mediumRequest(token, url, init) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(init && init.headers ? init.headers : {}),
    },
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const mediumError =
      payload && payload.errors && payload.errors[0] && payload.errors[0].message
        ? payload.errors[0].message
        : `http_${response.status}`;
    throw new Error(`medium_api_error:${mediumError}`);
  }

  return payload;
}

async function resolveMediumUserId(token) {
  const mePayload = await mediumRequest(token, `${MEDIUM_API_BASE}/me`, { method: 'GET' });
  const userId = mePayload && mePayload.data && mePayload.data.id ? mePayload.data.id : null;
  if (!userId) {
    throw new Error('medium_user_id_missing');
  }
  return userId;
}

async function publishToMedium({ article, releaseId, dryRun }) {
  if (dryRun) {
    return {
      status: 'success',
      externalPostId: `dry-run:medium:${releaseId}:${article.articleId}`,
      reason: null,
    };
  }

  if (!process.env.MEDIUM_TOKEN) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: 'missing_medium_token',
    };
  }

  try {
    const token = process.env.MEDIUM_TOKEN;
    const userId = await resolveMediumUserId(token);
    const payload = toMediumPayload(article);

    const postPayload = await mediumRequest(token, `${MEDIUM_API_BASE}/users/${encodeURIComponent(userId)}/posts`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    const postId = postPayload && postPayload.data && postPayload.data.id ? postPayload.data.id : null;

    return {
      status: 'success',
      externalPostId: postId || `medium:${releaseId}:${article.articleId}`,
      reason: null,
    };
  } catch (error) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: error && error.message ? error.message : 'medium_publish_failed',
    };
  }
}

module.exports = {
  publishToMedium,
};
