// backend/api/list-teams.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { data, error } = await supabase
      .from("teams")
      .select("name")
      .order("name", { ascending: true });

    if (error) {
      console.error("list-teams error:", error);
      return res.status(500).json({ error: "Failed to load teams" });
    }

    const teamNames = data.map(t => t.name);

    return res.status(200).json({ teams: teamNames });
  } catch (err) {
    console.error("list-teams unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});
