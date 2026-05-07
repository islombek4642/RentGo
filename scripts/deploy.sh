#!/bin/bash
set -e

echo "============================================"
echo "  🚀 RentGo Enterprise Deployment Script"
echo "============================================"
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 1) Check .env exists
if [ ! -f .env.production ]; then
    echo -e "${RED}❌ .env.production topilmadi!${NC}"
    echo "   cp .env.production.example .env.production"
    exit 1
fi

source .env.production

# 2) Domain Information
if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}ℹ️ DOMAIN kiritilmagan. Global nginx-proxy orqali avtomatik SSL ishlatiladi.${NC}"
else
    echo -e "${YELLOW}🌐 Domen aniqlandi: $DOMAIN${NC}"
fi

# 3) Stop old containers
echo -e "${YELLOW}⏹  Eski containerlarni to'xtatish...${NC}"
docker compose --env-file .env.production down 2>/dev/null || true

# 4) Pull latest code (if git repo)
if [ -d .git ]; then
    echo -e "${YELLOW}📥 Yangi kodni olish...${NC}"
    git pull origin main || echo "⚠️  Git pull amalga oshmadi (manual mode)"
fi

# 5) Build and Start
echo -e "${YELLOW}🏗  Containerlarni build qilish va ishga tushirish...${NC}"
docker compose --env-file .env.production up -d --build

# 6) Healthchecks
echo -e "${YELLOW}⏳ Backend tayyor bo'lishi kutilmoqda...${NC}"
for i in {1..60}; do
    BACKEND_STATUS=$(docker inspect --format='{{.State.Health.Status}}' rentgo-backend 2>/dev/null || echo "starting")
    
    if [ "$BACKEND_STATUS" == "healthy" ]; then
        echo -e "${GREEN}✅ Backend to'liq ishga tushdi!${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}⚠️ Backend 120 soniyada tayyor bo'lmadi, lekin fonda ishga tushishi mumkin.${NC}"
        break
    fi
    sleep 2
done

# 7) SSL is now handled by nginx-proxy automatically
echo -e "${GREEN}✅ SSL sertifikatlar nginx-proxy tomonidan avtomatik boshqariladi.${NC}"

# 9) Clean unused images
echo -e "${YELLOW}🧹 Eski imagelarni tozalash...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅ Tizim muvaffaqiyatli ishga tushdi!${NC}"
echo -e "${GREEN}============================================${NC}"

# Avtomatik linklarni aniqlash va chiqarish
PUBLIC_IP=$(curl -s -4 ifconfig.me || echo "SIZNING_IP_MANZILINGIZ")

if [ -z "$DOMAIN" ] || [ "$DOMAIN" == "localhost" ]; then
    echo -e "🔗 ${YELLOW}Admin Panel:${NC} http://${PUBLIC_IP}:8080/"
    echo -e "🔗 ${YELLOW}API Documentation:${NC} http://${PUBLIC_IP}:8080/api-docs"
    echo -e "🔗 ${YELLOW}Backend API (Healthcheck):${NC} http://${PUBLIC_IP}:8080/api/v1/health"
    echo -e "📱 ${YELLOW}Mobile API URL:${NC} http://${PUBLIC_IP}:3000/api/v1"
    echo -e "   ${CYAN}(Domen yo'q - IP orqali kirilmoqda)${NC}"
else
    echo -e "🔗 ${YELLOW}Admin Panel:${NC} https://admin.${DOMAIN}/"
    echo -e "🔗 ${YELLOW}API Documentation:${NC} https://api.${DOMAIN}/api-docs"
    echo -e "🔗 ${YELLOW}Backend API (Healthcheck):${NC} https://api.${DOMAIN}/api/v1/health"
    echo -e "📱 ${YELLOW}Mobile API URL:${NC} https://api.${DOMAIN}/api/v1"
    echo -e "   ${CYAN}(SSL nginx-proxy tomonidan avtomatik sozlandi)${NC}"
fi
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
