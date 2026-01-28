# Munyire – Felhasználói Leírás

## Bevezetés

A **Munyire** egy komplex munkaruhakezelő rendszer, amely átfogó megoldást nyújt a dolgozók munkaruházatának nyilvántartására, kezelésére és adminisztrációjára. A rendszer célja, hogy egyszerűsítse a munkaruhák kiadásának, visszavételének és készletgazdálkodásának folyamatát, miközben szerepkör-alapú hozzáférés-kezeléssel biztosítja a megfelelő jogosultságokat minden felhasználói csoport számára.

## Célközönség

A rendszert három különböző felhasználói csoport használja:

### 1. Dolgozók
Alapfelhasználók, akik:
- Megtekinthetik saját adataikat
- Ellenőrizhetik, mely munkaruhák vannak náluk
- Nem férnek hozzá mások adataihoz

### 2. Managerek (Raktárosok/Vezetők)
Középszintű jogosultsággal rendelkező felhasználók, akik:
- Kezelik a ruhakiadást és visszavételt
- Nyomon követik a készleteket
- Rendeléseket indíthatnak
- Megtekinthetik a dolgozók ruhaadatait
- Hozzáférnek a dashboard statisztikákhoz

### 3. Adminisztrátorok
Teljes jogosultságú felhasználók, akik:
- Felhasználókat kezelnek (létrehozás, módosítás)
- Törzsadatokat kezelnek (új ruhatípusok létrehozása)
- Teljes hozzáféréssel rendelkeznek a rendszer minden funkciójához

## Fő funkciók

### Autentikáció és biztonság

#### Bejelentkezés
A rendszer biztonságos, token-alapú bejelentkezést használ (JWT). Minden felhasználó egyedi felhasználónévvel és jelszóval lép be. A rendszer a következő biztonsági intézkedéseket alkalmazza:

- **Jelszó védelem**: A jelszavak titkosítva (bcrypt hash) tárolódnak az adatbázisban
- **Session kezelés**: JWT token-alapú munkamenet-kezelés
- **Szerepkör-alapú hozzáférés**: Minden funkció csak a megfelelő jogosultsággal érhető el
- **Automatikus kijelentkezés**: Inaktivitás vagy token lejárat esetén

#### Jogosultságkezelés
A rendszer három szerepkört különböztet meg (Dolgozó, Manager, Admin), és minden funkció, oldal csak a megfelelő jogosultsággal rendelkezőknek érhető el. Ha egy felhasználó megpróbál hozzáférni egy számára nem elérhető funkcióhoz, automatikusan átirányítódik.

---

### Dashboard (Manager, Admin)

A vezérlőpult gyors áttekintést nyújt a kritikus információkról:

**Statisztikák:**
- Dolgozók száma a rendszerben
- Összes munkaruha a raktárban
- Kiadott ruhák száma
- Folyamatban lévő rendelések

**Grafikon:**
- Top 5 legnépszerűbb munkaruha típus

**Figyelmeztetések:**
- Alacsony készletű ruhák listája (10 darab alatt)
- Sürgős rendelések

Ez az oldal segít a vezetőknek és managereknek gyorsan azonosítani a problémás területeket és szükséges intézkedéseket.

---

### Készletkezelés (Inventory)

#### Jogosultságok
- **Manager**: Megtekintés és szűrés
- **Admin**: Teljes körű kezelés (létrehozás, módosítás, törlés)

#### Funkciók

**Készlet áttekintése:**
A rendszer részletes áttekintést nyújt az összes munkaruha típusról:
- Cikkszám (egyedi 7-jegyű azonosító)
- Típus (pl. Nadrág, Ing, Védőruha)
- Szín
- Méret (XS, S, M, L, XL, XXL, XXXL)
- Mennyiség minőség szerint (Új, Jó, Használt)

**Szűrés és keresés:**
- Keresés cikkszám, típus, szín vagy méret szerint
- Valós idejű keresés a táblázatban

**Új ruhatípus létrehozása (Admin):**
1. Típus megadása (pl. Védőnadrág)
2. Szín kiválasztása
3. Méret kiválasztása
4. Kezdő mennyiség és minőség megadása
5. A rendszer automatikusan generál egy 7-jegyű egyedi cikkszámot

**Törlés (Admin):**
- Egy ruhatípus törölhető, ha nincs aktív kiadás belőle
- A törlés előtt megerősítés szükséges

**Fontos:** A cikkszám egy ruhatípust azonosít (pl. "fekete M-es nadrág"). Ha ugyanabból a típusból több minőségi kategória van (Új, Jó, Használt), azok külön sorokként jelennek meg.

---

### Dolgozók kezelése (Workers)

#### Jogosultságok
- **Manager**: Dolgozók listájának megtekintése, keresés
- **Admin**: Teljes körű kezelés (új dolgozó regisztrációja, módosítás, törlés)

#### Funkciók

**Dolgozók listája:**
- Név, Email, Telefonszám, Nem, Munkaköre, Szerepkör
- Avatar képek a nemnek és szerepkörnek megfelelően
- Keresés név, email vagy telefonszám alapján

**Új dolgozó regisztrációja (Admin):**
1. Személyes adatok megadása (Név, Email, Telefonszám, Nem)
2. Munkaköre megadása
3. Szerepkör kiválasztása (Dolgozó, Manager vagy Admin)
4. Felhasználónév és jelszó megadása
5. A rendszer validálja az egyedi felhasználónevet
6. Sikeres regisztráció után a dolgozó azonnal bejelentkezhet

**Dolgozó adatainak módosítása (Admin):**
- Személyes adatok frissítése
- Szerepkör megváltoztatása
- Jelszó módosítása (titkosítva kerül mentésre)

**Törlés (Admin):**
- Dolgozó törlése a rendszerből
- Figyelem: Ha a dolgozónál van kiadott ruha, először azokat vissza kell venni!

---

### Ruhakiadás és Visszavétel (Transactions)

#### Jogosultságok
- **Manager és Admin**: Teljes körű hozzáférés

Ez az oldal a munkaruhák kiadásának és visszavételének központi kezelőfelülete.

#### Aktív kiadások listája

**Megjelenített információk:**
- Dolgozó neve
- Ruha típusa, színe, mérete, cikkszáma
- Kiadás dátuma
- Kiadás indoka/megjegyzése
- Mennyiség

**Szűrés:**
- Dolgozó neve szerint
- Ruha típusa szerint
- Kiadás dátuma szerint

#### Munkaruha kiadása

**Folyamat:**
1. "Új Kiadás" gomb megnyomása
2. Dolgozó kiválasztása (kereshető legördülő lista)
3. Ruha kiválasztása (kereshető legördülő lista, amely mutatja a típust, színt, méretet és a rendelkezésre álló készletet)
4. Mennyiség megadása (alapértelmezetten 1)
5. Kiadás indokának megadása (pl. "Új belépő", "Csere", "Pótlás")
6. Mentés

**Validáció:**
- A rendszer ellenőrzi, hogy van-e elegendő készlet
- Ha nincs elég készlet, hibaüzenet jelenik meg
- Sikeres kiadás után a raktárkészlet automatikusan csökken

#### Munkaruha visszavétele

**Folyamat:**
1. Az aktív kiadások listájából a "Visszavétel" gomb megnyomása
2. Visszavételi minőség megadása:
   - **Új**: Változatlan állapot
   - **Jó**: Használt, de jó állapotú
   - **Használt**: Láthatóan használt
   - **Kopott**: Erősen használt
   - **Szakadt/Sérült**: Megrongálódott
   - **Selejt**: Használhatatlan
3. Visszavétel megerősítése

**Következmények:**
- A kiadás lezárul (VisszaDatum kitöltése)
- A ruha visszakerül a raktárba a megadott minőségi kategóriába
- A raktárkészlet automatikusan nő

---

### Rendelések (Orders)

#### Jogosultságok
- **Manager és Admin**: Rendelések létrehozása, megtekintése és teljesítése

#### Funkciók

**Rendelések listája:**
- Cikkszám és ruha részletei (típus, szín, méret)
- Rendelés dátuma
- Rendelt mennyiség
- Státusz (Leadva, Teljesítve, Lemondva)

**Új rendelés leadása:**
1. "Új Rendelés" gomb megnyomása
2. Ruha kiválasztása (kereshető legördülő lista)
3. Mennyiség megadása
4. Mentés

Az új rendelés automatikusan "Leadva" státusszal jön létre.

**Rendelés teljesítése:**
1. A "Leadva" státuszú rendelés mellett a "Teljesít" gomb megnyomása
2. A rendszer automatikusan:
   - Megváltoztatja a státuszt "Teljesítve"-re
   - Hozzáadja a rendelt mennyiséget a raktárkészlethez "Új" minőségben
3. A folyamat egyszerűsíti a készletutánpótlást

---

### Saját Ruháim (My Clothes)

#### Jogosultságok
- **Minden szerepkör**: Csak a saját kiadott ruháit láthatja

Ez az oldal lehetővé teszi a dolgozók számára, hogy nyomon kövessék, mely munkaruhák vannak jelenleg náluk.

**Megjelenített információk:**
- Ruha típusa, színe, mérete, cikkszáma
- Kiadás dátuma
- Kiadás indoka
- Mennyiség

**Fontos:** A dolgozók csak megtekinthetik ezeket az adatokat, nem módosíthatják. A visszavételt csak Manager vagy Admin végezheti el.

---

## Felhasználói Forgatókönyvek

### Példa 1: Új dolgozó belépése (Admin)

1. Admin bejelentkezik a rendszerbe
2. Navigál a "Dolgozók" menüpontra
3. "Új Dolgozó" gombra kattint
4. Kitölti az új dolgozó adatait:
   - Név: Kiss János
   - Email: kiss.janos@ceg.hu
   - Telefonszám: +36301234567
   - Nem: Férfi
   - Munkaköre: Raktáros
   - Szerepkör: Dolgozó
   - Felhasználónév: kissjanos
   - Jelszó: Biztonságos123!
5. Ment
6. A rendszer visszajelzést ad a sikeres regisztrációról
7. Kiss János már be tud jelentkezni a rendszerbe

### Példa 2: Munkaruha kiadása (Manager)

1. Manager bejelentkezik
2. Navigál a "Kiadás/Visszavétel" menüpontra
3. "Új Kiadás" gombra kattint
4. Kiválasztja Kiss Jánost a dolgozók közül
5. Kiválasztja a szükséges ruhát (pl. Védőnadrág, Fekete, M méret)
6. Mennyiség: 2
7. Indok: "Új belépő felszerelése"
8. Ment
9. A rendszer csökkenti a raktárkészletet 2 darabbal
10. A kiadás megjelenik az aktív kiadások listájában

### Példa 3: Alacsony készlet kezelése (Manager)

1. Manager a Dashboard-on észreveszi, hogy a "Védőnadrág Fekete M" készlete 5 darab alá esett
2. Navigál a "Rendelések" menüpontra
3. "Új Rendelés" gombra kattint
4. Kiválasztja a Védőnadrág Fekete M-et
5. Mennyiség: 20
6. Ment
7. A rendelés "Leadva" státusszal létrejön
8. Amikor a rendelés megérkezik, a Manager a "Teljesít" gombra kattint
9. A rendszer automatikusan növeli a készletet 20 darabbal "Új" minőségben

### Példa 4: Dolgozó ellenőrzi a saját ruháit (Dolgozó)

1. Kiss János bejelentkezik dolgozóként
2. Navigál a "Saját Ruháim" menüpontra
3. Látja, hogy nála van:
   - 2 db Védőnadrág, Fekete, M méret (kiadva 2024.01.15-én)
4. Ellenőrzi, hogy minden ruha megvan-e
5. Ha visszaad valamit, a Manager rögzíti a visszavételt a "Kiadás/Visszavétel" oldalon

---

## Rendszerkövetelmények

### Frontend (Kliens oldal)
- Modern webböngésző (Chrome, Firefox, Edge, Safari)
- JavaScript engedélyezése
- Internet kapcsolat

### Backend (Szerver oldal)
- Node.js környezet
- SQLite adatbázis

---

## Gyakori Kérdések (FAQ)

**K: Mit tegyek, ha elfelejtettem a jelszavamat?**  
V: Jelenleg jelszó-visszaállítási funkció nincs implementálva. Kérj segítséget az adminisztrátoroktól.

**K: Miért nem látom az összes dolgozó adatait?**  
V: A Dolgozó szerepkörrel csak a saját adataidat láthatod. A Manager és Admin jogosultság szükséges mások adatainak megtekintéséhez.

**K: Mit jelent a "Cikkszám"?**  
V: A cikkszám egy 7-jegyű egyedi azonosító, amely egy konkrét ruhatípust jelöl (típus + szín + méret kombinációja).

**K: Hogyan tudom törölni egy dolgozó adatait?**  
V: Csak Admin jogosultsággal törölhetsz dolgozót. Fontos: először minden nála lévő ruhát vissza kell venni!

**K: Mi történik, ha egy ruhát "Selejt" minőséggel veszek vissza?**  
V: A ruha visszakerül a raktárba "Selejt" minőségben. Később Admin jogosultsággal törölhető vagy új rendelés leadható helyette.

**K: Hogyan működik a "Teljesít" gomb a rendeléseknél?**  
V: A teljesítés egyszerre két dolgot tesz: megváltoztatja a rendelés státuszát "Teljesítve"-re ÉS automatikusan hozzáadja a rendelt mennyiséget a raktárkészlethez "Új" minőségben.

---

## Támogatás

Ha bármilyen kérdésed vagy problémád van a rendszer használatával kapcsolatban, fordulj bizalommal az adminisztrátorokhoz vagy a rendszer fejlesztőjéhez.

---

## Verzióinformáció

**Verzió:** 1.0  
**Utolsó frissítés:** 2025. január  
**Státusz:** Aktív fejlesztés alatt (Szakközépiskolai kimeneti vizsga projekt)

---

*Ez a dokumentum a Munyire Munkaruhakezelő Rendszer hivatalos felhasználói leírása. A rendszer folyamatosan fejlődik, ezért a funkciók változhatnak.*
