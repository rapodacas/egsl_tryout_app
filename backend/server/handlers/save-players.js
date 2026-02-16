// backend/handlers/save-players.js
import supabase from "../../lib/supabase.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { players, teamId } = req.body;

  if (!teamId) {
    return res.status(400).json({ error: "Missing teamId" });
  }

  if (!Array.isArray(players) || players.length === 0) {
    return res.status(400).json({ error: "players must be a non-empty array" });
  }

  const rows = players.map(p => ({
    id: p.id,
    team_id: teamId,
    data: p,
    updated_at: new Date().toISOString()
  }));

  const { error } = await supabase.from("players").upsert(rows);

  if (error) {
    console.error("save-players error:", error);
    return res.status(500).json({ error: "Failed to save players" });
  }

  return res.status(200).json({ ok: true, count: players.length });
};
