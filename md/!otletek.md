# Munyire – Jelentések nyomtatása + Továbbfejlesztési ötletek

## Jelenlegi állapot

A Munyire rendszerben már létezik egy **Jelentések** (`ReportsView.vue`) modul 4 fül-lel:
- **Havi kiadások** – tételes lista dátum/dolgozó/ruha/ár bontásban
- **Éves kiadások** – havi bontású oszlopdiagram + táblázat
- **Féléves kiadások** – félév havi bontása diagrammal
- **Készlet érték** – raktárkészlet értéke ruhatípusonként

Jelenleg **nincs nyomtatási funkció** – a felhasználó nem tudja hivatalos formátumban kinyomtatni ezeket az adatokat.

---

## 1. Jelentések nyomtatása (hivatalos nyomtatványok)

### Megoldás: `@media print` CSS + dedikált nyomtatási nézet

A legegyszerűbb és legmegbízhatóbb megoldás a böngésző beépített `window.print()` funkcióját használni, de egy **dedikált, nyomtatásra optimalizált nézetet** generálni, amely hivatalos nyomtatvány formátumot követ.

### Hogyan működne:

1. **„Nyomtatás" gomb** minden jelentés tab-on
2. Gombra kattintva egy **nyomtatási előnézet** jelenik meg modálban, amely tartalmazza:
   - **Cégfejléc** (logó, cégnév, cím – konfigurálható)
   - **Jelentés címe** (pl. „Havi kiadási kimutatás – 2026. február")
   - **Táblázatos adatok** (fekete-fehér, tintatakarékos formátumban)
   - **Összesítő sor** (összeg)
   - **Lábléc** (dátum, generálta, oldalszám)
   - **Aláírás mező** (_____________________ sor)
3. A felhasználó a „Nyomtatás" gombra kattintva `window.print()`-tel nyomtathat
4. **`@media print`** CSS elrejti a navigációt, gombokat, és csak a nyomtatvány tartalmát mutatja

### Javasolt nyomtatvány-típusok:

| Nyomtatvány | Adattartalom |
|---|---|
| **Havi kiadási kimutatás** | Adott hónap összes ruhakiadása tételesen, összesítve |
| **Éves költségösszesítő** | 12 hónap bontásban, éves összeggel |
| **Féléves kimutatás** | 6 hónap bontásban |
| **Készletleltár** | Aktuális raktárkészlet mennyiség és érték szerint |
| **Dolgozói ruha-átvételi lap** | Egy adott dolgozó összes aktív ruhakiadása (aláírásra) |

### Proposed Changes

#### [MODIFY] [ReportsView.vue](file:///c:/Users/iseka/Documents/Munyire/frontend/src/views/ReportsView.vue)

- Minden tab-ra **„🖨️ Nyomtatás"** gomb hozzáadása
- Nyomtatási előnézet modál komponens
- `@media print` CSS blokk: elrejti a sidebar-t, header-t, gombokat; csak a nyomtatvány tartalmát mutatja
- Hivatalos formátum: fejléc, cím, táblázat, összesítés, aláírás mező, lábléc

#### [NEW] [PrintTemplate.vue](file:///c:/Users/iseka/Documents/Munyire/frontend/src/components/PrintTemplate.vue)

- Újrafelhasználható nyomtatási sablon komponens
- Props-ként kapja: `title`, `subtitle`, `period`, `data`, `columns`, `summary`, `type`
- Fejléc: „Munyire – Munkaruhakezelő Rendszer" + dátum
- Lábléc: generálás dátuma + aláírási mező

---

## 2. Továbbfejlesztési ötletek 💡

Az alábbiakban **prioritás szerint** csoportosított további fejlesztési javaslatok:

### 🔴 Magas prioritás (Gyakorlati értékű funkciók)

| # | Funkció | Leírás |
|---|---|---|
| 1 | **Dolgozói ruha-átvételi lap nyomtatása** | A Tranzakciók oldalon gombot hozzáadni minden dolgozóhoz: kinyomtatható „Átvételi elismervény" aláírás hellyel |
| 2 | **Export CSV/Excel** | A jelentések adatainak exportálása `.csv` vagy `.xlsx` formátumba a böngészőből (SheetJS könyvtárral) |
| 3 | **Dolgozói ruhakiadási előzmények** | Dolgozó profiljánál lekérhető az összes eddigi kiadás/visszavétel előzménye |
| 4 | **Keresés/szűrés javítása** | Egységes szűrő rendszer minden oldalon (dátum tartomány, státusz, típus) |

### 🟡 Közepes prioritás (Használhatóság javítása)

| # | Funkció | Leírás |
|---|---|---|
| 5 | **Értesítési rendszer** | Figyelmeztető értesítések: alacsony készlet, lejárt kiadás, teljesítendő rendelés – nem email, hanem app-on belüli jelzés |
| 6 | **Dashboard grafikonok bővítése** | Tortadiagram a ruhatípusok eloszlásáról, vonaldiagram a havi kiadások trendjéről |
| 7 | **Batch műveletek** | Több dolgozónak egyszerre ruha kiadása (pl. új csapat felszerelése) |
| 8 | **Ruha csere-workflow** | „Csere" gomb: egylépéses visszavétel + új kiadás (régi kopott ruha → új) |

### 🟢 Jövőbeni fejlesztések

| # | Funkció | Leírás |
|---|---|---|
| 9 | **Audit log** | Ki, mikor, mit módosított a rendszerben (pl. kiadás, törlés) |
| 10 | **Jelszó-visszaállítás** | „Elfelejtett jelszó" funkció email-es visszaállítással |
| 11 | **Többnyelvűség (i18n)** | Magyar + angol nyelv támogatása |
| 12 | **Sötét/világos mód váltó** | A rendszerbeállításon kívüli manuális témaváltó |
| 13 | **Widget-es kezdőlap** | Testreszabható Dashboard: a felhasználó kiválaszthatja, mely statisztikákat látja |
| 14 | **Barcode/QR kód** | Ruha cikkszámhoz QR kód generálás, amit a raktárban be lehet olvasni |

---

## Verification Plan

### Browser-tesztelés
1. Backend + Frontend indítása (`npm run dev`)
2. Bejelentkezés Manager/Admin felhasználóval
3. Jelentések oldal megnyitása
4. Minden tab-on a „Nyomtatás" gomb megnyomása
5. Ellenőrzés: nyomtatási előnézet megjelenik-e hivatalos formátumban
6. `Ctrl+P` működik-e, a nyomtatvány tartalmazza-e a fejlécet, láblécet, aláírás mezőt
7. A nyomtatványon NEM jelennek meg a navigációs elemek

### Manual Verification
- A felhasználó megnyitja a Jelentések → Havi kiadások fület
- Rákattint a „Nyomtatás" gombra
- PDF-be nyomtat és ellenőrzi, hogy a hivatalos formátum megfelelő-e
