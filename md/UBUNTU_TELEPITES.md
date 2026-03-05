# Munyire - Ubuntu Szerver Telepítési Útmutató

Ez az útmutató részletesen bemutatja, hogyan telepítheted a Munyire munkaruhakezelő rendszert egy Ubuntu szerveren.

---

## 📋 Előfeltételek

### Rendszerkövetelmények

| Komponens | Minimum verzió | Ajánlott verzió |
|-----------|---------------|-----------------|
| Ubuntu | 20.04 LTS | 22.04 LTS vagy újabb |
| Node.js | 18.x | 22.x LTS |
| npm | 8.x | 10.x |
| RAM | 512 MB | 1 GB |
| Tárhely | 1 GB | 2 GB |

### Szükséges csomagok telepítése

```bash
# Rendszer frissítése
sudo apt update && sudo apt upgrade -y

# Node.js telepítése (NodeSource repository-ból)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# Verziók ellenőrzése
node --version  # v22.x.x vagy újabb
npm --version   # 10.x.x vagy újabb

# Git telepítése (ha még nincs)
sudo apt install -y git
```

---

## 🚀 Telepítés

### 1. Repository klónozása

```bash
# Navigálj a célkönyvtárba (pl. /opt vagy /var/www)
cd /var/www

# Repository klónozása
sudo git clone https://github.com/munyire/Munyire.git

# Jogosultságok beállítása a saját felhasználódra
sudo chown -R $USER:$USER Munyire
cd Munyire
```

### 2. Függőségek telepítése

```bash
# Backend függőségek
cd backend
npm install
cd ..

# Frontend függőségek
cd frontend
npm install
cd ..
```

### 3. Környezeti változók beállítása

```bash
cd backend

# .env fájl létrehozása az example alapján
cp env.example .env

# .env szerkesztése (nano vagy vim használatával)
nano .env
```

**Ajánlott .env beállítások szerverhez:**

```env
# Port - 3000 az alapértelmezett, de használhatsz másikat is
PORT=3000

# JWT titkos kulcs - generálj erős, véletlenszerű kulcsot!
# Példa generálás: openssl rand -base64 32
JWT_SECRET=ide-ird-a-32-karakteres-titkos-kulcsodat

# Adatbázis elérési út
DB_PATH=./database.sqlite

# Bcrypt körök (10-12 ajánlott)
BCRYPT_ROUNDS=10

# Adatbázis naplózás (production-ban false)
DB_LOGGING=false

# Admin felhasználó beállításai
ADMIN_USER=admin
ADMIN_PASS=ValamiBiztonsagosJelszo123!
ADMIN_EMAIL=admin@cegnev.hu

# Opcionális: Manager felhasználó
MANAGER_USER=manager
MANAGER_EMAIL=manager@cegnev.hu
```

**Fontos biztonsági megjegyzések:**
- A `JWT_SECRET` legyen legalább 32 karakteres, véletlenszerű karaktersorozat
- Az `ADMIN_PASS` legyen erős jelszó (nagybetű, kisbetű, szám, speciális karakter)
- Éles környezetben soha ne használd az alapértelmezett jelszavakat!

cd ..
```

### 4. Alkalmazás buildelése

```bash
# A root mappából futtasd
npm run build
```

Ez a parancs:
1. Buildeli a frontendet (`frontend/dist` mappa)
2. Átmásolja a buildelt fájlokat a `backend/dist` mappába

Sikeres build esetén a következő üzenetet látod:
```
✅ Build completed successfully!
```

---

## ▶️ Alkalmazás indítása

### Egyszerű indítás (teszteléshez)

```bash
cd backend
npm start
```

Az alkalmazás elérhető lesz: `http://szerver-ip-címe:3000`

### Systemd szolgáltatásként (ajánlott)

Hozz létre egy systemd service fájlt:

```bash
sudo nano /etc/systemd/system/munyire.service
```

**Tartalom:**

```ini
[Unit]
Description=Munyire Munkaruhakezelő Rendszer
After=network.target

[Service]
Type=simple
User=www-data
Group=www-data
WorkingDirectory=/opt/Munyire/backend
ExecStart=/usr/bin/node /opt/Munyire/backend/app.js
Restart=on-failure
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=munyire
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

**Jogosultságok beállítása:**

```bash
# www-data felhasználó hozzáférése a projekthez
sudo chown -R www-data:www-data /var/www/Munyire

# Írási jog az adatbázis könyvtárnak
sudo chmod 755 /var/www/Munyire/backend
```

**Szolgáltatás indítása:**

```bash
# Systemd újratöltése
sudo systemctl daemon-reload

# Szolgáltatás engedélyezése (autostart)
sudo systemctl enable munyire

# Szolgáltatás indítása
sudo systemctl start munyire

# Státusz ellenőrzése
sudo systemctl status munyire
```

**Hasznos parancsok:**

```bash
# Újraindítás
sudo systemctl restart munyire

# Leállítás
sudo systemctl stop munyire

# Naplók megtekintése
sudo journalctl -u munyire -f
```

---

## 🔒 Nginx reverse proxy (ajánlott)

HTTPS és domain használatához ajánlott Nginx-et használni reverse proxy-ként.

### Nginx telepítése

```bash
sudo apt install -y nginx
```

### Konfigurációs fájl létrehozása

```bash
sudo nano /etc/nginx/sites-available/munyire
```

**Tartalom (HTTP):**

```nginx
server {
    listen 80;
    server_name ruhakezeles.cegnev.hu;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Aktiválás:**

```bash
# Szimbolikus link létrehozása
sudo ln -s /etc/nginx/sites-available/munyire /etc/nginx/sites-enabled/

# Alapértelmezett site eltávolítása (opcionális)
sudo rm /etc/nginx/sites-enabled/default

# Nginx konfiguráció tesztelése
sudo nginx -t

# Nginx újraindítása
sudo systemctl restart nginx
```

### HTTPS beállítása (Let's Encrypt)

```bash
# Certbot telepítése
sudo apt install -y certbot python3-certbot-nginx

# SSL tanúsítvány kérése
sudo certbot --nginx -d ruhakezeles.cegnev.hu

# Automatikus megújítás tesztelése
sudo certbot renew --dry-run
```

---

## 🔄 Frissítés (Új verzió telepítése)

Ha a kódban változtatás történt (git pull után), kövesd ezeket a lépéseket:

### 1. Adatbázis biztonsági mentése (AJÁNLOTT)

```bash
cd /opt/Munyire
mkdir -p backups
cp backend/database.sqlite backups/database-$(date +%Y%m%d-%H%M%S).sqlite
```

### 2. Legfrissebb kód letöltése

```bash
cd /opt/Munyire

# Lokális változtatások eldobása (ha van) - CSAK ha biztos vagy benne!
git reset --hard

# Legfrissebb kód letöltése
git pull origin main
```

### 3. Függőségek frissítése

```bash
# Backend függőségek
cd backend && npm install && cd ..

# Frontend függőségek  
cd frontend && npm install && cd ..
```

### 4. Újrabuildelés és újraindítás

```bash
# Frontend újra buildelése
npm run build

# Szolgáltatás újraindítása
sudo systemctl restart munyire
```

### 5. Ellenőrzés

```bash
# Szolgáltatás státusz
sudo systemctl status munyire

# Naplók ellenőrzése
sudo journalctl -u munyire -n 20 --no-pager
```

---

### 🚀 Automatikus frissítő script

A projekt tartalmaz egy `update.sh` scriptet, amely automatizálja a frissítési folyamatot:

```bash
# Futtatás (a projekt gyökérkönyvtárából)
bash update.sh

# Vagy először futtathatóvá tesszük:
chmod +x update.sh
./update.sh
```

**A script a következőket végzi el:**
1. ✅ Adatbázis backup készítése (`backups/` mappába)
2. ✅ `git pull origin main` - legfrissebb kód letöltése
3. ✅ `npm install` - backend és frontend függőségek frissítése
4. ✅ `npm run build` - frontend újra buildelése
5. ✅ `sudo systemctl restart munyire` - szolgáltatás újraindítása
6. ✅ Státusz kiírása a végén

---

### 📝 Gyakori frissítési forgatókönyvek

| Helyzet | Teendő |
|---------|--------|
| **CSS/JS változtatás** | `npm run build` + `sudo systemctl restart munyire` |
| **Backend kód változtatás** | `sudo systemctl restart munyire` (automatikusan újratölt) |
| **Új npm csomag** | `npm install` az adott mappában + build + restart |
| **Adatbázis séma változás** | `sudo systemctl restart munyire` (Sequelize sync automatikusan kezeli) |
| **Minden frissítése** | `bash update.sh` (ajánlott) |

---

### ⚠️ Fontos megjegyzések

1. **A `.env` fájl megmarad** - a git pull nem írja felül (nincs verziókezelve)
2. **Az adatbázis megmarad** - a `database.sqlite` nincs verziókezelve
3. **Backup mindig ajánlott** - különösen nagyobb frissítéseknél
4. **Downtime** - a restart ~2-5 másodpercig tart
5. **A `backups/` mappa** - az `update.sh` automatikusan létrehozza és ide menti az adatbázist

---

## 🔧 Hibaelhárítás

### Alkalmazás nem indul

```bash
# Naplók megtekintése
sudo journalctl -u munyire -n 50

# Port foglaltság ellenőrzése
sudo lsof -i :3000

# Adatbázis jogosultságok
ls -la /opt/Munyire/backend/database.sqlite
```

### Port módosítása

Ha a 3000-es port foglalt, változtasd meg a `.env` fájlban:

```env
PORT=3001
```

Majd indítsd újra:

```bash
sudo systemctl restart munyire
```

### Adatbázis hibák

```bash
# Adatbázis biztonsági mentése
cp /opt/Munyire/backend/database.sqlite /opt/Munyire/backend/database.sqlite.backup

# Adatbázis jogosultságok javítása
sudo chown www-data:www-data /opt/Munyire/backend/database.sqlite
sudo chmod 664 /opt/Munyire/backend/database.sqlite
```

---

## 📁 Fontos fájlok és helyek

| Fájl/Könyvtár | Leírás |
|---------------|--------|
| `/opt/Munyire/backend/.env` | Környezeti változók |
| `/opt/Munyire/backend/database.sqlite` | SQLite adatbázis |
| `/opt/Munyire/backend/dist/` | Buildelt frontend fájlok |
| `/var/log/syslog` | Rendszer naplók |
| `/etc/systemd/system/munyire.service` | Systemd szolgáltatás |
| `/etc/nginx/sites-available/munyire` | Nginx konfiguráció |

---

## 🔐 Biztonsági javaslatok

1. **Tűzfal beállítása** (UFW):
   ```bash
   sudo ufw allow OpenSSH
   sudo ufw allow 'Nginx Full'
   sudo ufw enable
   ```

2. **Rendszeres biztonsági mentés**:
   ```bash
   # Adatbázis mentése cron jobbal (naponta)
   0 2 * * * cp /opt/Munyire/backend/database.sqlite /backup/munyire-$(date +\%Y\%m\%d).sqlite
   ```

3. **Rendszer frissítése**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Erős jelszavak használata** minden felhasználói fiókhoz

---

## 📞 Támogatás

Ha problémád adódik:
1. Ellenőrizd a naplófájlokat: `sudo journalctl -u munyire -f`
2. Nézd meg az alkalmazás logokat a backend mappában
3. Ellenőrizd az Nginx hibanaplókat: `sudo tail -f /var/log/nginx/error.log`

---

**Verzió:** 1.0  
**Utolsó frissítés:** 2026. március
