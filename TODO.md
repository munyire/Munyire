# 🚀 Fejlesztési Feladatlista (Backlog)

## 📊 Dashboard
- [x] **Raktárkészlet összesítés:** A mutató az összes ruha **darabszámát** összegezze a különböző fajták száma helyett.

---

## 📦 Készletkezelés
- [ ] **Egységes UI:** A keresődoboz és az "Új termék felvétele" box legyen azonos méretű.
- [ ] **UX javítás:** A törlés megerősítése ne böngészős `alertbox`-ban, hanem egyedi modálban jelenjen meg.
- [x] **Szelektív törlés:** Törlésnél ne a teljes termék törlődjön, hanem **csak az adott minőségű** tétel.
- [y] **Logikai összefűzés:** Módosításkor, ha megváltozik a minőség, a rendszer adja hozzá a darabszámot a már meglévő, azonos minőségű rekordhoz.

---

## 👥 Dolgozók kezelése
- [x] **Box méretezés:** Az "Új dolgozók" és a "Dolgozók száma" dobozok legyenek egyforma méretűek.
- [x] **Profilkép kezelés:** Dolgozói képek funkció törlése(Ne legyenek a  dolgozóknak képeik).
- [x] **Bővített keresés:** Keresési lehetőség hozzáadása **munkakör** és **szerepkör** alapján is.

---

## 🔄 Tranzakciók & Rendelések
### Visszavétel
- [ ] **Kétirányú keresés:** Lehessen keresni dolgozó neve és ruha típusa alapján is a visszavételi listában.

### Rendelés
- [x] **UI szinkron:** A keresődoboz és az "Új rendelés felvétele" box legyen azonos méretű.
- [x] **Visszajelzés:** Az átvétel gomb ne `alertbox`-ot használjon a megerősítéshez.
- [ ] **Visszajelzés:** Az uj rendelés leadása gomb ne `alertbox`-ot használjon.

---

## 🌙 UI / Megjelenítés
- [ ] **Dark Mode javítás:** A "Saját ruha" oldalon a "Nincs ruha nálad" üzenet sötét módban ne fehér háttérrel jelenjen meg.

---

## 🧹 Karbantartás & Dokumentáció
- [ ] **Clean Code:** Felesleges, nem használt fájlok és kódmaradványok törlése.
- [ ] **Záró dokumentáció:** Miután a fenti fejlesztések készek, a teljes technikai dokumentáció frissítése és összesítése.
