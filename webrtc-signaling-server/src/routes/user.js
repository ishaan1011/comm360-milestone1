import express from 'express';
import * as ctrl from '../controllers/userController.js';
import authMiddleware from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Get all users (for conversation creation)
router.get('/', ctrl.getAllUsers);

// Get user by ID
router.get('/:id', ctrl.getUserById);

export default router; 