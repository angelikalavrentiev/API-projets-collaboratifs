const { getProjectById, normalize } = require("../services/projects.services");

// -------------------------- Middleware pour vérifier l'organizer -------------------------- //
// Vérifie que l'utilisateur est l'organizer du projet (modification/suppression)
exports.isProjectOrganizer = (req, res, next) => {
    // Récupère le projet depuis le service via l'ID dans params
    const project = getProjectById(req.params.id || req.params.projectId);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    const { role, normalizedUsername } = req.user;

    // Normalisation : role en minuscules + username en minuscules
    const usernameNormalized = normalizedUsername.toLowerCase();
    const roles = Array.isArray(role) ? role.map(r => r.toLowerCase()) : [role.toLowerCase()];

    // Vérifie que l'utilisateur a bien le rôle 'Organizer' ET qu'il est l'organizer du projet
    const isOrganizer = roles.includes("organizer") && project.organizer.toLowerCase() === usernameNormalized;

    // Si ce n'est pas l'organizer, refuse l'accès
    if (!isOrganizer) {
        return res.status(403).json({ message: "Accès refusé : vous n'êtes pas l'organizer de ce projet" });
    }

    // Ajoute le projet à req pour éviter un nouveau lookup plus tard
    req.project = project;
    next();
};



// Visitor a accès lecture seule sans détails des membres
exports.canAccessProject = (req, res, next) => {
    const projectId = req.params.id || req.params.projectId;
    const project = getProjectById(projectId);

    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    const { role, normalizedUsername } = req.user;
    const usernameNormalized = normalizedUsername.toLowerCase();
    const roles = Array.isArray(role) ? role.map(r => r.toLowerCase()) : [role.toLowerCase()];

    // Vérifie les rôles
    const isOrganizer = roles.includes("organizer") && project.organizer.toLowerCase() === usernameNormalized;
    const isMember = roles.includes("member") && (project.members || []).some(m => normalize(m.name) === usernameNormalized);
    const isVisitor = roles.includes("visitor");

    // Si aucune condition n'est remplie, accès refusé
    if (!isOrganizer && !isMember && !isVisitor) {
        return res.status(403).json({ message: "Accès interdit : vous n'êtes pas membre de ce projet" });
    }

    // Prépare l'objet projet à renvoyer selon le rôle
    if (isVisitor) {
        req.project = {
            id: project.id,
            name: project.name,
            description: project.description,
            organizer: project.organizer,
            specFile: project.specFile,
            membersCount: Array.isArray(project.members) ? project.members.length : 0
        };
    } else {
        // Organizer ou Member : accès complet
        req.project = project;
    }

    next();
};
