// backend/handlers/evaluate-media.js
const { supabase } = require("../lib/supabase");
const { evaluateSingleEvent } = require("../lib/evaluation");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { events, playerId, sessionId, category, userTier = "free" } = req.body || {};

  if (!events?.length) {
    return res.status(400).json({ error: "Missing or empty events array" });
  }

  if (!playerId || !sessionId || !category) {
    return res.status(400).json({ error: "Missing playerId, sessionId, or category" });
  }

  const evaluations = [];
  let successCount = 0;

  for (const evt of events) {
    const result = await evaluateSingleEvent(evt, category, playerId, sessionId, userTier);
    evaluations.push(result);
    if (result.success) successCount++;
  }

  const failureCount = evaluations.length - successCount;

  if (successCount === 0) {
    return res.status(500).json({
      error: "All events failed to evaluate.",
      evaluations,
      partialFailure: false
    });
  }

  return res.status(200).json({
    evaluations,
    partialFailure: failureCount > 0,
    successCount,
    failureCount
  });
};
