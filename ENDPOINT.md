# Munyire API Végpontok

## Összesítés

| Modul | Végpontok | Alap útvonal |
|:------|:---------:|:-------------|
| Auth | 2 | `/api/auth` |
| Dolgozók | 7 | `/api/dolgozok` |
| Ruhák | 9 | `/api/ruhak` |
| RuhaKiBe | 10 | `/api/ruhakibe` |
| Rendelések | 9 | `/api/rendelesek` |
| Dashboard | 3 | `/api/dashboard` |
| Jelentések | 4 | `/api/reports` |
| **Összesen** | **46** | |

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
| POST | `/api/auth/login` | Bejelentkezés, JWT token | 🔓 |
| POST | `/api/auth/register` | Új felhasználó regisztrálása | 👑 |

---

## Dolgozók – `/api/dolgozok`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/dolgozok` | Összes dolgozó listázása | 👥 👑 |
| GET | `/api/dolgozok/names` | Összes dolgozó neve (dropdown) | 👥 👑 |
| GET | `/api/dolgozok/:dolgozoId` | Egy dolgozó adatai | 👤 👥 👑 |
| PATCH | `/api/dolgozok/:dolgozoId` | Dolgozó módosítása | 👑 |
| DELETE | `/api/dolgozok/:dolgozoId` | Dolgozó törlése | 👑 |
| GET | `/api/dolgozok/:dolgozoId/ruhak` | Dolgozó összes ruhakiadása | 👤 👥 👑 |
| GET | `/api/dolgozok/:dolgozoId/ruhak/aktiv` | Dolgozó kint lévő ruhái | 👤 👥 👑 |
| GET | `/api/dolgozok/with-active-items` | Dolgozók, akiknek van kint ruhája | 👥 👑 |

---

## Ruhák – `/api/ruhak`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/ruhak` | Készlet listázása | 👥 👑 |
| GET | `/api/ruhak/search` | Keresés (query: `q`) | 👥 👑 |
| GET | `/api/ruhak/options` | Lehetőségek listázása (szín, fajta, méret) | 👥 👑 |
| GET | `/api/ruhak/by-cikkszam/:cikkszam` | Ruhacikk cikkszám alapján | 👥 👑 |
| GET | `/api/ruhak/:ruhaId` | Egy ruhacikk részletei | 👥 👑 |
| GET | `/api/ruhak/:ruhaId/history` | Ruhacikk kiadási története | 👥 👑 |
| GET | `/api/ruhak/:ruhaId/active` | Ruhacikkből kint lévő kiadások | 👥 👑 |
| POST | `/api/ruhak` | Új ruhacikk felvétele (Cikkszám automatikusan generálódik, ha nincs megadva) | 👑 |
| PATCH | `/api/ruhak/:ruhaId` | Ruhacikk módosítása | 👑 |
| DELETE | `/api/ruhak/:ruhaId` | Ruhacikk törlése | 👑 |

---

## RuhaKiBe – `/api/ruhakibe`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/ruhakibe` | Összes tranzakció listázása | 👥 👑 |
| GET | `/api/ruhakibe/mine` | Saját tranzakciók | 👤 👥 👑 |
| GET | `/api/ruhakibe/active` | Aktív (kint lévő) kiadások | 👥 👑 |
| GET | `/api/ruhakibe/returned` | Lezárt (visszavett) tranzakciók | 👥 👑 |
| GET | `/api/ruhakibe/by-date` | Időszak szerinti szűrés (query: `from`, `to`) | 👥 👑 |
| GET | `/api/ruhakibe/stats` | Kiadás/visszavétel statisztikák | 👥 👑 |
| GET | `/api/ruhakibe/:ruhaKiBeId` | Egy tranzakció részletei | 👥 👑 |
| POST | `/api/ruhakibe` | Új kiadás rögzítése | 👥 👑 |
| PATCH | `/api/ruhakibe/:ruhaKiBeId` | Visszavétel rögzítése | 👥 👑 |
| DELETE | `/api/ruhakibe/:ruhaKiBeId` | Tranzakció törlése | 👑 |

---

## Rendelések – `/api/rendelesek`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/rendelesek` | Összes rendelés listázása | 👥 👑 |
| GET | `/api/rendelesek/pending` | Függőben lévő rendelések | 👥 👑 |
| GET | `/api/rendelesek/by-status/:statusz` | Rendelések státusz szerint | 👥 👑 |
| GET | `/api/rendelesek/by-ruha/:ruhaId` | Rendelések ruhacikk szerint | 👥 👑 |
| GET | `/api/rendelesek/:rendelesId` | Egy rendelés részletei | 👥 👑 |
| POST | `/api/rendelesek` | Új rendelés létrehozása | 👥 👑 |
| PATCH | `/api/rendelesek/:rendelesId` | Rendelés módosítása | 👥 👑 |
| PATCH | `/api/rendelesek/:rendelesId/complete` | Rendelés teljesítése + készlet növelés | 👑 |
| DELETE | `/api/rendelesek/:rendelesId` | Rendelés törlése | 👑 |

---

## Dashboard – `/api/dashboard`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/dashboard/stats` | Fő statisztikák | 👥 👑 |
| GET | `/api/dashboard/low-stock` | Alacsony készletű ruhák | 👥 👑 |
| GET | `/api/dashboard/recent-activity` | Legutóbbi tevékenységek | 👥 👑 |

---

## Jelentések – `/api/reports`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/reports/inventory` | Teljes készletjelentés | 👥 👑 |
| GET | `/api/reports/employee-summary` | Dolgozónkénti összesítő | 👥 👑 |
| GET | `/api/reports/monthly` | Havi riport (query: `year`, `month`) | 👥 👑 |
| GET | `/api/reports/quality-summary` | Minőség szerinti összesítés | 👑 |

---

## Query paraméterek összesítése

| Végpont | Paraméter | Típus | Leírás |
|:--------|:----------|:------|:-------|
| `/api/ruhak/search` | `q` | string | Keresőkifejezés |
| `/api/ruhakibe/by-date` | `from` | date | Kezdő dátum (YYYY-MM-DD) |
| `/api/ruhakibe/by-date` | `to` | date | Záró dátum (YYYY-MM-DD) |
| `/api/reports/monthly` | `year` | number | Év (pl. 2026) |
| `/api/reports/monthly` | `month` | number | Hónap (1-12) |

---

## HTTP státuszkódok

| Kód | Jelentés | Mikor |
|:---:|:---------|:------|
| 200 | OK | Sikeres lekérdezés/módosítás |
| 201 | Created | Sikeres létrehozás |
| 400 | Bad Request | Hibás bemenet |
| 401 | Unauthorized | Hiányzó/érvénytelen token |
| 403 | Forbidden | Nincs jogosultság |
| 404 | Not Found | Nem található erőforrás |
| 409 | Conflict | Duplikáció (pl. Cikkszam, FelhasznaloNev) |
| 500 | Internal Server Error | Szerverhiba |