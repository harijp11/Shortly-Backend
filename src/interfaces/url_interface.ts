import mongoose from "mongoose";

export interface IUrl extends Document {
  _id: string;
    shortUrl:string,
  longUrl: string;
  shortCode: string;
  userId?: mongoose.Types.ObjectId;
  clicks:number
  createdAt: Date;
}