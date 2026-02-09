// backend/handlers/upload.js
import { supabase } from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { playerId, sessionId, category, filename, mimeType } = req.body || {};

  if (!playerId || !sessionId || !category || !filename) {
    return res.status(400).json({ error: "Missing required fields: playerId, sessionId, category, filename" });
  }

  const folderPath = `${playerId}/${sessionId}/${category}`;
  const fullPath = `${folderPath}/${filename}`;

  const { data: signed, error: signedError } = await supabase.storage
    .from("media")
    .createSignedUploadUrl(fullPath);

  if (signedError) {
    console.error("Supabase signed upload URL error:", signedError);
    return res.status(500).json({ error: "Failed to create upload URL" });
  }

  const { data: publicData } = supabase.storage.from("media").getPublicUrl(fullPath);

  return res.status(200).json({
    path: fullPath,
    uploadUrl: signed.signedUrl,
    publicUrl: publicData?.publicUrl || null,
    contentType: mimeType || "application/octet-stream"
  });
};
