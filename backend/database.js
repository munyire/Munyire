const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./munyire.db', (err) => {
    if (err) {
        console.error('Error connecting to database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS Dolgozok (
            DID INTEGER PRIMARY KEY AUTOINCREMENT,
            DNev TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Telefonszam TEXT,
            Nem TEXT,
            Munkakor TEXT,
            Admin INTEGER DEFAULT 0,
            FelhasznaloNev TEXT UNIQUE NOT NULL,
            JelszoHash TEXT NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Ruhak (
            KID INTEGER PRIMARY KEY AUTOINCREMENT,
            Fajta TEXT NOT NULL,
            Szin TEXT NOT NULL,
            Meret TEXT NOT NULL,
            Mennyiseg INTEGER NOT NULL
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS RuhaKiBe (
            KiadasID INTEGER PRIMARY KEY AUTOINCREMENT,
            DID INTEGER NOT NULL,
            KID INTEGER NOT NULL,
            KiadasDatum TEXT NOT NULL,
            VisszaDatum TEXT,
            Mennyiseg INTEGER NOT NULL,
            FOREIGN KEY (DID) REFERENCES Dolgozok(DID),
            FOREIGN KEY (KID) REFERENCES Ruhak(KID)
        )`);
        db.run(`CREATE TABLE IF NOT EXISTS Rendelesek (
            RID INTEGER PRIMARY KEY AUTOINCREMENT,
            KID INTEGER NOT NULL,
            RDatum TEXT NOT NULL,
            Mennyiseg INTEGER NOT NULL,
            FOREIGN KEY (KID) REFERENCES Ruhak(KID)
        )`);
    }
});

module.exports = db;
