'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

const DEFAULT_AUTH_PATH = path.resolve(process.cwd(), '.playwright', 'medium-auth.json');

async function main() {
  let playwright;
  try {
    playwright = require('playwright');
  } catch (error) {
    console.error(`Playwright is required: ${error.message}`);
    process.exitCode = 1;
    return;
  }

  const targetPath = path.resolve(process.cwd(), process.argv[2] || DEFAULT_AUTH_PATH);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });

  const browser = await playwright.chromium.launch({ headless: false });

  try {
    const context = await browser.newContext();
    const page = await context.newPage();

    console.log('Opening Medium login. Sign in completely, then press Enter in this terminal to save auth state.');
    await page.goto('https://medium.com/m/signin', { waitUntil: 'domcontentloaded' });

    process.stdin.resume();
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve());
    });

    await context.storageState({ path: targetPath });
    console.log(`Saved Medium auth state to ${targetPath}`);
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  main().catch((error) => {
    console.error(`Failed to save Medium auth state: ${error.message}`);
    process.exitCode = 1;
  });
}
