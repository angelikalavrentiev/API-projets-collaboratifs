const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProjet, editProject, removeProject } = require('../controllers/projects.controller');
const { uploadSingleFileMiddleware, renameUploadedSpecFile } = require('../middlewares/upload.middleware');
const { isAuthenticated, isOrganizer } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent d'être authentifié
router.use(isAuthenticated);


// Liste tous les projets (lecture publique pour les utilisateurs authentifiés)
router.get("/", getProjects);  

// Lire un projet  
router.get("/:id", getProject);           

// Créer un projet (uniquement pour organizer authentifié)
router.post("/",isOrganizer, uploadSingleFileMiddleware, renameUploadedSpecFile, createProjet);


// Modifier un projet (uniquement pour l’organizer du projet)
router.put("/:id", uploadSingleFileMiddleware, renameUploadedSpecFile, editProject); 

// Supprimer un projet (uniquement pour l’organizer du projet)
router.delete("/:id", removeProject);     

module.exports = router;
