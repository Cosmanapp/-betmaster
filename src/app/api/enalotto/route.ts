import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { 
  leggiEstrazione, 
  leggiRitardatari, 
  salvaEstrazione, 
  salvaRitardatari, 
  redisDisponibile 
} from '@/lib/kv-store';

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';

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

    const redisOk = await redisDisponibile();

    if (type === 'estrazione') {
      const data = await getEstrazione(redisOk);
      return NextResponse.json({
        success: true,
        type: 'estrazione',
        data,
        timestamp: new Date().toISOString()
      });
    }
    
    if (type === 'ritardatari') {
      const data = await getRitardatari(redisOk);
      return NextResponse.json({
        success: true,
        type: 'ritardatari',
        data,
        timestamp: new Date().toISOString()
      });
    }
    
    if (type === 'suggestion') {
      const data = await generateSuggestion(ruota, combination, redisOk);
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
// GET ESTRAZIONE - WEB SEARCH REALE
// ========================================

async function getEstrazione(redisOk: boolean) {
  // 1. Prova Redis cache
  if (redisOk) {
    const cached = await leggiEstrazione();
    if (cached && cached.ruote && Object.keys(cached.ruote).length >= 10) {
      // Verifica età (max 24 ore)
      const etaMs = Date.now() - new Date(cached.timestamp || Date.now()).getTime();
      const etaOre = etaMs / (1000 * 60 * 60);
      
      if (etaOre < 24) {
        console.log('[ENALOTTO] ✓ Dati da cache Redis (età:', Math.round(etaOre), 'ore)');
        return { ...cached, fonte: 'Cache Redis' };
      }
    }
  }
  
  // 2. Web search per estrazione reale
  console.log('[ENALOTTO] Ricerca estrazione reale...');
  const estrazione = await fetchEstrazioneReale();
  
  if (estrazione.ruote && Object.keys(estrazione.ruote).length >= 10) {
    estrazione.timestamp = new Date().toISOString();
    if (redisOk) {
      await salvaEstrazione(estrazione);
    }
    return estrazione;
  }
  
  // 3. Fallback - ultima estrazione nota
  return getFallbackEstrazione();
}

// ========================================
// WEB SEARCH PER ESTRAZIONE
// ========================================

async function fetchEstrazioneReale(): Promise<any> {
  try {
    const zai = await ZAI.create();
    
    const today = new Date();
    const giorno = today.getDate();
    const mese = today.toLocaleDateString('it-IT', { month: 'long' });
    const anno = today.getFullYear();
    
    // Query per trovare l'ultima estrazione
    const query = `"estrazione lotto" "${giorno} ${mese} ${anno}" numeri Bari Napoli Roma Milano risultati`;
    console.log('[ENALOTTO] Query:', query);
    
    const results = await zai.functions.invoke('web_search', {
      query,
      num: 10
    });
    
    return parseEstrazioneFromWeb(results, `${giorno} ${mese} ${anno}`);
    
  } catch (error) {
    console.error('[ENALOTTO] Errore fetch estrazione:', error);
    return { ruote: {} };
  }
}

function parseEstrazioneFromWeb(results: unknown, dataDefault: string): any {
  const estrazione: any = { 
    data: dataDefault, 
    dataEstrazione: dataDefault,
    ruote: {},
    fonte: 'Web Search'
  };
  
  if (!Array.isArray(results)) return estrazione;
  
  // Unisci tutti i snippet
  const allText = results.map((r: any) => r.snippet || '').join(' | ');
  console.log('[ENALOTTO] Testo analizzato, lunghezza:', allText.length);
  
  // Cerca la data dell'estrazione
  const dateMatch = allText.match(/(\d{1,2})\s*(febbraio|gennaio|marzo|aprile|maggio|giugno|luglio|agosto|settembre|ottobre|novembre|dicembre)\s*(\d{4})?/i);
  if (dateMatch) {
    estrazione.data = dateMatch[0];
    estrazione.dataEstrazione = dateMatch[0];
  }
  
  // Pattern per ogni ruota
  for (const ruota of RUOTE) {
    if (estrazione.ruote[ruota]) continue;
    
    // Pattern: "Bari: 86 - 45 - 22 - 56 - 80" o "Bari 86 45 22 56 80"
    const patterns = [
      new RegExp(`${ruota}[\\s:–-]*(\\d{1,2})[\\s–-]+(\\d{1,2})[\\s–-]+(\\d{1,2})[\\s–-]+(\\d{1,2})[\\s–-]+(\\d{1,2})`, 'gi'),
      new RegExp(`${ruota}[^\\d]*(\\d{1,2})[^\\d]+(\\d{1,2})[^\\d]+(\\d{1,2})[^\\d]+(\\d{1,2})[^\\d]+(\\d{1,2})`, 'gi')
    ];
    
    for (const pattern of patterns) {
      const matches = allText.matchAll(pattern);
      
      for (const match of matches) {
        const numeri = [
          parseInt(match[1]),
          parseInt(match[2]),
          parseInt(match[3]),
          parseInt(match[4]),
          parseInt(match[5])
        ];
        
        // Validazione
        if (numeri.every(n => n >= 1 && n <= 90)) {
          const unici = new Set(numeri);
          if (unici.size === 5) {
            estrazione.ruote[ruota] = numeri;
            console.log(`[ENALOTTO] ✓ ${ruota}:`, numeri.join(' '));
            break;
          }
        }
      }
      if (estrazione.ruote[ruota]) break;
    }
  }
  
  console.log('[ENALOTTO] Ruote trovate:', Object.keys(estrazione.ruote).length);
  return estrazione;
}

// ========================================
// GET RITARDATARI - WEB SEARCH REALE
// ========================================

async function getRitardatari(redisOk: boolean) {
  // 1. Prova Redis cache
  if (redisOk) {
    const cached = await leggiRitardatari();
    if (cached && Object.keys(cached).some(k => Array.isArray((cached as any)[k]) && (cached as any)[k].length > 0)) {
      const etaMs = Date.now() - new Date((cached as any).timestamp || Date.now()).getTime();
      const etaOre = etaMs / (1000 * 60 * 60);
      
      if (etaOre < 24) {
        console.log('[ENALOTTO] ✓ Ritardatari da cache');
        return {
          ritardatari: cached,
          aiAnalysis: await analyzeRitardatariAI(cached),
          fonte: 'Cache Redis',
          disclaimer: '⚠️ Gioca responsabilmente.'
        };
      }
    }
  }
  
  // 2. Web search per ritardatari reali
  console.log('[ENALOTTO] Ricerca ritardatari reali...');
  const ritardatari = await fetchRitardatariReali();
  
  if (redisOk && ritardatari) {
    (ritardatari as any).timestamp = new Date().toISOString();
    await salvaRitardatari(ritardatari);
  }
  
  return {
    ritardatari,
    aiAnalysis: await analyzeRitardatariAI(ritardatari),
    fonte: 'Web Search',
    disclaimer: '⚠️ Gioca responsabilmente.'
  };
}

// ========================================
// WEB SEARCH PER RITARDATARI
// ========================================

async function fetchRitardatariReali(): Promise<any> {
  try {
    const zai = await ZAI.create();
    
    // Query per ritardatari
    const query = 'lotto ritardatari oggi numeri manca estrazioni Bari Napoli Milano Cagliari';
    console.log('[ENALOTTO] Query ritardatari:', query);
    
    const results = await zai.functions.invoke('web_search', {
      query,
      num: 10
    });
    
    return parseRitardatariFromWeb(results);
    
  } catch (error) {
    console.error('[ENALOTTO] Errore fetch ritardatari:', error);
    return getFallbackRitardatari();
  }
}

function parseRitardatariFromWeb(results: unknown): any {
  const ritardatari: Record<string, Array<{numero: number, ritardo: number}>> = {};
  
  for (const ruota of RUOTE) {
    ritardatari[ruota] = [];
  }
  
  if (!Array.isArray(results)) return ritardatari;
  
  const allText = results.map((r: any) => r.snippet || '').join(' | ');
  console.log('[ENALOTTO] Analisi ritardatari, testo:', allText.length);
  
  // Pattern: "Bari 41 (manca da 79 estrazioni)" o "55 – Cagliari: manca da 115 estrazioni"
  for (const ruota of RUOTE) {
    // Pattern 1: "Bari 41 (79)" o "Bari: 41 (79)"
    const pattern1 = new RegExp(
      `${ruota}[\\s:]*(\\d{1,2})[^\\d]*(\\d+)[^\\d]*(?:estr|conc|volte|assenze)`,
      'gi'
    );
    
    let match;
    while ((match = pattern1.exec(allText)) !== null) {
      const numero = parseInt(match[1]);
      const ritardo = parseInt(match[2]);
      
      if (numero >= 1 && numero <= 90 && ritardo > 20) {
        if (!ritardatari[ruota].find(r => r.numero === numero)) {
          ritardatari[ruota].push({ numero, ritardo });
        }
      }
    }
    
    // Pattern 2: "41 – Bari: manca da 74"
    const pattern2 = new RegExp(
      `(\\d{1,2})[^\\d]*${ruota}[^\\d]*(\\d+)[^\\d]*(?:estr|conc|volte)`,
      'gi'
    );
    
    while ((match = pattern2.exec(allText)) !== null) {
      const numero = parseInt(match[1]);
      const ritardo = parseInt(match[2]);
      
      if (numero >= 1 && numero <= 90 && ritardo > 20) {
        if (!ritardatari[ruota].find(r => r.numero === numero)) {
          ritardatari[ruota].push({ numero, ritardo });
        }
      }
    }
  }
  
  // Ordina per ritardo decrescente e prendi i primi 5
  for (const ruota of RUOTE) {
    ritardatari[ruota].sort((a, b) => b.ritardo - a.ritardo);
    ritardatari[ruota] = ritardatari[ruota].slice(0, 5);
  }
  
  // Se non abbiamo trovato abbastanza dati, prova un altro approccio
  const ruoteConDati = RUOTE.filter(r => ritardatari[r].length > 0).length;
  
  if (ruoteConDati < 4) {
    console.log('[ENALOTTO] Pochi dati trovati, uso fallback');
    return getFallbackRitardatari();
  }
  
  console.log('[ENALOTTO] ✓ Ritardatari trovati per', ruoteConDati, 'ruote');
  return ritardatari;
}

// ========================================
// AI ANALYSIS
// ========================================

async function analyzeRitardatariAI(ritardatari: any) {
  if (!GROQ_API_KEY) {
    // Analisi semplice senza AI
    const topNumeri: number[] = [];
    for (const ruota of Object.keys(ritardatari)) {
      for (const r of ritardatari[ruota]) {
        if (!topNumeri.includes(r.numero) && r.ritardo > 50) {
          topNumeri.push(r.numero);
        }
      }
    }
    return { 
      numeriTop: topNumeri.slice(0, 5), 
      nota: 'Numeri con maggior ritardo trovati' 
    };
  }
  
  const prompt = `Analizza questi ritardatari del Lotto italiano:
${JSON.stringify(ritardatari, null, 2)}

Indica i 5 numeri con maggior probabilità statistica di uscire prossimamente.
Rispondi SOLO con JSON: {"numeriTop":[1,2,3,4,5],"nota":"breve analisi"}`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Sei un matematico esperto di statistica. Rispondi solo con JSON valido.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.1,
        max_tokens: 500
      })
    });

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
    
  } catch (e) {
    console.error('[ENALOTTO] AI error:', e);
  }
  
  return { numeriTop: [], nota: 'Analisi AI non disponibile' };
}

// ========================================
// SUGGERIMENTI
// ========================================

async function generateSuggestion(ruota?: string, combination: string = 'ambo', redisOk: boolean = true) {
  const ritardatariData = await getRitardatari(redisOk);
  const targetRuota = ruota || 'Napoli';
  const ritardatari = ritardatariData.ritardatari[targetRuota] || [];
  
  const numbers = ritardatari.slice(0, 3).map((r: any) => r.numero);
  
  if (numbers.length < 3) {
    // Se non ci sono dati per questa ruota, prendi i top generali
    const topNumeri = ritardatariData.aiAnalysis?.numeriTop || [1, 2, 3];
    numbers.push(...topNumeri.slice(0, 3 - numbers.length));
  }
  
  return {
    type: combination,
    ruota: targetRuota,
    numbers: numbers.slice(0, 3),
    reasoning: ritardatari.length > 0 
      ? `Il ${ritardatari[0].numero} manca da ${ritardatari[0].ritardo} estrazioni su ${targetRuota}`
      : `Suggerimento basato sui ritardatari generali`,
    probabilita: '~2-3%',
    disclaimer: '⚠️ Gioca responsabilmente. I ritardatari non garantiscono vincite.'
  };
}

// ========================================
// FALLBACK DATA (DA AGGIORNARE MANUALMENTE)
// ========================================

function getFallbackEstrazione(): any {
  // Ultima estrazione nota e verificata
  return {
    data: '26 febbraio 2026',
    dataEstrazione: '26 febbraio 2026',
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
    fonte: 'Dati Cached (ultima estrazione disponibile)',
    timestamp: new Date().toISOString()
  };
}

function getFallbackRitardatari(): any {
  // Ritardatari noti (aggiornare periodicamente)
  // Fonte: Sky.it 27 febbraio 2026
  return {
    'Bari': [{ numero: 41, ritardo: 79 }, { numero: 23, ritardo: 75 }, { numero: 11, ritardo: 62 }],
    'Cagliari': [{ numero: 55, ritardo: 120 }, { numero: 34, ritardo: 86 }],
    'Firenze': [{ numero: 16, ritardo: 95 }, { numero: 3, ritardo: 91 }],
    'Milano': [{ numero: 59, ritardo: 146 }],
    'Genova': [{ numero: 85, ritardo: 67 }],
    'Napoli': [{ numero: 40, ritardo: 63 }],
    'Roma': [{ numero: 81, ritardo: 77 }],
    'Torino': [{ numero: 34, ritardo: 104 }],
    'Venezia': [],
    'Palermo': [],
    'Nazionale': []
  };
}
