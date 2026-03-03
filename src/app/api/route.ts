import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Controllo chiave API
  const apiKey = process.env.RAPIDAPI_KEY;

  if (!apiKey) {
    return NextResponse.json({
      success: false,
      suggestions: [{
        event: "ERRORE CONFIG",
        reasoning: "Manca la variabile RAPIDAPI_KEY su Vercel. Controlla il nome esatto.",
        prediction: "ERRORE", confidence: 0, odds: 0, sport: "error"
      }]
    });
  }

  // 2. Chiamata API Reale
  const today = new Date().toISOString().split('T')[0];
  const url = 'https://api-football-v1.p.rapidapi.com/v3/fixtures?date=' + today;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    // 3. Gestione errori API
    if (!response.ok) {
      const errorText = await response.text();
      // Messaggio diviso in più righe per evitare errori di sintassi
      const msg = "Errore API Codice " + response.status + ": " + errorText;
      
      return NextResponse.json({
        success: false,
        suggestions: [{
          event: "ERRORE API",
          reasoning: msg,
          prediction: "ERRORE", confidence: 0, odds: 0, sport: "error"
        }]
      });
    }

    const data = await response.json();
    const matches = data.response || [];

    // 4. Se non ci sono partite
    if (matches.length === 0) {
       return NextResponse.json({
        success: true,
        suggestions: [{
          event: "NESSUNA PARTITA",
          reasoning: "Nessuna partita trovata per oggi (" + today + ").",
          prediction: "INFO", confidence: 0, odds: 0, sport: "info"
        }]
      });
    }

    // 5. Successo: mostriamo le partite trovate
    const results = [];
    for (const m of matches.slice(0, 5)) {
      results.push({
        event: m.teams.home.name + " vs " + m.teams.away.name,
        league: m.league.name,
        prediction: "OK",
        confidence: 50,
        odds: 0,
        reasoning: "Partita reale trovata dall'API!",
        sport: "football"
      });
    }

    return NextResponse.json({ success: true, suggestions: results });

  } catch (e: any) {
    return NextResponse.json({
      success: false,
      suggestions: [{
        event: "ERRORE GENERICO",
        reasoning: e.message,
        prediction: "ERRORE", confidence: 0, odds: 0, sport: "error"
      }]
    });
  }
}
