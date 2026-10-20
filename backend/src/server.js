import express from 'express';
import cors from 'cors';
import pool from './database.js';

import scheduledItemRoutes from './routes/scheduledItemRoutes.js';
import workLogRoutes from './routes/workLogRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import reportRoutes from './routes/reportRoutes.js';


const app = express();
const port = process.env.PORT || 3000;


// Middleware
app.use(cors());
app.use(express.json());


// Routes
app.use('/api/scheduled-items', scheduledItemRoutes);
app.use('/api/worklogs', workLogRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reports', reportRoutes);


// Test server
app.get('/', (req, res) => {
    res.json({
        message: 'Work Logger API is running'
    });
});


// Test database connection
app.get('/api/test-db', async (req, res) => {
    try {
        const [rows] = await pool.execute(
            'SELECT 1 AS result'
        );

        res.json({
            message: 'Database connection successful',
            result: rows[0].result
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Database connection failed'
        });
    }
});


// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});