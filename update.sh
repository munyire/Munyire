#!/bin/bash

# Munyire - Frissítő Script
# Használat: bash update.sh
# Vagy: chmod +x update.sh && ./update.sh

set -e  # Kilép hiba esetén

echo "🚀 Munyire frissítés indítása..."
echo "================================"

# Színek a kiíráshoz
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Projekt könyvtár meghatározása
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$PROJECT_DIR"

echo ""
echo "📁 Projekt könyvtár: $PROJECT_DIR"

# 1. Backup mappa létrehozása és adatbázis mentése
echo ""
echo "💾 Adatbázis biztonsági mentése..."
mkdir -p backups

if [ -f "backend/database.sqlite" ]; then
    BACKUP_FILE="backups/database-$(date +%Y%m%d-%H%M%S).sqlite"
    cp backend/database.sqlite "$BACKUP_FILE"
    echo -e "${GREEN}✓${NC} Backup kész: $BACKUP_FILE"
else
    echo -e "${YELLOW}⚠${NC} Nincs adatbázis fájl, backup kihagyva"
fi

# 2. Git pull - legfrissebb kód letöltése
echo ""
echo "📥 Legfrissebb kód letöltése..."

# Ellenőrizzük, hogy git repo-e
if [ ! -d ".git" ]; then
    echo -e "${RED}✗${NC} Hiba: Ez nem egy git repository!"
    exit 1
fi

# Git pull
if git pull origin main; then
    echo -e "${GREEN}✓${NC} Kód sikeresen frissítve"
else
    echo -e "${RED}✗${NC} Hiba a git pull során!"
    exit 1
fi

# 3. Backend függőségek frissítése
echo ""
echo "📦 Backend függőségek ellenőrzése..."
cd backend
if npm install; then
    echo -e "${GREEN}✓${NC} Backend függőségek kész"
else
    echo -e "${RED}✗${NC} Hiba a backend függőségek telepítésekor!"
    exit 1
fi
cd ..

# 4. Frontend függőségek frissítése
echo ""
echo "📦 Frontend függőségek ellenőrzése..."
cd frontend
if npm install; then
    echo -e "${GREEN}✓${NC} Frontend függőségek kész"
else
    echo -e "${RED}✗${NC} Hiba a frontend függőségek telepítésekor!"
    exit 1
fi
cd ..

# 5. Frontend build
echo ""
echo "🔨 Frontend build..."
if npm run build; then
    echo -e "${GREEN}✓${NC} Build sikeres"
else
    echo -e "${RED}✗${NC} Hiba a build során!"
    exit 1
fi

# 6. Szolgáltatás újraindítása
echo ""
echo "🔄 Szolgáltatás újraindítása..."
if systemctl is-active --quiet munyire; then
    if sudo systemctl restart munyire; then
        echo -e "${GREEN}✓${NC} Szolgáltatás újraindítva"
    else
        echo -e "${RED}✗${NC} Hiba az újraindítás során!"
        exit 1
    fi
else
    echo -e "${YELLOW}⚠${NC} A munyire szolgáltatás nem fut, restart kihagyva"
    echo "   Indítás: cd backend && npm start"
fi

# 7. Státusz ellenőrzése
echo ""
echo "================================"
echo "✅ Frissítés sikeresen befejezve!"
echo ""
echo "Státusz ellenőrzése:"
echo "--------------------"

# Git verzió
echo -n "Git verzió: "
git log -1 --pretty=format:"%h - %s (%cr)" 2>/dev/null || echo "N/A"

# Szolgáltatás státusz
if systemctl is-active --quiet munyire; then
    echo -e "Szolgáltatás: ${GREEN}Fut${NC}"
    echo "Port: $(sudo lsof -i -P -n | grep LISTEN | grep node | awk '{print $9}' | head -1 || echo "N/A")"
else
    echo -e "Szolgáltatás: ${RED}Nem fut${NC}"
fi

echo ""
echo "Naplók megtekintése:"
echo "  sudo journalctl -u munyire -f"
echo ""
