const express = require('express');
const router = express.Router({ mergeParams: true });
const memberController = require('../controllers/memberController');
const { validateMemberBody } = require('../middlewares/memberValidation');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', memberController.listMembers);
router.post('/', validateMemberBody, memberController.createMember);
router.put('/:id', validateMemberBody, memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;