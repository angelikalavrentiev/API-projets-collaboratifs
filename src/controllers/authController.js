// controllers/authController.js
const { generateToken, verifyJwtToken } = require("../utils/jwt");

exports.login = async (req, res) => {

    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: "Le champ 'name' est requis" });
    }

    const token = generateToken({ name }, "1h"); 

    res.cookie("access_token", token, {
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 1000, 
        path: "/"
    })

    res.status(200).json({ message: "Vous êtes bien authentifié", token, name })

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

  res.status(200).json({ valid: true });

}

exports.logout = (req, res) => {

  res.clearCookie("access_token");
  res.status(200).json({ message: "Déconnexion réussie" });

};