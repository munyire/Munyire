# TO-DO Lista

## Projekt Fejlesztések
- [ ] Sequelize ORM beépítése a projektbe a natív `sqlite3` driver helyett.
- [ ] A `nodemon` csomag áthelyezése a `dependencies`-ből a `devDependencies`-be.

## Új Funkciók és Adatbázis Bővítések (Felvetések)
- [ ] **Ruha minőség:** Új mező bevezetése a ruhák minőségének követésére (pl. `Uj`, `Hasznalt`). Ezt a visszaadásnál is rögzíteni kellene.
- [ ] **ID elnevezések:** Az adatbázisban lévő ID oszlopok (pl. `KID`, `DID`, `RID`) nevének egységesítése a jobb olvashatóság érdekében (pl. `RuhaID`, `DolgozoID`).
- [ ] **Rendelés státusza:** A `Rendelesek` tábla bővítése egy `Statusz` mezővel (pl. `Leadva`, `Megjött`).