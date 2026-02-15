# Munyire SaaS (Multi-Tenancy) Átalakítási Terv

A projekt több cég általi használatához (SaaS - Software as a Service) át kell alakítani az architektúrát, hogy képes legyen több bérlőt (Tenant) kiszolgálni egyetlen rendszeren belül, szigorú adatizolációval.

## 1. Adatbázis Architektúra Opciók

Két fő irány létezik a Munyire méretéhez:

### A opció: Sor-szintű elkülönítés
Minden táblába bekerül egy `company_id` (vagy `tenant_id`) oszlop. Minden lekérdezés automatikusan szűr erre az azonosítóra.
- **Előny:** Olcsó üzemeltetés (1 adatbázis), könnyű karbantartás.
- **Hátrány:** Szoftveres hiba esetén adatszivárgás lehetséges.
- **Státusz:** Elvetve (Biztonsági kockázat).

### B opció: Adatbázis-szintű elkülönítés (Javasolt - Security First)
Minden cégnek külön SQLite adatbázis fájlja van (`tenant_companyA.sqlite`).
- **Előny:** Fizikai adatizoláció (100% biztonság), könnyű backup/restore per ügyfél, GDPR megfelelés.
- **Hátrány:** Kicsit bonyolultabb üzemeltetés (több fájl kezelése), de Node.js alatt jól automatizálható.

**Döntés:** A **B opciót (Adatbázis-szintű elkülönítés)** javaslom a szigorú biztonsági követelmények miatt. Ez garantálja, hogy szoftveres hiba esetén sem láthatja egyik cég a másik adatait.

## 2. Szükséges Változtatások

### Adatbázis (Backend)
1. **Új tábla:** `Companies` (Cégek)
   - `id`, `name`, `tax_number`, `subscription_plan`, `logo_url`, `created_at`
2. **Meglévő táblák bővítése:**
   - Minden táblához (Dolgozok, Ruhak, Tranzakciok, Raktar) hozzá kell adni a `company_id` oszlopot.
   - Foreign Key kapcsolat a `Companies` táblára.

### Autentikáció & Middleware
1. **Login folyamat:**
   - A felhasználó belépéskor megkapja a `company_id`-t is a tokenben.
   - Szuperadmin (Rendszer üzemeltető) képes céget létrehozni.
2. **Tenant Middleware:**
   - Minden bejövő kérésnél kiolvassuk a `company_id`-t a tokenből.
   - A Sequelize scope-ot vagy hook-ot beállítjuk erre az ID-re.

### Frontend
1. **Regisztráció / Cég létrehozása:**
   - Új felület, ahol a cég regisztrálhat.
2. **Adminisztráció:**
   - "Szuperadmin" felület a cégek kezelésére (aktív/inaktív, előfizetés).
3. **Testreszabás:**
   - A fejlécben és a nyomtatványokon (PrintTemplate) a cég saját logója és neve jelenjen meg.

## 3. Migrációs Lépések

1. **Adatbázis migráció létrehozása:** `company_id` hozzáadása mindenhova.
2. **Backend refaktor:** Middleware bevezetése, ami minden SQL query-hez hozzűfűzi a `WHERE company_id = X` feltételt.
3. **Frontend frissítés:** Cég adatok megjelenítése.

## 4. Üzleti Funkciók (Licencelés)
- Előfizetési csomagok (pl. "Start" - max 50 dolgozó, "Pro" - korlátlan).
- Funkciók korlátozása csomag alapján (feature flags).
