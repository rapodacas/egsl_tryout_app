// backend/lib/providers/groq.js
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function callGroqModel({ frames, systemPrompt, userPrompt }) {
  const response = await groq.chat.completions.create({
    model: "llama-3.1-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ],
    temperature: 0.2
  });

  return JSON.parse(response.choices[0].message.content);
}
