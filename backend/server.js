// backend/server.js
// ─────────────────────────────────────────────────────────────────────────────
// Entry point for the Express backend.
// Starts the API server that the React frontend (Step 4) will talk to.
// ─────────────────────────────────────────────────────────────────────────────

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const express = require('express');
const cors    = require('cors');

const testRoutes = require('./routes/testRoutes');

const app  = express();
const PORT = process.env.PORT || 3001;

// ─── Middleware ───────────────────────────────────────────────────────────────

// Allow React frontend (localhost:3000) to call this API
app.use(cors({
  origin: [
    'http://localhost:3000',  // React dev server (Step 4)
    'http://localhost:5173',  // Vite dev server (if used)
  ],
  methods: ['GET', 'POST'],
}));

// Parse incoming JSON request bodies
app.use(express.json());

// Serve test artifacts (screenshots) as static files
// Frontend can display failure screenshots via: /artifacts/<filename>
app.use('/artifacts', express.static(
  path.join(__dirname, 'reports', 'artifacts')
));

// ─── Routes ───────────────────────────────────────────────────────────────────
app.use('/api/tests', testRoutes);

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({
    status : 'ok',
    message: 'AI Test Platform backend is running',
    time   : new Date().toISOString(),
  });
});

// ─── Serve built React frontend (production / Docker) ─────────────────────────
const frontendDist = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(frontendDist));

// SPA fallback — all non-API requests return index.html so React Router works
app.get(/^(?!\/api\/).*/, (req, res) => {
  res.sendFile(path.join(frontendDist, 'index.html'));
});

// ─── 404 fallback (API routes only) ──────────────────────────────────────────
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route ${req.method} ${req.path} not found` });
});

// ─── Global error handler ─────────────────────────────────────────────────────
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error', detail: err.message });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Backend running at http://localhost:${PORT}`);
  console.log(`   Health check → http://localhost:${PORT}/api/health`);
  console.log(`   Run tests   → POST http://localhost:${PORT}/api/tests/run\n`);
});

module.exports = app;
