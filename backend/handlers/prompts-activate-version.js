// backend/handlers/prompts-activate-version.js
const { activatePromptVersion } = require("../lib/prompts/versioning");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { category, version } = req.body || {};

  if (!category || version == null) {
    return res.status(400).json({ error: "Missing category or version" });
  }

  try {
    await activatePromptVersion(category, version);
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("activate-version error:", err);
    return res.status(500).json({ error: err.message });
  }
};
