const db = require('../config/db');

class Drustvo {
    static async getAll() {
        try {
            return await db('PohodniskoDrustvo')
                .select('*')
                .orderBy('DrustvoIme', 'asc');
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            return await db('PohodniskoDrustvo')
                .where('IDPohodniskoDrustvo', id)
                .first();
        } catch (error) {
            console.error('Error in getById:', error);
            throw error;
        }
    }

    static async create(drustvoData) {
        try {
            const [id] = await db('PohodniskoDrustvo').insert(drustvoData);
            return id;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async update(id, drustvoData) {
        try {
            return await db('PohodniskoDrustvo')
                .where('IDPohodniskoDrustvo', id)
                .update(drustvoData);
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await db('PohodniskoDrustvo')
                .where('IDPohodniskoDrustvo', id)
                .delete();
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }
}

module.exports = Drustvo;
