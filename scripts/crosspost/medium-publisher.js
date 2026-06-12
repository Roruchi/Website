'use strict';

const fs = require('node:fs/promises');

const DEFAULT_MEDIUM_COMPOSE_URL = 'https://medium.com/new-story';

function getMediumComposeUrl() {
  const composeUrl = String(process.env.MEDIUM_COMPOSE_URL || DEFAULT_MEDIUM_COMPOSE_URL).trim();
  return composeUrl || DEFAULT_MEDIUM_COMPOSE_URL;
}

function getMediumDraftWaitMs() {
  const value = Number.parseInt(process.env.MEDIUM_DRAFT_WAIT_MS || '10000', 10);
  return Number.isFinite(value) && value > 0 ? value : 10000;
}

function detectHeadlessMode() {
  if (process.env.MEDIUM_HEADLESS === 'false') {
    return false;
  }
  return true;
}

function buildMediumBodyHtml(article) {
  const parts = [];

  if (article.description) {
    parts.push(`<p><em>${escapeHtml(article.description)}</em></p>`);
  }

  parts.push(String(article.bodyMarkdown || '').trim());
  return parts.filter(Boolean).join('\n\n').trim();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

async function loadStorageState() {
  if (process.env.MEDIUM_STORAGE_STATE_PATH) {
    const raw = await fs.readFile(process.env.MEDIUM_STORAGE_STATE_PATH, 'utf8');
    return JSON.parse(raw);
  }

  if (process.env.MEDIUM_STORAGE_STATE) {
    return JSON.parse(process.env.MEDIUM_STORAGE_STATE);
  }

  throw new Error('missing_medium_storage_state');
}

async function loadPlaywright() {
  try {
    return require('playwright');
  } catch (error) {
    throw new Error(`playwright_unavailable:${error && error.message ? error.message : 'install_playwright'}`);
  }
}

async function resolveEditorLocators(page) {
  const title = page.locator('h1[contenteditable="true"]').first();
  await title.waitFor({ state: 'visible', timeout: 30000 });
  const editables = page.locator('[contenteditable="true"]');

  if ((await editables.count()) < 2) {
    throw new Error('medium_editor_body_not_found');
  }

  return {
    title,
    body: editables.nth(1),
  };
}

async function ensureLoggedIn(page) {
  const url = page.url().toLowerCase();
  if (url.includes('/m/signin') || url.includes('/signin')) {
    throw new Error('medium_login_required');
  }

  const signInCta = page.getByRole('link', { name: /sign in/i });
  if (await signInCta.count()) {
    throw new Error('medium_login_required');
  }
}

async function insertStoryBody(page, bodyLocator, html) {
  await bodyLocator.click();
  await page.evaluate((bodyHtml) => {
    const editables = Array.from(document.querySelectorAll('[contenteditable="true"]'));
    const body = editables[1] || editables[editables.length - 1];
    if (!body) {
      throw new Error('medium_editor_body_not_found');
    }

    body.focus();
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      const range = document.createRange();
      range.selectNodeContents(body);
      selection.addRange(range);
    }

    document.execCommand('delete');
    document.execCommand('insertHTML', false, bodyHtml);
  }, html);
}

async function createMediumDraft(article) {
  const { chromium } = await loadPlaywright();
  const storageState = await loadStorageState();
  const browser = await chromium.launch({
    headless: detectHeadlessMode(),
  });

  try {
    const context = await browser.newContext({
      storageState,
      viewport: { width: 1440, height: 1080 },
    });
    const page = await context.newPage();

    await page.goto(getMediumComposeUrl(), { waitUntil: 'domcontentloaded' });
    await ensureLoggedIn(page);

    const editor = await resolveEditorLocators(page);
    const bodyHtml = buildMediumBodyHtml(article);

    await editor.title.fill(article.title || article.articleId || 'Untitled');
    await insertStoryBody(page, editor.body, bodyHtml);
    await page.waitForTimeout(getMediumDraftWaitMs());

    const draftUrl = page.url();

    if (process.env.MEDIUM_STORAGE_STATE_PATH) {
      await context.storageState({
        path: process.env.MEDIUM_STORAGE_STATE_PATH,
      });
    }

    return draftUrl;
  } finally {
    await browser.close();
  }
}

async function publishToMedium({ article, releaseId, dryRun }) {
  if (dryRun) {
    return {
      status: 'prepared',
      externalPostId: `dry-run:medium:${releaseId}:${article.articleId}`,
      reason: 'dry_run_medium_draft',
    };
  }

  try {
    const draftUrl = await createMediumDraft(article);
    return {
      status: 'prepared',
      externalPostId: draftUrl || `medium:draft:${releaseId}:${article.articleId}`,
      reason: 'awaiting_manual_publish',
    };
  } catch (error) {
    return {
      status: 'failed',
      externalPostId: null,
      reason: error && error.message ? error.message : 'medium_draft_creation_failed',
    };
  }
}

module.exports = {
  publishToMedium,
};
