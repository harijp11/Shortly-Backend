import { ObjectId } from "mongoose";

export interface IUser extends Document {
  _id:ObjectId
  name: string;
  email: string;
  phoneNumber:number;
  password: string;
  createdAt:Date;
  updatedAt:Date
}