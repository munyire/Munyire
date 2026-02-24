# Munyire – Backend dokumentáció

## 1. Bevezetés

A **Munyire** backend egy REST API szerver, amely a munkaruhakezelő rendszer üzleti logikáját, adatbázis-kezelését és hitelesítési folyamatát valósítja meg.

**Alap URL:** `http://localhost:3000`  
**Node.js minimum verzió:** 18

---

## 2. Technológiai stack

| Csomag | Verzió | Szerepe |
|--------|--------|---------|
| `express` | ^4.19 | Web framework |
| `sequelize` | ^6.37 | ORM |
| `sqlite3` | ^5.1.7 | Adatbázis driver |
| `bcrypt` | ^5.1 | Jelszó hash-elés |
| `jsonwebtoken` | ^9.0 | JWT token kezelés |
| `helmet` | ^8.1 | HTTP biztonsági fejlécek |
| `express-rate-limit` | ^8.2 | Rate limiting |
| `express-validator` | ^7.2 | Input validáció |
| `cors` | ^2.8 | Cross-Origin Resource Sharing |
| `morgan` | ^1.10 | HTTP request logolás |
| `dotenv` | ^16.4 | Környezeti változók |
| `nodemon` | ^3.0 | Dev server (újraindítás figyelő) |

---

## 3. Projekt struktúra

```
backend/
├── app.js                  # Express app bootstrap, middleware-ek, route regisztráció
├── db.js                   # Sequelize példány inicializáció
├── demoadatok.js           # Demo adatok feltöltő script
├── integration_test.js     # Integrációs tesztek
├── .env                    # Környezeti változók (nem verziókezelt)
├── env.example             # .env minta fájl
├── models/
│   ├── index.js            # Modellek összekapcsolása, asszociációk
│   ├── Dolgozo.js
│   ├── Ruha.js
│   ├── Raktar.js
│   ├── RuhaKiBe.js
│   └── Rendeles.js
├── controllers/            # Üzleti logika (kérés → válasz)
├── services/               # Adatbázis-szintű logika (reusable)
├── repositories/           # Adatbázis lekérdezések absztrakciója
├── routes/                 # Express routerek
├── middlewares/            # Auth, jogosultság, hibakezelő middleware-ek
├── validators/             # express-validator szabályok
└── utils/
    └── roles.js            # ROLES konstans: { Dolgozo, Manager, Admin }
```

---

## 4. Adatbázis struktúra

Az adatbázis SQLite (`database.sqlite`), Sequelize ORM kezeli.

### Dolgozok

| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `DolgozoID` | INTEGER PK AI | |
| `DNev` | STRING | |
| `Email` | STRING UNIQUE | Email validáció |
| `Telefonszam` | STRING | |
| `Nem` | STRING | |
| `Munkakor` | STRING | Csak információ, nem jogosultság |
| `Szerepkor` | ENUM | `Dolgozo` \| `Manager` \| `Admin` |
| `FelhasznaloNev` | STRING UNIQUE | |
| `JelszoHash` | STRING | bcrypt hash |

### Ruhak

| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `Cikkszam` | INTEGER PK | 7-jegyű, auto-generált (1000001-tól) |
| `Fajta` | STRING | pl. Nadrág, Ing, Védőmellény |
| `Szin` | STRING | |
| `Meret` | STRING | XS, S, M, L, XL, XXL, XXXL |
| `Ar` | DECIMAL(10,2) | Egységár Ft-ban (alapértelmezett: 0) |

### Raktar

| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `RaktarID` | INTEGER PK AI | |
| `Cikkszam` | FK → Ruhak | |
| `Minoseg` | STRING | `Új` \| `Jó` \| `Használt` \| `Kopott` \| `Szakadt/Sérült` \| `Selejt` |
| `Mennyiseg` | INTEGER | Darabszám az adott minőségből |

### RuhaKiBe

| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `RuhaKiBeID` | INTEGER PK AI | |
| `DolgozoID` | FK → Dolgozok | |
| `Cikkszam` | FK → Ruhak | |
| `KiadasDatum` | DATE | |
| `VisszaDatum` | DATE | NULL, amíg nincs visszavéve |
| `Indok` | STRING | Kiadás indoka / megjegyzés |
| `Mennyiseg` | INTEGER | |
| `RuhaMinoseg` | STRING | Visszavételkor rögzített minőség |

### Rendelesek

| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `RendelesID` | INTEGER PK AI | |
| `Cikkszam` | FK → Ruhak | |
| `RDatum` | DATE | |
| `Mennyiseg` | INTEGER | |
| `Statusz` | ENUM | `Leadva` \| `Teljesítve` \| `Lemondva` |

---

## 5. Middleware-ek és biztonság

### Globális middleware-ek (sorrendben, `app.js`)
1. **helmet** – biztonságos HTTP fejlécek (`X-Frame-Options`, `Content-Security-Policy`, stb.)
2. **express-rate-limit** – max. 100 kérés IP-nként 15 perces ablakban
3. **cors** – Cross-Origin engedélyezés
4. **express.json()** – JSON body parser
5. **morgan** (`dev`) – HTTP request logolás fejlesztői módban

### Route middleware-ek
- **`authMiddleware`** – JWT token ellenőrzés (Bearer token a `Authorization` fejlécben)
- **`requireRoleMiddleware(role)`** – Szerepkör-alapú hozzáférés-ellenőrzés
- **`errorHandlerMiddleware`** – Globális hibakezelő (500-as válaszok egységesítése)

---

## 6. Hitelesítés

- Bejelentkezéskor a szerver JWT tokent ad vissza.
- Lejárati idő: a `.env` `JWT_SECRET` alapján.
- Minden védett végpont `Authorization: Bearer <token>` fejlécet vár.
- Az admin felhasználó automatikusan létrejön indításkor a `.env` alapján (`ADMIN_USERNAME`, `ADMIN_PASSWORD`).

---

## 7. Futtatás

```bash
cd backend
cp env.example .env   # .env beállítása
npm install
npm run dev           # Fejlesztői szerver (nodemon, portja: 3000)
npm start             # Production szerver
npm test              # Integrációs tesztek futtatása
```

### Szükséges `.env` változók (lásd `env.example`)
```
PORT=3000
JWT_SECRET=titok_kulcs
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_jelszo
```

---

## 8. Demo adatok

```bash
cd backend
node demoadatok.js
```

Feltölti az adatbázist tesztadatokkal (dolgozók, ruhák, raktár, tranzakciók, rendelések).

---

## 9. Tesztelés

```bash
npm test
```

Az `integration_test.js` lefuttatja az összes fő API végpont integrációs tesztjét (auth, CRUD műveletek, jogosultság ellenőrzés).