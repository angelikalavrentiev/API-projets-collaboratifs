const express = require('express');
const router = express.Router({ mergeParams: true });

const memberController = require('../controllers/member.controller');
const validateMember = require('../middlewares/member.middleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware.verifyToken);

router.get('/', memberController.listMembers);
router.post('/', validateMember, memberController.createMember);
router.put('/:id', validateMember, memberController.updateMember);
router.delete('/:id', memberController.deleteMember);

module.exports = router;