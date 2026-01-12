# Munyire API Dokumentáció

Ez a dokumentáció részletezi a Munyire backend API végpontjait, a hitelesítést és az adatstruktúrákat.

**Base URL:** `http://localhost:3000/api`

## Hitelesítés (Authentication)

Az API `Bearer Token` hitelesítést használ. A sikeres bejelentkezés után kapott tokent minden védett végpont hívásakor el kell küldeni a fejlécben.

**Fejléc formátum:**
`Authorization: Bearer <token>`

### Jogosultsági Szintek (Roles)
- **Admin**: Teljes hozzáférés (rendszergazda).
- **Manager**: Hozzáférés a legtöbb listázáshoz és kezeléshez (kivéve adminisztratív feladatok).
- **Dolgozo**: Korlátozott hozzáférés (saját adatok).

---

## 1. Auth Végpontok (`/auth`)

### Bejelentkezés
**POST** `/auth/login`
- **Hozzáférés:** Nyilvános
- **Kérés törzs:**
  ```json
  {
    "username": "admin",
    "password": "password"
  }
  ```
- **Válasz (200 OK):**
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsIn...",
    "user": {
      "id": 1,
      "name": "Adminisztrátor",
      "role": "Admin",
      "username": "admin"
    }
  }
  ```

### Regisztráció
**POST** `/auth/register`
- **Hozzáférés:** Admin
- **Kérés törzs:**
  ```json
  {
    "name": "Új Manager",
    "email": "manager@test.com",
    "username": "manager1",
    "password": "password123",
    "role": "Manager" // Opcionális, alapértelmezett: Dolgozo
  }
  ```
- **Válasz (201 Created):**
  ```json
  {
    "id": 5,
    "username": "manager1",
    "role": "Manager"
  }
  ```

---

## 2. Dolgozók (`/dolgozok`)

### Összes dolgozó listázása
**GET** `/dolgozok`
- **Hozzáférés:** Manager, Admin
- **Válasz (200 OK):** Dolgozó objektumok tömbje.

### Dolgozó nevek listázása (Dropdownhoz)
**GET** `/dolgozok/names`
- **Hozzáférés:** Manager, Admin
- **Válasz (200 OK):**
  ```json
  [
    { "DolgozoID": 1, "DNev": "Kiss János" },
    ...
  ]
  ```

### Egy dolgozó lekérdezése
**GET** `/dolgozok/:id`
- **Hozzáférés:** Saját maga, Manager, Admin
- **Válasz (200 OK):** Teljes dolgozó objektum (jelszó nélkül).

### Dolgozó módosítása
**PATCH** `/dolgozok/:id`
- **Hozzáférés:** Admin
- **Kérés törzs:** (Bármely mező opcionális)
  ```json
  {
    "DNev": "Nagy János",
    "Telefonszam": "+36301234567",
    "Szerepkor": "Manager"
  }
  ```

### Dolgozó törlése
**DELETE** `/dolgozok/:id`
- **Hozzáférés:** Admin
- **Válasz (204 No Content)**

### Egyéb lekérdezések
- **GET** `/dolgozok/:id/ruhak`: Dolgozó összes eddigi ruhakiadása.
- **GET** `/dolgozok/:id/ruhak/aktiv`: Dolgozónál lévő (vissza nem hozott) ruhák.
- **GET** `/dolgozok/with-active-items`: Azok a dolgozók listája, akiknél van kint ruha.

---

## 3. Ruhák (`/ruhak`)

### Ruhák listázása
**GET** `/ruhak`
- **Hozzáférés:** Manager, Admin
- **Válasz (200 OK):** Lista a raktáron lévő ruhákról.

### Keresés
**GET** `/ruhak/search?q=...`
- **Hozzáférés:** Manager, Admin
- **Paraméter:** `q` (keresőkifejezés: cikkszám, név, méret, szín)

### Új ruha felvétele
**POST** `/ruhak`
- **Hozzáférés:** Admin
- **Kérés törzs:**
  ```json
  {
    "Cikkszam": 1000001, // 7-jegyű egész szám. Ha nincs megadva, automatikusan generálódik.
    "Fajta": "Póló",
    "Szin": "Kék",
    "Meret": "L",
    "Minoseg": "Új", // Opcionális, alapért.: Új (Kezdő készlet minősége)
    "Mennyiseg": 50 // Kezdő készlet mennyisége
  }
  ```
- **Megjegyzés:** A rendszer nem enged két ruhát azonos attribútumokkal (Fajta, Szin, Meret). A Minőség és Mennyiség a Raktár táblába kerül.

### Ruha módosítása
**PATCH** `/ruhak/:cikkszam`
- **Hozzáférés:** Admin
- **Kérés törzs:** Adatok módosítása (kivéve Cikkszam).

### Ruha törlése
**DELETE** `/ruhak/:cikkszam`
- **Hozzáférés:** Admin

### Metadata Opciók
**GET** `/ruhak/options`
- **Válasz:** Elérhető típusok (fajta), színek és méretek listája a szűrőkhöz.

---

## 4. Ruha Tranzakciók - Kiadás/Visszavétel (`/ruhakibe`)

### Kiadás rögzítése (Issue)
**POST** `/ruhakibe`
- **Hozzáférés:** Manager, Admin
- **Kérés törzs:**
  ```json
  {
    "DolgozoID": 1,
    "Cikkszam": 1000001, // RuhaID helyett Cikkszam (int)
    "Mennyiseg": 1, // Opcionális, alapért.: 1
    "Indok": "Munkakezdés" // Opcionális
  }
  ```
- **Válasz (201 Created)**

### Visszavétel rögzítése (Return)
**PATCH** `/ruhakibe/:id`
- **Hozzáférés:** Manager, Admin
- **Kérés törzs:**
  ```json
  {
    "VisszaDatum": "2026-01-12", // Opcionális, alapért.: mai nap
    "RuhaMinoseg": "Használt" // Opcionális, mi lett a ruha állapota
  }
  ```

### Listázások
- **GET** `/ruhakibe`: Összes tranzakció.
- **GET** `/ruhakibe/active`: Csak a kint lévő (vissza nem hozott) tételek.
- **GET** `/ruhakibe/stats`: Statisztikák (pl. összes kiadott, aktív).

---

## 5. Rendelések (`/rendelesek`)

### Új rendelés leadása
**POST** `/rendelesek`
- **Hozzáférés:** Manager, Admin
- **Kérés törzs:**
  ```json
  {
    "Cikkszam": 1000001, // RuhaID helyett Cikkszam (int)
    "Mennyiseg": 20,
    "Szallito": "WorkWear Kft.",
    "Megjegyzes": "Sürgős"
  }
  ```

### Rendelés teljesítése (Complete)
**PATCH** `/rendelesek/:id/complete`
- **Hozzáférés:** Admin
- **Leírás:** A rendelést teljesítettre állítja ÉS a rendelt mennyiséget hozzáadja a raktárkészlethez.

### Listázások
- **GET** `/rendelesek`: Összes rendelés.
- **GET** `/rendelesek/pending`: Csak a függőben lévő rendelések.

---

## 6. Dashboard és Jelentések (`/dashboard`, `/reports`)

### Dashboard
- **GET** `/dashboard/stats`: Főbb számok (dolgozók, készlet, kiadások).
- **GET** `/dashboard/low-stock`: Alacsony készletű termékek listája.
- **GET** `/dashboard/recent-activity`: Legutóbbi kiadások/visszavételek.

### Jelentések
- **GET** `/reports/inventory`: Részletes leltár jelentés.
- **GET** `/reports/employee-summary`: Összesítés dolgozónként (kiadott ruhák száma).
- **GET** `/reports/monthly?year=2026&month=1`: Havi forgalmi jelentés.
- **GET** `/reports/quality-summary`: Ruhák állapot szerinti eloszlása.

---

## Hibakezelés

Hiba esetén az API a megfelelő HTTP státuszkóddal és egy JSON objektummal válaszol:

```json
{
  "error": "Hibaüzenet leírása"
}
```

- **400 Bad Request**: Hiányzó vagy hibás adat.
- **401 Unauthorized**: Nincs bejelentkezve vagy lejárt token.
- **403 Forbidden**: Nincs jogosultsága a művelethez.
- **404 Not Found**: A kért erőforrás nem található.
- **409 Conflict**: Ütközés (pl. már létező felhasználónév vagy ruha).
- **500 Internal Server Error**: Szerveroldali hiba.
