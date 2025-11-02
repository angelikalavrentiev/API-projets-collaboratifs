const { getProjectsWithPagination, addProject, updateProject, deleteProject, validateProjects, getProjectById } = require("../services/projects.services");

// ----------------- Controller pour gérer les projets (CRUD) ---------------//

// Lister tous les projets (avec filtres + pagination)
const getProjects = (req, res) => {
  try {
    const { q, role, page, size } = req.query;

    // Déléguer tout au service qui gère les règles d'accès et la pagination
    getProjectsWithPagination(req, res);
  } catch (err) {
    console.error("Erreur getProjects:", err);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};

// Récupérer un projet par son ID selon le rôle de l'utilisateur
const getProject = (req, res) => {
  // req.project contient déjà les bonnes infos selon le rôle grâce à canAccessProject
  if (!req.project) return res.status(404).json({ message: "Projet non trouvé" });

  res.status(200).json(req.project);
};

// Ajouter un projet
const createProject = (req, res) => {
  try {
    const { name, description } = req.body;
    const organizer = req.user.normalizedUsername;
    const uploadedFile = req.file;

    const projectData = {
      name: name || "",
      description: description || "",
      organizer,
      specFile: uploadedFile ? uploadedFile.filename : ""
    };

    const errors = validateProjects(projectData, req.user);
    if (errors.length) return res.status(400).json({ errors });

    const newProject = addProject(projectData, req.user);

    res.status(201).json({
      message: `Votre projet ${newProject.name} a été ajouté avec succès !`,
      project: newProject
    });
  } catch (err) {
    if (err.message.includes("existe déjà")) return res.status(400).json({ message: err.message });
    console.error(err);
    res.status(500).json({ message: "Erreur interne serveur" });
  }
};

// Modifier un projet
const editProject = (req, res) => {
  try {
    const updatedData = updateProject(req.params.id, {
      name: req.body.name,
      description: req.body.description,
      specFile: req.file ? req.file.filename : undefined
    });
    res.status(200).json({ message: `Votre projet ${updatedData.name} a été modifié avec succès !`, project: updatedData });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Supprimer un projet
const removeProject = (req, res) => {
  const deletedProject = deleteProject(req.params.id);
  if (!deletedProject) return res.status(404).json({ message: "Projet non trouvé" });

  res.status(200).json({ message: "Votre projet a été supprimé avec succès" });
};

module.exports = { getProjects, getProject, createProject, editProject, removeProject };
