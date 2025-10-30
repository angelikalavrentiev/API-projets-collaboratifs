// Importer le service pour acceder aux fonctions CRUD
const { getAllProjects, getProjectById, addProject, updateProject, deleteProject } = require("../services/projects.services");

// ----------------- Controller pour gérer les projets(CRUD) ---------------//
// Récupérer tous les projets
const getProjects = (req, res) => {
    const projects = getAllProjects();
    res.status(200).json(projects); // 200 OK
}

// Récupérer un projet par son ID
const getProject = (req, res) => {
    const project = getProjectById(req.params.id);
    if(!project) return res.status(404).json({message : "Projet non trouvé"});
    res.status(200).json(project);
};

// Ajouter un projet
const createProjet = (req, res) => {
    try {
        const { name, description, organizer } = req.body;
        const specFile = req.file?.filename; // récupère le nom du fichier uploadé
        if(!specFile) return res.status(400).json({ message: "Un fichier PDF est requis" });

        const newProject = addProject({ name, description, organizer, specFile });
        return res.status(201).json({ message: `Votre projet ${newProject.name} a été ajouté avec succès !`, project: newProject });
    } catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// Modifier un projet
const editProject = (req, res) => {
    try {
        const { name, description, organizer } = req.body;
        const specFile = req.file?.filename;

        const updatedData = updateProject(req.params.id, { name, description, organizer, specFile });
        res.status(200).json({ message: `Votre projet ${updatedData.name} a été modifié avec succès !`, project: updatedData });
    } catch (err) {
        if(err.message.includes('introuvable')) return res.status(404).json({ message: err.message });
        return res.status(400).json({ message: err.message });
    }
};

// Supprimer un projet
const removeProject = (req, res) => {
    const deletedProject = deleteProject(req.params.id);
    if (!deletedProject) return res.status(404).json({ message: "Projet non trouvé" });
    res.status(200).json({ message: `Votre projet ${deletedProject.name} a été supprimé avec succès !`, project: deletedProject });
};

// Export
module.exports = { getProjects, getProject, createProjet, editProject, removeProject };
