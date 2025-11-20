# 🎯 Swagger UI - Průvodce testováním API

## Přístup k Swagger UI

Po spuštění serveru otevřete v prohlížeči:
```
http://localhost:3001/api-docs
```

Případně navštivte kořenovou URL, která vás automaticky přesměruje:
```
http://localhost:3001/
```

## 📖 Jak používat Swagger UI

### 1. Prohlížení endpointů

Swagger UI zobrazuje všechny dostupné API endpointy rozdělené do kategorií:
- **Health** - Health check
- **Topics** - Správa témat
- **Lessons** - Lekce
- **Quiz** - Kvízy
- **User Progress** - Pokrok uživatele

### 2. Testování GET endpointů

**Krok za krokem:**

1. **Klikněte na endpoint** (např. `GET /api/topics`)
2. **Klikněte na tlačítko "Try it out"** (v pravém horním rohu)
3. **Vyplňte parametry** (pokud jsou vyžadovány)
4. **Klikněte "Execute"**
5. **Prohlédněte si odpověď** níže v sekci "Responses"

**Příklad - Získat všechna témata:**
```
GET /api/topics
→ Klikněte "Try it out"
→ Klikněte "Execute"
→ Uvidíte JSON s 3 tématy (Fyzika, Biologie, Psychologie)
```

**Příklad - Získat konkrétní téma:**
```
GET /api/topics/{id}
→ Klikněte "Try it out"
→ Do pole "id" zadejte: 1
→ Klikněte "Execute"
→ Uvidíte detail tématu Fyzika
```

### 3. Testování POST endpointů

**Příklad - Odeslat odpovědi kvízu:**

1. **Klikněte na** `POST /api/quiz/submit`
2. **Klikněte "Try it out"**
3. **V textovém poli uvidíte příklad JSON:**
   ```json
   {
     "topicId": 1,
     "answers": [0, 2, 2, 2]
   }
   ```
4. **Upravte data podle potřeby** (nebo nechte příklad)
5. **Klikněte "Execute"**
6. **Prohlédněte si vyhodnocení kvízu** v odpovědi

**Další příklad - Označit lekci jako dokončenou:**
```json
{
  "topicId": 1,
  "lessonId": 1
}
```

## 🎓 Příklad kompletního učebního cyklu ve Swagger UI

### 1. Získat dostupná témata
```
GET /api/topics
```
→ Vyberte si téma (např. ID 1 = Fyzika)

### 2. Získat lekci
```
GET /api/lessons/1
```
→ Přečtěte si obsah lekce

### 3. Označit lekci jako přečtenou
```
POST /api/user-progress/complete-lesson
{
  "topicId": 1,
  "lessonId": 1
}
```

### 4. Získat kvíz
```
GET /api/quiz/1
```
→ Uvidíte 4 otázky s možnostmi odpovědí

### 5. Odeslat odpovědi
```
POST /api/quiz/submit
{
  "topicId": 1,
  "answers": [0, 2, 2, 2]
}
```
→ Uvidíte vyhodnocení: správné odpovědi, skóre, feedback

### 6. Uložit výsledek kvízu
```
POST /api/user-progress/save-quiz-result
{
  "topicId": 1,
  "score": {
    "correct": 4,
    "total": 4
  },
  "percentage": 100
}
```

### 7. Zkontrolovat pokrok
```
GET /api/user-progress
```
→ Uvidíte body, úroveň, odznaky

## 💡 Tipy a triky

### Odpovědi na kvízy
Indexy odpovědí jsou 0-3 (první odpověď = 0, čtvrtá = 3):
```json
{
  "topicId": 1,
  "answers": [0, 2, 2, 2]  // První otázka: index 0, další: index 2
}
```

### Dostupné ID
- **Témata**: 1 (Fyzika), 2 (Biologie), 3 (Psychologie)
- **Lekce**: Používají stejné ID jako témata
- **Kvízy**: Používají stejné ID jako témata

### Resetování pokroku
Pro opětovné testování:
```
POST /api/user-progress/reset
```

### Správné odpovědi pro testování

**Fyzika (topic 1):**
- Otázka 1: 0
- Otázka 2: 2
- Otázka 3: 2
- Otázka 4: 2

**Biologie (topic 2):**
- Otázka 1: 1
- Otázka 2: 2
- Otázka 3: 2
- Otázka 4: 2

**Psychologie (topic 3):**
- Otázka 1: 1
- Otázka 2: 2
- Otázka 3: 1
- Otázka 4: 1

## 🎨 Funkcionalita Swagger UI

### Sekce "Schemas"
Na konci dokumentace najdete schémata všech objektů:
- **Topic** - Struktura tématu
- **Lesson** - Struktura lekce
- **Quiz** - Struktura kvízu
- **UserProgress** - Struktura pokroku

### Response codes
- **200** - Úspěch
- **400** - Špatný request (chybí data)
- **404** - Nenalezeno
- **500** - Chyba serveru

### Curl příkazy
Swagger automaticky generuje curl příkazy - najdete je v sekci "Curl" po kliknutí na "Execute".

## 🚀 Výhody Swagger UI

✅ **Interaktivní testování** - Není potřeba Postman nebo curl  
✅ **Živá dokumentace** - Vždy aktuální s kódem  
✅ **Příklady dat** - Vidíte ukázkové requesty/responses  
✅ **Validace** - Automatická kontrola typů dat  
✅ **Rychlé prototypování** - Okamžité testování změn  

## 📝 Poznámky

- Data jsou uložena v paměti → po restartu serveru se ztratí
- User progress je sdílený pro všechny (není autentizace)
- Pro produkční použití bude potřeba MSSQL databáze

---

**Užijte si testování LearnIt API!** 🎓✨
