# Munyire – Munkaruhakezelő Rendszer

## 1. Bevezetés

A **Munyire** egy munkaruhakezelő rendszer, amely a dolgozóknak kiadott munkaruhák nyilvántartását, készletkezelését, a kiadási/visszavételi folyamatot, a rendelések kezelését és pénzügyi kimutatások generálását biztosítja.

A projekt célja egy **stabil**, **biztonságos** és **kényelmesen használható** webes felület létrehozása egy szakközépiskolai kimeneti vizsga keretében.

Az alkalmazás egy **Vue 3 SPA**, amely a háttérben egy Express.js REST API-val kommunikál.

---

## 2. Technológiai stack

### Backend
- **Node.js** (≥18)
- **Express.js**
- **Sequelize ORM**
- **SQLite** (SQLite3)
- **JWT** (jsonwebtoken – token alapú bejelentkezés)
- **bcrypt** (jelszó hash-elés)
- **helmet** (HTTP biztonsági fejlécek)
- **express-rate-limit** (rate limiting: 100 req / 15 perc)
- **express-validator** (input validáció)
- **morgan** (HTTP request logolás)
- **cors**
- **dotenv**
- (fejlesztéshez) **nodemon**

### Frontend
- **Vue 3** (Composition API, `<script setup>`)
- **Pinia** – állapotkezelés
- **Vue Router** – kliensoldali routing, `beforeEach` guard-ok
- **Vite** – build & dev szerver
- **Axios** – HTTP kliens, request/response interceptors
- **lucide-vue-next** – ikonok
- Saját CSS (CSS változók, dark mode támogatás)

---

## 3. Fő funkciók

- Készletnyilvántartás (ruhatípusok, mennyiségek, minőség, **ár**)
- Munkaruhák kiadása dolgozóknak
- Munkaruhák visszavétele (visszavételkori minőség rögzítése)
- Dolgozók kezelése (admin feladat)
- Rendelések kezelése (készletutánpótlás, automatikus raktárnövelés teljesítéskor)
- Pénzügyi jelentések (havi, éves, féléves kiadások, készlet érték)
- Nyomtatási előnézet és CSV export
- Bejelentkezés és szerepkör-alapú jogosultságkezelés

---

## 4. Szerepkörök és jogosultságok

A rendszer három szerepkört használ:

### Dolgozo
- Bejelentkezés
- **Saját ruháim** megtekintése (csak olvasás)
- Saját alapadatok megtekintése

### Manager
Minden, amit a Dolgozo, plusz:
- Dashboard / alap statisztikák megtekintése
- Készlet megtekintése
- Ruhák kiadása és visszavétele rögzítése
- Dolgozók ruháinak megtekintése
- Rendelések létrehozása és státusz módosítása
- Pénzügyi jelentések megtekintése

### Admin
Minden, amit a Manager, plusz:
- Dolgozók teljes körű kezelése (létrehozás, módosítás, törlés)
- Készlet teljes körű kezelése (létrehozás, módosítás, törlés)
- Rendelések teljes körű kezelése (teljesítés, törlés)
- Minőség szerinti készlet összesítő

**Fontos:** a jogosultságot a `Szerepkor` mező határozza meg (`Dolgozo`, `Manager`, `Admin`).  
A `Munkakor` csak információ a dolgozóról, nem jogosultság.

---

## 5. Adatbázis struktúra

Az adatbázis SQLite alapú, Sequelize ORM kezeli. Az adatbázis fájl neve: `database.sqlite`.

### 5.1. Dolgozok
| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `DolgozoID` | INTEGER PK AI | |
| `DNev` | STRING | |
| `Email` | STRING | Egyedi, email validáció |
| `Telefonszam` | STRING | |
| `Nem` | STRING | |
| `Munkakor` | STRING | Csak információ |
| `Szerepkor` | ENUM | `Dolgozo` \| `Manager` \| `Admin` |
| `FelhasznaloNev` | STRING | Egyedi |
| `JelszoHash` | STRING | bcrypt |

### 5.2. Ruhak
| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `Cikkszam` | INTEGER PK | 7-jegyű, auto-generált |
| `Fajta` | STRING | pl. Nadrág, Ing |
| `Szin` | STRING | |
| `Meret` | STRING | XS–XXXL |
| `Ar` | DECIMAL(10,2) | Egységár Ft-ban |

### 5.3. Raktar (Készlet)
| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `RaktarID` | INTEGER PK AI | |
| `Cikkszam` | FK → Ruhak | |
| `Minoseg` | STRING | `Új` \| `Jó` \| `Használt` \| `Kopott` \| `Szakadt/Sérült` \| `Selejt` |
| `Mennyiseg` | INTEGER | Darabszám az adott minőségből |

### 5.4. RuhaKiBe
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

### 5.5. Rendelesek
| Mező | Típus | Megjegyzés |
|------|-------|-----------|
| `RendelesID` | INTEGER PK AI | |
| `Cikkszam` | FK → Ruhak | |
| `RDatum` | DATE | |
| `Mennyiseg` | INTEGER | |
| `Statusz` | ENUM | `Leadva` \| `Teljesítve` \| `Lemondva` |

---

## 6. Oldalak / modulok

| Oldal | Útvonal | Jogosultság |
|-------|---------|------------|
| Bejelentkezés | `/login` | Mindenki |
| Dashboard | `/dashboard` | Manager, Admin |
| Készlet | `/inventory` | Manager (olvasás), Admin (teljes) |
| Dolgozók | `/workers` | Manager (olvasás), Admin (teljes) |
| Kiadás / Visszavétel | `/transactions` | Manager, Admin |
| Rendelések | `/orders` | Manager, Admin |
| Jelentések | `/reports` | Manager, Admin |
| Saját ruháim | `/my-clothes` | Mindenki |

---

## 7. Biztonság

- Jelszavak hash-elve tárolva (bcrypt).
- JWT tokenes bejelentkezés, a védett végpontok token nélkül nem elérhetők.
- Szerepkör-alapú hozzáférés (Dolgozo/Manager/Admin).
- Dolgozó csak a **saját** adatait és saját ruháit érheti el.
- **Helmet** middleware: biztonságos HTTP fejlécek beállítása.
- **Rate limiting**: IP-nként max. 100 kérés / 15 perc.
- **express-validator**: backend input validáció.
- Alapértelmezett admin felhasználó `.env`-ből töltődik be indításkor (`ensureAdminFromEnv`).

---

## 8. Backend futtatás

```bash
cd backend
npm install
npm run dev      # Fejlesztői szerver (nodemon)
npm start        # Production szerver
npm test         # Integrációs tesztek (integration_test.js)
```

Szükséges `.env` fájl (minta: `env.example`):
```
PORT=3000
JWT_SECRET=...
ADMIN_USERNAME=...
ADMIN_PASSWORD=...
```

## 9. Frontend futtatás

```bash
cd frontend
npm install
npm run dev      # Fejlesztői szerver (Vite)
npm run build    # Production build
npm run preview  # Build előnézete
```

---

## 10. Demo adatok betöltése

```bash
cd backend
node demoadatok.js
```