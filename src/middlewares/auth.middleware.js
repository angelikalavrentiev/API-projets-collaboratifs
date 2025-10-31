// middlewares/authMiddleware.js
const { verifyJwtToken } = require("../utils/jwt");

exports.isAuthenticated = async (req, res, next) => {

    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ message: "Vous n'êtes pas authentifié" });
    }

    const [scheme, token] = authorization.split(" "); // On mets autorisation vu qu'on a déclaré ce nom en haut

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Format du header invalide" });
    }

    const decoded = verifyJwtToken(token);

    if (!decoded) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // Modifs ici 
    req.user = decoded;
    
    next();
}

exports.isOrganizer = async (req,res, next) => {

    const role = req.user?.role || "Member";

    if (role !== "Organizer") {
        return res.status(403).json({ message: "Accès refusé : réservé à l’organizer" });
    }

  next();
}