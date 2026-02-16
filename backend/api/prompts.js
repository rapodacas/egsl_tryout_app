// backend/api/prompts.js
import { createPromptVersion } from "../lib/prompts/versioning.js";
import supabase from "../lib/supabase.js";
import { URL } from "url";
import { withCors } from "./_cors.js";

async function handler(req, res) {
  const { method } = req;

  // Parse query params manually
  const url = new URL(req.url, `http://${req.headers.host}`);
  const category = url.searchParams.get("category");

  // GET /api/prompts?category=hitting
  if (method === "GET") {
    if (!category) {
      return res.status(400).json({ error: "Missing category parameter" });
    }

    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("category", category)
      .eq("is_active", true)
      .order("version", { ascending: false })
      .limit(1);

    if (error) {
      return res.status(500).json({ error: "Failed to fetch prompt" });
    }

    if (!data || data.length === 0) {
      return res.status(404).json({ error: "No active prompt found" });
    }

    return res.status(200).json(data[0]);
  }

  // POST /api/prompts
  if (method === "POST") {
    // Parse body manually
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw || "{}");

    if (!body.category) {
      return res.status(400).json({ error: "Missing category in request body" });
    }

    try {
      const version = await createPromptVersion(body);
      return res.status(200).json({ version });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}

export default withCors(handler);
