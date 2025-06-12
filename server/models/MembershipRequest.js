const db = require('../config/db');

class MembershipRequest {
    static async getRequestsForDrustvo(drustvoId) {
        try {
            return await db('Zahteve_za_vclanitev as z')
                .join('Pohodnik as p', 'z.TK_Pohodnik', 'p.IDPohodnik')
                .join('Uporabnik as u', 'p.TK_Uporabnik', 'u.IDUporabnik')
                .where('z.TK_PohodniskoDrustvo', drustvoId)
                .where('z.Dogajanje', 'V obdelavi')
                .select(
                    'z.IDZahteva',
                    'z.DatumZahteve',
                    'u.UporabniskoIme',
                    'p.IDPohodnik',
                    'p.Ime',
                    'p.Priimek'
                )
                .orderBy('z.DatumZahteve', 'desc');
        } catch (error) {
            console.error('Error in getRequestsForDrustvo:', error);
            throw error;
        }
    }

    static async create(drustvoId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                throw new Error('Pohodnik profile not found for this user');
            }

            return await db('Zahteve_za_vclanitev').insert({
                TK_PohodniskoDrustvo: drustvoId,
                TK_Pohodnik: pohodnik.IDPohodnik,
                DatumZahteve: new Date(),
                Dogajanje: 'V obdelavi',
            });
        } catch (error) {
            console.error('Error in create:', error);
            throw error;
        }
    }

    static async handleRequest(requestId, action) {
        const trx = await db.transaction();
        try {
            const request = await trx('Zahteve_za_vclanitev')
                .where('IDZahteva', requestId)
                .first();

            if (!request) {
                throw new Error('Request not found');
            }

            await trx('Zahteve_za_vclanitev')
                .where('IDZahteva', requestId)
                .update({
                    Dogajanje: action === 'accept' ? 'Sprejeto' : 'Zavrnjeno',
                });

            if (action === 'accept') {
                // Add to Clanarina table (WITHOUT Dogajanje field)
                await trx('Clanarina').insert({
                    TK_PohodniskoDrustvo: request.TK_PohodniskoDrustvo,
                    TK_Pohodnik: request.TK_Pohodnik,
                });
            }

            await trx.commit();
            return true;
        } catch (error) {
            await trx.rollback();
            console.error('Error in handleRequest:', error);
            throw error;
        }
    }

    // Remove the duplicate method and keep only this one
    static async checkMembershipStatus(drustvoId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                return { isMember: false, hasPendingRequest: false };
            }

            // Check if member
            const membership = await db('Clanarina')
                .where({
                    TK_PohodniskoDrustvo: drustvoId,
                    TK_Pohodnik: pohodnik.IDPohodnik,
                })
                .first();

            // Check if has pending request
            const pendingRequest = await db('Zahteve_za_vclanitev')
                .where({
                    TK_PohodniskoDrustvo: drustvoId,
                    TK_Pohodnik: pohodnik.IDPohodnik,
                    Dogajanje: 'V obdelavi',
                })
                .first();

            const result = {
                isMember: !!membership,
                hasPendingRequest: !!pendingRequest,
            };

            return result;
        } catch (error) {
            console.error('Error in checkMembershipStatus:', error);
            throw error;
        }
    }

    static async checkMembershipStatusByUserId(drustvoUserId, userId) {
        try {
            let actualDrustvoId = drustvoUserId;

            const drustvo = await db('PohodniskoDrustvo')
                .where('TK_Uporabnik', drustvoUserId)
                .first();

            if (drustvo) {
                actualDrustvoId = drustvo.IDPohodniskoDrustvo;
            }

            return await this.checkMembershipStatus(actualDrustvoId, userId);
        } catch (error) {
            console.error('Error in checkMembershipStatusByUserId:', error);
            throw error;
        }
    }

    static async leaveMembership(drustvoId, userId) {
        try {
            const pohodnik = await db('Pohodnik')
                .where('TK_Uporabnik', userId)
                .first();

            if (!pohodnik) {
                throw new Error('Pohodnik not found');
            }

            // Remove from membership
            await db('Clanarina')
                .where({
                    TK_PohodniskoDrustvo: drustvoId,
                    TK_Pohodnik: pohodnik.IDPohodnik,
                })
                .del();

            return true;
        } catch (error) {
            console.error('Error in leaveMembership:', error);
            throw error;
        }
    }
}

module.exports = MembershipRequest;
