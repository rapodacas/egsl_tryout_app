// backend/api/create-team.js
const { supabase } = require("../lib/supabase");
const { withCors } = require("./_cors");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { teamName } = req.body;

    if (!teamName || typeof teamName !== "string") {
      return res.status(400).json({ error: "Invalid teamName" });
    }

    // Insert or ignore if exists
    const { error } = await supabase
      .from("teams")
      .upsert(
        { name: teamName },
        { onConflict: "name" }
      );

    if (error) {
      console.error("create-team error:", error);
      return res.status(500).json({ error: "Failed to create team" });
    }

    return res.status(200).json({ success: true, teamName });
  } catch (err) {
    console.error("create-team unexpected error:", err);
    return res.status(500).json({ error: "Unexpected server error" });
  }
});
