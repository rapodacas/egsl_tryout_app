const supabase_pw = '5kegw07tjzrOc28g';
//SUPABASE_URL = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZmd0dnFudnVpZHh6aWhvcndhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkzOTczNDYsImV4cCI6MjA4NDk3MzM0Nn0.Ftm6BsWhvAGJndbhSBM3VV5LrwnaFCFNqs4uzRMwibI'
//SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZmd0dnFudnVpZHh6aWhvcndhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTM5NzM0NiwiZXhwIjoyMDg0OTczMzQ2fQ.0aWgUDLHxUhkAKX4iluVfDj6H7lYXXXWmUfTpXj-47c'
// backend/api/upload.js

// backend/api/upload.js

const Busboy = require("busboy");
const { createClient } = require("@supabase/supabase-js");
const { withCors } = require("./_cors");

export const config = {
  api: {
    bodyParser: false
  }
};

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const busboy = Busboy({ headers: req.headers });
  let fileBuffer = null;
  let filename = "upload.bin";
  const fields = {};

  busboy.on("field", (name, value) => {
    fields[name] = value;
  });

  busboy.on("file", (name, file, info) => {
    filename = fields.filename || info.filename || "upload.bin";
    const chunks = [];
    file.on("data", chunk => chunks.push(chunk));
    file.on("end", () => {
      fileBuffer = Buffer.concat(chunks);
    });
  });

  await new Promise(resolve => {
    busboy.on("finish", resolve);
    req.pipe(busboy);
  });

  // Required fields
  if (!fileBuffer) {
    return res.status(400).json({ error: "Missing file" });
  }
  if (!fields.playerId) {
    return res.status(400).json({ error: "Missing playerId" });
  }
  if (!fields.sessionId) {
    return res.status(400).json({ error: "Missing sessionId" });
  }
  if (!fields.category) {
    return res.status(400).json({ error: "Missing category" });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // Build predictable folder structure
  const folderPath = `${fields.playerId}/${fields.sessionId}/${fields.category}`;
  const fullPath = `${folderPath}/${filename}`;

  // Upload to Supabase
  const { data, error } = await supabase.storage
    .from("media")
    .upload(fullPath, fileBuffer, {
      contentType: fields.mimeType || "application/octet-stream",
      upsert: false
    });

  if (error) {
    console.error("Supabase upload error:", error);
    return res.status(500).json({ error: "Upload failed" });
  }

  // Build public URL
  const publicUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/media/${fullPath}`;

  return res.status(200).json({
    path: fullPath,
    publicUrl
  });
});

