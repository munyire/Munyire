# Munyire – Jelentések nyomtatása + Továbbfejlesztési ötletek

## 2. Továbbfejlesztési ötletek 💡

Az alábbiakban **prioritás szerint** csoportosított további fejlesztési javaslatok:

### 🔴 Magas prioritás (Gyakorlati értékű funkciók)

| # | Funkció | Leírás |
|---|---|---|
| 1 | **Dolgozói ruha-átvételi lap nyomtatása** | A Tranzakciók oldalon gombot hozzáadni minden dolgozóhoz: kinyomtatható „Átvételi elismervény" aláírás hellyel | KESZ
| 2 | **Export CSV/Excel** | A jelentések adatainak exportálása `.csv` vagy `.xlsx` formátumba a böngészőből (SheetJS könyvtárral) | KESZ
| 3 | **Dolgozói ruhakiadási előzmények** | Dolgozó profiljánál lekérhető az összes eddigi kiadás/visszavétel előzménye | KESZ
| 4 | **Keresés/szűrés javítása** | Egységes szűrő rendszer minden oldalon (dátum tartomány, státusz, típus) | FIFTY FIFTY XD

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
