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

    static async create(drustvoId, pohodnikId) {
        try {
            const [id] = await db('Zahteve_za_vclanitev').insert({
                TK_PohodniskoDrustvo: drustvoId,
                TK_Pohodnik: pohodnikId,
                DatumZahteve: db.fn.now(),
                Dogajanje: 'V obdelavi',
            });
            return id;
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
}

module.exports = MembershipRequest;
