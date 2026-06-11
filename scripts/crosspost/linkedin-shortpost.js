'use strict';

const LINKEDIN_MAX_SHORTPOST_LENGTH = 3000;
const DEFAULT_OPENAI_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_OPENAI_MODEL = 'gpt-4o-mini';

function toPlainText(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/`[^`]*`/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/^#+\s+/gm, '')
    .replace(/[*_~>#-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncateLinkedInShortpost(text, maxLength = LINKEDIN_MAX_SHORTPOST_LENGTH) {
  const normalized = String(text || '').trim();
  if (normalized.length <= maxLength) {
    return { text: normalized, truncated: false };
  }

  const ellipsis = '...';
  const cutoff = Math.max(0, maxLength - ellipsis.length);
  const sliced = normalized.slice(0, cutoff);
  const lastSpace = sliced.lastIndexOf(' ');
  const body = lastSpace > Math.floor(cutoff * 0.6) ? sliced.slice(0, lastSpace) : sliced;

  return {
    text: `${body.trim()}${ellipsis}`,
    truncated: true,
  };
}

function buildDeterministicShortpost(article) {
  const title = String(article && article.title ? article.title : '').trim();
  const articleId = String(article && article.articleId ? article.articleId : 'unknown-article').trim();
  const teaserSource = toPlainText(article && article.bodyMarkdown ? article.bodyMarkdown : '');
  const teaser = teaserSource ? teaserSource.slice(0, 280).trim() : 'New article published.';

  const baseText = [
    `New post: ${title || articleId}`,
    teaser,
    '#Engineering #Platform #DevEx',
  ]
    .filter(Boolean)
    .join('\n\n');

  const constrained = truncateLinkedInShortpost(baseText);

  return {
    text: constrained.text,
    truncated: constrained.truncated,
    provider: 'deterministic-safe-mode',
    model: 'local-template-v1',
    generatedAt: new Date().toISOString(),
  };
}

async function generateLinkedInShortpost({ article, dryRun }) {
  const safeMode = process.env.CROSSPOST_LINKEDIN_SAFE_MODE !== 'false';

  if (!article || typeof article !== 'object') {
    throw new Error('invalid_article_payload');
  }

  if (dryRun || safeMode) {
    return buildDeterministicShortpost(article);
  }

  const apiKey = process.env.AI_PROVIDER_API_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('missing_ai_provider_api_key');
  }

  const baseUrl = process.env.AI_PROVIDER_BASE_URL || process.env.OPENAI_BASE_URL || DEFAULT_OPENAI_BASE_URL;
  const model = process.env.AI_PROVIDER_MODEL || process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL;

  const title = String(article.title || article.articleId || 'New article').trim();
  const bodyPlainText = toPlainText(article.bodyMarkdown || '');
  const sourceUrl = process.env.CROSSPOST_SOURCE_URL || '';

  const requestPayload = {
    model,
    temperature: 0.6,
    messages: [
      {
        role: 'system',
        content:
          'You write concise, professional LinkedIn posts for technical audiences. Keep it clear and practical, avoid hype, and include a strong call to read the full article.',
      },
      {
        role: 'user',
        content: [
          `Create a short LinkedIn post (max ${LINKEDIN_MAX_SHORTPOST_LENGTH} characters).`,
          `Article title: ${title}`,
          `Article summary/body:\n${bodyPlainText.slice(0, 6000)}`,
          sourceUrl ? `Include this URL naturally: ${sourceUrl}` : 'No URL is required if none is available.',
          'Tone: practical, senior engineer to peers. Include 2-4 relevant hashtags.',
        ].join('\n\n'),
      },
    ],
  };

  const response = await fetch(`${baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(requestPayload),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const providerMessage =
      payload && payload.error && payload.error.message ? payload.error.message : `http_${response.status}`;
    throw new Error(`ai_provider_error:${providerMessage}`);
  }

  const generated =
    payload && payload.choices && payload.choices[0] && payload.choices[0].message
      ? String(payload.choices[0].message.content || '').trim()
      : '';

  if (!generated) {
    throw new Error('ai_provider_empty_response');
  }

  const constrained = truncateLinkedInShortpost(generated);

  return {
    text: constrained.text,
    truncated: constrained.truncated,
    provider: 'openai-compatible',
    model,
    generatedAt: new Date().toISOString(),
  };
}

module.exports = {
  LINKEDIN_MAX_SHORTPOST_LENGTH,
  toPlainText,
  truncateLinkedInShortpost,
  buildDeterministicShortpost,
  generateLinkedInShortpost,
};
