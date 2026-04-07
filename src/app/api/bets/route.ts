import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${new Date().toISOString().split('T')[0]}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      cache: 'no-store'
    });

    const rawData = await response.json();
    
    // Se l'API risponde ma l'array è vuoto, creiamo noi i dati
    // così capiamo se il problema è l'API o il collegamento
    const results = (rawData.events || []).map((e: any) => ({
      fixture: { id: e.id || Math.random() },
      league: { name: e.tournament?.name || "Calcio" },
      teams: {
        home: { name: e.homeTeam?.name || "Squadra Casa" },
        away: { name: e.awayTeam?.name || "Squadra Ospite" }
      },
      ai_tip: "INFO",
      ai_reason: "Dati caricati dall'API."
    }));

    if (results.length === 0) {
      return NextResponse.json([{
        fixture: { id: 999 },
        league: { name: "DIAGNOSTICA" },
        teams: { home: { name: "API COLLEGATA", logo: "" }, away: { name: "MA SENZA MATCH", logo: "" } },
        ai_tip: "ERRORE DATI",
        ai_reason: "L'API risponde correttamente (chiave OK) ma non ha partite di calcio per oggi."
      }]);
    }

    return NextResponse.json(results);
  } catch (error) {
    return NextResponse.json([{ 
      fixture: { id: 0 }, 
      league: { name: "ERRORE CONNESSIONE" }, 
      teams: { home: { name: "Controlla Chiave", logo: "" }, away: { name: "Su Vercel", logo: "" } },
      ai_tip: "OFFLINE",
      ai_reason: "Il server non riesce a parlare con RapidAPI."
    }]);
  }
}
