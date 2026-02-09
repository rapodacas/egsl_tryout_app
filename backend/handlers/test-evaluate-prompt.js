// backend/handlers/test-evaluate-prompt.js
import { supabase } from "../lib/supabase";
import { callModel } from "../lib/providers/index";
import { extractFramesFromUrl } from "../lib/ffmpeg";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const {
    category,
    version,
    testUrl,
    eventIndex = 0,
    userTier = "free"
  } = req.body || {};

  if (!category || !testUrl) {
    return res.status(400).json({ error: "Missing category or testUrl" });
  }

  try {
    let query = supabase
      .from("prompts")
      .select("*")
      .eq("category", category);

    if (version != null) {
      query = query.eq("version", version);
    } else {
      query = query.eq("is_active", true);
    }

    const { data: row, error } = await query.single();
    if (error || !row) {
      return res.status(404).json({ error: "Prompt version not found" });
    }

    const frames = await extractFramesFromUrl(testUrl, 6);

    const systemPrompt = row.system_prompt;
    const userPrompt = row.user_prompt_template.replace(
      "{{frames}}",
      JSON.stringify(frames)
    );

    const provider = "groq";

    const response = await callModel(provider, {
      frames,
      systemPrompt,
      userPrompt
    });

    const missingSubcategories = [];
    for (const sub of row.subcategories || []) {
      if (response[sub] == null) missingSubcategories.push(sub);
    }

    return res.status(200).json({
      category,
      version: row.version,
      provider,
      subcategories: row.subcategories,
      result: response,
      rawResponse: response,
      validation: {
        missingSubcategories,
        isValid: missingSubcategories.length === 0
      }
    });
  } catch (err) {
    console.error("test-evaluate-prompt error", err);
    return res.status(500).json({ error: err.message || "Test evaluation failed" });
  }
};
