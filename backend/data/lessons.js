const lessons = [
  {
    id: 1,
    topicId: 1,
    title: 'Newtonovy zákony pohybu',
    content: `
# Newtonovy zákony pohybu

Isaac Newton formuloval tři základní zákony, které popisují pohyb těles:

## 1. První Newtonův zákon (Zákon setrvačnosti)
Těleso setrvává v klidu nebo rovnoměrném přímočarém pohybu, pokud na něj nepůsobí žádná síla nebo je výsledná síla nulová.

**Příklad:** Míč na stole zůstane ležet, dokud ho někdo neodhodí.

## 2. Druhý Newtonův zákon
Zrychlení tělesa je přímo úměrné působící síle a nepřímo úměrné hmotnosti tělesa.

**Vzorec:** F = m × a

Kde:
- F = síla (Newton)
- m = hmotnost (kg)
- a = zrychlení (m/s²)

## 3. Třetí Newtonův zákon (Akce a reakce)
Každá akce vyvolává stejně velkou, ale opačně orientovanou reakci.

**Příklad:** Když skáčete z lodě na břeh, loď se odtlačí opačným směrem.

## Praktické využití
Tyto zákony se používají v:
- Automobilovém průmyslu (bezpečnost)
- Kosmonautice (vypouštění raket)
- Sportu (analýza pohybu)
    `.trim(),
    videoUrl: 'https://www.youtube.com/embed/kKKM8Y-u7ds',
    videoTitle: 'Newtonovy zákony jednoduše vysvětlené',
    estimatedTime: 5,
    keyPoints: [
      'Zákon setrvačnosti - tělesa zůstávají v klidu nebo pohybu',
      'F = m × a - vztah mezi silou, hmotností a zrychlením',
      'Akce a reakce - síly vždy působí v párech',
      'Praktické aplikace v každodenním životě'
    ]
  },
  {
    id: 2,
    topicId: 2,
    title: 'Buněčná stavba',
    content: `
# Buněčná stavba

Buňka je základní stavební a funkční jednotka všech živých organismů.

## Typy buněk

### 1. Prokaryotická buňka
- Nemá buněčné jádro
- DNA volně v cytoplazmě
- Příklad: bakterie

### 2. Eukaryotická buňka
- Má buněčné jádro
- Složitější struktura
- Příklad: rostlinné a živočišné buňky

## Hlavní části buňky

### Buněčná membrána
- Odděluje buňku od okolí
- Reguluje transport látek
- Selektivně propustná

### Cytoplazma
- Vnitřní prostředí buňky
- Obsahuje organely
- Místo biochemických reakcí

### Jádro (nucleus)
- Uchovává genetickou informaci (DNA)
- Řídí buněčné procesy
- Obsahuje jadernou membránu

### Mitochondrie
- "Elektrárny" buňky
- Produkují energii (ATP)
- Důležité pro dýchání

### Ribosomy
- Syntéza proteinů
- Mohou být volné nebo vázané

## Zajímavosti
- Lidské tělo obsahuje přibližně 37 bilionů buněk
- Největší buňka je pštrosí vejce
- Nejmenší bakteriální buňky měří jen 0,2 mikrometru
    `.trim(),
    videoUrl: 'https://www.youtube.com/embed/URUJD5NEXC8',
    videoTitle: 'Stavba buňky - jednoduchý přehled',
    estimatedTime: 4,
    keyPoints: [
      'Buňka je základní jednotka života',
      'Prokaryotické vs eukaryotické buňky',
      'Hlavní organely: jádro, mitochondrie, ribosomy',
      'Buněčná membrána řídí transport látek'
    ]
  },
  {
    id: 3,
    topicId: 3,
    title: 'Základy motivace',
    content: `
# Základy motivace v psychologii

Motivace je proces, který iniciuje, řídí a udržuje chování zaměřené k dosažení cíle.

## Typy motivace

### 1. Vnitřní motivace (intrinsická)
- Vychází z vnitřních pohnutek
- Činnost sama o sobě přináší uspokojení
- **Příklad:** Čtení knihy, protože vás baví

### 2. Vnější motivace (extrinsická)
- Ovlivněna vnějšími faktory
- Odměny nebo vyhnutí se trestu
- **Příklad:** Učení se kvůli známkám

## Maslowova pyramida potřeb

Hierarchie potřeb od základních po nejvyšší:

1. **Fyziologické potřeby** - jídlo, spánek, dýchání
2. **Bezpečí** - ochrana, stabilita
3. **Sociální potřeby** - přátelství, láska, sounáležitost
4. **Uznání** - respekt, sebevědomí, úspěch
5. **Seberealizace** - naplnění potenciálu

## Jak zvýšit motivaci?

### SMART cíle
- **S**pecific (konkrétní)
- **M**easurable (měřitelné)
- **A**chievable (dosažitelné)
- **R**elevant (relevantní)
- **T**ime-bound (časově ohraničené)

### Další tipy:
- Rozdělte velké úkoly na menší kroky
- Odměňujte se za pokrok
- Vizualizujte úspěch
- Najděte si accountability partnera
- Vytvořte si rutinu

## Zajímavosti
- Dopamin (neurotransmiter) hraje klíčovou roli v motivaci
- Přílišná vnější motivace může snížit vnitřní motivaci
- Malé úspěchy vytváří "momentum" pro větší úspěchy
    `.trim(),
    videoUrl: 'https://www.youtube.com/embed/Lp7E973zozc',
    videoTitle: 'Co je motivace a jak ji udržet',
    estimatedTime: 5,
    keyPoints: [
      'Rozdíl mezi vnitřní a vnější motivací',
      'Maslowova pyramida potřeb',
      'SMART cíle pro lepší výsledky',
      'Dopamin a neurověda motivace'
    ]
  }
];

module.exports = lessons;
