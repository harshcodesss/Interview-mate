import openai from "../utils/gpt.js";
const testGPT = async () => {
  const chatCompletion = await openai.chat.completions.create({
    messages: [{ role: "user", content: "Hello GPT!" }],
    model: "gpt-3.5-turbo",
  });

  console.log(chatCompletion.choices[0].message.content);
};

testGPT();
