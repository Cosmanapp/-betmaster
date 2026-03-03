import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Prende la data REALE dal server (il tuo "oggi")
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  
  const apiKey = process.env.RAPIDAPI_KEY;

  // 2. Se manca la chiave, lo dice chiaramente
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      suggestions: [{
        event: "⚠️ MANCA LA CHIAVE",
        league: "Vercel",
        prediction: "ERRORE",
        confidence: 100,
        reasoning: "Vai su Vercel > Settings > Environment Variables e aggiungi RAPIDAPI_KEY.",
        sport: "error"
      }]
    });
  }

  // 3. Chiamata all'API reale per la data di oggi
  try {
    const res = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${todayISO}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: `❌ API ERRORE ${res.status}`,
          league: "RapidAPI",
          prediction: "CONTROLLA KEY",
          confidence: 100,
          reasoning: `La chiave è rifiutata o scaduta. Risposta API: ${await res.text()}`,
          sport: "error"
        }]
      });
    }

    const data = await res.json();
    const matches = data.response || [];

    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: "ℹ️ NESSUNA PARTITA",
          league: todayISO,
          prediction: "VUOTO",
          confidence: 100,
          reasoning: `L'API risponde, ma non ci sono partite per la data: ${todayISO}.`,
          sport: "info"
        }]
      });
    }

    // 4. Se ci sono partite, le mostra
    const suggestions = matches.map((m: any) => ({
      event: `${m.teams.home.name} vs ${m.teams.away.name}`,
      league: m.league.name,
      prediction: "CARICATO",
      confidence: 50,
      odds: 0,
      reasoning: "Partita reale caricata con successo dall'API.",
      sport: "football"
    }));

    return NextResponse.json({ success: true, suggestions });

  } catch (e: any) {
    return NextResponse.json({
      success: true,
      suggestions: [{
        event: "💥 ERRORE CRITICO",
        league: "Sistema",
        prediction: "CATCH",
        confidence: 100,
        reasoning: e.message,
        sport: "error"
      }]
    });
  }
}
