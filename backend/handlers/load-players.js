// backend/handlers/load-players.js
import supabase from "../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { teamId } = req.query;

  if (!teamId) {
    return res.status(400).json({ error: "Missing teamId" });
  }

  const { data, error } = await supabase
    .from("players")
    .select("id, team_id, data")
    .eq("team_id", teamId);

  if (error) {
    console.error("load-players error:", error);
    return res.status(500).json({ error: "Failed to load players" });
  }

  const players = data.map(row => ({
    ...row.data,
    id: row.id,
    teamId: row.team_id
  }));

  return res.status(200).json(players);
};
