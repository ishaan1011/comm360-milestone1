import express from 'express';
import * as ctrl from '../controllers/messageController.js';
import authMiddleware from '../middleware/auth.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
const router = express.Router();

router.use(authMiddleware);

// File upload setup
const uploadDir = path.join(process.cwd(), 'uploads', 'messages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// File upload endpoint
router.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  
  // Create proper file URL using environment variable or default Render domain
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? (process.env.BACKEND_URL || 'https://webrtc-signaling-server.onrender.com')
    : 'http://localhost:5000';
  
  const fileUrl = `${baseUrl}/uploads/messages/${req.file.filename}`;
  
  res.json({ 
    url: fileUrl, 
    name: req.file.originalname, 
    type: req.file.mimetype,
    size: req.file.size
  });
});

// List messages in a conversation
router.get('/conversation/:conversationId', ctrl.listMessages);
// Send a new message
router.post('/conversation/:conversationId', ctrl.sendMessage);
// Edit a message
router.put('/:messageId', ctrl.editMessage);
// Delete a message
router.delete('/:messageId', ctrl.deleteMessage);
// React to a message
router.post('/:messageId/react', ctrl.reactMessage);
// Remove a reaction
router.post('/:messageId/unreact', ctrl.removeReaction);

export default router; 