// backend/api/load-players.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const teamId = req.query.teamId;

  let query = supabase.from("players").select("data");

  if (teamId) {
    query = query.eq("team_id", teamId);
  }

  const { data, error } = await query;

  if (error) {
    console.error("load-players error:", error);
    return res.status(500).json({ error: "Failed to load players" });
  }

  const players = data.map(row => row.data);

  return res.status(200).json(players);
});