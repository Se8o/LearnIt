const quizzes = [
  {
    id: 1,
    topicId: 1,
    title: 'Test znalostí - Newtonovy zákony',
    questions: [
      {
        id: 1,
        question: 'Co říká první Newtonův zákon?',
        options: [
          'Těleso zůstává v klidu nebo rovnoměrném pohybu, pokud na něj nepůsobí síla',
          'Síla se rovná hmotnosti krát zrychlení',
          'Každá akce má stejnou reakci',
          'Rychlost je úměrná síle'
        ],
        correctAnswer: 0,
        explanation: 'První Newtonův zákon (zákon setrvačnosti) říká, že těleso setrvává ve svém stavu, dokud na něj nepůsobí vnější síla.'
      },
      {
        id: 2,
        question: 'Jaký je vzorec druhého Newtonova zákona?',
        options: [
          'F = m / a',
          'F = m + a',
          'F = m × a',
          'F = a / m'
        ],
        correctAnswer: 2,
        explanation: 'Druhý Newtonův zákon: Síla (F) se rovná hmotnosti (m) krát zrychlení (a).'
      },
      {
        id: 3,
        question: 'Který příklad demonstruje třetí Newtonův zákon?',
        options: [
          'Míč padající k zemi',
          'Auto brzdiace na semaforu',
          'Raketa vystřelující vzhůru díky výfukovým plynům',
          'Kolo se pohybující po silnici'
        ],
        correctAnswer: 2,
        explanation: 'Raketa demonstruje akci a reakci - výfukové plyny jdou dolů (akce) a raketa letí nahoru (reakce).'
      },
      {
        id: 4,
        question: 'Co se stane, když na těleso nepůsobí žádná výsledná síla?',
        options: [
          'Těleso se zastaví',
          'Těleso zrychlí',
          'Těleso se bude pohybovat konstantní rychlostí nebo zůstane v klidu',
          'Těleso změní směr'
        ],
        correctAnswer: 2,
        explanation: 'Podle prvního zákona, pokud je výsledná síla nulová, těleso zachová svůj stav (klid nebo rovnoměrný pohyb).'
      }
    ]
  },
  {
    id: 2,
    topicId: 2,
    title: 'Test znalostí - Buněčná stavba',
    questions: [
      {
        id: 1,
        question: 'Jaký je hlavní rozdíl mezi prokaryotickou a eukaryotickou buňkou?',
        options: [
          'Velikost buňky',
          'Přítomnost buněčného jádra',
          'Barva buňky',
          'Tvar buňky'
        ],
        correctAnswer: 1,
        explanation: 'Eukaryotické buňky mají buněčné jádro s membránou, prokaryotické ne.'
      },
      {
        id: 2,
        question: 'Která organela se nazývá "elektrárna buňky"?',
        options: [
          'Jádro',
          'Ribosom',
          'Mitochondrie',
          'Cytoplazma'
        ],
        correctAnswer: 2,
        explanation: 'Mitochondrie produkují energii ve formě ATP, proto se jim říká "elektrárny buňky".'
      },
      {
        id: 3,
        question: 'Co je hlavní funkcí buněčné membrány?',
        options: [
          'Produkce energie',
          'Syntéza proteinů',
          'Regulace transportu látek do a z buňky',
          'Uchovávání DNA'
        ],
        correctAnswer: 2,
        explanation: 'Buněčná membrána je selektivně propustná a řídí, co může vstoupit do buňky a co z ní odejít.'
      },
      {
        id: 4,
        question: 'Kde se nachází genetická informace (DNA) v eukaryotické buňce?',
        options: [
          'V cytoplazmě',
          'V mitochondriích',
          'V jádře (nucleusu)',
          'V ribosomech'
        ],
        correctAnswer: 2,
        explanation: 'DNA je v eukaryotických buňkách uložena v jádře, které je odděleno jadernou membránou.'
      }
    ]
  },
  {
    id: 3,
    topicId: 3,
    title: 'Test znalostí - Základy motivace',
    questions: [
      {
        id: 1,
        question: 'Co je vnitřní (intrinsická) motivace?',
        options: [
          'Motivace založená na odměnách a trestech',
          'Motivace vycházející z vlastního zájmu a uspokojení',
          'Motivace založená na strachu',
          'Motivace kvůli penězům'
        ],
        correctAnswer: 1,
        explanation: 'Vnitřní motivace vychází z osobního zájmu - činnost sama o sobě přináší uspokojení.'
      },
      {
        id: 2,
        question: 'Kolik úrovní má Maslowova pyramida potřeb?',
        options: [
          '3',
          '4',
          '5',
          '6'
        ],
        correctAnswer: 2,
        explanation: 'Maslowova pyramida má 5 úrovní: fyziologické potřeby, bezpečí, sociální potřeby, uznání a seberealizace.'
      },
      {
        id: 3,
        question: 'Co znamená "A" v akronymu SMART cíle?',
        options: [
          'Automatic (automatický)',
          'Achievable (dosažitelný)',
          'Attractive (atraktivní)',
          'Advanced (pokročilý)'
        ],
        correctAnswer: 1,
        explanation: 'SMART: Specific, Measurable, Achievable, Relevant, Time-bound.'
      },
      {
        id: 4,
        question: 'Který neurotransmiter je klíčový pro motivaci?',
        options: [
          'Serotonin',
          'Dopamin',
          'Adrenalin',
          'Melatonin'
        ],
        correctAnswer: 1,
        explanation: 'Dopamin hraje zásadní roli v motivaci a systému odměn v mozku.'
      }
    ]
  }
];

module.exports = quizzes;
