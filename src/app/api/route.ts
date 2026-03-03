import { NextRequest, NextResponse } from 'next/server';

const API_HOST = 'api-football-v1.p.rapidapi.com'; 

export async function POST(request: NextRequest) {
  try {
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];

    // 1. CONTROLLO VARIABILI AMBIENTE
    const apiKey = process.env.RAPIDAPI_KEY;
    const groqKey = process.env.GROQ_API_KEY;

    // SE MANCA LA CHIAVE CALCIO, TI FACCIO VEDERE L'ERRORE A SCHERMO
    if (!apiKey) {
      return NextResponse.json({
        success: true, // Trucho per farlo apparire a video
        suggestions: [{
          event: "⚠️ ERRORE CONFIGURAZIONE",
          league: "Vercel",
          prediction: "Manca RAPIDAPI_KEY",
          confidence: 100,
          odds: 0,
          reasoning: "Vai su Vercel > Settings > Environment Variables e aggiungi 'RAPIDAPI_KEY'. Poi fai Redeploy.",
          sport: "error"
        }]
      });
    }

    // 2. CHIAMATA API REALE
    const url = `https://${API_HOST}/v3/fixtures?date=${todayISO}`;
    
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': API_HOST
      }
    });

    // SE L'API DA ERRORE (ES. KEY SBAGLIATA), LO MOSTRO A VIDEO
    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: `🚨 ERRORE API (Codice ${res.status})`,
          league: "RapidAPI",
          prediction: "Chiave non valida",
          confidence: 100,
          reasoning: `L'API dice: "${errorText}". Significa che la tua chiave API è sbagliata o scaduta.`,
          sport: "error"
        }]
      });
    }

    const data = await res.json();
    const allFixtures = data.response || [];

    // SE NON CI SONO PARTITE, AVVERTO A VIDEO
    if (allFixtures.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: "ℹ️ NESSUNA PARTITA",
          league: todayISO,
          prediction: "Nessun match oggi",
          confidence: 0,
          reasoning: `L'API non ha trovato partite per la data ${todayISO}. I campionati maggiori sono finiti. Ci sono solo coppe o amichevoli.`,
          sport: "info"
        }]
      });
    }

    // 3. PROCESSO REALE
    const allMatches = allFixtures.map((fix: any) => ({
      id: fix.fixture.id,
      homeTeam: fix.teams.home.name,
      awayTeam: fix.teams.away.name,
      league: fix.league.name,
      time: fix.fixture.date
    }));

    const nowDate = new Date();
    const upcomingMatches = allMatches.filter(m => new Date(m.time) > nowDate);
    
    if (upcomingMatches.length === 0) {
         return NextResponse.json({
        success: true,
        suggestions: [{
          event: "ℹ️ ORARIO",
          league: "Partite finite",
          prediction: "Controlla orologino",
          confidence: 0,
          reasoning: `Ci sono ${allMatches.length} partite oggi, ma sono tutte GIA' INIZIATE o finite.`,
          sport: "info"
        }]
      });
    }

    const analyzedMatches = [];
    for (const match of upcomingMatches) {
      const analysis = await analyzeMatchWithAI(match, groqKey);
      if (analysis) analyzedMatches.push(analysis);
    }
    
    return NextResponse.json({
      success: true,
      suggestions: analyzedMatches,
      totalFound: upcomingMatches.length
    });

  } catch (e: any) {
    // ERRORE IMPREVISTO GENERICO
    return NextResponse.json({
      success: true,
      suggestions: [{
        event: "💥 ERRORE CRITICO",
        league: "Sistema",
        prediction: "Vedi dettagli",
        reasoning: e.message,
        sport: "error"
      }]
    });
  }
}

async function analyzeMatchWithAI(match: any, groqKey: string | undefined): Promise<any | null> {
  if (!groqKey) return getBasicAnalysis(match);
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${groqKey}`, 'Content-Type': 'application/json' },
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
