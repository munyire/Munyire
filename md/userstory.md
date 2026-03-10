# Felhasználói Történetek (User Stories) - Munyire (Üzleti Folyamatok)

Ez a dokumentum a szoftver által támogatott valós üzleti folyamatokat és felhasználói interakciókat mutatja be.

## 1. Munkavégzés megkezdése (Bejelentkezés)
A munkavállaló a műszak kezdésekor azonosítja magát a rendszerben. A **Bejelentkezés** oldalon megadja a felhasználónevét és jelszavát. A rendszer a jogosultsági szint alapján automatikusan a megfelelő kezdőképernyőre irányítja: az alapértelmezett munkavállalói profil esetén közvetlenül a **Ruháim** modul jelenik meg, elrejtve a komplexebb menüpontokat.

## 2. Saját eszközök és ruházat ellenőrzése (Ruháim)
A munkavállaló a **Ruháim** felületen navigáció nélkül, azonnal áttekintheti az aktuálisan hozzá rendelt munkaruhákat és védőfelszereléseket (pl. bakancs, póló). Ez lehetővé teszi a nyomon követhetőséget és az átvett eszközök ellenőrzését.

## 3. Vezetői áttekintés (Dashboard)
A raktárvezető vagy menedzser bejelentkezését követően az irányítópultra (**Dashboard**) érkezik. Itt a rendszer automatikusan kiemeli a figyelmet igénylő eseményeket és riasztásokat (pl. alacsony készletszint, legutóbbi tranzakciók), ezzel proaktívan támogatva a napi feladatok priorizálását.

## 4. Készletinformációk lekérdezése (Készlet)
Amikor egy munkavállaló új munkaruhát igényel, a raktáros a **Készlet** menüpontban ellenőrzi az elérhetőséget. A keresőmező használatával (pl. "kabát" kifejezésre szűrve) a táblázatos nézetben azonnal, valós időben láthatóvá válnak az aktuális raktárkészleti adatok.

## 5. Új terméktípus rögzítése a raktárban (Készlet)
Amikor egy teljesen új típusú védőfelszerelés vagy munkaruha érkezik (pl. új modell), az adminisztrátor a **Készlet** modulban felveszi az új cikket. Megadja a termék alapvető paramétereit (fajta, szín, méret, kezdőmennyiség és minőség), így az azonnal elérhetővé válik a kiadási folyamatokhoz.

## 6. Termékadatok módosítása vagy selejtezése (Készlet)
Amennyiben egy meglévő termék paraméterei megváltoznak, vagy egy ruházati cikk teljesen kikerül a forgalomból (pl. végleges selejtezés adminisztrációs okokból), a jogosult felhasználó módosíthatja vagy törölheti a cikk adatait a raktárnyilvántartásból a **Készlet** felületen.

## 7. Munkaruha kiadása (Tranzakciók / Kiadás)
Új munkavállaló érkezésekor vagy új eszköz igénylésekor a raktáros a **Tranzakciók** modul **Kiadás** funkcióját használja:
1. A legördülő listából kiválasztja az érintett munkavállalót.
2. A terméklistából kijelöli a kiadni kívánt eszközt (pl. védősisak).
3. A **Kiadás Rögzítése** gombbal véglegesíti a folyamatot.
A rendszer automatikusan levonja a tételt a raktárkészletből, és a munkavállaló profiljához rendeli a kiadott eszközt.

## 8. Munkaruha visszavétele (Tranzakciók / Visszavétel)
Amikor egy munkavállaló leadja a használt ruházatot, a raktáros az alábbi lépéseket követi:
1. A **Tranzakciók** modulban a **Visszavétel** fülre navigál.
2. A felületen listázva megjelennek a jelenleg kiadott eszközök.
3. Kiszűri az adott munkavállalót és a leadandó tételt.
4. A sor végén található **Visszavétel** gombra kattint.
5. A felugró ablakban rögzíti a visszaadott eszköz állapotát (pl. "Használt" vagy "Szakadt").
6. A **Visszavétel Rögzítése** gombbal lezárja a tranzakciót.

## 9. Készletpótlás és beszerzés (Rendelések)
Amennyiben a raktárvezető a Dashboardon vagy a készletellenőrzés során alacsony készletszintet tapasztal, a **Rendelések** modulba navigál, ahol új beszállítói megrendelést rögzít a hiányzó tételekre vonatkozóan (megadva a beszállítót, mennyiséget és megjegyzést).

## 10. Beérkezett rendelés átvétele és készletre vétele (Rendelések)
A megrendelt áru beérkezését követően a raktáros a **Rendelések** modulban kikeresi a függőben lévő tranzakciót, majd a rendelés teljesítése funkcióval jóváhagyja azt. A rendszer ekkor automatikusan megnöveli a raktárkészletet a beérkezett mennyiséggel, és lezártra állítja a megrendelést.

## 11. Új munkatárs rögzítése (Dolgozók)
Új belépő esetén az adminisztrátor vagy a megfelelő jogosultsággal rendelkező raktárvezető a **Dolgozók** menüpontban előzetesen felrögzíti a munkavállaló adatait és jogosultsági szintjét (szerepkörét). Ez biztosítja, hogy mire az új munkatárs a raktárba érkezik, a profilja már aktív és kiválasztható legyen.

## 12. Dolgozó adatainak módosítása (Dolgozók)
A munkavállaló adatainak változása (pl. telefonszám vagy pozíció csere) esetén az adminisztrátor a **Dolgozók** menüpontban frissíti a profilt, biztosítva a rendszer naprakészségét.

## 13. Munkavállaló inaktiválása vagy törlése (Dolgozók)
A munkaviszony megszűnésekor a jogosult felhasználó a **Dolgozók** menüpontban kikeresi az érintett személyt. A **Törlés** vagy **Inaktiválás** gombra kattintva, majd a döntést jóváhagyva eltávolítja a dolgozót az aktív listából.

## 14. Készletmozgások időszakos lekérdezése (Jelentések / Ruhakészlet alakulás)
Az adminisztrátor átfogó elemzésekhez a **Jelentések** menüpontot használja. A paraméterek megadásával a rendszer táblázatos formában, időbélyegekkel ellátva listázza a készletváltozásokat egy meghatározott időintervallumban.

## 15. Részletes vezetői jelentések generálása (Jelentések)
A menedzsment a **Jelentések** modulból kinyerheti az aktuális leltárjelentést, a havi forgalmi összesítőket, a ruhák állapot szerinti eloszlását, valamint dolgozónkénti statisztikákat, ezzel is elősegítve a stratégiai és költségvetési döntéshozatalt.

## 16. Biztonságos kijelentkezés (Kijelentkezés)
A munkavégzés befejeztével a felhasználó a menü **Kijelentkezés** funkciójával bontja a munkamenetet. A rendszer biztonsági okokból visszairányítja a bejelentkező felületre, megakadályozva az illetéktelen hozzáférést.
