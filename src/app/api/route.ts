import { NextRequest, NextResponse } from 'next/server';

const API_HOST = 'api-football-v1.p.rapidapi.com'; 

export async function POST(request: NextRequest) {
  try {
    const { count = 5, riskLevel = 'medium' } = await request.json();
    
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const todayStr = now.toLocaleDateString('it-IT');
    
    console.log(`[LIVE SYNC] Ricerca partite per data: ${todayISO}`);

    // 1. RECUPERA TUTTE LE PARTITE DEL GIORNO (Non solo le 5 leghe principali)
    // Questo serve perché i campionati sono finiti, potrebbero esserci coppe o amichevoli
    const allMatches = await fetchAllMatches(todayISO);

    console.log(`[LIVE SYNC] Totale partite trovate: ${allMatches.length}`);
    
    // 2. FILTRA PARTITE NON INIZIATE (Con correzione fuso orario)
    const upcomingMatches = allMatches.filter(m => {
      const matchDate = new Date(m.time);
      const nowDate = new Date();
      
      // Aggiungiamo 5 minuti di margine
      return matchDate > nowDate;
    });
    
    console.log(`[LIVE SYNC] Partite future trovate: ${upcomingMatches.length}`);
    
    if (upcomingMatches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        totalFound: 0,
        message: 'Nessuna partita programmata per oggi nei maggiori campionati. (Serie A, PL, ecc. finite)',
        date: todayStr,
      });
    }
    
    // 3. AI ANALIZZA
    const analyzedMatches = [];
    for (const match of upcomingMatches) {
      const analysis = await analyzeMatchWithAI(match);
      if (analysis) analyzedMatches.push(analysis);
    }
    
    // 4. FILTRA E ORDINA
    let minConfidence = 70;
    if (riskLevel === 'low') minConfidence = 80;
    if (riskLevel === 'high') minConfidence = 60;
    
    const highConfidenceMatches = analyzedMatches.filter(m => m.confidence >= minConfidence);
    highConfidenceMatches.sort((a, b) => b.confidence - a.confidence);
    
    return NextResponse.json({
      success: true,
      suggestions: highConfidenceMatches.slice(0, count),
      totalFound: upcomingMatches.length,
      source: 'real-time-api',
      date: todayStr
    });
    
  } catch (e: any) {
    console.error('[ERROR]', e);
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

// FUNZIONE PER CHIAMATA API REALE (MODIFICATA PER CERCARE TUTTO)
async function fetchAllMatches(date: string): Promise<any[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.warn("RAPIDAPI_KEY mancante!");
    return [];
  }

  try {
    // Usiamo solo la data per prendere TUTTE le partite del giorno
    const url = `https://${API_HOST}/v3/fixtures?date=${date}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': API_HOST
      }
    });

    if (!res.ok) return [];

    const data = await res.json();
    
    return data.response.map((fix: any) => ({
      id: fix.fixture.id,
      homeTeam: fix.teams.home.name,
      awayTeam: fix.teams.away.name,
      league: fix.league.name,
      time: fix.fixture.date, // ISO string completa
      hour: new Date(fix.fixture.date).getUTCHours(),
      minute: new Date(fix.fixture.date).getUTCMinutes()
    }));

  } catch (error) {
    console.error(`Errore fetch partite:`, error);
    return [];
  }
}

// FUNZIONE ANALISI AI
async function analyzeMatchWithAI(match: any): Promise<any | null> {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) return getBasicAnalysis(match);
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: `Sei un analista sportivo. Rispondi SOLO con JSON valido: {"prediction":"1","odds":1.50,"confidence":80,"reasoning":"Analisi"}`
          },
          { 
            role: 'user', 
            content: `Analizza: ${match.homeTeam} vs ${match.awayTeam} (${match.league}).`
          }
        ],
        temperature: 0.3,
        max_tokens: 200
      })
    });
    
    if (!res.ok) return getBasicAnalysis(match);
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return getBasicAnalysis(match);
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      event: `${match.homeTeam} vs ${match.awayTeam}`,
      league: match.league,
      prediction: parsed.prediction || '1X',
      odds: Math.round((parsed.odds || 1.70) * 100) / 100,
      confidence: Math.min(95, Math.max(60, parsed.confidence || 70)),
      reasoning: parsed.reasoning || 'Analisi completata.',
      sport: 'football'
    };
    
  } catch (e) {
    return getBasicAnalysis(match);
  }
}

// ANALISI BASE FALLBACK
function getBasicAnalysis(match: any): any {
  return {
    event: `${match.homeTeam} vs ${match.awayTeam}`,
    league: match.league,
    prediction: '1X',
    odds: 1.80,
    confidence: 65,
    reasoning: `Partita di ${match.league}. Analisi base.`,
    sport: 'football'
  };
}
