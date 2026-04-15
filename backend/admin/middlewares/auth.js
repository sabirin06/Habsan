import jwt from "jsonwebtoken";

export const verifyAdminToken = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.admin = decoded; // 👈 THIS makes req.admin.id available
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};
