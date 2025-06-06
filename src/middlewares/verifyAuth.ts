import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { RefrteshToken } from '../models/refreshTokenSchema';


export interface AuthenticatedRequest extends Request {
  user?: { userId: string };
}

export const verifyToken = (
  req: AuthenticatedRequest, 
  res: Response, 
  next: NextFunction
): void => {
  try {
    const token = req.cookies['accessToken']; // fixed name

    if (!token) {
       res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
      return
    }

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      res.status(500).json({
        success: false,
        message: 'Server configuration error'
      });
      return 
    }

    const decoded = jwt.verify(token, jwtSecret) as { _id: string };
    req.user = { userId: decoded._id };

    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
     res.status(401).json({ message: 'Token expired' });
    return 
    }
    console.error('Token verification error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};


export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies["refreshToken"]

    if (!refreshToken) {
      return res.status(401).json({ message: 'Refresh token missing' });
    }

    const storedToken = await RefrteshToken.findOne({ token: refreshToken });
    if (!storedToken) {
      return res.status(403).json({ message: 'Refresh token invalid or expired' });
    }

    const jwtSecret = process.env.JWT_SECRET!;
    const decoded = jwt.verify(refreshToken, jwtSecret) as { _id: string };

    const newAccessToken = jwt.sign({ _id: decoded._id }, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });

    res.cookie('accessToken', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    return res.status(200).json({ message: 'Access token refreshed' });

  } catch (error) {
    console.error('Error refreshing token:', error);
    return res.status(403).json({ message: 'Token refresh failed' });
  }
};


export const logoutIfRefreshTokenInvalid = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const refreshToken = req.cookies['refreshToken'];

  if (!refreshToken) {
    return forceLogout(res, 'No refresh token provided');
  }

  const refreshSecret = process.env.JWT_REFRESH_SECRET;
  if (!refreshSecret) {
    console.error('JWT_REFRESH_SECRET is missing in env');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  try {
    jwt.verify(refreshToken, refreshSecret);
    next(); // Refresh token is valid
  } catch (err) {
    return forceLogout(res, 'Invalid or expired refresh token');
  }
};

// helper function
const forceLogout = (res: Response, message: string) => {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });
  res.clearCookie('accessToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  });

  return res.status(401).json({
    success: false,
    message,
    loggedOut: true,
  });
};

