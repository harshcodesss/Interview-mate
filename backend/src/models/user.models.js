// id string pk
//   fullname string
//   username string
//   email string
//   password string
//   avatar string
//   Interviews ObjectId[] interviews
//   refreshToken string

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },interviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Interview",
      }
    ],
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function(next){
  if(!this.isModified("password")) return next();
  this.password = bcrypt.hash(this.password, 10);
  next()
})

userSchema.methods.isPasswordCorrect = async function(password) {
  return password === this.password;
}

userSchema.methods.generateAccessToken= function(){
  //short lived access token
  console.log("invoked");
  return jwt.sign({
    _id: this._id,
    email: this.email,
    username: this.username
  },
    process.env.ACCESS_TOKEN_SECRET,
    {expiresIn: process.env.ACCESS_TOKEN_EXPIRY}
  )
}

userSchema.methods.generateRefreshToken= function(){
  return jwt.sign({
    _id: this._id
  },
    process.env.REFRESH_TOKEN_SECRET,
    {expiresIn: process.env.REFRESH_TOKEN_EXPIRY}
  )
}

export const User = mongoose.model("User", userSchema);
