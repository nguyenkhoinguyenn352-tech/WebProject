import express from 'express';

import {
    getWorkLogs,
    postWorkLog,
    putWorkLog,
    deleteWorkLog
} from '../controllers/workLogController.js';

const router = express.Router();

router.get('/', getWorkLogs);

router.post('/', postWorkLog);

router.put('/:id', putWorkLog);

router.delete('/:id', deleteWorkLog);

export default router;