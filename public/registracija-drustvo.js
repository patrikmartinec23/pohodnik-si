function init()
{
    document.getElementById('formaRegistracije').addEventListener('submit', function(e) {
        e.preventDefault();
        shraniDrustvo();
    });
}

async function shraniDrustvo(){

    let sporočilaNapake = [];
    
    let upoIme = document.getElementById('username').value.trim();
    if (upoIme === "") {
        sporočilaNapake.push("Izpolnite vsa polja.");
    }

    let password = document.getElementById('password').value.trim();
    let geslo = document.getElementById('confirmPassword').value.trim();
    if (password != geslo) {
        sporočilaNapake.push("Vnesite enaka gesla.");
    }

    let ime = document.getElementById('nameOrganization').value;
    if (ime == "") {
        sporočilaNapake.push("Izpolnite vsa polja.");
    }

    let naslov = document.getElementById('addressOrganization').value;
    if (naslov == "") {
        sporočilaNapake.push("Izpolnite vsa polja.");
    }

    let letoUstanovitve = document.getElementById('year').value;
    if (letoUstanovitve >= 2025) {
        sporočilaNapake.push("Živite v prihodnosti?");
    }

    let predsednik = document.getElementById('president').value;
    if (predsednik == "") {
        sporočilaNapake.push("Izpolnite vsa polja.");
    }

    const podatkiDrustev = {
        uporabniskoIme: upoIme,
        geslo: geslo,
        drustvoIme: ime,
        naslov: naslov,
        letoUstanovitve: letoUstanovitve,
        predsednik: predsednik
      };

    try {
        const odziv = await fetch('/api/registracija-drustvo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(podatkiDrustev)
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

};