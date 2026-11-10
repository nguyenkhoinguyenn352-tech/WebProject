import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

import {
    getScheduledItems,
    postScheduledItem,
    putScheduledItem,
    deleteScheduledItem
} from '../controllers/scheduledItemController.js';

const router = express.Router();

router.get('/', getScheduledItems);

router.post('/', requireAuth, postScheduledItem);

router.put('/:id', putScheduledItem);

router.delete('/:id', deleteScheduledItem);

export default router;