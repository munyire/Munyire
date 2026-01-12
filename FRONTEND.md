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
- `src/views/*` – oldalak (LoginView, DashboardView, InventoryView, MyClothesView, WorkersView stb.)
- `src/components/layout/Sidebar.vue` – navigációs sáv (szerepkör-alapú linkek)

---

## 4. Hitelesítés és szerepkörök

- Bejelentkezés a `POST /api/auth/login` végpontra történik. A frontend a következő payload-ot küldi: `{ username, password }`.
- A szerver visszaad: `{ token, user }`.
- A token eltárolása: `localStorage.token` (string).
- A felhasználói objektum eltárolása: `localStorage.user` (JSON).
- Axios kérés-interceptor automatikusan hozzáfűzi az `Authorization: Bearer <token>` fejlécet.
- 401 válasz esetén az interceptor törli a token/user értékeket és a router a bejelentkezésre irányít.

A store (`src/stores/auth.js`) két fontos segédfüggvényt tartalmaz:
- `getUserRole()` — visszaadja a szerepkört. Támogatja a backend által visszaadott `role` mezőt **és** a korábban használt `Szerepkor` mezőt (compatibility).
- `normalizeUser()` — login és induláskor biztosítja, hogy a `user` objektum rendelkezzen `Szerepkor` mezővel (a `role`-ból másolva, ha szükséges). Ez megakadályozza, hogy a UI eltérő mezőnevek miatt rosszul jelenjen meg.

---

## 5. Routing és jogosultságok

- A `router` meta-mezőket használ (például `meta: { requiresAuth: true, roles: ['Manager','Admin'] }`).
- A `beforeEach` guard ellenőrzi:
  - ha az útvonal `requiresAuth` és nincs token → `/login`
  - ha az útvonal `meta.roles` és a felhasználó **nem** szerepel a listában → átirányít `/my-clothes` (vagy `/login` ha nem autentikált)
- A menü (`Sidebar.vue`) csak a `Manager` és `Admin` szerepkör esetén mutatja a Dashboard/Készlet/Dolgozók linkeket; a `Saját Ruháim` mindig elérhető.

Megjegyzés: ha egy felhasználó (pl. admin) a menüben csak a `Saját Ruháim`-ot látja, gyakori oka az, hogy a store `user` objektuma nem tartalmaz helyesen a szerepkört (pl. régi `Szerepkor` helyett `role` van), vagy a `localStorage` elavult — ilyenkor logout/újra login vagy a localStorage törlése megoldja a problémát. A kódban most normalizálás van bevezetve erre a hibára.

---

## 6. API proxy & fejlesztés

- `vite.config.js` beállításában a dev proxy `/api`-t továbbítja `http://localhost:3000`-ra — így fejlesztés közben a frontend ugyanabban a hostban hívhatja az API-t (CORS/host problémák elkerülése érdekében).

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

- 400 Bad Request a loginnál: ellenőrizd, hogy a JSON request body megfelelő mezőket tartalmaz (`username` és `password`) és érvényes JSON-t küldesz.
- 401 Unauthorized: token lejárt vagy hiányzik; ellenőrizd a `localStorage.token`-t és az Axios interceptort, illetve a backend `JWT_SECRET` és token lejárati beállításokat.
- Menü nem jelenik az elvártaknak megfelelően: töröld a `localStorage.user`-t és jelentkezz be újra; ellenőrizd, hogy a `user` objektumban van-e `role` vagy `Szerepkor` mező.
- CORS/Proxy probléma fejlesztés közben: ellenőrizd a `vite.config.js` `server.proxy` beállítást.

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
- Login view: `frontend/src/views/LoginView.vue`
- Sidebar: `frontend/src/components/layout/Sidebar.vue`

---

Ha szeretnéd, hozzáadok egy rövid szakaszt arról, hogyan írjunk Playwright E2E tesztet az UI automatikus ellenőrzéséhez (login + redirect + sidebar elemek ellenőrzése).