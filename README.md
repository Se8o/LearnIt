# LearnIt - Interaktivní vzdělávací platforma

Moderní full-stack vzdělávací platforma kombinující mikro-učení, gamifikaci a personalizovaný obsah pro efektivní a zábavný způsob učení.

## O projektu

LearnIt je interaktivní vzdělávací platforma, která propojuje krátké lekce, multimediální obsah a gamifikaci. Uživatelé si zvolí téma a systém jim připraví 5minutovou lekci s vysvětlením, videem a kvízem.

### Klíčové funkce

- Mikro-lekce - Max 5 minut, ideální pro „scroll & learn"
- Multimediální obsah - Text (Markdown) + YouTube videa + kvízy
- Rozšířená gamifikace - Body, 7 typů odznaků, úrovně, daily streaks, sledování pokroku
- Daily Streaks - Denní série učení s bonus body (až 20 bodů za streak)
- Vyhledávání & Filtry - Full-text search, filtry podle kategorie a obtížnosti, sorting
- Dark Mode - Přepínání mezi světlým a tmavým režimem
- Autentizace - JWT tokens, refresh tokens, bezpečné přihlášení
- RESTful API - Swagger dokumentace, validace, rate limiting
- Moderní frontend - Next.js 15, React 19, TypeScript, Tailwind CSS
- Testování - 74 unit a integration testů (100% pass rate)

## Architektura

```
LearnIt/
├── backend/              # Node.js/Express API
│   ├── __tests__/       # Jest unit & integration tests (74 tests)
│   ├── config/          # Environment, logger, Swagger
│   ├── data/            # Mock data (topics, lessons, quizzes)
│   ├── db/              # SQLite setup & models
│   ├── middleware/      # Auth, validation, rate limiting, error handling
│   ├── routes/          # API endpoints
│   ├── src/types/       # TypeScript type definitions
│   ├── utils/           # Helper utilities (db-helpers)
│   └── server.js        # Main server entry
│
├── frontend/            # Next.js application
│   ├── app/             # App Router pages
│   ├── components/      # React components
│   ├── context/         # Auth context
│   └── lib/             # API client
│
└── docs/                # Documentation (guides, API tests)
```

## Rychlý start

### Možnost 1: Docker (Doporučeno)

```bash
# 1. Nainstalujte Docker Desktop
# https://www.docker.com/products/docker-desktop

# 2. Spusťte aplikaci
docker compose up -d

# 3. Aplikace běží na:
# Frontend: http://localhost:3000
# Backend: http://localhost:3001
# API Docs: http://localhost:3001/api-docs

# Zastavení
docker compose down
```

Více v [DOCKER.md](./DOCKER.md)

### Možnost 2: Manuální instalace

#### Prerekvizity
- Node.js 18+ a npm
- Git

### Instalace a spuštění

```bash
# 1. Klonovat repository
git clone https://github.com/Se8o/LearnIt.git
cd LearnIt

# 2. Backend setup
cd backend
npm install
cp .env.example .env  # Upravit env variables
npm start             # Production mode
# NEBO
npm run dev          # Development mode s auto-reload

# 3. Frontend setup (v novém terminálu)
cd frontend
npm install
npm run dev

# 4. Otevřít v prohlížeči
Frontend: http://localhost:3000
Backend API docs: http://localhost:3001/api-docs
```

### Environment proměnné (.env)

```env
# Server
PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
ACCESS_TOKEN_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## API Endpointy

### Autentizace
- `POST /api/auth/register` - Registrace nového uživatele
- `POST /api/auth/login` - Přihlášení (access + refresh token)
- `POST /api/auth/refresh` - Obnovení access tokenu
- `POST /api/auth/logout` - Odhlášení (revoke token)
- `POST /api/auth/logout-all` - Odhlášení ze všech zařízení
- `GET /api/auth/me` - Informace o přihlášeném uživateli
- `PUT /api/auth/profile` - Aktualizace profilu

### Témata
- `GET /api/topics` - Seznam všech témat
- `GET /api/topics/:id` - Detail tématu
- `GET /api/topics/category/:category` - Témata podle kategorie

### Lekce
- `GET /api/lessons` - Všechny lekce
- `GET /api/lessons/:topicId` - Lekce pro téma

### Kvízy
- `GET /api/quiz/:topicId` - Kvíz pro téma
- `POST /api/quiz/submit` - Odeslat odpovědi a získat hodnocení

### Uživatelský pokrok
- `GET /api/user-progress` - Pokrok uživatele
- `POST /api/user-progress/complete-lesson` - Označit lekci jako dokončenou
- `POST /api/user-progress/save-quiz-result` - Uložit výsledek kvízu
- `POST /api/user-progress/reset` - Resetovat pokrok

Kompletní API dokumentace: [http://localhost:3001/api-docs](http://localhost:3001/api-docs)

## Dostupná témata

1. Fyzika - Newtonovy zákony pohybu (Začátečník, 5 min)
2. Biologie - Buněčná stavba (Začátečník, 4 min)
3. Psychologie - Základy motivace (Začátečník, 5 min)

Každé téma obsahuje:
- Markdown lekci s vysvětlením
- Integrované YouTube video
- Interaktivní kvíz (4 otázky)
- Klíčové body k zapamatování

## Technologie

### Backend
- Runtime: Node.js + Express.js
- Databáze: SQLite (Better-SQLite3)
- Autentizace: JWT tokens, bcrypt
- Validace: Express-validator
- Dokumentace: Swagger/OpenAPI
- Logging: Winston
- Security: Rate limiting, CORS, helmet
- Testing: Jest, Supertest (74 tests, 100% pass)
- Připraveno pro TypeScript - Types definované, migration guide

### Frontend
- Framework: Next.js 15 (App Router)
- React: 19
- TypeScript: Plně typované
- Styling: Tailwind CSS
- HTTP Client: Axios
- Markdown: React-markdown
- State: Context API + React hooks

## Gamifikace

### Bodový systém
- Dokončená lekce: 10 bodů
- Kvíz: 1-10 bodů (podle výsledku)
- Daily Streak Bonus: 2-20 bodů (podle délky série)
- Každých 100 bodů = nová úroveň

### Odznaky (7 typů)
- Perfect Score - 100% v kvízu
- Beginner - 3 dokončené lekce
- Bookworm - 20 dokončených lekcí
- Week Warrior - 7 dní v řadě
- Quiz Master - 10 perfektních kvízů
- Perfectionist - 5 perfektních kvízů v řadě
- All Topics - Lekce ze všech kategorií

### Statistiky
- Current Streak - Aktuální denní série
- Longest Streak - Nejdelší zaznamenaná série
- Perfect Quiz Streak - Série perfektních kvízů za sebou
- Total Points - Celkový počet bodů
- Level Progress - Pokrok do dalšího levelu

## Testování

```bash
# Spustit všechny testy
cd backend
npm test

# Spustit s coverage
npm run test:coverage

# Spustit watch mode
npm run test:watch

# Jednotlivé test suites
npm test -- __tests__/unit/
npm test -- __tests__/integration/
```

Test Coverage:
- Unit tests: 41/41 (errorHandler, userModel, refreshTokenModel)
- Integration tests: 33/33 (auth API, quiz API)
- Total: 74/74 tests passing

## Databáze (SQLite)

### Schéma
- `users` - Uživatelské účty (email, password_hash, name)
- `refresh_tokens` - JWT refresh tokeny
- `topics` - Vzdělávací témata
- `lessons` - Lekce s obsahem
- `quizzes` - Kvízy
- `quiz_questions` - Otázky kvízů
- `user_progress` - Dokončené lekce
- `quiz_results` - Výsledky kvízů
- `user_stats` - Body, úrovně, odznaky

Připraveno pro migraci na MSSQL/PostgreSQL

## Bezpečnost

- JWT access tokens (15min expiry)
- Refresh tokens (7 days, revokable)
- Bcrypt password hashing (10 rounds)
- Helmet - Security HTTP headers (XSS, clickjacking protection)
- Input sanitization - XSS-clean & NoSQL injection protection
- Rate limiting (anti brute-force)
- Input validation (express-validator)
- Strong password policy - Min 8 chars, uppercase, lowercase, numbers, special chars
- Sensitive data protection - Passwords never returned in error responses
- CORS configured
- Error handling middleware
- SQL injection prevention (prepared statements)
- Automatic token cleanup - Expired refresh tokens removed periodically
- TODO: Migrate to HttpOnly cookies (currently localStorage - XSS risk)

## Dokumentace

- [Quick Start Guide](./QUICK_START.md)
- [Backend API Tests](./backend/API_TESTS.md)
- [Swagger Guide](./backend/SWAGGER_GUIDE.md)
- [Refresh Token Guide](./REFRESH_TOKEN_GUIDE.md)
- [TypeScript Migration](./backend/TYPESCRIPT_MIGRATION.md)
- [MVP Complete](./MVP_COMPLETE.md)

## Development

### Užitečné příkazy

```bash
# Backend
cd backend
npm run dev          # Development server s nodemon
npm run seed         # Seed database with data
npm test             # Run all tests
npm run test:watch   # Test watch mode

# Frontend
cd frontend
npm run dev          # Development server
npm run build        # Production build
npm run lint         # ESLint check
```

### Code Quality
- ESLint configured
- TypeScript ready
- Jest tests with 100% pass rate
- Winston structured logging
- Database helpers (no code duplication)

## Roadmap

### Fáze 1: MVP (HOTOVO)
- [x] Backend API s databází
- [x] Frontend aplikace
- [x] Autentizace
- [x] Gamifikace
- [x] Testing (74/74)
- [x] Security (JWT, rate limiting)

### Fáze 2: Vylepšení (Příští)
- [ ] Admin panel pro správu obsahu
- [ ] Vyhledávání témat
- [ ] Filtry (kategorie, obtížnost)
- [ ] User dashboard s grafy
- [ ] Social features (sdílení, komentáře)

### Fáze 3: AI & Personalizace
- [ ] OpenAI/Claude integrace
- [ ] AI generování obsahu
- [ ] Personalizované doporučení
- [ ] Adaptivní obtížnost

### Fáze 4: Produkce
- [ ] Migrace na PostgreSQL/MSSQL
- [ ] Docker containerizace
- [ ] CI/CD pipeline
- [ ] Monitoring & analytics
- [ ] Mobile aplikace (React Native)
- [ ] Platební systém (Stripe)

## Cílová skupina

- Studenti - Efektivní příprava na zkoušky
- Profesionálové - Rozšíření znalostí v oboru
- Firmy - Onboarding a školení zaměstnanců
- Lifelong learners - Osobní rozvoj a zábava

## Monetizační model (plánovaný)

1. Freemium - Základní témata zdarma
2. Premium - Rozšířený obsah, AI funkce
3. Business - Firemní licence, vlastní obsah
4. Partnership - Spolupráce s tvůrci obsahu

## Licence

Tento projekt je vytvořen pro vzdělávací účely.

## Autor

Se8o - [GitHub](https://github.com/Se8o/LearnIt)

---

LearnIt - Učení nikdy nebylo zábavnější!
