import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const apiKey = process.env.RAPIDAPI_KEY;

  // Funzione helper per mostrare errori a schermo
  const showError = (title, msg) => {
    return NextResponse.json({
      success: true,
      suggestions: [{
        event: title,
        league: "Sistema",
        prediction: "Errore",
        confidence: 99,
        odds: 1.01,
        reasoning: msg,
        sport: "football"
      }]
    });
  };

  // 1. Controllo chiave
  if (!apiKey) {
    return showError("CHIAVE MANCANTE", "Vai su Vercel Settings e aggiungi RAPIDAPI_KEY.");
  }

  // 2. Chiamata API
  const url = "https://api-football-v1.p.rapidapi.com/v3/fixtures?date=" + todayISO;
  
  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    // 3. Se l'API risponde male
    if (!res.ok) {
      const errText = await res.text();
      return showError("API ERRORE " + res.status, "Risposta: " + errText);
    }

    const data = await res.json();
    const matches = data.response || [];

    // 4. Se non ci sono partite
    if (matches.length === 0) {
      return showError("NESSUNA PARTITA", "Nessuna partita trovata per oggi: " + todayISO);
    }

    // 5. Successo
    const results = matches.map((m) => ({
      event: m.teams.home.name + " vs " + m.teams.away.name,
      league: m.league.name,
      prediction: "OK",
      confidence: 75,
      odds: 1.80,
      reasoning: "Partita trovata con successo.",
      sport: "football"
    }));

    return NextResponse.json({ success: true, suggestions: results });

  } catch (e) {
    return showError("ECCEZIONE", e.message);
  }
}
