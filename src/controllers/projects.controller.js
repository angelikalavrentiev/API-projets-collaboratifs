// Importer le service pour acceder aux fonctions CRUD
const { getAllProjects, getProjectById,getProjectsWithPagination, addProject, updateProject, deleteProject } = require("../services/projects.services");

// ----------------- Controller pour gérer les projets(CRUD) ---------------//
// Lister tous les projets (avec filtres + pagination)
const getProjects = (req, res) => {
  // Si aucun paramètre de query, on renvoie tout
  const { q, role, page, size } = req.query;
  if (!q && !role && !page && !size) {
    const projects = getAllProjects();
    return res.status(200).json(projects);
  }

  // Sinon on délègue au service qui gère filtres + pagination
  getProjectsWithPagination(req, res);
};


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

        const uploadedFile = req.file; // récupère le fichier uploadé
        if(!uploadedFile) return res.status(400).json({ message: "Un fichier PDF est requis" });

        // Nom déjà nettoyé par le middleware
        const specFile = uploadedFile.filename; 

        // ON ajoute le projet via le service
        const newProject = addProject({ name, description, organizer, specFile });

        return res.status(201).json({ message: `Votre projet ${newProject.name} a été ajouté avec succès !`, project: newProject });
    } 
    catch (err) {
        return res.status(400).json({ message: err.message });
    }
};

// Modifier un projet
const editProject = (req, res) => {
    try {
        const { name, description, organizer } = req.body;
        
        // On récupère le fichier uploadé si présent
        const uploadedFile = req.file;

        // On ne modifie specFile que si un fichier a été uploadé
        let specFile;
        if (uploadedFile) specFile = uploadedFile.filename; 
    
        // Mise à jour via le service
        const updatedData = updateProject(req.params.id, { name, description, organizer, specFile });
        res.status(200).json({ message: `Votre projet ${updatedData.name} a été modifié avec succès !`, project: updatedData });
    } 
    catch (err) {
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
