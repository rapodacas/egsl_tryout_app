// backend/handlers/list-teams.js
const { supabase } = require("../lib/supabase");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return res.status(405).json({ error: "Method not allowed" });

  const { data, error } = await supabase
    .from("teams")
    .select("id, name")
    .order("name", { ascending: true });

  if (error) return res.status(500).json({ error: "Failed to load teams" });

  return res.status(200).json({ teams: data });
};
