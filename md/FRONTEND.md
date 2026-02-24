# Munyire – Frontend dokumentáció

## 1. Bevezetés

A **frontend** a Munyire felhasználói felülete — egy SPA (Single Page Application), amely a háttérben a REST API-val kommunikál. Célja: egyszerű, gyors és szerepalapú kezelőfelület biztosítása a dolgozók, menedzserek és adminisztrátorok számára.

---

## 2. Technológiai stack

| Csomag | Verzió | Szerepe |
|--------|--------|---------|
| `vue` | ^3 | UI framework (Composition API, `<script setup>`) |
| `pinia` | ^2 | Állapotkezelés |
| `vue-router` | ^4 | Kliensoldali routing |
| `vite` | ^5 | Build & dev szerver |
| `axios` | ^1 | HTTP kliens, interceptors |
| `lucide-vue-next` | latest | SVG ikonkönyvtár |
| `@vueuse/core` | – | (ha szükséges) Vue composable-ok |

CSS: saját CSS változókkal (`src/style/`) + `style.css`, dark mode támogatással.

---

## 3. Projekt struktúra

```
frontend/src/
├── main.js                   # App bootstrap (Vue, Pinia, Router)
├── App.vue                   # Gyökér komponens (layout, sidebar, theme toggle)
├── style.css                 # Globális CSS alapok
├── style/                    # CSS változók, dark/light mode
├── api/
│   └── axios.js              # Axios példány, base URL, interceptors
├── router/
│   └── index.js              # Útvonalak, meta.roles, beforeEach guard
├── stores/
│   ├── auth.js               # Bejelentkezés, token & user kezelés (Pinia)
│   └── theme.js              # Dark/light mode állapot (Pinia)
├── views/
│   ├── LoginView.vue         # Bejelentkezési oldal
│   ├── DashboardView.vue     # KPI statisztikák, low-stock figyelmeztetések
│   ├── InventoryView.vue     # Készletkezelés (lista, szűrés, CRUD)
│   ├── WorkersView.vue       # Dolgozók kezelése (lista, regisztráció, szerkesztés)
│   ├── TransactionsView.vue  # Ruhakiadás és visszavétel
│   ├── OrdersView.vue        # Rendelések listázása és leadása
│   ├── ReportsView.vue       # Pénzügyi jelentések (havi, éves, féléves, készlet érték)
│   └── MyClothesView.vue     # Saját (dolgozónál lévő) ruhák
├── components/
│   ├── layout/
│   │   └── Sidebar.vue       # Navigációs sáv (szerepkör-alapú linkek)
│   ├── common/
│   │   ├── SearchableSelect.vue  # Kereshető legördülő lista
│   │   ├── BaseButton.vue        # Egységes stílusú gomb
│   │   └── BaseInput.vue         # Egységes stílusú beviteli mező
│   ├── ui/
│   │   └── Modal.vue             # Általános modális ablak
│   └── PrintTemplate.vue         # Nyomtatási előnézet komponens
└── utils/
    └── (segédfüggvények)
```

---

## 4. Hitelesítés és szerepkörök

- Bejelentkezés: `POST /api/auth/login` → `{ username, password }`
- Szerver visszaad: `{ token, user }`
- Token tárolása: `localStorage.token`
- Felhasználói objektum: `localStorage.user` (JSON)
- Axios request-interceptor: automatikusan hozzáfűzi az `Authorization: Bearer <token>` fejlécet.
- 401 válasz esetén: token/user törlése → átirányítás `/login`-ra.
- **Új dolgozó regisztráció**: `WorkersView` → `POST /api/auth/register` + `PATCH /api/dolgozok/:id` a további adatok mentéséhez.

---

## 5. Routing és jogosultságok

| Útvonal | Nézet | Szükséges szerepkör |
|---------|-------|---------------------|
| `/login` | LoginView | – |
| `/dashboard` | DashboardView | Manager, Admin |
| `/inventory` | InventoryView | Manager, Admin |
| `/workers` | WorkersView | Manager, Admin |
| `/transactions` | TransactionsView | Manager, Admin |
| `/orders` | OrdersView | Manager, Admin |
| `/reports` | ReportsView | Manager, Admin |
| `/my-clothes` | MyClothesView | Mindenki (auth) |

**`beforeEach` guard logika:**
1. Ha `requiresAuth` és nincs token → `/login`
2. Ha `meta.roles` és a felhasználó nincs benne → `/my-clothes` (vagy `/login`)

**Sidebar linkek:**
- **Admin/Manager:** Dashboard, Készlet, Dolgozók, Kiadás/Visszavétel, Rendelések, Jelentések
- **Mindenki:** Saját Ruháim, Kijelentkezés

---

## 6. Nézetek és API interakciók

### DashboardView
- `GET /api/dashboard/stats` – KPI kártyák (dolgozók száma, összes ruha, kiadott ruhák, aktív rendelések)
- `GET /api/dashboard/low-stock` – Alacsony készlet figyelmeztetés
- `GET /api/dashboard/recent-activity` – Legutóbbi tevékenységek
- Beágyazott **Top 5 ruhatípus** grafikon

### InventoryView
- `GET /api/ruhak` – Készlet listázása (beágyazott `Raktars` tömbben minőségenként)
- Frontend „flatten": táblázatban soronként megjelenik minden minőségi kategória
- `POST /api/ruhak` – Új ruha (Cikkszam **nem küldendő**, auto-generált; **Ar is megadható**)
- `PATCH /api/ruhak/:cikkszam` – Módosítás (ha minőség változik, rendszer összevonja a rekordokat)
- `DELETE /api/ruhak/:cikkszam/:minoseg` – Szelektív törlés (csak az adott minőségű tétel)
- Törlés előtt egyedi modális megerősítés (nem böngészős alert)

### WorkersView
- `GET /api/dolgozok` – Dolgozó lista (név, email, telefon, nem, munkakör, szerepkör)
- Keresés: **név, email, telefonszám, munkakör és szerepkör** alapján
- `POST /api/auth/register` + `PATCH /api/dolgozok/:id` – Új dolgozó regisztrációja
- `PATCH /api/dolgozok/:id` – Szerkesztés (beleértve jelszócsere)
- `DELETE /api/dolgozok/:id` – Törlés (megerősítő modállal)

### TransactionsView
- `GET /api/ruhakibe/active` – Aktív kiadások (beágyazott Dolgozo + Ruha)
- Szűrés: dolgozó neve és ruha típusa szerint (kétirányú keresés)
- **Kiadás:** `POST /api/ruhakibe` – `{ DolgozoID: Number, Cikkszam: Number, Mennyiseg, Indok }`
- **Visszavétel:** `PATCH /api/ruhakibe/:id` – visszavételkori minőség megadásával

### OrdersView
- `GET /api/rendelesek` – Rendelések listázása (beágyazott Ruha adatokkal)
- `POST /api/rendelesek` – Új rendelés (automatikusan `Leadva` státusszal)
- `PATCH /api/rendelesek/:id/complete` – Teljesítés: státusz → `Teljesítve` + raktárkészlet `+Mennyiseg` db `Új` minőségben
- Visszajelzések: egyedi modális (nem böngészős alert)

### ReportsView (V2 – Pénzügyi modul)
Négy fül:
1. **Havi kiadások** – `GET /api/reports/expenses/monthly?year=&month=` → részletes tétel lista (dátum, dolgozó, ruha, egységár, összeg)
2. **Éves kiadások** – `GET /api/reports/expenses/yearly?year=` → havi bontás + sávdiagram
3. **Féléves kiadások** – `GET /api/reports/expenses/half-year?year=&half=` → sávdiagram
4. **Készlet érték** – `GET /api/reports/inventory-value` → típusonkénti érték, darabszám

**Exportálás:**
- 🖨️ Nyomtatás: `PrintTemplate.vue` modális előnézet → böngésző `window.print()`
- 📥 CSV export: BOM-os UTF-8 (Excel kompatibilitáshoz), pontosvessző elválasztóval

### MyClothesView
- `GET /api/ruhakibe/mine` – Bejelentkezett felhasználó kint lévő ruhái
- Csak olvasható nézet; visszavételt csak Manager/Admin végezhet

---

## 7. Futtatás & build

```bash
cd frontend
npm install
npm run dev       # Fejlesztői szerver (Vite, általában localhost:5173)
npm run build     # Production build a dist/ mappába
npm run preview   # Build előnézete
```

Az Axios `baseURL` értéke: `/api` (relatív). Production környezetben reverse proxyn keresztül kell a backend `/api` végpontjait elérhetővé tenni.

---

## 8. Tesztelés

- Backend integrációs tesztek: `backend/integration_test.js` (`npm test`)
- Javasolt UI E2E tesztelés: **Playwright** (nincs még implementálva) – bejelentkezés, navigáció, jogosultságok automatikus ellenőrzésére

---

## 9. Hibakeresési tippek

| Hiba | Lehetséges ok | Megoldás |
|------|--------------|---------|
| 400 Bad Request | Hibás payload típus (pl. string vs number) | Küldj `Number()`-rel konvertált értékeket |
| 400 – új termék | `Cikkszam` üresen küldve stringként | Hagyj ki minden `Cikkszam` mezőt a body-ból |
| Üres lista | Nested objektum hivatkozás hiba | `?.` optional chaining operator használata |
| 401 Unauthorized | Token lejárt | Logout + újbóli bejelentkezés |
| UI elcsúszás | Sidebar fix szélességű | `main content` legyen `flex-1` megfelelő paddinggal |

---

## 10. Gyors hivatkozások

| Fájl | Funkció |
|------|---------|
| `src/api/axios.js` | Axios példány, interceptorok |
| `src/stores/auth.js` | Bejelentkezési állapot |
| `src/router/index.js` | Útvonalak és guard-ok |
| `src/views/ReportsView.vue` | Pénzügyi jelentés modul |
| `src/components/layout/Sidebar.vue` | Navigáció |
| `src/components/PrintTemplate.vue` | Nyomtatási sablon |