# Munyire – Munkaruhakezelő Rendszer

## 1. Bevezetés

A **Munyire** egy munkaruhakezelő rendszer, amely a dolgozóknak kiadott munkaruhák nyilvántartását, készletkezelését, a kiadási/visszavételi folyamatot és a rendelések kezelését biztosítja.

A projekt célja egy **stabil**, **biztonságos** és **kényelmesen használható** webes felület létrehozása.

Az alkalmazás egy **SPA jellegű weboldal**, amely a háttérben REST API-t használ.

---

## 2. Technológiai Stack

### Backend
| Technológia | Verzió | Leírás |
|------------|--------|--------|
| **Node.js** | >=18 | JavaScript futtatókörnyezet |
| **Express.js** | ^4.19.2 | Web framework |
| **Sequelize ORM** | ^6.37.3 | Adatbázis ORM |
| **SQLite** | ^5.1.7 | Adatbázis |
| **JWT** | ^9.0.2 | Token alapú hitelesítés |
| **bcrypt** | ^5.1.1 | Jelszó hash-elés |
| **helmet** | ^8.1.0 | Biztonsági HTTP fejlécek |
| **express-rate-limit** | ^8.2.1 | Rate limiting |
| **cors** | ^2.8.5 | Cross-origin engedélyezés |
| **morgan** | ^1.10.0 | HTTP request logging |

### Frontend
| Technológia | Verzió | Leírás |
|------------|--------|--------|
| **Vue.js** | ^3.5.24 | Frontend framework |
| **Vue Router** | ^4.6.4 | Routing |
| **Pinia** | ^3.0.4 | State management |
| **Vite** | ^7.2.4 | Build tool |
| **Axios** | ^1.13.2 | HTTP kliens |
| **Lucide Vue** | ^0.562.0 | Ikonok |

---

## 3. Fő Funkciók

- ✅ **Készlet nyilvántartás** – ruhatípusok, mennyiségek kezelése
- ✅ **Munkaruhák kiadása** dolgozóknak
- ✅ **Munkaruhák visszavétele** – visszavételkori minőség rögzítése
- ✅ **Dolgozók kezelése** – teljes CRUD műveletek
- ✅ **Rendelések kezelése** – készletutánpótlás
- ✅ **Dashboard** – statisztikák és áttekintés
- ✅ **Jelentések** – kimutatások és riportok
- ✅ **Bejelentkezés** – JWT token alapú hitelesítés
- ✅ **Szerepkör-alapú jogosultságkezelés** – 3 szintű jogosultság

---

## 4. Szerepkörök és Jogosultságok

A rendszer három szerepkört használ:

### 🔵 Dolgozo
- Bejelentkezés
- **Saját ruháim** megtekintése (csak olvasás)
- Saját alapadatok megtekintése

### 🟡 Manager
Minden, amit a Dolgozo, plusz:
- Dashboard / alap statisztikák megtekintése
- Készlet megtekintése és keresése
- Ruhák kiadása és visszavétele rögzítése
- Dolgozók ruháinak megtekintése
- Rendelések létrehozása és státusz módosítása
- Egyszerű jelentések

### 🔴 Admin
Minden, amit a Manager, plusz:
- Dolgozók teljes körű kezelése (létrehozás, módosítás, törlés)
- Készlet teljes körű kezelése
- Rendelések teljes körű kezelése (törlés, teljesítés)
- Rendszerjelentések

**Fontos:** A jogosultságot a `Szerepkor` mező határozza meg (`Dolgozo`, `Manager`, `Admin`).  
A `Munkakor` csak információ a dolgozóról, nem jogosultság.

---

## 5. Adatbázis Sémák

Az adatbázis **SQLite** alapú, **Sequelize ORM** kezeli.

### 5.1. Dolgozok
| Mező | Típus | Leírás |
|------|-------|--------|
| `DolgozoID` | INTEGER (PK, AI) | Egyedi azonosító |
| `DNev` | STRING | Dolgozó neve |
| `Email` | STRING (unique) | Email cím |
| `Telefonszam` | STRING | Telefonszám |
| `Nem` | STRING | Nem |
| `Munkakor` | STRING | Munkakör (információ) |
| `Szerepkor` | ENUM | `Dolgozo` / `Manager` / `Admin` |
| `FelhasznaloNev` | STRING (unique) | Bejelentkezési név |
| `JelszoHash` | STRING | Jelszó hash (bcrypt) |
| `createdAt` | DATE | Létrehozás dátuma |
| `updatedAt` | DATE | Módosítás dátuma |

### 5.2. Ruhak
| Mező | Típus | Leírás |
|------|-------|--------|
| `Cikkszam` | INTEGER (PK) | 7-jegyű egyedi cikkszám |
| `Fajta` | STRING | Ruha fajtája (pl. "Póló") |
| `Szin` | STRING | Szín |
| `Meret` | STRING | Méret |
| `Ar` | DECIMAL | Ár (opcionális) |
| `createdAt` | DATE | Létrehozás dátuma |
| `updatedAt` | DATE | Módosítás dátuma |

### 5.3. Raktar (Készlet)
| Mező | Típus | Leírás |
|------|-------|--------|
| `RaktarID` | INTEGER (PK, AI) | Egyedi azonosító |
| `Cikkszam` | INTEGER (FK) | Ruha cikkszáma |
| `Minoseg` | STRING | `Új` / `Jó` / `Használt` |
| `Mennyiseg` | INTEGER | Darabszám |
| `createdAt` | DATE | Létrehozás dátuma |
| `updatedAt` | DATE | Módosítás dátuma |

### 5.4. RuhaKiBe (Kiadás/Visszavétel)
| Mező | Típus | Leírás |
|------|-------|--------|
| `RuhaKiBeID` | INTEGER (PK, AI) | Egyedi azonosító |
| `DolgozoID` | INTEGER (FK) | Dolgozó azonosító |
| `Cikkszam` | INTEGER (FK) | Ruha cikkszáma |
| `KiadasDatum` | DATE | Kiadás dátuma |
| `VisszaDatum` | DATE | Visszavétel dátuma (NULL ha nincs) |
| `Indok` | STRING | Kiadás indoka |
| `Mennyiseg` | INTEGER | Darabszám |
| `RuhaMinoseg` | STRING | Visszavételkori minőség |
| `createdAt` | DATE | Létrehozás dátuma |
| `updatedAt` | DATE | Módosítás dátuma |

### 5.5. Rendelesek
| Mező | Típus | Leírás |
|------|-------|--------|
| `RendelesID` | INTEGER (PK, AI) | Egyedi azonosító |
| `Cikkszam` | INTEGER (FK) | Ruha cikkszáma |
| `RDatum` | DATE | Rendelés dátuma |
| `Mennyiseg` | INTEGER | Rendelt mennyiség |
| `Statusz` | ENUM | `Leadva` / `Teljesítve` / `Lemondva` |
| `Szallito` | STRING | Szállító neve |
| `Megjegyzes` | TEXT | Megjegyzés |
| `createdAt` | DATE | Létrehozás dátuma |
| `updatedAt` | DATE | Módosítás dátuma |

---

## 6. Oldalak és Modulok

| Oldal | Útvonal | Elérhetőség | Leírás |
|-------|---------|-------------|--------|
| Bejelentkezés | `/login` | Nyilvános | Bejelentkezési oldal |
| Dashboard | `/dashboard` | Manager, Admin | Áttekintés és statisztikák |
| Készlet | `/inventory` | Manager, Admin | Raktárkészlet kezelése |
| Kiadás/Visszavétel | `/transactions` | Manager, Admin | Ruhák kiadása és visszavétele |
| Dolgozók | `/workers` | Manager, Admin | Dolgozók kezelése |
| Saját ruháim | `/my-clothes` | Mindenki | Saját ruhakiadások megtekintése |
| Rendelések | `/orders` | Manager, Admin | Rendelések kezelése |
| Jelentések | `/reports` | Manager, Admin | Kimutatások és riportok |

---

## 7. Biztonsági Megoldások

- ✅ **Jelszavak hash-elve tárolva** – bcrypt algoritmussal
- ✅ **JWT tokenes bejelentkezés** – védett végpontok token nélkül nem elérhetők
- ✅ **Helmet** – biztonsági HTTP fejlécek beállítása
- ✅ **Rate Limiting** – maximum 1000 kérés / 15 perc IP-enként
- ✅ **CORS** – cross-origin kérések szabályozása
- ✅ **Szerepkör-alapú hozzáférés** – `Dolgozo` / `Manager` / `Admin`
- ✅ **Adatvédelem** – Dolgozó csak a **saját** adatait és saját ruháit érheti el

---

## 8. Telepítés és Futtatás

### 8.1. Klónozás és függőségek telepítése

```bash
# Repository klónozása
git clone https://github.com/munyire/Munyire.git
cd Munyire

# Backend függőségek telepítése
cd backend
npm install

# Frontend függőségek telepítése
cd ../frontend
npm install
```

### 8.2. Környezeti változók beállítása

```bash
cd backend
cp env.example .env
```

Szerkeszd a `.env` fájlt:
```env
PORT=3000
JWT_SECRET=your-super-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
DB_LOGGING=false
```

### 8.3. Backend indítása

```bash
cd backend

# Fejlesztői mód (nodemon)
npm run dev

# Produkciós mód
npm start
```

A backend elérhető: `http://localhost:3000`

### 8.4. Frontend indítása

```bash
cd frontend
npm run dev
```

A frontend elérhető: `http://localhost:5173`

### 8.5. Egyidejű indítás (root mappából)

```bash
# Root mappából (Munyire/)
npm run dev
```

Ez elindítja egyszerre a backend-et (port 3000) és a frontend-et (port 5173).

---

## 9. Tesztek Futtatása

```bash
cd backend
npm test
```

Az integrációs tesztek ellenőrzik a főbb API végpontok működését.

---

## 10. Alapértelmezett Felhasználó

Telepítés után az alábbi admin felhasználó automatikusan létrejön:

| Mező | Érték |
|------|-------|
| Felhasználónév | `admin` (vagy a .env-ben megadott) |
| Jelszó | `admin123` (vagy a .env-ben megadott) |
| Szerepkör | `Admin` |

---

## 11. Projekt Struktúra

```
Munyire/
├── backend/                  # Backend alkalmazás
│   ├── app.js               # Fő alkalmazás fájl
│   ├── db.js                # Adatbázis kapcsolat
│   ├── controllers/         # Kontrollerek
│   ├── middlewares/         # Middleware-ek
│   ├── models/              # Sequelize modellek
│   ├── repositories/        # Adatelérési réteg
│   ├── routes/              # API útvonalak
│   ├── services/            # Üzleti logika
│   ├── utils/               # Segédfüggvények
│   ├── validators/          # Validátorok
│   └── tests/               # Tesztek
├── frontend/                 # Frontend alkalmazás
│   ├── src/
│   │   ├── api/             # API kliens
│   │   ├── components/      # Vue komponensek
│   │   ├── router/          # Vue Router konfiguráció
│   │   ├── stores/          # Pinia store-ok
│   │   ├── views/           # Oldal komponensek
│   │   ├── App.vue          # Fő komponens
│   │   └── main.js          # Belépési pont
│   └── index.html
├── md/                       # Dokumentáció
│   ├── BACKEND.md           # Backend dokumentáció
│   └── ENDPOINT.md          # API végpontok
└── README.md                # Ez a fájl
```

---

## 12. Dokumentáció

- **[API Végpontok](./md/ENDPOINT.md)** – Részletes API dokumentáció
- **[Backend Dokumentáció](./md/BACKEND.md)** – Backend architektúra és részletek
- **[API Dokumentáció](./backend/API_DOCUMENTATION.md)** – Példák és részletes leírás

---

## 13. Fejlesztői Információk

### 13.1. Git Hook
A projekt tartalmaz pre-commit hook-ot, amely automatikusan frissíti a verziószámot.

### 13.2. Kódolási Stílus
- Backend: CommonJS modulok
- Frontend: ES6 modulok
- 2 szóköz behúzás
- ESLint ajánlott (jövőbeli fejlesztés)

---

## 14. Licenc

Ez a projekt nyílt forráskódú. Lásd a [LICENSE](./LICENSE) fájlt a részletekért.

---

**Készítette:** Munyire Development Team  
**Verzió:** 1.0.0  
**Utolsó frissítés:** 2026. március
