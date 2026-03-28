// backend/controllers/testController.js
// ─────────────────────────────────────────────────────────────────────────────
// Core business logic for the test API.
//
//  runTests  → spawns `npx playwright test` as a child process,
//              streams output, then reads + returns the JSON report.
//
//  getResults → reads the last saved JSON report and returns it.
//
//  getStatus  → tells the frontend if a run is in progress.
// ─────────────────────────────────────────────────────────────────────────────

const { spawn }   = require('child_process');
const path        = require('path');
const fs          = require('fs');
const { parsePlaywrightReport } = require('../utils/resultParser');

// Root of the project (one level above /backend)
const PROJECT_ROOT   = path.join(__dirname, '..', '..');
const RESULTS_FILE   = path.join(__dirname, '..', 'reports', 'test-results.json');

// ─── Simple in-memory state (one run at a time) ───────────────────────────────
const MAX_LOG_LINES = 200;
let isRunning  = false;
let lastRunLog = [];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tests/run
// ─────────────────────────────────────────────────────────────────────────────
const runTests = async (req, res) => {

  // Prevent concurrent runs
  if (isRunning) {
    return res.status(409).json({
      error: 'A test run is already in progress. Please wait.',
    });
  }

  // Which browser(s) to run? Default: all configured in playwright.config.js
  const { browser = 'all' } = req.body;

  // Build the playwright CLI args
  const args = ['playwright', 'test'];
  if (browser !== 'all') {
    args.push('--project', browser);   // e.g. --project chromium
  }

  isRunning  = true;
  lastRunLog = [];

  const startTime = Date.now();

  console.log(`\n[TestController] Starting run — browser: ${browser}`);
  console.log(`[TestController] Command: npx ${args.join(' ')}\n`);

  // Respond immediately so the frontend knows the run started,
  // then continue running in the background.
  // (Step 4 will poll /api/tests/status then /api/tests/results)
  res.json({
    status : 'started',
    message: `Test run started for browser: ${browser}`,
    browser,
    startedAt: new Date().toISOString(),
  });

  // ── Spawn Playwright ────────────────────────────────────────────────────────
  const child = spawn('npx', args, {
    cwd  : PROJECT_ROOT,    // Run from project root so playwright.config.js is found
    shell: true,            // Required on Windows (PowerShell)
  });

  // Collect stdout lines for the log (capped to prevent unbounded memory growth)
  child.stdout.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach(line => {
      if (lastRunLog.length >= MAX_LOG_LINES) lastRunLog.shift();
      lastRunLog.push(line);
      console.log('[PW]', line);
    });
  });

  child.stderr.on('data', (data) => {
    const lines = data.toString().split('\n').filter(Boolean);
    lines.forEach(line => {
      if (lastRunLog.length >= MAX_LOG_LINES) lastRunLog.shift();
      lastRunLog.push(`[stderr] ${line}`);
      console.error('[PW ERR]', line);
    });
  });

  // ── When Playwright finishes ────────────────────────────────────────────────
  child.on('close', (exitCode) => {
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    isRunning = false;

    console.log(`\n[TestController] Run finished — exit code: ${exitCode}, duration: ${duration}s`);

    // Attach run metadata to the JSON report for the frontend to read
    try {
      const rawReport = fs.existsSync(RESULTS_FILE)
        ? JSON.parse(fs.readFileSync(RESULTS_FILE, 'utf-8'))
        : {};

      rawReport._meta = {
        exitCode,
        duration : `${duration}s`,
        browser,
        completedAt: new Date().toISOString(),
        log        : lastRunLog.slice(-50),  // keep last 50 lines
      };

      fs.writeFileSync(RESULTS_FILE, JSON.stringify(rawReport, null, 2));
      console.log('[TestController] Results saved to', RESULTS_FILE);

    } catch (err) {
      console.error('[TestController] Could not write results metadata:', err.message);
    }
  });

  child.on('error', (err) => {
    isRunning = false;
    console.error('[TestController] Failed to spawn Playwright:', err.message);

    // Write a failure marker so the polling frontend knows the run crashed
    try {
      const failureReport = {
        _meta: {
          exitCode  : -1,
          duration  : '0s',
          browser,
          error     : err.message,
          completedAt: new Date().toISOString(),
          log        : lastRunLog.slice(-50),
        },
      };
      fs.writeFileSync(RESULTS_FILE, JSON.stringify(failureReport, null, 2));
    } catch (writeErr) {
      console.error('[TestController] Could not write failure marker:', writeErr.message);
    }
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tests/results
// ─────────────────────────────────────────────────────────────────────────────
const getResults = (req, res) => {
  try {
    if (!fs.existsSync(RESULTS_FILE)) {
      return res.status(404).json({
        error: 'No results found. Run tests first via POST /api/tests/run',
      });
    }

    const raw    = fs.readFileSync(RESULTS_FILE, 'utf-8');
    const report = JSON.parse(raw);

    // Parse into a clean, frontend-friendly shape
    const parsed = parsePlaywrightReport(report);

    return res.json(parsed);

  } catch (err) {
    console.error('[TestController] Error reading results:', err.message);
    return res.status(500).json({ error: 'Failed to read test results', detail: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tests/status
// ─────────────────────────────────────────────────────────────────────────────
const getStatus = (req, res) => {
  res.json({
    running: isRunning,
    message: isRunning
      ? 'Tests are currently running...'
      : 'No tests running. Ready.',
  });
};

module.exports = { runTests, getResults, getStatus };
