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
- Pénzügyi jelentéseket generálhatnak (havi, éves, féléves kiadások; készlet érték)

### 3. Adminisztrátorok
Teljes jogosultságú felhasználók, akik:
- Felhasználókat kezelnek (létrehozás, módosítás, törlés)
- Törzsadatokat kezelnek (új ruhatípusok, árak)
- Teljes hozzáféréssel rendelkeznek a rendszer minden funkciójához

## Fő funkciók

### Autentikáció és biztonság

#### Bejelentkezés
A rendszer biztonságos, token-alapú bejelentkezést használ (JWT). Minden felhasználó egyedi felhasználónévvel és jelszóval lép be. A rendszer az alábbi biztonsági intézkedéseket alkalmazza:

- **Jelszó védelem**: A jelszavak titkosítva (bcrypt hash) tárolódnak
- **Session kezelés**: JWT token-alapú munkamenet-kezelés
- **Szerepkör-alapú hozzáférés**: Minden funkció csak a megfelelő jogosultsággal érhető el
- **Automatikus kijelentkezés**: Inaktivitás vagy token lejárat esetén
- **HTTP biztonság**: Helmet middleware és rate limiting (max. 100 kérés / 15 perc)

#### Jogosultságkezelés
A rendszer három szerepkört különböztet meg (Dolgozó, Manager, Admin). Ha egy felhasználó megpróbál hozzáférni egy számára nem elérhető funkcióhoz, automatikusan átirányítódik.

---

### Dashboard (Manager, Admin)

A vezérlőpult gyors áttekintést nyújt a kritikus információkról:

**Statisztikák (KPI kártyák):**
- Dolgozók száma a rendszerben
- Összes munkaruha a raktárban
- Kiadott ruhák száma
- Folyamatban lévő rendelések

**Grafikon:**
- Top 5 legnépszerűbb munkaruha típus (leggyakrabban kiadott)

**Figyelmeztetések:**
- Alacsony készletű ruhák listája (10 darab alatt)
- Sürgős rendelések

---

### Készletkezelés (Inventory)

#### Jogosultságok
- **Manager**: Megtekintés és szűrés
- **Admin**: Teljes körű kezelés (létrehozás, módosítás, törlés)

#### Funkciók

**Készlet áttekintése:**
A rendszer részletes áttekintést nyújt az összes munkaruha típusról:
- Cikkszám (egyedi 7-jegyű azonosító, automatikusan generált)
- Típus (pl. Nadrág, Ing, Védőruha)
- Szín
- Méret (XS, S, M, L, XL, XXL, XXXL)
- **Ár** (egységár Ft-ban)
- Mennyiség minőség szerint (Új, Jó, Használt, Kopott, Szakadt/Sérült, Selejt)

**Szűrés és keresés:**
- Keresés cikkszám, típus, szín vagy méret szerint
- Valós idejű keresés a táblázatban

**Új ruhatípus létrehozása (Admin):**
1. Típus megadása (pl. Védőnadrág)
2. Szín kiválasztása
3. Méret kiválasztása
4. **Ár megadása** (egységár Ft-ban)
5. Kezdő mennyiség és minőség megadása
6. A rendszer automatikusan generál egy 7-jegyű egyedi cikkszámot

**Törlés (Admin):**
- Csak az adott **minőségű** tétel törlődik (szelektív törlés)
- A törlés előtt egyedi modális megerősítés szükséges

**Fontos:** A cikkszám egy ruhatípust azonosít (pl. „fekete M-es nadrág"). Ha ugyanabból a típusból több minőségi kategória van (Új, Jó, Használt), azok külön sorokként jelennek meg.

---

### Dolgozók kezelése (Workers)

#### Jogosultságok
- **Manager**: Dolgozók listájának megtekintése, keresés
- **Admin**: Teljes körű kezelés (új dolgozó regisztrációja, módosítás, törlés)

#### Funkciók

**Dolgozók listája:**
- Név, Email, Telefonszám, Nem, Munkakör, Szerepkör
- Avatar képek a nemnek és szerepkörnek megfelelően
- Keresés **név, email, telefonszám, munkakör és szerepkör** alapján

**Új dolgozó regisztrációja (Admin):**
1. Személyes adatok megadása (Név, Email, Telefonszám, Nem)
2. Munkakör megadása
3. Szerepkör kiválasztása (Dolgozó, Manager vagy Admin)
4. Felhasználónév és jelszó megadása
5. A rendszer validálja az egyedi felhasználónevet és email-t
6. Sikeres regisztráció után a dolgozó azonnal bejelentkezhet

**Dolgozó adatainak módosítása (Admin):**
- Személyes adatok frissítése
- Szerepkör megváltoztatása
- Jelszó módosítása (titkosítva kerül mentésre)

**Törlés (Admin):**
- Dolgozó törlése megerősítő modál után
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
- Ruha típusa szerint (kétirányú keresés)
- Kiadás dátuma szerint

#### Munkaruha kiadása

1. „Új Kiadás" gomb megnyomása
2. Dolgozó kiválasztása (kereshető legördülő lista)
3. Ruha kiválasztása (kereshető lista – mutatja a típust, színt, méretet, rendelkezésre álló készletet és egységárat)
4. Mennyiség megadása (alapértelmezetten 1)
5. Kiadás indokának megadása (pl. „Új belépő", „Csere", „Pótlás")
6. Mentés

**Validáció:**
- A rendszer ellenőrzi, hogy van-e elegendő készlet
- Ha nincs elég készlet, hibaüzenet jelenik meg
- Sikeres kiadás után a raktárkészlet automatikusan csökken

#### Munkaruha visszavétele

1. Az aktív kiadások listájából a „Visszavétel" gomb megnyomása
2. Visszavételi minőség megadása:
   - **Új**: Változatlan állapot
   - **Jó**: Használt, de jó állapotú
   - **Használt**: Láthatóan használt
   - **Kopott**: Erősen használt
   - **Szakadt/Sérült**: Megrongálódott
   - **Selejt**: Használhatatlan
3. Visszavétel megerősítése

**Következmények:**
- A kiadás lezárul (`VisszaDatum` kitöltve)
- A ruha visszakerül a raktárba a megadott minőségi kategóriába
- A raktárkészlet automatikusan nő

---

### Rendelések (Orders)

#### Jogosultságok
- **Manager és Admin**: Rendelések létrehozása, megtekintése és teljesítése

#### Funkciók

**Rendelések listája:**
- Cikkszám és ruha részletei (típus, szín, méret, ár)
- Rendelés dátuma
- Rendelt mennyiség
- Státusz (Leadva, Teljesítve, Lemondva)

**Új rendelés leadása:**
1. „Új Rendelés" gomb megnyomása
2. Ruha kiválasztása (kereshető legördülő lista)
3. Mennyiség megadása
4. Mentés (modális megerősítéssel)

Az új rendelés automatikusan „Leadva" státusszal jön létre.

**Rendelés teljesítése:**
1. A „Leadva" státuszú rendelés mellett a „Teljesít" gomb megnyomása
2. A rendszer automatikusan:
   - Megváltoztatja a státuszt „Teljesítve"-re
   - Hozzáadja a rendelt mennyiséget a raktárkészlethez „Új" minőségben

---

### Jelentések (Reports) – Manager, Admin

A Jelentések oldalon pénzügyi kimutatások és készletjelentések generálhatók. Az oldal négy fület tartalmaz:

#### 1. Havi kiadások
Egy adott hónap összes ruhakiadásának részletes listája:
- Kiadás dátuma
- Dolgozó neve
- Ruha fajta
- Mennyiség
- Egységár
- Sor-szintű összeg
- **Havi összesítő (Ft-ban)**

#### 2. Éves kiadások
Egy teljes év kiadási összesítője:
- Havi bontás (sávdiagram)
- Táblázatos havi összesítők
- **Éves összes kiadás**

#### 3. Féléves kiadások
I. félév (Jan–Jún) vagy II. félév (Júl–Dec):
- Sávdiagram havi bontásban
- **Féléves összes kiadás**

#### 4. Készlet érték
A jelenleg raktáron lévő ruhák összértéke:
- Fajtánkénti érték és darabszám táblázata
- **Teljes készlet érték Ft-ban**

#### Exportálás
- 🖨️ **Nyomtatás gomb**: Nyomtatási előnézet modálból közvetlen böngészős nyomtatás
- 📥 **CSV Export gomb**: Az aktív jelentés letöltése Excel-kompatibilis CSV formátumban

---

### Saját Ruháim (My Clothes)

#### Jogosultságok
- **Minden szerepkör**: Csak a saját kiadott ruháit láthatja

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
2. Navigál a „Dolgozók" menüpontra
3. „Új Dolgozó" gombra kattint
4. Kitölti az adatokat:
   - Név: Kiss János
   - Email: kiss.janos@ceg.hu
   - Telefonszám: +36301234567
   - Nem: Férfi
   - Munkakör: Raktáros
   - Szerepkör: Dolgozó
   - Felhasználónév: kissjanos
   - Jelszó: Biztonságos123!
5. Ment → rendszer visszajelzést ad
6. Kiss János már be tud jelentkezni

### Példa 2: Munkaruha kiadása (Manager)

1. Manager bejelentkezik
2. Navigál a „Kiadás/Visszavétel" menüpontra
3. „Új Kiadás" gombra kattint
4. Kiválasztja Kiss Jánost
5. Kiválasztja: Védőnadrág, Fekete, M méret (ár: 8 500 Ft/db)
6. Mennyiség: 2
7. Indok: „Új belépő felszerelése"
8. Ment → raktárkészlet 2 darabbal csökken, kiadás megjelenik a listában

### Példa 3: Alacsony készlet kezelése (Manager)

1. Dashboard-on: „Védőnadrág Fekete M" készlet 5 db alá esett
2. Navigál a „Rendelések" menüpontra
3. „Új Rendelés" → Védőnadrág Fekete M, mennyiség: 20
4. Ment → rendelés „Leadva" státusszal létrejön
5. Áruátvételkor: „Teljesít" gomb → készlet +20 db „Új" minőségben

### Példa 4: Pénzügyi kimutatás (Manager)

1. Manager navigál a „Jelentések" menüpontra
2. Kiválasztja a „Havi kiadások" fület
3. Beállítja: 2026. január
4. Látja az összes januári ruhakiadást tételenként, egységárakkal és összegekkel
5. Lekattint a „CSV Export" gombra → Excel-kompatibilis fájl letöltődik

### Példa 5: Dolgozó ellenőrzi a saját ruháit (Dolgozó)

1. Kiss János bejelentkezik
2. Navigál a „Saját Ruháim" menüpontra
3. Látja: 2 db Védőnadrág, Fekete, M méret (kiadva 2026.01.15-én)
4. Ha visszaad valamit, a Manager rögzíti a visszavételt

---

## Rendszerkövetelmények

### Frontend (Kliens oldal)
- Modern webböngésző (Chrome, Firefox, Edge, Safari – legújabb verzió)
- JavaScript engedélyezése
- Internet kapcsolat (helyi hálózaton futtatáshoz belső LAN)

### Backend (Szerver oldal)
- Node.js ≥ 18
- SQLite adatbázis (fájl alapú, telepítés nem szükséges)
- Elegendő tárhely az adatbázis fájlhoz

---

## Gyakori Kérdések (FAQ)

**K: Mit tegyek, ha elfelejtettem a jelszavamat?**  
V: Jelenleg jelszó-visszaállítási funkció nincs implementálva. Kérj segítséget az adminisztrátoroktól, aki módosíthatja a jelszót.

**K: Miért nem látom az összes dolgozó adatait?**  
V: Dolgozó szerepkörrel csak a saját adataidat láthatod. Manager és Admin jogosultság szükséges mások adatainak megtekintéséhez.

**K: Mit jelent a „Cikkszám"?**  
V: A cikkszám egy 7-jegyű egyedi azonosító, amely egy konkrét ruhatípust jelöl (típus + szín + méret kombinációja). Automatikusan generálódik.

**K: Hogyan tudom törölni egy dolgozó adatait?**  
V: Csak Admin jogosultsággal törölhetsz dolgozót. Fontos: először minden nála lévő ruhát vissza kell venni!

**K: Mi történik, ha egy ruhát „Selejt" minőséggel veszek vissza?**  
V: A ruha visszakerül a raktárba „Selejt" minőségben. Később Admin törölheti, vagy új rendelés adható le helyette.

**K: Hogyan működik a „Teljesít" gomb a rendeléseknél?**  
V: Egyszerre két dolgot tesz: megváltoztatja a státuszt „Teljesítve"-re ÉS automatikusan hozzáadja a rendelt mennyiséget a raktárkészlethez „Új" minőségben.

**K: Mit jelent az „Ár" mező a készletnél?**  
V: Az egységárat jelenti Ft-ban. A pénzügyi jelentések ezt az árat használják a kiadások értékének kiszámításához (egységár × kiadott mennyiség).

**K: Hogyan tudok CSV-t exportálni?**  
V: A „Jelentések" oldalon válaszd ki a kívánt riporttípust és időszakot, majd kattints a „CSV Export" gombra. A letöltött fájl Excel-ben megnyitható.

---

## Támogatás

Ha bármilyen kérdésed vagy problémád van a rendszer használatával kapcsolatban, fordulj bizalommal az adminisztrátorokhoz vagy a rendszer fejlesztőjéhez.

---

## Verzióinformáció

**Verzió:** 2.0  
**Utolsó frissítés:** 2026. február  
**Státusz:** Aktív – szakközépiskolai kimeneti vizsga projekt  

### Változásnapló

| Verzió | Dátum | Változások |
|--------|-------|-----------|
| 1.0 | 2025. január | Alapfunkciók: auth, készlet, kiadás/visszavétel, rendelések, dolgozók |
| 2.0 | 2026. február | Pénzügyi modul (árak, havi/éves/féléves/készlet-érték riportok), nyomtatás, CSV export, biztonsági frissítések |

---

*Ez a dokumentum a Munyire Munkaruhakezelő Rendszer hivatalos felhasználói leírása.*
