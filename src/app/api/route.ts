import { NextRequest, NextResponse } from 'next/server';

// CONFIGURAZIONE API ESTERNA
const API_HOST = 'api-football-v1.p.rapidapi.com'; 

export async function POST(request: NextRequest) {
  try {
    const { count = 5, riskLevel = 'medium' } = await request.json();
    
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const todayStr = now.toLocaleDateString('it-IT');
    
    const italyHour = (now.getUTCHours() + 1) % 24;
    const italyMin = now.getUTCMinutes();
    const nowMinutes = italyHour * 60 + italyMin;
    
    console.log(`[LIVE SYNC] Data: ${todayISO}, Ora Italia: ${italyHour}:${italyMin}`);

    // 1. RECUPERA PARTITE REALI DALL'API
    // Leghe: Serie A (135), Premier League (39), La Liga (140), Bundesliga (78), Ligue 1 (61)
    const leaguesToCheck = [135, 39, 140, 78, 61];
    let allMatches: any[] = [];

    const apiPromises = leaguesToCheck.map(leagueId => fetchLiveMatches(leagueId, todayISO));
    const results = await Promise.all(apiPromises);
    
    results.forEach(matches => {
      if (matches && matches.length > 0) {
        allMatches = [...allMatches, ...matches];
      }
    });

    console.log(`[LIVE SYNC] Totale partite reali trovate: ${allMatches.length}`);
    
    // 2. FILTRA PARTITE NON INIZIATE
    const upcomingMatches = allMatches.filter(m => {
      const matchHour = m.hour;
      const matchMin = m.minute;
      const matchMinutes = matchHour * 60 + matchMin;
      return matchMinutes > nowMinutes + 5;
    });
    
    if (upcomingMatches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        totalFound: 0,
        message: 'Nessuna partita disponibile al momento. Controlla gli orari!',
        date: todayStr,
        serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
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

// FUNZIONE PER CHIAMATA API REALE
async function fetchLiveMatches(leagueId: number, date: string): Promise<any[]> {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  if (!apiKey) {
    console.warn("RAPIDAPI_KEY mancante!");
    return [];
  }

  try {
    const url = `https://${API_HOST}/v3/fixtures?date=${date}&league=${leagueId}&season=2024`;
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
      time: fix.fixture.date,
      hour: new Date(fix.fixture.date).getUTCHours(),
      minute: new Date(fix.fixture.date).getUTCMinutes()
    }));

  } catch (error) {
    console.error(`Errore fetch lega ${leagueId}:`, error);
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
            content: `Sei un analista sportivo esperto. Fornisci pronostici affidabili basati su statistiche reali.
Rispondi SOLO con JSON valido: {"prediction":"1","odds":1.50,"confidence":80,"reasoning":"Analisi"}`
          },
          { 
            role: 'user', 
            content: `Analizza: ${match.homeTeam} vs ${match.awayTeam} (${match.league}).
Fornisci pronostico (1, X, 2, 1X, X2, GG), quota, confidence (60-95) e ragionamento.`
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
  const strongTeams = [
    'napoli', 'inter', 'juventus', 'milan', 'atalanta', 'lazio', 'roma',
    'manchester city', 'arsenal', 'liverpool', 'chelsea', 'tottenham',
    'real madrid', 'barcelona', 'atletico madrid',
    'bayern', 'dortmund', 'leipzig', 'leverkusen',
    'psg', 'monaco'
  ];
  
  const homeStrong = strongTeams.some(t => match.homeTeam.toLowerCase().includes(t));
  const awayStrong = strongTeams.some(t => match.awayTeam.toLowerCase().includes(t));
  
  let prediction = '1X', odds = 1.80, confidence = 65;
  
  if (homeStrong && !awayStrong) { prediction = '1'; odds = 1.50; confidence = 75; }
  else if (awayStrong && !homeStrong) { prediction = 'X2'; odds = 1.60; confidence = 70; }
  else if (homeStrong && awayStrong) { prediction = 'GG'; odds = 1.70; confidence = 68; }
  
  return {
    event: `${match.homeTeam} vs ${match.awayTeam}`,
    league: match.league, prediction, odds, confidence,
    reasoning: `Analisi basata su forza storica.`,
    sport: 'football'
  };
}
