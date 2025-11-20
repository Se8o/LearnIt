# 🎓 LearnIt - Kompletní MVP

Interaktivní vzdělávací platforma s backendem i frontendem - kompletně funkční MVP!

## ✅ Co je hotové

### Backend (Node.js + Express)
- ✅ RESTful API s 15+ endpointy
- ✅ Mock data pro 3 témata (Fyzika, Biologie, Psychologie)
- ✅ Swagger UI dokumentace na http://localhost:3001/api-docs
- ✅ Gamifikace (body, levely, odznaky)
- ✅ CORS konfigurace

### Frontend (Next.js + React + TypeScript)
- ✅ Responsivní homepage
- ✅ Výběr témat s barevnými kartami
- ✅ Detail lekce s YouTube videem
- ✅ Interaktivní kvíz s vyhodnocením
- ✅ Dashboard pokroku uživatele
- ✅ Plná integrace s backend API

## 🚀 Jak spustit

### 1. Backend

```bash
cd backend
npm install
npm start
```

✅ Backend běží na: **http://localhost:3001**  
✅ Swagger UI: **http://localhost:3001/api-docs**

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

✅ Frontend běží na: **http://localhost:3000**

### 3. Otevřete v prohlížeči

```
http://localhost:3000
```

## 🎯 Kompletní učební cyklus

1. **Homepage** → Úvodní stránka s představením
2. **Témata** → Výběr z 3 témat (Fyzika, Biologie, Psychologie)
3. **Lekce** → Markdown obsah + YouTube video
4. **Kvíz** → 4 otázky s okamžitým vyhodnocením
5. **Pokrok** → Body, level, odznaky, statistiky

## 📁 Struktura projektu

```
LearnIt/
├── backend/               # Node.js + Express API
│   ├── data/             # Mock data (témata, lekce, kvízy)
│   ├── routes/           # API endpointy
│   ├── server.js         # Hlavní server
│   ├── swagger.js        # Swagger konfigurace
│   ├── API_TESTS.md      # Testovací příklady
│   ├── SWAGGER_GUIDE.md  # Průvodce Swagger UI
│   └── README.md
├── frontend/              # Next.js + React + TypeScript
│   ├── app/              # Next.js App Router
│   │   ├── page.tsx      # Homepage
│   │   ├── topics/       # Výběr témat
│   │   ├── lesson/       # Detail lekce
│   │   ├── quiz/         # Interaktivní kvíz
│   │   └── progress/     # Dashboard
│   ├── components/       # React komponenty
│   ├── lib/api.ts        # API klient
│   └── README.md
├── README.md             # Tento soubor
└── QUICK_START.md        # Rychlý start
```

## 🎮 Gamifikace

- **10 bodů** za dokončenou lekci
- **1-10 bodů** za kvíz (podle úspěšnosti)
- **Level up** každých 100 bodů
- **Odznaky**:
  - 🌟 Perfect Score (100% v kvízu)
  - 📚 Beginner (3 dokončené lekce)

## 📚 Dostupná témata

### 1. Fyzika - Newtonovy zákony pohybu ⚛️
- 3 zákony pohybu
- Vzorce a praktické příklady
- 4 otázky kvíz

### 2. Biologie - Buněčná stavba 🧬
- Prokaryotické vs eukaryotické buňky
- Hlavní organely
- 4 otázky kvíz

### 3. Psychologie - Základy motivace 🧠
- Typy motivace
- Maslowova pyramida
- SMART cíle
- 4 otázky kvíz

## 💻 Technologie

### Backend
- Node.js + Express.js
- Swagger/OpenAPI dokumentace
- CORS
- Mock data (připraveno pro MSSQL)

### Frontend
- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Axios
- React Markdown

## 🌐 API Dokumentace

### Interaktivní testování
Otevřete Swagger UI: **http://localhost:3001/api-docs**

Můžete:
- ✅ Prohlížet všechny endpointy
- ✅ Testovat GET/POST requesty
- ✅ Vidět příklady dat
- ✅ Spouštět kvízy přímo z prohlížeče

### Hlavní endpointy

**Témata:**
- `GET /api/topics` - Seznam témat
- `GET /api/topics/:id` - Detail tématu

**Lekce:**
- `GET /api/lessons` - Všechny lekce
- `GET /api/lessons/:topicId` - Lekce pro téma

**Kvízy:**
- `GET /api/quiz/:topicId` - Získat kvíz
- `POST /api/quiz/submit` - Odeslat odpovědi

**Pokrok:**
- `GET /api/user-progress` - Pokrok uživatele
- `POST /api/user-progress/complete-lesson` - Dokončit lekci
- `POST /api/user-progress/save-quiz-result` - Uložit výsledek
- `POST /api/user-progress/reset` - Resetovat

## 📝 Poznámky k MVP

✅ **Hotovo:**
- Kompletní backend API
- Kompletní frontend UI
- Gamifikace
- Mock data pro 3 témata
- Swagger dokumentace

⏳ **Připraveno (neimplementováno):**
- Databáze (MSSQL) - struktura připravena
- AI generování obsahu - API připraveno
- Autentizace uživatelů - endpoint structure ready
- Produkční deployment

❌ **Zatím neimplementováno:**
- Persistentní databáze (data v paměti)
- AI generování (obsah je předpřipravený)
- Uživatelská autentizace
- Firemní funkce

## 🔮 Další kroky (Roadmap)

### Fáze 1: Databáze
- [ ] MSSQL integrace
- [ ] Migrace schéma
- [ ] Perzistence dat
- [ ] User management

### Fáze 2: AI
- [ ] OpenAI/Claude integrace
- [ ] Generování lekcí
- [ ] Personalizace podle úrovně
- [ ] Adaptivní doporučení

### Fáze 3: Autentizace
- [ ] JWT tokens
- [ ] Registrace/Login
- [ ] User profiles
- [ ] Protected routes

### Fáze 4: Produkce
- [ ] Deployment (Azure/Vercel)
- [ ] Admin panel
- [ ] Analytics
- [ ] Platební systém
- [ ] Mobile app

## 🎯 Použití

### Pro prezentaci:
1. Spusťte backend + frontend
2. Otevřete http://localhost:3000
3. Proklikejte celý učební cyklus
4. Ukažte Swagger UI na http://localhost:3001/api-docs

### Pro development:
1. Backend poskytuje API
2. Frontend konzumuje API
3. Vše je typované (TypeScript)
4. Ready pro DB a AI

## 📄 Dokumentace

- `README.md` (tento soubor) - Hlavní overview
- `QUICK_START.md` - Rychlý start průvodce
- `backend/README.md` - Backend dokumentace
- `backend/SWAGGER_GUIDE.md` - Swagger průvodce
- `backend/API_TESTS.md` - API testovací příklady
- `frontend/README.md` - Frontend dokumentace

## 🎓 Použití pro školu/prezentaci

MVP demonstruje:
- ✅ Full-stack vývoj (Backend + Frontend)
- ✅ RESTful API design
- ✅ Modern React s TypeScript
- ✅ Responsive design
- ✅ API dokumentace (Swagger)
- ✅ UX/UI best practices
- ✅ Gamifikace v edukaci
- ✅ Připravenost na škálování

---

**LearnIt MVP** - Kompletní vzdělávací platforma! 🚀📚✨

Made with ❤️ for modern learning
