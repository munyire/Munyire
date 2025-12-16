# TO-DO Lista

## Jövőbeli Fejlesztések

### Kódminőség és Karbantarthatóság
- [ ] **Linting és Formázás bevezetése:** `ESLint` és `Prettier` integrálása a konzisztens, hibamentes kódstílus automatikus kikényszerítésére.
- [ ] **Központi Middleware-ek:** A route-okban ismétlődő middleware-ek (pl. `isAdmin`) kiszervezése egy központi `middleware` mappába a kódismétlés csökkentése érdekében.
- [ ] **Központi Hibakezelés:** Egységes hibakezelő middleware létrehozása a felhasználóbarát és konzisztens API hibaüzenetekért.

### Biztonság és Adatbázis
- [ ] **Környezeti Változók Használata:** Az érzékeny adatok (pl. JWT titkos kulcs) kiszervezése `.env` fájlba a `dotenv` csomag segítségével.
- [ ] **Bemeneti Adatok Validálása:** Validációs réteg bevezetése (`joi` vagy `express-validator` segítségével) az API végpontok védelmére a hibás vagy rosszindulatú adatokkal szemben.


---

## Elkészült Feladatok
- [x] Sequelize ORM beépítése a projektbe.
- [x] `nodemon` csomag áthelyezése a `devDependencies`-be.
- [x] **Adatbázis bővítése:**
    - [x] Ruha minőségének követése.
    - [x] ID oszlopok egységes átnevezése.
    - [x] Rendelések státuszának követése.
