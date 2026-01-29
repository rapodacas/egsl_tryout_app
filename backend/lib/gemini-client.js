// backend/lib/gemini-client.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

function getGeminiModel() {
  return genAI.getGenerativeModel({ model: "gemini-2.0-pro-exp" });
}

module.exports = { getGeminiModel };
