// backend/lib/providers/openai.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function callOpenAIModel({ frames, systemPrompt, userPrompt }) {
  const response = await openai.chat.completions.create({
    model: "o3-mini",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    response_format: { type: "json_object" },
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
}