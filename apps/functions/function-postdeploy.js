#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * function-postdeploy.js
 *
 * Cleanup script for firebase functions postdeploy:
 *  - Deletes the repository-level `./out` directory that was used as the functions `source`
 *  - Deletes `apps/functions/src/index.js` and `apps/functions/src/index.js.map` if present
 *
 * The script is idempotent and safe-guards against accidentally deleting wrong paths.
 *
 * You can skip cleanup by setting the environment variable `FUNCTIONS_SKIP_CLEANUP=1`.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const SKIP_ENV = 'FUNCTIONS_SKIP_CLEANUP';
if (process.env[SKIP_ENV]) {
  console.log(`[postdeploy] Skipping cleanup because ${SKIP_ENV} is set`);
  process.exit(0);
}

const log = (...args) => console.log('[postdeploy]', ...args);
const warn = (...args) => console.warn('[postdeploy]', ...args);
const errlog = (...args) => console.error('[postdeploy]', ...args);

// Paths (resolved relative to this file to be robust)
const outDir = path.resolve(__dirname, '..', '..', 'out');
const indexJs = path.resolve(__dirname, 'src', 'index.js');
const indexJsMap = path.resolve(__dirname, 'src', 'index.js.map');

function removeDirectory(dirPath) {
  if (!fs.existsSync(dirPath)) {
    log(`Not found (skipping): ${dirPath}`);
    return;
  }

  let stats;
  try {
    stats = fs.lstatSync(dirPath);
  } catch (e) {
    errlog(`Unable to stat path ${dirPath}: ${e.message || e}`);
    return;
  }

  if (!stats.isDirectory()) {
    warn(`Path exists but is not a directory (skipping): ${dirPath}`);
    return;
  }

  // Safety check: ensure the directory looks like the intended 'out' folder
  if (path.basename(dirPath) !== 'out') {
    warn(`Refusing to remove directory whose basename !== 'out' (safety): ${dirPath}`);
    return;
  }

  try {
    if (typeof fs.rmSync === 'function') {
      fs.rmSync(dirPath, { recursive: true, force: true });
    } else {
      // Older Node fallback
      fs.rmdirSync(dirPath, { recursive: true });
    }
    log(`Removed directory: ${dirPath}`);
  } catch (e) {
    errlog(`Failed to remove directory ${dirPath}: ${e.message || e}`);
  }
}

function removeFile(filePath) {
  if (!fs.existsSync(filePath)) {
    log(`Not found (skipping): ${filePath}`);
    return;
  }

  let stats;
  try {
    stats = fs.lstatSync(filePath);
  } catch (e) {
    errlog(`Unable to stat path ${filePath}: ${e.message || e}`);
    return;
  }

  if (!stats.isFile()) {
    warn(`Path exists but is not a file (skipping): ${filePath}`);
    return;
  }

  try {
    fs.unlinkSync(filePath);
    log(`Removed file: ${filePath}`);
  } catch (e) {
    errlog(`Failed to remove file ${filePath}: ${e.message || e}`);
  }
}

log('Starting cleanup of build artifacts...');
removeFile(indexJs);
removeFile(indexJsMap);
removeDirectory(outDir);
log('Cleanup finished.');

process.exit(0);
