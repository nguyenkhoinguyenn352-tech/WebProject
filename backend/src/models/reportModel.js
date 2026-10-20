import pool from '../database.js';


// Get work logs for monthly report
const getMonthlyReport = async (year, month) => {
    const [rows] = await pool.execute(
        `
        SELECT
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

        ORDER BY w.work_date ASC
        `,
        [year, month]
    );

    return rows;
};


// Get work logs between two dates
const getDateRangeReport = async (fromDate, toDate) => {
    const [rows] = await pool.execute(
        `
        SELECT
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

        ORDER BY w.work_date ASC
        `,
        [fromDate, toDate]
    );

    return rows;
};


export {
    getMonthlyReport,
    getDateRangeReport
};