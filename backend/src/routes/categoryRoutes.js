import express from 'express';

import {
    getCategories,
    getSubcategories
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getCategories);

router.get('/:id/subcategories', getSubcategories);

export default router;