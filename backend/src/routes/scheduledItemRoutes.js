import express from 'express';
import { requireAuth } from '../middleware/authMiddleware.js';

import {
    getScheduledItems,
    postScheduledItem,
    putScheduledItem,
    deleteScheduledItem
} from '../controllers/scheduledItemController.js';

const router = express.Router();

router.get('/', requireAuth, getScheduledItems);
router.post('/', requireAuth, postScheduledItem);
router.put('/:id', requireAuth, putScheduledItem);
router.delete('/:id', requireAuth, deleteScheduledItem);

export default router;