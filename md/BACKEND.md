# Munyire – Backend Dokumentáció

## 1. Bevezetés

A **Munyire** backend egy **Node.js/Express** alapú REST API, amely **SQLite** adatbázist használ **Sequelize ORM**-mel.

---

## 2. Technológiai Stack

| Komponens | Technológia | Verzió |
|-----------|-------------|--------|
| Runtime | Node.js | >=18 |
| Framework | Express.js | ^4.19.2 |
| ORM | Sequelize | ^6.37.3 |
| Database | SQLite | ^5.1.7 |
| Auth | JWT | ^9.0.2 |
| Password Hash | bcrypt | ^5.1.1 |
| Security | helmet | ^8.1.0 |
| Rate Limit | express-rate-limit | ^8.2.1 |
| Validation | express-validator | ^7.2.1 |
| Logging | morgan | ^1.10.0 |
| CORS | cors | ^2.8.5 |
| Env Vars | dotenv | ^16.4.5 |

---

## 3. Projekt Struktúra

```
backend/
├── app.js                          # Fő alkalmazás fájl
├── db.js                           # Adatbázis kapcsolat és modellek inicializálása
├── package.json                    # Függőségek és scriptek
├── .env                            # Környezeti változók
├── env.example                     # Példa környezeti változók
├── database.sqlite                 # SQLite adatbázis fájl
├── demoadatok.js                   # Demó adatok betöltése
├── integration_test.js             # Integrációs tesztek
├── API_DOCUMENTATION.md            # API dokumentáció példákkal
│
├── controllers/                    # Kontrollerek (request/response logika)
│   ├── authController.js
│   ├── dashboardController.js
│   ├── dolgozoController.js
│   ├── rendelesController.js
│   ├── reportsController.js
│   ├── ruhaController.js
│   └── ruhakibeController.js
│
├── middlewares/                    # Express middleware-ek
│   ├── authMiddleware.js           # JWT ellenőrzés
│   ├── errorHandlerMiddleware.js   # Globális hibakezelő
│   ├── optionalAuthMiddleware.js   # Opcionális auth
│   ├── requireRoleMiddleware.js    # Szerepkör ellenőrzés
│   ├── requireSelfOrRoleMiddleware.js  # Saját adat vagy szerepkör
│   └── validationHandler.js        # Validációs hibakezelő
│
├── models/                         # Sequelize modellek
│   ├── index.js                    # Modellek inicializálása és kapcsolatok
│   ├── Dolgozo.js                  # Dolgozó modell
│   ├── Raktar.js                   # Raktár (készlet) modell
│   ├── Rendeles.js                 # Rendelés modell
│   ├── Ruha.js                     # Ruha modell
│   └── RuhaKiBe.js                 # Ruha kiadás/visszavétel modell
│
├── repositories/                   # Repository réteg (adatkezelés)
│   ├── authRepository.js
│   ├── dashboardRepository.js
│   ├── dolgozoRepository.js
│   ├── rendelesRepository.js
│   ├── reportsRepository.js
│   ├── ruhaRepository.js
│   └── ruhakibeRepository.js
│
├── routes/                         # API útvonalak
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── dolgozoRoutes.js
│   ├── rendelesRoutes.js
│   ├── reportsRoutes.js
│   ├── ruhaRoutes.js
│   └── ruhakibeRoutes.js
│
├── services/                       # Üzleti logika
│   ├── authService.js
│   ├── dashboardService.js
│   ├── dolgozoService.js
│   ├── rendelesService.js
│   ├── reportsService.js
│   ├── ruhaService.js
│   └── ruhakibeService.js
│
├── utils/                          # Segédfüggvények
│   ├── roles.js                    # Szerepkörök definíciója
│   └── testData.js                 # Tesztadatok
│
├── validators/                     # Input validátorok
│   ├── authValidators.js
│   ├── dolgozoValidators.js
│   └── ruhaValidators.js
│
└── tests/                          # Teszt fájlok
    └── ...
```

---

## 4. Architektúra

### 4.1. Réteges Architektúra

```
┌─────────────────────────────────────┐
│           Routes (Útvonalak)        │  ← API végpontok definiálása
├─────────────────────────────────────┤
│         Middleware-ek               │  ← Auth, validáció, rate limiting
├─────────────────────────────────────┤
│        Controllers (Kontrollerek)   │  ← Request/Response kezelés
├─────────────────────────────────────┤
│         Services (Szolgáltatások)   │  ← Üzleti logika
├─────────────────────────────────────┤
│      Repositories (Tárolók)         │  ← Adatbázis műveletek
├─────────────────────────────────────┤
│         Models (Modellek)           │  ← Sequelize modellek
├─────────────────────────────────────┤
│         Database (Adatbázis)        │  ← SQLite
└─────────────────────────────────────┘
```

### 4.2. Adatfolyam

1. **Request** érkezik a `Routes`-ba
2. **Middleware-ek** ellenőrzik az autentikációt és jogosultságot
3. **Controller** fogadja a kérést, kinyeri az adatokat
4. **Service** végrehajtja az üzleti logikát
5. **Repository** kommunikál az adatbázissal
6. **Modellek** reprezentálják az adatokat
7. **Response** visszaküldése a kliensnek

---

## 5. Adatbázis Modell Kapcsolatok

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   Dolgozo    │       │   RuhaKiBe   │       │    Ruha      │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ DolgozoID (PK)│◄─────│ DolgozoID (FK)│       │ Cikkszam (PK)│
│    ...       │       │ Cikkszam (FK)│──────►│    ...       │
└──────────────┘       │    ...       │       └──────┬───────┘
                       └──────────────┘              │
                                                      │
                       ┌──────────────┐              │
                       │    Raktar    │◄─────────────┘
                       ├──────────────┤
                       │ RaktarID (PK)│
                       │ Cikkszam (FK)│
                       │    ...       │
                       └──────────────┘
                              │
                              ▼
                       ┌──────────────┐
                       │   Rendeles   │
                       ├──────────────┤
                       │ RendelesID   │
                       │ Cikkszam (FK)│
                       │    ...       │
                       └──────────────┘
```

### 5.1. Kapcsolatok Leírása

| Kapcsolat | Típus | Leírás |
|-----------|-------|--------|
| Dolgozo → RuhaKiBe | 1:N | Egy dolgozónak több kiadása lehet |
| Ruha → Raktar | 1:N | Egy ruhának több minőségi kategóriája lehet |
| Ruha → RuhaKiBe | 1:N | Egy ruhából több kiadás lehet |
| Ruha → Rendeles | 1:N | Egy ruhához több rendelés tartozhat |

---

## 6. Biztonsági Megoldások

### 6.1. Hitelesítés és Autorizáció

```javascript
// JWT token ellenőrzés
const auth = require("./middlewares/authMiddleware");

// Szerepkör ellenőrzés
const requireRole = require("./middlewares/requireRoleMiddleware");
const { ROLES } = require("./utils/roles");

// Példa használat:
router.get("/", auth, requireRole(ROLES.Manager), controller.list);
```

### 6.2. Biztonsági Middleware-ek

| Middleware | Funkció |
|------------|---------|
| `helmet()` | Biztonsági HTTP fejlécek |
| `express-rate-limit` | Rate limiting (1000 req/15min) |
| `cors()` | Cross-origin engedélyezés |
| `express-validator` | Input validáció |
| `bcrypt` | Jelszó hash-elés (10 salt round) |

### 6.3. Jelszó Kezelés

```javascript
// Hash-elés tároláskor
const hashedPassword = await bcrypt.hash(password, 10);

// Ellenőrzés bejelentkezéskor
const isValid = await bcrypt.compare(password, hashedPassword);
```

---

## 7. API Végpontok Részletesen

### 7.1. Auth Endpoints (`/api/auth`)

```javascript
// routes/authRoutes.js
router.post("/login", loginValidator, validationHandler, authController.login);
router.post("/register", auth, requireRole(ROLES.Admin), registerValidator, validationHandler, authController.register);
```

### 7.2. Dolgozó Endpoints (`/api/dolgozok`)

```javascript
// routes/dolgozoRoutes.js
router.get("/", requireRole(ROLES.Manager), controller.list);
router.get("/names", requireRole(ROLES.Manager), controller.listNames);
router.get("/search", requireRole(ROLES.Manager), controller.search);
router.get("/:dolgozoId", requireSelfOrRole({ paramKey: "dolgozoId", role: ROLES.Manager }), controller.get);
router.post("/", requireRole(ROLES.Admin), createDolgozo, validationHandler, controller.create);
router.patch("/:dolgozoId", requireRole(ROLES.Admin), updateDolgozo, validationHandler, controller.update);
router.delete("/:dolgozoId", requireRole(ROLES.Admin), controller.remove);
```

### 7.3. Ruha Endpoints (`/api/ruhak`)

```javascript
// routes/ruhaRoutes.js
router.get("/", requireRole(ROLES.Manager), controller.list);
router.get("/search", requireRole(ROLES.Manager), controller.search);
router.get("/options", requireRole(ROLES.Manager), controller.getOptions);
router.get("/:ruhaId", requireRole(ROLES.Manager), controller.get);
router.post("/", requireRole(ROLES.Admin), createRuha, validationHandler, controller.create);
router.patch("/:ruhaId", requireRole(ROLES.Admin), updateRuha, validationHandler, controller.update);
router.delete("/:ruhaId", requireRole(ROLES.Admin), controller.remove);
```

---

## 8. Modellek Részletesen

### 8.1. Dolgozo Modell

```javascript
{
  DolgozoID: INTEGER (PK, autoIncrement),
  DNev: STRING (required),
  Email: STRING (required, unique, email format),
  Telefonszam: STRING (optional),
  Nem: STRING (optional),
  Munkakor: STRING (optional),
  Szerepkor: ENUM ('Dolgozo', 'Manager', 'Admin'),
  FelhasznaloNev: STRING (required, unique),
  JelszoHash: STRING (required),
  createdAt: DATE,
  updatedAt: DATE
}
```

### 8.2. Ruha Modell

```javascript
{
  Cikkszam: INTEGER (PK, 7-digit),
  Fajta: STRING (required),
  Szin: STRING (required),
  Meret: STRING (required),
  Ar: DECIMAL(10,2) (optional, default: 0),
  createdAt: DATE,
  updatedAt: DATE
}
```

### 8.3. Raktar Modell

```javascript
{
  RaktarID: INTEGER (PK, autoIncrement),
  Cikkszam: INTEGER (FK -> Ruha),
  Minoseg: STRING (default: 'Új'),
  Mennyiseg: INTEGER (default: 0),
  createdAt: DATE,
  updatedAt: DATE
}
```

### 8.4. RuhaKiBe Modell

```javascript
{
  RuhaKiBeID: INTEGER (PK, autoIncrement),
  DolgozoID: INTEGER (FK -> Dolgozo),
  Cikkszam: INTEGER (FK -> Ruha),
  KiadasDatum: DATE (default: NOW),
  VisszaDatum: DATE (optional),
  Indok: STRING (optional),
  Mennyiseg: INTEGER (default: 1),
  RuhaMinoseg: STRING (optional),
  createdAt: DATE,
  updatedAt: DATE
}
```

### 8.5. Rendeles Modell

```javascript
{
  RendelesID: INTEGER (PK, autoIncrement),
  Cikkszam: INTEGER (FK -> Ruha),
  RDatum: DATE (default: NOW),
  Mennyiseg: INTEGER (default: 0),
  Statusz: ENUM ('Leadva', 'Teljesítve', 'Lemondva'),
  Szallito: STRING (optional),
  Megjegyzes: TEXT (optional),
  createdAt: DATE,
  updatedAt: DATE
}
```

---

## 9. Szerepkör Rendszer

### 9.1. Szerepkörök Definíciója

```javascript
// utils/roles.js
const ROLES = {
  Dolgozo: "Dolgozo",
  Manager: "Manager",
  Admin: "Admin",
};

const ROLE_ORDER = [ROLES.Dolgozo, ROLES.Manager, ROLES.Admin];

function hasRole(userRole, requiredRole) {
  return ROLE_ORDER.indexOf(userRole) >= ROLE_ORDER.indexOf(requiredRole);
}
```

### 9.2. Szerepkörök Jogosultságai

| Funkció | Dolgozo | Manager | Admin |
|---------|:-------:|:-------:|:-----:|
| Saját ruhák megtekintése | ✅ | ✅ | ✅ |
| Készlet megtekintése | ❌ | ✅ | ✅ |
| Ruhák kiadása/visszavétele | ❌ | ✅ | ✅ |
| Dolgozók kezelése | ❌ | ✅ (r) | ✅ (crud) |
| Rendelések kezelése | ❌ | ✅ (create) | ✅ (crud) |
| Jelentések | ❌ | ✅ | ✅ |
| Rendszerbeállítások | ❌ | ❌ | ✅ |

---

## 10. Futtatás és Fejlesztés

### 10.1. Scriptek

| Script | Parancs | Leírás |
|--------|---------|--------|
| `npm start` | `node app.js` | Produkciós indítás |
| `npm run dev` | `nodemon app.js` | Fejlesztői mód |
| `npm test` | `node integration_test.js` | Tesztek futtatása |

### 10.2. Környezeti Változók

```env
PORT=3000                      # Szerver port
JWT_SECRET=your-secret-key     # JWT titkos kulcs
ADMIN_USERNAME=admin           # Alapértelmezett admin felhasználónév
ADMIN_PASSWORD=admin123        # Alapértelmezett admin jelszó
DB_PATH=./database.sqlite      # Adatbázis fájl elérési útja
DB_LOGGING=false               # SQL query logging (true/false)
```

### 10.3. Demó Adatok Betöltése

```bash
node demoadatok.js
```

Ez létrehoz:
- 3 szerepkörű felhasználót (Admin, Manager, Dolgozo)
- 10+ ruhacikket különböző tulajdonságokkal
- Raktárkészletet minden ruhához
- Minta kiadásokat és visszavételeket
- Függőben lévő rendeléseket

---

## 11. Hibakezelés

### 11.1. Hiba Formátum

```json
{
  "error": "Hibaüzenet leírása"
}
```

### 11.2. HTTP Státuszkódok

| Kód | Jelentés |
|-----|----------|
| 200 | OK – Sikeres művelet |
| 201 | Created – Sikeres létrehozás |
| 400 | Bad Request – Hibás kérés |
| 401 | Unauthorized – Nincs bejelentkezve |
| 403 | Forbidden – Nincs jogosultság |
| 404 | Not Found – Nem található |
| 409 | Conflict – Ütközés (duplikáció) |
| 500 | Internal Server Error – Szerverhiba |

---

## 12. Tesztelés

### 12.1. Integrációs Tesztek

```bash
npm test
```

A tesztek ellenőrzik:
- Bejelentkezést
- Ruhák listázását
- Új ruha létrehozását
- Kiadás/visszavétel működését

### 12.2. HTTP Tesztfájlok

| Fájl | Leírás |
|------|--------|
| `test.http` | Alapvető API tesztek |
| `user_stories_test.http` | User story-k tesztelése |
| `erzsi_scenario.http` | Komplex forgatókönyvek |
| `all_user_stories.http` | Összes user story egyben |

---

## 13. Fejlesztői Megjegyzések

### 13.1. Kódolási Konvenciók

- **Modulok**: CommonJS (`require` / `module.exports`)
- **Behúzás**: 2 szóköz
- **Idézőjelek**: Dupla idézőjel ("string")
- **Szemikolon**: Kötelező
- **Névadás**: camelCase

### 13.2. Git Hook

A projekt tartalmaz pre-commit hook-ot, amely automatikusan frissíti a verziószámot.

### 13.3. Jövőbeli Fejlesztési Lehetőségek

- [ ] ESLint bevezetése
- [ ] Unit tesztek bővítése
- [ ] API dokumentáció (Swagger/OpenAPI)
- [ ] Email értesítések
- [ ] Rendszerlogok tárolása
- [ ] Többnyelvűség támogatása

---

## 14. Teljes API Lista

Lásd a [ENDPOINT.md](./ENDPOINT.md) fájlt a teljes API dokumentációért.
