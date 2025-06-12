const db = require('../config/db');

class DrustvoRating {
    static async addRating(drustvoId, userId, rating, comment = null) {
        try {
            // Get the pohodnik record for the user
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                throw new Error('User is not a pohodnik');
            }

            // Check if user is a member of the drustvo
            const membership = await db('Clanarina')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .first();

            if (!membership) {
                throw new Error('User must be a member to rate the drustvo');
            }

            // Insert or update rating (using REPLACE or ON DUPLICATE KEY UPDATE)
            const existingRating = await db('Ocena_drustva')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .first();

            if (existingRating) {
                // Update existing rating
                await db('Ocena_drustva')
                    .where('IDOcena', existingRating.IDOcena)
                    .update({
                        Ocena: rating,
                        Komentar: comment,
                        DatumOcene: new Date(),
                    });
                return existingRating.IDOcena;
            } else {
                // Insert new rating
                const [id] = await db('Ocena_drustva').insert({
                    TK_PohodniskoDrustvo: drustvoId,
                    TK_Pohodnik: pohodnik.IDPohodnik,
                    Ocena: rating,
                    Komentar: comment,
                    DatumOcene: new Date(),
                });
                return id;
            }
        } catch (error) {
            console.error('Error in addRating:', error);
            throw error;
        }
    }

    static async getRatings(drustvoId, page = 1, limit = 5) {
        try {
            const offset = (page - 1) * limit;

            // Get total count
            const [{ total }] = await db('Ocena_drustva')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .count('* as total');

            // Get paginated ratings with user info
            const ratings = await db('Ocena_drustva as od')
                .join('Pohodnik as p', 'od.TK_Pohodnik', 'p.IDPohodnik')
                .join('Uporabnik as u', 'p.TK_Uporabnik', 'u.IDUporabnik')
                .where('od.TK_PohodniskoDrustvo', drustvoId)
                .select(
                    'od.Ocena',
                    'od.Komentar',
                    'od.DatumOcene',
                    'p.Ime',
                    'p.Priimek',
                    'u.UporabniskoIme'
                )
                .orderBy('od.DatumOcene', 'desc')
                .limit(limit)
                .offset(offset);

            return {
                ratings,
                total: parseInt(total),
                currentPage: page,
                hasMore: page * limit < total,
            };
        } catch (error) {
            console.error('Error in getRatings:', error);
            throw error;
        }
    }

    static async getAverageRating(drustvoId) {
        try {
            const result = await db('Ocena_drustva')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .avg('Ocena as average')
                .count('* as total')
                .first();

            return {
                average: result.average
                    ? parseFloat(result.average).toFixed(1)
                    : 0,
                total: parseInt(result.total) || 0,
            };
        } catch (error) {
            console.error('Error in getAverageRating:', error);
            throw error;
        }
    }

    static async getUserRating(drustvoId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                return null;
            }

            return await db('Ocena_drustva')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .select('Ocena', 'Komentar')
                .first();
        } catch (error) {
            console.error('Error in getUserRating:', error);
            throw error;
        }
    }

    static async checkCanRate(drustvoId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                return { canRate: false, reason: 'User is not a pohodnik' };
            }

            // Check if user is a member of the drustvo
            const membership = await db('Clanarina')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .first();

            if (!membership) {
                return { canRate: false, reason: 'Must be a member to rate' };
            }

            return { canRate: true };
        } catch (error) {
            console.error('Error in checkCanRate:', error);
            throw error;
        }
    }
}

module.exports = DrustvoRating;
