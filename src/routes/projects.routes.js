const express = require('express');
const router = express.Router();
const { getProjects, getProject, createProjet, editProject, removeProject } = require('../controllers/projects.controller');
const { uploadSingleFileMiddleware, renameUploadedSpecFile } = require('../middlewares/upload.middleware');
// const { isAuthenticated } = require('../middlewares/auth.middleware'); // à activer si JWT

router.get("/", getProjects);     // Liste tous les projets avec ou sans pagination
router.get("/:id", getProject);           // Lire un projet
router.post("/", uploadSingleFileMiddleware, renameUploadedSpecFile, createProjet); // Créer un projet avec PDF
router.put("/:id", uploadSingleFileMiddleware, renameUploadedSpecFile, editProject); // Modifier un projet
router.delete("/:id", removeProject);     // Supprimer un projet

module.exports = router;
