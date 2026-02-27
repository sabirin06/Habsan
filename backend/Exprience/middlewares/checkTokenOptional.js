import jwt from "jsonwebtoken";

const checkTokenOptional = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.customer = {
      id: decoded.id,
      phone_number: decoded.phone_number,
      phone_code: decoded.phone_code,
      name: decoded.name,
    };

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token.",
    });
  }
};

export default checkTokenOptional;
