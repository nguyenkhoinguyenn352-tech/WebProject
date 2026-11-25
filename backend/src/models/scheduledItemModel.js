import pool from '../database.js';

const getAllScheduledItems = async (userId) => {
    const [rows] = await pool.execute(`
        SELECT
            si.item_id,
            si.title,
            si.item_type,
            si.category_id,
            c.category_name,
            si.subcategory_id,
            sc.subcategory_name,
            si.time_of_day,
            DATE_FORMAT(si.start_date, '%Y-%m-%dT%H:%i') AS start_date,
            DATE_FORMAT(si.end_date, '%Y-%m-%dT%H:%i') AS end_date
        FROM scheduled_items si
        LEFT JOIN categories c
            ON si.category_id = c.category_id
        LEFT JOIN subcategories sc
            ON si.subcategory_id = sc.subcategory_id
        WHERE si.user_id = ?
        ORDER BY si.start_date ASC
    `, [userId]);

    return rows;
};

const addScheduledItem = async (item) => {
    const {
        user_id,
        title,
        item_type,
        category_id,
        subcategory_id,
        time_of_day,
        start_date,
        end_date
    } = item;

    const [result] = await pool.execute(`
        INSERT INTO scheduled_items (
            user_id,
            title,
            item_type,
            category_id,
            subcategory_id,
            time_of_day,
            start_date,
            end_date
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [
        user_id,
        title,
        item_type,
        category_id || null,
        subcategory_id || null,
        time_of_day || null,
        start_date || null,
        end_date || null
    ]);

    return result.insertId;
};

const modifyScheduledItem = async (item, id, userId) => {
    const {
        title,
        item_type,
        category_id,
        subcategory_id,
        time_of_day,
        start_date,
        end_date
    } = item;

    const [result] = await pool.execute(`
        UPDATE scheduled_items
        SET title = ?,
            item_type = ?,
            category_id = ?,
            subcategory_id = ?,
            time_of_day = ?,
            start_date = ?,
            end_date = ?
        WHERE item_id = ?
          AND user_id = ?
    `, [
        title,
        item_type,
        category_id || null,
        subcategory_id || null,
        time_of_day || null,
        start_date || null,
        end_date || null,
        id,
        userId
    ]);

    return result.affectedRows > 0;
};

const removeScheduledItem = async (id, userId) => {
    const [result] = await pool.execute(`
        DELETE FROM scheduled_items
        WHERE item_id = ?
          AND user_id = ?
    `, [id, userId]);

    return result.affectedRows > 0;
};

export {
    getAllScheduledItems,
    addScheduledItem,
    modifyScheduledItem,
    removeScheduledItem
};