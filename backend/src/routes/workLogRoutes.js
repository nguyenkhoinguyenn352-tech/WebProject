import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

import {
    getWorkLogs,
    postWorkLog,
    putWorkLog,
    deleteWorkLog
} from '../controllers/workLogController.js';

const router = express.Router();

router.get('/', getWorkLogs);

router.post('/', requireAuth, postWorkLog);

router.put('/:id', putWorkLog);

router.delete('/:id', deleteWorkLog);

export default router;