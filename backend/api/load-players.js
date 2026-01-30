// backend/api/load-players.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async (req, res) => {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { teamId } = req.query;

  if (!teamId) {
    return res.status(400).json({ error: "Missing teamId" });
  }

  const { data, error } = await supabase
    .from("players")
    .select("*")
    .eq("team_id", teamId);

  if (error) {
    console.error("load-players error:", error);
    return res.status(500).json({ error: "Failed to load players" });
  }

  return res.status(200).json(data);
});
