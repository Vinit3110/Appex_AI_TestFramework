// ─────────────────────────────────────────────────────────────
//  failureAnalyzer.js — AI-powered test failure analysis
// ─────────────────────────────────────────────────────────────
const { readFile } = require("fs/promises");
const { callGeminiText, callGeminiVision } = require("./geminiClient");

const ANALYSIS_PROMPT = `You are a test failure analysis expert. Analyze the following test error log and respond with ONLY a valid JSON object with exactly these fields:
{
  "cause": "root cause of the failure",
  "fix": "suggested fix or next steps",
  "severity": "low | medium | high"
}
No explanation, no markdown, only raw JSON.

Error log:
`;

const VALID_SEVERITIES = new Set(["low", "medium", "high"]);

/**
 * Analyze a test failure using Gemini AI.
 * Optionally accepts a screenshot for vision-based analysis.
 *
 * @param {string}  errorLog        — The raw error output / stack trace.
 * @param {string}  [screenshotPath] — Optional path to a screenshot file (PNG).
 * @returns {Promise<{cause: string, fix: string, severity: string}>}
 */
async function analyzeFailure(errorLog, screenshotPath) {
  let rawResponse;

  try {
    if (screenshotPath) {
      // ── Vision path: read screenshot and send with error log ──
      const imageBuffer = await readFile(screenshotPath);
      const base64Image = imageBuffer.toString("base64");
      const mimeType = "image/png";

      rawResponse = await callGeminiVision(
        `${ANALYSIS_PROMPT}${errorLog}`,
        base64Image,
        mimeType
      );
    } else {
      // ── Text-only path ──
      rawResponse = await callGeminiText(`${ANALYSIS_PROMPT}${errorLog}`);
    }
  } catch (error) {
    throw new Error(`Failure analysis request failed: ${error.message}`);
  }

  // ── Parse and validate response ───────────────────────────
  let cleaned = rawResponse.trim();
  const fenced = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)```/);
  if (fenced) {
    cleaned = fenced[1].trim();
  }

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (error) {
    throw new Error(
      `Failed to parse analysis response as JSON: ${error.message}\nRaw response:\n${rawResponse}`
    );
  }

  // Validate required fields
  if (!parsed.cause || !parsed.fix || !parsed.severity) {
    throw new Error(
      `Analysis response is missing required fields (cause, fix, severity).\nReceived: ${JSON.stringify(parsed)}`
    );
  }

  // Normalize and validate severity
  parsed.severity = parsed.severity.toLowerCase();
  if (!VALID_SEVERITIES.has(parsed.severity)) {
    throw new Error(
      `Invalid severity "${parsed.severity}". Must be one of: low, medium, high.`
    );
  }

  return parsed;
}

module.exports = { analyzeFailure };
