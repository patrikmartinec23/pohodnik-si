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

            // Get statistics
            const stats = await this.getUserStatistics(userId);

            return {
                ...profile,
                ...stats,
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
                    badge: 'Turist',
                };
            }

            // Get past hikes count (completed hikes)
            const today = new Date().toISOString().split('T')[0];
            const oneYearAgo = new Date();
            oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
            const oneYearAgoStr = oneYearAgo.toISOString().split('T')[0];

            // Count total past hikes
            const totalHikesResult = await db('Prijava as pr')
                .join('Pohod as p', 'pr.TK_Pohod', 'p.IDPohod')
                .where('pr.TK_Pohodnik', pohodnik.IDPohodnik)
                .where('p.DatumPohoda', '<', today)
                .count('* as total')
                .first();

            // Count hikes in the last year for badge calculation
            const lastYearHikesResult = await db('Prijava as pr')
                .join('Pohod as p', 'pr.TK_Pohod', 'p.IDPohod')
                .where('pr.TK_Pohodnik', pohodnik.IDPohodnik)
                .where('p.DatumPohoda', '<', today)
                .where('p.DatumPohoda', '>=', oneYearAgoStr)
                .count('* as total')
                .first();

            const totalHikes = parseInt(totalHikesResult.total) || 0;
            const lastYearHikes = parseInt(lastYearHikesResult.total) || 0;

            // Determine badge based on last year's hikes
            let badge = 'Turist';
            if (lastYearHikes > 100) {
                badge = 'Gorski gams';
            } else if (lastYearHikes > 50) {
                badge = 'Resni planinec';
            } else if (lastYearHikes > 10) {
                badge = 'Pohodnik';
            }

            return {
                totalHikes,
                badge,
            };
        } catch (error) {
            console.error('Error in getUserStatistics:', error);
            throw error;
        }
    }

    static async getDrustvoProfile(userId) {
        try {
            const drustvo = await db('PohodniskoDrustvo as pd')
                .select('pd.*', 'u.UporabniskoIme')
                .join('Uporabnik as u', 'pd.TK_Uporabnik', 'u.IDUporabnik')
                .where('pd.TK_Uporabnik', userId)
                .first();

            if (!drustvo) {
                return null;
            }

            const pohodiCount = await db('Pohod')
                .where('TK_PohodniskoDrustvo', drustvo.IDPohodniskoDrustvo)
                .count('* as count')
                .first();

            return {
                ...drustvo,
                pohodiCount: pohodiCount.count,
            };
        } catch (error) {
            console.error('Error in getDrustvoProfile:', error);
            throw error;
        }
    }
    static async getUserMemberships(userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                return [];
            }

            return await db('Clanarina as c')
                .join(
                    'PohodniskoDrustvo as pd',
                    'c.TK_PohodniskoDrustvo',
                    'pd.IDPohodniskoDrustvo'
                )
                .where('c.TK_Pohodnik', pohodnik.IDPohodnik)
                .select(
                    'pd.IDPohodniskoDrustvo',
                    'pd.DrustvoIme',
                    'pd.Naslov',
                    'pd.TK_Uporabnik as DrustvoUserId'
                )
                .orderBy('pd.DrustvoIme', 'asc');
        } catch (error) {
            console.error('Error in getUserMemberships:', error);
            throw error;
        }
    }

    static async getPastHikes(userId, page = 1, limit = 2) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
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
                .where('p.DatumPohoda', '<', today)
                .count('* as total');

            // Get paginated past hikes
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
                    'pd.DrustvoIme',
                    'pr.DatumPrijave'
                )
                .where('pr.TK_Pohodnik', pohodnik.IDPohodnik)
                .where('p.DatumPohoda', '<', today)
                .orderBy('p.DatumPohoda', 'desc')
                .limit(limit)
                .offset(offset);

            return { hikes, total };
        } catch (error) {
            console.error('Error in getPastHikes:', error);
            throw error;
        }
    }

    // Add this method to handle drustvo profile updates

    static async updateDrustvoProfile(drustvoId, profileData) {
        try {
            // Sanitize input data
            const updateData = {
                DrustvoIme: profileData.DrustvoIme,
                Naslov: profileData.Naslov,
                Predsednik: profileData.Predsednik,
                Opis: profileData.Opis,
            };

            // Remove undefined fields
            Object.keys(updateData).forEach((key) => {
                if (updateData[key] === undefined) {
                    delete updateData[key];
                }
            });

            // Update the drustvo record
            await db('PohodniskoDrustvo')
                .where('IDPohodniskoDrustvo', drustvoId)
                .update(updateData);

            return true;
        } catch (error) {
            console.error('Error in updateDrustvoProfile:', error);
            throw error;
        }
    }
}

module.exports = Profile;
