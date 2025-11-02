const express = require('express');
const router = express.Router({ mergeParams: true });
const memberController = require('../controllers/members.controller');
const validateMemberMiddleware = require('../middlewares/member.middleware'); 
const { isAuthenticated } = require('../middlewares/auth.middleware');
const { canViewProjectMembers, isProjectOrganizerForMembers } = require('../middlewares/members.auth.midlleware');



// Toutes les routes nécessitent d'être authentifié
router.use(isAuthenticated);

// Lister les membres d'un projet (organizer et membres seulement)
router.get('/', canViewProjectMembers, memberController.listMembers);

// Ajouter un membre (organizer seulement, avec validation)
router.post('/', isProjectOrganizerForMembers, validateMemberMiddleware, memberController.createMember);

// Modifier un membre (organizer seulement, avec validation)
router.put('/:id', isProjectOrganizerForMembers, validateMemberMiddleware, memberController.updateMember);

// Supprimer un membre (organizer seulement)
router.delete('/:id', isProjectOrganizerForMembers, memberController.deleteMember);

module.exports = router;
