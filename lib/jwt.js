import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "eatscan_super_secure_jwt_secret_key_2026";

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
