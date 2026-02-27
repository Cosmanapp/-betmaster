import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { salvaEstrazione, salvaRitardatari, redisDisponibile } from '@/lib/kv-store';

const RUOTE = [
  'Bari', 'Cagliari', 'Firenze', 'Genova', 'Milano',
  'Napoli', 'Palermo', 'Roma', 'Torino', 'Venezia', 'Nazionale'
];

// ========================================
// CRON JOB - AGGIORNAMENTO AUTOMATICO
// ========================================
// Viene chiamato automaticamente da Vercel Cron ogni Mar/Gio/Sab alle 19:30 UTC
// Configurato in vercel.json

export async function GET(request: NextRequest) {
  // Verifica autorizzazione
  const authHeader = request.headers.get('authorization');
  const isVercelCron = request.headers.get('x-vercel-cron') === 'true';
  const isManual = request.nextUrl.searchParams.get('manual') === 'true';
  
  if (!isVercelCron && !isManual) {
    return NextResponse.json({ error: 'Non autorizzato' }, { status: 401 });
  }
  
  console.log('[CRON] 🔄 Avvio aggiornamento Enalotto...');
  
  const results = {
    estrazione: false,
    ritardatari: false,
    redisOk: false,
    ruoteTrovate: 0,
    timestamp: new Date().toISOString()
  };
  
  try {
    // Verifica Redis
    results.redisOk = await redisDisponibile();
    console.log('[CRON] Redis:', results.redisOk ? 'OK' : 'NON DISPONIBILE');
    
    // Aggiorna estrazione
    const estrazione = await fetchEstrazioneWeb();
    results.ruoteTrovate = estrazione.ruote ? Object.keys(estrazione.ruote).length : 0;
    
    if (estrazione.ruote && Object.keys(estrazione.ruote).length >= 10) {
      estrazione.timestamp = new Date().toISOString();
      if (results.redisOk) {
        const salvato = await salvaEstrazione(estrazione);
        console.log('[CRON] Salvataggio estrazione:', salvato ? 'OK' : 'FALLITO');
      }
      results.estrazione = true;
      console.log('[CRON] ✓ Estrazione:', estrazione.data, '-', results.ruoteTrovate, 'ruote');
    } else {
      console.log('[CRON] ✗ Estrazione incompleta:', results.ruoteTrovate, 'ruote');
    }
    
    // Aggiorna ritardatari
    const ritardatari = await fetchRitardatariWeb();
    if (ritardatari && Object.keys(ritardatari).length > 0) {
      if (results.redisOk) {
        const salvato = await salvaRitardatari(ritardatari);
        console.log('[CRON] Salvataggio ritardatari:', salvato ? 'OK' : 'FALLITO');
      }
      results.ritardatari = true;
      console.log('[CRON] ✓ Ritardatari aggiornati');
    }
    
  } catch (error) {
    console.error('[CRON] ✗ Errore:', error);
  }
  
  return NextResponse.json({
    success: results.estrazione && results.ritardatari,
    results
  });
}

// ========================================
// FETCH ESTRRAZIONE
// ========================================

async function fetchEstrazioneWeb(): Promise<any> {
  try {
    const zai = await ZAI.create();
    
    const today = new Date();
    const giorno = today.getDate();
    const mese = today.toLocaleDateString('it-IT', { month: 'long' });
    const anno = today.getFullYear();
    
    // Query multiple per maggiori possibilità
    const queries = [
      `estrazione lotto ${giorno} ${mese} ${anno} numeri completi Bari Napoli Roma Milano Venezia Torino Cagliari Firenze Genova Palermo Nazionale`,
      `lotto estrazione ${giorno}/${String(today.getMonth() + 1).padStart(2, '0')}/${anno} risultati`,
      `"estrazione del lotto" ${giorno} ${mese} ruote numeri ufficiali`
    ];
    
    for (const query of queries) {
      console.log('[CRON] Query:', query.substring(0, 60) + '...');
      
      const results = await zai.functions.invoke('web_search', {
        query,
        num: 10
      });
      
      const estrazione = parseEstrazione(results, `${giorno} ${mese} ${anno}`);
      
      if (estrazione.ruote && Object.keys(estrazione.ruote).length >= 10) {
        console.log('[CRON] ✓ Estrazione completa');
        return estrazione;
      }
    }
    
    return { ruote: {} };
    
  } catch (error) {
    console.error('[CRON] Errore fetch estrazione:', error);
    return { ruote: {} };
  }
}

function parseEstrazione(results: unknown, data: string): any {
  const estrazione: any = { data, dataEstrazione: data, ruote: {} };
  
  if (!Array.isArray(results)) return estrazione;
  
  const allText = results.map((r: any) => r.snippet || '').join(' | ');
  
  for (const ruota of RUOTE) {
    const patterns = [
      // "Bari 86 45 22 56 80"
      new RegExp(`${ruota}[\\s:–-]+(\\d{1,2})[\\s]+(\\d{1,2})[\\s]+(\\d{1,2})[\\s]+(\\d{1,2})[\\s]+(\\d{1,2})`, 'gi'),
      // "Bari 86-45-22-56-80"
      new RegExp(`${ruota}[\\s:–-]+(\\d{1,2})[–-](\\d{1,2})[–-](\\d{1,2})[–-](\\d{1,2})[–-](\\d{1,2})`, 'gi'),
      // Con separatori generici
      new RegExp(`${ruota}[^\\d]*(\\d{1,2})[^\\d]+(\\d{1,2})[^\\d]+(\\d{1,2})[^\\d]+(\\d{1,2})[^\\d]+(\\d{1,2})`, 'gi'),
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
        
        if (numeri.every(n => n >= 1 && n <= 90)) {
          const unici = new Set(numeri);
          if (unici.size === 5) {
            estrazione.ruote[ruota] = numeri;
            console.log(`[CRON] ✓ ${ruota}:`, numeri.join(' '));
            break;
          }
        }
      }
      if (estrazione.ruote[ruota]) break;
    }
  }
  
  return estrazione;
}

// ========================================
// FETCH RITARDATARI
// ========================================

async function fetchRitardatariWeb(): Promise<any> {
  try {
    const zai = await ZAI.create();
    
    const results = await zai.functions.invoke('web_search', {
      query: 'lotto ritardatari oggi numeri manca estrazioni Napoli Venezia Torino Milano Bari',
      num: 10
    });
    
    return parseRitardatari(results);
    
  } catch (error) {
    console.error('[CRON] Errore fetch ritardatari:', error);
    return {};
  }
}

function parseRitardatari(results: unknown): any {
  const ritardatari: Record<string, Array<{numero: number, ritardo: number}>> = {};
  
  for (const ruota of RUOTE) {
    ritardatari[ruota] = [];
  }
  
  if (!Array.isArray(results)) return ritardatari;
  
  const allText = results.map((r: any) => r.snippet || '').join(' | ');
  
  for (const ruota of RUOTE) {
    const patterns = [
      new RegExp(`${ruota}[^\\d]*(?:il |numero )?(\\d{1,2})[^\\d]*(?:manca|ritarda)[^\\d]*(\\d+)[^\\d]*(?:estrazioni|concorsi)?`, 'gi'),
      new RegExp(`${ruota}[^\\d]*(\\d{1,2})[^\\d]*(\\d+)[^\\d]*rit`, 'gi')
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(allText)) !== null) {
        const numero = parseInt(match[1]);
        const ritardo = parseInt(match[2]);
        
        if (numero >= 1 && numero <= 90 && ritardo > 10) {
          if (!ritardatari[ruota].find(r => r.numero === numero)) {
            ritardatari[ruota].push({ numero, ritardo });
          }
        }
      }
    }
  }
  
  for (const ruota of RUOTE) {
    ritardatari[ruota].sort((a, b) => b.ritardo - a.ritardo);
    ritardatari[ruota] = ritardatari[ruota].slice(0, 5);
  }
  
  return ritardatari;
}
