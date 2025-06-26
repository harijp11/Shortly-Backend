export const COOKIE_CONFIG = {
  ACCESS_TOKEN_NAME: process.env.COOKIE_ACCESS_TOKEN_NAME || "accessToken",
  REFRESH_TOKEN_NAME: process.env.COOKIE_REFRESH_TOKEN_NAME || "refreshToken",
  SECURE: process.env.COOKIE_SECURE === "true",
  HTTP_ONLY: process.env.COOKIE_HTTP_ONLY === "true",
  MAX_AGE: Number(process.env.COOKIE_MAX_AGE_DAYS || "7") * 24 * 60 * 60 * 1000, // Convert days to ms
};
