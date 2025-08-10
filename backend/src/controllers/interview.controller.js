import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.models.js";
import { Question } from "../models/question.models.js";
import { getGeminiResponse } from "../utils/gemini.js";
import { Feedback } from "../models/feedback.model.js";

function generateFirstQuestionPrompt(type, role) {
  return `You are a professional interviewer conducting a mock interview for the role of **${role}**. 
  The candidate has selected an interview type of **${type}**.
  
  Your goal is to simulate a realistic interview:
  - Ask a total of 4 to 5 main questions tailored to the role and interview type.
  - Begin by asking the **first main question**.
  - As the conversation continues, ask the next main question only after the candidate responds to the current one.
  - Keep each question clear and concise.
  - Do not go into deep technical detail too early; gradually build the difficulty.
  - Remember, your tone should be professional but friendly.
  
  Now, generate the **first main question and its follow-up(s)** to begin the interview. and only and only return question in response`;
}

const generateFeedbackPrompt = () => {
  return `
You are an interview evaluator AI. Your task is to read the full conversation history between the interviewer (role: "user") and the candidate (role: "model"), and then produce feedback in **strict JSON format**.

The JSON must match this schema exactly:

{
  "summary": "string — A concise 2–3 sentence summary of the candidate's overall performance",
  "strengths": ["string", "string", "... — list of key strengths shown during the interview"],
  "weaknesses": ["string", "string", "... — list of weaknesses or areas needing improvement"],
  "suggestions": ["string", "string", "... — actionable advice for the candidate to improve"],
  "scoreBreakdown": {
    "communication": number,   // score out of 10
    "problemSolving": number,  // score out of 10
    "technicalKnowledge": number, // score out of 10
    "overall": number          // overall score out of 10
  }
}

Rules:
1. ONLY output valid JSON. Do not include any explanations, notes, or text outside of the JSON object.
2. Every array must contain at least 2 elements.
3. Scores must be integers from 1 to 10.
4. The "overall" score in scoreBreakdown should be an average of the category scores (rounded to nearest integer).
5. Be constructive but concise — focus on the most important points.
6. Assume the interview is for a technical role unless stated otherwise in history.

Now, based on the following conversation history, provide the feedback JSON.
`;
};

const startInterview = asyncHandler(async (req, res) => {
  const { title, type, role } = req.body;
  if (!title || !type || !role) {
    throw new ApiError(400, "All fields (title, type, role) are required.");
  }
  const userId = req?.user?.id;
  if (!userId) {
    throw new ApiError(501, "Unauthorized - user not found in request");
  }
  const interview = await Interview.create({
    title,
    type,
    role,
    userId,
    startedAt: new Date(),
    questions: [],
  });

  console.log(interview);

  const interviewId = interview._id;

  const prompt = generateFirstQuestionPrompt(type, role);
  const { text, updatedHistory } = await getGeminiResponse(prompt);
  const response = text;

  interview.geminiHistory = updatedHistory;
  await interview.save();

  if (!response) {
    throw new ApiError(500, "Error generating first question");
  }

  const question = await Question.create({
    interviewId,
    prompt: response,
    answer: "",
    remarks: "",
  });

  await Interview.findByIdAndUpdate(
    interviewId,
    { $push: { questions: question._id } },
    { new: true },
  );

  await User.findByIdAndUpdate(
    userId,
    { $push: { interviews: interview._id } },
    { new: true },
  );

  return res.status(200).json(new ApiResponse(200, "OK", interview, question));
});

const askQuestion = asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const interviewId = req.params.id;

  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  const previousquestion = await Question.findById(
    interview.questions[interview.questions.length - 1],
  );

  if (!previousquestion) {
    throw new ApiError(404, "Question not found");
  }
  previousquestion.answer = answer;
  await previousquestion.save();

  interview.geminiHistory.push({
    role: "user",
    parts: [{ text: answer }],
  });

  const cleanHistory = interview.geminiHistory.map((msg) => ({
    role: msg.role,
    parts: msg.parts.map((p) => ({ text: p.text })),
  }));

  const { text, updatedHistory } = await getGeminiResponse(
    `You are conducting a ${interview.type} interview for the role of ${interview.role}.
        Based on the conversation so far, ask the next interview question.
        Keep it concise and relevant.`,
    cleanHistory,
  );

  interview.geminiHistory = updatedHistory;
  await interview.save();

  const question = await Question.create({
    interviewId,
    prompt: text,
    answer: "",
    score: 0,
    remarks: "",
  });

  await Interview.findByIdAndUpdate(
    interviewId,
    { $push: { questions: question._id } },
    { new: true },
  );

  return res
    .status(200)
    .json(new ApiResponse(200, "Next question generated", question));
});

const endInterview = asyncHandler(async (req, res) => {
  const interviewId = req.params.id;
  const interview = await Interview.findById(interviewId);
  if (!interview) {
    throw new ApiError(404, "Interview not found");
  }

  interview.endedAt = new Date();
  const cleanHistory = interview.geminiHistory.map((msg) => ({
    role: msg.role,
    parts: msg.parts.map((p) => ({ text: p.text })),
  }));

  const feedbackPrompt = generateFeedbackPrompt();

  const { text: feedbackText, updatedHistory } = await getGeminiResponse(
    feedbackPrompt,
    cleanHistory,
  );

  let feedbackData;
  try {
    const cleanedText = feedbackText
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();
    feedbackData = JSON.parse(cleanedText);
  } catch (err) {
    throw new ApiError(500, "Gemini returned invalid JSON: " + feedbackText);
  }

  const feedback = await Feedback.create({
    interviewId,
    summary: feedbackData.summary,
    strengths: feedbackData.strengths,
    weaknesses: feedbackData.weaknesses,
    suggestions: feedbackData.suggestions,
    scoreBreakdown: feedbackData.scoreBreakdown,
  });

  interview.geminiHistory = updatedHistory;
  interview.feedbackId = feedback._id;
  await interview.save();

  return res
    .status(200)
    .json(
      new ApiResponse(200, "Interview ended and feedback generated", interview),
    );
});

export { startInterview, askQuestion, endInterview };
