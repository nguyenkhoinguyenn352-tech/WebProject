import express from 'express';

import {
    getReportByMonth,
    getReportByDateRange
} from '../controllers/reportController.js';

const router = express.Router();

router.get('/monthly', getReportByMonth);

router.get('/', getReportByDateRange);

export default router;