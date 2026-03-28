// firebase/firestoreService.js
// ─────────────────────────────────────────────────────────────────────────────
// All Firestore read / write operations for the test platform.
//
// Collection layout:
//
//   testRuns/
//     {runId}/
//       browser, status, startedAt, completedAt, duration,
//       summary { total, passed, failed, skipped, passRate },
//       exitCode, log[], triggeredBy (uid | null)
//
//       results/  (sub-collection)
//         {resultId}/
//           title, specFile, browser, status, duration, durationMs,
//           errorMessage, screenshotPath, screenshotMeta, retries
//
//   screenshots/
//     {screenshotId}/
//       filename, runId, testTitle, browser, capturedAt, size, localPath
//
//   users/
//     {uid}/
//       uid, email, displayName, photoURL, role, firstSeenAt, lastSeenAt
// ─────────────────────────────────────────────────────────────────────────────

const fs = require('fs');
const path = require('path');
const { db } = require('./firebaseAdmin');

const RUNS_COLLECTION         = 'testRuns';
const SCREENSHOTS_COLLECTION  = 'screenshots';
const USERS_COLLECTION        = 'users';

const ARTIFACTS_DIR = path.join(__dirname, '..', 'backend', 'reports', 'artifacts');

// ─── Guard — if Firebase failed to init, all operations are no-ops ────────────
const isAvailable = () => {
  if (!db) {
    console.warn('[Firestore] DB not available — skipping persistence.');
    return false;
  }
  return true;
};

// ═════════════════════════════════════════════════════════════════════════════
// TEST RUNS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Create a run document at the moment a test run begins.
 * @returns {string|null} Firestore document ID (runId), or null on failure.
 */
const createRun = async ({ browser, startedAt, triggeredBy = null }) => {
  if (!isAvailable()) return null;
  try {
    const docRef = await db.collection(RUNS_COLLECTION).add({
      browser,
      status      : 'running',
      startedAt   : startedAt || new Date().toISOString(),
      completedAt : null,
      duration    : null,
      summary     : null,
      exitCode    : null,
      log         : [],
      triggeredBy,
      createdAt   : new Date().toISOString(),
    });
    console.log(`[Firestore] Run created — id: ${docRef.id}`);
    return docRef.id;
  } catch (err) {
    console.error('[Firestore] createRun failed:', err.message);
    return null;
  }
};

/**
 * Finalise a run after Playwright exits.
 * Writes the summary, all individual test results, and any screenshot metadata.
 */
const completeRun = async (runId, { parsedReport, exitCode, browser, log }) => {
  if (!isAvailable() || !runId) return;

  try {
    const { summary, results, meta } = parsedReport;
    const runStatus = exitCode === 0 ? 'passed' : exitCode === -1 ? 'error' : 'failed';

    // ── Update parent run doc ──────────────────────────────────────────────────
    await db.collection(RUNS_COLLECTION).doc(runId).update({
      status      : runStatus,
      completedAt : meta?.completedAt || new Date().toISOString(),
      duration    : summary.duration,
      summary     : {
        total   : summary.total,
        passed  : summary.passed,
        failed  : summary.failed,
        skipped : summary.skipped,
        passRate: summary.passRate,
      },
      exitCode,
      log : log || [],
    });

    // ── Batch-write individual test results ───────────────────────────────────
    const capturedAt = new Date().toISOString();
    const batchSize  = 400;

    for (let i = 0; i < results.length; i += batchSize) {
      const batch = db.batch();
      const chunk = results.slice(i, i + batchSize);

      for (const result of chunk) {
        // Build screenshot metadata if this test has a failure screenshot
        let screenshotMeta = null;
        if (result.screenshotPath) {
          const filename   = result.screenshotPath.split('/').pop();
          const localFile  = path.join(ARTIFACTS_DIR, filename);
          const fileSize   = fs.existsSync(localFile)
            ? fs.statSync(localFile).size
            : -1;

          screenshotMeta = {
            filename,
            size      : fileSize,
            capturedAt,
            runId,
          };
        }

        const ref = db
          .collection(RUNS_COLLECTION)
          .doc(runId)
          .collection('results')
          .doc();

        batch.set(ref, {
          title          : result.title,
          specFile       : result.specFile,
          browser        : result.browser,
          status         : result.status,
          duration       : result.duration,
          durationMs     : result.durationMs,
          errorMessage   : result.errorMessage   || null,
          screenshotPath : result.screenshotPath || null,
          screenshotMeta : screenshotMeta,
          retries        : result.retries || 0,
        });
      }

      await batch.commit();
    }

    // ── Write screenshot metadata to top-level collection ─────────────────────
    await saveScreenshotsForRun(runId, results, capturedAt);

    console.log(`[Firestore] Run ${runId} completed — status: ${runStatus}, results: ${results.length}`);

  } catch (err) {
    console.error('[Firestore] completeRun failed:', err.message);
  }
};

/**
 * Returns the N most recent runs (without sub-collection results).
 */
const getRunHistory = async (limit = 20) => {
  if (!isAvailable()) return [];
  try {
    const snap = await db
      .collection(RUNS_COLLECTION)
      .orderBy('startedAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(doc => ({ runId: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('[Firestore] getRunHistory failed:', err.message);
    return [];
  }
};

/**
 * Returns a single run document + all its results sub-collection docs.
 */
const getRunById = async (runId) => {
  if (!isAvailable()) return null;
  try {
    const runDoc = await db.collection(RUNS_COLLECTION).doc(runId).get();
    if (!runDoc.exists) return null;

    const resultsSnap = await db
      .collection(RUNS_COLLECTION)
      .doc(runId)
      .collection('results')
      .get();

    const results = resultsSnap.docs.map(d => ({ id: d.id, ...d.data() }));
    return { runId, ...runDoc.data(), results };
  } catch (err) {
    console.error(`[Firestore] getRunById(${runId}) failed:`, err.message);
    return null;
  }
};

/**
 * Hard-delete a run and all its results and screenshots.
 */
const deleteRun = async (runId) => {
  if (!isAvailable()) return false;
  try {
    // Delete results sub-collection
    const resultsSnap = await db
      .collection(RUNS_COLLECTION)
      .doc(runId)
      .collection('results')
      .get();

    const batch = db.batch();
    resultsSnap.docs.forEach(d => batch.delete(d.ref));
    await batch.commit();

    // Delete parent doc
    await db.collection(RUNS_COLLECTION).doc(runId).delete();

    // Delete screenshot docs for this run
    const shotSnap = await db
      .collection(SCREENSHOTS_COLLECTION)
      .where('runId', '==', runId)
      .get();

    if (!shotSnap.empty) {
      const shotBatch = db.batch();
      shotSnap.docs.forEach(d => shotBatch.delete(d.ref));
      await shotBatch.commit();
    }

    console.log(`[Firestore] Run ${runId} deleted.`);
    return true;
  } catch (err) {
    console.error(`[Firestore] deleteRun(${runId}) failed:`, err.message);
    return false;
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// SCREENSHOTS
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Write one screenshots/ doc per failed test that has an artifact.
 * Called internally by completeRun — you don't need to call this directly.
 */
const saveScreenshotsForRun = async (runId, results, capturedAt) => {
  if (!isAvailable()) return;

  const failedWithScreenshots = results.filter(r => r.screenshotPath);
  if (failedWithScreenshots.length === 0) return;

  try {
    const batch = db.batch();

    failedWithScreenshots.forEach((result) => {
      const filename  = result.screenshotPath.split('/').pop();
      const localFile = path.join(ARTIFACTS_DIR, filename);
      const fileSize  = fs.existsSync(localFile)
        ? fs.statSync(localFile).size
        : -1;

      const ref = db.collection(SCREENSHOTS_COLLECTION).doc();
      batch.set(ref, {
        filename   : filename,
        runId      : runId,
        testTitle  : result.title,
        browser    : result.browser,
        capturedAt : capturedAt,
        size       : fileSize,
        localPath  : result.screenshotPath,   // e.g. "/artifacts/foo.png"
      });
    });

    await batch.commit();
    console.log(`[Firestore] ${failedWithScreenshots.length} screenshot(s) saved for run ${runId}`);

  } catch (err) {
    console.error('[Firestore] saveScreenshotsForRun failed:', err.message);
  }
};

/**
 * Fetch all screenshot metadata, most recent first.
 * @param {number} limit  Max docs to return (default 50)
 */
const getScreenshots = async (limit = 50) => {
  if (!isAvailable()) return [];
  try {
    const snap = await db
      .collection(SCREENSHOTS_COLLECTION)
      .orderBy('capturedAt', 'desc')
      .limit(limit)
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('[Firestore] getScreenshots failed:', err.message);
    return [];
  }
};

/**
 * Fetch screenshots for a specific run.
 */
const getScreenshotsByRunId = async (runId) => {
  if (!isAvailable()) return [];
  try {
    const snap = await db
      .collection(SCREENSHOTS_COLLECTION)
      .where('runId', '==', runId)
      .orderBy('capturedAt', 'desc')
      .get();
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error(`[Firestore] getScreenshotsByRunId(${runId}) failed:`, err.message);
    return [];
  }
};

// ═════════════════════════════════════════════════════════════════════════════
// USERS  (populated on first Google Sign-In, kept in sync on each login)
// ═════════════════════════════════════════════════════════════════════════════

/**
 * Upsert a user profile after they authenticate.
 * The backend verifies the Firebase ID token, then calls this.
 * Role defaults to "viewer" for new users; existing role is preserved.
 */
const upsertUser = async ({ uid, email, displayName, photoURL }) => {
  if (!isAvailable()) return null;
  try {
    const ref     = db.collection(USERS_COLLECTION).doc(uid);
    const existing = await ref.get();
    const now      = new Date().toISOString();

    if (existing.exists) {
      await ref.update({ email, displayName, photoURL, lastSeenAt: now });
    } else {
      await ref.set({
        uid,
        email,
        displayName : displayName || '',
        photoURL    : photoURL    || null,
        role        : 'viewer',   // default role — promote to 'admin' manually in Firestore
        firstSeenAt : now,
        lastSeenAt  : now,
      });
      console.log(`[Firestore] New user created — uid: ${uid}, email: ${email}`);
    }

    const updated = await ref.get();
    return { uid, ...updated.data() };

  } catch (err) {
    console.error(`[Firestore] upsertUser(${uid}) failed:`, err.message);
    return null;
  }
};

/**
 * Fetch a single user by uid.
 */
const getUserById = async (uid) => {
  if (!isAvailable()) return null;
  try {
    const doc = await db.collection(USERS_COLLECTION).doc(uid).get();
    return doc.exists ? { uid, ...doc.data() } : null;
  } catch (err) {
    console.error(`[Firestore] getUserById(${uid}) failed:`, err.message);
    return null;
  }
};

module.exports = {
  // Runs
  createRun, completeRun, getRunHistory, getRunById, deleteRun,
  // Screenshots
  getScreenshots, getScreenshotsByRunId,
  // Users
  upsertUser, getUserById,
};
