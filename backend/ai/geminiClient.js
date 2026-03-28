// ─────────────────────────────────────────────────────────────
//  geminiClient.js — Gemini API client (text + vision)
// ─────────────────────────────────────────────────────────────
const { GoogleGenerativeAI } = require("@google/generative-ai");

let model;

function getModel() {
  if (!model) {
    const API_KEY = process.env.GEMINI_API_KEY;
    if (!API_KEY) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to your .env file or environment variables."
      );
    }
    const genAI = new GoogleGenerativeAI(API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }
  return model;
}

/**
 * Send a text-only prompt to Gemini and return the text response.
 * @param {string} prompt — The prompt to send.
 * @returns {Promise<string>} The model's text response.
 */
async function callGeminiText(prompt) {
  try {
    const result = await getModel().generateContent(prompt);
    const response = result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Gemini text request failed: ${error.message}`);
  }
}

/**
 * Send an image + prompt to Gemini (vision) and return the text response.
 * @param {string} prompt      — The text prompt accompanying the image.
 * @param {string} base64Image — The image encoded as a base64 string.
 * @param {string} mimeType    — MIME type of the image (e.g. "image/png").
 * @returns {Promise<string>} The model's text response.
 */
async function callGeminiVision(prompt, base64Image, mimeType) {
  try {
    const imagePart = {
      inlineData: {
        data: base64Image,
        mimeType,
      },
    };
    const result = await getModel().generateContent([prompt, imagePart]);
    const response = result.response;
    return response.text();
  } catch (error) {
    throw new Error(`Gemini vision request failed: ${error.message}`);
  }
}

module.exports = { callGeminiText, callGeminiVision };
