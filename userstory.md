# User Stories - Munyire Munkaruhakezelő Rendszer

Ez a dokumentum tartalmazza a rendszer összes felhasználói történetét (User Story), szerepkörök szerinti bontásban.

## Szerepkörök definíciója
*   **Dolgozó:** Alapfelhasználó, aki csak a saját adatait látja.
*   **Manager:** Raktáros/Vezető, aki kezeli a ruhakiadást, visszavételt és a rendeléseket.
*   **Admin:** Rendszergazda, teljes hozzáféréssel (felhasználók kezelése, törzsadatok).

---

## 1. Hitelesítés (Minden szerepkör)

### US-01: Bejelentkezés
**Mint** regisztrált felhasználó,  
**szeretnék** bejelentkezni a felhasználónevem és jelszavam megadásával,  
**azért, hogy** hozzáférjek a jogosultságaimnak megfelelő funkciókhoz.

*   **Akceptációs Kritériumok:**
    *   Helyes adatok esetén a rendszer léptessen be és irányítson a szerepkörömnek megfelelő kezdőoldalra.
    *   Helytelen adatok esetén jelenjen meg hibaüzenet ("Hibás felhasználónév vagy jelszó").
    *   A jelszó rejtett karakterekkel jelenjen meg beíráskor.

### US-02: Kijelentkezés
**Mint** bejelentkezett felhasználó,  
**szeretnék** kijelentkezni,  
**azért, hogy** más ne férhessen hozzá a fiókomhoz a gépemen.

*   **Akceptációs Kritériumok:**
    *   Kijelentkezés után a rendszer irányítson vissza a bejelentkezési képernyőre.
    *   A munkamenet (token) érvénytelenné váljon (vagy törlődjön a kliensről).

---

## 2. Dolgozó (Alapfunkciók)

### US-03: Saját adatok megtekintése
**Mint** Dolgozó,  
**szeretnék** hiba nélkül hozzáférni a saját profil adataimhoz (név, email, méretek),  
**azért, hogy** ellenőrizhessem, helyesek-e a nyilvántartott adataim.

*   **Akceptációs Kritériumok:**
    *   Látnom kell a nevemet, email címemet, telefonszámomat és munkakörömet.
    *   Nem láthatom és nem módosíthatom mások adatait.

### US-04: Saját kiadott ruhák megtekintése
**Mint** Dolgozó,  
**szeretnék** egy listát látni a nálam lévő munkaruhákról,  
**azért, hogy** tudjam, mivel kell elszámolnom.

*   **Akceptációs Kritériumok:**
    *   A lista tartalmazza a ruha típusát, méretét és a kiadás dátumát.
    *   Csak a "kint lévő" (vissza nem vett) ruhákat lássam alapértelmezetten.

---

## 3. Manager (Raktár és Folyamatok)

### US-05: Dashboard megtekintése
**Mint** Manager,  
**szeretnék** egy áttekintő vezérlőpultot látni bejelentkezéskor,  
**azért, hogy** gyorsan informálódjak a kritikus készletekről és nyitott feladatokról.

*   **Akceptációs Kritériumok:**
    *   Megjelenik az alacsony készletű ruhák listája.
    *   Látható a folyamatban lévő rendelések száma.

### US-06: Raktárkészlet megtekintése
**Mint** Manager,  
**szeretnék** kereshető listát a raktárban lévő ruhákról,  
**azért, hogy** tudjam, miből mennyi áll rendelkezésre.

*   **Akceptációs Kritériumok:**
    *   Szűrés típusra, méretre, nemre.
    *   Látható az aktuális `Mennyiseg` és `Minoseg`.

### US-07: Munkaruha kiadása (Készletcsökkentés)
**Mint** Manager,  
**szeretnék** rögzíteni egy ruhakiadást egy adott dolgozónak,  
**azért, hogy** a rendszerben naprakész legyen, kinél van a ruha.

*   **Akceptációs Kritériumok:**
    *   Kiválasztható a dolgozó és a ruha.
    *   Csak akkor engedje a rendszer, ha van készlet.
    *   Mentéskor csökkenjen a raktárkészlet 1-gyel.
    *   Létrejöjjön egy bejegyzés a `RuhaKiBe` táblában kiadási dátummal.

### US-08: Munkaruha visszavétele
**Mint** Manager,  
**szeretnék** visszavenni egy ruhát a dolgozótól és rögzíteni annak állapotát,  
**azért, hogy** a készletbe visszakerüljön vagy selejtezésre kerüljön.

*   **Akceptációs Kritériumok:**
    *   A dolgozónál lévő ruhák listájából kiválasztható a visszavétel.
    *   Kötelező megadni a visszavételi minőséget (pl. "Jó", "Sérült", "Selejt").
    *   A `RuhaKiBe` bejegyzés lezárul (VisszaDatum kitöltése).
    *   A `Raktar` készlet nő 1-gyel (a megadott minőséggel).

### US-09: Utánpótlás rendelés indítása
**Mint** Manager,  
**szeretnék** új rendelést rögzíteni hiányzó ruhákra,  
**azért, hogy** biztosítsam a jövőbeli ellátást.

*   **Akceptációs Kritériumok:**
    *   Rögzíthető a cikkszám és a rendelt mennyiség.
    *   A rendelés "Leadva" státusszal jön létre.

### US-10: Rendelés státuszának frissítése
**Mint** Manager,  
**szeretnék** egy rendelést "Teljesítve" státuszra állítani, amikor megérkezik az áru,  
**azért, hogy** a rendszer tudja, hogy a folyamat lezárult.

*   **Akceptációs Kritériumok:**
    *   Státuszváltáskor a rendszer kérdezze meg, hogy a beérkezett ruhákat adja-e hozzá a raktárkészlethez.
    *   Igen válasz esetén a készlet automatikusan növekedjen.

---

## 4. Adminisztrátor (Törzsadatok és Felhasználók)

### US-11: Új dolgozó felvétele
**Mint** Admin,  
**szeretnék** új dolgozót regisztrálni a rendszerbe (személyes adatok + belépési adatok),  
**azért, hogy** az új kolléga is használhassa a rendszert és ruhát kaphasson.

*   **Akceptációs Kritériumok:**
    *   Minden kötelező mező (Név, Email, Szerepkör) validálása.
    *   Egyedi felhasználónév ellenőrzése.
    *   Jelszó hash-elése mentés előtt.

### US-12: Dolgozó adatainak módosítása / törlése
**Mint** Admin,  
**szeretnék** meglévő dolgozói adatokat szerkeszteni vagy dolgozót inaktiválni,  
**azért, hogy** az adatbázis naprakész legyen (pl. kilépés esetén).

*   **Akceptációs Kritériumok:**
    *   Admin módosíthatja bárki jogosultságát (Szerepkör).
    *   Törlés helyett ajánlott az "Inaktív" státusz (ha az adatbázis támogatja), hogy a korábbi kiadások előzménye megmaradjon.

### US-13: Új ruhatípus létrehozása (Törzsadat)
**Mint** Admin,  
**szeretnék** új ruhatípust (Cikkszám, Fajta, Szín, Méret) felvenni,  
**azért, hogy** a raktárba lehessen készletet rendelni belőle.

*   **Akceptációs Kritériumok:**
    *   Egyedi Cikkszám ellenőrzése.
    *   Sikeres létrehozás után megjelenik a választható listákban.
