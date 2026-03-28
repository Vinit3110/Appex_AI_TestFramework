// backend/routes/testRoutes.js
// ─────────────────────────────────────────────────────────────────────────────
// Defines all /api/tests/* endpoints.
// Keeps routing logic separate from business logic (controller).
// ─────────────────────────────────────────────────────────────────────────────

const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/testController');
const { analyzeFailure }    = require('../ai/failureAnalyzer');
const { generateTestSteps } = require('../ai/testGenerator');

// ── POST /api/tests/run ───────────────────────────────────────────────────────
// Triggers a Playwright test run.
// Optional body: { browser: "chromium" | "firefox" | "all" }
// Response: { runId, status, summary, results, duration }
router.post('/run', controller.runTests);

// ── GET /api/tests/results ────────────────────────────────────────────────────
// Returns the most recent test run results from the JSON report file.
// Response: { summary, results, generatedAt }
router.get('/results', controller.getResults);

// ── GET /api/tests/status ─────────────────────────────────────────────────────
// Returns whether a test run is currently in progress.
// Response: { running: boolean }
router.get('/status', controller.getStatus);

// ── POST /api/tests/ai/analyze ────────────────────────────────────────────────
// Body: { errorLog: string }
// Response: { cause, fix, severity }
router.post('/ai/analyze', async (req, res) => {
  const { errorLog } = req.body;
  if (!errorLog) {
    return res.status(400).json({ error: 'errorLog is required in the request body.' });
  }
  try {
    const result = await analyzeFailure(errorLog);
    return res.json(result);
  } catch (err) {
    console.error('[AI Analyze]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ── POST /api/tests/ai/generate ───────────────────────────────────────────────
// Body: { prompt: string }
// Response: { steps: Array<{ action, target, value }> }
router.post('/ai/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required in the request body.' });
  }
  try {
    const steps = await generateTestSteps(prompt);
    return res.json({ steps });
  } catch (err) {
    console.error('[AI Generate]', err.message);
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
