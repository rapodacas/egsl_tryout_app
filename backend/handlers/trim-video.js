// backend/handlers/trim-video.js
const { supabase } = require("../lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { supabasePath, playerId, sessionId, category, filename } = req.body || {};

  if (!supabasePath || !playerId || !sessionId || !category || !filename) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const edgeUrl = `${process.env.SUPABASE_URL}/functions/v1/trim-video`;

    const edgeRes = await fetch(edgeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`
      },
      body: JSON.stringify({
        supabasePath,
        playerId,
        sessionId,
        category,
        filename
      })
    });

    const data = await edgeRes.json();

    return res.status(edgeRes.status).json(data);

  } catch (err) {
    console.error("trim-video error", err);
    return res.status(500).json({ error: err.message });
  }
};
