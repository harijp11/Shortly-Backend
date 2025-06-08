import { Request, Response } from 'express';
import { Url } from '../models/urlSchema';
import crypto from 'crypto';

export interface AuthenticatedRequest extends Request {
  user?:{
    userId?: string;
  }
}

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000/api/user';

const ensureProtocol = (url: string): string => {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return `https://${url}`;
  }
  return url;
};

const generateShortCode = (length: number = 6): string => {
  return crypto.randomBytes(Math.ceil(length * 3 / 4)).toString('base64url').slice(0, length);
};

const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const createUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { longUrl, customUrl } = req.body as { longUrl: string; customUrl?: string };
    const userId = req!.user!.userId || "";

    if (!longUrl) {
      res.status(400).json({ success: false, message: 'URL is required' });
      return;
    }

    const validUrl = ensureProtocol(longUrl);
    if (!isValidUrl(validUrl)) {
      res.status(400).json({ success: false, message: 'Invalid URL format' });
      return;
    }

    let shortCode: string;
    if (customUrl) {
      const existingCustom = await Url.findOne({ shortCode: customUrl }).lean();
      if (existingCustom) {
        res.status(400).json({ success: false, message: 'Custom URL already exists' });
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

    if(!urlWithVirtuals){
      throw new Error("")
    }

    res.status(201).json({
      success: true,
      message: "URL shortened successfully",
      data: {
        id: urlWithVirtuals._id.toString(),
        shortUrl: urlWithVirtuals.shortUrl,
        longUrl: urlWithVirtuals.longUrl,
        shortCode: urlWithVirtuals.shortCode,
        customUrl: urlWithVirtuals.customUrl,
        createdAt: urlWithVirtuals.createdAt.toISOString(),
        totalClicks: urlWithVirtuals.totalClicks,
      }
    });
  } catch (error) {
    console.error('URL creation error:', error);
    res.status(500).json({ success: false, message: 'Failed to create short URL' });
  }
};

export const redirect = async (req: Request, res: Response): Promise<void> => {
  try {
    const { shortCode } = req.params;
    const urlDoc = await Url.findOne({ shortCode });
    if (!urlDoc) {
      res.status(404).json({ success: false, message: 'Short URL not found' });
      return;
    }
    const redirectUrl = ensureProtocol(urlDoc.longUrl);
    if (!isValidUrl(redirectUrl)) {
      res.status(400).json({ success: false, message: 'Invalid URL format' });
      return;
    }
    const clickData = {
      timestamp: new Date(),
      referrer: req.headers.referer || 'Direct',
      userAgent: req.headers['user-agent'] || 'Unknown',
      ip: req.ip || req.connection.remoteAddress || 'Unknown',
      country: req.headers['cf-ipcountry'] as string || 'Unknown',
    };
    urlDoc.clicks.push(clickData);
    await urlDoc.save();
    console.log("redirect url",redirectUrl)
    res.redirect(302, redirectUrl);
  } catch (error) {
    console.error('Redirect error:', error);
    res.status(500).json({ success: false, message: 'An error occurred' });
  }
};

export const getUrls = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
   

const urls = await Url.find({ userId: req.user?.userId }).sort({ createdAt: -1 }).lean();

    const urlsWithStats = urls.map((url) => ({
      id: url._id.toString(),
      shortUrl: url.shortUrl,
      longUrl: url.longUrl,
      shortCode: url.shortCode,
      customUrl: url.customUrl,
      createdAt: url.createdAt.toISOString(),
      totalClicks: url.totalClicks,
      lastClicked: url.clicks.length > 0 ? url.clicks[url.clicks.length - 1].timestamp.toISOString() : null,
    }));

    res.json({
      success: true,
      data: urlsWithStats,
    });
  } catch (error) {
    console.error('Error fetching URLs:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch URLs' });
  }
};



export const deleteUrl = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { urlId } = req.params as {urlId:string};

    const userId = req!.user!.userId || undefined

    const deletedUrl = await Url.findOneAndDelete({ _id: urlId, userId});
    if (!deletedUrl) {
      res.status(404).json({ success: false, message: 'URL not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'URL deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete URL' });
  }
};

export const logout = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try{
    res.clearCookie("accessToken")
    res.clearCookie("refreshToken")
    res.status(200).json({
      success: true,
      message: "Logged out successfully",
    })
  }catch(error){
    console.log("Logout error",error)
  }
}