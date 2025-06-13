const db = require('../config/db');

class Pohod {
    static async getAll() {
        try {
            const today = new Date().toISOString().split('T')[0];

            return await db('Pohod as p')
                .select('p.*', 'pd.DrustvoIme as DrustvoIme')
                .leftJoin(
                    'PohodniskoDrustvo as pd',
                    'p.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                )
                .where('p.DatumPohoda', '>=', today)
                .orderBy('p.DatumPohoda', 'asc');
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
                    'pd.Naslov as DrustvoNaslov',
                    'pd.TK_Uporabnik as DrustvoUserId'
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

            // Remove pohodSlika from the data if it exists (it's not in the DB schema)
            const { pohodSlika, ...dataToSave } = pohodData;

            const [id] = await db('Pohod').insert({
                ...dataToSave,
                DatumPohoda: new Date(dataToSave.DatumPohoda),
                StroskiPrevoza: parseFloat(dataToSave.StroskiPrevoza),
                ProstaMesta: parseInt(dataToSave.ProstaMesta),
                Tezavnost: parseInt(dataToSave.Tezavnost),
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
            // Get current date in YYYY-MM-DD format
            const today = new Date().toISOString().split('T')[0];

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
                )
                // Only show future pohodi
                .where('p.DatumPohoda', '>=', today);

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

            // Filter by date range (only if dateFrom is in the future)
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

            // Sort by date ascending (nearest first)
            query = query.orderBy('p.DatumPohoda', 'asc');

            return await query;
        } catch (error) {
            console.error('Error in getFiltered:', error);
            throw error;
        }
    }

    // In server/models/Pohod.js
    static async delete(id) {
        const trx = await db.transaction();
        try {
            // First check if there are any registrations for this pohod
            const registrations = await trx('Prijava')
                .where('TK_Pohod', id)
                .select('*');

            // If there are registrations, delete them first
            if (registrations.length > 0) {
                await trx('Prijava').where('TK_Pohod', id).delete();
            }

            // Also check for comments and delete them
            await trx('Komentar').where('TK_Pohod', id).delete();

            // Finally delete the pohod itself
            await trx('Pohod').where('IDPohod', id).delete();

            await trx.commit();
            return true;
        } catch (error) {
            await trx.rollback();
            console.error('Error in delete:', error);
            throw error;
        }
    }

    static async registerForHike(pohodId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                throw new Error('User is not a pohodnik');
            }

            // Get pohod details including organizing društvo
            const pohod = await db('Pohod as p')
                .select('p.*', 'pd.TK_Uporabnik as DrustvoUserId')
                .leftJoin(
                    'PohodniskoDrustvo as pd',
                    'p.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                )
                .where('p.IDPohod', pohodId)
                .first();

            if (!pohod) {
                throw new Error('Pohod not found');
            }

            // Check if there are available spots BEFORE other checks
            if (pohod.ProstaMesta <= 0) {
                throw new Error('No spots available');
            }

            // Check if user is a member of the organizing društvo
            const membership = await db('Clanarina')
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .where('TK_PohodniskoDrustvo', pohod.TK_PohodniskoDrustvo)
                .first();

            if (!membership) {
                throw new Error('User is not a member of organizing društvo');
            }

            // Check if already registered
            const existingRegistration = await db('Prijava')
                .where('TK_Pohod', pohodId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .first();

            if (existingRegistration) {
                throw new Error('User is already registered for this hike');
            }

            // Register for the hike using a transaction
            await db.transaction(async (trx) => {
                // Double-check available spots within transaction to prevent race conditions
                const currentPohod = await trx('Pohod')
                    .where('IDPohod', pohodId)
                    .select('ProstaMesta')
                    .first();

                if (currentPohod.ProstaMesta <= 0) {
                    throw new Error('No spots available');
                }

                // Add registration
                await trx('Prijava').insert({
                    TK_Pohod: pohodId,
                    TK_Pohodnik: pohodnik.IDPohodnik,
                    DatumPrijave: new Date(),
                });

                // Decrease available spots
                await trx('Pohod')
                    .where('IDPohod', pohodId)
                    .decrement('ProstaMesta', 1);
            });

            return true;
        } catch (error) {
            console.error('Error in registerForHike:', error);
            throw error;
        }
    }

    static async getRegisteredPohodniki(pohodId) {
        try {
            return await db('Prijava as pr')
                .join('Pohodnik as p', 'pr.TK_Pohodnik', 'p.IDPohodnik')
                .join('Uporabnik as u', 'p.TK_Uporabnik', 'u.IDUporabnik')
                .where('pr.TK_Pohod', pohodId)
                .select(
                    'p.Ime',
                    'p.Priimek',
                    'u.UporabniskoIme',
                    'pr.DatumPrijave'
                )
                .orderBy('pr.DatumPrijave', 'asc');
        } catch (error) {
            console.error('Error in getRegisteredPohodniki:', error);
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
                    'u.UporabniskoIme as username'
                    // Remove rating selection
                )
                .orderBy('k.IDKomentar', 'desc');
        } catch (error) {
            console.error('Error in getComments:', error);
            throw error;
        }
    }

    static async addComment(pohodId, userId, content) {
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
                // Remove Ocena field
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

    static async checkUserRegistration(pohodId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                return false;
            }

            const registration = await db('Prijava')
                .where('TK_Pohod', pohodId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .first();

            return !!registration;
        } catch (error) {
            console.error('Error in checkUserRegistration:', error);
            throw error;
        }
    }

    static async unregisterFromHike(pohodId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                throw new Error('User is not a pohodnik');
            }

            const registration = await db('Prijava')
                .where('TK_Pohod', pohodId)
                .where('TK_Pohodnik', pohodnik.IDPohodnik)
                .first();

            if (!registration) {
                throw new Error('User is not registered for this hike');
            }

            // Unregister from the hike using a transaction
            await db.transaction(async (trx) => {
                // Remove registration
                await trx('Prijava')
                    .where('TK_Pohod', pohodId)
                    .where('TK_Pohodnik', pohodnik.IDPohodnik)
                    .del();

                // Increase available spots
                await trx('Pohod')
                    .where('IDPohod', pohodId)
                    .increment('ProstaMesta', 1);
            });

            return true;
        } catch (error) {
            console.error('Error in unregisterFromHike:', error);
            throw error;
        }
    }

    static async getUpcomingByDrustvoWithPagination(
        drustvoId,
        page = 1,
        limit = 2
    ) {
        try {
            const offset = (page - 1) * limit;
            const today = new Date().toISOString().split('T')[0];

            // Get total count of upcoming pohodi
            const totalResult = await db('Pohod')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('DatumPohoda', '>', today)
                .count('* as total');

            const total = parseInt(totalResult[0].total);

            // Get paginated upcoming pohodi
            const pohodi = await db('Pohod')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('DatumPohoda', '>', today)
                .orderBy('DatumPohoda', 'asc')
                .limit(limit)
                .offset(offset);

            return {
                pohodi,
                total,
                currentPage: page,
                hasMore: page * limit < total,
            };
        } catch (error) {
            console.error(
                'Error in getUpcomingByDrustvoWithPagination:',
                error
            );
            throw error;
        }
    }

    static async getPastByDrustvoWithPagination(
        drustvoId,
        page = 1,
        limit = 2
    ) {
        try {
            const offset = (page - 1) * limit;
            const today = new Date().toISOString().split('T')[0];

            // Get total count of past pohodi
            const totalResult = await db('Pohod')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('DatumPohoda', '<=', today)
                .count('* as total');

            const total = parseInt(totalResult[0].total);

            // Get paginated past pohodi
            const pohodi = await db('Pohod')
                .where('TK_PohodniskoDrustvo', drustvoId)
                .where('DatumPohoda', '<=', today)
                .orderBy('DatumPohoda', 'desc')
                .limit(limit)
                .offset(offset);

            return {
                pohodi,
                total,
                currentPage: page,
                hasMore: page * limit < total,
            };
        } catch (error) {
            console.error('Error in getPastByDrustvoWithPagination:', error);
            throw error;
        }
    }
}

module.exports = Pohod;
