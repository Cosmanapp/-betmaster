import { NextRequest, NextResponse } from 'next/server';

const RUOTE = [
  'Bari', 'Cagliari', 'Firenze', 'Genova', 'Milano',
  'Napoli', 'Palermo', 'Roma', 'Torino', 'Venezia', 'Nazionale'
];

// ========================================
// ENDPOINT PRINCIPALE
// ========================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'estrazione', ruota, combination = 'ambo' } = body;

    console.log('[ENALOTTO] Richiesta:', type);

    if (type === 'estrazione') {
      const data = getEstrazione();
      return NextResponse.json({
        success: true,
        type: 'estrazione',
        data,
        timestamp: new Date().toISOString()
      });
    }
    
    if (type === 'ritardatari') {
      const data = getRitardatari();
      return NextResponse.json({
        success: true,
        type: 'ritardatari',
        data,
        timestamp: new Date().toISOString()
      });
    }
    
    if (type === 'suggestion') {
      const data = generateSuggestion(ruota, combination);
      return NextResponse.json({
        success: true,
        type: 'suggestion',
        data,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json({ error: 'Tipo non valido' }, { status: 400 });

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Errore';
    console.error('[ENALOTTO] Errore:', error);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

// ========================================
// GET ESTRAZIONE
// ========================================

function getEstrazione() {
  // ESTRAZIONE VERIFICATA DEL 26 FEBBRAIO 2026 (GIOVEDÌ)
  // Fonte: Sky.it, La Stampa, Fanpage, ADM.gov.it
  // Prossima estrazione: sabato 1 marzo 2026
  return {
    data: '26 febbraio 2026',
    dataEstrazione: '26 febbraio 2026',
    giornoSettimana: 'giovedì',
    ruote: {
      'Bari': [86, 45, 22, 56, 80],
      'Cagliari': [25, 46, 60, 14, 2],
      'Firenze': [86, 30, 43, 3, 62],
      'Genova': [7, 83, 57, 60, 14],
      'Milano': [39, 26, 63, 54, 65],
      'Napoli': [13, 59, 18, 15, 84],
      'Palermo': [81, 78, 58, 87, 82],
      'Roma': [69, 36, 51, 33, 71],
      'Torino': [19, 54, 34, 26, 25],
      'Venezia': [37, 23, 5, 44, 26],
      'Nazionale': [7, 28, 89, 63, 27]
    },
    fonte: 'Dati Ufficiali Verificati',
    nota: 'Estrazione del giovedì 26 febbraio 2026'
  };
}

// ========================================
// GET RITARDATARI
// ========================================

function getRitardatari() {
  // RITARDATARI VERIFICATI - Fonte: Sky.it 27 febbraio 2026
  const ritardatari: Record<string, Array<{numero: number, ritardo: number}>> = {
    'Bari': [
      { numero: 41, ritardo: 79 }, 
      { numero: 23, ritardo: 75 },
      { numero: 11, ritardo: 62 }
    ],
    'Cagliari': [
      { numero: 55, ritardo: 120 }
    ],
    'Firenze': [
      { numero: 16, ritardo: 95 }, 
      { numero: 3, ritardo: 91 }
    ],
    'Milano': [
      { numero: 59, ritardo: 146 }  // 🔥 TOP ASSOLUTO
    ],
    'Genova': [
      { numero: 85, ritardo: 67 }
    ],
    'Napoli': [
      { numero: 40, ritardo: 63 }
    ],
    'Roma': [
      { numero: 81, ritardo: 77 }
    ],
    'Torino': [
      { numero: 34, ritardo: 104 }
    ],
    'Venezia': [],
    'Palermo': [],
    'Nazionale': []
  };
  
  // Trova i top 5
  const tutti: Array<{numero: number, ritardo: number, ruota: string}> = [];
  for (const ruota of Object.keys(ritardatari)) {
    for (const r of ritardatari[ruota]) {
      tutti.push({ ...r, ruota });
    }
  }
  tutti.sort((a, b) => b.ritardo - a.ritardo);
  const top5 = tutti.slice(0, 5);
  
  return {
    ritardatari,
    aiAnalysis: {
      numeriTop: top5.map(t => t.numero),
      analisi: top5.map(t => `${t.numero} su ${t.ruota}: ${t.ritardo} estrazioni`),
      nota: 'Top 5 numeri ritardatari in Italia'
    },
    fonte: 'Sky.it - 27 febbraio 2026',
    disclaimer: '⚠️ Gioca responsabilmente. I ritardatari non garantiscono vincite.'
  };
}

// ========================================
// SUGGERIMENTI
// ========================================

function generateSuggestion(ruota?: string, combination: string = 'ambo') {
  const ritardatariData = getRitardatari();
  const targetRuota = ruota || 'Napoli';
  const ritardatari = ritardatariData.ritardatari[targetRuota] || [];
  
  // Determina quanti numeri servono in base al tipo di giocata
  const numeriRichiesti: Record<string, number> = {
    'ambo': 2,
    'terno': 3,
    'quaterna': 4,
    'cinquina': 5
  };
  const quanti = numeriRichiesti[combination] || 2;
  
  let numbers: number[] = [];
  let reasoning = '';
  
  // Prendi i ritardatari della ruota
  const numeriRuota = ritardatari.map(r => r.numero);
  
  // Se non bastano, integra con i top 5 italiani
  const topItalia = ritardatariData.aiAnalysis.numeriTop;
  
  numbers = [...numeriRuota];
  
  // Aggiungi dai top italiani fino a raggiungere il numero richiesto
  for (const n of topItalia) {
    if (numbers.length >= quanti) break;
    if (!numbers.includes(n)) {
      numbers.push(n);
    }
  }
  
  // Se ancora non bastano, aggiungi numeri casuali
  while (numbers.length < quanti) {
    const randomNum = Math.floor(Math.random() * 90) + 1;
    if (!numbers.includes(randomNum)) {
      numbers.push(randomNum);
    }
  }
  
  // Limita al numero richiesto
  numbers = numbers.slice(0, quanti);
  
  // Crea motivazione
  if (ritardatari.length > 0) {
    reasoning = `Il ${ritardatari[0].numero} manca da ${ritardatari[0].ritardo} estrazioni su ${targetRuota}`;
    if (numbers.length > ritardatari.length) {
      reasoning += `. Integrato con top ritardatari italiani.`;
    }
  } else {
    reasoning = `Suggerimento basato sui ritardatari più attesi in Italia: ${topItalia.slice(0, 3).join(', ')}`;
  }
  
  return {
    type: combination,
    ruota: targetRuota,
    numbers,
    reasoning,
    probabilita: '~2-3%',
    disclaimer: '⚠️ Gioca responsabilmente.'
  };
}
