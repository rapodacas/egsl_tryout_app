// backend/handlers/prompts-rollback.js
const { rollbackPrompt } = require("../lib/prompts/versioning");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category } = req.body || {};

  if (!category) {
    return res.status(400).json({ error: "Missing category" });
  }

  try {
    const previousVersion = await rollbackPrompt(category);
    return res.status(200).json({ version: previousVersion });
  } catch (err) {
    console.error("rollback error:", err);
    return res.status(500).json({ error: err.message });
  }
};
