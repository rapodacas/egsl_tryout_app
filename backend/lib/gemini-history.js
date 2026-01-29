// backend/lib/gemini-history.js
const { supabase } = require("./supabase");

const TABLE = "player_gemini_history";

async function loadHistory(playerId) {
  const { data, error } = await supabase
    .from(TABLE)
    .select("history")
    .eq("player_id", playerId)
    .single();

  if (error && error.code !== "PGRST116") {
    console.error("loadHistory error", error);
    throw error;
  }

  return data?.history || [];
}

async function saveHistory(playerId, history) {
  const { error } = await supabase
    .from(TABLE)
    .upsert(
      { player_id: playerId, history },
      { onConflict: "player_id" }
    );

  if (error) {
    console.error("saveHistory error", error);
    throw error;
  }
}

module.exports = { loadHistory, saveHistory };
