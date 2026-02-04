// backend/lib/evaluation.js
import { extractFramesFromUrl } from "./ffmpeg.js";
import { chooseModelForEvent, callModel } from "./providers/index.js";
import { loadPrompt } from "./prompts/runtime.js";

export async function evaluateSingleEvent(evt, category, playerId, sessionId, userTier) {
  if (!evt || !evt.url || typeof evt.eventIndex !== "number") {
    return {
      playerId,
      eventIndex: evt?.eventIndex ?? null,
      sessionId,
      success: false,
      error: "Invalid event payload"
    };
  }

  try {
    const frames = await extractFramesFromUrl(evt.url, 6);
    const provider = chooseModelForEvent(evt, userTier);
    const { systemPrompt, userPrompt } = await loadPrompt(category);

    const response = await callModel(provider, {
      frames,
      systemPrompt,
      userPrompt: userPrompt(frames)
    });

    return {
      playerId,
      eventIndex: evt.eventIndex,
      sessionId,
      success: true,
      provider,
      subcategoryResults: response,
      rawResponse: response
    };

  } catch (err) {
    return {
      playerId,
      eventIndex: evt.eventIndex,
      sessionId,
      success: false,
      error: err.message || "Unknown error"
    };
  }
}