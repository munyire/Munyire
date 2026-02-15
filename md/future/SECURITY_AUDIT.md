# Biztonsági Audit Jelentés (Security Audit Report)

## 1. Függőségek és Sérülékenységek (npm audit)
- **Backend:** 8 sérülékenység (6 magas).
  - `lodash`: Prototype Pollution hiba.
  - `sqlite3`: Tar/node-gyp problémák.
- **Frontend:** 1 magas sérülékenység.
  - `axios`: Denial of Service (DoS) lehetőség.
- **Javaslat:** `npm audit fix` futtatása mindkét mappában azonnal.

## 2. Backend Konfiguráció (`app.js`)
- **Hiányzó HTTP Header védelem:** Nincs `helmet` middleware. Ez védené a szervert alapvető támadások ellen (pl. XSS szűrés, Clickjacking).
- **Rate Limiting hiánya:** Nincs védelem a Brute Force (jelszó próbálgatás) és DoS támadások ellen. Bárki korlátlan számú kérést küldhet.
- **CORS (Cross-Origin Resource Sharing):** A jelenlegi beállítás (`app.use(cors())`) minden domaint engedélyez. Élesben ezt korlátozni kell csak a frontend domainjére.

## 3. Autentikáció és Adatvédelem
- **Jelszó tárolás:** ✅ Megfelelő (`bcrypt` hash), ez biztonságos.
- **Token tárolás (Frontend):** ⚠️ A JWT token a `localStorage`-ban van tárolva.
  - **Kockázat:** XSS támadás esetén (ha rosszindulatú kód fut a böngészőben) a token ellopható.
  - **Javaslat:** Hosszú távon átállni `HttpOnly` sütikre.
- **Hardcoded Admin:** Az `ensureAdminFromEnv` függvény alapértelmezett értékeket használ ("admin"/"admin123" jellegű), ha nincs `.env` fájl. Ez éles környezetben (Production) veszélyes lehet, ha elfelejtik beállítani a környezeti változókat.

## 4. Adatbázis (SQLite)
- **Fájl hozzáférés:** Mivel az adatbázis egy fájl (`database.sqlite`), kritikus, hogy a szerveren a fájlrendszer jogosultságok megfelelően legyenek beállítva (ne lehessen weben keresztül letölteni a fájlt).

## Implementációs Terv (Javítások)

### Azonnali (Hotfix)
1. `npm audit fix` futtatása.
2. `helmet` és `express-rate-limit` telepítése és beállítása a backend-en.
3. `.env` fájl ellenőrzése (erős jelszavak).

### Középtávú
1. CORS szigorítása.
2. Áttérés HttpOnly Cookie alapú autentikációra.
