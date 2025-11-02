const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProject, editProject, removeProject } = require('../controllers/projects.controller');
const { uploadSingleFileMiddleware, renameUploadedSpecFile } = require('../middlewares/upload.middleware');
const { isAuthenticated, isOrganizer } = require('../middlewares/auth.middleware');
const { isProjectOrganizer, canAccessProject } = require('../middlewares/projects.auth.middleware');

// Toutes les routes nécessitent d'être authentifié
router.use(isAuthenticated);

// Liste tous les projets (lecture pour tous les utilisateurs authentifiés)
router.get("/", getProjects);  

// Lire un projet (organizer ou membre seulement)
router.get("/:id", canAccessProject, getProject);           

// Créer un projet (uniquement pour organizer authentifié)
router.post("/", isOrganizer, uploadSingleFileMiddleware, renameUploadedSpecFile, createProject);

// Modifier un projet (uniquement pour l’organizer du projet)
router.put("/:id", isProjectOrganizer, uploadSingleFileMiddleware, renameUploadedSpecFile, editProject); 

// Supprimer un projet (uniquement pour l’organizer du projet)
router.delete("/:id", isProjectOrganizer, removeProject);     

module.exports = router;
