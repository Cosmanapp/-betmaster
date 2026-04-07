import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const apiKey = process.env.FOOTBALL_API_KEY || '';
    const today = new Date().toISOString().split('T')[0];

    // Proviamo a chiamare l'API che hai attivato (SportAPI 7)
    const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      cache: 'no-store'
    });

    const result = await response.json();
    
    // TRUCCO: Cerchiamo i match ovunque siano nascosti (events o response)
    const rawMatches = result.events || result.response || [];

    if (rawMatches.length > 0) {
      const fixtures = rawMatches.map((m: any) => ({
        fixture: { id: m.id || Math.random() },
        league: { name: m.tournament?.name || m.league?.name || "Calcio" },
        teams: {
          home: { 
            name: m.homeTeam?.name || m.teams?.home?.name || "Squadra Casa", 
            logo: m.homeTeam?.id ? `https://api.sofascore.app/api/v1/team/${m.homeTeam.id}/image` : "" 
          },
          away: { 
            name: m.awayTeam?.name || m.teams?.away?.name || "Squadra Ospite", 
            logo: m.awayTeam?.id ? `https://api.sofascore.app/api/v1/team/${m.awayTeam.id}/image` : "" 
          }
        },
        ai_tip: "Analisi...",
        ai_reason: "Dati ricevuti con successo dall'API."
      }));
      return NextResponse.json(fixtures.slice(0, 15));
    }

    // --- SE L'API È VUOTA O ERRORE, FORZIAMO MATCH DI TEST ---
    return NextResponse.json([
      {
        fixture: { id: 101 },
        league: { name: "TEST DI SISTEMA" },
        teams: { 
          home: { name: "APP FUNZIONANTE", logo: "" }, 
          away: { name: "API VUOTA", logo: "" } 
        },
        ai_tip: "INFO",
        ai_reason: "Se vedi questo box, l'app è OK. Il problema è che l'API non sta inviando partite reali."
      }
    ]);

  } catch (error) {
    return NextResponse.json([{ 
      fixture: { id: 500 }, 
      league: { name: "ERRORE CODICE" }, 
      teams: { home: { name: "Errore", logo: "" }, away: { name: "Tecnico", logo: "" } },
      ai_tip: "CHECK", 
      ai_reason: "C'è un problema nel recupero dati." 
    }]);
  }
}
