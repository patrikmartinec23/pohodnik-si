function init() {
    document
        .getElementById('formaRegistracije')
        .addEventListener('submit', function (e) {
            e.preventDefault();
            shraniPohodnika();
        });
}

async function shraniPohodnika() {
    let sporočilaNapake = [];

    let upoIme = document.getElementById('username').value.trim();
    if (upoIme === '') {
        sporočilaNapake.push('Izpolnite vsa polja.');
    }

    let password = document.getElementById('password').value.trim();
    let geslo = document.getElementById('confirmPassword').value.trim();
    if (password != geslo) {
        sporočilaNapake.push('Vnesite enaka gesla.');
    }

    let ime = document.getElementById('name').value;
    if (ime == '') {
        sporočilaNapake.push('Izpolnite vsa polja.');
    }

    let priimek = document.getElementById('surname').value;
    if (priimek == '') {
        sporočilaNapake.push('Izpolnite vsa polja.');
    }

    let datumRojstva = document.getElementById('birthDate').value;

    let naslov = document.getElementById('address').value;
    if (naslov == '') {
        sporočilaNapake.push('Izpolnite vsa polja.');
    }

    var datestr = new Date(datumRojstva).toISOString().slice(0, 10);

    const podatkiOseb = {
        uporabniskoIme: upoIme,
        geslo: geslo,
        ime: ime,
        priimek: priimek,
        datumRojstva: datestr,
        naslov: naslov,
    };

    try {
        const odziv = await fetch('/api/registracija-pohodnik', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(podatkiOseb),
        });

        const rezultat = await odziv.json();
        if (odziv.ok) {
            alert('Registracija uspešna!');
            window.location.href = '/prijava.html';
        } else {
            alert('Napaka: ' + rezultat.error);
        }
    } catch (napaka) {
        console.error('Napaka pri pošiljanju registracije:', napaka);
        alert('Napaka pri strežniku.');
    }
}
