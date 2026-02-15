# Minőségellenőrzési Jelentés (Quality Control Report)

## 1. Hiányzó Funkciók (Kritikus)
- **Profilkezelés hiánya:** A felhasználók nem tudják megváltoztatni a jelszavukat vagy a saját adataikat (pl. telefonszám). Jelenleg csak az Admin tud módosítani.
- **"Elfelejtett jelszó" folyamat:** A Login oldalon a link (`<a href="#">`) nem vezet sehova. Nincs implementálva a jelszó visszaállítási folyamat.
- **Saját cég beállításai:** Az admin felületen nincsenek "Rendszerbeállítások" (pl. cégnév, logó csere a nyomtatványokhoz), ezek jelenleg hard-code-olva vannak a `PrintTemplate.vue`-ban.

## 2. Felhasználói Élmény (UX) és UI
- **Profil elérés:** A Sidebar-on a felhasználói kártya nem kattintható, nincs "Fiókom" vagy "Beállítások" menüpont.
- **Visszajelzések:** A Login oldalon az error handling alapszintű, de biztonságos.
- **Reszponzivitás:** A táblázatok (`ReportsView`, `WorkersView`) mobil nézete "scrollos", ami rendben van, de lehetne kártyás nézet is mobilra a jobb átláthatóságért.

## 3. Technikai Érettség
- **Frontend Validáció:** Vuelidate vagy hasonló library használata ajánlott lenne a komolyabb formokhoz (pl. új dolgozó felvétele).
- **Biztonság:** A jelszó változtatás lehetősége hiányzik a backend API-ból is a sima user számára (`PATCH /dolgozok/:id` csak adminnak engedélyezett).

## Javasolt Javítások (Release 1.0 előtt)
1. **[Backlog]** Jelszóváltoztatási lehetőség (Backend + Frontend).
2. **[Backlog]** "Saját Adataim" (Profil) oldal létrehozása.
3. **[Backlog]** Validációk szigorítása (pl. telefonszám formátum).
