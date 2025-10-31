// utils/jwt.js
const jwt = require("jsonwebtoken");

const SECRET = process.env.JWT_SECRET || "dev_secret_key";

// Génère un token
exports.generateToken = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, SECRET, { expiresIn });
};

// Vérifie et décode un token
exports.verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, SECRET);
  } catch (err) {
    return null;
  }
};
