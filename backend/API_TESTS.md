# API Test Examples

Zde jsou příklady volání API pro testování backendu.

## Základní testy

### 1. Health Check
```bash
curl http://localhost:5000/api/health
```

### 2. Získat všechna témata
```bash
curl http://localhost:5000/api/topics
```

### 3. Získat konkrétní téma
```bash
curl http://localhost:5000/api/topics/1
```

### 4. Získat témata podle kategorie
```bash
curl http://localhost:5000/api/topics/category/Fyzika
```

### 5. Získat všechny lekce
```bash
curl http://localhost:5000/api/lessons
```

### 6. Získat lekci pro téma
```bash
curl http://localhost:5000/api/lessons/1
curl http://localhost:5000/api/lessons/2
curl http://localhost:5000/api/lessons/3
```

### 7. Získat kvíz
```bash
curl http://localhost:5000/api/quiz/1
```

### 8. Odeslat odpovědi kvízu
```bash
curl -X POST http://localhost:5000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "answers": [0, 2, 2, 2]
  }'
```

### 9. Získat pokrok uživatele
```bash
curl http://localhost:5000/api/user-progress
```

### 10. Označit lekci jako dokončenou
```bash
curl -X POST http://localhost:5000/api/user-progress/complete-lesson \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "lessonId": 1
  }'
```

### 11. Uložit výsledek kvízu
```bash
curl -X POST http://localhost:5000/api/user-progress/save-quiz-result \
  -H "Content-Type: application/json" \
  -d '{
    "topicId": 1,
    "score": {"correct": 3, "total": 4},
    "percentage": 75
  }'
```

### 12. Resetovat pokrok
```bash
curl -X POST http://localhost:5000/api/user-progress/reset
```

## Test flow - Kompletní učební cyklus

```bash
# 1. Získat dostupná témata
curl http://localhost:5000/api/topics

# 2. Vybrat téma a získat lekci (např. Fyzika - ID 1)
curl http://localhost:5000/api/lessons/1

# 3. Označit lekci jako přečtenou
curl -X POST http://localhost:5000/api/user-progress/complete-lesson \
  -H "Content-Type: application/json" \
  -d '{"topicId": 1, "lessonId": 1}'

# 4. Získat kvíz
curl http://localhost:5000/api/quiz/1

# 5. Odeslat odpovědi
curl -X POST http://localhost:5000/api/quiz/submit \
  -H "Content-Type: application/json" \
  -d '{"topicId": 1, "answers": [0, 2, 2, 2]}'

# 6. Uložit výsledek
curl -X POST http://localhost:5000/api/user-progress/save-quiz-result \
  -H "Content-Type: application/json" \
  -d '{"topicId": 1, "score": {"correct": 3, "total": 4}, "percentage": 75}'

# 7. Zkontrolovat pokrok
curl http://localhost:5000/api/user-progress
```

## Očekávané výsledky

### Všechna témata
Vrátí 3 témata: Fyzika, Biologie, Psychologie

### Lekce
Vrátí kompletní markdown obsah, URL videa, klíčové body

### Kvíz
Vrátí 4 otázky s možnostmi odpovědí (bez správných odpovědí)

### Vyhodnocení kvízu
Vrátí skóre, procenta, detaily každé odpovědi a zpětnou vazbu

### Uživatelský pokrok
Zobrazí dokončené lekce, výsledky kvízů, body a úroveň
