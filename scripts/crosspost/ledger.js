'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const LEDGER_SCHEMA_VERSION = '1';

function createEmptyLedger() {
  return {
    schemaVersion: LEDGER_SCHEMA_VERSION,
    lastUpdatedAt: new Date().toISOString(),
    records: [],
  };
}

function validateLedgerShape(ledger) {
  if (!ledger || typeof ledger !== 'object') {
    throw new Error('Ledger must be an object');
  }
  if (!Array.isArray(ledger.records)) {
    throw new Error('Ledger records must be an array');
  }
  if (typeof ledger.schemaVersion !== 'string' || !ledger.schemaVersion) {
    throw new Error('Ledger schemaVersion is required');
  }
}

async function loadLedger(ledgerPath) {
  try {
    const raw = await fs.readFile(ledgerPath, 'utf8');
    const parsed = JSON.parse(raw);
    validateLedgerShape(parsed);
    return parsed;
  } catch (error) {
    if (error && error.code === 'ENOENT') {
      return createEmptyLedger();
    }
    if (error instanceof SyntaxError) {
      throw new Error(`Invalid ledger JSON at ${ledgerPath}`);
    }
    throw error;
  }
}

async function writeLedger(ledgerPath, ledger) {
  validateLedgerShape(ledger);
  ledger.lastUpdatedAt = new Date().toISOString();

  await fs.mkdir(path.dirname(ledgerPath), { recursive: true });
  const tempPath = `${ledgerPath}.tmp`;
  await fs.writeFile(tempPath, `${JSON.stringify(ledger, null, 2)}\n`, 'utf8');
  await fs.rename(tempPath, ledgerPath);
}

function hasBlockingAttempt(ledger, articleId, platform, blockingStatuses = ['success']) {
  return ledger.records.some(
    (record) =>
      record.articleId === articleId &&
      record.platform === platform &&
      blockingStatuses.includes(record.status)
  );
}

function buildAttemptRecord({
  releaseId,
  articleId,
  platform,
  status,
  reason = null,
  externalPostId = null,
  startedAt,
  completedAt,
}) {
  return {
    attemptId: `${releaseId}:${articleId}:${platform}:${Date.now()}`,
    releaseId,
    articleId,
    platform,
    status,
    reason,
    externalPostId,
    startedAt,
    completedAt,
  };
}

function recordAttempt(ledger, attempt) {
  ledger.records.push(attempt);
}

module.exports = {
  LEDGER_SCHEMA_VERSION,
  createEmptyLedger,
  loadLedger,
  writeLedger,
  hasBlockingAttempt,
  buildAttemptRecord,
  recordAttempt,
};
