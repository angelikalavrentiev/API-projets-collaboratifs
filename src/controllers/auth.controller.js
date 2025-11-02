// controllers/authController.js
const { generateToken, verifyJwtToken } = require("../utils/jwt");

exports.login = async (req, res) => {

    const { username, role } = req.body; // role = "Organizer" ou "Member"
    if (!username || !role) {
        return res.status(400).json({ message: "Le champ 'username' et 'role' sont requis" });
    }

    // On normalise pour éviter les conflits : minuscules et remplacer espaces par un point
    const normalizedUsername = username.trim().toLowerCase().replace(/\s+/g, '.');

    const token = generateToken({ normalizedUsername, role }, "1h");

    res.cookie("access_token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge:60 * 60 * 1000, 
        path: "/"
    })

    res.status(200).json({ message: "Vous êtes bien authentifié", token, normalizedUsername, role })

}

exports.verifyToken = async (req, res) => {
    const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const [scheme, token] = authHeader.split(" ");

  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ message: "Format du header invalide" });
  }

  const decoded = verifyJwtToken(token);

  if (!decoded) {
    return res.status(401).json({ message: "Token invalide ou expiré" });
  }

  res.status(200).json({ valid: true, user: decoded });

}

exports.logout = (req, res) => {

  res.clearCookie("access_token");
  res.status(200).json({ message: "Déconnexion réussie" });

};