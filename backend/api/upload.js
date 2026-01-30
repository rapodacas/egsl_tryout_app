// const supabase_pw = '5kegw07tjzrOc28g';
//SUPABASE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZmd0dnFudnVpZHh6aWhvcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTczNDYsImV4cCI6MjA4NDk3MzM0Nn0.Ftm6BsWhvAGJndbhSBM3VV5LrwnaFCFNqs4uzRMwibI'
//SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZmd0dnFudnVpZHh6aWhvcndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM5NzM0NiwiZXhwIjoyMDg0OTczMzQ2fQ.0aWgUDLHxUhkAKX4iluVfDj6H7lYXXXWmUfTpXj-47c'
// backend/api/upload.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

export const config = {
  api: {
    bodyParser: true // we only accept JSON now, no raw file stream
  }
};

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { playerId, sessionId, category, filename, mimeType } = req.body || {};

  if (!playerId) {
    return res.status(400).json({ error: "Missing playerId" });
  }
  if (!sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }
  if (!category) {
    return res.status(400).json({ error: "Missing category" });
  }
  if (!filename) {
    return res.status(400).json({ error: "Missing filename" });
  }

  // Keep your existing folder structure
  const folderPath = `${playerId}/${sessionId}/${category}`;
  const fullPath = `${folderPath}/${filename}`;

  // 1) Create a signed upload URL for this exact path
  const { data: signed, error: signedError } = await supabase.storage
    .from("media")
    .createSignedUploadUrl(fullPath);

  if (signedError) {
    console.error("Supabase signed upload URL error:", signedError);
    return res.status(500).json({ error: "Failed to create upload URL" });
  }

  // 2) Build public URL for later viewing
  const { data: publicData } = supabase.storage
    .from("media")
    .getPublicUrl(fullPath);

  const publicUrl = publicData?.publicUrl || null;

  return res.status(200).json({
    path: fullPath,
    uploadUrl: signed.signedUrl,
    publicUrl,
    contentType: mimeType || "application/octet-stream"
  });
});
