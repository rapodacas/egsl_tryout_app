// api/[...slug].js
// Catch-all Vercel serverless entry that forwards /api/* to backend/api/route.js

const router = require("../backend/api/route.js");

// Export as a Vercel handler function
module.exports = async (req, res) => {
  return await router(req, res);
};
