'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function parseScalar(value) {
  const withoutInlineComment = value.split(' #')[0].trim();
  if (withoutInlineComment === 'true') {
    return true;
  }
  if (withoutInlineComment === 'false') {
    return false;
  }
  if (/^\d{4}-\d{2}-\d{2}$/.test(withoutInlineComment)) {
    return withoutInlineComment;
  }
  if (
    (withoutInlineComment.startsWith('"') && withoutInlineComment.endsWith('"')) ||
    (withoutInlineComment.startsWith("'") && withoutInlineComment.endsWith("'"))
  ) {
    return withoutInlineComment.slice(1, -1);
  }
  return withoutInlineComment;
}

function parseFrontmatterAttributes(frontmatterText) {
  const attributes = {};
  let currentArrayKey = null;

  for (const rawLine of frontmatterText.split(/\r?\n/)) {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      continue;
    }

    const arrayItemMatch = line.match(/^\s*-\s+(.+)$/);
    if (arrayItemMatch && currentArrayKey) {
      attributes[currentArrayKey].push(parseScalar(arrayItemMatch[1]));
      continue;
    }

    currentArrayKey = null;
    const kvMatch = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kvMatch) {
      continue;
    }

    const key = kvMatch[1];
    const value = kvMatch[2];

    if (!value) {
      attributes[key] = [];
      currentArrayKey = key;
      continue;
    }

    attributes[key] = parseScalar(value);
  }

  return attributes;
}

function splitFrontmatter(markdownText) {
  if (!markdownText.startsWith('---\n') && !markdownText.startsWith('---\r\n')) {
    return { attributes: null, body: markdownText, hasFrontmatter: false };
  }

  const match = markdownText.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { attributes: null, body: markdownText, hasFrontmatter: false };
  }

  return {
    attributes: parseFrontmatterAttributes(match[1]),
    body: match[2],
    hasFrontmatter: true,
  };
}

function toArticleId(filePath) {
  const name = path.basename(filePath, path.extname(filePath));
  return name.replace(/^\d{4}-\d{2}-\d{2}-/, '');
}

function evaluateEligibility(attributes, hasFrontmatter) {
  if (!hasFrontmatter) {
    return { eligible: false, reason: 'missing_frontmatter' };
  }

  if (attributes.draft === true || attributes.status === 'draft') {
    return { eligible: false, reason: 'draft_true' };
  }

  return { eligible: true, reason: null };
}

function extractArticleFromContent(filePath, markdownText) {
  const { attributes, body, hasFrontmatter } = splitFrontmatter(markdownText);
  const frontmatter = attributes || {};
  const articleId = toArticleId(filePath);
  const title = typeof frontmatter.title === 'string' ? frontmatter.title.trim() : '';
  const date = typeof frontmatter.date === 'string' ? frontmatter.date : null;
  const tags = Array.isArray(frontmatter.tags)
    ? frontmatter.tags.map((tag) => String(tag).trim()).filter(Boolean)
    : [];

  const eligibility = evaluateEligibility(frontmatter, hasFrontmatter);

  return {
    articleId,
    sourcePath: filePath,
    title,
    date,
    description: typeof frontmatter.description === 'string' ? frontmatter.description.trim() : '',
    bodyMarkdown: body,
    draft: frontmatter.draft === true || frontmatter.status === 'draft',
    tags,
    originalUrl: typeof frontmatter.originalUrl === 'string' ? frontmatter.originalUrl.trim() : '',
    cover: typeof frontmatter.cover === 'string' ? frontmatter.cover.trim() : '',
    eligible: eligibility.eligible,
    skipReason: eligibility.reason,
    parseError: title ? null : 'missing_title',
  };
}

async function extractArticleFromFile(filePath) {
  const markdownText = await fs.readFile(filePath, 'utf8');
  return extractArticleFromContent(filePath, markdownText);
}

module.exports = {
  extractArticleFromContent,
  extractArticleFromFile,
  splitFrontmatter,
};
