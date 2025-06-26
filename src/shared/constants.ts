export enum HTTP_STATUS {
  OK = 200, // Request was successful
  CREATED = 201, // Resource successfully created
  BAD_REQUEST = 400, // Invalid request
  NOT_FOUND = 404, // Resource not found
  INTERNAL_SERVER_ERROR = 500, // Generic server error
  UNAUTHORIZED = 401, // Unauthorized access
}

export const SUCCESS_MESSAGES = {
  CREATED: "Successfully created",
  DELETE_SUCCESS: "URL deleted successfully",
  LOGOUT_SUCCESS: "Logged out successfully",
  OPERATION_SUCCESS: "Action completed",
  DATA_RETRIEVED: "Data loaded",
  URL_SHORTENED:"Url shortened successfully",
  REGISTRATION_SUCCESS:"Registration completed successfully",
  LOGIN_SUCCESS:"LogIn successfully"
} as const;

export const ERROR_MESSAGES = {
  MISSING_PARAMETERS: "URL is required",
  VALIDATION_ERROR: "Invalid URL format",
  REQUEST_NOT_FOUND: "Short URL not found",
  SERVER_ERROR: "Failed to create short URL",
  ROUTE_NOT_FOUND: "Page not found",
  UNAUTHORIZED_ACCESS: "Not authorized",
  CUSTOM_URL_EXISTS : "Custom URL already exists",
  SHORT_URL_NOT_FOUND:"Url not found",
  EMAIL_EXISTS:"User already exist",
  USER_NOT_FOUND:"User not found",
  INVALID_CREDENTIALS:"Invalid credentials",
  URL_EXISTING:"You have already shorten this url"
} as const;
