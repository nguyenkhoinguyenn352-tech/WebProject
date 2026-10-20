import pool from '../database.js';


// Get all active work logs
const getAllWorkLogs = async () => {
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

    return rows;
};


// Add new work log
const addWorkLog = async (workLog) => {
    const {
        user_id,
        work_date,
        hours,
        time_of_day,
        description,
        category_id,
        subcategory_id,
        scheduled_item_id
    } = workLog;

    const sql = `
        INSERT INTO work_logs (
            user_id,
            work_date,
            hours,
            time_of_day,
            description,
            category_id,
            subcategory_id,
            scheduled_item_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
        user_id,
        work_date,
        hours,
        time_of_day,
        description,
        category_id,
        subcategory_id,
        scheduled_item_id
    ];

    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
        return false;
    }

    return {
        log_id: result.insertId
    };
};


// Update work log
const modifyWorkLog = async (workLog, id) => {
    const {
        work_date,
        hours,
        time_of_day,
        description,
        category_id,
        subcategory_id,
        scheduled_item_id
    } = workLog;

    const sql = `
        UPDATE work_logs
        SET work_date = ?,
            hours = ?,
            time_of_day = ?,
            description = ?,
            category_id = ?,
            subcategory_id = ?,
            scheduled_item_id = ?
        WHERE log_id = ?
        AND deleted_flag = FALSE
    `;

    const params = [
        work_date,
        hours,
        time_of_day,
        description,
        category_id,
        subcategory_id,
        scheduled_item_id,
        id
    ];

    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
        return false;
    }

    return {
        message: 'success'
    };
};


// Soft delete work log
const removeWorkLog = async (id) => {
    const [result] = await pool.execute(
        `
        UPDATE work_logs
        SET deleted_flag = TRUE
        WHERE log_id = ?
        AND deleted_flag = FALSE
        `,
        [id]
    );

    if (result.affectedRows === 0) {
        return false;
    }

    return {
        message: 'success'
    };
};


export {
    getAllWorkLogs,
    addWorkLog,
    modifyWorkLog,
    removeWorkLog
};