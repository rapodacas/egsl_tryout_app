// backend/lib/providers/index.js
import callGroqModel from "./groq.js";
import callOpenAIModel from "./openai.js";
import callGeminiStub from "./gemini.js";

export function chooseModelForEvent(event, userTier) {
  if (userTier === "pro") return "openai";
  return "groq";
}

export async function callModel(provider, frames) {
  switch (provider) {
    case "groq":
      return await callGroqModel(frames);
    case "openai":
      return await callOpenAIModel(frames);
    case "gemini":
      return await callGeminiStub(frames);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}