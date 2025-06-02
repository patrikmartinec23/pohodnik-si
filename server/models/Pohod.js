const povezava = require('../config/db');

class Pohod {
    static async getAll() {
        const connection = await povezava();
        try {
            const [rows] = await connection.query('SELECT * FROM Pohod');
            return rows;
        } finally {
            await connection.end();
        }
    }

    static async getById(id) {
        const connection = await povezava();
        try {
            const [rows] = await connection.query(
                'SELECT * FROM Pohod WHERE id = ?',
                [id]
            );
            return rows[0];
        } finally {
            await connection.end();
        }
    }

    static async create(pohodData) {
        const connection = await povezava();
        try {
            const [result] = await connection.query(
                'INSERT INTO Pohod (title, image, altitude, difficulty, duration, region, description, date, organizer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [
                    pohodData.title,
                    pohodData.image,
                    pohodData.altitude,
                    pohodData.difficulty,
                    pohodData.duration,
                    pohodData.region,
                    pohodData.description,
                    pohodData.date,
                    pohodData.organizer,
                ]
            );
            return result.insertId;
        } finally {
            await connection.end();
        }
    }
}

module.exports = Pohod;
