import pool from '../database.js';

const getAllScheduledItems = async () => {
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

    return rows;
};


const addScheduledItem = async (item) => {
    const {
        user_id,
        title,
        item_type,
        start_date,
        end_date
    } = item;

    const sql = `
        INSERT INTO scheduled_items (
            user_id,
            title,
            item_type,
            start_date,
            end_date
        )
        VALUES (?, ?, ?, ?, ?)
    `;

    const params = [
        user_id,
        title,
        item_type,
        start_date,
        end_date
    ];

    const [result] = await pool.execute(sql, params);

    if (result.affectedRows === 0) {
        return false;
    }

    return {
        item_id: result.insertId
    };
};


const modifyScheduledItem = async (item, id) => {
    const {
        title,
        item_type,
        start_date,
        end_date
    } = item;

    const sql = `
        UPDATE scheduled_items
        SET title = ?,
            item_type = ?,
            start_date = ?,
            end_date = ?
        WHERE item_id = ?
    `;

    const params = [
        title,
        item_type,
        start_date,
        end_date,
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


const removeScheduledItem = async (id) => {
    const [result] = await pool.execute(
        `DELETE FROM scheduled_items
         WHERE item_id = ?`,
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
    getAllScheduledItems,
    addScheduledItem,
    modifyScheduledItem,
    removeScheduledItem
};