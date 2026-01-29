// backend/api/evaluate-media.js
const { getGeminiModel } = require("../lib/gemini-client");
const { loadHistory, saveHistory } = require("../lib/gemini-history");
const { withCors } = require("./_cors");

module.exports = withCors(async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      playerId,
      teamId,
      category,
      sessionIndex,
      attachments
    } = req.body;

    if (!playerId || !attachments || attachments.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const model = getGeminiModel();

    // 1. Load history once
    let history = await loadHistory(playerId);

    const results = [];

    for (const att of attachments) {
      const { id: attachmentId, url, type } = att;

      // 2. Append user turn
      history.push({
        role: "user",
        parts: [
          {
            text: [
              `Team: ${teamId || "Unknown"}`,
              `Category: ${category}`,
              `Session index: ${sessionIndex}`,
              `Attachment ID: ${attachmentId}`,
              "",
              "Evaluate this clip for youth softball mechanics.",
              "Focus on strengths, weaknesses, and actionable coaching cues."
            ].join("\n")
          },
          {
            fileData: {
              mimeType: type === "video" ? "video/*" : "image/*",
              fileUri: url
            }
          }
        ]
      });

      // 3. Call Gemini
      const result = await model.generateContent({ contents: history });
      const text = result.response.text();

      // 4. Append model turn
      history.push({
        role: "model",
        parts: [{ text }]
      });

      // 5. Collect structured result
      results.push({
        attachmentId,
        summary: text,
        keyPoints: [],
        score: null,
        rawResponse: result.response
      });
    }

    // 6. Save updated history once
    await saveHistory(playerId, history);

    return res.status(200).json({ results });
  } catch (err) {
    console.error("evaluate-attachments error", err);
    return res.status(500).json({ error: "Gemini batch evaluation failed" });
  }
});