// id string pk
//   interviewId ObjectId interviewId
//   summary string
//   strengths string[]
//   weaknesses string[]
//   suggestions string[]
//   scoreBreakdown object
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";

const feedbackSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
    },
    summary: {
        type: String,
        required: true,
    },
    strengths: {
        type: [String],
        required: true,
    },
    weaknesses: {
        type: [String],
        required: true,
    },
    suggestions: {
        type: [String],
        required: true,
    },
    scoreBreakdown: {
        type: Object,
        required: true,
    },
},{
    timestamps: true
});

export const Feedback = mongoose.model("Feedback", feedbackSchema);