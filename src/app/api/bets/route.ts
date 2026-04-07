import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    const events = data.events || [];

    // TRASFORMAZIONE DATI PER LA GRAFICA
    const fixtures = events.slice(0, 20).map((e: any) => ({
      fixture: { id: e.id },
      league: { name: e.tournament?.name || "Football" },
      teams: {
        home: { name: e.homeTeam?.name || "Home", logo: "" },
        away: { name: e.awayTeam?.name || "Away", logo: "" }
      },
      ai_tip: "Analisi...",
      ai_reason: "Match in fase di elaborazione dati."
    }));

    // Se non ci sono match reali, mandiamo un match di TEST per sbloccare lo schermo
    if (fixtures.length === 0) {
      return NextResponse.json([{
        fixture: { id: 1 },
        league: { name: "SISTEMA ATTIVO" },
        teams: { home: { name: "Nessun match oggi", logo: "" }, away: { name: "Riprova domani", logo: "" } },
        ai_tip: "INFO",
        ai_reason: "L'app è collegata correttamente, ma l'API non ha eventi in programma per oggi."
      }]);
    }

    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json([]);
  }
}
