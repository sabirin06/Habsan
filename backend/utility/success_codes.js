export const CART_ERRORS = {
  ALL_FIELDS_REQUIRED: { code: 1000, message: "All fields are required" },
  CART_NOT_FOUND: { code: 1001, message: "Cart not found" },
  QUANTITY_MUST_BE_AT_LEAST_ONE: {
    code: 1002,
    message: "Quantity must be at least 1",
  },
  PRODUCT_NOT_FOUND: { code: 1003, message: "Product not found" },
  VARIANT_NOT_FOUND: { code: 1004, message: "Variant not found" },
  INSUFFICIENT_STOCK: { code: 1005, message: "Insufficient stock" },
  CART_ADDED_SUCCESSFULLY: {
    code: 1006,
    message: "Item added to cart successfully",
  },
  CART_NOT_FOUND: { code: 1007, message: "Cart not found for the customer" },
  ITEM_NOT_FOUND_IN_CART: { code: 1008, message: "Item not found in cart" },
  ITEM_REMOVED_SUCCESSFULLY: {
    code: 1009,
    message: "Item removed and cleared cart successfully",
  },
  ITEM_QUANTITY_UPDATED_SUCCESSFULLY: {
    code: 1010,
    message: "Item quantity updated successfully",
  },
  SERVER_ERROR: { code: 1099, message: "Internal server error" },
  CART_IS_EMPTY: { code: 1011, message: "Cart is empty" },
  CART_RETRIEVED_SUCCESSFULLY: {
    code: 1012,
    message: "Cart retrieved successfully",
  },
};

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

export const ORDER = {
  CUSTOMER_ID_REQUIRED: {
    code: 2025,
    message: "Customer ID is required",
  },
  ACTIVE_ORDERS_SUCCESSFULLY: {
    code: 2026,
    message: "Active orders fetched successfully",
  },
  COMPLETED_ORDERS_SUCCESSFULLY: {
    code: 2027,
    message: "Completed orders fetched successfully",
  },
  CANCELLED_ORDERS_SUCCESSFULLY: {
    code: 2028,
    message: "Cancelled orders fetched successfully",
  },
  ORDER_CREATED_SUCCESSFULLY: {
    code: 2029,
    message: "Order created successfully",
  },
  PAYMENT_FAILED: {
    code: 2030,
    message: "Payment failed. Please try again.",
  },
  INSUFFICIENT_WALLET_BALANCE: {
    code: 2031,
    message: "Insufficient wallet balance.",
  },
  ORDER_CODE_REQUIRED: {
    code: 2032,
    message: "Order code is required",
  },
  ORDER_NOT_FOUND: {
    code: 2033,
    message: "Order not found",
  },
  ORDER_TRACKED_SUCCESSFULLY: {
    code: 2034,
    message: "Order tracked successfully",
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

export const CHAT = {
  MESSAGE_SENT_SUCCESSFULLY: {
    code: 4000,
    message: "Message sent successfully",
  },
  MISSING_REQUIRED_FIELDS: {
    code: 4001,
    message: "Missing required fields",
  },
  IMAGE_FILE_MISSING: {
    code: 4002,
    message: "Image file is missing for image message type",
  },
  MESSAGE_CONTENT_MISSING: {
    code: 4003,
    message: "Message content is missing for text message type",
  },
};

export const SHIPPING_ADDRESS = {
  SHIPPING_ADDRESS_ADDED_SUCCESSFULLY: {
    code: 5000,
    message: "Shipping address added successfully",
  },
  SHIPPING_ADDRESS_LIST_FETCHED_SUCCESSFULLY: {
    code: 5001,
    message: "Shipping address list fetched successfully",
  },
  CUSTOMER_ID_REQUIRED: {
    code: 5002,
    message: "Customer ID is required",
  },
  DEFAULT_SHIPPING_ADDRESS_FETCHED_SUCCESSFULLY: {
    code: 5003,
    message: "Default shipping address fetched successfully",
  },
  SHIPPING_ADDRESS_UPDATED_SUCCESSFULLY: {
    code: 5004,
    message: "Shipping address updated successfully",
  },
  SHIPPING_ADDRESS_DELETED_SUCCESSFULLY: {
    code: 5005,
    message: "Shipping address deleted successfully",
  },
  SHIPPING_ADDRESS_NOT_FOUND: {
    code: 5006,
    message: "Shipping address not found",
  },
};

export const REVIEW = {
  REVIEWS_FETCHED_SUCCESSFULLY: {
    code: 6000,
    message: "Reviews fetched successfully",
  },
  REVIEW_SUBMITTED_SUCCESSFULLY: {
    code: 6000,
    message: "Review submitted successfully",
  },
  REVIEW_UPDATED_SUCCESSFULLY: {
    code: 6001,
    message: "Review updated successfully",
  },
};

export const WISHLIST = {
  ITEM_ADDED_TO_WISHLIST: {
    code: 7000,
    message: "Item added to wishlist successfully",
  },

  WISHLIST_NOT_FOUND: {
    code: 7001,
    message: "Wishlist not found for this customer",
  },

  TYPE_MUST_BE_PRODUCT_OR_SELLER: {
    code: 7002,
    message: "Type must be either 'product' or 'seller'",
  },

  ITEM_REMOVED_SUCCESSFULLY: {
    code: 7003,
    message: "Item removed from wishlist successfully",
  },
};

export const PRODUCT = {
  PRODUCTS_FETCHED_SUCCESSFULLY: {
    code: 9000,
    message: "Products fetched successfully",
  },
  PRODUCT_DETAILS_FETCHED_SUCCESSFULLY: {
    code: 9001,
    message: "Product details fetched successfully",
  },
};

export const SELLER = {
  SELLERS_FETCHED_SUCCESSFULLY: {
    code: 8000,
    message: "Sellers fetched successfully",
  },
  SELLER_GALLERY_FETCHED_SUCCESSFULLY: {
    code: 8001,
    message: "Seller gallery fetched successfully",
  },
  SELLER_INFO_FETCHED_SUCCESSFULLY: {
    code: 8003,
    message: "Seller info fetched successfully",
  },
  INVALID_TAB_PARAMETER: {
    code: 8002,
    message: "Invalid tab parameter",
  },
};

export const FILTER = {
  FILTERS_FETCHED_SUCCESSFULLY: {
    code: 10000,
    message: "Filters fetched successfully",
  },
};

export const COMMON = {
  INTERNAL_SERVER_ERROR: { code: 1099, message: "Internal server error" },
  MISSING_REQUIRED_FIELDS: { code: 1100, message: "Missing required fields" },
};
