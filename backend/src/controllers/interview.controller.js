import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.models.js";
import { Question } from "../models/question.models.js";
import { getGeminiResponse } from "../utils/gemini.js";

function generateFirstQuestionPrompt(type, role) {
    return `You are a professional interviewer conducting a mock interview for the role of **${role}**. 
  The candidate has selected an interview type of **${type}**.
  
  Your goal is to simulate a realistic interview:
  - Ask a total of 4 to 5 main questions tailored to the role and interview type.
  - Begin by asking the **first main question**, along with 1–2 short and relevant follow-up questions.
  - As the conversation continues, ask the next main question only after the candidate responds to the current one.
  - Keep each question clear and concise.
  - Do not go into deep technical detail too early; gradually build the difficulty.
  - Remember, your tone should be professional but friendly.
  
  Now, generate the **first main question and its follow-up(s)** to begin the interview. and only and only return question in response`;
  }
  


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

    const interviewId=interview._id;

    const prompt=generateFirstQuestionPrompt(type, role);
    const { text, updatedHistory } = await getGeminiResponse(prompt);
    const response = text;
      
    interview.geminiHistory = updatedHistory;
    await interview.save();


    if(!response){
        throw new ApiError(500,"Error generating first question");
    }

    const question = await Question.create({
        interviewId,
        prompt: response,
        answer: "",
        score: 0,
        remarks: "",
    });

    await Interview.findByIdAndUpdate(
        interviewId,
        { $push: { questions: question._id } },
        { new: true }
    );
      
    await User.findByIdAndUpdate(
        userId,
        { $push: { interviews: interview._id } },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, "OK", interview, question));
});


export { startInterview };