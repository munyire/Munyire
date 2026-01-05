

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
├── src/
│   ├── index.js                 # Express app indítása
│   ├── database.js              # Sequelize kapcsolat (SQLite)
│   ├── models/
│   │   ├── dolgozo.js
│   │   ├── ruha.js
│   │   ├── ruhakibe.js
│   │   └── rendeles.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── dolgozok.js
│   │   ├── ruhak.js
│   │   ├── ruhakibe.js
│   │   └── rendelesek.js
│   ├── middleware/
│   │   ├── auth.js              # JWT ellenőrzés
│   │   ├── requireRole.js       # szerepkör ellenőrzés
│   │   ├── requireSelfOrRole.js # csak saját adat VAGY magasabb szerepkör
│   │   └── errorHandler.js      # egységes hibakezelés (javasolt)
│   └── utils/
│       └── roles.js             # szerepkör hierarchia (javasolt)
├── munyire.db                   # SQLite adatbázis fájl (fejlesztés)
├── package.json
└── integration_test.js          # opcionális
```

> **Megjegyzés**: a `src/` mappázás ajánlott, de nem kötelező. A lényeg, hogy a route-ok, modellek és middleware-ek külön legyenek.

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

### 6.4. `errorHandler` middleware (javasolt)
Egységes JSON hibaválasz a teljes API-n:

```json
{ "error": "Hibaüzenet", "details": "Opcionális részletek" }
```

Tipikus státuszkódok:
- `400` Bad Request
- `401` Unauthorized
- `403` Forbidden
- `404` Not Found
- `409` Conflict (pl. duplikált FelhasznaloNev)
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
- `Fajta`
- `Szin`
- `Meret`
- `Mennyiseg` (nem lehet negatív)
- `Minoseg` (pl. Uj, Jo, Szakadt)

**Javasolt megkötések**: `Mennyiseg >= 0`

### 7.3. RuhaKiBe
- `RuhaKiBeID` (PK)
- `DolgozoID` (FK → Dolgozok)
- `RuhaID` (FK → Ruhak)
- `KiadasDatum`
- `VisszaDatum` (NULL amíg kint van)
- `Mennyiseg` (pozitív egész)
- `RuhaMinoseg` (visszavételkor rögzítve; NULL lehet)

### 7.4. Rendelesek
- `RendelesID` (PK)
- `RuhaID` (FK → Ruhak)
- `RDatum`
- `Mennyiseg` (pozitív egész)
- `Statusz` (pl. Leadva, Teljesítve, Lemondva)

---

## 8. Üzleti szabályok (hogy “működjön”)

### 8.1. Kiadás (készlet csökkentése)
Kiadáskor (új `RuhaKiBe` rekord létrehozása) a backend:
1. ellenőrzi: a kért mennyiség pozitív
2. ellenőrzi: a készlet elég-e (`Ruhak.Mennyiseg >= kértMennyiseg`)
3. csökkenti a készletet
4. létrehozza a `RuhaKiBe` rekordot

> **Stabilitás**: ezt Sequelize **transaction**-ben célszerű végezni.

### 8.2. Visszavétel (készlet növelése)
Visszavételkor (létező `RuhaKiBe` rekord frissítése) a backend:
1. ellenőrzi: a rekord létezik
2. ellenőrzi: még nincs visszavéve (`VisszaDatum IS NULL`)
3. beállítja a `VisszaDatum` mezőt
4. rögzíti a visszavételkori minőséget (`RuhaMinoseg`)
5. növeli a készletet az adott mennyiséggel

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
| :--- | :--- | :--- | :--- |
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

### 10.2. Dolgozók – `/api/dolgozok`

| Metódus | Útvonal | Mit csinál | Jogosultság |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/dolgozok` | Összes dolgozó listázása | Manager, Admin |
| **GET** | `/api/dolgozok/:dolgozoId` | Egy dolgozó adatainak lekérése | Dolgozo (csak saját), Manager, Admin |
| **PATCH** | `/api/dolgozok/:dolgozoId` | Dolgozó adatainak módosítása (pl. elérhetőség, szerepkör) | Admin |
| **DELETE** | `/api/dolgozok/:dolgozoId` | Dolgozó törlése | Admin |

**PATCH /api/dolgozok/:dolgozoId – példa request body**
```json
{
  "Email": "uj@email.hu",
  "Telefonszam": "999999999",
  "Szerepkor": "Manager"
}
```

### 10.3. Ruhák / készlet – `/api/ruhak`

| Metódus | Útvonal | Mit csinál | Jogosultság |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/ruhak` | Készlet listázása | Manager, Admin |
| **GET** | `/api/ruhak/:ruhaId` | Egy ruhacikk részletei | Manager, Admin |
| **POST** | `/api/ruhak` | Új ruhacikk felvétele a készletbe | Admin |
| **PATCH** | `/api/ruhak/:ruhaId` | Ruhacikk módosítása (pl. mennyiség, minőség) | Admin |
| **DELETE** | `/api/ruhak/:ruhaId` | Ruhacikk törlése | Admin |

**POST /api/ruhak – példa request body**
```json
{
  "Fajta": "Nadrág",
  "Szin": "Fekete",
  "Meret": "M",
  "Mennyiseg": 50,
  "Minoseg": "Uj"
}
```

### 10.4. Kiadás / visszavétel – `/api/ruhakibe`

| Metódus | Útvonal | Mit csinál | Jogosultság |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/ruhakibe` | Összes kiadás/visszavétel tranzakció listázása | Manager, Admin |
| **GET** | `/api/ruhakibe/mine` | Bejelentkezett user saját tranzakciói (Saját ruháim) | Dolgozo, Manager, Admin |
| **GET** | `/api/ruhakibe/:ruhaKiBeId` | Egy tranzakció részletei | Manager, Admin |
| **POST** | `/api/ruhakibe` | Új kiadás rögzítése (készlet csökkentéssel) | Manager, Admin |
| **PATCH** | `/api/ruhakibe/:ruhaKiBeId` | Visszavétel rögzítése (készlet növeléssel) | Manager, Admin |
| **DELETE** | `/api/ruhakibe/:ruhaKiBeId` | Tranzakció törlése | Admin |

**POST /api/ruhakibe – kiadás példa request body**
```json
{
  "DolgozoID": 1,
  "RuhaID": 2,
  "KiadasDatum": "2026-01-05T10:00:00Z",
  "Mennyiseg": 1
}
```

**PATCH /api/ruhakibe/:ruhaKiBeId – visszavétel példa request body**
```json
{
  "VisszaDatum": "2026-01-10T10:00:00Z",
  "RuhaMinoseg": "Jo"
}
```
*Megjegyzés*: a visszavétel csak akkor engedett, ha az adott rekord még nincs lezárva (VisszaDatum NULL).

### 10.5. Rendelések – `/api/rendelesek`

| Metódus | Útvonal | Mit csinál | Jogosultság |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/rendelesek` | Összes rendelés listázása | Manager, Admin |
| **GET** | `/api/rendelesek/:rendelesId` | Egy rendelés részletei | Manager, Admin |
| **POST** | `/api/rendelesek` | Új rendelés létrehozása | Manager, Admin |
| **PATCH** | `/api/rendelesek/:rendelesId` | Rendelés módosítása (jellemzően státusz) | Manager, Admin |
| **DELETE** | `/api/rendelesek/:rendelesId` | Rendelés törlése | Admin |

**POST /api/rendelesek – példa request body**
```json
{
  "RuhaID": 2,
  "RDatum": "2026-01-05T11:00:00Z",
  "Mennyiseg": 25,
  "Statusz": "Leadva"
}
```

**PATCH /api/rendelesek/:rendelesId – példa**
```json
{
  "Statusz": "Teljesítve"
}
```

---

## 11. CORS

A backend `cors` middleware-t használ.
Javasolt beállítás: csak a frontend originjét engedélyezni fejlesztésben (pl. `http://localhost:3000`), vizsgán elég lehet egy egyszerű engedélyezés is.

---

## 12. Indítás (terv)

```bash
cd backend
npm install
npm start
```

Alapértelmezett cím: `http://localhost:3001`

---

## 13. Opcionális: integrációs teszt (terv)

Ha készül `integration_test.js`, akkor minimálisan érdemes lefedni:
1. login működik (token érkezik)
2. Admin tud létrehozni dolgozót
3. készlet CRUD legalább egy eleme
4. kiadás: készlet csökken + `RuhaKiBe` rekord létrejön
5. visszavétel: készlet nő + `VisszaDatum` beáll
```