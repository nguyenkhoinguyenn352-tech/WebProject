import express from 'express';
import pool from './database.js';

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


// ======================================================
// TEST SERVER
// ======================================================

app.get('/', (req, res) => {
    res.json({
        message: 'Work Logger API is running'
    });
});


// ======================================================
// TEST DATABASE
// ======================================================

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


// ======================================================
// CATEGORIES
// ======================================================


// GET all categories
app.get('/api/categories', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                category_id,
                category_name
            FROM categories
            ORDER BY category_id
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve categories'
        });
    }
});


// GET subcategories of one category
app.get('/api/categories/:id/subcategories', async (req, res) => {
    try {
        const categoryId = req.params.id;

        const [rows] = await pool.execute(
            `SELECT
                subcategory_id,
                category_id,
                subcategory_name
             FROM subcategories
             WHERE category_id = ?
             ORDER BY subcategory_id`,
            [categoryId]
        );

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve subcategories'
        });
    }
});


// ======================================================
// WORK LOGS
// ======================================================


// GET all active work logs
app.get('/api/worklogs', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                w.log_id,
                u.name AS user_name,
                DATE_FORMAT(w.work_date, '%Y-%m-%d') AS work_date,
                w.hours,
                w.time_of_day,
                w.description,
                c.category_name,
                s.subcategory_name,
                si.title AS scheduled_item
            FROM work_logs w

            JOIN users u
                ON w.user_id = u.user_id

            JOIN categories c
                ON w.category_id = c.category_id

            LEFT JOIN subcategories s
                ON w.subcategory_id = s.subcategory_id

            LEFT JOIN scheduled_items si
                ON w.scheduled_item_id = si.item_id

            WHERE w.deleted_flag = FALSE

            ORDER BY w.work_date DESC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve work logs'
        });
    }
});


// POST create work log
app.post('/api/worklogs', async (req, res) => {
    try {
        const {
            user_id,
            work_date,
            hours,
            time_of_day,
            description,
            category_id,
            subcategory_id,
            scheduled_item_id
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO work_logs (
                user_id,
                work_date,
                hours,
                time_of_day,
                description,
                category_id,
                subcategory_id,
                scheduled_item_id
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                user_id,
                work_date,
                hours,
                time_of_day,
                description,
                category_id,
                subcategory_id,
                scheduled_item_id
            ]
        );

        res.status(201).json({
            message: 'Work log created successfully',
            log_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to create work log'
        });
    }
});


// PUT update work log
app.put('/api/worklogs/:id', async (req, res) => {
    try {
        const logId = req.params.id;

        const {
            work_date,
            hours,
            time_of_day,
            description,
            category_id,
            subcategory_id,
            scheduled_item_id
        } = req.body;

        const [result] = await pool.execute(
            `UPDATE work_logs
             SET work_date = ?,
                 hours = ?,
                 time_of_day = ?,
                 description = ?,
                 category_id = ?,
                 subcategory_id = ?,
                 scheduled_item_id = ?
             WHERE log_id = ?
             AND deleted_flag = FALSE`,
            [
                work_date,
                hours,
                time_of_day,
                description,
                category_id,
                subcategory_id,
                scheduled_item_id,
                logId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Work log not found'
            });
        }

        res.json({
            message: 'Work log updated successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to update work log'
        });
    }
});


// DELETE work log using soft delete
app.delete('/api/worklogs/:id', async (req, res) => {
    try {
        const logId = req.params.id;

        const [result] = await pool.execute(
            `UPDATE work_logs
             SET deleted_flag = TRUE
             WHERE log_id = ?
             AND deleted_flag = FALSE`,
            [logId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Work log not found'
            });
        }

        res.json({
            message: 'Work log deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to delete work log'
        });
    }
});


// ======================================================
// SCHEDULED ITEMS
// ======================================================


// GET all scheduled items
app.get('/api/scheduled-items', async (req, res) => {
    try {
        const [rows] = await pool.execute(`
            SELECT
                si.item_id,
                si.user_id,
                u.name AS user_name,
                si.title,
                si.item_type,
                DATE_FORMAT(si.start_date, '%Y-%m-%d') AS start_date,
                DATE_FORMAT(si.end_date, '%Y-%m-%d') AS end_date
            FROM scheduled_items si

            JOIN users u
                ON si.user_id = u.user_id

            ORDER BY si.start_date ASC
        `);

        res.json(rows);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to retrieve scheduled items'
        });
    }
});


// POST create scheduled item
app.post('/api/scheduled-items', async (req, res) => {
    try {
        const {
            user_id,
            title,
            item_type,
            start_date,
            end_date
        } = req.body;

        const [result] = await pool.execute(
            `INSERT INTO scheduled_items (
                user_id,
                title,
                item_type,
                start_date,
                end_date
            )
            VALUES (?, ?, ?, ?, ?)`,
            [
                user_id,
                title,
                item_type,
                start_date,
                end_date
            ]
        );

        res.status(201).json({
            message: 'Scheduled item created successfully',
            item_id: result.insertId
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to create scheduled item'
        });
    }
});


// PUT update scheduled item
app.put('/api/scheduled-items/:id', async (req, res) => {
    try {
        const itemId = req.params.id;

        const {
            title,
            item_type,
            start_date,
            end_date
        } = req.body;

        const [result] = await pool.execute(
            `UPDATE scheduled_items
             SET title = ?,
                 item_type = ?,
                 start_date = ?,
                 end_date = ?
             WHERE item_id = ?`,
            [
                title,
                item_type,
                start_date,
                end_date,
                itemId
            ]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Scheduled item not found'
            });
        }

        res.json({
            message: 'Scheduled item updated successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to update scheduled item'
        });
    }
});


// DELETE scheduled item
app.delete('/api/scheduled-items/:id', async (req, res) => {
    try {
        const itemId = req.params.id;

        const [result] = await pool.execute(
            `DELETE FROM scheduled_items
             WHERE item_id = ?`,
            [itemId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                error: 'Scheduled item not found'
            });
        }

        res.json({
            message: 'Scheduled item deleted successfully'
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to delete scheduled item'
        });
    }
});


// ======================================================
// REPORTS
// ======================================================


// GET monthly report
app.get('/api/reports/monthly', async (req, res) => {
    try {
        const year = req.query.year;
        const month = req.query.month;

        if (!year || !month) {
            return res.status(400).json({
                error: 'Year and month are required'
            });
        }

        const [rows] = await pool.execute(
            `SELECT
                w.log_id,
                DATE_FORMAT(w.work_date, '%Y-%m-%d') AS work_date,
                w.hours,
                w.time_of_day,
                w.description,
                c.category_id,
                c.category_name,
                s.subcategory_name,
                si.title AS scheduled_item
             FROM work_logs w

             JOIN categories c
                ON w.category_id = c.category_id

             LEFT JOIN subcategories s
                ON w.subcategory_id = s.subcategory_id

             LEFT JOIN scheduled_items si
                ON w.scheduled_item_id = si.item_id

             WHERE YEAR(w.work_date) = ?
             AND MONTH(w.work_date) = ?
             AND w.deleted_flag = FALSE

             ORDER BY w.work_date ASC`,
            [year, month]
        );

        let totalHours = 0;
        const categorySummary = {};

        for (const row of rows) {
            const hours = Number(row.hours);

            totalHours += hours;

            if (!categorySummary[row.category_name]) {
                categorySummary[row.category_name] = 0;
            }

            categorySummary[row.category_name] += hours;
        }

        const hoursByCategory = Object.entries(categorySummary).map(
            ([category_name, hours]) => ({
                category_name,
                hours
            })
        );

        res.json({
            year: Number(year),
            month: Number(month),
            total_hours: totalHours,
            hours_by_category: hoursByCategory,
            work_logs: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to generate monthly report'
        });
    }
});

// ======================================================
// CUSTOM DATE RANGE REPORT
// ======================================================

app.get('/api/reports', async (req, res) => {
    try {
        const fromDate = req.query.from;
        const toDate = req.query.to;

        if (!fromDate || !toDate) {
            return res.status(400).json({
                error: 'From date and to date are required'
            });
        }

        if (fromDate > toDate) {
            return res.status(400).json({
                error: 'From date cannot be after to date'
            });
        }

        const [rows] = await pool.execute(
            `SELECT
                w.log_id,
                DATE_FORMAT(w.work_date, '%Y-%m-%d') AS work_date,
                w.hours,
                w.time_of_day,
                w.description,
                c.category_id,
                c.category_name,
                s.subcategory_name,
                si.title AS scheduled_item
             FROM work_logs w

             JOIN categories c
                ON w.category_id = c.category_id

             LEFT JOIN subcategories s
                ON w.subcategory_id = s.subcategory_id

             LEFT JOIN scheduled_items si
                ON w.scheduled_item_id = si.item_id

             WHERE w.work_date BETWEEN ? AND ?
             AND w.deleted_flag = FALSE

             ORDER BY w.work_date ASC`,
            [fromDate, toDate]
        );

        let totalHours = 0;
        const categorySummary = {};

        for (const row of rows) {
            const hours = Number(row.hours);

            totalHours += hours;

            if (!categorySummary[row.category_name]) {
                categorySummary[row.category_name] = 0;
            }

            categorySummary[row.category_name] += hours;
        }

        const hoursByCategory = Object.entries(categorySummary).map(
            ([category_name, hours]) => ({
                category_name,
                hours
            })
        );

        res.json({
            from_date: fromDate,
            to_date: toDate,
            total_hours: totalHours,
            hours_by_category: hoursByCategory,
            work_logs: rows
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            error: 'Failed to generate report'
        });
    }
});


// ======================================================
// START SERVER
// ======================================================

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});