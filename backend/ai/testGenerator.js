// ─────────────────────────────────────────────────────────────
//  testGenerator.js — AI-powered test step generation
// ─────────────────────────────────────────────────────────────
const { callGeminiText } = require("./geminiClient");

const SYSTEM_INSTRUCTION = `You are a test automation assistant. Given a plain English test description, return ONLY a valid JSON array of steps. Each step must follow this exact shape: { "action": "...", "target": "...", "value": "..." }. No explanation, no markdown, only raw JSON.`;

/**
 * Generate an array of test steps from a plain-English prompt.
 * @param {string} userPrompt — Natural-language description of the test flow.
 * @returns {Promise<Array<{action: string, target: string, value: string}>>}
 */
async function generateTestSteps(userPrompt) {
  const fullPrompt = `${SYSTEM_INSTRUCTION}\n\nTest description:\n${userPrompt}`;

  let rawResponse;
  try {
    rawResponse = await callGeminiText(fullPrompt);
  } catch (error) {
    throw new Error(`Failed to get response from Gemini: ${error.message}`);
  }

  // Strip possible markdown code fences the model may wrap around JSON
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
      `Failed to parse Gemini response as JSON: ${error.message}\nRaw response:\n${rawResponse}`
    );
  }

  if (!Array.isArray(parsed)) {
    throw new Error(
      `Expected a JSON array of steps but received ${typeof parsed}.\nParsed value: ${JSON.stringify(parsed)}`
    );
  }

  // Validate that each step has the required fields
  parsed.forEach((step, i) => {
    if (!step.action || !step.target) {
      throw new Error(
        `Step ${i} is missing required fields "action" or "target". Got: ${JSON.stringify(step)}`
      );
    }
  });

  return parsed;
}

module.exports = { generateTestSteps };
