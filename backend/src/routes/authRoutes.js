import express from 'express';
import {
    googleLogin,
    getCurrentUser
} from '../controllers/authController.js';

import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/google', googleLogin);

router.get('/me', requireAuth, getCurrentUser);

export default router;