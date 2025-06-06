import { Request, Response } from "express";
import { User } from "../models/userSchema";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../utils/token/generateToken";
import bcrypt from "bcryptjs";
import { RefrteshToken } from "../models/refreshTokenSchema";

export const register = async (req: Request, res: Response) => {
  const { name, email, password, phoneNumber } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      phoneNumber,
    });
    await newUser.save();

    res.status(201).json({
      success:true,
      message: "User registered successfully",
      user: {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        phoneNumber:newUser.phoneNumber
      },
    });
  } catch (error) {
    res.status(500).json({success:false, message: "Server error", error });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({success:false, message: "Invalid email or password" });
    }

    const accessToken = generateAccessToken(user._id.toString());
    const refreshToken = generateRefreshToken(user._id.toString());

    await new RefrteshToken({
      token: refreshToken,
      userId: user._id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    }).save();

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
       maxAge: 24 * 60 * 60 * 1000 * 7,
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 2 * 60 * 1000 
    });

    res.status(200).json({
      success:true,
      message: "Login successful",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phoneNumber:user.phoneNumber
      },
    });
  } catch (error) {
    res.status(500).json({ success:false,message: "Server error", error });
  }
};
