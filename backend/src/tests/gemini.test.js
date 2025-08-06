import { getGeminiResponse } from '../utils/gemini.js';

async function testGemini() {
  try {
    const prompt = "Explain how AI works in a few words";
    const response = await getGeminiResponse(prompt);
    console.log("Gemini Response:", response);
  } catch (error) {
    console.error("Error testing Gemini API:", error);
  }
}

testGemini();
