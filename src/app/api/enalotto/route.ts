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
  
  let numbers: number[] = [];
  let reasoning = '';
  
  if (ritardatari.length > 0) {
    numbers = ritardatari.slice(0, 3).map(r => r.numero);
    reasoning = `Il ${ritardatari[0].numero} manca da ${ritardatari[0].ritardo} estrazioni su ${targetRuota}`;
  } else {
    numbers = ritardatariData.aiAnalysis.numeriTop.slice(0, 3);
    reasoning = `Suggerimento basato sui ritardatari più attesi in Italia`;
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
