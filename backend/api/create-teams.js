// backend/api/create-team.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { teamName } = req.body;
  if (!teamName) return res.status(400).json({ error: "Invalid teamName" });

  const { data, error } = await supabase
    .from("teams")
    .insert({ name: teamName })
    .select("id, name")
    .single();

  if (error) return res.status(500).json({ error: "Failed to create team" });

  return res.status(200).json({ team: data });
});
