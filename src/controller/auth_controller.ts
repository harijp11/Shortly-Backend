import { Request, Response } from "express";
import { User } from "../models/userSchema";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token/generateToken";
import bcrypt from "bcryptjs";
import { RefrteshToken } from "../models/refreshTokenSchema";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constants";
import { COOKIE_CONFIG } from "../shared/config";

export const register = async (req: Request, res: Response) => {
  console.log("reached at registration")
  const { name, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.EMAIL_EXISTS,
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber:newUser.phoneNumber
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({success:false, message: ERROR_MESSAGES.SERVER_ERROR,});
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({success:false, message: ERROR_MESSAGES.INVALID_CREDENTIALS, });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await new RefrteshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

   res.cookie(COOKIE_CONFIG.REFRESH_TOKEN_NAME, refreshToken, {
  httpOnly: COOKIE_CONFIG.HTTP_ONLY,
  secure: COOKIE_CONFIG.SECURE,
  maxAge: COOKIE_CONFIG.MAX_AGE,
});

res.cookie(COOKIE_CONFIG.ACCESS_TOKEN_NAME, accessToken, {
  httpOnly: COOKIE_CONFIG.HTTP_ONLY,
  secure: COOKIE_CONFIG.SECURE,
  maxAge: COOKIE_CONFIG.MAX_AGE,
});

    res.status(HTTP_STATUS.OK).json({
      success:true,
      message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber:user.phoneNumber
      },
    });
  } catch (error) {
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success:false,message: ERROR_MESSAGES.SERVER_ERROR });
  }
};
