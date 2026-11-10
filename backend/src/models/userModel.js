import pool from '../database.js';

const findUserByEmail = async (email) => {
    const [rows] = await pool.execute(
        `
        SELECT
            user_id,
            name,
            username,
            email,
            role
        FROM users
        WHERE email = ?
        `,
        [email]
    );

    return rows[0];
};

export {
    findUserByEmail
};