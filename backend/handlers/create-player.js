// backend/handlers/create-player.js
import { supabase } from "lib/supabase";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let player;
  try {
    player = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!player.id) {
    return res.status(400).json({ error: "Player must have an id" });
  }

  const { error } = await supabase
    .from("players")
    .insert({
      id: player.id,
      team_id: player.teamId || null,
      data: player
    });

  if (error) {
    console.error("create-player error:", error);
    return res.status(500).json({ error: "Failed to create player" });
  }

  return res.status(201).json({ ok: true, player });
};
