// firebase/firebaseAdmin.js
// ─────────────────────────────────────────────────────────────────────────────
// Initialises the Firebase Admin SDK (singleton).
//
// Two auth modes are supported:
//
//   1. Service-account JSON  (production / CI)
//      Set FIREBASE_SERVICE_ACCOUNT_JSON in .env to the full JSON string,
//      OR set FIREBASE_SERVICE_ACCOUNT_PATH to a path to the JSON file.
//
//   2. Application Default Credentials  (local dev with `gcloud auth`)
//      If neither env var is set, the SDK falls back to ADC automatically.
//
// Import this file wherever you need Firestore:
//   const { db } = require('../../firebase/firebaseAdmin');
// ─────────────────────────────────────────────────────────────────────────────

const admin = require('firebase-admin');
const path  = require('path');
const fs    = require('fs');

let db;

const initFirebase = () => {
  // Already initialised — return cached instance
  if (admin.apps.length > 0) {
    db = admin.firestore();
    return db;
  }

  let credential;

  // ── Option 1: Full JSON string in env (great for CI secrets) ─────────────
  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    try {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
      console.log('[Firebase] Using service account from FIREBASE_SERVICE_ACCOUNT_JSON');
    } catch (e) {
      throw new Error(`[Firebase] Failed to parse FIREBASE_SERVICE_ACCOUNT_JSON: ${e.message}`);
    }

  // ── Option 2: Path to a JSON file ────────────────────────────────────────
  } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    const filePath = path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH);
    if (!fs.existsSync(filePath)) {
      throw new Error(`[Firebase] Service account file not found: ${filePath}`);
    }
    const serviceAccount = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    credential = admin.credential.cert(serviceAccount);
    console.log(`[Firebase] Using service account from file: ${filePath}`);

  // ── Option 3: Application Default Credentials (local gcloud) ─────────────
  } else {
    credential = admin.credential.applicationDefault();
    console.log('[Firebase] Using Application Default Credentials');
  }

  admin.initializeApp({
    credential,
    projectId: process.env.FIREBASE_PROJECT_ID,
  });

  db = admin.firestore();

  // Use ISO timestamps everywhere (not Firestore Timestamps) for easier JSON serialisation
  db.settings({ timestampsInSnapshots: true });

  console.log(`[Firebase] Firestore connected — project: ${process.env.FIREBASE_PROJECT_ID}`);
  return db;
};

// Initialise immediately when this module is loaded
try {
  initFirebase();
} catch (err) {
  console.warn(`[Firebase] Init failed: ${err.message}`);
  console.warn('[Firebase] Firestore persistence will be disabled for this session.');
  db = null;
}

module.exports = { db, admin };
