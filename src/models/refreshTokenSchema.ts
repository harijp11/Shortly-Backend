// models/refreshToken.model.ts
import mongoose, { Schema } from 'mongoose';
import { IRefreshToken } from '../interfaces/refreshToken_interface';

const RefreshTokenSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    token: { type: String, required: true, unique: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

export const RefrteshToken = mongoose.model<IRefreshToken>('RefreshToken', RefreshTokenSchema);
