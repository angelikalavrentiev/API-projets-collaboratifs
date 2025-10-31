const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProjet, editProject, removeProject } = require('../controllers/projects.controller');
const { uploadSingleFileMiddleware, renameUploadedSpecFile } = require('../middlewares/upload.middleware');
const { isAuthenticated, isOrganizer } = require('../middlewares/auth.middleware');


// Liste tous les projets (lecture publique pour les utilisateurs authentifiés)
router.get("/",isAuthenticated, getProjects);  

// Lire un projet  
router.get("/:id",isAuthenticated, getProject);           

// Créer un projet (uniquement pour organizer authentifié)
router.post("/",isAuthenticated, uploadSingleFileMiddleware, renameUploadedSpecFile, createProjet);


// Modifier un projet (uniquement pour l’organizer du projet)
router.put("/:id",isAuthenticated, isOrganizer, uploadSingleFileMiddleware, renameUploadedSpecFile, editProject); 

// Supprimer un projet (uniquement pour l’organizer du projet)
router.delete("/:id",isAuthenticated, isOrganizer, removeProject);     

module.exports = router;
