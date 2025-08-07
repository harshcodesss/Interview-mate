import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// This function is fully compatible with your `geminiHistory` schema
export async function getGeminiResponse(prompt, history = []) {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const chat = model.startChat({ history });

  const result = await chat.sendMessage(prompt);

  // ✅ Await history because it returns a Promise
  const historyArray = await chat.getHistory();

  // ✅ Map into plain JSON that matches your schema
  const plainHistory = historyArray.map(msg => ({
    role: msg.role,
    parts: msg.parts.map(part => ({
      text: part.text
    }))
  }));

  return {
    text: result.response.text(),
    updatedHistory: plainHistory
  };
}


