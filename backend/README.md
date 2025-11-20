# LearnIt Backend API 🚀

Backend server pro interaktivní vzdělávací platformu LearnIt.

## 📋 Popis

RESTful API server postavený na Node.js a Express.js, který poskytuje data pro vzdělávací platformu LearnIt. MVP verze obsahuje mock data pro 3 témata (Fyzika, Biologie, Psychologie) bez připojení k databázi.

## ⚡ Technologie

- **Node.js** - Runtime prostředí
- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **dotenv** - Správa environment proměnných
- **Swagger/OpenAPI** - Interaktivní API dokumentace

## 🛠️ Instalace a spuštění

### Předpoklady
- Node.js verze 14 nebo vyšší
- npm nebo yarn

### Kroky instalace

1. **Přejděte do složky backend:**
```bash
cd backend
```

2. **Nainstalujte závislosti:**
```bash
npm install
```

3. **Spusťte server:**

Pro produkční režim:
```bash
npm start
```

Pro vývojový režim (s automatickým restartem):
```bash
npm run dev
```

4. **Server poběží na:**
```
http://localhost:3001
```

5. **Otevřete interaktivní API dokumentaci (Swagger UI):**
```
http://localhost:3001/api-docs
```

Ve Swagger UI můžete:
- 📖 Prohlížet všechny API endpointy
- ✅ Testovat API přímo v prohlížeči
- 📝 Vidět příklady requestů a responses
- 🎯 Spouštět POST requesty s vlastními daty

## 📡 API Endpointy

> 💡 **TIP:** Nejjednodušší způsob testování API je pomocí **Swagger UI** na `http://localhost:3001/api-docs`  
> Kompletní průvodce najdete v [SWAGGER_GUIDE.md](SWAGGER_GUIDE.md)

### Health Check
- **GET** `/api/health` - Kontrola stavu serveru

### Témata (Topics)
- **GET** `/api/topics` - Seznam všech dostupných témat
- **GET** `/api/topics/:id` - Detail konkrétního tématu
- **GET** `/api/topics/category/:category` - Témata podle kategorie

#### Příklad odpovědi GET /api/topics:
```json
{
  "success": true,
  "count": 3,
  "data": [
    {
      "id": 1,
      "title": "Fyzika - Newtonovy zákony pohybu",
      "category": "Fyzika",
      "description": "Základy klasické mechaniky a pohybu těles",
      "difficulty": "beginner",
      "duration": 5,
      "icon": "⚛️",
      "color": "#3B82F6"
    }
  ]
}
```

### Lekce (Lessons)
- **GET** `/api/lessons` - Seznam všech lekcí
- **GET** `/api/lessons/:topicId` - Lekce pro konkrétní téma

#### Příklad odpovědi GET /api/lessons/1:
```json
{
  "success": true,
  "data": {
    "id": 1,
    "topicId": 1,
    "title": "Newtonovy zákony pohybu",
    "content": "# Markdown obsah lekce...",
    "videoUrl": "https://www.youtube.com/embed/...",
    "videoTitle": "Název videa",
    "estimatedTime": 5,
    "keyPoints": ["bod 1", "bod 2"],
    "topic": { ... }
  }
}
```

### Kvízy (Quiz)
- **GET** `/api/quiz/:topicId` - Kvíz pro dané téma
- **POST** `/api/quiz/submit` - Odesílání odpovědí a vyhodnocení

#### Příklad POST /api/quiz/submit:
Request body:
```json
{
  "topicId": 1,
  "answers": [0, 2, 1, 3]
}
```

Response:
```json
{
  "success": true,
  "data": {
    "results": [...],
    "score": {
      "correct": 3,
      "total": 4,
      "percentage": 75
    },
    "feedback": "Dobrá práce!",
    "level": "good"
  }
}
```

### Uživatelský pokrok (User Progress)
- **GET** `/api/user-progress` - Získat pokrok uživatele
- **POST** `/api/user-progress/complete-lesson` - Označit lekci jako dokončenou
- **POST** `/api/user-progress/save-quiz-result` - Uložit výsledek kvízu
- **POST** `/api/user-progress/reset` - Resetovat pokrok (pro testování)

#### Příklad POST /api/user-progress/complete-lesson:
Request body:
```json
{
  "topicId": 1,
  "lessonId": 1
}
```

## 📁 Struktura projektu

```
backend/
├── data/               # Mock data
│   ├── topics.js      # Témata
│   ├── lessons.js     # Lekce
│   └── quizzes.js     # Kvízy
├── routes/            # API route handlers
│   ├── topics.js
│   ├── lessons.js
│   ├── quiz.js
│   └── userProgress.js
├── .env               # Environment proměnné
├── .gitignore
├── package.json
├── server.js          # Hlavní soubor serveru
└── README.md
```

## 🎯 Dostupná témata v MVP

1. **Fyzika - Newtonovy zákony pohybu**
   - Obsahuje vysvětlení, video a 4 otázky kvízu

2. **Biologie - Buněčná stavba**
   - Obsahuje vysvětlení, video a 4 otázky kvízu

3. **Psychologie - Základy motivace**
   - Obsahuje vysvětlení, video a 4 otázky kvízu

## 🎮 Gamifikace

Backend podporuje základní gamifikační prvky:
- **Body** - uživatelé získávají body za dokončené lekce a kvízy
- **Úrovně** - každých 100 bodů = nová úroveň
- **Odznaky** - např. "perfect-score" za 100% úspěšnost v kvízu

## 🔄 Příprava na MSSQL

Kód je připraven pro budoucí integraci s MSSQL databází:
- Struktura dat odpovídá budoucím DB tabulkám
- Jednoduchá migrace z mock dat na DB
- Routes a logika zůstanou stejné

### Plánované tabulky:
- `topics` - témata
- `lessons` - lekce
- `quizzes` - kvízy
- `quiz_questions` - otázky kvízů
- `users` - uživatelé
- `user_progress` - pokrok uživatelů
- `user_quiz_results` - výsledky kvízů

## 🌐 CORS

Server má povolený CORS pro všechny origin, což umožňuje přístup z frontendu běžícího na jiném portu/doméně.

## 🐛 Error Handling

API vrací konzistentní error response:
```json
{
  "success": false,
  "error": "Popis chyby"
}
```

HTTP status kódy:
- `200` - Úspěch
- `400` - Špatný request
- `404` - Nenalezeno
- `500` - Interní chyba serveru

## 📝 Environment proměnné

Vytvořte `.env` soubor:
```env
PORT=5000
NODE_ENV=development
```

## 🚀 Next Steps - Co dále

### Pro kompletní MVP:
1. **Frontend** - React/Next.js aplikace
2. **Integrace** - Propojení frontendu s tímto backendem
3. **Autentizace** - JWT tokens pro přihlášení uživatelů
4. **Databáze** - Migrace na MSSQL
5. **AI integrace** - Připojení GPT/Claude pro generování obsahu
6. **Deployment** - Nasazení na Azure/AWS

### Pro produkční verzi:
- [ ] MSSQL databáze integrace
- [ ] Autentizace a autorizace (JWT)
- [ ] AI generování obsahu (OpenAI API)
- [ ] Video hosting/integrace
- [ ] Pokročilé doporučovací algoritmy
- [ ] Admin panel
- [ ] Analytics a tracking
- [ ] Platební systém (Stripe)

## 📞 Support

Pro více informací kontaktujte vývojový tým.

---

**LearnIt** - Učení nikdy nebylo zábavnější! 🎓✨
