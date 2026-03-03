import { NextRequest, NextResponse } from 'next/server';

const API_HOST = 'api-football-v1.p.rapidapi.com'; 

export async function POST(request: NextRequest) {
  try {
    const { count = 5, riskLevel = 'medium' } = await request.json();
    
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    
    // --- INIZIO DIAGNOSTICA ---
    const apiKey = process.env.RAPIDAPI_KEY;

    // 1. Controlliamo se la chiave esiste
    if (!apiKey) {
      return NextResponse.json({
        success: false,
        error: 'ERRORE CRITICO: Manca la variabile d\'ambiente RAPIDAPI_KEY su Vercel. Controlla il nome scritto nelle Environment Variables.',
        suggestions: []
      });
    }

    // 2. Chiamata API con gestione errori dettagliata
    const url = `https://${API_HOST}/v3/fixtures?date=${todayISO}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': API_HOST
      }
    });

    // Se l'API risponde con un errore (es. 403 Forbidden = Key sbagliata)
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        success: false,
        error: `Errore risposta API: Status ${res.status}. Messaggio: ${errorText}. (Se è 403, la tua API Key è sbagliata o scaduta)`,
        suggestions: []
      });
    }

    const data = await res.json();
    const allFixtures = data.response || [];
    const errors = data.errors || {};

    // Se ci sono errori interni nei dati
    if (Object.keys(errors).length > 0) {
       return NextResponse.json({
        success: false,
        error: `Errore nei dati API: ${JSON.stringify(errors)}`,
        suggestions: []
      });
    }

    // 3. Controlliamo se ci sono partite
    if (allFixtures.length === 0) {
       return NextResponse.json({
        success: true,
        suggestions: [],
        message: `Nessuna partita trovata nel mondo per la data ${todayISO}. Nota: Serie A e Premier League sono finite. Attivi solo Europei/Coppe.`,
        debug_total: 0
      });
    }
    // --- FINE DIAGNOSTICA ---


    // Processiamo le partite trovate
    const allMatches = allFixtures.map((fix: any) => ({
      id: fix.fixture.id,
      homeTeam: fix.teams.home.name,
      awayTeam: fix.teams.away.name,
      league: fix.league.name,
      time: fix.fixture.date,
      hour: new Date(fix.fixture.date).getUTCHours(),
      minute: new Date(fix.fixture.date).getUTCMinutes()
    }));

    // Filtro orario
    const nowDate = new Date();
    const upcomingMatches = allMatches.filter(m => new Date(m.time) > nowDate);
    
    // AI Analysis (semplificata per velocizzare il test)
    const analyzedMatches = [];
    for (const match of upcomingMatches.slice(0, 5)) { // Limitiamo a 5 per test
      const analysis = await analyzeMatchWithAI(match);
      if (analysis) analyzedMatches.push(analysis);
    }
    
    let minConfidence = 70;
    if (riskLevel === 'low') minConfidence = 80;
    if (riskLevel === 'high') minConfidence = 60;
    
    const highConfidenceMatches = analyzedMatches.filter(m => m.confidence >= minConfidence);
    
    return NextResponse.json({
      success: true,
      suggestions: highConfidenceMatches,
      totalFound: upcomingMatches.length,
      debug_total_api_fixtures: allFixtures.length,
      date: todayISO
    });

  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, stack: e.stack }, { status: 500 });
  }
}

// Funzione AI (invariata)
async function analyzeMatchWithAI(match: any): Promise<any | null> {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) return getBasicAnalysis(match);
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: `Sei un analista. Rispondi SOLO JSON: {"prediction":"1","odds":1.50,"confidence":80,"reasoning":"Analisi"}` },
          { role: 'user', content: `Analizza: ${match.homeTeam} vs ${match.awayTeam} (${match.league}).` }
        ],
        temperature: 0.3, max_tokens: 200
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
      reasoning: parsed.reasoning || 'Ok',
      sport: 'football'
    };
  } catch (e) {
    return getBasicAnalysis(match);
  }
}

function getBasicAnalysis(match: any): any {
  return {
    event: `${match.homeTeam} vs ${match.awayTeam}`,
    league: match.league, prediction: '1X', odds: 1.80, confidence: 65,
    reasoning: `Analisi base ${match.league}`, sport: 'football'
  };
}
