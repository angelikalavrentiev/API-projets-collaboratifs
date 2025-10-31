// controllers/members.controller.js
const fs = require("fs");
const path = require("path");
const storePath = path.join(__dirname, "../data/memory.store.json");
let store = require(storePath); // stocke les projets et membres

// Helper : recherche projet
function findProject(projectId) {
  return store.find(p => p.id === Number(projectId));
}

// Helper : sauvegarde store dans le fichier JSON
function saveStore() {
  fs.writeFileSync(storePath, JSON.stringify(store, null, 2), "utf-8");
}

// ----------------- CRUD Members ----------------- //

// GET /projects/:projectId/members
function listMembers(req, res) {
  const { projectId } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ message: "Projet introuvable" });

  res.status(200).json({ message: "Liste des membres récupérée", items: project.members || [] });
}

// POST /projects/:projectId/members
function createMember(req, res) {
  const { projectId } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ message: "Projet introuvable" });

  const { name, role } = req.body;
  const errors = [];
  if (!name || String(name).trim() === "") errors.push("Le nom du membre est requis");
  if (!role || String(role).trim() === "") errors.push("Le rôle du membre est requis");
  if (errors.length) return res.status(400).json({ message: "Validation échouée", errors });

  const duplicate = (project.members || []).some(m => m.name.toLowerCase() === String(name).toLowerCase());
  if (duplicate) return res.status(400).json({ message: "Un membre avec ce nom existe déjà dans le projet" });

  // Calcul ID global unique sur tous les projets
  const allMembers = store.flatMap(p => p.members || []);
  const id = allMembers.length ? Math.max(...allMembers.map(m => m.id)) + 1 : 101;

  const member = { id, name: String(name).trim(), role: String(role).trim(), projectId: project.id };
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

  const member = (project.members || []).find(m => String(m.id) === String(id));
  if (!member) return res.status(404).json({ message: "Membre introuvable" });

  const requester = req.user?.name;
  if (project.organizer !== requester && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Interdit : seul l'organizer peut modifier les membres" });
  }

  const { name, role } = req.body;
  const errors = [];
  if (name !== undefined && String(name).trim() === "") errors.push("Le nom du membre ne peut pas être vide");
  if (role !== undefined && String(role).trim() === "") errors.push("Le rôle du membre ne peut pas être vide");
  if (errors.length) return res.status(400).json({ message: "Validation échouée", errors });

  if (name && name !== member.name) {
    const duplicate = (project.members || []).some(m => m.name.toLowerCase() === String(name).toLowerCase() && String(m.id) !== String(id));
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

  const memberIndex = (project.members || []).findIndex(m => String(m.id) === String(id));
  if (memberIndex === -1) return res.status(404).json({ message: "Membre introuvable" });

  const requester = req.user?.name;
  if (project.organizer !== requester && req.user?.role !== "admin") {
    return res.status(403).json({ message: "Interdit : seul l'organizer peut supprimer des membres" });
  }

  project.members.splice(memberIndex, 1);
  saveStore();

  res.status(200).json({ message: "Membre supprimé avec succès" });
}

module.exports = { listMembers, createMember, updateMember, deleteMember };
