const db = require('../config/db');

class Pohod {
    static async getAll() {
        try {
            return await db('Pohod as p')
                .select('p.*', 'pd.DrustvoIme as DrustvoIme')
                .leftJoin(
                    'PohodniskoDrustvo as pd',
                    'p.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                )
                .orderBy('p.DatumPohoda', 'desc');
        } catch (error) {
            console.error('Error in getAll:', error);
            throw error;
        }
    }

    static async getById(id) {
        try {
            return await db('Pohod as p')
                .select(
                    'p.*',
                    'pd.DrustvoIme as DrustvoIme',
                    'pd.Naslov as DrustvoNaslov'
                )
                .leftJoin(
                    'PohodniskoDrustvo as pd',
                    'p.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                )
                .where('p.IDPohod', id)
                .first();
        } catch (error) {
            console.error('Error in getById:', error);
            throw error;
        }
    }

    static async create(pohodData) {
        try {
            // Validate required fields
            const requiredFields = [
                'PohodIme',
                'Lokacija',
                'DatumPohoda',
                'TK_PohodniskoDrustvo',
                'ZbirnoMesto',
                'PohodOpis',
                'Tezavnost',
                'Trajanje',
                'ObveznaOprema',
                'PricakovaneRazmere',
                'Prevoz',
                'StroskiPrevoza',
                'ProstaMesta',
                'Vodic',
                'VodicKontakt',
            ];

            for (const field of requiredFields) {
                if (!pohodData[field]) {
                    throw new Error(`Missing required field: ${field}`);
                }
            }

            const [id] = await db('Pohod').insert({
                ...pohodData,
                DatumPohoda: new Date(pohodData.DatumPohoda),
                StroskiPrevoza: parseFloat(pohodData.StroskiPrevoza),
                ProstaMesta: parseInt(pohodData.ProstaMesta),
                Tezavnost: parseInt(pohodData.Tezavnost),
            });
            return id;
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async update(id, pohodData) {
        try {
            // Format data types
            const updateData = {
                ...pohodData,
                DatumPohoda: pohodData.DatumPohoda
                    ? new Date(pohodData.DatumPohoda)
                    : undefined,
                StroskiPrevoza: pohodData.StroskiPrevoza
                    ? parseFloat(pohodData.StroskiPrevoza)
                    : undefined,
                ProstaMesta: pohodData.ProstaMesta
                    ? parseInt(pohodData.ProstaMesta)
                    : undefined,
                Tezavnost: pohodData.Tezavnost
                    ? parseInt(pohodData.Tezavnost)
                    : undefined,
            };

            // Remove undefined fields
            Object.keys(updateData).forEach(
                (key) => updateData[key] === undefined && delete updateData[key]
            );

            return await db('Pohod').where('IDPohod', id).update(updateData);
        } catch (error) {
            console.error('Error in update:', error);
            throw error;
        }
    }

    static async getFiltered(filters = {}) {
        try {
            let query = db('Pohod as p')
                .select(
                    'p.*',
                    'pd.DrustvoIme as DrustvoIme',
                    'pd.Naslov as DrustvoNaslov'
                )
                .leftJoin(
                    'PohodniskoDrustvo as pd',
                    'p.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                );

            // Search by name or location
            if (filters.search) {
                query = query.where((builder) => {
                    builder
                        .where('p.PohodIme', 'like', `%${filters.search}%`)
                        .orWhere('p.Lokacija', 'like', `%${filters.search}%`);
                });
            }

            // Filter by difficulty
            if (filters.difficulty) {
                query = query.where('p.Tezavnost', filters.difficulty);
            }

            // Filter by location
            if (filters.location) {
                query = query.where(
                    'p.Lokacija',
                    'like',
                    `%${filters.location}%`
                );
            }

            // Filter by date range
            if (filters.dateFrom) {
                query = query.where('p.DatumPohoda', '>=', filters.dateFrom);
            }
            if (filters.dateTo) {
                query = query.where('p.DatumPohoda', '<=', filters.dateTo);
            }

            // Filter by available spots
            if (filters.availableOnly) {
                query = query.where('p.ProstaMesta', '>', 0);
            }

            // Default sorting
            query = query.orderBy('p.DatumPohoda', 'asc');

            return await query;
        } catch (error) {
            console.error('Error in getFiltered:', error);
            throw error;
        }
    }

    static async delete(id) {
        try {
            return await db('Pohod').where('IDPohod', id).delete();
        } catch (error) {
            console.error('Error in delete:', error);
            throw error;
        }
    }

    static async getComments(pohodId) {
        try {
            return await db('Komentar as k')
                .join('Pohodnik as p', 'k.TK_Pohodnik', 'p.IDPohodnik')
                .join('Uporabnik as u', 'p.TK_Uporabnik', 'u.IDUporabnik')
                .where('k.TK_Pohod', pohodId)
                .select(
                    'k.IDKomentar',
                    'k.Komentar as content',
                    'k.Ocena as rating',
                    'u.UporabniskoIme as username' // Changed to match your schema
                )
                .orderBy('k.IDKomentar', 'desc');
        } catch (error) {
            console.error('Error in getComments:', error);
            throw error;
        }
    }

    static async addComment(pohodId, userId, content, rating) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                throw new Error('Pohodnik not found');
            }

            const [id] = await db('Komentar').insert({
                TK_Pohod: pohodId,
                TK_Pohodnik: pohodnik.IDPohodnik,
                Komentar: content,
                Ocena: rating || 5,
            });

            return id;
        } catch (error) {
            console.error('Error in addComment:', error);
            throw error;
        }
    }

    // Additional helper methods
    static async getByDrustvo(drustvoId) {
        try {
            return await db('Pohod')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .orderBy('DatumPohoda', 'desc');
        } catch (error) {
            console.error('Error in getByDrustvo:', error);
            throw error;
        }
    }

    static async getUpcoming() {
        try {
            return await db('Pohod')
                .where('DatumPohoda', '>', new Date())
                .orderBy('DatumPohoda', 'asc');
        } catch (error) {
            console.error('Error in getUpcoming:', error);
            throw error;
        }
    }
}

module.exports = Pohod;
