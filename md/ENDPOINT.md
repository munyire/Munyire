# Munyire API Végpontok

## Összesítés

| Modul | Végpontok száma | Alap útvonal |
|:------|:---------:|:-------------|
| Auth | 2 | `/api/auth` |
| Dolgozók | 8 | `/api/dolgozok` |
| Ruhák | 9 | `/api/ruhak` |
| RuhaKiBe | 10 | `/api/ruhakibe` |
| Rendelések | 9 | `/api/rendelesek` |
| Dashboard | 3 | `/api/dashboard` |
| Jelentések (alap) | 4 | `/api/reports` |
| Jelentések (pénzügyi) | 4 | `/api/reports/expenses` |
| **Összesen** | **49** | |

Plusz: `GET /health` – szerverstátusz ellenőrzés (nyilvános)

---

## Jogosultsági szintek

| Jelölés | Jelentés |
|:--------|:---------|
| 🔓 | Nyilvános (nem kell token) |
| 👤 | Dolgozo (saját adathoz) |
| 👥 | Manager |
| 👑 | Admin |

---

## Auth – `/api/auth`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| POST | `/api/auth/login` | Bejelentkezés, JWT token visszaadása | 🔓 |
| POST | `/api/auth/register` | Új felhasználó regisztrálása | 👑 |

**Login payload:** `{ "username": "...", "password": "..." }`  
**Login response:** `{ "token": "...", "user": { ... } }`

---

## Dolgozók – `/api/dolgozok`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/dolgozok` | Összes dolgozó listázása | 👥 👑 |
| GET | `/api/dolgozok/names` | Összes dolgozó neve (dropdown-hoz) | 👥 👑 |
| GET | `/api/dolgozok/with-active-items` | Dolgozók, akiknek van kint ruhája | 👥 👑 |
| GET | `/api/dolgozok/:dolgozoId` | Egy dolgozó adatai | 👤 👥 👑 |
| PATCH | `/api/dolgozok/:dolgozoId` | Dolgozó adatainak módosítása | 👑 |
| DELETE | `/api/dolgozok/:dolgozoId` | Dolgozó törlése | 👑 |
| GET | `/api/dolgozok/:dolgozoId/ruhak` | Dolgozó összes ruhakiadása | 👤 👥 👑 |
| GET | `/api/dolgozok/:dolgozoId/ruhak/aktiv` | Dolgozó jelenleg kint lévő ruhái | 👤 👥 👑 |

---

## Ruhák – `/api/ruhak`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/ruhak` | Készlet listázása (raktáradatokkal együtt) | 👥 👑 |
| GET | `/api/ruhak/search` | Keresés (query param: `q`) | 👥 👑 |
| GET | `/api/ruhak/options` | Szín, fajta, méret lehetőségek dropdown-hoz | 👥 👑 |
| GET | `/api/ruhak/:cikkszam` | Egy ruhacikk részletei és készlete | 👥 👑 |
| GET | `/api/ruhak/:cikkszam/history` | Ruhacikk kiadási előzményei | 👥 👑 |
| GET | `/api/ruhak/:cikkszam/active` | Ruhacikkből jelenleg kint lévő kiadások | 👥 👑 |
| POST | `/api/ruhak` | Új ruhacikk felvétele | 👑 |
| PATCH | `/api/ruhak/:cikkszam` | Ruhacikk módosítása (pl. ár, minőség) | 👑 |
| DELETE | `/api/ruhak/:cikkszam` | Ruhacikk törlése | 👑 |

**Megjegyzések:**
- `Cikkszam` automatikusan generálódik (7-jegyű int, 1000001-től), ne add meg a POST body-ban.
- A GET válasz tartalmazza a beágyazott `Raktars` tömböt (minőségenként).
- Az `Ar` mező (egységár Ft-ban) most már minden ruhánál rögzíthető.

---

## RuhaKiBe – `/api/ruhakibe`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/ruhakibe` | Összes tranzakció listázása | 👥 👑 |
| GET | `/api/ruhakibe/mine` | Bejelentkezett felhasználó saját tranzakciói | 👤 👥 👑 |
| GET | `/api/ruhakibe/active` | Aktív (kint lévő, nem visszavett) kiadások | 👥 👑 |
| GET | `/api/ruhakibe/returned` | Lezárt (visszavett) tranzakciók | 👥 👑 |
| GET | `/api/ruhakibe/by-date` | Időszak szerinti szűrés | 👥 👑 |
| GET | `/api/ruhakibe/stats` | Kiadás/visszavétel statisztikák | 👥 👑 |
| GET | `/api/ruhakibe/:ruhaKiBeId` | Egy tranzakció részletei | 👥 👑 |
| POST | `/api/ruhakibe` | Új kiadás rögzítése | 👥 👑 |
| PATCH | `/api/ruhakibe/:ruhaKiBeId` | Visszavétel rögzítése (minőség megadásával) | 👥 👑 |
| DELETE | `/api/ruhakibe/:ruhaKiBeId` | Tranzakció törlése | 👑 |

**Megjegyzések:**
- A lista (`/active`) tartalmazza a beágyazott `Dolgozo` és `Ruha` objektumokat.
- Kiadáskor `DolgozoID` és `Cikkszam` (mint `RuhaID`) szükséges, **Number** típusként.
- Visszavételkor a body-ban a visszavételkori minőség szükséges.

---

## Rendelések – `/api/rendelesek`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/rendelesek` | Összes rendelés listázása | 👥 👑 |
| GET | `/api/rendelesek/pending` | Függőben lévő (`Leadva`) rendelések | 👥 👑 |
| GET | `/api/rendelesek/by-status/:statusz` | Rendelések státusz szerint szűrve | 👥 👑 |
| GET | `/api/rendelesek/by-ruha/:cikkszam` | Rendelések ruhacikk szerint | 👥 👑 |
| GET | `/api/rendelesek/:rendelesId` | Egy rendelés részletei | 👥 👑 |
| POST | `/api/rendelesek` | Új rendelés létrehozása (`Leadva` státusszal) | 👥 👑 |
| PATCH | `/api/rendelesek/:rendelesId` | Rendelés adatainak módosítása | 👥 👑 |
| PATCH | `/api/rendelesek/:rendelesId/complete` | Rendelés teljesítése + raktárkészlet automatikus növelése | 👑 |
| DELETE | `/api/rendelesek/:rendelesId` | Rendelés törlése | 👑 |

---

## Dashboard – `/api/dashboard`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/dashboard/stats` | Fő KPI statisztikák | 👥 👑 |
| GET | `/api/dashboard/low-stock` | Alacsony készletű ruhák (10 db alatt) | 👥 👑 |
| GET | `/api/dashboard/recent-activity` | Legutóbbi tevékenységek listája | 👥 👑 |

---

## Jelentések (alap) – `/api/reports`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/reports/inventory` | Teljes készletjelentés | 👥 👑 |
| GET | `/api/reports/employee-summary` | Dolgozónkénti összesítő | 👥 👑 |
| GET | `/api/reports/monthly` | Havi riport (query: `year`, `month`) | 👥 👑 |
| GET | `/api/reports/quality-summary` | Minőség szerinti készlet összesítő | 👑 |

---

## Jelentések (pénzügyi, V2) – `/api/reports/expenses`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/reports/expenses/monthly` | Havi kiadások (query: `year`, `month`) | 👥 👑 |
| GET | `/api/reports/expenses/yearly` | Éves kiadások (query: `year`) | 👥 👑 |
| GET | `/api/reports/expenses/half-year` | Féléves kiadások (query: `year`, `half`) | 👥 👑 |
| GET | `/api/reports/inventory-value` | Teljes készlet értéke Ft-ban | 👥 👑 |

**Megjegyzés:** A pénzügyi riportok a `Ruha.Ar` (egységár) mező alapján számítják a kiadási értékeket.

---

## Query paraméterek összesítése

| Végpont | Paraméter | Típus | Leírás |
|:--------|:----------|:------|:-------|
| `/api/ruhak/search` | `q` | string | Keresőkifejezés |
| `/api/ruhakibe/by-date` | `from` | date | Kezdő dátum (YYYY-MM-DD) |
| `/api/ruhakibe/by-date` | `to` | date | Záró dátum (YYYY-MM-DD) |
| `/api/reports/monthly` | `year` | number | Év (pl. 2026) |
| `/api/reports/monthly` | `month` | number | Hónap (1-12) |
| `/api/reports/expenses/monthly` | `year` | number | Év |
| `/api/reports/expenses/monthly` | `month` | number | Hónap (1-12) |
| `/api/reports/expenses/yearly` | `year` | number | Év |
| `/api/reports/expenses/half-year` | `year` | number | Év |
| `/api/reports/expenses/half-year` | `half` | number | Félév (1 vagy 2) |

---

## HTTP státuszkódok

| Kód | Jelentés | Mikor |
|:---:|:---------|:------|
| 200 | OK | Sikeres lekérdezés/módosítás |
| 201 | Created | Sikeres létrehozás |
| 400 | Bad Request | Hibás bemenet, validációs hiba |
| 401 | Unauthorized | Hiányzó/érvénytelen token |
| 403 | Forbidden | Nincs jogosultság |
| 404 | Not Found | Nem található erőforrás |
| 409 | Conflict | Duplikáció (pl. `Cikkszam`, `FelhasznaloNev`, `Email`) |
| 429 | Too Many Requests | Rate limit túllépve |
| 500 | Internal Server Error | Szerverhiba |