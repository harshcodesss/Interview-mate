// id string pk
//   interviewId objectId interview
//   prompt string
//   answer string
//   score number 
//   remarks string 
//   createdAt Date
//   updatedAt Date

import mongoose, { Schema } from "mongoose";

const questionSchema = new Schema({
    interviewId: {
        type: Schema.Types.ObjectId,
        ref: "Interview",
        required: true,
    },
    prompt: {
        type: String,
        required: true,
    },
    answer: {
        type: String,
    },
    score: {
        type: Number,
    },
    remarks: {
        type: String,
    },
},{
    timestamps: true,
});

export const Question =mongoose.model("Question", questionSchema);