# 🚀 Fejlesztési Feladatlista (Backlog)

## 📊 Dashboard
- [x] **Raktárkészlet összesítés:** A mutató az összes ruha **darabszámát** összegezze a különböző fajták száma helyett.

---

## 📦 Készletkezelés
- [x] **Egységes UI:** A keresődoboz és az "Új termék felvétele" box legyen azonos méretű.
- [x] **UX javítás:** A törlés megerősítése ne böngészős `alertbox`-ban, hanem egyedi modálban jelenjen meg.
- [x] **Szelektív törlés:** Törlésnél ne a teljes termék törlődjön, hanem **csak az adott minőségű** tétel.
- [x] **Logikai összefűzés:** Módosításkor, ha megváltozik a minőség, a rendszer adja hozzá a darabszámot a már meglévő, azonos minőségű rekordhoz.

---

## 👥 Dolgozók kezelése
- [x] **Box méretezés:** Az "Új dolgozók" és a "Dolgozók száma" dobozok legyenek egyforma méretűek.
- [x] **Profilkép kezelés:** Dolgozói képek funkció törlése(Ne legyenek a  dolgozóknak képeik).
- [x] **Bővített keresés:** Keresési lehetőség hozzáadása **munkakör** és **szerepkör** alapján is.

---

## 🔄 Tranzakciók & Rendelések
### Visszavétel
- [x] **Kétirányú keresés:** Lehessen keresni dolgozó neve és ruha típusa alapján is a visszavételi listában.

### Rendelés
- [x] **UI szinkron:** A keresődoboz és az "Új rendelés felvétele" box legyen azonos méretű.
- [x] **Visszajelzés:** Az átvétel gomb ne `alertbox`-ot használjon a megerősítéshez.
- [x] **Visszajelzés:** Az uj rendelés leadása gomb ne `alertbox`-ot használjon.

---

## 🌙 UI / Megjelenítés
- [x] **Dark Mode javítás:** A "Saját ruha" oldalon a "Nincs ruha nálad" üzenet sötét módban ne fehér háttérrel jelenjen meg.

---


# V2 Pénz update

## A ruhák árainek hozzáadása:. Fontos hogy a ruha táblában legyen tárolva az ára.
- [x] Adatbázis frissítése: ruha táblában ár oszloppal
- [x] Backend és frontend frisítése hogy ruha felvételeko hozzá lehessen adni a ruha árát.
---
## Jelentés ablak hozzáadása
- [x] Jelentés fül: Statisztikák és kimutatások generálása
- [x] Havi, éves, féléves kiadások

## 🧹 Karbantartás & Dokumentáció
- [ ] **Debug:** Hibák keresése és javítása
- [ ] **Clean Code:** Felesleges, nem használt fájlok és kódmaradványok törlése.
- [ ] **Záró dokumentáció:** Miután a fenti fejlesztések készek, a teljes technikai dokumentáció frissítése és összesítése.

---

## 📝 Továbbfejlesztési ötletek
- [ ] **Jobb hibakiírás:** A felhasználó számára érthető, barátságos hibaüzenetek megjelenítése műveletek során.
- [ ] **Manager jogosultságok:** A Manager szerepkör részletesebb beállítása – pontos meghatározása, hogy mit csinálhat és hogyan (pl. milyen adatokat módosíthat, milyen jelentéseket láthat).
---

