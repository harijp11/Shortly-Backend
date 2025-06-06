import mongoose, { Schema } from "mongoose";
import { IUser } from "../interfaces/user_interface";


const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber:{type:Number},
    password: { type: String, required: true },
  },
  { timestamps: true }
);

export const User =mongoose.model<IUser>('User', UserSchema);