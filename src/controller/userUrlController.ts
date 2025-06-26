import { Request, Response } from "express";
import { Url } from "../models/urlSchema";
import crypto from "crypto";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constants";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId?: string;
  };
}

const BASE_URL = process.env.BASE_URL || "http://localhost:5000/api/user";

const urlRegex = /^(https?:\/\/)([\w-]+\.)+[\w-]{2,}(\/[\w\-._~:/?#[\]@!$&'()*+,;=%%]*)?(\?.*)?(#.*)?$/i;

const ensureProtocol = (url: string): string => {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return `https://${url}`;
  }
  return url;
};

const generateShortCode = (length: number = 6): string => {
  return crypto
    .randomBytes(Math.ceil((length * 3) / 4))
    .toString("base64url")
    .slice(0, length);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url); 
    return urlRegex.test(url); 
  } catch {
    return false;
  }
};

export const createUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { longUrl, customUrl } = req.body as {
      longUrl: string;
      customUrl?: string;
    };
    const userId = req!.user!.userId || "";

    if (!longUrl) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: ERROR_MESSAGES.MISSING_PARAMETERS });
      return;
    }

    const validUrl = ensureProtocol(longUrl);
     if (!isValidUrl(validUrl)) {
      res
        .status(HTTP_STATUS.BAD_REQUEST)
        .json({ success: false, message: ERROR_MESSAGES.VALIDATION_ERROR });
      return;
    }

    let shortCode: string;
    if (customUrl) {
      const existingCustom = await Url.findOne({ shortCode: customUrl }).lean();
      if (existingCustom) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.CUSTOM_URL_EXISTS,
        });
        return;
      }
      shortCode = customUrl;
    } else {
      shortCode = generateShortCode();
      let existingUrl = await Url.findOne({ shortCode }).lean();
      while (existingUrl) {
        shortCode = generateShortCode();
        existingUrl = await Url.findOne({ shortCode }).lean();
      }
    }

    const shortUrl = `${BASE_URL}/${shortCode}`;

    const urlExist = await Url.findOne({longUrl,userId})

    if(urlExist){
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success:false,
        message:ERROR_MESSAGES.URL_EXISTING
      })
      return
    }

    const url = new Url({
      longUrl: validUrl,
      shortUrl,
      shortCode,
      customUrl: customUrl || null,
      userId,
      clicks: [],
      createdAt: new Date(),
    });

    await url.save();

    const urlWithVirtuals = await Url.findById(url._id).lean(); // Include virtuals

    if (!urlWithVirtuals) {
      throw new Error("");
    }

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: SUCCESS_MESSAGES.URL_SHORTENED,
      data: {
        id: urlWithVirtuals._id.toString(),
        shortUrl: urlWithVirtuals.shortUrl,
        longUrl: urlWithVirtuals.longUrl,
        shortCode: urlWithVirtuals.shortCode,
        customUrl: urlWithVirtuals.customUrl,
        createdAt: urlWithVirtuals.createdAt.toISOString(),
        totalClicks: urlWithVirtuals.totalClicks,
      },
    });
  } catch (error) {
    console.error("URL creation error:", error);
   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const redirect = async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("Reaching redirect ...");
    const { shortCode } = req.params;
    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.SHORT_URL_NOT_FOUND,
      });
      return;
    }

    const redirectUrl = ensureProtocol(urlDoc.longUrl);
    if (!isValidUrl(redirectUrl)) {
     res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: ERROR_MESSAGES.VALIDATION_ERROR,
      });
      return;
    }
  
    const clickData = {
      timestamp: new Date(),
      referrer: req.headers.referer || "Direct",
      userAgent: req.headers["user-agent"] || "Unknown",
      ip: req.ip || req.connection.remoteAddress || "Unknown",
      country: (req.headers["cf-ipcountry"] as string) || "Unknown",
    };
    urlDoc.clicks.push(clickData);
    urlDoc.lastClicked = new Date();
    urlDoc.totalClicks += 1;
    await urlDoc.save();
   
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error("Redirect error:", error);
   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const getUrls = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const urls = await Url.find({ userId: req.user?.userId })
      .sort({ createdAt: -1 })
      .lean();

    const urlsWithStats = urls.map((url) => ({
      id: url._id.toString(),
      shortUrl: url.shortUrl,
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      customUrl: url.customUrl,
      createdAt: url.createdAt.toISOString(),
      totalClicks: url.totalClicks,
      lastClicked:
        url.clicks.length > 0
          ? url.clicks[url.clicks.length - 1].timestamp.toISOString()
          : null,
    }));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      data: urlsWithStats,
    });
  } catch (error) {
    console.error("Error fetching URLs:", error);
   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const deleteUrl = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { urlId } = req.params as { urlId: string };

    const userId = req!.user!.userId || undefined;

    const deletedUrl = await Url.findOneAndDelete({ _id: urlId, userId });
     if (!deletedUrl) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.REQUEST_NOT_FOUND,
      });
      return;
    }

   res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DELETE_SUCCESS,
    });
  } catch (error) {
    console.error("Delete error:", error);
   res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
  }
};

export const logout = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
   res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.LOGOUT_SUCCESS,
    });
  } catch (error) {
    console.log("Logout error", error);
  }
};
