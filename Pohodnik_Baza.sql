CREATE DATABASE IF NOT EXISTS Pohodniki;
USE Pohodniki;

-- -----------------------------------------------------
-- Table Uporabnik
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Uporabnik (
  IDUporabnik INT NOT NULL AUTO_INCREMENT,
  UporabniškoIme VARCHAR(30) NOT NULL,
  Geslo VARCHAR(20) NOT NULL,
  PRIMARY KEY (IDUporabnik)
);


-- -----------------------------------------------------
-- Table PohodniskoDrustvo
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS PohodniskoDrustvo (
  IDPohodniskoDrustvo INT NOT NULL AUTO_INCREMENT,
  DrustvoIme VARCHAR(100) NOT NULL,
  Naslov VARCHAR(100) NOT NULL,
  LetoUstanovitve YEAR NOT NULL,
  Predsednik VARCHAR(45) NOT NULL,
  TK_Uporabnik INT NOT NULL,
  PRIMARY KEY (IDPohodniskoDrustvo),
  INDEX fk_PohodniskoDrustvo_Uporabnik1_idx (TK_Uporabnik ASC) VISIBLE,
  CONSTRAINT fk_PohodniskoDrustvo_Uporabnik1
    FOREIGN KEY (TK_Uporabnik)
    REFERENCES Uporabnik (IDUporabnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
;


-- -----------------------------------------------------
-- Table Pohod
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Pohod (
  IDPohod INT NOT NULL AUTO_INCREMENT,
  PohodIme VARCHAR(45) NOT NULL,
  Lokacija VARCHAR(50) NOT NULL,
  DatumPohoda DATE NOT NULL,
  TK_PohodniskoDrustvo INT NOT NULL,
  ZbirnoMesto VARCHAR(45) NOT NULL,
  PohodOpis VARCHAR(100) NOT NULL,
  Težavnost INT NOT NULL,
  Trajanje TIME NOT NULL,
  ObveznaOprema VARCHAR(100) NOT NULL,
  PricakovaneRazmere VARCHAR(45) NOT NULL,
  Prevoz VARCHAR(45) NOT NULL,
  StroskiPrevoza DECIMAL(5,2) NOT NULL,
  ProstaMesta INT NOT NULL,
  Vodic VARCHAR(45) NOT NULL,
  VodicKontakt VARCHAR(45) NOT NULL,
  PRIMARY KEY (IDPohod),
  INDEX fk_Pohod_PohodniskoDrustvo_idx (TK_PohodniskoDrustvo ASC) VISIBLE,
  CONSTRAINT fk_Pohod_PohodniskoDrustvo
    FOREIGN KEY (TK_PohodniskoDrustvo)
    REFERENCES PohodniskoDrustvo (IDPohodniskoDrustvo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table Pohodnik
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Pohodnik (
  IDPohodnik INT NOT NULL AUTO_INCREMENT,
  Ime VARCHAR(20) NOT NULL,
  Priimek VARCHAR(45) NOT NULL,
  DatumRojstva DATE NOT NULL,
  Prebivalisce VARCHAR(100) NOT NULL,
  TK_Uporabnik INT NOT NULL,
  PRIMARY KEY (IDPohodnik),
  INDEX fk_Pohodnik_Uporabnik1_idx (TK_Uporabnik ASC) VISIBLE,
  CONSTRAINT fk_Pohodnik_Uporabnik1
    FOREIGN KEY (TK_Uporabnik)
    REFERENCES Uporabnik (IDUporabnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table Članarina
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Clanarina (
  IDClanarina INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  TK_PohodniskoDrustvo INT NOT NULL,
  TK_Pohodnik INT NOT NULL,
  INDEX fk_PohodniskoDrustvo_has_Pohodnik_Pohodnik1_idx (TK_Pohodnik ASC) VISIBLE,
  INDEX fk_PohodniskoDrustvo_has_Pohodnik_PohodniskoDrustvo1_idx (TK_PohodniskoDrustvo ASC) VISIBLE,
  CONSTRAINT fk_PohodniskoDrustvo_has_Pohodnik_PohodniskoDrustvo1
    FOREIGN KEY (TK_PohodniskoDrustvo)
    REFERENCES PohodniskoDrustvo (IDPohodniskoDrustvo)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_PohodniskoDrustvo_has_Pohodnik_Pohodnik1
    FOREIGN KEY (TK_Pohodnik)
    REFERENCES Pohodnik (IDPohodnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table Komentar
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Komentar (
  IDKomentar INT NOT NULL AUTO_INCREMENT,
  TK_Pohodnik INT NOT NULL,
  TK_Pohod INT NOT NULL,
  Komentar VARCHAR(50) NULL,
  Ocena INT NOT NULL,
  INDEX fk_Pohodnik_has_Pohod_Pohod1_idx (TK_Pohod ASC) VISIBLE,
  INDEX fk_Pohodnik_has_Pohod_Pohodnik1_idx (TK_Pohodnik ASC) VISIBLE,
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
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table Fotografija
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Fotografija (
  IDFotografija INT NOT NULL AUTO_INCREMENT,
  Fotografija VARCHAR(100) NOT NULL,
  Opis VARCHAR(45) NOT NULL,
  TK_Pohod INT NOT NULL,
  PRIMARY KEY (IDFotografija),
  INDEX fk_Fotografija_Pohod1_idx (TK_Pohod ASC) VISIBLE,
  CONSTRAINT fk_Fotografija_Pohod1
    FOREIGN KEY (TK_Pohod)
    REFERENCES Pohod (IDPohod)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);


-- -----------------------------------------------------
-- Table Prijava
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS Prijava (
  IDPrijava INT NOT NULL AUTO_INCREMENT,
  TK_Pohod INT NOT NULL,
  TK_Pohodnik INT NOT NULL,
  DatumPrijave DATE NOT NULL,
  PRIMARY KEY (IDPrijava),
  INDEX fk_Pohod_has_Pohodnik_Pohodnik1_idx (TK_Pohodnik ASC) VISIBLE,
  INDEX fk_Pohod_has_Pohodnik_Pohod1_idx (TK_Pohod ASC) VISIBLE,
  CONSTRAINT fk_Pohod_has_Pohodnik_Pohod1
    FOREIGN KEY (TK_Pohod)
    REFERENCES Pohod (IDPohod)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT fk_Pohod_has_Pohodnik_Pohodnik1
    FOREIGN KEY (TK_Pohodnik)
    REFERENCES Pohodnik (IDPohodnik)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
SELECT * FROM Pohodnik;
SELECT * FROM PohodniskoDrustvo;
SELECT * FROM Pohod;

INSERT INTO Uporabnik(UporabniškoIme,Geslo)
VALUES('Mako','Mako123');
INSERT INTO Uporabnik(UporabniškoIme,Geslo)
VALUES('PDMaribor','mojPohod');
    
INSERT INTO Pohodnik (Ime, Priimek, DatumRojstva,Prebivalisce,TK_Uporabnik)
VALUES ('Matjaž', 'Kovač','2000-01-01','Mariborska ulica 2, 1000 Ljubljana',1);

INSERT INTO PohodniskoDrustvo (DrustvoIme,Naslov,LetoUstanovitve,Predsednik,TK_Uporabnik)
VALUES('Pohodno društvo Maribor', 'Tezenska ulica 12, 2000 Maribor', 2003, 'Miran Poženi',2);

INSERT INTO Clanarina (TK_PohodniskoDrustvo,TK_Pohodnik)
VALUES (2,1);

INSERT INTO Pohod(PohodIme,Lokacija,DatumPohoda,TK_PohodniskoDrustvo,ZbirnoMesto,PohodOpis,Težavnost,Trajanje,ObveznaOprema,PricakovaneRazmere,Prevoz,StroskiPrevoza,ProstaMesta,Vodic,VodicKontakt)
VALUES('Pohod na Raduho', 'Raduha', '2025-06-12',1,'Pod Raduho','Celodnevni pohod na Raduho',2,'08:00:00','Pohodni čevlji','Sončno','Samostojni Prevoz', '0.00',25,'Gregor Maček','040123455');

INSERT INTO Fotografija (Fotografija,Opis,TK_Pohod)
VALUES ('slike/pohod.png','Slika pohoda',1);

INSERT INTO Komentar (TK_Pohodnik,TK_pohod,Komentar,Ocena)
VALUES(1,1,'Zelo dobro',5);

INSERT INTO Prijava (TK_Pohod,TK_Pohodnik,DatumPrijave)
VALUES(1,1,'2025-05-18');





