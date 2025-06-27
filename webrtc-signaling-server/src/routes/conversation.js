import express from 'express';
import * as ctrl from '../controllers/conversationController.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware);

router.get('/', ctrl.listConversations);
router.post('/', ctrl.createConversation);
router.get('/:id', ctrl.getConversation);
router.post('/:id/add-member', ctrl.addMember);
router.post('/:id/remove-member', ctrl.removeMember);
router.delete('/:id', ctrl.deleteConversation);

export default router; 