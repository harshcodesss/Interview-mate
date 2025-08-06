import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Interview } from "../models/interview.models.js";


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

    await User.findByIdAndUpdate(
        userId,
        { $push: { interviews: interview._id } },
        { new: true }
    );

    return res.status(200).json(new ApiResponse(200, "OK", interview));
});