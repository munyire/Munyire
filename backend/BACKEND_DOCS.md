# Munyire Backend Dokumentáció

Ez a dokumentum a Munyire projekt backend API-jának felépítését, végpontjait és működését írja le.

---

## 1. Technológiai Stack

A backend a következő technológiákra épül:
*   **Node.js**: JavaScript futtatókörnyezet a szerveroldali logika megvalósításához.
*   **Express.js**: Minimalista és rugalmas webalkalmazás keretrendszer Node.js-hez.
*   **SQLite3**: Fájl-alapú, szerver nélküli SQL adatbázis-motor.
*   **JSON Web Tokens (JWT)**: Az authentikáció és authorizáció kezelésére szolgáló token-alapú rendszer.
*   **bcrypt.js**: A felhasználói jelszavak biztonságos hash-elésére.
*   **cors**: A frontend és backend közötti Cross-Origin Resource Sharing (CORS) engedélyezésére.
*   **nodemon**: Fejlesztést segítő eszköz, amely a fájlok változásakor automatikusan újraindítja a szervert.

---

## 2. Projekt Struktúra

```
Munyire/
│
└───backend/
    ├───node_modules/       # Telepített csomagok
    ├───middleware/
    │   └───auth.js         # JWT authentikációs middleware
    ├───routes/
    │   ├───auth.js         # Authentikációs (regisztráció, login) végpontok
    │   ├───dolgozok.js     # Dolgozókra vonatkozó CRUD végpontok
    │   ├───rendelesek.js   # Rendelésekre vonatkozó CRUD végpontok
    │   ├───ruhak.js        # Ruhákra vonatkozó CRUD végpontok
    │   └───ruhakibe.js     # Ruha kiadás/visszavétel CRUD végpontok
    ├───database.js         # Adatbázis inicializálása és séma létrehozása
    ├───index.js            # Az Express szerver belépési pontja
    ├───munyire.db          # Az SQLite adatbázis fájl
    ├───package.json        # Projekt függőségek és scriptek
    └───test.http           # Tesztelési HTTP kérések gyűjteménye
```

---

## 3. Telepítés és Indítás

1.  **Navigálj a backend könyvtárba:**
    ```sh
    cd backend
    ```
2.  **Telepítsd a szükséges csomagokat:**
    ```sh
    npm install
    ```
3.  **Indítsd el a fejlesztői szervert:**
    ```sh
    npm start
    ```
A szerver elindul és a `http://localhost:3001` címen lesz elérhető.

---

## 4. Authentikáció

Az API a legtöbb végpontot JWT tokenekkel védi. A token megszerzéséhez a felhasználónak be kell jelentkeznie. A sikeres bejelentkezés után kapott tokent minden védett kérés `x-auth-token` fejlécében kell elküldeni. A token élettartama **1 óra**.

### Végpontok

`POST /api/auth/register`
*   **Leírás**: Új felhasználó (dolgozó) regisztrálása.
*   **Request Body**:
    ```json
    {
        "DNev": "Minta Dolgozó",
        "Email": "minta@email.com",
        "Telefonszam": "123456789",
        "Nem": "Nő",
        "Munkakor": "Manager",
        "Admin": 0,
        "FelhasznaloNev": "mintauser",
        "Jelszo": "jelszo123"
    }
    ```
*   **Sikeres Válasz (201)**:
    ```json
    {
        "message": "User registered successfully",
        "data": { "DID": 1, "FelhasznaloNev": "mintauser" }
    }
    ```

`POST /api/auth/login`
*   **Leírás**: Felhasználó bejelentkeztetése.
*   **Request Body**:
    ```json
    {
        "FelhasznaloNev": "mintauser",
        "Jelszo": "jelszo123"
    }
    ```
*   **Sikeres Válasz (200)**:
    ```json
    {
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
    ```

---

## 5. API Végpontok

Minden alábbi végpont védett, és érvényes `x-auth-token` fejlécet igényel.

### Dolgozók (`/api/dolgozok`)

*   `GET /`: Összes dolgozó lekérdezése. (Jogosultság: Manager, Admin)
*   `GET /:did`: Egy dolgozó lekérdezése ID alapján. (Jogosultság: Manager, Admin)
*   `POST /`: Új dolgozó létrehozása. (Jogosultság: Admin)
*   `PUT /:did`: Dolgozó adatainak frissítése. (Jogosultság: Admin)
*   `DELETE /:did`: Dolgozó törlése. (Jogosultság: Admin)

### Ruhák (`/api/ruhak`)

*   `GET /`: Összes ruha lekérdezése. (Jogosultság: Manager, Admin)
*   `GET /:kid`: Egy ruha lekérdezése ID alapján. (Jogosultság: Manager, Admin)
*   `POST /`: Új ruha létrehozása a készletben. (Jogosultság: Admin)
*   `PUT /:kid`: Ruha adatainak (pl. mennyiség) frissítése. (Jogosultság: Admin)
*   `DELETE /:kid`: Ruha törlése a készletből. (Jogosultság: Admin)

### Ruha Kiadás/Visszavétel (`/api/ruhakibe`)

*   `GET /`: Összes kiadási/visszavételi tranzakció lekérdezése. (Jogosultság: Manager, Admin)
*   `GET /:kiadasid`: Egy tranzakció lekérdezése ID alapján. (Jogosultság: Manager, Admin)
*   `POST /`: Új kiadási/visszavételi tranzakció létrehozása. (Jogosultság: Manager, Admin)
*   `PUT /:kiadasid`: Tranzakció adatainak frissítése (pl. visszavétel dátuma). (Jogosultság: Admin)
*   `DELETE /:kiadasid`: Tranzakció törlése. (Jogosultság: Admin)

### Rendelések (`/api/rendelesek`)

*   `GET /`: Összes rendelés lekérdezése. (Jogosultság: Manager, Admin)
*   `GET /:rid`: Egy rendelés lekérdezése ID alapján. (Jogosultság: Manager, Admin)
*   `POST /`: Új rendelés létrehozása. (Jogosultság: Manager, Admin)
*   `PUT /:rid`: Rendelés adatainak frissítése. (Jogosultság: Manager, Admin)
*   `DELETE /:rid`: Rendelés törlése. (Jogosultság: Admin)
