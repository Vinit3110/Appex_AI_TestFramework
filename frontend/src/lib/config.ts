/**
 * Centralized configuration constants for the frontend.
 *
 * In development: defaults to http://localhost:3001 (separate backend server).
 * In Docker/production: VITE_API_BASE is set to "" at build time so the
 * frontend uses relative URLs (same origin as the Express server).
 */
export const API_BASE = import.meta.env.VITE_API_BASE ?? 'http://localhost:3001';
