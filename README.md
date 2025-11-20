# LearnIt - Interaktivní vzdělávací platforma 🎓

Moderní vzdělávací platforma kombinující AI, mikro-učení a gamifikaci pro efektivní a zábavný způsob učení.

## 📖 O projektu

LearnIt je interaktivní vzdělávací platforma, která propojuje umělou inteligenci, mikro-učení a zábavný přístup k poznávání. Uživatel si zvolí téma a systém mu připraví krátkou lekci na míru s vysvětlením, videem a kvízem.

### Klíčové funkce
- ✅ **Mikro-lekce** - Max 5 minut, ideální pro „scroll & learn"
- ✅ **Personalizace** - Obsah přizpůsobený úrovni znalostí
- ✅ **Multimediální obsah** - Text + video + kvíz
- ✅ **Gamifikace** - Body, odznaky, úrovně
- 🔄 **AI generování** (připraveno pro budoucnost)
- 🔄 **Doporučovací systém** (připraveno pro budoucnost)

## 🎯 MVP Funkce

Aktuální verze obsahuje:
- 3 předpřipravená témata (Fyzika, Biologie, Psychologie)
- Kompletní lekce s markdown obsahem
- Integrovaná YouTube videa
- Interaktivní kvízy s vyhodnocením
- Systém gamifikace (body, úrovně, odznaky)
- RESTful API backend

## 🏗️ Architektura projektu

```
LearnIt/
├── backend/           # Node.js/Express API server
│   ├── data/         # Mock data (témata, lekce, kvízy)
│   ├── routes/       # API endpointy
│   ├── server.js     # Hlavní server
│   └── README.md     # Backend dokumentace
└── README.md         # Tento soubor
```

## 🚀 Jak spustit projekt

### Backend

1. Přejděte do složky backend:
```bash
cd backend
```

2. Nainstalujte závislosti:
```bash
npm install
```

3. Spusťte server:
```bash
npm start
# nebo pro development mode s auto-reloadem:
npm run dev
```

4. Backend poběží na `http://localhost:3001`

5. Otevřete v prohlížeči interaktivní API dokumentaci:
```
http://localhost:3001/api-docs
```

### Frontend

Otevřete v prohlížeči nebo použijte curl/Postman:
```bash
# Health check
curl http://localhost:5000/api/health

# Získat všechna témata
curl http://localhost:5000/api/topics

# Získat lekci pro téma ID 1
curl http://localhost:5000/api/lessons/1

# Získat kvíz pro téma ID 1
curl http://localhost:5000/api/quiz/1
```

## 📡 API Endpointy

### Témata
- `GET /api/topics` - Seznam všech témat
- `GET /api/topics/:id` - Detail tématu
- `GET /api/topics/category/:category` - Témata podle kategorie

### Lekce
- `GET /api/lessons` - Všechny lekce
- `GET /api/lessons/:topicId` - Lekce pro dané téma

### Kvízy
- `GET /api/quiz/:topicId` - Kvíz pro dané téma
- `POST /api/quiz/submit` - Odeslat odpovědi a získat hodnocení

### Uživatelský pokrok
- `GET /api/user-progress` - Pokrok uživatele
- `POST /api/user-progress/complete-lesson` - Označit lekci jako dokončenou
- `POST /api/user-progress/save-quiz-result` - Uložit výsledek kvízu

## 🎨 Dostupná témata

### 1. Fyzika - Newtonovy zákony pohybu ⚛️
- Úroveň: Začátečník
- Délka: 5 minut
- Obsahuje: 3 zákony pohybu, vzorce, praktické příklady
- Kvíz: 4 otázky

### 2. Biologie - Buněčná stavba 🧬
- Úroveň: Začátečník
- Délka: 4 minuty
- Obsahuje: Prokaryotické vs eukaryotické buňky, organely
- Kvíz: 4 otázky

### 3. Psychologie - Základy motivace 🧠
- Úroveň: Začátečník
- Délka: 5 minut
- Obsahuje: Typy motivace, Maslowova pyramida, SMART cíle
- Kvíz: 4 otázky

## 💻 Technologie

### Backend (Aktuální)
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **CORS** - Cross-origin support
- **dotenv** - Environment variables
- **Swagger/OpenAPI** - Interaktivní API dokumentace

### Plánované technologie
- **Frontend**: React / Next.js
- **Databáze**: Microsoft SQL Server (MSSQL)
- **AI**: OpenAI GPT / Anthropic Claude
- **Auth**: JWT tokens
- **Hosting**: Azure / AWS

## 📊 Databázové schéma (připraveno pro MSSQL)

```sql
-- Tabulky pro budoucí implementaci
topics
├── id (PK)
├── title
├── category
├── description
├── difficulty
├── duration
├── icon
└── color

lessons
├── id (PK)
├── topic_id (FK)
├── title
├── content (text/markdown)
├── video_url
├── estimated_time
└── created_at

quizzes
├── id (PK)
├── topic_id (FK)
└── title

quiz_questions
├── id (PK)
├── quiz_id (FK)
├── question
├── options (JSON)
├── correct_answer
└── explanation

users
├── id (PK)
├── email
├── password_hash
├── name
├── level
├── total_points
└── created_at

user_progress
├── id (PK)
├── user_id (FK)
├── lesson_id (FK)
├── completed_at
└── quiz_score
```

## 🎮 Gamifikace

### Body systém
- Dokončená lekce: 10 bodů
- Úspěšný kvíz: 1-10 bodů (podle výsledku)
- Každých 100 bodů = nová úroveň

### Odznaky
- 🌟 **Perfect Score** - 100% v kvízu
- 📚 **Beginner** - 3 dokončené lekce
- (Více odznaků připraveno pro budoucnost)

## 🔮 Roadmap

### Fáze 1: MVP ✅ (Aktuální)
- [x] Backend API s mock daty
- [x] 3 předpřipravená témata
- [x] Kvízy a vyhodnocení
- [x] Základní gamifikace

### Fáze 2: Frontend (Příští krok)
- [ ] React/Next.js aplikace
- [ ] Responsivní design
- [ ] Přehrávač videí
- [ ] Interaktivní kvízy
- [ ] Dashboard uživatele

### Fáze 3: Databáze
- [ ] MSSQL integrace
- [ ] Migrace z mock dat
- [ ] Autentizace uživatelů
- [ ] Perzistence dat

### Fáze 4: AI Integrace
- [ ] OpenAI API integrace
- [ ] Generování obsahu podle úrovně
- [ ] Personalizované doporučení
- [ ] Adaptivní obtížnost

### Fáze 5: Produkce
- [ ] Admin panel
- [ ] Analytics
- [ ] Platební systém
- [ ] Firemní licence
- [ ] Mobile aplikace

## 🎯 Cílová skupina

- **Studenti** - Efektivní příprava na zkoušky
- **Profesionálové** - Rychlé rozšíření znalostí
- **Firmy** - Onboarding a školení zaměstnanců
- **Lifelong learners** - Osobní rozvoj

## 💰 Monetizační model (plánovaný)

1. **Freemium** - Základní obsah zdarma
2. **Premium** - Rozšířený obsah, AI funkce
3. **Firemní licence** - Vlastní obsah, analytics
4. **Partnerství** - Spolupráce s tvůrci obsahu

## 📝 Poznámky k MVP

Tato verze je **demonstrační MVP** pro ukázku konceptu:
- ✅ Plně funkční API
- ✅ Mock data připravená pro 3 témata
- ✅ Připraveno pro MSSQL migraci
- ⏳ Bez skutečného AI (připraveno)
- ⏳ Bez autentizace (připraveno)
- ⏳ Bez persistentní databáze (data v paměti)

## 🛠️ Jak pokračovat v development

### 1. Vytvoření frontendu
```bash
# Vytvořit Next.js aplikaci
npx create-next-app@latest frontend
cd frontend
npm install axios
```

### 2. Připojení k MSSQL
```bash
cd backend
npm install mssql
# Vytvořit db config a migrace
```

### 3. Přidání AI
```bash
npm install openai
# Nebo
npm install @anthropic-ai/sdk
```

### 4. Autentizace
```bash
npm install jsonwebtoken bcrypt
```

## 📄 Licence

Tento projekt je vytvořen pro vzdělávací účely.

## 👥 Autoři

LearnIt Development Team

---

**LearnIt** - Učení nikdy nebylo zábavnější! 🚀📚✨
