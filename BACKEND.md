# Munyire Backend Dokumentáció

Ez a dokumentum a **Munyire** projekt backend REST API-jának **tervét** írja le (a kód újraírásához).  
A cél egy szakközépiskolai kimeneti vizsgához illő, átlátható, biztonságos és stabil backend kialakítása.

---

## 1. Technológiai stack

- **Node.js**
- **Express.js**
- **Sequelize ORM**
- **SQLite**
- **JWT** (token alapú authentikáció)
- **bcrypt** (jelszó hash-elés)
- **cors**
- (fejlesztéshez) **nodemon**

---

## 2. Alapelvek

- **REST API** JSON bemenettel/kimenettel
- **JWT** token védi a védett végpontokat
- **Szerepkör-alapú jogosultság**:
  - `Dolgozo`
  - `Manager`
  - `Admin`
- A `Munkakor` mező csak **információ**, nem jogosultság.
- **Készletműveletek stabilitása**: kiadás/visszavétel során a készlet módosítása **tranzakcióban** történik (Sequelize transaction).

---

## 3. Tervezett projekt struktúra

```text
backend/
├── app.js                       # Express app indítása
├── db.js                        # Sequelize kapcsolat (SQLite)
├── models/
│   ├── Dolgozo.js
│   ├── Ruha.js
│   ├── RuhaKiBe.js
│   └── Rendeles.js
├── routes/
│   ├── authRoutes.js
│   ├── dolgozoRoutes.js
│   ├── ruhaRoutes.js
│   ├── ruhakibeRoutes.js
│   ├── rendelesRoutes.js
│   ├── dashboardRoutes.js
│   └── reportsRoutes.js
├── controllers/
│   ├── authController.js
│   ├── dolgozoController.js
│   ├── ruhaController.js
│   ├── ruhakibeController.js
│   ├── rendelesController.js
│   ├── dashboardController.js
│   └── reportsController.js
├── services/
│   ├── authService.js
│   ├── dolgozoService.js
│   ├── ruhaService.js
│   ├── ruhakibeService.js
│   ├── rendelesService.js
│   ├── dashboardService.js
│   └── reportsService.js
├── repositories/
│   ├── dolgozoRepository.js
│   ├── ruhaRepository.js
│   ├── ruhakibeRepository.js
│   ├── rendelesRepository.js
│   └── dashboardRepository.js
├── middlewares/
│   ├── authMiddleware.js        # JWT ellenőrzés
│   ├── requireRoleMiddleware.js # szerepkör ellenőrzés
│   ├── requireSelfOrRoleMiddleware.js # csak saját adat VAGY magasabb szerepkör
│   ├── errorHandlerMiddleware.js # egységes hibakezelés
│   └── validationHandler.js     # validációs hibák kezelése
├── validators/
│   ├── authValidators.js
│   ├── dolgozoValidators.js
│   ├── ruhaValidators.js
│   ├── ruhakibeValidators.js
│   └── rendelesValidators.js
├── utils/
│   └── roles.js                 # szerepkör hierarchia
├── database.sqlite              # SQLite adatbázis fájl (fejlesztés)
├── package.json
├── request.http                 # opcionális API teszteléshez
└── integration_test.js         # opcionális
```

---

## 4. Konfiguráció

Javasolt környezeti változók (pl. `.env`):

```env
PORT=3001
JWT_SECRET=valami_titkos_szoveg
JWT_EXPIRES_IN=1h
```

- A `JWT_EXPIRES_IN` opcionális (ha nincs megadva, lehet alapértelmezett érték).
- Az adatbázis SQLite fájl alapértelmezés szerint: `munyire.db`

---

## 5. Szerepkörök és hierarchia

A szerepkörök hierarchiája:  
**Dolgozo < Manager < Admin**

Javasolt megvalósítás: egy egyszerű szerepkör-szint táblázat a kódban:

```javascript
const ROLE_LEVEL = {
  Dolgozo: 1,
  Manager: 2,
  Admin: 3
};
```

Így könnyű ellenőrizni, hogy egy user elér-e egy adott minimum szerepkört.

---

## 6. Middleware-ek

A middleware-ek célja: biztonság + tiszta kód (ne ismétlődjenek ellenőrzések).

### 6.1. `auth` middleware (JWT ellenőrzés)
1. Beolvassa az `x-auth-token` fejlécet
2. Ellenőrzi és dekódolja a JWT-t
3. Siker esetén beállítja:
   ```javascript
   req.user = { DolgozoID, Szerepkor }
   ```
4. **Hibák**: `401 Unauthorized` (hiányzó token / érvénytelen token)

### 6.2. `requireRole(minRole)` middleware
Ellenőrzi, hogy a `req.user.Szerepkor` legalább `minRole` szintű-e.
- Példák:
  - `requireRole("Manager")` → Manager és Admin
  - `requireRole("Admin")` → csak Admin
- **Hibák**: `403 Forbidden` (nincs megfelelő jogosultság)

### 6.3. `requireSelfOrRole(minRole)` middleware
Olyan végpontokhoz, ahol a dolgozó csak saját magát érheti el, de Manager/Admin láthat másokat is.
- Példa használat: `GET /api/dolgozok/:dolgozoId`
  - **Dolgozo**: csak ha `:dolgozoId === req.user.DolgozoID`
  - **Manager/Admin**: engedett
- **Hibák**: `403 Forbidden` (nem saját és nincs megfelelő szerepkör)

### 6.4. `errorHandler` middleware
Egységes JSON hibaválasz a teljes API-n:

```json
{ "error": "Hibaüzenet", "details": "Opcionális részletek" }
```

Tipikus státuszkódok:
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict (pl. duplikált FelhasznaloNev vagy Cikkszam)
- `500` Internal Server Error

---

## 7. Adatbázis modellek (Sequelize)

Az ORM Sequelize, az adatbázis SQLite. A Sequelize automatikusan kezelheti a `createdAt`, `updatedAt` mezőket.

### 7.1. Dolgozok
- `DolgozoID` (PK)
- `DNev`
- `Email`
- `Telefonszam`
- `Nem`
- `Munkakor` (információ)
- `Szerepkor` (Dolgozo | Manager | Admin)
- `FelhasznaloNev` (egyedi)
- `JelszoHash` (bcrypt)

**Javasolt megkötések**: `FelhasznaloNev` legyen UNIQUE, `Szerepkor` kötelező (validált értékek).

### 7.2. Ruhak
- `RuhaID` (PK)
- `Cikkszam` (**egyedi** cikkszám / azonosító)
- `Fajta`
- `Szin`
- `Meret`
- `Mennyiseg` (nem lehet negatív)
- `Minoseg` (pl. Uj, Jo, Szakadt)

**Javasolt megkötések**:
- `Cikkszam` legyen **UNIQUE** és lehetőleg **kötelező** (NOT NULL)
- `Mennyiseg >= 0`

### 7.3. RuhaKiBe
- `RuhaKiBeID` (PK)
- `DolgozoID` (FK → Dolgozok)
- `RuhaID` (FK → Ruhak)
- `KiadasDatum`
- `VisszaDatum` (NULL amíg kint van)
- `Mennyiseg` (pozitív egész)
- `Indok` (kiadás indoka / megjegyzés, pl. „új belépő", „csere", „pótlás")
- `RuhaMinoseg` (visszavételkor rögzítve; NULL lehet)

**Javasolt megkötések**:
- `Mennyiseg > 0`
- `Indok` legyen legalább rövid szöveg (pl. min. 3 karakter), és kiadáskor kötelező

### 7.4. Rendelesek
- `RendelesID` (PK)
- `RuhaID` (FK → Ruhak)
- `RDatum`
- `Mennyiseg` (pozitív egész)
- `Statusz` (pl. Leadva, Teljesítve, Lemondva)

---

## 8. Üzleti szabályok

### 8.1. Kiadás (készlet csökkentése)
Kiadáskor (új `RuhaKiBe` rekord létrehozása) a backend:
1. ellenőrzi: a kért mennyiség pozitív
2. ellenőrzi: az `Indok` meg van adva
3. ellenőrzi: a készlet elég-e (`Ruhak.Mennyiseg >= kértMennyiseg`)
4. csökkenti a készletet
5. létrehozza a `RuhaKiBe` rekordot

> **Stabilitás**: ezt Sequelize **transaction**-ben célszerű végezni.

### 8.2. Visszavétel (készlet növelése)
Visszavételkor (létező `RuhaKiBe` rekord frissítése) a backend:
1. ellenőrzi: a rekord létezik
2. ellenőrzi: még nincs visszavéve (`VisszaDatum IS NULL`)
3. beállítja a `VisszaDatum` mezőt
4. rögzíti a visszavételkori minőséget (`RuhaMinoseg`)
5. növeli a készletet az adott mennyiséggel

> **Stabilitás**: Szintén javasolt **transaction**-ben.

### 8.3. Rendelés teljesítése (készlet növelése)
Rendelés teljesítésekor a backend:
1. ellenőrzi: a rendelés `Leadva` státuszú
2. státuszt `Teljesítve`-re állítja
3. növeli a `Ruhak.Mennyiseg` értékét a rendelt mennyiséggel

> **Stabilitás**: Szintén javasolt **transaction**-ben.

---

## 9. API – általános szabályok

- **Base URL**: `/api`
- A védett végpontokhoz kötelező header:
  `x-auth-token: <JWT>`
- Kérések és válaszok JSON formátumban

---

## 10. API végpontok

### 10.1. Auth – `/api/auth`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **POST** | `/api/auth/login` | Bejelentkezés, JWT token visszaadása | Nyilvános |
| **POST** | `/api/auth/register` | Új felhasználó létrehozása (jelszó hash-eléssel) | Admin |

**POST /api/auth/login – példa request body**
```json
{
  "FelhasznaloNev": "mintauser",
  "Jelszo": "titkosjelszo"
}
```

**Sikeres válasz (200) – példa**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6..."
}
```

**POST /api/auth/register – példa request body**
```json
{
  "DNev": "Minta Dolgozó",
  "Email": "minta@example.com",
  "Telefonszam": "123456789",
  "Nem": "Nő",
  "Munkakor": "Raktáros",
  "Szerepkor": "Dolgozo",
  "FelhasznaloNev": "mintauser",
  "Jelszo": "titkosjelszo"
}
```

---

### 10.2. Dolgozók – `/api/dolgozok`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **GET** | `/api/dolgozok` | Összes dolgozó listázása | Manager, Admin |
| **GET** | `/api/dolgozok/:dolgozoId` | Egy dolgozó adatainak lekérése | Dolgozo (csak saját), Manager, Admin |
| **PATCH** | `/api/dolgozok/:dolgozoId` | Dolgozó adatainak módosítása | Admin |
| **DELETE** | `/api/dolgozok/:dolgozoId` | Dolgozó törlése | Admin |
| **GET** | `/api/dolgozok/:dolgozoId/ruhak` | Adott dolgozó összes ruhakiadása | Dolgozo (saját), Manager, Admin |
| **GET** | `/api/dolgozok/:dolgozoId/ruhak/aktiv` | Adott dolgozó kint lévő ruhái | Dolgozo (saját), Manager, Admin |
| **GET** | `/api/dolgozok/with-active-items` | Dolgozók, akiknek van kint ruhája | Manager, Admin |

**PATCH /api/dolgozok/:dolgozoId – példa request body**
```json
{
  "Email": "uj@email.hu",
  "Telefonszam": "999999999",
  "Szerepkor": "Manager"
}
```

**GET /api/dolgozok/:dolgozoId/ruhak/aktiv – példa válasz**
```json
[
  {
    "RuhaKiBeID": 12,
    "KiadasDatum": "2026-01-05T10:00:00Z",
    "Mennyiseg": 2,
    "Indok": "Új belépő",
    "Ruha": {
      "RuhaID": 3,
      "Cikkszam": "PO-2026-0001",
      "Fajta": "Póló",
      "Szin": "Kék",
      "Meret": "M"
    }
  }
]
```

---

### 10.3. Ruhák / készlet – `/api/ruhak`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **GET** | `/api/ruhak` | Készlet listázása | Manager, Admin |
| **GET** | `/api/ruhak/:ruhaId` | Egy ruhacikk részletei | Manager, Admin |
| **POST** | `/api/ruhak` | Új ruhacikk felvétele a készletbe | Admin |
| **PATCH** | `/api/ruhak/:ruhaId` | Ruhacikk módosítása | Admin |
| **DELETE** | `/api/ruhak/:ruhaId` | Ruhacikk törlése | Admin |
| **GET** | `/api/ruhak/:ruhaId/history` | Ruhacikk kiadási/visszavételi története | Manager, Admin |
| **GET** | `/api/ruhak/:ruhaId/active` | Ruhacikkből kint lévő kiadások | Manager, Admin |
| **GET** | `/api/ruhak/search` | Keresés cikkszám, fajta vagy szín alapján | Manager, Admin |
| **GET** | `/api/ruhak/by-cikkszam/:cikkszam` | Ruhacikk lekérése cikkszám alapján | Manager, Admin |

**POST /api/ruhak – példa request body**
```json
{
  "Cikkszam": "ND-2026-0001",
  "Fajta": "Nadrág",
  "Szin": "Fekete",
  "Meret": "M",
  "Mennyiseg": 50,
  "Minoseg": "Uj"
}
```

**GET /api/ruhak/search?q=póló – példa válasz**
```json
[
  {
    "RuhaID": 3,
    "Cikkszam": "PO-2026-0001",
    "Fajta": "Póló",
    "Szin": "Kék",
    "Meret": "M",
    "Mennyiseg": 25
  }
]
```

**GET /api/ruhak/:ruhaId/history – példa válasz**
```json
[
  {
    "RuhaKiBeID": 5,
    "DolgozoID": 12,
    "DolgozoNev": "Kiss Péter",
    "KiadasDatum": "2026-01-02T08:00:00Z",
    "VisszaDatum": "2026-01-08T14:00:00Z",
    "Mennyiseg": 1,
    "Indok": "Csere",
    "RuhaMinoseg": "Jo"
  }
]
```

---

### 10.4. Kiadás / visszavétel – `/api/ruhakibe`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **GET** | `/api/ruhakibe` | Összes kiadás/visszavétel tranzakció | Manager, Admin |
| **GET** | `/api/ruhakibe/mine` | Bejelentkezett user saját tranzakciói | Dolgozo, Manager, Admin |
| **GET** | `/api/ruhakibe/:ruhaKiBeId` | Egy tranzakció részletei | Manager, Admin |
| **POST** | `/api/ruhakibe` | Új kiadás rögzítése (készlet csökkentéssel) | Manager, Admin |
| **PATCH** | `/api/ruhakibe/:ruhaKiBeId` | Visszavétel rögzítése (készlet növeléssel) | Manager, Admin |
| **DELETE** | `/api/ruhakibe/:ruhaKiBeId` | Tranzakció törlése | Admin |
| **GET** | `/api/ruhakibe/active` | Összes aktív (kint lévő) kiadás | Manager, Admin |
| **GET** | `/api/ruhakibe/returned` | Összes lezárt (visszavett) tranzakció | Manager, Admin |
| **GET** | `/api/ruhakibe/by-date` | Kiadások időszak szerint szűrve | Manager, Admin |
| **GET** | `/api/ruhakibe/stats` | Kiadás/visszavétel statisztikák | Manager, Admin |

**POST /api/ruhakibe – kiadás példa request body**
```json
{
  "DolgozoID": 1,
  "RuhaID": 2,
  "KiadasDatum": "2026-01-05T10:00:00Z",
  "Mennyiseg": 1,
  "Indok": "Új belépő felszerelés"
}
```

**PATCH /api/ruhakibe/:ruhaKiBeId – visszavétel példa request body**
```json
{
  "VisszaDatum": "2026-01-10T10:00:00Z",
  "RuhaMinoseg": "Jo"
}
```

**GET /api/ruhakibe/by-date?from=2026-01-01&to=2026-01-31 – példa válasz**
```json
{
  "from": "2026-01-01",
  "to": "2026-01-31",
  "kiadasokSzama": 28,
  "visszavetelekSzama": 15,
  "tranzakciok": []
}
```

**GET /api/ruhakibe/stats – példa válasz**
```json
{
  "osszesKiadas": 156,
  "osszesVisszavetel": 122,
  "aktivKiadasok": 34,
  "havi": {
    "2026-01": { "kiadas": 28, "visszavetel": 15 }
  }
}
```

---

### 10.5. Rendelések – `/api/rendelesek`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **GET** | `/api/rendelesek` | Összes rendelés listázása | Manager, Admin |
| **GET** | `/api/rendelesek/:rendelesId` | Egy rendelés részletei | Manager, Admin |
| **POST** | `/api/rendelesek` | Új rendelés létrehozása | Manager, Admin |
| **PATCH** | `/api/rendelesek/:rendelesId` | Rendelés módosítása (jellemzően státusz) | Manager, Admin |
| **DELETE** | `/api/rendelesek/:rendelesId` | Rendelés törlése | Admin |
| **GET** | `/api/rendelesek/pending` | Függőben lévő rendelések | Manager, Admin |
| **GET** | `/api/rendelesek/by-status/:statusz` | Rendelések adott státusz szerint | Manager, Admin |
| **GET** | `/api/rendelesek/by-ruha/:ruhaId` | Ruhacikkhez tartozó rendelések | Manager, Admin |
| **PATCH** | `/api/rendelesek/:rendelesId/complete` | Rendelés teljesítése + készlet növelése | Admin |

**POST /api/rendelesek – példa request body**
```json
{
  "RuhaID": 2,
  "RDatum": "2026-01-05T11:00:00Z",
  "Mennyiseg": 25,
  "Statusz": "Leadva"
}
```

**PATCH /api/rendelesek/:rendelesId/complete – példa válasz**
```json
{
  "message": "Rendelés teljesítve, készlet frissítve",
  "RendelesID": 5,
  "RuhaID": 2,
  "hozzaadottMennyiseg": 25,
  "ujKeszlet": 75
}
```

---

### 10.6. Dashboard / Statisztikák – `/api/dashboard`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **GET** | `/api/dashboard/stats` | Fő statisztikák | Manager, Admin |
| **GET** | `/api/dashboard/low-stock` | Alacsony készletű ruhák (< 10 db) | Manager, Admin |
| **GET** | `/api/dashboard/recent-activity` | Legutóbbi kiadások/visszavételek | Manager, Admin |

**GET /api/dashboard/stats – példa válasz**
```json
{
  "osszesRuhaTipus": 25,
  "osszesKeszlet": 487,
  "aktivKiadasok": 34,
  "osszesDolgozo": 52,
  "fuggoRendelesek": 3
}
```

**GET /api/dashboard/low-stock – példa válasz**
```json
[
  {
    "RuhaID": 5,
    "Cikkszam": "PO-2026-0012",
    "Fajta": "Póló",
    "Meret": "XL",
    "Mennyiseg": 3
  }
]
```

---

### 10.7. Jelentések – `/api/reports`

| Metódus | Útvonal | Mit csinál | Jogosultság |
|:--------|:--------|:-----------|:------------|
| **GET** | `/api/reports/inventory` | Teljes készletjelentés | Manager, Admin |
| **GET** | `/api/reports/employee-summary` | Dolgozónkénti ruha összesítő | Manager, Admin |
| **GET** | `/api/reports/monthly` | Havi kiadás/visszavétel riport | Manager, Admin |
| **GET** | `/api/reports/quality-summary` | Visszavett ruhák minőség szerinti összesítése | Admin |

**GET /api/reports/inventory – példa válasz**
```json
{
  "datum": "2026-01-15T12:00:00Z",
  "osszesites": {
    "osszesRuhaTipus": 25,
    "osszesKeszlet": 487,
    "minosegSzerint": {
      "Uj": 320,
      "Jo": 140,
      "Szakadt": 27
    }
  },
  "fajtankent": [
    { "Fajta": "Póló", "osszMennyiseg": 180 },
    { "Fajta": "Nadrág", "osszMennyiseg": 150 }
  ]
}
```

**GET /api/reports/employee-summary – példa válasz**
```json
[
  {
    "DolgozoID": 5,
    "DNev": "Kiss Péter",
    "Munkakor": "Raktáros",
    "aktivKiadasok": 3,
    "osszesKiadas": 12,
    "ruhak": [
      { "Fajta": "Póló", "db": 2 },
      { "Fajta": "Nadrág", "db": 1 }
    ]
  }
]
```

**GET /api/reports/monthly?year=2026&month=1 – példa válasz**
```json
{
  "ev": 2026,
  "honap": 1,
  "kiadasok": {
    "osszesen": 28,
    "reszletezve": [
      { "Fajta": "Póló", "db": 15 },
      { "Fajta": "Nadrág", "db": 10 }
    ]
  },
  "visszavetel": {
    "osszesen": 15,
    "minosegSzerint": {
      "Uj": 2,
      "Jo": 10,
      "Szakadt": 3
    }
  }
}
```

---

## 11. CORS

A backend `cors` middleware-t használ.
Javasolt beállítás: csak a frontend originjét engedélyezni fejlesztésben (pl. `http://localhost:3000`), vizsgán elég lehet egy egyszerű engedélyezés is.

---

## 12. Indítás

```bash
cd backend
npm install
npm start
```

Alapértelmezett cím: `http://localhost:3001`

---

## 13. Opcionális: integrációs teszt

Ha készül `integration_test.js`, akkor minimálisan érdemes lefedni:
1. login működik (token érkezik)
2. Admin tud létrehozni dolgozót
3. készlet CRUD legalább egy eleme (különösen: Cikkszam UNIQUE)
4. kiadás: készlet csökken + `RuhaKiBe` rekord létrejön + `Indok` mentésre kerül
5. visszavétel: készlet nő + `VisszaDatum` beáll
6. rendelés teljesítése: készlet nő + státusz változik

---

## 14. Végpontok összesítése

| Modul | Végpontok száma |
|:------|:---------------:|
| Auth | 2 |
| Dolgozók | 7 |
| Ruhák | 9 |
| RuhaKiBe | 10 |
| Rendelések | 9 |
| Dashboard | 3 |
| Jelentések | 4 |
| **Összesen** | **44** |
```


