# Munyire SaaS Üzleti és Üzemeltetési Terv

## Vezetői Összefoglaló
A Munyire egy speciális, hiánypótló szoftver a KKV szektor számára a munkaruházat és védőeszközök (EVE) nyilvántartására. A célpiac a gyártó, építőipari és logisztikai cégek, ahol a jogszabályi megfelelés (munkavédelmi előírások) kritikus.

---

## 1. Technológiai Stratégia: "Security First" (Biztonság mindenek felett)

Mivel a biztonság az elsődleges szempont, a korábbi (logikai elkülönítés) terv helyett a **Fizikai Adatbázis Elkülönítést** javaslom.

### Architektúra: Multi-Database (SQLite per Tenant)
Minden ügyfélnek (Tenant) saját, fizikailag különálló SQLite adatbázis fájlja van (`tenant_acme.sqlite`, `tenant_omega.sqlite`).
- **Biztonság:** 100% adatszivárgás-mentes. Ha a szoftverben hiba van, akkor sem láthatja át az egyik cég a másik adatait, mert fizikailag nem éri el.
- **Backup:** Egyedi mentés és visszaállítás cégenként megoldható.
- **Megfelelés:** GDPR és audit szempontból a legtisztább megoldás.

---

## 2. Üzemeltetés és Hosting

### Infrastruktúra (Javaslat)
Nem javasolt a drága felhő (AWS/Azure) használata induláskor. Helyette **dedikált VPS** vagy **Managed VPS** javasolt európai adatközpontban (pl. Németország - GDPR miatt).

| Komponens | Javaslat | Költségbecslés (Havi) |
|---|---|---|
| **Szerver** | Hetzner Cloud / DigitalOcean (4 vCPU, 8GB RAM) | 20-30 EUR |
| **Backup** | Napi off-site backup (S3 kompatibilis tároló) | 5-10 EUR |
| **Domain/SSL** | Cloudflare (DDoS védelem + SSL) | Ingyenes / 20 EUR |
| **Összesen** | **Stabil, skálázható alaprendszer** | **~30-50 EUR / hó** |

### Biztonsági intézkedések
- **VPN / IP szűrés:** Opcionálisan az admin felület csak VPN-en keresztül érhető el.
- **Titkosítás:** Adatbázis jelszavak (bcrypt), HTTPS kommunikáció.
- **Audit log:** Minden művelet naplózása (ki, mit, mikor módosított) külön fájlba/rendszerbe.

---

## 3. Licencelés és Árazási Modell

A piacon a **felhasználó alapú** vagy **kezelt állomány alapú** árazás a jellemző. A Munyire esetében a "kezelt dolgozók száma" a legjobb értékmérő.

### Árazási csomagok (Javaslat - Emelt szint)

A piacon a **biztonság** és a **megfelelés** (Compliance) a legdrágább termék. Mivel a Munyire "Security First" (Fizikailag izolált adatbázis) architektúrára épül, ez indokolja a magasabb árazást a konkurenciához képest ("Prémium Biztonság").

| Csomag | Célcsoport | Korlátok | Ár (Javaslat) |
|---|---|---|---|
| **Standard** | Kisebb KKV-k | Max 50 dolgozó | **49.000 Ft / hó** |
| **Business** | Középvállalatok | Max 200 dolgozó | **99.000 Ft / hó** |
| **Enterprise** | Nagyvállalatok | Korlátlan, Dedikált VPS | **249.000 Ft / hó**-tól |

*Az árak nettóban értendők.*

### Miért kérhetünk el ennyit? (Value Proposition)
1. **Fizikai Adatbiztonság:** Nem csak szoftveres védelem – minden cégnek saját, izolált adatbázisa van. Ez Enterprise szintű biztonság.
2. **Jogszabályi Megfelelés:** A rendszer naprakészen kezeli a munkavédelmi előírásokat (EVE juttatás), ami auditkor milliókat spórolhat a cégnek (bírság elkerülése).
3. **Dedikált Környezet:** Az Enterprise csomagban a cég saját, dedikált szerver erőforrást kap, nem osztozik mással (Performance garancia).

### Kiegészítő bevételek (Upsell)
- **On-boarding díj:** 150.000 Ft + (Adatmigráció Excelből, oktatás).
- **SLA (Rendelkezésre állás):** 24/7 support +50% felár.
- **Egyedi riportok:** 25.000 Ft / óra fejlesztési díj.

---

## 4. Piacralépési Terv

1. **Béta fázis (Ingyenes):** 2-3 baráti cég bevonása tesztelésre (cserébe 1 év ingyenes használat).
2. **Referencia gyűjtés:** Az első "éles" ügyfelekkel esettanulmány készítése (mennyi időt spóroltak).
3. **Direkt értékesítés:** Munkavédelmi cégek megkeresése – ők ajánlhatják tovább az ügyfeleiknek jutalékért cserébe (Viszonteladói modell).

---

## Összegzés
A "Security First" megközelítés fizikailag különválasztott adatbázisokkal piaci versenyelőnyt jelent ("Nálunk az adatai fizikailag is biztonságban vannak"). Az árazásnál a havi előfizetés (SaaS) biztosítja a kiszámítható bevételt, míg az egyszeri bevezetési díjak fedezik a kezdeti support költségeket.
