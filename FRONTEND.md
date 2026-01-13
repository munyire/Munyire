# Munyire – Frontend dokumentáció

## 1. Bevezetés

A **frontend** a Munyire felhasználói felülete — egy SPA (Single Page Application) amely a háttérben a REST API-val kommunikál. Célja: egyszerű, gyors és szerepalapú kezelőfelület biztosítása a dolgozók, menedzserek és adminisztrátorok számára.

---

## 2. Technológiai stack

- **Vue 3** (Composition API)
- **Pinia** – állapotkezelés
- **vue-router** – kliensoldali routing és guard-ok
- **Vite** – build & dev szerver
- **Axios** – HTTP kliens, request/response interceptors
- Egyszerű CSS / utility osztályok a komponensekhez

---

## 3. Projekt felépítése (fontos fájlok)

- `index.html` – alkalmazás entry
- `src/main.js` – app bootstrap (Pinia, Router)
- `src/App.vue` – gyökér komponens
- `src/api/axios.js` – Axios példány, interceptorok (auth header, 401 kezelés)
- `src/router/index.js` – útvonalak és `beforeEach` guard-ok (meta.roles)
- `src/stores/auth.js` – beléptetés, token & user kezelés (Pinia)
- `src/views/` – oldalak:
    - `LoginView.vue`: Bejelentkezés.
    - `DashboardView.vue`: Statisztikák (Admin/Manager).
    - `InventoryView.vue`: Készletkezelés (terméklista, új termék felvétele, törlés).
    - `WorkersView.vue`: Dolgozók kezelése (új dolgozó regisztrációja, szerkesztés).
    - `TransactionsView.vue`: Kiadás és Visszavétel kezelése.
    - `OrdersView.vue`: Rendelések listázása és új rendelés leadása.
    - `MyClothesView.vue`: Saját (dolgozónál lévő) ruhák listája.
- `src/components/layout/Sidebar.vue` – navigációs sáv (szerepkör-alapú linkek)
- `src/components/common/` – közös komponensek:
    - `SearchableSelect.vue`: Kereshető legördülő lista (dolgozók/ruhák kiválasztásához).
    - `BaseButton.vue`: Egységes stílusú gomb.
    - `BaseInput.vue`: Egységes stílusú beviteli mező.
- `src/components/ui/Modal.vue` – Általános modális ablak.

---

## 4. Hitelesítés és szerepkörök

- Bejelentkezés a `POST /api/auth/login` végpontra történik. A frontend a következő payload-ot küldi: `{ username, password }`.
- A szerver visszaad: `{ token, user }`.
- A token eltárolása: `localStorage.token` (string).
- A felhasználói objektum eltárolása: `localStorage.user` (JSON).
- Axios kérés-interceptor automatikusan hozzáfűzi az `Authorization: Bearer <token>` fejlécet.
- 401 válasz esetén az interceptor törli a token/user értékeket és a router a bejelentkezésre irányít.
- **Dolgozó regisztráció**: A `WorkersView` a `POST /api/auth/register` végpontot használja új felhasználó létrehozására, majd patch kéréssel frissíti a további adatokat.

---

## 5. Routing és jogosultságok

- A `router` meta-mezőket használ (például `meta: { requiresAuth: true, roles: ['Manager','Admin'] }`).
- A `beforeEach` guard ellenőrzi:
  - ha az útvonal `requiresAuth` és nincs token → `/login`
  - ha az útvonal `meta.roles` és a felhasználó **nem** szerepel a listában → átirányít `/my-clothes` (vagy `/login` ha nem autentikált)
- A menü (`Sidebar.vue`) dinamikusan jeleníti meg a linkeket:
    - **Admin/Manager**: Dashboard, Készlet, Dolgozók, Kiadás/Visszavétel (`/transactions`), Rendelések (`/orders`).
    - **Mindenki**: Saját Ruháim (`/my-clothes`) és Kijelentkezés.

---

## 6. API interakciók és Adatkezelés

- **Készlet (Inventory)**:
    - A termékek (`Ruha`) listázása (`GET /ruhak`) magában foglalja a raktárkészlet (`Raktar`) adatait is.
    - A frontend "kisimítja" (flatten) ezt a struktúrát, hogy a táblázatban megjelenítse a különböző minőségű (Új, Jó, stb.) készleteket.
    - **Cikkszám generálás**: Új termék létrehozásakor (`POST /ruhak`) a cikkszám mező üresen marad, a backend automatikusan generálja.
    - **Törlés**: A törlés (`DELETE /ruhak/:cikkszam`) a Cikkszám alapján történik.

- **Tranzakciók (Transactions)**:
    - **Kiadás**: `POST /api/ruhakibe` – A frontend a kiválasztott `DolgozoID`-t és `RuhaID`-t (ami a Cikkszam) küldi. Fontos: az értékeket számként (`Number()`) kell küldeni.
    - **Visszavétel**: `PATCH /api/ruhakibe/:id` – A frontend bekéri a visszavételkori minőséget (pl. "Jó", "Szakadt").
    - **Aktív lista**: `GET /api/ruhakibe/active` – A lista tartalmazza a beágyazott Dolgozó és Ruha objektumokat a nevek megjelenítéséhez.

- **Rendelések (Orders)**:
    - `GET /api/rendelesek` és `POST /api/rendelesek` a rendelések kezeléséhez.
    - A "Teljesítés" (`POST /api/rendelesek/:id/complete`) gombbal véglegesíthető egy rendelés (beérkeztetés).

---

## 7. Futtatás & build

Fejlesztés:
```bash
cd frontend
npm install
npm run dev
```

Build és előnézet:
```bash
npm run build
npm run preview
```

A `baseURL` Axios-ban relatív (`/api`) — a production környezetben az alkalmazás hosztolását úgy kell beállítani, hogy a backend `/api` végpontjai elérhetők legyenek (reverse proxy vagy külön domain esetén a `baseURL`-t át kell állítani).

---

## 8. Tesztelés & E2E

- Egyszerű backend-alapú E2E script van (`backend/tests/e2e_login_test.js`) ami ellenőrzi a bejelentkezést és egy védett végpontot (például `/api/dashboard/stats`).
- Ha szükséges, javasolt egy böngésző-alapú E2E suite (Playwright vagy Cypress) bevezetése a UI viselkedés automatikus ellenőrzésére (bejelentkezés, navigáció, jogosultságok).

---

## 9. Hibakeresési tippek (Gyakori problémák)

- **400 Bad Request**:
    - Ellenőrizd a payload típusait (pl. szám vs string). A backend szigorú validációt használ (pl. `issueValidator`).
    - Készlet létrehozásnál a `Cikkszam` mezőnek hiányoznia kell a payload-ból (hogy auto-generált legyen), ne küldj üres stringet.
- **Lista üres vagy hiányos adatok**:
    - Ellenőrizd a backend válasz struktúráját (Network tab). Ha nested objektumok vannak (pl. `ruha.Raktars` vagy `issue.Dolgozo`), a frontendnek megfelelően kell hivatkoznia rájuk (`?.` operátor javasolt).
- **401 Unauthorized**:
    - Token lejárt vagy hiányzik. Logout és újbóli Login általában megoldja.
- **UI elcsúszás**:
    - A táblázatoknál (`overflow-x-auto`) és a konténereknél (`max-w-*`) ellenőrizd a CSS osztályokat. A Sidebar fix szélességű, a main content `flex-1` vagy `w-full` kell legyen megfelelő paddinggal.

---

## 10. Kiterjesztések & javaslatok

- Bevezetni UI teszteket (Playwright): automatikusan ellenőrizhetjük a bejelentkezést és a jogosultságokhoz kötött navigációt.
- Lokalizáció (i18n): a felületen jelenleg magyar feliratok vannak; ha nemzetközi használat a cél, érdemes `vue-i18n`-t integrálni.
- UI komponens könyvtár (pl. Vuetify / Tailwind UI) a gyorsabb fejlesztéshez és konzisztens dizájn érdekében.

---

## 11. Gyors hivatkozások a kódban

- Axios: `frontend/src/api/axios.js`
- Auth store: `frontend/src/stores/auth.js`
- Router: `frontend/src/router/index.js`
- Views: `frontend/src/views/`
- Sidebar: `frontend/src/components/layout/Sidebar.vue`