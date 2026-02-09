// backend/handlers/prompts-rollback.js
import { rollbackPrompt } from "../lib/prompts/versioning.js";

export default async function handler(req, res) {
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
