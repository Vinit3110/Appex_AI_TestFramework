// backend/utils/resultParser.js
// ─────────────────────────────────────────────────────────────────────────────
// Transforms the raw Playwright JSON reporter output into a clean,
// frontend-friendly shape.
//
// Raw Playwright JSON is deeply nested and verbose.
// This parser flattens it into what the React dashboard (Step 4) needs:
//
//  {
//    summary: { total, passed, failed, skipped, duration },
//    results: [ { id, title, status, duration, browser, error, screenshot } ]
//    generatedAt: "ISO string"
//    meta: { exitCode, browser, completedAt, log[] }
//  }
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Main parser function.
 * @param {object} rawReport  Parsed JSON from test-results.json
 * @returns {object}          Clean report for the frontend
 */
const parsePlaywrightReport = (rawReport) => {

  const results = [];
  let passed = 0, failed = 0, skipped = 0;

  // ── Walk the Playwright JSON structure (recursive) ────────────────────────
  // Playwright nests suites inside suites (file → describe → specs).
  // We recursively walk the whole tree to collect every spec regardless
  // of how deeply nested it is.

  const walkSuite = (suite, specFile) => {
    const file = suite.file || suite.title || specFile || 'unknown';

    // Process specs at this level
    for (const spec of (suite.specs || [])) {
      const testTitle = spec.title;

      for (const test of (spec.tests || [])) {
        const browser = extractBrowser(test.projectName || '');

        for (const result of (test.results || [])) {
          const status   = normaliseStatus(result.status);
          const duration = result.duration || 0;

          let errorMessage   = null;
          let screenshotPath = null;

          if (status === 'failed') {
            failed++;

            const errors = result.errors || [];
            if (errors.length > 0) {
              errorMessage = errors[0].message
                ? stripAnsi(errors[0].message).slice(0, 500)
                : 'Unknown error';
            }

            const attachments = result.attachments || [];
            const shot = attachments.find(a => a.contentType === 'image/png');
            if (shot && shot.path) {
              const filename = shot.path.split(/[/\\]/).pop();
              screenshotPath = `/artifacts/${filename}`;
            }

          } else if (status === 'passed') {
            passed++;
          } else {
            skipped++;
          }

          results.push({
            id            : `${file}-${testTitle}-${browser}-${results.length}`.replace(/\s+/g, '-'),
            title         : testTitle,
            suite         : file,
            browser,
            status,
            duration      : formatDuration(duration),
            durationMs    : duration,
            error         : errorMessage,
            errorLog      : errorMessage,
            screenshotPath,
            retries       : result.retry || 0,
          });
        }
      }
    }

    // Recurse into nested suites (describe blocks)
    for (const child of (suite.suites || [])) {
      walkSuite(child, file);
    }
  };

  for (const suite of (rawReport.suites || [])) {
    walkSuite(suite, null);
  }

  const total = passed + failed + skipped;

  // ── Calculate total duration from _meta or sum of tests ───────────────────
  const totalDuration = rawReport._meta?.duration || sumDurations(results);

  return {
    summary: {
      total,
      passed,
      failed,
      skipped,
      passRate  : total > 0 ? Math.round((passed / total) * 100) : 0,
      duration  : totalDuration,
      status    : failed > 0 ? 'failed' : 'passed',
    },
    results,
    generatedAt: new Date().toISOString(),
    meta: rawReport._meta || null,
  };
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Normalise Playwright status values to: passed | failed | skipped
 */
const normaliseStatus = (status) => {
  if (status === 'passed')                        return 'passed';
  if (status === 'failed' || status === 'timedOut') return 'failed';
  return 'skipped';
};

/**
 * Extract browser name from Playwright project name string.
 * e.g. "chromium" → "Chrome", "firefox" → "Firefox"
 */
const extractBrowser = (projectName) => {
  const name = (projectName || '').toLowerCase();
  if (name.includes('chromium') || name.includes('chrome')) return 'Chrome';
  if (name.includes('firefox'))                              return 'Firefox';
  if (name.includes('webkit')  || name.includes('safari'))  return 'Safari';
  if (name.includes('mobile'))                               return 'Mobile';
  return projectName || 'Unknown';
};

/**
 * Format milliseconds into a human-readable string.
 * e.g. 3600 → "3.6s"  |  800 → "800ms"
 */
const formatDuration = (ms) => {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
};

/**
 * Sum durations (in ms) from all results and format.
 */
const sumDurations = (results) => {
  const total = results.reduce((acc, r) => acc + (r.durationMs || 0), 0);
  return formatDuration(total);
};

/**
 * Strip ANSI escape codes from error messages (they look bad in JSON).
 */
const stripAnsi = (str) =>
  str.replace(/[\u001b\u009b][[\]()#;?]*(?:(?:[0-9]{1,4}(?:;[0-9]{0,4})*)?[0-9A-ORZcf-nq-uy=><~]|\].*?(?:\u0007|\u001b\\))/g, '');

module.exports = { parsePlaywrightReport };
