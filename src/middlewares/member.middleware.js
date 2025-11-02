// middleware/validateMember.middleware.js

// On importe fs et path pour pouvoir lire le fichier JSON à chaque requête
const fs = require('fs');
const path = require('path');
const storePath = path.join(__dirname, '../data/memory.store.json');

// Les rôles valides pour les membres
const validRoles = ['Developer', 'Designer', 'ProductOwner', 'QA'];

/*
 * Middleware pour valider les données d'un membre
 * Il vérifie : 
 * le nom du membre
 * le rôle (doit être dans validRoles)
 * que le projectId correspond à un projet existant
 */
function validateMemberMiddleware(req, res, next) {
  const { name, role } = req.body;
  const projectId = parseInt(req.params.projectId); // On convertit en nombre 

  const errors = [];

  // --- Vérification du nom ---
  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ path: 'name', message: 'Nom de membre requis' });
  }

  // --- Vérification du rôle ---
  if (!role || typeof role !== 'string' || !validRoles.some(r => r.toLowerCase() === role.toLowerCase())) {
    errors.push({ path: 'role', message: 'Un rôle valide est requis (Developer, Designer, ProductOwner, QA)' });
  }

  // --- Vérification du projet ---
  // On lit le store à chaque requête pour être sûr d’avoir les dernières données
  let store = [];
  try {
    store = JSON.parse(fs.readFileSync(storePath, 'utf-8'));
  } catch (err) {
    return res.status(500).json({ message: 'Impossible de lire les projets depuis le fichier JSON' });
  }

  const projectExists = store.projects.some(p => p.id === projectId);
  if (!projectExists) {
    errors.push({ path: 'projectId', message: 'Identifiant du projet doit faire référence à un projet existant.' });
  }

  // --- Si des erreurs, on stoppe la requête --- //
  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  // --- Sinon tout est BON on passe au controller ---//
  next();
}

module.exports = validateMemberMiddleware;
