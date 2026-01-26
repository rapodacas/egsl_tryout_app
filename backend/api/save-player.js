// backend/api/save-player.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  let player;
  try {
    player = JSON.parse(req.body);
  } catch (err) {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (!player.id) {
    return res.status(400).json({ error: "Player must have an id" });
  }

  const { error } = await supabase
    .from("players")
    .update({ data: player })
    .eq("id", player.id);

  if (error) {
    console.error("save-player error:", error);
    return res.status(500).json({ error: "Failed to save player" });
  }

  return res.status(200).json({ success: true });
});
