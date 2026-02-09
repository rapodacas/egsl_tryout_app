// api/[...slug].js
// Catch-all Vercel serverless entry that forwards /api/* to backend/api/route.js
// This allows the existing unified router (backend/api/route.js) to be reachable
// at /api/* on Vercel without moving files.

const router = require("../backend/api/route.js");

module.exports = router;
