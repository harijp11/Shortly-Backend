
import jwt, { SignOptions } from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your_default_jwt_secret';
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || '2m') as SignOptions['expiresIn'];
const REFRESH_TOKEN_EXPIRES_IN = (process.env.REFRESH_TOKEN_EXPIRES_IN || '7d') as SignOptions['expiresIn'];

export const generateAccessToken = (userId: string): string => {
  const payload = { _id: userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

export const generateRefreshToken = (userId: string): string => {
  const payload = { _id: userId };
  return jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRES_IN });
};
