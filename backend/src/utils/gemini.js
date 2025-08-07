import dotenv from 'dotenv';
dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });

// import { GoogleGenAI } from "@google/genai";

// const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });


import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

let chat; // Maintain this instance per interview

export async function getGeminiResponse(prompt) {
  // Initialize chat once if not already initialized
  if (!chat) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    chat = await model.startChat({
      history: [], // You can preload initial history if needed
    });
  }

  const result = await chat.sendMessage(prompt);

  return {
    text: result.response.text(),
    updatedHistory: chat.getHistory(), // in case you want to save or inspect
  };
}
