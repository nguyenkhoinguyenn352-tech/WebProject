import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

import {
    getWorkLogs,
    postWorkLog,
    putWorkLog,
    deleteWorkLog
} from '../controllers/workLogController.js';

const router = express.Router();

router.get('/', requireAuth, getWorkLogs);
router.post('/', requireAuth, postWorkLog);
router.put('/:id', requireAuth, putWorkLog);
router.delete('/:id', requireAuth, deleteWorkLog);

export default router;