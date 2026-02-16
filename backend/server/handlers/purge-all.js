// backend/handlers/purge-all.js
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  const { data, error } = await supabase.storage
    .from("media")
    .list("", { recursive: true });

  if (error) {
    console.error("List error:", error);
    return res.status(500).json({ error: "List failed" });
  }

  const allPaths = data.map(obj => obj.name);

  if (allPaths.length === 0) {
    return res.status(200).json({ deleted: [] });
  }

  const { error: delErr } = await supabase.storage
    .from("media")
    .remove(allPaths);

  if (delErr) {
    console.error("Delete error:", delErr);
    return res.status(500).json({ error: "Delete failed" });
  }

  return res.status(200).json({ deleted: allPaths });
};
