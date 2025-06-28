import express from 'express';
import * as ctrl from '../controllers/conversationController.js';
import authMiddleware from '../middleware/auth.js';
const router = express.Router();

router.use(authMiddleware);

router.get('/', ctrl.listConversations);
router.post('/', ctrl.createConversation);
router.get('/:conversationId', ctrl.getConversation);
router.put('/:conversationId', ctrl.updateConversation);
router.post('/:conversationId/add-member', ctrl.addMember);
router.post('/:conversationId/remove-member', ctrl.removeMember);
router.post('/:conversationId/add-admin', ctrl.addAdmin);
router.post('/:conversationId/remove-admin', ctrl.removeAdmin);
router.delete('/:conversationId', ctrl.deleteConversation);

export default router; 