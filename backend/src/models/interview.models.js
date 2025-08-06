// id string pk
//   title string
//   type string
//   role string 
//   userId ObjectId user
//   questions ObjectId[] question
//   startedAt Date
//   endedAt Date
//   feedbackId ObjectId feedback
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";

const interviewSchema = new Schema({
    title: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        required: true,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    questions: [
        {
            type: Schema.Types.ObjectId,
            ref: "Question",
            required: true,
        },
    ],
    startedAt: {
        type: Date,
    },
    endedAt: {
        type: Date
    },
    feedbackId: {
        type: Schema.Types.ObjectId,
        ref: "Feedback",
    }
},{
    timestamps: true
});

export const Interview = mongoose.model("Interview", interviewSchema);