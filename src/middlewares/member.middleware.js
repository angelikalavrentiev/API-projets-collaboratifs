const store = require('../data/memory.store.json');

const validRoles = ['Developer', 'Designer', 'ProductOwner', 'QA'];

function validateMemberMiddleware(req, res, next) {
  const { name, role } = req.body;
  const projectId = parseInt(req.params.projectId);
  const errors = [];

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    errors.push({ path: 'name', message: 'Nom de membre requis' });
  }

  if (!role || typeof role !== 'string' || !validRoles.includes(role)) {
    errors.push({ path: 'role', message: 'Un rôle valide est requis (Developer, Designer, ProductOwner, QA)' });
  }

  const projectExists = store.some(p => p.id === projectId);
  if (!projectExists) {
    errors.push({ path: 'projectId', message: 'Identifiant du projet doit faire référence à un projet existant.' });
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
}

module.exports = validateMemberMiddleware;
