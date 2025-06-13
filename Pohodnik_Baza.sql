-- Disable foreign key checks to avoid constraint errors during DROP
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS Pohodniki;
USE Pohodniki;

-- Drop tables in order from most dependent to least
DROP TABLE IF EXISTS prijava;
DROP TABLE IF EXISTS komentar;
DROP TABLE IF EXISTS clanarina;
DROP TABLE IF EXISTS pohod;
DROP TABLE IF EXISTS zahteve_za_vclanitev;
DROP TABLE IF EXISTS ocena_drustva;
DROP TABLE IF EXISTS pohodnik;
DROP TABLE IF EXISTS pohodniskodrustvo;
DROP TABLE IF EXISTS uporabnik;

-- Re-enable foreign key checks after dropping
SET FOREIGN_KEY_CHECKS = 1;

-- Table creation statements (unchanged)
CREATE TABLE IF NOT EXISTS Uporabnik (
  IDUporabnik INT NOT NULL AUTO_INCREMENT,
  UporabniskoIme VARCHAR(30) NOT NULL,
  Geslo VARCHAR(60) NOT NULL,
  PRIMARY KEY (IDUporabnik)
);

CREATE TABLE IF NOT EXISTS PohodniskoDrustvo (
  IDPohodniskoDrustvo INT NOT NULL AUTO_INCREMENT,
  DrustvoIme VARCHAR(100) NOT NULL,
  Opis TEXT,
  Naslov VARCHAR(100) NOT NULL,
  LetoUstanovitve YEAR NOT NULL,
  Predsednik VARCHAR(45) NOT NULL,
  TK_Uporabnik INT NOT NULL,
  PRIMARY KEY (IDPohodniskoDrustvo),
  INDEX fk_PohodniskoDrustvo_Uporabnik1_idx (TK_Uporabnik),
  CONSTRAINT fk_PohodniskoDrustvo_Uporabnik1
    FOREIGN KEY (TK_Uporabnik)
    REFERENCES Uporabnik (IDUporabnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Pohod (
  IDPohod INT NOT NULL AUTO_INCREMENT,
  PohodIme VARCHAR(45) NOT NULL,
  Lokacija VARCHAR(50) NOT NULL,
  DatumPohoda DATETIME NOT NULL,
  TK_PohodniskoDrustvo INT NOT NULL,
  ZbirnoMesto VARCHAR(100) NOT NULL,
  PohodOpis VARCHAR(100) NOT NULL,
  Tezavnost INT NOT NULL,
  Trajanje TIME NOT NULL,
  ObveznaOprema VARCHAR(100) NOT NULL,
  PricakovaneRazmere VARCHAR(100) NOT NULL,
  Prevoz VARCHAR(45) NOT NULL,
  StroskiPrevoza DECIMAL(5,2) NOT NULL,
  ProstaMesta INT NOT NULL,
  Vodic VARCHAR(45) NOT NULL,
  VodicKontakt VARCHAR(45) NOT NULL,
  PRIMARY KEY (IDPohod),
  INDEX fk_Pohod_PohodniskoDrustvo_idx (TK_PohodniskoDrustvo),
  CONSTRAINT fk_Pohod_PohodniskoDrustvo
    FOREIGN KEY (TK_PohodniskoDrustvo)
    REFERENCES PohodniskoDrustvo (IDPohodniskoDrustvo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Pohodnik (
  IDPohodnik INT NOT NULL AUTO_INCREMENT,
  Ime VARCHAR(20) NOT NULL,
  Priimek VARCHAR(45) NOT NULL,
  DatumRojstva DATE NOT NULL,
  Prebivalisce VARCHAR(100) NOT NULL,
  TK_Uporabnik INT NOT NULL,
  PRIMARY KEY (IDPohodnik),
  INDEX fk_Pohodnik_Uporabnik1_idx (TK_Uporabnik),
  CONSTRAINT fk_Pohodnik_Uporabnik1
    FOREIGN KEY (TK_Uporabnik)
    REFERENCES Uporabnik (IDUporabnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Clanarina (
  IDClanarina INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  TK_PohodniskoDrustvo INT NOT NULL,
  TK_Pohodnik INT NOT NULL,
  INDEX fk_PohodniskoDrustvo_has_Pohodnik_Pohodnik1_idx (TK_Pohodnik),
  INDEX fk_PohodniskoDrustvo_has_Pohodnik_PohodniskoDrustvo1_idx (TK_PohodniskoDrustvo),
  CONSTRAINT fk_PohodniskoDrustvo_has_Pohodnik_PohodniskoDrustvo1
    FOREIGN KEY (TK_PohodniskoDrustvo)
    REFERENCES PohodniskoDrustvo (IDPohodniskoDrustvo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_PohodniskoDrustvo_has_Pohodnik_Pohodnik1
    FOREIGN KEY (TK_Pohodnik)
    REFERENCES Pohodnik (IDPohodnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Komentar (
  IDKomentar INT NOT NULL AUTO_INCREMENT,
  TK_Pohodnik INT NOT NULL,
  TK_Pohod INT NOT NULL,
  Komentar VARCHAR(50) NULL,
  INDEX fk_Pohodnik_has_Pohod_Pohod1_idx (TK_Pohod),
  INDEX fk_Pohodnik_has_Pohod_Pohodnik1_idx (TK_Pohodnik),
  PRIMARY KEY (IDKomentar),
  CONSTRAINT fk_Pohodnik_has_Pohod_Pohodnik1
    FOREIGN KEY (TK_Pohodnik)
    REFERENCES Pohodnik (IDPohodnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_Pohodnik_has_Pohod_Pohod1
    FOREIGN KEY (TK_Pohod)
    REFERENCES Pohod (IDPohod)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Prijava (
  IDPrijava INT NOT NULL AUTO_INCREMENT,
  TK_Pohod INT NOT NULL,
  TK_Pohodnik INT NOT NULL,
  DatumPrijave DATE NOT NULL,
  PRIMARY KEY (IDPrijava),
  INDEX fk_Pohod_has_Pohodnik_Pohodnik1_idx (TK_Pohodnik),
  INDEX fk_Pohod_has_Pohodnik_Pohod1_idx (TK_Pohod),
  CONSTRAINT fk_Pohod_has_Pohodnik_Pohod1
    FOREIGN KEY (TK_Pohod)
    REFERENCES Pohod (IDPohod)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_Pohod_has_Pohodnik_Pohodnik1
    FOREIGN KEY (TK_Pohodnik)
    REFERENCES Pohodnik (IDPohodnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE IF NOT EXISTS Zahteve_za_vclanitev (
  IDZahteva INT NOT NULL AUTO_INCREMENT,
  TK_PohodniskoDrustvo INT NOT NULL,
  TK_Pohodnik INT NOT NULL,
  DatumZahteve DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  Dogajanje ENUM('V obdelavi', 'Sprejeto', 'Zavrnjeno') NOT NULL DEFAULT 'V obdelavi',
  PRIMARY KEY (IDZahteva),
  INDEX fk_Zahteve_za_vclanitev_PohodniskoDrustvo1_idx (TK_PohodniskoDrustvo),
  INDEX fk_Zahteve_za_vclanitev_Pohodnik1_idx (TK_Pohodnik),
  CONSTRAINT fk_Zahteve_za_vclanitev_PohodniskoDrustvo1
    FOREIGN KEY (TK_PohodniskoDrustvo)
    REFERENCES PohodniskoDrustvo (IDPohodniskoDrustvo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_Zahteve_za_vclanitev_Pohodnik1
    FOREIGN KEY (TK_Pohodnik)
    REFERENCES Pohodnik (IDPohodnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION
);

CREATE TABLE Ocena_drustva (
    IDOcena INT PRIMARY KEY AUTO_INCREMENT,
    TK_PohodniskoDrustvo INT NOT NULL,
    TK_Pohodnik INT NOT NULL,
    Ocena INT NOT NULL CHECK (Ocena >= 1 AND Ocena <= 5),
    Komentar TEXT,
    DatumOcene TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (TK_PohodniskoDrustvo) REFERENCES PohodniskoDrustvo(IDPohodniskoDrustvo) ON DELETE CASCADE,
    FOREIGN KEY (TK_Pohodnik) REFERENCES Pohodnik(IDPohodnik) ON DELETE CASCADE,
    UNIQUE KEY unique_rating (TK_PohodniskoDrustvo, TK_Pohodnik)
);

-- Additional columns and modifications
ALTER TABLE Clanarina ADD COLUMN Dogajanje ENUM('V obdelavi', 'Sprejeto', 'Zavrnjeno') NOT NULL DEFAULT 'Sprejeto';
ALTER TABLE Uporabnik ADD COLUMN ProfilePicture VARCHAR(255) NULL;
ALTER TABLE Komentar MODIFY COLUMN Komentar VARCHAR(500) NULL;
ALTER TABLE Komentar ADD COLUMN DatumKomentarja DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE Pohod ADD COLUMN SlikanaslovnicaFilename VARCHAR(255) NULL;

INSERT INTO Uporabnik(UporabniskoIme,Geslo) 
VALUES
('petra.novak', 'test'),
('janez.kranjc', 'test'),
('mojca.zupan', 'test'),
('david.oblak', 'test'),
('sara.horvat', 'test'),
('miha.petek', 'test'),
('katja.rozman', 'test'),
('tomaz.bizjak', 'test'),
('anja.kralj', 'test'),
('rok.jerala', 'test'),
('maja.sosic', 'test'),
('gregor.macek', 'test'),
('eva.planinsek', 'test'),
('luka.vidmar', 'test'),
('simona.kolar', 'test'),
('matej.potocnik', 'test'),
('tadeja.golob', 'test'),
('urban.cerne', 'test'),
('nika.breznik', 'test'),
('jure.kamnik', 'test'),
('pd_koper', 'test'),
('pd_ptuj', 'test'),
('pd_nova_gorica', 'test'),
('pd_murska_sobota', 'test'),
('pd_postojna', 'test'),
('pd_bled', 'test'),
('pd_bohinj', 'test'),
('pd_tolmin', 'test'),
('pd_idrija', 'test'),
('pd_kamnik', 'test');

INSERT INTO Pohodnik (Ime, Priimek, DatumRojstva, Prebivalisce, TK_Uporabnik)
VALUES 
('Petra', 'Novak', '1987-04-20', 'Cankarjeva ulica 8, 1000 Ljubljana', 1),
('Janez', 'Kranjc', '1993-12-05', 'Slovenska cesta 45, 2000 Maribor', 2),
('Mojca', 'Zupan', '1989-08-17', 'Kidričeva ulica 12, 3000 Celje', 3),
('David', 'Oblak', '1986-02-28', 'Prešernova cesta 22, 4000 Kranj', 4),
('Sara', 'Horvat', '1994-10-14', 'Trubarjeva cesta 7, 8000 Novo Mesto', 5),
('Miha', 'Petek', '1991-06-03', 'Koprska ulica 18, 6000 Koper', 6),
('Katja', 'Rozman', '1984-01-25', 'Ptujska cesta 34, 2250 Ptuj', 7),
('Tomaž', 'Bizjak', '1996-09-08', 'Erjavčeva ulica 19, 5000 Nova Gorica', 8),
('Anja', 'Kralj', '1983-11-30', 'Murska cesta 25, 9000 Murska Sobota', 9),
('Rok', 'Jerala', '1990-07-22', 'Postojnska cesta 16, 6230 Postojna', 10),
('Maja', 'Sošič', '1988-03-11', 'Cesta svobode 41, 4260 Bled', 11),
('Gregor', 'Maček', '1985-05-07', 'Ribčev Laz 42, 4265 Bohinj', 12),
('Eva', 'Planinšek', '1992-12-19', 'Tolminska cesta 8, 5220 Tolmin', 13),
('Luka', 'Vidmar', '1987-08-26', 'Idrijska ulica 15, 5280 Idrija', 14),
('Simona', 'Kolar', '1993-04-02', 'Kamniška cesta 28, 1241 Kamnik', 15),
('Matej', 'Potočnik', '1986-10-15', 'Gregorčičeva ulica 11, 1000 Ljubljana', 16),
('Tadeja', 'Golob', '1991-01-09', 'Lackova cesta 19, 2000 Maribor', 17),
('Urban', 'Černe', '1989-06-18', 'Savinjska cesta 31, 3000 Celje', 18),
('Nika', 'Breznik', '1995-02-24', 'Bleiweisova cesta 13, 4000 Kranj', 19),
('Jure', 'Kamnik', '1984-09-12', 'Glavni trg 5, 8000 Novo Mesto', 20);


-- More pohodniška društva
INSERT INTO PohodniskoDrustvo (DrustvoIme, Naslov, LetoUstanovitve, Predsednik, TK_Uporabnik)
VALUES
('Pohodno društvo Koper', 'Pristaniška ulica 14, 6000 Koper', 1985, 'Miha Petek', 21),
('Pohodno društvo Ptuj', 'Slovenski trg 8, 2250 Ptuj', 1992, 'Katja Rozman', 22),
('Pohodno društvo Nova Gorica', 'Beverinova ulica 3, 5000 Nova Gorica', 1987, 'Tomaž Bizjak', 23),
('Pohodno društvo Murska Sobota', 'Slovenska ulica 40, 9000 Murska Sobota', 1995, 'Anja Kralj', 24),
('Pohodno društvo Postojna', 'Jamska cesta 22, 6230 Postojna', 1980, 'Rok Jerala', 25),
('Pohodno društvo Bled', 'Cesta svobode 15, 4260 Bled', 1975, 'Maja Sošič', 26),
('Pohodno društvo Bohinj', 'Ribčev Laz 50, 4265 Bohinj', 1970, 'Gregor Maček', 27),
('Pohodno društvo Tolmin', 'Ulica padlih borcev 12, 5220 Tolmin', 1983, 'Eva Planinšek', 28),
('Pohodno društvo Idrija', 'Mestni trg 2, 5280 Idrija', 1988, 'Luka Vidmar', 29),
('Pohodno društvo Kamnik', 'Glavni trg 24, 1241 Kamnik', 1979, 'Simona Kolar', 30);

INSERT INTO Clanarina (TK_PohodniskoDrustvo, TK_Pohodnik)
VALUES 
(1, 2), (1, 3), (1, 4), (1, 5),
(2, 6), (2, 7), (2, 8), (2, 9),
(3, 10), (3, 11), (3, 12), (3, 13),
(4, 14), (4, 15), (4, 16), (4, 17),
(5, 18), (5, 19), (5, 20), (5, 1);

INSERT INTO Pohod(PohodIme, Lokacija, DatumPohoda, TK_PohodniskoDrustvo, ZbirnoMesto, PohodOpis, Tezavnost, Trajanje, ObveznaOprema, PricakovaneRazmere, Prevoz, StroskiPrevoza, ProstaMesta, Vodic, VodicKontakt)
VALUES
('Vzpon na Triglav', 'Triglav', '2025-08-15 06:00:00', 2, 'Aljažev dom v Vratih', 'Najlepši vzpon na najvišji vrh Slovenije skozi Triglavsko severno steno', 5, '12:00:00', 'Plezalni pas, čelada, dereze, topla obleka', 'Spremenljivo, možnost neviht', 'Planinski avtobus', '25.00', 8, 'France Prešeren', '041 555 111'),

('Sprehod po Škocjanskih jamah', 'Škocjanske jame', '2025-07-10 10:00:00', 6, 'Visitor center Škocjanske jame', 'Ogled najlepših podzemnih jam v Sloveniji z UNESCO zaščito', 1, '03:00:00', 'Primerna obutev, jakna', 'V jami konstantnih 12°C', 'Lastni prevoz', '0.00', 30, 'Miha Petek', '040 999 888'),

('Pohod čez Vipavsko dolino', 'Vipavska dolina', '2025-06-25 08:30:00', 7, 'Ajdovščina, glavni trg', 'Panoramski pohod po vinogradniških poteh z degustacijo vin', 2, '06:00:00', 'Sončna krema, klobuk, voda', 'Toplo in sončno', 'Minibus', '8.00', 22, 'Tomaž Bizjak', '041 777 666'),

('Tura po Logarski dolini', 'Logarska dolina', '2025-09-12 07:00:00', 3, 'Hotel Plesnik', 'Alpska idila skozi najlepšo slovensko ledeniško dolino', 3, '07:30:00', 'Planinske palice, nepremočljiva jakna', 'Hladno zjutraj, toplo opoldne', 'Avtobusni prevoz', '18.00', 16, 'Tina Zagar', '040 444 333'),

('Nočni pohod na Nanos', 'Nanos', '2025-07-20 20:00:00', 6, 'Razdrto, parkirišče ob cesti', 'Romantičen nočni vzpon z opazovanjem zvezd', 2, '04:00:00', 'Svetilka, topla obleka, termos', 'Jasno nebo, hladno ponoči', 'Lastni prevoz', '0.00', 12, 'Miha Petek', '040 999 888'),

('Raziskovanje Postojnske jame', 'Postojnska jama', '2025-08-08 14:00:00', 8, 'Postojnska jama, glavni vhod', 'Avanturistično raziskovanje skritih rovov s posebnim dovoljenjem', 4, '05:00:00', 'Čelada s svetilko, stara obleka, rokavice', 'Vlažno, 10°C', 'Lastni prevoz', '0.00', 10, 'Rok Jerala', '041 222 111'),

('Družinski pohod na Šmarno goro', 'Šmarna gora', '2025-06-28 09:00:00', 2, 'Tacen, parkirišče pri gostilni', 'Lahek družinski izlet z otroki na ljubljanski hrib', 1, '03:30:00', 'Udobna obutev, pijača', 'Prijetno, možni popoldanski nalivi', 'Lastni prevoz', '0.00', 25, 'France Prešeren', '041 555 111'),

('Pohod po Kamniško-Savinjskih Alpah', 'Kamniška Bistrica', '2025-09-22 06:30:00', 3, 'Dom v Kamniški Bistrici', 'Zahteven gorski pohod preko sedel in vrhov', 4, '10:00:00', 'Pohodne palice, planinska oprema, prva pomoč', 'Vremenska nestanovitnost', 'Planinski kombi', '20.00', 14, 'Simona Kolar', '040 123 789'),

('Kulinarični pohod po Brkinah', 'Brkini', '2025-07-05 10:00:00', 6, 'Ilirska Bistrica, trg', 'Spoznavanje tradicionalne kuhinje ob sproščenem pohodu', 2, '05:30:00', 'Lahka obleka, dober apetit', 'Toplo, občasna burja', 'Mikroavtobus', '12.00', 20, 'Miha Petek', '040 999 888'),

('Zimski pohod na Uršljo goro', 'Uršlja gora', '2025-12-15 08:00:00', 4, 'Solčava, center vasi', 'Čudovit zimski vzpon na enega najlepših razglednih vrhov', 3, '06:00:00', 'Dereze, pohodne palice, topla obleka', 'Mrzlo, možen sneg', 'Terenska vozila', '15.00', 18, 'Luka Mešič', '041 333 444'),

('Botanični pohod po Trnovski planoti', 'Trnovska planota', '2025-05-30 09:00:00', 7, 'Lokve, parkirišče', 'Spoznavanje redkih alpskih rastlin z botanikom', 2, '04:30:00', 'Lupa, beležka, fotoaparat', 'Prijetno, možna meglica', 'Lastni prevoz', '0.00', 15, 'Tomaž Bizjak', '041 777 666'),

('Fotografski pohod po Dolini Vrat', 'Dolina Vrat', '2025-06-20 05:30:00', 9, 'Mojstrana, parkirišče', 'Zajemanje najlepših kadrov Triglava ob sončnem vzhodu', 2, '07:00:00', 'Fotoaparat, stojalo, topla obleka', 'Hladno zgodaj zjutraj', 'Lastni prevoz', '0.00', 12, 'Eva Planinšek', '040 666 777'),

('Geološki pohod po Koprskih brdih', 'Koprska brda', '2025-08-25 16:00:00', 6, 'Ankaran, pristanišče', 'Raziskovanje geoloških posebnosti ob obali', 1, '03:00:00', 'Udobna obutev, voda', 'Vroče popoldne', 'Lastni prevoz', '0.00', 25, 'Miha Petek', '040 999 888'),

('Zgodovinski pohod po Krasu', 'Kras', '2025-09-18 10:00:00', 6, 'Štanjel, glavni trg', 'Odkrivanje zgodovinskih skrivnosti kraške pokrajine', 2, '05:00:00', 'Udobni čevlji, sončna krema', 'Toplo, možna burja', 'Mikroavtobus', '10.00', 20, 'Miha Petek', '040 999 888'),

('Pohod na Mangartsko sedlo', 'Mangartsko sedlo', '2025-08-30 07:00:00', 9, 'Log pod Mangartom', 'Vzpon na najvišje cestno prevozno sedlo v Sloveniji', 3, '08:00:00', 'Planinska oprema, topla obleka', 'Hladno, spremenljivo', 'Planinski avtobus', '22.00', 16, 'Eva Planinšek', '040 666 777'),

('Wellness pohod po Dolenjski', 'Dolenjska', '2025-07-12 11:00:00', 5, 'Dolenjske Toplice', 'Sproščujoč pohod z obiskom termalnih virov', 1, '04:00:00', 'Kopalke, brisača, lahka obleka', 'Toplo in sončno', 'Avtobusni prevoz', '16.00', 24, 'Nina Hribar', '041 888 999'),

('Adrenalinski pohod v Julijske Alpe', 'Julijske Alpe', '2025-08-05 06:00:00', 9, 'Kranjska Gora, center', 'Ekstremni pohod za izkušene planince z elementi plezanja', 5, '11:00:00', 'Kompletna plezalna oprema, čelada', 'Nestanovitno, možne nevihte', 'Specialni prevoz', '30.00', 8, 'Eva Planinšek', '040 666 777'),

('Pohod za mlade družine', 'Bled', '2025-06-22 10:30:00', 6, 'Bled, parkirišče pri jezeru', 'Prijazen pohod okoli Blejskega jezera za starše z otroki', 1, '02:30:00', 'Otroški voziček, pijača, malica', 'Prijetno, sončno', 'Lastni prevoz', '0.00', 30, 'Maja Sošič', '041 111 222'),

('Treking po Pohorskih gozdovih', 'Pohorje', '2025-09-08 08:00:00', 1, 'Maribor, Pohorska vzpenjača', 'Večdnevni treking po skrivnostnih pohorskih poteh', 3, '09:00:00', 'Nahrbtnik, šotor, spalna vreča', 'Spremenljivo, možen dež', 'Žičniški prevoz', '35.00', 12, 'Gregor Maček', '040 123 455'),

('Meditacijski pohod na Svetino', 'Svetina', '2025-07-28 07:30:00', 10, 'Ribnica, glavna avtobusna postaja', 'Duhovni pohod z elementi meditacije in joge', 2, '05:30:00', 'Udobna obleka, podloga za jogo', 'Mirno, jutranjih 18°C', 'Minibus', '14.00', 16, 'Luka Vidmar', '040 789 123');

INSERT INTO Komentar (TK_Pohodnik, TK_pohod, Komentar)
VALUES
(2, 1, 'Odličen vodič, priporočam vsem!'),
(3, 1, 'Prekrasen razgled, težka pot vendar vredno'),
(4, 2, 'Fantastična izkušnja v jamah'),
(5, 3, 'Vino je bilo odlično, pohod tudi'),
(6, 4, 'Logarska dolina je res čudovita'),
(7, 5, 'Nočni pohod je bil nezabaven'),
(8, 6, 'Raziskovanje jam je bilo adrenalinska'),
(9, 7, 'Odličen družinski izlet'),
(10, 8, 'Zahteven vendar nagrajujoč pohod'),
(11, 9, 'Odlična hrana in družba'),
(12, 10, 'Zimski pohod je bil čudovit kljub mrazu'),
(13, 11, 'Naučil sem se veliko o rastlinah'),
(14, 12, 'Fotografije so bile spektakularne'),
(15, 13, 'Zanimiva geologija'),
(16, 14, 'Bogata zgodovina kraja'),
(17, 15, 'Mangartsko sedlo je bilo vrednosti vzpona'),
(18, 16, 'Sproščujoči termalni vrelci'),
(19, 17, 'Ekstremna izkušnja, le za izkušene'),
(20, 18, 'Otroci so bili navdušeni'),
(1, 20, 'Meditacija na vrhu je bila posebna'),
(2, 3, 'Vipavska dolina je prekrasna ob sončnem zahodu'),
(3, 5, 'Opazovanje zvezd je bilo magično'),
(4, 7, 'Družina je bila navdušena nad enostavnostjo poti'),
(5, 9, 'Tradicionalna hrana je bila izvrstna'),
(6, 11, 'Botanik je bil zelo strokoven'),
(7, 13, 'Geološke formacije so fascinantne'),
(8, 15, 'Razgled z Mangartskega sedla je nepopisen'),
(9, 17, 'Adrenalinski pohod za prave avanturiste'),
(10, 19, 'Pohorski gozdovi so polni presenečenj'),
(11, 2, 'Škocjanske jame so svetovna dediščina'),
(12, 4, 'Ledeniška dolina je popolna za fotografiranje'),
(13, 6, 'Postojnska jama skriva mnoge skrivnosti'),
(14, 8, 'Kamniško-Savinjske Alpe so izziv za vsakogar'),
(15, 10, 'Uršlja gora pozimi je pravljična'),
(16, 12, 'Fotografski pohod ob sončnem vzhodu'),
(17, 14, 'Kraška pokrajina je geološki biser'),
(18, 16, 'Wellness pohod je bil popolna sprostitev'),
(19, 18, 'Blejsko jezero je idealno za družine'),
(20, 20, 'Meditacija v naravi je terapevtska');


-- Many more prijave
INSERT INTO Prijava (TK_Pohod, TK_Pohodnik, DatumPrijave)
VALUES
(1, 2, '2025-05-20'),
(1, 3, '2025-05-21'),
(1, 4, '2025-05-22'),
(2, 5, '2025-06-01'),
(2, 6, '2025-06-02'),
(2, 7, '2025-06-03'),
(3, 8, '2025-06-05'),
(3, 9, '2025-06-06'),
(3, 10, '2025-06-07'),
(4, 11, '2025-07-01'),
(4, 12, '2025-07-02'),
(4, 13, '2025-07-03'),
(5, 14, '2025-07-10'),
(5, 15, '2025-07-11'),
(5, 16, '2025-07-12'),
(6, 17, '2025-07-15'),
(6, 18, '2025-07-16'),
(6, 19, '2025-07-17'),
(7, 20, '2025-06-20'),
(7, 1, '2025-06-22'),
(8, 2, '2025-08-01'),
(8, 3, '2025-08-02'),
(8, 4, '2025-08-03'),
(9, 5, '2025-06-25'),
(9, 6, '2025-06-26'),
(9, 7, '2025-06-27'),
(10, 8, '2025-11-01'),
(10, 9, '2025-11-02'),
(10, 10, '2025-11-03'),
(11, 11, '2025-05-25'),
(11, 12, '2025-05-26'),
(11, 13, '2025-05-27'),
(12, 14, '2025-06-15'),
(12, 15, '2025-06-16');

-- Zahteve za včlanitev
INSERT INTO Zahteve_za_vclanitev (TK_PohodniskoDrustvo, TK_Pohodnik, DatumZahteve, Dogajanje)
VALUES
(1, 5, '2025-05-10 10:30:00', 'V obdelavi'),
(1, 6, '2025-05-12 14:20:00', 'Sprejeto'),
(1, 7, '2025-05-15 09:15:00', 'Zavrnjeno'),
(2, 8, '2025-05-18 16:45:00', 'V obdelavi'),
(2, 9, '2025-05-20 11:30:00', 'Sprejeto'),
(3, 10, '2025-05-22 13:20:00', 'V obdelavi'),
(3, 11, '2025-05-25 08:45:00', 'Sprejeto'),
(4, 12, '2025-05-28 15:30:00', 'V obdelavi'),
(4, 13, '2025-06-01 12:15:00', 'Sprejeto'),
(5, 14, '2025-06-03 17:00:00', 'Zavrnjeno'),
(6, 15, '2025-06-05 10:45:00', 'V obdelavi'),
(6, 16, '2025-06-08 14:30:00', 'Sprejeto'),
(7, 17, '2025-06-10 09:20:00', 'V obdelavi'),
(7, 18, '2025-06-12 16:15:00', 'Sprejeto'),
(8, 19, '2025-06-15 11:45:00', 'V obdelavi'),
(8, 20, '2025-06-18 13:30:00', 'Sprejeto'),
(9, 1, '2025-06-22 15:45:00', 'V obdelavi'),
(10, 2, '2025-06-25 12:30:00', 'Sprejeto'),
(10, 3, '2025-06-28 17:15:00', 'V obdelavi');

-- Ocene društev
INSERT INTO Ocena_drustva (TK_PohodniskoDrustvo, TK_Pohodnik, Ocena, Komentar)
VALUES
(1, 2, 5, 'Odlično društvo z izkušenimi vodniki'),
(1, 3, 4, 'Dobra organizacija, priporočam'),
(1, 4, 5, 'Najboljše društvo v Mariboru'),
(2, 5, 4, 'Dobri pohodi, prijazni ljudje'),
(2, 6, 3, 'V redu, lahko bi bilo boljše'),
(2, 7, 5, 'Izvrstna družba in organizacija'),
(3, 8, 4, 'Lepo društvo, zanimivi pohodi'),
(3, 9, 5, 'Odličen program za vse starosti'),
(4, 10, 3, 'Povprečno društvo'),
(4, 11, 4, 'Dobri vodniki, slaba oprema'),
(5, 12, 5, 'Fantastično društvo, vse pohvale'),
(5, 13, 4, 'Lepa izkušnja, pridem znova'),
(6, 14, 2, 'Slaba organizacija, ne priporočam'),
(6, 15, 4, 'Kljub nekaterim pomanjkljivostim dobro'),
(7, 16, 5, 'Izvrstno društvo za zahtevne pohode'),
(7, 17, 3, 'Povprečno, nič posebnega'),
(8, 18, 4, 'Dobro društvo za začetnike'),
(8, 19, 5, 'Odličen program, vse pohvale'),
(9, 20, 4, 'Prijetno društvo, lepi pohodi'),
(10, 1, 5, 'Najboljše društvo za gorske ture'),
(10, 2, 4, 'Dobra izbira pohodov');
