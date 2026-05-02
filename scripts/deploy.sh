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

mkdir -p nginx/conf.d certbot/conf certbot/www

# Helper function to configure HTTP fallback
setup_http_fallback() {
    echo -e "${RED}⚠️ ======================================================== ⚠️${NC}"
    echo -e "${RED}⚠️ CRITICAL WARNING: Tizim HTTP (himoyasiz) rejimiga o'tdi! ⚠️${NC}"
    echo -e "${RED}⚠️ Foydalanuvchi trafigi shifrlanmagan (No SSL/HTTPS).      ⚠️${NC}"
    echo -e "${RED}⚠️ Xato tekshirilib, qayta deploy qilinishi KESKIN tavsiya!⚠️${NC}"
    echo -e "${RED}⚠️ ======================================================== ⚠️${NC}"
    sed "s/DOMAIN_PLACEHOLDER/${DOMAIN:-localhost}/g" nginx/http_only.conf.template > nginx/conf.d/default.conf
    docker compose exec nginx nginx -s reload 2>/dev/null || true
    SSL_ENABLED=0
}

# 2) Domain Validation & Initial Nginx Config
if [ -z "$DOMAIN" ]; then
    echo -e "${YELLOW}ℹ️ DOMAIN kiritilmagan. Nginx faqat HTTP (80-port) orqali ishlaydi.${NC}"
    sed "s/DOMAIN_PLACEHOLDER/localhost/g" nginx/http_only.conf.template > nginx/conf.d/default.conf
    SSL_ENABLED=0
else
    echo -e "${YELLOW}🌐 Domen aniqlandi: $DOMAIN${NC}"
    if [ ! -d "./certbot/conf/live/$DOMAIN" ]; then
        echo -e "${YELLOW}🔒 SSL sertifikat topilmadi. HTTP challenge uchun tayyorlanmoqda...${NC}"
        sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/http_only.conf.template > nginx/conf.d/default.conf
        SSL_ENABLED=1
        NEEDS_CERT=1
    else
        echo -e "${GREEN}✅ SSL sertifikat mavjud.${NC}"
        sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/https.conf.template > nginx/conf.d/default.conf
        SSL_ENABLED=1
        NEEDS_CERT=0
    fi
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
echo -e "${YELLOW}⏳ Backend va Nginx tayyor bo'lishi kutilmoqda...${NC}"
for i in {1..60}; do
    NGINX_STATUS=$(docker inspect --format='{{.State.Health.Status}}' rentgo-nginx 2>/dev/null || echo "starting")
    BACKEND_STATUS=$(docker inspect --format='{{.State.Health.Status}}' rentgo-backend 2>/dev/null || echo "starting")
    
    if [ "$NGINX_STATUS" == "healthy" ] && [ "$BACKEND_STATUS" == "healthy" ]; then
        echo -e "${GREEN}✅ Servislar to'liq ishga tushdi!${NC}"
        break
    fi
    if [ $i -eq 60 ]; then
        echo -e "${RED}⚠️ Servislar 120 soniyada tayyor bo'lmadi, lekin fonda ishga tushishi mumkin.${NC}"
        break
    fi
    sleep 2
done

# 7) Certbot SSL Generation
if [ "$SSL_ENABLED" -eq 1 ] && [ "$NEEDS_CERT" -eq 1 ]; then
    if [ -z "$EMAIL" ]; then
        echo -e "${RED}❌ EMAIL kiritilmagan! SSL olish bekor qilindi.${NC}"
        setup_http_fallback
    else
        echo -e "${YELLOW}🔐 Let's Encrypt orqali SSL olish... ($DOMAIN va www.$DOMAIN)${NC}"
        if docker compose run --rm --entrypoint "\
          certbot certonly --webroot -w /var/www/certbot \
          --email $EMAIL \
          -d $DOMAIN -d www.$DOMAIN \
          --rsa-key-size 4096 \
          --agree-tos \
          --non-interactive \
          --force-renewal" certbot; then
            
            echo -e "${YELLOW}🔄 Nginx HTTPS konfiguratsiyasiga o'tkazilmoqda...${NC}"
            sed "s/DOMAIN_PLACEHOLDER/$DOMAIN/g" nginx/https.conf.template > nginx/conf.d/default.conf
            docker compose exec nginx nginx -s reload
            echo -e "${GREEN}✅ HTTPS muvaffaqiyatli sozlandi!${NC}"
        else
            echo -e "${RED}❌ SSL sertifikat olishda xatolik yuz berdi!${NC}"
            echo -e "${RED}   DNS to'g'ri sozlanganligini tekshiring.${NC}"
            setup_http_fallback
        fi
    fi
fi

# 8) Setup Host-based Auto-Renewal Cron Job with Deploy Hook
if [ "${SSL_ENABLED:-0}" -eq 1 ]; then
    echo -e "${YELLOW}⏳ SSL avto-yangilash (Cron) sozlanmoqda...${NC}"
    # Deploy hook reloads nginx container automatically after successful renewal
    CRON_CMD="0 */12 * * * cd $(pwd) && docker compose run --rm certbot renew --quiet --deploy-hook \"docker exec rentgo-nginx nginx -s reload\""
    (crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "$CRON_CMD") | crontab -
    echo -e "${GREEN}✅ Avto-yangilash (Cron) o'rnatildi.${NC}"
fi

# 9) Clean unused images
echo -e "${YELLOW}🧹 Eski imagelarni tozalash...${NC}"
docker image prune -f

echo ""
echo -e "${GREEN}============================================${NC}"
echo -e "${GREEN}  ✅ Tizim muvaffaqiyatli ishga tushdi!${NC}"
echo -e "${GREEN}============================================${NC}"

# Avtomatik linklarni aniqlash va chiqarish
if [ -z "$DOMAIN" ] || [ "$DOMAIN" == "localhost" ]; then
    PUBLIC_IP=$(curl -s -4 ifconfig.me || echo "SIZNING_IP_MANZILINGIZ")
    BASE_URL="http://${PUBLIC_IP}:8080"
else
    if [ "$SSL_ENABLED" -eq 1 ]; then
        BASE_URL="https://${DOMAIN}:8443"
    else
        BASE_URL="http://${DOMAIN}:8080"
    fi
fi

echo -e "🔗 ${YELLOW}Admin Panel:${NC} ${BASE_URL}/"
echo -e "🔗 ${YELLOW}API Documentation:${NC} ${BASE_URL}/api-docs"
echo -e "🔗 ${YELLOW}Backend API (Healthcheck):${NC} ${BASE_URL}/api/v1/health"
echo ""

docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
