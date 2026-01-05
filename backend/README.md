# Munyire Backend API

A Munyire munkaruhakezelő rendszer backend REST API-ja.

## Telepítés

```bash
cd backend
npm install
```

## Konfiguráció

Másold át a `.env.example` fájlt `.env` néven és állítsd be a környezeti változókat:

```env
PORT=3001
JWT_SECRET=valami_titkos_szoveg_ide_keruljon
JWT_EXPIRES_IN=1h
```

## Indítás

```bash
npm start
```

Fejlesztési módban (nodemon):

```bash
npm run dev
```

A szerver alapértelmezés szerint a `http://localhost:3001` címen fut.

## Tesztelés

### Integrációs tesztek futtatása

Az integrációs tesztek futtatása előtt indítsd el a szervert egy másik terminálban:

```bash
npm start
```

Majd egy másik terminálban futtasd a teszteket:

```bash
npm test
```

A tesztek a következőket ellenőrzik:
- Bejelentkezés és token generálás
- Dolgozók CRUD műveletei
- Ruhák CRUD műveletei
- Kiadás/visszavétel műveletek (készlet változások ellenőrzése)
- Rendelések kezelése (készlet növelés)
- Dashboard és jelentések

### REST Client tesztelés

A `test.http` fájl használható a VS Code REST Client extension-nel:

1. Telepítsd a "REST Client" extension-t a VS Code-ban
2. Nyisd meg a `test.http` fájlt
3. Először futtasd a "Register Admin" és "Login as Admin" kéréseket
4. A token automatikusan beállításra kerül
5. Most már futtathatod bármelyik másik kérést

## API Dokumentáció

Az API végpontok részletes dokumentációja a projekt gyökérkönyvtárában található `backend.md` fájlban.

## Projekt struktúra

```
backend/
├── app.js                 # Express app indítása
├── db.js                  # Sequelize kapcsolat
├── models/                # Sequelize modellek
├── routes/                # API útvonalak
├── controllers/           # HTTP kérések kezelése
├── services/              # Üzleti logika
├── repositories/          # Adatbázis műveletek
├── middlewares/           # Middleware-ek (auth, validáció, stb.)
├── validators/            # Bemeneti validációk
└── utils/                 # Segédfüggvények
```

## Technológiai stack

- Node.js
- Express.js
- Sequelize ORM
- SQLite
- JWT (jsonwebtoken)
- bcrypt
- express-validator
- cors

