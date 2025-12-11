// middlewares/auth.js
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const userAuth = async (req, res, next) => {
  const token =
    req.headers.token ||
    req.headers["x-access-token"] ||
    req.headers.authorization;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized. Login again." });
  }

  try {
    // If header is "Bearer <token>" handle both cases:
    const raw = String(token).startsWith("Bearer ")
      ? String(token).split(" ")[1]
      : token;

    const tokenDecode = jwt.verify(raw, process.env.JWT_SECRET);

    if (!tokenDecode?.id) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized. Login again." });
    }

    // Attach a user object (minimal) to req
    req.user = { id: tokenDecode.id };
    next();
  } catch (error) {
    console.error("auth error:", error);
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

export default userAuth;
