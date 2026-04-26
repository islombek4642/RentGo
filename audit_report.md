# RentGo - To'liq Loyiha Tahlili

> **Tayyorlangan:** 2026-yil 25-aprel  
> **Loyiha nomi:** RentGo - Avtomobil ijarasi platformasi  
> **Platforma:** Backend (Node.js/Express) + Mobile (React Native/Expo)

---

## 1. Loyiha haqida umumiy tushuncha

**RentGo** - O'zbekistondagi avtomobil ijarasi uchun mo'ljallangan P2P (peer-to-peer) marketpleys platformasi. Foydalanuvchilar o'z mashinalarini ijaraga berishlari va boshqa foydalanuvchilarning mashinalarini ijaraga olishlari mumkin.

### Asosiy xususiyatlari:
- **Ijaraga beruvchilar (Owner):** O'z mashinalarini platformaga joylab, daromad olishlari mumkin
- **Ijarachilar (Renter):** Platformadagi mavjud mashinalarni ijaraga olishlari mumkin
- **O'zaro ishonch tizimi:** Reyting va verifikatsiya orqali foydalanuvchilar o'rtasida ishonch yaratiladi
- **Real-vaqt band qilish:** Takvim tizimi orqali sanalarni real vaqtda band qilish

### Texnologik stack:
| Komponent | Texnologiya |
|-----------|-------------|
| Backend | Node.js, Express.js |
| Ma'lumotlar bazasi | PostgreSQL |
| Mobil ilova | React Native + Expo |
| State Management | Zustand |
| Autentifikatsiya | JWT (Access + Refresh tokens) |
| Hujjatlar | Swagger/OpenAPI |
| Tarjima | i18next |

---

## 2. Backend arxitekturasi

### 2.1 Loyiha tuzilishi

```
src/
├── app.js                 # Express ilovasi konfiguratsiyasi
├── server.js              # Server ishga tushirish
├── config/                # Konfiguratsiya fayllari
│   ├── db.js             # PostgreSQL ulanishi
│   ├── env.js            # Muhit o'zgaruvchilari
│   ├── logger.js         # Winston logger
│   └── swagger.js        # Swagger hujjatlari
├── middleware/            # Express middleware'lar
│   ├── auth.middleware.js      # JWT tekshiruvi
│   ├── error.middleware.js     # Global xatolik qayta ishlash
│   ├── lang.middleware.js      # Til aniqlash
│   ├── security.middleware.js  # Xavfsizlik (helmet, rate-limit, CORS)
│   ├── upload.middleware.js    # Fayl yuklash
│   └── validate.middleware.js  # Ma'lumotlar validatsiyasi
├── modules/               # Modul-asosiy arxitektura
│   ├── auth/             # Autentifikatsiya moduli
│   ├── bookings/         # Band qilish moduli
│   ├── cars/             # Mashinalar moduli
│   ├── locations/        # Hududlar moduli
│   ├── reviews/          # Sharhlar moduli
│   └── users/            # Foydalanuvchilar moduli
├── routes/                # Yo'nalishlar
│   ├── index.js          # Asosiy router
│   └── health.routes.js  # Health check
├── utils/                 # Yordamchi utilitalar
│   ├── AppError.js       # Xatolik klassi
│   ├── asyncHandler.js   # Async handler
│   ├── date-utils.js     # Sana yordamchilari
│   └── i18n.js           # Backend tarjima tizimi
└── constants/             # Konstantalar
    └── index.js          # HTTP status, rollar, buyurtma statuslari
```

### 2.2 Modul arxitekturasi (Controller-Service-Repository)

Har bir modul 3 qatlamli arxitekturaga ega:

```
modules/[module]/
├── [module].controller.js    # HTTP so'rovlarini qayta ishlash
├── [module].service.js       # Biznes logika
├── [module].repository.js  # Ma'lumotlar bazasi operatsiyalari
├── [module].routes.js        # API yo'nalishlari
└── [module].validation.js    # Joi validatsiya sxemalari
```

#### Misol: Band qilish moduli

**Controller (`bookings.controller.js`):**
- HTTP so'rovlarini qabul qiladi
- Service qatlamiga yo'naltiradi
- Javoblarni formatlaydi

**Service (`bookings.service.js`):**
- Biznes logikani bajaradi
- Sanalar o'rtasida to'qnashuvni tekshiradi
- Narx hisoblash
- Buyurtma holatlarini boshqaradi

**Repository (`bookings.repository.js`):**
- SQL so'rovlarini bajaradi
- Ma'lumotlar bazasi bilan to'g'ridan-to'g'ri aloqa

### 2.3 Mavjud modullar

| Modul | Tavsif | Asosiy funksiyalar |
|-------|--------|-------------------|
| **auth** | Autentifikatsiya | Ro'yxatdan o'tish, kirish, token yangilash, chiqish |
| **bookings** | Band qilish | Band qilish, holatni yangilash, sanalarni olish |
| **cars** | Mashinalar | Mashina qo'shish, tahrirlash, o'chirish, qidirish |
| **locations** | Hududlar | Viloyatlar va tumanlar ro'yxati |
| **reviews** | Sharhlar | Reyting qoldirish, sharhlarni ko'rish |
| **users** | Foydalanuvchilar | Profil, verifikatsiya |

---

## 3. Mobile ilova arxitekturasi

### 3.1 Loyiha tuzilishi

```
mobile/src/
├── components/           # Qayta ishlatiladigan komponentlar
│   ├── Button.tsx
│   ├── CarCard.tsx
│   ├── EmptyState.tsx
│   ├── Input.tsx
│   ├── Loader.tsx
│   ├── OfflineBanner.tsx
│   ├── Toast.tsx
│   └── Skeleton/        # Yuklanish skletlari
├── constants/           # Konstantalar va mavzular
│   ├── config.ts
│   └── theme.ts
├── hooks/               # Custom React hook'lar
│   └── useNetwork.ts
├── i18n.ts             # Tarjima konfiguratsiyasi
├── locales/            # Tarjima fayllari
│   ├── en.json
│   ├── ru.json
│   └── uz.json
├── navigation/         # Navigatsiya
│   ├── AuthNavigator.tsx
│   ├── TabNavigator.tsx
│   ├── index.tsx
│   └── types.ts
├── screens/            # Ekranlar
│   ├── Auth/           # Autentifikatsiya ekranlari
│   │   ├── LoginScreen.tsx
│   │   └── RegisterScreen.tsx
│   ├── Main/           # Asosiy ekranlar
│   │   ├── BookingScreen.tsx
│   │   ├── BookingSuccessScreen.tsx
│   │   ├── CarDetailScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── MyBookingsScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── ReviewScreen.tsx
│   └── Owner/          # Egasiga oid ekranlar
│       ├── AddEditCarScreen.tsx
│       ├── MyCarsScreen.tsx
│       └── OwnerDashboardScreen.tsx
├── services/           # API xizmatlari
│   └── api.ts
├── store/              # Zustand do'konlar
│   ├── useAppStore.ts
│   ├── useAuthStore.ts
│   └── useToastStore.ts
└── utils/              # Yordamchi funksiyalar
    ├── date.ts
    └── toast.ts
```

### 3.2 Navigatsiya arxitekturasi

```
RootNavigator (Stack)
├── AuthNavigator (Authenticated = false)
│   ├── LoginScreen
│   └── RegisterScreen
│
└── MainNavigator (Authenticated = true)
    ├── TabNavigator (Bottom Tabs)
    │   ├── HomeScreen
    │   ├── MyBookingsScreen
    │   └── ProfileScreen
    │
    └── Stack Screens
        ├── CarDetailScreen
        ├── BookingScreen
        ├── BookingSuccessScreen
        ├── OwnerDashboardScreen
        ├── MyCarsScreen
        ├── AddEditCarScreen
        └── ReviewScreen
```

### 3.3 State Management (Zustand)

**useAuthStore:**
- Foydalanuvchi ma'lumotlari
- Tokenlar (access va refresh)
- Kirish holati
- `setAuth`, `setTokens`, `logout`, `updateUser` metodlari
- AsyncStorage'da saqlanadi (persistent)

**useToastStore:**
- Toast xabarlari navbatini boshqarish
- Maksimal 5 ta xabar
- Duplicate'larni oldini olish
- Avtomatik yashirish (3 soniya)

**useAppStore:**
- Global UI holatlari
- Online/offline status

---

## 4. Mavjud funksiyalar

### 4.1 Backend funksiyalari

#### Autentifikatsiya (Auth Module)
| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/auth/register` | POST | Yangi foydalanuvchi ro'yxatdan o'tkazish |
| `/auth/login` | POST | Tizimga kirish |
| `/auth/refresh` | POST | Access token yangilash |
| `/auth/logout` | POST | Tizimdan chiqish |

**Xususiyatlari:**
- JWT access token (15 daqiqa)
- JWT refresh token (30 kun)
- Parollarni bcrypt bilan hash qilish (12 rounds)
- Tokenlarni PostgreSQL'da saqlash (revoke imkoniyati)

#### Mashinalar (Cars Module)
| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/cars` | GET | Barcha mashinalar (filter + pagination) |
| `/cars/:id` | GET | Bitta mashina tafsilotlari |
| `/cars/my` | GET | Mening mashinalarim |
| `/cars` | POST | Yangi mashina qo'shish |
| `/cars/:id` | PATCH | Mashina tahrirlash |
| `/cars/:id` | DELETE | Mashina o'chirish |

**Filter parametrlari:**
- `search` - Qidiruv (brand/model)
- `region_id` - Viloyat bo'yicha
- `district_id` - Tuman bo'yicha
- `minPrice` / `maxPrice` - Narx oralig'i
- `available` - Mavjudlik

#### Band qilish (Bookings Module)
| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/bookings` | POST | Yangi band qilish |
| `/bookings/my` | GET | Mening band qilganlarim |
| `/bookings/owner` | GET | Mening mashinalarimga band qilganlar |
| `/bookings/car/:id` | GET | Mashina band qilingan sanalar |
| `/bookings/:id/status` | PATCH | Buyurtma holatini yangilash |

**Buyurtma holatlari (State Machine):**
```
pending → confirmed → in_progress → completed
    ↓         ↓           ↓
cancelled  cancelled   cancelled
```

#### Sharhlar (Reviews Module)
| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/reviews` | POST | Yangi sharh qoldirish |
| `/reviews/car/:id` | GET | Mashina sharhlari |
| `/reviews/user/:id` | GET | Foydalanuvchi sharhlari |

#### Foydalanuvchilar (Users Module)
| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/users/me` | GET | Mening profilim |
| `/users/me` | PATCH | Profilni yangilash |
| `/users/verify` | POST | Haydovchilik guvohnomasini yuklash |

#### Hududlar (Locations Module)
| Endpoint | Metod | Tavsif |
|----------|-------|--------|
| `/locations/regions` | GET | Barcha viloyatlar |
| `/locations/districts/:regionId` | GET | Viloyat tumanlari |

### 4.2 Mobile funksiyalari

#### Autentifikatsiya ekranlari
- **LoginScreen:** Telefon raqami va parol bilan kirish
- **RegisterScreen:** Yangi akkaunt yaratish (ism, telefon, parol)

#### Asosiy ekranlar (Tab Navigator)
- **HomeScreen:**
  - Mashinalar ro'yxati
  - Qidiruv (brand/model)
  - Viloyat bo'yicha filtr
  - Skeleton loaders
  - Pull-to-refresh

- **MyBookingsScreen:**
  - Mening band qilganlarim ro'yxati
  - Buyurtma holati
  - Bekor qilish imkoniyati
  - Sharh qoldirish (yakunlangan buyurtmalar uchun)

- **ProfileScreen:**
  - Foydalanuvchi ma'lumotlari
  - Til tanlash (uz/ru/en)
  - Verifikatsiya (guvohnoma yuklash)
  - Egasiga oid bo'lim (Owner Dashboard)
  - Chiqish

#### Mashina tafsilotlari va band qilish
- **CarDetailScreen:**
  - Mashina rasmi va ma'lumotlari
  - Texnik xususiyatlar
  - Reyting va sharhlar
  - "Band qilish" tugmasi

- **BookingScreen:**
  - Interaktiv takvim
  - Heatmap (band qilingan sanalar)
  - Smart band qilish tavsiyalari
  - Narx hisoblash
  - Conflicktlarni ko'rsatish

- **BookingSuccessScreen:**
  - Buyurtma tasdiqlash
  - Buyurtma ma'lumotlari

#### Egasiga oid ekranlar (Owner)
- **OwnerDashboardScreen:**
  - Statistika (yangi so'rovlar, faol ijaralar, daromad)
  - Tab navigatsiya (so'rovlar, faol, tarix)
  - So'rovlarni qabul qilish/rad etish
  - Ijarani boshlash/yakunlash

- **MyCarsScreen:**
  - Mening mashinalarim ro'yxati
  - Tahrirlash/o'chirish

- **AddEditCarScreen:**
  - Yangi mashina qo'shish
  - Rasm yuklash
  - Viloyat/tuman tanlash (modaldan)
  - Narx va mavjudlik holati

#### Sharhlar
- **ReviewScreen:**
  - Reyting tanlash (1-5 yulduz)
  - Matnli sharh
  - Yuborish

### 4.3 Qo'llab-quvvatlash funksiyalari

| Funksiya | Tavsif |
|----------|--------|
| **i18n (3 til)** | O'zbek, Rus, Ingliz tillarida |
| **Offline Banner** | Internet aloqasi yo'q paytda ogohlantirish |
| **Toast tizimi** | Navbat bilan ishlovchi toast xabarlar |
| **Skeleton Loaders** | Yuklanish animatsiyalari |
| **Pull-to-Refresh** | Tegish orqali yangilash |
| **Haptic Feedback** | Tegish bilan bog'liq vibratsiyalar |
| **Auto Token Refresh** | Token avtomatik yangilash |
| **Smart Booking** | Mos keladigan sanalarni tavsiya qilish |

---

## 5. API va Database tahlili

### 5.1 API Endpoint'lari jadvali

#### Jami: 25+ endpoint

| Guruh | Endpoint'lar soni |
|-------|-------------------|
| Auth | 4 |
| Users | 3 |
| Cars | 6 |
| Bookings | 5 |
| Reviews | 3 |
| Locations | 2 |
| System | 2 |

### 5.2 Ma'lumotlar bazasi jadvalari

```sql
-- 1. users (Foydalanuvchilar)
- id (UUID, PK)
- name (VARCHAR)
- phone (VARCHAR, UNIQUE)
- password (VARCHAR)
- role (ENUM: 'user', 'admin')
- is_verified (BOOLEAN)
- license_image_url (TEXT)
- created_at, updated_at (TIMESTAMP)

-- 2. regions (Viloyatlar)
- id (INTEGER, PK)
- soato_id (INTEGER)
- name_uz, name_ru, name_oz (VARCHAR)

-- 3. districts (Tumanlar)
- id (INTEGER, PK)
- region_id (INTEGER, FK)
- soato_id (INTEGER)
- name_uz, name_ru, name_oz (VARCHAR)

-- 4. cars (Mashinalar)
- id (UUID, PK)
- owner_id (UUID, FK)
- region_id (INTEGER, FK)
- district_id (INTEGER, FK)
- brand, model (VARCHAR)
- year (INTEGER)
- price_per_day (DECIMAL)
- location (VARCHAR)
- is_available (BOOLEAN)
- image_url (TEXT)
- created_at, updated_at (TIMESTAMP)

-- 5. bookings (Band qilishlar)
- id (UUID, PK)
- car_id (UUID, FK)
- user_id (UUID, FK)
- start_date, end_date (DATE)
- total_price (DECIMAL)
- status (ENUM: 'pending', 'confirmed', 'in_progress', 'cancelled', 'completed')
- created_at, updated_at (TIMESTAMP)

-- 6. refresh_tokens (Tokenlar)
- id (UUID, PK)
- user_id (UUID, FK)
- token (TEXT, UNIQUE)
- expires_at (TIMESTAMP)
- created_at (TIMESTAMP)

-- 7. reviews (Sharhlar)
- id (UUID, PK)
- booking_id (UUID, FK)
- reviewer_id (UUID, FK)
- target_id (UUID, FK)
- car_id (UUID, FK)
- rating (INTEGER, 1-5)
- comment (TEXT)
- created_at (TIMESTAMP)
```

### 5.3 Jadval o'zaro aloqalari

```
users ||--o{ cars : owner
users ||--o{ bookings : renter
users ||--o{ bookings : owner (through cars)
users ||--o{ reviews : reviewer
users ||--o{ reviews : target
users ||--o{ refresh_tokens : has

regions ||--o{ districts : contains
regions ||--o{ cars : located

districts ||--o{ cars : located
districts }o--|| regions : belongs

cars ||--o{ bookings : has
cars ||--o{ reviews : has
cars }o--|| users : owned_by
cars }o--|| regions : in_region
cars }o--|| districts : in_district

bookings }o--|| cars : for_car
bookings }o--|| users : by_user
bookings ||--o{ reviews : has

reviews }o--|| bookings : for_booking
reviews }o--|| users : by_reviewer
reviews }o--|| users : about_target
reviews }o--|| cars : about_car
```

### 5.4 Indekslar (Performance)

```sql
-- Mashinalar
idx_cars_owner (owner_id)
idx_cars_brand_model (brand, model)
idx_cars_price (price_per_day)
idx_cars_location (location)

-- Band qilishlar
idx_bookings_car (car_id)
idx_bookings_user (user_id)
idx_bookings_dates (start_date, end_date)

-- Tokenlar
idx_refresh_tokens_user (user_id)
idx_refresh_tokens_token (token)

-- Sharhlar
idx_reviews_car_id (car_id)
idx_reviews_target_id (target_id)
idx_reviews_booking_id (booking_id)
```

---

## 6. Business logic ishlashi

### 6.1 Band qilish overlap logikasi

**Half-open interval modeli:**
- `[start_date, end_date)` - boshlanish sanasi kiradi, tugash sanasi kirmaydi
- Tashlab ketish kuni checkout sanasi hisoblanadi

**Overlap tekshiruvi:**
```javascript
// Ikki oraliq [A_start, A_end) va [B_start, B_end) to'qnashadi agar:
// A_start < B_end AND A_end > B_start

const overlaps = await pool.query(`
  SELECT * FROM bookings 
  WHERE car_id = $1 
  AND status IN ('pending', 'confirmed', 'in_progress')
  AND start_date::date < $3::date   -- A_start < B_end
  AND end_date::date > $2::date     -- A_end > B_start
`, [carId, startDate, endDate]);
```

### 6.2 Buyurtma holati (State Machine)

```
┌─────────┐    confirm/reject     ┌───────────┐
│ PENDING │ ─────────────────────→ │ CONFIRMED │
│         │ ─────────────────────→ │  REJECTED │
└────┬────┘                        └─────┬─────┘
     │ cancel                            │
     ↓                                   │ start
┌─────────┐                             ↓
│CANCELLED│                        ┌───────────┐
└─────────┘                        │IN_PROGRESS│
                                   └─────┬─────┘
                                         │ complete
                                         ↓
                                   ┌───────────┐
                                   │  COMPLETED  │
                                   └───────────┘
```

**Holat o'zgarish huquqlari:**
| Joriy holat | Yangi holat | Kim o'zgartira oladi |
|-------------|-------------|---------------------|
| pending | confirmed | Ega yoki Admin |
| pending | rejected | Ega yoki Admin |
| pending | cancelled | Ijarachi yoki Admin |
| confirmed | in_progress | Ega yoki Admin |
| confirmed | cancelled | Ijarachi yoki Admin (24 soat oldin) |
| in_progress | completed | Ega yoki Admin |

### 6.3 Bekor qilish siyosati (Cancellation Policy)

```javascript
// Agar buyurtma tasdiqlangan bo'lsa va boshlanishiga 24 soatdan kam qolgan bo'lsa:
const diffHours = (startTime - now) / (1000 * 60 * 60);
if (diffHours < 24) {
  throw new AppError('Bekor qilish imkonsiz: boshlanishiga 24 soatdan kam vaqt qoldi');
}
```

### 6.4 Narx hisoblash

```javascript
// Kunlar soni = end_date - start_date (half-open)
const diffTime = Math.abs(end - start);
const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
const total_price = diffDays * car.price_per_day;
```

### 6.5 Verifikatsiya tizimi

```
1. Foydalanuvchi guvohnoma rasmini yuklaydi
2. is_verified = FALSE, license_image_url = [path]
3. Admin ko'rib chiqadi (hozircha avtomatik)
4. Admin tasdiqlasa: is_verified = TRUE
```

### 6.6 Reyting tizimi

```
- Faqat yakunlangan (completed) buyurtmalarga sharh qoldirish mumkin
- Har bir buyurtmaga bir marta sharh qoldirish mumkin
- 1-5 yulduz oraliqda baholash
- Foydalanuvchi reytingi - o'rtacha bahosi
- Mashina reytingi - o'rtacha bahosi
```

---

## 7. UX va foydalanuvchi oqimi

### 7.1 Ijarachi (Renter) oqimi

```
1. Ro'yxatdan o'tish / Kirish
   ↓
2. Asosiy ekran (Home)
   - Mashinalar ro'yxatini ko'rish
   - Qidiruv/filtrdan foydalanish
   ↓
3. Mashina tafsilotlari (Car Detail)
   - Ma'lumotlarni ko'rish
   - Reyting/sharhlarni ko'rish
   ↓
4. Band qilish (Booking)
   - Sanalarni tanlash (takvim)
   - To'qnashuvlarni ko'rish
   - Narxni ko'rish
   ↓
5. Tasdiqlash (Booking Success)
   ↓
6. Mening buyurtmalarim (My Bookings)
   - Buyurtma holatini kuzatish
   - Kerak bo'lsa bekor qilish
   ↓
7. Yakunlangan buyurtma uchun sharh qoldirish
```

### 7.2 Ega (Owner) oqimi

```
1. Ro'yxatdan o'tish / Kirish
   ↓
2. Profil → Egalik paneli
   ↓
3. Yangi mashina qo'shish (Add Car)
   - Rasm yuklash
   - Ma'lumotlarni kiritish
   - Viloyat/tuman tanlash
   ↓
4. Egalik paneli (Owner Dashboard)
   - So'rovlarni ko'rish
   - So'rovlarni qabul qilish/rad etish
   - Faol ijaralarni boshqarish
   - Daromadni ko'rish
   ↓
5. Mening mashinalarim (My Cars)
   - Mashinalarni tahrirlash/o'chirish
```

### 7.3 Asosiy ekranlar navigatsiyasi

```
┌─────────────────────────────────────────────────────────┐
│  Tab Navigator (Asosiy)                                 │
│  ┌─────────┐  ┌─────────────┐  ┌─────────┐             │
│  │  Home   │  │ My Bookings │  │ Profile │             │
│  │   🏠    │  │     📅      │  │   👤    │             │
│  └────┬────┘  └──────┬──────┘  └────┬────┘             │
│       │              │              │                    │
│       ↓              ↓              ↓                    │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐               │
│  │CarDetail│    │Cancel   │    │Owner    │               │
│  │Booking  │    │Review   │    │Dashboard│               │
│  │Success  │    │         │    │MyCars   │               │
│  └─────────┘    └─────────┘    │AddCar   │               │
│                                └─────────┘               │
└─────────────────────────────────────────────────────────┘
```

---

## 8. Yetishmayotgan funksiyalar

### 8.1 Kritik (Critical) - Ishga tushirish uchun zarur

| Funksiya | Tavsif | Sababi |
|----------|--------|--------|
| **To'lov tizimi** | Naqd puldan boshqa to'lov usullari | Hozircha faqat naqd, bu katta muammo |
| **SMS tasdiqlash** | Telefon raqamini tasdiqlash | Xavfsizlik, spam oldini olish |
| **Push bildirishnomalar** | Real-vaqt hodisalar haqida xabardor qilish | Owner/renter o'zaro aloqa |
| **Mashina joylashuvi (GPS)** | Mashina qayerdaligini ko'rish | Topish osonlashadi |
| **Chat tizimi** | Foydalanuvchilar o'rtasida xabar almashish | Aloqa osonlashadi |

### 8.2 Muhim (Important) - Raqobatbardoshlik uchun

| Funksiya | Tavsif |
|----------|--------|
| **Favorites** | Sevimli mashinalarni saqlash |
| **Mashina qidiruvi kengaytirilgan** | Yoqilg'i turi, uzatmalar qutisi, o'rindiqlar soni |
| **Sug'urta integratsiyasi** | Haqiqiy sug'urta yechimi |
| **Kalendar sinxronizatsiyasi** | Google/Apple kalendarga qo'shish |
| **Ijara shartnomasi** | PDF shartnoma yaratish |
| **Mashina tekshiruvi** | Topshirish/qabul qilish cheklisti |
| **Qidiruv filterlari saqlash** | Tez-tez qidirilganlarni saqlash |
| **Yaqin atrofdagi mashinalar** | Xarita orqali qidirish |

### 8.3 Qo'shimcha (Optional) - Qulaylik oshirish

| Funksiya | Tavsif |
|----------|--------|
| **Referral tizimi** | Do'stlarni taklif qilish bonusi |
| **Promo kodlar** | Chegirmalar |
| **Loyallik dasturi** | Doimiy mijozlar uchun bonuslar |
| **Mashina sinfi** | Ekonom, biznes, premium |
| **Avtomatik narx belgilash** | Bozor talabiga qarab narx o'zgarishi |
| **Ijara muddatini uzaytirish** | Agar keyingi band qilish bo'lmasa |
| **Mashina yetkazib berish** | Xizmat sifatida |

---

## 9. Texnik muammolar

### 9.1 Potential xatoliklar (Bugs)

| Muammo | Jiddiyati | Izoh |
|--------|-----------|------|
| **Race condition band qilishda** | YUQORI | Transaction qo'llanilgan, lekin `SELECT FOR UPDATE` yo'q |
| **Timezone muammolari** | O'RTA | Date-only ishlatiladi, lekin ba'zi joylarda tekshirish kerak |
| **Mashina o'chirilganda booking'lar** | O'RTA | ON DELETE CASCADE bor, lekin active bookinglar uchun tekshirish yo'q |
| **Rasm yuklash cheklovlari** | PAST | Faqat hajm tekshiriladi, turi tekshirilmaydi |
| **Rate limiting bypass** | O'RTA | IP emas, user ID bo'yicha limit yo'q |

### 9.2 Kengaytirish muammolari (Scalability)

| Muammo | Ta'siri | Yechim |
|--------|---------|--------|
| **Connection pool** | O'RTA | Default PostgreSQL pool, sozlanmagan |
| **Caching yo'qligi** | O'RTA | Har bir so'rov DB ga boradi |
| **Rasm saqlash** | O'RTA | Lokal disk, CDN yo'q |
| **Query optimization** | PAST | Ba'zi JOIN lar optimize qilinmagan |
| **Horizontal scaling** | YUQORI | Stateless, lekin session yo'q |

### 9.3 Xavfsizlik muammolari

| Muammo | Jiddiyati | Tavsiya |
|--------|-----------|---------|
| **SQL Injection** | PAST | Parameterized queries ishlatilgan ✓ |
| **XSS** | PAST | React Native, server-side rendering yo'q ✓ |
| **CSRF** | PAST | JWT, cookie yo'q ✓ |
| **JWT secret** | O'RTA | `.env` da saqlanadi, lekin uzunlik tekshirilmaydi |
| **File upload** | O'RTA | Faqat ruxsat berilgan turlarni qabul qilish kerak |
| **Rate limiting** | O'RTA | Global, lekin endpoint-specific yo'q |
| **Input validation** | PAST | Joi ishlatilgan ✓ |
| **Phone verification** | YUQORI | Yo'q! SMS tasdiqlash kerak |
| **Admin panel** | YUQORI | Yo'q! Faqat DB orqali admin operatsiyalar |
| **Audit log** | O'RTA | Muhim operatsiyalar log'lanmagan |

### 9.4 UX nosozliklari

| Muammo | Ta'siri |
|--------|---------|
| **Deep linking yo'qligi** | Baham ko'rish qiyin |
| **Error recovery** | Ba'zi xatoliklarda qayta urinish yo'q |
| **Loading states** | Skeletlar bor, lekin ba'zi joylarda emas |
| **Pull-to-refresh** | Faqat Home va MyBookings ekranlarida |
| **Search debounce** | 500ms, tezroq bo'lishi mumkin |
| **Image caching** | Rasmlar har safar yuklanadi |

### 9.5 Kod sifatiga oid

| Muammo | Izoh |
|--------|------|
| **Type safety** | Backend: JS, Mobile: TS - nosozlik |
| **Testlar** | Jest bor, lekin coverage past |
| **Error handling** | Ba'zi joylarda try-catch yo'q |
| **Code duplication** | Date formatlash joylarda takrorlanmoqda |
| **Documentation** | Swagger yaxshi, lekin README kam |

---

## 10. Keyingi rivojlanish uchun tavsiyalar

### 10.1 Tezkor amalga oshirish (1-2 hafta)

1. **SMS tasdiqlash qo'shish**
   - Twilio yoki local provider ( Eskiz, PlayMobile)
   - Telefon tasdiqlash ekrani

2. **To'lov tizimi integratsiyasi**
   - Click, Payme, Stripe
   - Naqd pul + online to'lov

3. **Push bildirishnomalar**
   - Firebase Cloud Messaging
   - Expo Notifications

4. **Muhim xatoliklarni tuzatish**
   - Race condition uchun `SELECT FOR UPDATE`
   - File upload validatsiyasi

### 10.2 Qisqa muddatli (1-2 oy)

1. **Admin panel yaratish**
   - Foydalanuvchilarni boshqarish
   - Mashinalarni moderatsiya
   - Verifikatsiyalarni tasdiqlash
   - Statistika dashboard

2. **Kengaytirilgan qidiruv**
   - Ko'proq filter parametrlari
   - Xarita orqali qidirish
   - Yaqin atrofda qidirish

3. **Chat tizimi**
   - Socket.io orqali real-vaqt xabarlar
   - Media fayllarni yuklash

4. **Optimallashtirish**
   - Redis caching
   - Image CDN (Cloudinary, S3)
   - Connection pool sozlash

### 10.3 Uzoq muddatli (3-6 oy)

1. **Mashina joylashuvi (GPS)**
   - Real-vaqt GPS tracking
   - Geofencing

2. **Sug'urta integratsiyasi**
   - Avtomatik sug'urta polisi
   - Sug'urta kompaniyasi API integratsiyasi

3. **AI/ML xususiyatlari**
   - Smart narx tavsiyalari
   - Mashina tavsiyalari (collaborative filtering)
   - Fikr tahlili (sentiment analysis)

4. **B2B yo'nalish**
   - Korporativ mijozlar uchun
   - Fleet management

### 10.4 Arxitektura yaxshilashlari

```
Joriy:                    Tavsiya etilgan:
┌─────────────┐          ┌─────────────┐
│   Client    │          │   Client    │
│  (Mobile)   │          │  (Mobile)   │
└──────┬──────┘          └──────┬──────┘
       │                         │
       │ HTTPS                   │ HTTPS
       │                         │
┌──────▼──────┐          ┌──────▼──────┐
│   Express   │          │  API Gateway │
│   Server    │          │  (Nginx/     │
└──────┬──────┘          │   Kong)      │
       │                 └──────┬──────┘
       │                        │
       │                        │ Load Balance
       │                        │
┌──────▼──────┐          ┌──────▼──────┐
│  PostgreSQL │          │  Express    │
│             │          │  (Multiple  │
└─────────────┘          │   instances)│
                         └──────┬──────┘
                                │
                    ┌───────────┼───────────┐
                    │           │           │
              ┌─────▼────┐ ┌────▼────┐ ┌──▼────┐
              │ PostgreSQL│ │  Redis  │ │  S3   │
              │ (Primary) │ │ (Cache) │ │(Files)│
              └───────────┘ └─────────┘ └───────┘
```

### 10.5 Monitoring va Logging

```
Yoq:                      Qo'shish kerak:
- Winston (basic)        - ELK Stack (Elasticsearch, Logstash, Kibana)
- Console logs             - Prometheus + Grafana
                           - Sentry (error tracking)
                           - PagerDuty (alerting)
```

---

## Xulosa

**RentGo** loyihasi yaxshi asoslangan, zamonaviy texnologiyalar ishlatilgan platforma. Modul-arxitektura, to'g'ri ajratilgan qatlamli tuzilma, i18n qo'llab-quvvatlashi va real-vaqt xususiyatlari (takvim heatmap, smart suggestions) loyihani professional darajada ishlab chiqilganini ko'rsatadi.

**Kuchli tomonlari:**
- Toza va modulli kod arxitekturasi
- Half-open interval band qilish logikasi
- State machine asosida buyurtma boshqaruvi
- 3 til qo'llab-quvvatlash
- Professional toast va offline handling

**Kamchiliklari:**
- To'lov tizimi yo'q
- SMS tasdiqlash yo'q
- Admin panel yo'q
- Push bildirishnomalar yo'q

**Tavsiya:** Loyiha ishga tushirishga tayyor emas. Kamida SMS tasdiqlash va to'lov tizimi integratsiyasini amalga oshirgandan keyin ishga tushirish tavsiya etiladi.

---

**Hujjat versiyasi:** 1.0  
**Yangilanish sanasi:** 2026-04-25
