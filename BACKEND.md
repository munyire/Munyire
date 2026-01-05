# Munyire – Munkaruhakezelő Rendszer

## 1. Bevezetés

A **Munyire** egy munkaruhakezelő rendszer, amely a dolgozóknak kiadott munkaruhák nyilvántartását, készletkezelését, a kiadási/visszavételi folyamatot és a rendelések kezelését biztosítja.

A projekt célja egy **stabil**, **biztonságos** és **kényelmesen használható** webes felület létrehozása egy szakközépiskolai kimeneti vizsga keretében.

Az első verzió egy **SPA jellegű weboldal**, amely a háttérben REST API-t használ.

---

## 2. Technológiai stack

### Backend
- **Node.js**
- **Express.js**
- **Sequelize ORM**
- **SQLite**
- **JWT** (token alapú bejelentkezés)
- **bcrypt** (jelszó hash-elés)
- **cors**
- (fejlesztéshez) **nodemon**

### Frontend
- Webes felület (SPA jelleg)
- REST API kommunikáció JSON formátumban
- Reszponzív felület, modern dizájn (terv)

---

## 3. Fő funkciók

- Készlet nyilvántartás (ruhatípusok, mennyiségek)
- Munkaruhák kiadása dolgozóknak
- Munkaruhák visszavétele (visszavételkori minőség rögzítése)
- Dolgozók kezelése (admin feladat)
- Rendelések kezelése (készletutánpótlás)
- Egyszerű jelentések / kimutatások
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
- Egyszerű jelentések

### Admin
Minden, amit a Manager, plusz:
- Dolgozók teljes körű kezelése
- Készlet teljes körű kezelése
- Rendelések teljes körű kezelése
- (Tervezett) rendszerlogok / haladó jelentések

**Fontos:** a jogosultságot a `Szerepkor` mező határozza meg (`Dolgozo`, `Manager`, `Admin`).  
A `Munkakor` csak információ a dolgozóról, nem jogosultság.

---

## 5. Adatbázis terv

Az adatbázis SQLite alapú, Sequelize ORM kezeli.

### 5.1. Dolgozok
- `DolgozoID` (PK)
- `DNev`
- `Email`
- `Telefonszam`
- `Nem`
- `Munkakor` (információ)
- `Szerepkor` (`Dolgozo` | `Manager` | `Admin`)
- `FelhasznaloNev` (egyedi)
- `JelszoHash` (bcrypt)

### 5.2. Ruhak
- `RuhaID` (PK)
- `Cikkszam` (**egyedi** cikkszám / azonosító)
- `Fajta`
- `Szin`
- `Meret`
- `Mennyiseg` (készlet)
- `Minoseg` (opcionális: `Uj`, `Jo`, `Szakadt`)

Megjegyzés: 1 sor egy „ruhacikk” (pl. fekete M-es nadrág), nem egyedi darab.

### 5.3. RuhaKiBe
- `RuhaKiBeID` (PK)
- `DolgozoID` (FK → Dolgozok)
- `RuhaID` (FK → Ruhak)
- `KiadasDatum`
- `VisszaDatum` (NULL, amíg nincs visszavéve)
- `Indok` (kiadás indoka / megjegyzés, pl. „új belépő”, „csere”, „pótlás”)
- `Mennyiseg`
- `RuhaMinoseg` (visszavételkor rögzített minőség)

### 5.4. Rendelesek
- `RendelesID` (PK)
- `RuhaID` (FK → Ruhak)
- `RDatum`
- `Mennyiseg`
- `Statusz` (`Leadva`, `Teljesítve`, `Lemondva`)

---

## 6. Oldalak / modulok (terv)

- Bejelentkezés
- Dashboard (Manager, Admin)
- Készlet (Manager: megtekintés, Admin: teljes kezelés)
- Kiadás / Visszavétel (Manager, Admin)
- Dolgozók (Manager: megtekintés, Admin: teljes kezelés)
- Saját ruháim (Dolgozo, Manager, Admin – mindig a saját)
- Rendelések (Manager, Admin)
- Jelentések (egyszerű / haladó)

---

## 7. Biztonság (terv)

- Jelszavak hash-elve tárolva (bcrypt).
- JWT tokenes bejelentkezés, a védett végpontok token nélkül nem elérhetők.
- Szerepkör-alapú hozzáférés (Dolgozo/Manager/Admin).
- Dolgozó csak a **saját** adatait és saját ruháit érheti el.

---

## 8. Backend futtatás (terv)

```bash
cd backend
npm install
npm start