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

A rendszer kész, végleges adatbázisterve az alábbi táblákból áll:

### `Ruhak`
*   `KID`
*   `Fajta`
*   `Szin`
*   `Meret`
*   `Mennyiség`

### `RuhaKiBe`
*   `KiadasID`
*   `DID`
*   `KID`
*   `KiadasDatum`
*   `VisszaDatum`
*   `Mennyiség`

### `Dolgozok`
*   `DID`
*   `DNev`
*   `Email`
*   `Telefonszam`
*   `Nem`
*   `Munkakor`
*   `Admin`
*   `FelhasznaloNev`
*   `JelszoHash`

### `Rendelesek`
*   `RID`
*   `KID`
*   `RDatum`
*   `Mennyiseg`

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
