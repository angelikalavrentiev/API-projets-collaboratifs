// Importer le service pour acceder aux fonctions CRUD
const { getAllProjects, getProjectById, getProjectsWithPagination, addProject, updateProject, deleteProject, validateProjects, normalize } = require("../services/projects.services");

// ----------------- Controller pour gérer les projets(CRUD) ---------------//

// Lister tous les projets (avec filtres + pagination)
const getProjects = (req, res) => {
  try {
    // Si aucun query param, on renvoie tout via le service
    const { q, role, page, size } = req.query;
    if (!q && !role && !page && !size) {
      return getProjectsWithPagination(req, res);
    }
    
    // Sinon, déléguer au service qui gère tout
    getProjectsWithPagination(req, res);
  } catch (err) {
    console.error("Erreur getProjects:", err);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};

// Récupérer un projet par son ID
const getProject = (req, res) => {
  const project = getProjectById(req.params.id);
  if(!project) return res.status(404).json({message : "Projet non trouvé"});
  res.status(200).json(project);
};


// Ajouter un projet
const createProject = (req, res) => {
  try {
    const { name, description } = req.body;
    const organizer = req.user.normalizedUsername; // organizer = user connecté
    const uploadedFile = req.file;

    // Construire l'objet projet même si certains champs sont manquants
    const projectData = {
      name: name,                  // vide si non fourni
      description: description,
      organizer,
      specFile: uploadedFile ? uploadedFile.filename : "" // vide si aucun fichier
    };

    // Validation complète via validateProjects
    const errors = validateProjects(projectData, req.user);
    if (errors.length) return res.status(400).json({ errors });

    // Création du projet
    const newProject = addProject(projectData, req.user);

    return res.status(201).json({
      message: `Votre projet ${newProject.name} a été ajouté avec succès !`,
      project: newProject
    });
  } catch (err) {
    // Gestion des erreurs existantes ou conflits
    if (err.message.includes("existe déjà")) {
      return res.status(400).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Erreur interne serveur' });
  }
};

// Modifier un projet
const editProject = (req, res) => {
  try {
    const project = getProjectById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    const { name, description } = req.body;
    const uploadedFile = req.file;

    const updatedData = updateProject(req.params.id, { 
        name, 
        description, 
        specFile: uploadedFile ? uploadedFile.filename : undefined // si aucun fichier, ne change pas
    });

    res.status(200).json({ message: `Votre projet ${updatedData.name} a été modifié avec succès !`, project: updatedData });
  } 
  catch (err) {
    return res.status(400).json({ message: err.message });
  }
};

// Supprimer un projet
const removeProject = (req, res) => {
  const project = getProjectById(req.params.id);
  if (!project) return res.status(404).json({ message: "Projet non trouvé" });

  // On supprime le projet
  deleteProject(req.params.id);
 res.status(200).json({ message: "Votre projet a été supprimé avec succès" });
};


//------------------------ Export -----------------------//
module.exports = { getProjects, getProject, createProject, editProject, removeProject };
