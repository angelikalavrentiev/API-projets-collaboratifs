const express = require('express');
const router = express.Router({ mergeParams: true });
const memberController = require('../controllers/members.controller');
const validateMemberMiddleware = require('../middlewares/member.middleware'); // note le nom exact
const { isAuthenticated, isOrganizer } = require('../middlewares/auth.middleware');

// Toutes les routes nécessitent d'être authentifié
router.use(isAuthenticated);

// Lister les membres d'un projet
router.get('/', memberController.listMembers);

// Ajouter un membre (avec validation)
router.post('/', validateMemberMiddleware, memberController.createMember);

// Modifier un membre (avec validation)
router.put('/:id', validateMemberMiddleware, memberController.updateMember);

// Supprimer un membre
router.delete('/:id', memberController.deleteMember);

module.exports = router;
