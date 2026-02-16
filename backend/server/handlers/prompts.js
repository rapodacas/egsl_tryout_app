// backend/handlers/prompts.js
import supabase from "../../lib/supabase.js";

export default async function handler(req, res) {
  const category = req.query.category;

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!category) {
    return res.status(400).json({ error: "Missing category" });
  }

  try {
    const { data, error } = await supabase
      .from("prompts")
      .select("*")
      .eq("category", category)
      .order("version", { ascending: false });

    if (error) throw error;

    const active = data.find(v => v.is_active);

    return res.status(200).json({
      versions: data,
      activeVersion: active?.version || null
    });
  } catch (err) {
    console.error("GET /api/prompts error:", err);
    return res.status(500).json({ error: "Failed to load prompts" });
  }
};
