// backend/api/save-players.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let players;
  try {
    players = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!Array.isArray(players)) {
    return res.status(400).json({ error: "Expected an array of players" });
  }

  const rows = players.map(p => ({
    id: p.id,
    team_id: p.teamId || null,
    data: p
  }));

  const { error } = await supabase
    .from("players")
    .upsert(rows, { onConflict: "id" });

  if (error) {
    console.error("save-players error:", error);
    return res.status(500).json({ error: "Failed to save players" });
  }

  return res.status(200).json({ success: true });
});
