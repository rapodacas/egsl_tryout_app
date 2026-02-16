// backend/handlers/delete-media.js
import supabase from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { paths } = req.body;
  if (!Array.isArray(paths)) return res.status(400).json({ error: "paths must be array" });

  const { error } = await supabase.storage.from("media").remove(paths);
  if (error) {
    console.error("Supabase delete error:", error);
    return res.status(500).json({ error: "Failed to delete media" });
  }

  return res.status(200).json({ success: true });
};
