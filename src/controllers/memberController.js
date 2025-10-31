const store = require('../data/memory.store.json');

// Recherche le projet par id
function findProject(projectId) {
  return store.projects.find(p => String(p.id) === String(projectId));
}

// GET /projects/:projectId/members
function listMembers(req, res) {
  const { projectId } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ errors: [{ message: 'Projet introuvable' }] });
  return res.status(200).json({ items: project.members || [] });
}

// POST /projects/:projectId/members
function createMember(req, res) {
  const { projectId } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ errors: [{ message: 'Projet introuvable' }] });

  const { name, role } = req.body;
  const errors = [];
  if (!name || String(name).trim() === '') errors.push({ path: 'name', message: 'Le nom du membre est requis' });
  if (!role || String(role).trim() === '') errors.push({ path: 'role', message: 'Le rôle du membre est requis' });
  if (errors.length) return res.status(400).json({ errors });

  const duplicate = (project.members || []).some(m => m.name.toLowerCase() === String(name).toLowerCase());
  if (duplicate) return res.status(400).json({ errors: [{ path: 'name', message: 'Un membre avec ce nom existe déjà dans le projet' }] });

  const id = store.nextMemberId();
  const member = { id, name: String(name).trim(), role: String(role).trim(), projectId: project.id };
  project.members = project.members || [];
  project.members.push(member);
  return res.status(201).json({ member });
}

// PUT /projects/:projectId/members/:id
function updateMember(req, res) {
  const { projectId, id } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ errors: [{ message: 'Projet introuvable' }] });

  const member = (project.members || []).find(m => String(m.id) === String(id));
  if (!member) return res.status(404).json({ errors: [{ message: 'Membre introuvable' }] });

  // Autorisation : uniquement l'organizer peut toujours modifier 
  const requester = req.user && req.user.username;
  if (project.organizer !== requester && req.user && req.user.role !== 'admin') {
    return res.status(403).json({ errors: [{ message: 'Interdit : seul l\'organizer peut modifier les membres' }] });
  }

  const { name, role } = req.body;
  const errors = [];
  if (name !== undefined && String(name).trim() === '') errors.push({ path: 'name', message: 'Le nom du membre ne peut pas être vide' });
  if (role !== undefined && String(role).trim() === '') errors.push({ path: 'role', message: 'Le rôle du membre ne peut pas être vide' });
  if (errors.length) return res.status(400).json({ errors });

  if (name && name !== member.name) {
    const duplicate = (project.members || []).some(m => m.name.toLowerCase() === String(name).toLowerCase() && String(m.id) !== String(id));
    if (duplicate) return res.status(400).json({ errors: [{ path: 'name', message: 'Un membre avec ce nom existe déjà dans le projet' }] });
    member.name = String(name).trim();
  }
  if (role) member.role = String(role).trim();

  return res.status(200).json({ member });
}

// DELETE /projects/:projectId/members/:id
function deleteMember(req, res) {
  const { projectId, id } = req.params;
  const project = findProject(projectId);
  if (!project) return res.status(404).json({ errors: [{ message: 'Projet introuvable' }] });

  const memberIndex = (project.members || []).findIndex(m => String(m.id) === String(id));
  if (memberIndex === -1) return res.status(404).json({ errors: [{ message: 'Membre introuvable' }] });

  // Autorisation : seul l'organizer (ou admin) peut supprimer un membre
  const requester = req.user && req.user.username;
  if (project.organizer !== requester && req.user && req.user.role !== 'admin') {
    return res.status(403).json({ errors: [{ message: 'Interdit : seul l\'organizer peut supprimer des membres' }] });
  }

  project.members.splice(memberIndex, 1);
  return res.status(204).send();
}

module.exports = {
  listMembers,
  createMember,
  updateMember,
  deleteMember
};