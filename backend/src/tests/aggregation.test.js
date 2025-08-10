// tests/test.js
import dotenv from 'dotenv';
dotenv.config({ path: new URL('../../.env', import.meta.url).pathname });
import mongoose from "mongoose";
import { connectDB } from "../db/index.js";
import { ObjectId } from "mongodb";
import fs from "fs";

// Define a temporary schema/model for direct access
const QuestionSchema = new mongoose.Schema({}, { strict: false });
const Question = mongoose.model("Question", QuestionSchema, "questions");

async function runTest() {
  try {
    await connectDB();

    const results = await Question.aggregate([
      {
        $match: {
          interviewId: new ObjectId("68990011548ea6aa64384d0a"),
        },
      },
      {
        $project: {
          _id: 0,
          prompt: 1,
          answer: 1,
        },
      },
    ]);

    console.log("Full Results:", results);
    fs.writeFileSync("./results.json", JSON.stringify(results, null, 2));
    console.log("✅ Results saved to tests/results.json");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error running test:", error);
    process.exit(1);
  }
}

runTest();
