const { getProjectById, normalize } = require("../services/projects.services");

// -------------------------- Middleware pour vérifier l'organizer -------------------------- //
// Vérifie que l'utilisateur est l'organizer du projet (modification/suppression)
exports.isProjectOrganizer = (req, res, next) => {
    const project = getProjectById(req.params.id || req.params.projectId);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    const { role, normalizedUsername } = req.user;

    // Normalisation rôle et username
    const roleNormalized = role.toLowerCase();
    const usernameNormalized = normalizedUsername.toLowerCase();

    const isOrganizer = roleNormalized === "organizer" && project.organizer.toLowerCase() === usernameNormalized;
    if (!isOrganizer) return res.status(403).json({ message: "Accès refusé : vous n'êtes pas l'organizer de ce projet" });

    req.project = project;
    next();
};

// -------------------------- Middleware pour vérifier l'accès au projet -------------------------- //
// Vérifie l'accès au projet (Organizer, Member ou Visitor)
exports.canAccessProject = (req, res, next) => {
    const project = getProjectById(req.params.id || req.params.projectId);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    const { role, normalizedUsername } = req.user;
    const roleNormalized = role.toLowerCase();
    const usernameNormalized = normalizedUsername.toLowerCase();

    // Organizer = accès complet si organizer
    const isOrganizer = roleNormalized === "organizer" && project.organizer.toLowerCase() === usernameNormalized;

    // Member = accès si username présent dans les membres
    const isMember = roleNormalized === "member" &&
        (project.members || []).some(m => normalize(m.name) === usernameNormalized);

    // Visitor = accès lecture seule
    const isVisitor = roleNormalized === "visitor";

    if (!isOrganizer && !isMember && !isVisitor) {
        return res.status(403).json({ message: "Accès interdit : vous n'êtes pas membre de ce projet" });
    }

    req.project = project;
    next();
};
