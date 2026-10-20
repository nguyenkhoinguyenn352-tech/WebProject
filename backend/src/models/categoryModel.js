import pool from '../database.js';


// Get all categories
const getAllCategories = async () => {
    const [rows] = await pool.execute(`
        SELECT
            category_id,
            category_name
        FROM categories
        ORDER BY category_id
    `);

    return rows;
};


// Get subcategories by category id
const getSubcategoriesByCategory = async (categoryId) => {
    const [rows] = await pool.execute(
        `
        SELECT
            subcategory_id,
            category_id,
            subcategory_name
        FROM subcategories
        WHERE category_id = ?
        ORDER BY subcategory_id
        `,
        [categoryId]
    );

    return rows;
};


export {
    getAllCategories,
    getSubcategoriesByCategory
};