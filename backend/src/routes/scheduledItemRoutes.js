import express from 'express';

import {
    getScheduledItems,
    postScheduledItem,
    putScheduledItem,
    deleteScheduledItem
} from '../controllers/scheduledItemController.js';

const router = express.Router();

router.get('/', getScheduledItems);

router.post('/', postScheduledItem);

router.put('/:id', putScheduledItem);

router.delete('/:id', deleteScheduledItem);

export default router;