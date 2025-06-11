const db = require('../config/db');

class Profile {
    static async getUserProfile(userId) {
        try {
            const profile = await db('Uporabnik as u')
                .join('Pohodnik as p', 'u.IDUporabnik', 'p.TK_Uporabnik')
                .select(
                    'u.UporabniskoIme as username',
                    'p.Ime as ime',
                    'p.Priimek as priimek',
                    'p.DatumRojstva as datumRojstva',
                    'p.Prebivalisce as prebivalisce'
                )
                .where('u.IDUporabnik', userId)
                .first();

            return {
                ...profile,
                totalHikes: 0,
                totalAltitude: 0,
                totalHours: 0,
            };
        } catch (error) {
            console.error('Error in getUserProfile:', error);
            throw error;
        }
    }

    static async updateProfile(userId, profileData) {
        const trx = await db.transaction();
        try {
            await trx('Pohodnik').where('TK_Uporabnik', userId).update({
                Ime: profileData.ime,
                Priimek: profileData.priimek,
                DatumRojstva: profileData.datumRojstva,
                Prebivalisce: profileData.prebivalisce,
            });

            await trx.commit();
            return true;
        } catch (error) {
            await trx.rollback();
            console.error('Error in updateProfile:', error);
            throw error;
        }
    }

    static async getUpcomingHikes(userId, page = 1, limit = 2) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .select('IDPohodnik')
                .first();

            if (!pohodnik) {
                return { hikes: [], total: 0 };
            }

            const today = new Date().toISOString().split('T')[0];
            const offset = (page - 1) * limit;

            // Get total count
            const [{ total }] = await db('Prijava as pr')
                .join('Pohod as p', 'pr.TK_Pohod', 'p.IDPohod')
                .where('pr.TK_Pohodnik', pohodnik.IDPohodnik)
                .where('p.DatumPohoda', '>=', today)
                .count('* as total');

            // Get paginated hikes
            const hikes = await db('Prijava as pr')
                .join('Pohod as p', 'pr.TK_Pohod', 'p.IDPohod')
                .leftJoin(
                    'PohodniskoDrustvo as pd',
                    'p.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                )
                .select(
                    'p.IDPohod',
                    'p.PohodIme',
                    'p.DatumPohoda',
                    'p.Tezavnost',
                    'p.Lokacija',
                    'p.Trajanje',
                    'p.ZbirnoMesto',
                    'p.PohodOpis',
                    'p.ObveznaOprema',
                    'p.ProstaMesta',
                    'pd.DrustvoIme',
                    'pr.DatumPrijave'
                )
                .where('pr.TK_Pohodnik', pohodnik.IDPohodnik)
                .where('p.DatumPohoda', '>=', today)
                .orderBy('p.DatumPohoda', 'asc')
                .limit(limit)
                .offset(offset);

            return { hikes, total };
        } catch (error) {
            console.error('Error in getUpcomingHikes:', error);
            throw error;
        }
    }

    static async getUserStatistics(userId) {
        try {
            // First get the pohodnik ID
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .select('IDPohodnik')
                .first();

            if (!pohodnik) {
                return {
                    totalHikes: 0,
                    totalAltitude: 0,
                    totalHours: 0,
                };
            }

            // Get statistics from Prijava and Pohod tables
            const stats = await db('Prijava as pr')
                .join('Pohod as p', 'pr.TK_Pohod', 'p.IDPohod')
                .where('pr.TK_Pohodnik', pohodnik.IDPohodnik)
                .select(
                    db.raw('COUNT(DISTINCT pr.TK_Pohod) as totalHikes'),
                    db.raw('SUM(p.Visina) as totalAltitude'),
                    db.raw('SUM(p.CasHoje) as totalHours')
                )
                .first();

            return {
                totalHikes: stats.totalHikes || 0,
                totalAltitude: stats.totalAltitude || 0,
                totalHours: stats.totalHours || 0,
            };
        } catch (error) {
            console.error('Error in getUserStatistics:', error);
            throw error;
        }
    }
}

module.exports = Profile;
