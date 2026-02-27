import jwt from "jsonwebtoken";
import { VERIFY_TOKEN } from "../../utility/success_codes.js";

const checkToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        success_code: VERIFY_TOKEN.TOKEN_REQUIRED.code,
        message: VERIFY_TOKEN.TOKEN_REQUIRED.message,
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.customer = {
      id: decoded.id,
      phone_number: decoded.phone_number,
      phone_code: decoded.phone_code,
      name: decoded.name,
    };

    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        success_code: VERIFY_TOKEN.INVALID_TOKEN.code,
        message: VERIFY_TOKEN.INVALID_TOKEN.message,
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        success_code: VERIFY_TOKEN.EXPIRED_TOKEN.code,
        message: VERIFY_TOKEN.EXPIRED_TOKEN.message,
      });
    }

    return res.status(500).json({
      success: false,
      success_code: VERIFY_TOKEN.AUTHENTICATION_FAILED.code,
      message: VERIFY_TOKEN.AUTHENTICATION_FAILED.message,
    });
  }
};

export default checkToken;
