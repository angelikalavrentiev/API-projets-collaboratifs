//-------------------- controllers/members.controller.js -----------------//
const { normalize } = require("../services/projects.services");
const fs = require("fs");
const path = require("path");

// chemin vers le fichier JSON qui stocke les projets et membres
const storePath = path.join(__dirname, "../data/memory.store.json");

// on importe le memory store qui contient tous les projets et leurs membres
let store = require(storePath); 

// ------------------------- Fonctions utilitaires ----------------------- //

// Cherche un projet par son ID
function findProject(projectId) {
  // Utilisation de store.projects car store est un objet {projects: [...], users: [...]}
  return store.projects.find(p => p.id === Number(projectId));
}

// Sauvegarde le store dans le fichier JSON
function saveStore() {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
}

// ------------------------------- CRUD Members ------------------------ //

// GET /projects/:projectId/members
function listMembers(req, res) {
  const { projectId } = req.params;

  // Cherche le projet
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ message: "Projet introuvable" });

  // Retourne tous les membres
  res.status(200).json({ message: "Liste des membres récupérée", items: project.members || [] });
}

// POST /projects/:projectId/members
function createMember(req, res) {
  const { projectId } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ message: "Projet introuvable" });

  const { name, role } = req.body;
  const errors = [];

  // Validation simple avec nom et rôle obligatoires
  if (!name || String(name).trim() === "") errors.push("Le nom du membre est requis");
  if (!role || String(role).trim() === "") errors.push("Le rôle du membre est requis");
  if (errors.length) return res.status(400).json({ message: "Validation échouée", errors });

  // Vérifie qu'un membre avec le même nom n'existe pas déjà dans le projet 
  const duplicate = (project.members || []).some(m => m.name.toLowerCase() === String(name).toLowerCase());
  if (duplicate) return res.status(400).json({ message: "Un membre avec ce nom existe déjà dans le projet" });

  // Génération d'un ID unique pour tous les membres de tous les projets
  const allMembers = store.projects.flatMap(p => p.members || []);
  const id = allMembers.length ? Math.max(...allMembers.map(m => m.id)) + 1 : 101;

  // Création du membre
  const member = { 
    id, 
    name: String(name).trim(), 
    role: String(role).trim(), 
    projectId: project.id 
  };

  project.members = project.members || [];
  project.members.push(member);

  saveStore(); // sauvegarde dans le JSON

  res.status(201).json({ message: "Membre créé avec succès", member });
}

// PUT /projects/:projectId/members/:id
function updateMember(req, res) {
  const { projectId, id } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ message: "Projet introuvable" });

  // Cherche le membre à modifier
  const member = (project.members || []).find(m => String(m.id) === String(id));
  if (!member) return res.status(404).json({ message: "Membre introuvable" });

  const { name, role } = req.body;
  const errors = [];

  // Validation -> nom ou rôle ne peuvent pas être vides
  if (name !== undefined && String(name).trim() === "") errors.push("Le nom du membre ne peut pas être vide");
  if (role !== undefined && String(role).trim() === "") errors.push("Le rôle du membre ne peut pas être vide");
  if (errors.length) return res.status(400).json({ message: "Validation échouée", errors });

  // Vérifie qu'aucun autre membre n'a le même nom 
  if (name && name !== member.name) {
    const duplicate = (project.members || []).some(
      m => m.name.toLowerCase() === String(name).toLowerCase() && String(m.id) !== String(id)
    );
    if (duplicate) return res.status(400).json({ message: "Un membre avec ce nom existe déjà dans le projet" });
    member.name = String(name).trim();
  }
  if (role) member.role = String(role).trim();

  saveStore(); // sauvegarde

  res.status(200).json({ message: "Membre mis à jour avec succès", member });
}

// DELETE /projects/:projectId/members/:id
function deleteMember(req, res) {
  const { projectId, id } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ message: "Projet introuvable" });

  // Cherche l'index du membre
  const memberIndex = (project.members || []).findIndex(m => String(m.id) === String(id));
  if (memberIndex === -1) return res.status(404).json({ message: "Membre introuvable" });

  project.members.splice(memberIndex, 1);
  saveStore();

  res.status(204).send();
}

// ------------------------ Export -----------------------//
module.exports = { listMembers, createMember, updateMember, deleteMember };
