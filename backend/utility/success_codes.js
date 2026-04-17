export const VERIFY_TOKEN = {
  TOKEN_REQUIRED: {
    code: 2000,
    message: "Token is required for authentication.",
  },
  INVALID_TOKEN: { code: 2001, message: "Invalid authentication token." },
  EXPIRED_TOKEN: {
    code: 2002,
    message: "Authentication token expired. Please login again.",
  },
  AUTHENTICATION_FAILED: {
    code: 2099,
    message: "Authentication failed. Please try again.",
  },
};
export const CUSTOMER = {
  PROFILE_COMPLETED_SUCCESSFULLY: {
    code: 3000,
    message: "User profile completed successfully",
  },
  PHONE_NUMBER_REQUIRED: {
    code: 3001,
    message: "Phone number is required",
  },
  USER_NOT_FOUND: {
    code: 3002,
    message: "User not found",
  },
  INVALID_SEX_FIELD: {
    code: 3003,
    message: "Invalid or missing sex field",
  },
  USER_PROFILE_DETAILS_FETCHED_SUCCESSFULLY: {
    code: 3004,
    message: "User profile details fetched successfully",
  },
  PROFILE_UPDATED_SUCCESSFULLY: {
    code: 3009,
    message: "User profile updated successfully",
  },
};


export const COMMON = {
  INTERNAL_SERVER_ERROR: { code: 1099, message: "Internal server error" },
  MISSING_REQUIRED_FIELDS: { code: 1100, message: "Missing required fields" },
};
