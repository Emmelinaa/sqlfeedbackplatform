/* Reset Script: Blatt 6
 Programmieren von Datenbanken SS 2022
*/

/*DROP DATABASE IF EXISTS krankenhaus;
CREATE DATABASE IF NOT EXISTS krankenhaus;
use krankenhaus;
# SET FOREIGN_KEY_CHECKS = 0;*/

CREATE SCHEMA IF NOT EXISTS hospital;
SET search_path TO hospital, public;

DROP TABLE IF EXISTS mitarbeiter CASCADE;
CREATE TABLE mitarbeiter (
	pnr SERIAL PRIMARY KEY,
	geschlecht VARCHAR(45) NOT NULL,
	name VARCHAR(45) NOT NULL,
	gebdat DATE NOT NULL,
	strasse VARCHAR(45),
	hausnummer VARCHAR(45),
	ort VARCHAR(45),
	plz INT
);

DROP TABLE IF EXISTS pfleger CASCADE;
CREATE TABLE pfleger (
	pnr INT NOT NULL,
	stationid INT NOT NULL,
	PRIMARY KEY (pnr)
);

DROP TABLE IF EXISTS arzt CASCADE;
CREATE TABLE arzt (
	pnr INT NOT NULL,
	fachgebiet VARCHAR(45),
	PRIMARY KEY (pnr)
);

DROP TABLE IF EXISTS station CASCADE;
CREATE TABLE station (
	stationid SERIAL PRIMARY KEY,
	name VARCHAR(45),
	anzahlbetten INT
);

DROP TABLE IF EXISTS patient CASCADE;
CREATE TABLE patient (
	patnr SERIAL PRIMARY KEY,
	name VARCHAR(100) NOT NULL,
	gebdat DATE NOT NULL,
	geschlecht VARCHAR(45)
);

DROP TABLE IF EXISTS eingwpatient CASCADE;

CREATE TABLE eingwpatient (
	patnr INT NOT NULL,
	stationid INT NOT NULL,
	PRIMARY KEY (patnr)
);

DROP TABLE IF EXISTS symptome CASCADE;
CREATE TABLE symptome (
	sympid SERIAL PRIMARY KEY,
	beschreibung TEXT
);

DROP TABLE IF EXISTS krankheit CASCADE;

CREATE TABLE krankheit (
	fachname VARCHAR(100) NOT NULL,
	umgangsname VARCHAR(100),
	PRIMARY KEY (fachname)
);

DROP TABLE IF EXISTS medikament CASCADE;

CREATE TABLE medikament (
	name VARCHAR(100) NOT NULL,
	produzent VARCHAR(200) NOT NULL,
	bestand INT NOT NULL CHECK (bestand >= 0),
	preis DECIMAL(8,2),
	PRIMARY KEY (name)
);

DROP TABLE IF EXISTS ident_mit CASCADE;
CREATE TABLE ident_mit (
	name_1 VARCHAR(100) NOT NULL,
	name_2 VARCHAR(100) NOT NULL,
	PRIMARY KEY (name_1, name_2)
);

DROP TABLE IF EXISTS zugeordnet CASCADE;
CREATE TABLE zugeordnet (
	name VARCHAR(100) NOT NULL,
	fachname VARCHAR(100) NOT NULL,
	PRIMARY KEY (name, fachname)
);

DROP TABLE IF EXISTS treten_auf CASCADE;
CREATE TABLE treten_auf (
	fachname VARCHAR(100) NOT NULL,
	sympid INT NOT NULL,
	PRIMARY KEY (fachname, sympid)
);

DROP TABLE IF EXISTS betreut CASCADE;
CREATE TABLE betreut (
	pnr INT NOT NULL,
	patnr INT NOT NULL,
	tagzeit TIMESTAMP,
    kommentar VARCHAR(200),
	PRIMARY KEY (pnr, patnr, tagzeit, kommentar)
);

DROP TABLE IF EXISTS verschreibt CASCADE;
CREATE TABLE verschreibt (
	pnr INT NOT NULL,
	patnr INT NOT NULL,
	name VARCHAR(100) NOT NULL,
	tagzeit TIMESTAMP NOT NULL,
	dauer VARCHAR(50),
	dosierung INT NOT NULL,
	PRIMARY KEY (pnr, patnr, name, tagzeit)
);

DROP TABLE IF EXISTS diagnostiziert CASCADE;
CREATE TABLE diagnostiziert (
	pnr INT NOT NULL,
	patnr INT NOT NULL,
	fachname VARCHAR(100) NOT NULL,
	tagzeit TIMESTAMP NOT NULL,
	statusid INT NOT NULL,
	PRIMARY KEY (pnr, patnr, fachname, tagzeit)
);

DROP TABLE IF EXISTS status CASCADE;
CREATE TABLE status (
	statusid SERIAL PRIMARY KEY,
    name VARCHAR(100),
    beschreibung VARCHAR(2000)
);

ALTER TABLE arzt 
ADD CONSTRAINT arzt_mitarbeiter
  FOREIGN KEY (pnr)
  REFERENCES mitarbeiter (pnr)
  ON DELETE NO ACTION;

ALTER TABLE pfleger
ADD CONSTRAINT pfleger_mitarbeiter
  FOREIGN KEY (pnr)
  REFERENCES mitarbeiter (pnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT pfleger_station
  FOREIGN KEY (stationid)
  REFERENCES station (stationid)
  ON DELETE NO ACTION;

ALTER TABLE eingwpatient
ADD CONSTRAINT eingwpatient_patient
  FOREIGN KEY (patnr)
  REFERENCES patient (patnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT eingwpatient_station
  FOREIGN KEY (stationid)
  REFERENCES station (stationid)
  ON DELETE NO ACTION;

ALTER TABLE betreut 
ADD CONSTRAINT betreut_arzt
  FOREIGN KEY (pnr)
  REFERENCES arzt (pnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT betreut_patient
  FOREIGN KEY (patnr)
  REFERENCES patient (patnr)
  ON DELETE NO ACTION;

ALTER TABLE treten_auf 
ADD CONSTRAINT tretenauf_symptome
  FOREIGN KEY (sympid)
  REFERENCES symptome (sympid)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT tretenauf_krankheit
  FOREIGN KEY (fachname)
  REFERENCES krankheit (fachname)
  ON DELETE NO ACTION;

ALTER TABLE verschreibt
ADD CONSTRAINT verschreibt_patient
  FOREIGN KEY (patnr)
  REFERENCES patient (patnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT verschreibt_arzt
  FOREIGN KEY (pnr)
  REFERENCES arzt (pnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT verschreibt_medikament
  FOREIGN KEY (name)
  REFERENCES medikament (name)
  ON DELETE NO ACTION;

ALTER TABLE ident_mit
ADD CONSTRAINT ident_mit_medikament1
  FOREIGN KEY (name_1)
  REFERENCES medikament (name)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT ident_mit_medikament2
  FOREIGN KEY (name_2)
  REFERENCES medikament (name)
  ON DELETE NO ACTION;

ALTER TABLE diagnostiziert
ADD CONSTRAINT diagnostiziert_patient
  FOREIGN KEY (patnr)
  REFERENCES patient (patnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT diagnostiziert_arzt
  FOREIGN KEY (pnr)
  REFERENCES arzt (pnr)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT diagnostiziert_krankheit
  FOREIGN KEY (fachname)
  REFERENCES krankheit (fachname)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT diagnostiziert_status
  FOREIGN KEY (statusid)
  REFERENCES status (statusid)
  ON DELETE NO ACTION;
 
ALTER TABLE zugeordnet
ADD CONSTRAINT zugeordnet_medikament
  FOREIGN KEY (name)
  REFERENCES medikament (name)
  ON DELETE NO ACTION
  ON UPDATE NO ACTION,
ADD CONSTRAINT zugeordnet_krankheit
  FOREIGN KEY (fachname)
  REFERENCES krankheit (fachname)
  ON DELETE NO ACTION;

DROP TABLE IF EXISTS mitpat CASCADE;
CREATE TABLE mitpat (
  patnr INT NOT NULL,
  pnr INT NOT NULL,
  name VARCHAR(100) NULL,
  gebdat DATE NULL,
  geschlecht VARCHAR(45) NULL,
  PRIMARY KEY (patnr, pnr));

/*SET FOREIGN_KEY_CHECKS = 1;*/

INSERT INTO mitarbeiter 
(geschlecht, name, gebdat, strasse, hausnummer, ort, plz)
VALUES
('m', 'Albert Einstein', '1879-03-14', 'Some Street', 1, 'Mainz', 12345),
('w', 'Marie Curie', '1867-11-07', 'Some Street', 2, 'Wiesbaden', 12335),
('m', 'Alan Turing', '1912-06-23', 'Some Street', 3, 'London', 68945),
('w', 'Ada Lovelace', '1815-12-10', 'Some Street', 4, 'London', 68005),
('m', 'Edsger Wybe Dijkstra', '1930-05-11', 'Some Street', 5, 'Rotterdam', 6001),
('w', 'Franziska', '1953-04-13', 'Some Street', 6, 'London', 17007),
('m','albert Einstein', '1979-03-14','Hauptstrasse','1', 'Frankfurt',50325),
('w','Lara', '1870-06-05','Nebenstrasse','2a', 'Mainz',11111),
('w','Lena','1780-01-01','Hauptweg','3c', 'Bad Homburg',11111 ),
('m','Hans', '1655-12-03','Nebenweg','30', 'Frankfurt',60325 ),
('m','Klaus', '1960-11-05','Kunststrasse','7', 'Bad Homburg',11111 ),
('w','Caroline', '1963-04-11','Kunstweg','3', 'Frankfurt',60325 ),
('w','Theresa', '1954-10-21','Klinikstrasse','9', 'Ruedesheim',11111 ),
('w','Franziska', '1984-03-11','Hauptstrasse','2', 'Neu-Isenburg',11111 ),
('m','Darius', '1983-03-22','Klinikstrasse','4', 'Wiesbaden',12335 ),
('m','Alexander', '1982-08-30','Hauptweg','11a', 'Frankfurt',60325 ),
('m','Lukas', '1967-01-01','Klinikweg','11c', 'Frankfurt',60325 ),
('w','Lavinia', '1976-09-15','Hauptstrasse','21', 'Neu-Isenburg',11111 ),
('m','Tibor', '1977-03-25','Am Main','14', 'Frankfurt',60325 ),
('m','Yannik', '1966-06-17','Am Marktplatzmitarbeiter','12c', 'Neu-Isenburg',11111 ),
('w','Anne', '1988-04-07','Unterm Weg','45', 'Ruedesheim',11111 ),
('m','Vlad', '1989-12-04','Daemmerweg','111', 'Bad Homburg',11111 ),
('w','Clodet', '1968-01-24','Waldeck','1q', 'Wiesbaden',11111 ),
('w','Dorote', '1968-01-24','Unter den Laubbaeumen','2e', 'Bad Homburg',11111 ),
('m','Marius', '1972-03-28','Hauptstrasse','6', 'Wiesbaden',11111 ),
('w','Maxine', '1962-04-27','Hauptstrasse','24', 'Bad Homburg',11111 )
;

/*static*/

INSERT INTO station
(name, anzahlbetten)
VALUES
('HNO', 20),
('Neurologie', 15),
('Chirurgie', 20),
('Allgemeinmedizin', 40),
('Onkologie', 20),
('Augenheilkunde', 25),
('Herzchirurgie', 25),
('Gefaesschirurgie', 25),
('Orthopaedie', 25),
('Unfallchirurgie', 25),
('Hals Nasen Ohr Spezialist', 25),
('Innere Medizin', 25);


INSERT INTO pfleger
(pnr, stationid)
VALUES
(1, 1),
(2, 2),
(6, 3),
(3, 2),
(11, 2),
(22, 1);


INSERT INTO arzt
(pnr, fachgebiet)
VALUES
(8, 'Chirurgie'),
(10, 'Chirurgie'),
(4, 'Neurologie'),
(5, 'Innere Medizin'),
(7, 'Innere Medizin'),
(14, 'Allgemeinmedizin'),
(12, 'Orthopaedie'),
(13, 'Anaesthesie');

INSERT INTO patient
(name, gebdat, geschlecht)
VALUES
('Max Mustermann', '1993-07-15', 'm'),
('Mika Mustermann', '1990-10-03', 'w'),
('Moritz Petersen', '1982-12-21', 'm'),
('Hanna Mai', '1992-04-09', 'w'),
('Kate','1961-01-01','w'),
('Harry','1992-04-27','m'),
('Harro','1965-02-22','m'),
('Nathaniel','1978-07-23','m'),
('Odette','1992-11-11','w'),
('Anne','1969-12-19','w'),
('Anja','1973-08-12','w'),
('Hursel','1981-04-08','m'),
('Bond','1980-04-30','m'),
('Dora','1992-03-09','w'),
('Marco', '1987-08-04', 'm'),
('Dele', '1990-12-03', 'w'),
('Peter', '1976-01-04', 'm'),
('Julian', '1990-05-16', 'm'),
('Blabla', '1995-02-06', 'w'),
('Inferno', '1977-05-02', 'w'),
('Grey', '2019-02-10', 'm'),
('Gisela', '1987-08-04', 'w'),
('Robert', '1980-10-04', 'm'),
('Hans', '1957-08-04', 'm'),
('Monika Reich','1970-08-29','w'),
('Johannes Mirk','1975-07-19','m'),
('Vera Pohl','1987-06-07','w'),
('Chris Meier','1954-05-08','m'),
('Albert Einstein ', '1879-03-14', 'm'),
('Marie Curie', '1867-11-07', 'w'),
('Alan Turing ', '1912-06-23', 'm');

INSERT INTO symptome
(beschreibung)
VALUES
('Heiserkeit'), 
('Erbrechen'), 
('Kopfschmerzen'), 
('Husten'), 
('Hautausschlag'), 
('Schwellung'), 
('Laehmmung'), 
('Müdigkeit'),
('Vergesslichkeit'),
('Ausschlag'),
('Verfolgungswahn'),
('Depressionen'),
('Taubheitsgefuehle'),
('Stechender Schmerz'),
('Juckreiz');

INSERT INTO krankheit
(fachname, umgangsname)
VALUES
('Gastroenteritis', 'Magen-Darm-Grippe'),
('Lebensmittelintoxikation', 'Lebensmittelvergiftung'),
('Apoplex', 'Schlaganfall'),
('Commotio cerebri', 'Gehirnerschuetterung'),
('Fussi Juckus', 'Fusspilz'),
('Arderum', 'Lebensmittelvergiftung');

INSERT INTO medikament
(name, produzent, bestand, preis)
VALUES

('Aspirin', 'Hexal', 20, 2.00),
('Bspirin Complex', 'Hexal', 99, 22.00),
('Ibuperogast', 'Hexal', 10, 35.00),
('Ibupropeth', 'Bayer', 120, 141.00),
('Iberogast', 'Hexal', 1000, 35.00),
('Insulin', 'Hexal', 100, 3.00),
('Nasenspray', 'Hexal', 150, 47.00),
('Nasentropfen', 'Hexal', 100, 35.00),
('Sergos', 'Bayer', 8, 72.00),
('Sinupret', 'Bayer', 7, 33.00);

INSERT INTO eingwpatient
(patnr, stationid)
VALUES
(1,13),
(2,11),
(3,12),
(4,10),
(5,9),
(6,4),
(7,1),
(8,6),
(9,2),
(10,11),
(11,4),
(12,3),
(13,9),
(14,12),
(15,5),
(16,7),
(17,3),
(18,1),
(19,8),
(20,10),
(21,12),
(22,1),
(23,5),
(24,1),
(25,6),
(26,6),
(27,1),
(28,7);

INSERT INTO status
(statusid, name, beschreibung)
VALUES
(1, 'geheilt', 'kann entlassen werden'),
(2, 'sehr gute Heilung', 'kurz vorm Entlassen'),
(3, 'gute Heilung', 'beobachten'),
(4, 'Heilungsprozess gestartet', 'wurde vor kurzem eingeliefert'),
(5, 'Befriedigende Heilung', 'ggf nochmal operieren?'),
(6, 'schlecht', 'fuer die Intensiv vorbereiten'),
(7, 'langsame Heilung', 'ggf andere Medikamente'),
(8, 'tod', 'Angehoerige informieren'),
(9, 'ansteckend', 'Schleuse anbringen'),
(10, 'noch nicht feststellbar', 'OPBericht abwarten');

INSERT INTO treten_auf
(fachname, sympid)
VALUES
('Gastroenteritis', 2),
('Gastroenteritis', 6),
('Gastroenteritis', 7),
('Apoplex', 2),
('Arderum', 6),
('Arderum', 7),
('Apoplex',5),
('Arderum',9);

INSERT INTO ident_mit
(name_1, name_2)
VALUES
('Aspirin', 'Insulin'),
('Sergos', 'Sinupret'),
('Sinupret', 'Insulin'),
('Aspirin', 'Sinupret');


INSERT INTO betreut
(patnr, pnr, tagzeit, kommentar)
VALUES
/* arzte */
(1,12, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar'),
(5,12, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar'),
(6,13, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar'),
(8,13, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar'),
(10,8, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar'),
(13,8, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar'),
(15,5, '2022-06-12 20:20:42.607', 'Hier steht ein Kommentar');

INSERT INTO verschreibt
(patnr, pnr, name, tagzeit, dauer, dosierung)
VALUES
(1,5, 'Iberogast', '2022-06-12 20:20:42.607', '532:11:11', 9),
(6,13, 'Insulin', '2022-06-08 13:55:17.825', '224:14:14', 23),
(1,13, 'Sinupret', '2022-06-09 20:25:55.381', '791:1:1', 25),
(1,14, 'Ibupropeth', '2022-06-03 18:58:55.198', '811:8:8', 19),
(1,14, 'Sinupret', '2020-04-03 18:58:55.198', '811:8:8', 19),
(1,14, 'Ibupropeth', '2020-04-04 18:58:55.198', '811:8:8', 19),
(1,14, 'Ibupropeth', '2020-04-08 18:58:55.198', '811:8:8', 19),
(25,4, 'Insulin', '2019-04-14 22:57:55.503', '593:1:1', 19),

(6,13, 'Iberogast', '2022-06-11 20:20:42.607', '532:11:11', 9),
(6,13, 'Sinupret', '2022-06-02 13:55:17.825', '224:14:14', 23),
(25,4, 'Ibupropeth', '2022-05-09 20:25:55.381', '791:1:1', 25),
(25,4, 'Sergos', '2022-05-03 18:58:55.198', '811:8:8', 19),
(25,4, 'Ibupropeth', '2020-04-13 18:58:55.198', '811:8:8', 19),
(1,5, 'Sergos', '2020-05-03 18:58:55.198', '811:8:8', 19),
(1,5, 'Sergos', '2020-05-08 18:58:55.198', '811:8:8', 19);



ALTER TABLE verschreibt DROP COLUMN dauer;