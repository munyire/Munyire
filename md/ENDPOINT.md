# Munyire API Végpontok Dokumentáció

## Összesítés

| Modul | Végpontok | Alap Útvonal |
|:------|:---------:|:-------------|
| Auth | 2 | `/api/auth` |
| Dolgozók | 9 | `/api/dolgozok` |
| Ruhák | 10 | `/api/ruhak` |
| RuhaKiBe | 10 | `/api/ruhakibe` |
| Rendelések | 9 | `/api/rendelesek` |
| Dashboard | 3 | `/api/dashboard` |
| Jelentések | 4 | `/api/reports` |
| **Összesen** | **47** | |

---

## Jogosultsági Szintek

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

### Példa kérések:

**Bejelentkezés:**
```bash
POST /api/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

**Válasz:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Adminisztrátor",
    "role": "Admin",
    "username": "admin"
  }
}
```

---

## Dolgozók – `/api/dolgozok`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/dolgozok` | Összes dolgozó listázása | 👥 👑 |
| GET | `/api/dolgozok/names` | Összes dolgozó neve (dropdown) | 👥 👑 |
| GET | `/api/dolgozok/search` | Keresés név/felhasználónév alapján | 👥 👑 |
| GET | `/api/dolgozok/:dolgozoId` | Egy dolgozó adatai | 👤 👥 👑 |
| POST | `/api/dolgozok` | Új dolgozó létrehozása | 👑 |
| POST | `/api/dolgozok/register-managed` | Manager általi regisztráció | 👥 👑 |
| PATCH | `/api/dolgozok/:dolgozoId` | Dolgozó módosítása | 👑 |
| DELETE | `/api/dolgozok/:dolgozoId` | Dolgozó törlése | 👑 |
| GET | `/api/dolgozok/:dolgozoId/ruhak` | Dolgozó összes ruhakiadása | 👤 👥 👑 |
| GET | `/api/dolgozok/:dolgozoId/ruhak/aktiv` | Dolgozó kint lévő ruhái | 👤 👥 👑 |
| GET | `/api/dolgozok/with-active-items` | Dolgozók, akiknek van kint ruhája | 👥 👑 |

### Példa kérések:

**Új dolgozó létrehozása:**
```bash
POST /api/dolgozok
Authorization: Bearer <token>
Content-Type: application/json

{
  "DNev": "Kiss János",
  "Email": "kiss.janos@example.com",
  "Telefonszam": "+36301234567",
  "Nem": "Férfi",
  "Munkakor": "Raktáros",
  "Szerepkor": "Dolgozo",
  "FelhasznaloNev": "kissjanos",
  "Jelszo": "password123"
}
```

---

## Ruhák – `/api/ruhak`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/ruhak` | Készlet listázása (raktár adatokkal) | 👥 👑 |
| GET | `/api/ruhak/search` | Keresés (query: `q`) | 👥 👑 |
| GET | `/api/ruhak/options` | Lehetőségek listázása (szín, fajta, méret) | 👥 👑 |
| GET | `/api/ruhak/by-cikkszam/:cikkszam` | Cikkszám alapú keresés | 👥 👑 |
| GET | `/api/ruhak/:ruhaId` | Egy ruhacikk részletei és készlete | 👥 👑 |
| GET | `/api/ruhak/:ruhaId/history` | Ruhacikk kiadási története | 👥 👑 |
| GET | `/api/ruhak/:ruhaId/active` | Ruhacikkből kint lévő kiadások | 👥 👑 |
| POST | `/api/ruhak` | Új ruhacikk felvétele | 👑 |
| PATCH | `/api/ruhak/:ruhaId` | Ruhacikk módosítása | 👑 |
| DELETE | `/api/ruhak/:ruhaId` | Ruhacikk törlése | 👑 |
| DELETE | `/api/ruhak/:cikkszam/variants/:minoseg` | Variáns törlése | 👑 |

### Példa kérések:

**Új ruha felvétele:**
```bash
POST /api/ruhak
Authorization: Bearer <token>
Content-Type: application/json

{
  "Cikkszam": 1000001,
  "Fajta": "Póló",
  "Szin": "Kék",
  "Meret": "L",
  "Minoseg": "Új",
  "Mennyiseg": 50
}
```

**Keresés:**
```bash
GET /api/ruhak/search?q=póló
Authorization: Bearer <token>
```

---

## RuhaKiBe – `/api/ruhakibe`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/ruhakibe` | Összes tranzakció listázása | 👥 👑 |
| GET | `/api/ruhakibe/mine` | Saját tranzakciók | 👤 👥 👑 |
| GET | `/api/ruhakibe/active` | Aktív (kint lévő) kiadások | 👥 👑 |
| GET | `/api/ruhakibe/returned` | Lezárt (visszavett) tranzakciók | 👥 👑 |
| GET | `/api/ruhakibe/by-date` | Időszak szerinti szűrés | 👥 👑 |
| GET | `/api/ruhakibe/stats` | Kiadás/visszavétel statisztikák | 👥 👑 |
| GET | `/api/ruhakibe/:ruhaKiBeId` | Egy tranzakció részletei | 👥 👑 |
| POST | `/api/ruhakibe` | Új kiadás rögzítése | 👥 👑 |
| PATCH | `/api/ruhakibe/:ruhaKiBeId` | Visszavétel rögzítése | 👥 👑 |
| DELETE | `/api/ruhakibe/:ruhaKiBeId` | Tranzakció törlése | 👑 |

### Példa kérések:

**Kiadás rögzítése:**
```bash
POST /api/ruhakibe
Authorization: Bearer <token>
Content-Type: application/json

{
  "DolgozoID": 1,
  "Cikkszam": 1000001,
  "Mennyiseg": 2,
  "Indok": "Munkakezdés"
}
```

**Visszavétel rögzítése:**
```bash
PATCH /api/ruhakibe/5
Authorization: Bearer <token>
Content-Type: application/json

{
  "VisszaDatum": "2026-03-05",
  "RuhaMinoseg": "Használt"
}
```

**Dátum szerinti szűrés:**
```bash
GET /api/ruhakibe/by-date?from=2026-01-01&to=2026-03-31
Authorization: Bearer <token>
```

---

## Rendelések – `/api/rendelesek`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/rendelesek` | Összes rendelés listázása | 👥 👑 |
| GET | `/api/rendelesek/pending` | Függőben lévő rendelések | 👥 👑 |
| GET | `/api/rendelesek/by-status/:statusz` | Rendelések státusz szerint | 👥 👑 |
| GET | `/api/rendelesek/by-ruha/:cikkszam` | Rendelések ruhacikk szerint | 👥 👑 |
| GET | `/api/rendelesek/:rendelesId` | Egy rendelés részletei | 👥 👑 |
| POST | `/api/rendelesek` | Új rendelés létrehozása | 👥 👑 |
| PATCH | `/api/rendelesek/:rendelesId` | Rendelés módosítása | 👥 👑 |
| PATCH | `/api/rendelesek/:rendelesId/complete` | Rendelés teljesítése + készlet növelés | 👑 |
| DELETE | `/api/rendelesek/:rendelesId` | Rendelés törlése | 👑 |

### Példa kérések:

**Új rendelés:**
```bash
POST /api/rendelesek
Authorization: Bearer <token>
Content-Type: application/json

{
  "Cikkszam": 1000001,
  "Mennyiseg": 20,
  "Szallito": "WorkWear Kft.",
  "Megjegyzes": "Sürgős rendelés"
}
```

**Rendelés teljesítése:**
```bash
PATCH /api/rendelesek/5/complete
Authorization: Bearer <token>
```

---

## Dashboard – `/api/dashboard`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/dashboard/stats` | Fő statisztikák | 👥 👑 |
| GET | `/api/dashboard/low-stock` | Alacsony készletű ruhák | 👥 👑 |
| GET | `/api/dashboard/recent-activity` | Legutóbbi tevékenységek | 👥 👑 |

### Válasz formátumok:

**Stats:**
```json
{
  "totalWorkers": 25,
  "totalClothes": 150,
  "activeIssues": 45,
  "totalOrders": 12
}
```

---

## Jelentések – `/api/reports`

| Metódus | Útvonal | Leírás | Jog |
|:-------:|:--------|:-------|:---:|
| GET | `/api/reports/inventory` | Teljes készletjelentés | 👥 👑 |
| GET | `/api/reports/employee-summary` | Dolgozónkénti összesítő | 👥 👑 |
| GET | `/api/reports/monthly` | Havi riport | 👥 👑 |
| GET | `/api/reports/quality-summary` | Minőség szerinti összesítés | 👑 |

### Query paraméterek:

**Havi riport:**
```bash
GET /api/reports/monthly?year=2026&month=3
Authorization: Bearer <token>
```

---

## Query Paraméterek Összesítése

| Végpont | Paraméter | Típus | Leírás |
|:--------|:----------|:------|:-------|
| `/api/ruhak/search` | `q` | string | Keresőkifejezés |
| `/api/dolgozok/search` | `q` | string | Keresőkifejezés |
| `/api/ruhakibe/by-date` | `from` | date | Kezdő dátum (YYYY-MM-DD) |
| `/api/ruhakibe/by-date` | `to` | date | Záró dátum (YYYY-MM-DD) |
| `/api/reports/monthly` | `year` | number | Év (pl. 2026) |
| `/api/reports/monthly` | `month` | number | Hónap (1-12) |

---

## HTTP Státuszkódok

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

---

## Hitelesítés

Minden védett végpontnál szükséges a JWT token küldése a fejlécben:

```
Authorization: Bearer <jwt_token>
```

### Token lejárat
A token 24 óra után lejár, újra be kell jelentkezni.

---

## Példa HTTP Fájl

A projekt tartalmaz `.http` fájlokat teszteléshez:

- `backend/test.http` – Alapvető tesztek
- `backend/user_stories_test.http` – User story-k tesztelése
- `backend/erzsi_scenario.http` – Komplex forgatókönyvek
- `backend/all_user_stories.http` – Összes user story

Használat VS Code-ban: **REST Client** kiterjesztéssel.
