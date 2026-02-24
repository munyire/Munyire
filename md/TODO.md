# 🗂️ Fejlesztési Feladatlista (Backlog)

> Utolsó frissítés: 2026. február

---

## ✅ Kész funkciók (V1 alapkibocsátás)

### 📊 Dashboard
- [x] **Raktárkészlet összesítés:** a mutató az összes ruha darabszámát összegzi

### 📦 Készletkezelés
- [x] **Egységes UI:** keresődoboz és „Új termék felvétele" box azonos méretű
- [x] **UX javítás:** törlés megerősítése egyedi modálban (nem böngészős `alert`)
- [x] **Szelektív törlés:** csak az adott minőségű tétel törlődik
- [x] **Logikai összefűzés:** módosításkor minőség-változás esetén mennyiség összevonása

### 👥 Dolgozók kezelése
- [x] **Box méretezés:** dobozok azonos méretűek
- [x] **Profilkép kezelés:** profilkép funkció eltávolítva
- [x] **Bővített keresés:** keresés munkakör és szerepkör alapján is

### 🔄 Tranzakciók & Rendelések
- [x] **Kétirányú keresés:** visszavételi listában dolgozó neve és ruha típusa szerint
- [x] **UI szinkron:** keresődoboz és „Új rendelés" box azonos méretű
- [x] **Visszajelzés:** megerősítő modál (nem alert) az átvétel gombnál
- [x] **Visszajelzés:** megerősítő modál az új rendelés leadásakor

### 🌙 UI / Megjelenítés
- [x] **Dark Mode javítás:** „Nincs ruha nálad" üzenet sötét módban megfelelő háttérrel

---

## ✅ Kész funkciók (V2 – Pénzügyi frissítés)

### 💰 Árak és pénzügyi modul
- [x] **Adatbázis frissítés:** `Ruha` tábla `Ar` (ár) oszloppal bővítve
- [x] **Készletkezelés – ár:** ruha felvételekor / szerkesztésekor ár megadható
- [x] **Jelentés oldal:** `ReportsView.vue` – pénzügyi kimutatások
  - [x] Havi kiadások (tétel lista: dátum, dolgozó, ruha, egységár, összeg)
  - [x] Éves kiadások (havi bontás, sávdiagram)
  - [x] Féléves kiadások (sávdiagram)
  - [x] Készlet érték (típusonkénti értéklista)
- [x] **Nyomtatás:** `PrintTemplate.vue` – nyomtatási előnézet modál
- [x] **CSV export:** BOM-os UTF-8 (Excel-kompatibilis)

### 🔒 Biztonság
- [x] **Helmet middleware:** HTTP biztonsági fejlécek
- [x] **Rate limiting:** max. 100 kérés / 15 perc / IP
- [x] **sqlite3 / tar:** biztonsági frissítések (`tar` override ^7.5.7)

---

## 🔲 Nyitott feladatok

### 🐛 Debug & karbantartás
- [ ] **Debug:** fennmaradó hibák keresése és javítása
- [ ] **Clean Code:** felesleges, nem használt fájlok és kódmaradványok törlése

### 🚀 Továbbfejlesztési ötletek
- [ ] **Jobb hibakiírás:** felhasználóbarát hibaüzenetek megjelenítése műveletekkor
- [ ] **Manager jogosultságok:** részletesebb szabályozás – mit módosíthat, milyen jelentéseket láthat
- [ ] **E2E tesztek:** Playwright alapú böngészős tesztelés (bejelentkezés, navigáció, jogosultságok)
- [ ] **Jelszó-visszaállítás:** elfelejtett jelszó kezelése admin nélkül
- [ ] **Lokalizáció (i18n):** `vue-i18n` integráció esetén, ha nemzetközi használat szükséges
