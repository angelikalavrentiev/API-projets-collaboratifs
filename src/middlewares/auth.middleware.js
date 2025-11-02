const { verifyJwtToken } = require("../utils/jwt");

// -------------------------- Middleware pour vérifier l'authentification -------------------------- //
exports.isAuthenticated = async (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).json({ message: "Vous n'êtes pas authentifié" });
    }

    const [scheme, token] = authorization.split(" "); // Récupération du token depuis le header

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Format du header invalide" });
    }

    const decoded = verifyJwtToken(token);

    if (!decoded) {
        return res.status(401).json({ message: "Token invalide ou expiré" });
    }

    // On stocke tout le payload décodé dans req.user 
    req.user = decoded;

    next();
};

// -------------------------- Middleware pour vérifier le rôle Organizer -------------------------- //
exports.isOrganizer = async (req, res, next) => {
    const role = req.user?.role?.toLowerCase() || "member";

    if (role !== "organizer") {
        return res.status(403).json({ message: "Accès refusé : réservé à l’organizer" });
    }

    next();
};

// -------------------------- Middleware pour vérifier le rôle Visitor -------------------------- //
exports.isVisitor = async (req, res, next) => {
    const role = req.user?.role?.toLowerCase() || "visitor";

    if (role !== "visitor") {
        return res.status(403).json({ message: "Accès refusé : réservé aux visiteurs" });
    }

    next();
};
