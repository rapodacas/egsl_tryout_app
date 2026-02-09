// backend/lib/history.js
const { supabase } = require("../supabase.js");

export default async function saveEvaluationHistory(entry) {
  const { error } = await supabase
    .from("player_evaluation_history")
    .insert({
      player_id: entry.playerId,
      category: entry.category,
      event_index: entry.eventIndex,
      provider: entry.provider,
      results: entry.results,
      raw_response: entry.rawResponse,
      frames_used: entry.framesUsed
    });

  if (error) throw new Error("Failed to save evaluation history");
}

export default async function loadEvaluationHistory(playerId, category = null) {
  let query = supabase
    .from("player_evaluation_history")
    .select("*")
    .eq("player_id", playerId)
    .order("created_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;

  if (error) throw new Error("Failed to load evaluation history");
  return data;
}
