# Munyire – Munkaruhakezelő Rendszer

---

## 1. Bevezetés

A **Munyire** egy munkaruhakezelő rendszer, amely a dolgozóknak kiadott munkaruhák nyilvántartását, készletkezelését, kiadási/visszavételi folyamatát és rendelések kezelését biztosítja. A projekt célja egy stabil, biztonságos és kényelmesen használható felület létrehozása.

A rendszer első verziója egy weboldal, mely gyors, modern felhasználói élményt biztosít.

---

## 2. Szerepkörök és jogosultságok

### Manager
*   Dashboard megtekintése
*   Készlet megtekintése
*   Kiadás és visszavétel kezelése
*   Dolgozók ruháinak megtekintése
*   Rendelések létrehozása és módosítása
*   Egyszerű jelentések megtekintése

### Admin
*   Dolgozók kezelése (hozzáadás, módosítás, törlés)
*   Készlet teljes kezelése
*   Rendelések teljes körű kezelése
*   Haladó jelentések
*   Jogosultságok és rendszerlogok kezelése

---

## 3. Adatbázis felépítése

A rendszer végleges adatbázisterve az alábbi táblákból áll:

### `Ruhak`
*   `RuhaID` (PK)
*   `Fajta`
*   `Szin`
*   `Meret`
*   `Mennyiseg`
*   `Minoseg` (pl. 'Uj', 'Jo', 'Szakadt')

### `RuhaKiBe`
*   `RuhaKiBeID` (PK)
*   `DolgozoID` (FK)
*   `RuhaID` (FK)
*   `KiadasDatum`
*   `VisszaDatum`
*   `Mennyiseg`
*   `RuhaMinoseg` (visszavételkor)

### `Dolgozok`
*   `DolgozoID` (PK)
*   `DNev`
*   `Email`
*   `Telefonszam`
*   `Nem`
*   `Munkakor`
*   `Admin`
*   `FelhasznaloNev`
*   `JelszoHash`

### `Rendelesek`
*   `RendelesID` (PK)
*   `RuhaID` (FK)
*   `RDatum`
*   `Mennyiseg`
*   `Statusz` (pl. 'Leadva', 'Teljesítve')

---

## 4. Rendszer funkciók oldalanként

A weboldal lesz. Az alkalmazás fő moduljai:

*   **Dashboard**
*   **Készlet**
*   **Kiadás / Visszavétel**
*   **Dolgozók**
*   **Rendelések**
*   **Jelentések**
*   **Admin panel**

---

## 5. Design követelmények

*   Minimalista, modern dizájn
*   Mobilbarát (reszponzív)
*   Sötét/világos mód
*   SPA-alapú gyors működés

---

## 6. Biztonság

*   Jelszó hash-elés
*   Szerepkör-alapú jogosultságkezelés
*   Csak engedélyezett API végpontok használata

---

## 7. Backend Rendszer

A projekt REST API-ja a `backend` mappában található, és a következő technológiákkal készült:

*   **Node.js**
*   **Express.js** keretrendszer
*   **Sequelize** ORM
*   **SQLite** adatbázis

### Indítási Útmutató

1.  Lépj be a `backend` könyvtárba:
    ```sh
    cd backend
    ```
2.  Telepítsd a függőségeket (ezt csak az első alkalommal kell megtenni):
    ```sh
    npm install
    ```
3.  Indítsd el a szervert:
    ```sh
    npm start
    ```
Az API a `http://localhost:3001` címen fog futni. A részletes API végpont dokumentáció a `backend/BACKEND_DOCS.md` fájlban található.

