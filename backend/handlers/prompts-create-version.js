// backend/handlers/prompts-create-version.js
import { createPromptVersion } from "../lib/prompts/versioning.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    category,
    subcategories,
    systemPrompt,
    userPromptTemplate,
    updatedBy
  } = req.body || {};

  if (!category || !subcategories || !systemPrompt || !userPromptTemplate) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const version = await createPromptVersion({
      category,
      subcategories,
      systemPrompt,
      userPromptTemplate,
      updatedBy
    });

    return res.status(200).json({ version });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}