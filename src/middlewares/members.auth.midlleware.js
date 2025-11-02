const { getProjectById, normalize } = require("../services/projects.services");

// -------------------------- Middleware pour gérer les membres -------------------------- //
// Vérifie que l'utilisateur est organizer du projet pour gérer les membres (POST, PUT, DELETE)
exports.isProjectOrganizerForMembers = (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    const project = getProjectById(projectId);

    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    const { role, normalizedUsername } = req.user;
    const roleNormalized = role.toLowerCase();
    const usernameNormalized = normalizedUsername.toLowerCase();

    const isOrganizer = roleNormalized === "organizer" && project.organizer.toLowerCase() === usernameNormalized;

    if (!isOrganizer) {
        return res.status(403).json({ message: "Accès interdit : seul l'organizer peut gérer les membres" });
    }

    req.project = project;
    next();
};

// -------------------------- Middleware pour consulter les membres -------------------------- //
// Vérifie que l'utilisateur peut consulter la liste des membres (organizer ou membre)
exports.canViewProjectMembers = (req, res, next) => {
    const projectId = req.params.projectId || req.params.id;
    const project = getProjectById(projectId);

    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    const { role, normalizedUsername } = req.user;
    const roleNormalized = role.toLowerCase();
    const usernameNormalized = normalizedUsername.toLowerCase();

    // Organizer = accès complet
    const isOrganizer = roleNormalized === "organizer" && project.organizer.toLowerCase() === usernameNormalized;

    // Member = accès si membre du projet
    const isMember = roleNormalized === "member" && (project.members || []).some(m => normalize(m.name) === usernameNormalized);

    if (!isOrganizer && !isMember) {
        return res.status(403).json({ message: "Accès interdit : seuls les membres ou l’organizer peuvent voir la liste" });
    }

    req.project = project;
    next();
};
