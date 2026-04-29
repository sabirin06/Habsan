import jwt from "jsonwebtoken";
import Seller from "../../configs/models/models/seller.js";
export const verifyToken = async (req, res, next) => {
  try {
    // Get token from cookie
    const token = req.cookies.seller_auth_token;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const seller = await Seller.findById(decoded.id).populate("country_id");
    if (
      !seller ||
      seller?.status === "pending" ||
      seller?.status === "rejected"
    ) {
      return res.status(403).json({
        success: false,
        message: "Account is under review or account is rejected for approval",
      });
    }
    req.seller = {
      id: seller._id,
      email: seller.email,
      phone_number: seller.phone_number,
    };

    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};
