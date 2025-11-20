# 🚀 LearnIt MVP - Návod ke spuštění

## ✅ Co je hotové

Backend API server s kompletní funkčností pro MVP:
- ✅ 3 předpřipravená témata (Fyzika, Biologie, Psychologie)
- ✅ Lekce s markdown obsahem a YouTube videi
- ✅ Interaktivní kvízy s vyhodnocením
- ✅ Systém gamifikace (body, úrovně, odznaky)
- ✅ RESTful API endpointy
- ✅ Úplná dokumentace

## 🎯 Jak spustit backend

1. **Přejděte do složky backend:**
   ```bash
   cd backend
   ```

2. **Nainstalujte závislosti:**
   ```bash
   npm install
   ```

3. **Spusťte server:**
   ```bash
   npm start
   ```
   
   Server poběží na: `http://localhost:3001`

4. **Otevřete Swagger UI pro testování API:**
   ```
   http://localhost:3001/api-docs
   ```
   
   🎯 **V prohlížeči uvidíte interaktivní dokumentaci kde můžete:**
   - Prohlížet všechny endpointy
   - Testovat GET a POST requesty
   - Vidět příklady dat
   - Spouštět kvízy a kontrolovat odpovědi

5. **Nebo testujte z terminálu:**
   ```bash
   # Health check
   curl http://localhost:3001/api/health
   
   # Všechna témata
   curl http://localhost:3001/api/topics
   
   # Lekce pro téma
   curl http://localhost:3001/api/lessons/1
   ```

## 📚 Dokumentace

- **README.md** - Hlavní dokumentace projektu
- **backend/README.md** - Dokumentace backendu a API
- **backend/API_TESTS.md** - Příklady testování API

## 🎨 Dostupná témata

1. **Fyzika - Newtonovy zákony pohybu** (ID: 1)
2. **Biologie - Buněčná stavba** (ID: 2)  
3. **Psychologie - Základy motivace** (ID: 3)

## 📡 Hlavní API endpointy

- `GET /api/topics` - Seznam témat
- `GET /api/lessons/:topicId` - Lekce pro téma
- `GET /api/quiz/:topicId` - Kvíz pro téma
- `POST /api/quiz/submit` - Odeslat odpovědi
- `GET /api/user-progress` - Pokrok uživatele

## 🔮 Co dál

### Krok 1: Frontend (doporučeno Next.js)
```bash
npx create-next-app@latest frontend
cd frontend
npm install axios
```

### Krok 2: Připojení k MSSQL
```bash
cd backend
npm install mssql
# Vytvořit databázové schéma podle README.md
```

### Krok 3: AI integrace
```bash
npm install openai
# Nebo
npm install @anthropic-ai/sdk
```

### Krok 4: Autentizace
```bash
npm install jsonwebtoken bcrypt
```

## 📋 TODO pro produkci

- [ ] **Frontend** - React/Next.js aplikace
- [ ] **Databáze** - Migrace na MSSQL
- [ ] **AI** - Integrace GPT/Claude pro generování obsahu
- [ ] **Auth** - JWT autentizace a registrace
- [ ] **Deployment** - Hosting na Azure/AWS
- [ ] **Admin panel** - Pro správu obsahu
- [ ] **Analytics** - Sledování pokroku uživatelů
- [ ] **Platby** - Stripe integrace pro premium

## 🎯 Struktura projektu

```
LearnIt/
├── backend/
│   ├── data/              # Mock data (témata, lekce, kvízy)
│   ├── routes/            # API route handlers
│   ├── server.js          # Hlavní server
│   ├── package.json       
│   └── README.md
├── README.md              # Hlavní dokumentace
└── QUICK_START.md         # Tento soubor
```

## 🔧 Technické detaily

- **Node.js** 14+
- **Express.js** 4.18+
- **Port**: 3001 (konfigurovatelný v .env)
- **CORS**: Povoleno pro všechny origin
- **Mock data**: Připraveno pro MSSQL migraci

## ⚠️ Poznámky

- MVP verze **nepoužívá** databázi - data jsou v paměti
- **AI generování** není aktivní - obsah je předpřipravený
- **Autentizace** není implementována - připraveno pro budoucnost
- Po restartu serveru se **resetuje** uživatelský pokrok

## 🎓 Testování učebního cyklu

```bash
# 1. Získat témata
curl http://localhost:3001/api/topics

# 2. Získat lekci
curl http://localhost:3001/api/lessons/1

# 3. Označit jako dokončenou
curl -X POST http://localhost:3001/api/user-progress/complete-lesson \
  -H "Content-Type: application/json" \
  -d '{"topicId": 1, "lessonId": 1}'

# 4. Získat kvíz
curl http://localhost:3001/api/quiz/1

# 5. Odeslat odpovědi
curl -X POST http://localhost:3001/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"topicId": 1, "answers": [0, 2, 2, 2]}'

# 6. Zkontrolovat pokrok
curl http://localhost:3001/api/user-progress
```

## 📞 Support

Pro více informací viz README.md a backend/README.md

---

**LearnIt MVP** - Připraveno k prezentaci! 🎓✨
