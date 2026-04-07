import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // Usiamo lo stesso identico indirizzo che hai testato con successo
    const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    // Adattiamo il codice alla struttura che hai visto su RapidAPI (data.events)
    const events = data.events || data.seasonRatings || [];

    if (events.length === 0) {
      return NextResponse.json([{
        fixture: { id: 1 },
        league: { name: "SISTEMA OK" },
        teams: { 
          home: { name: "Nessun match ora", logo: "" }, 
          away: { name: "Controlla più tardi", logo: "" } 
        },
        ai_tip: "INFO",
        ai_reason: "La connessione è riuscita, ma l'API non ha eventi per questa data."
      }]);
    }

    const fixtures = events.map((e: any) => {
      // Usiamo 'event' se presente (come nel tuo JSON), altrimenti l'oggetto principale
      const item = e.event || e; 
      return {
        fixture: { id: item.id },
        league: { name: item.tournament?.name || "Football" },
        teams: {
          home: { name: item.homeTeam?.name || "Home" },
          away: { name: item.awayTeam?.name || "Away" }
        },
        ai_tip: "Analisi AI",
        ai_reason: "Dati estratti correttamente dal nuovo formato."
      };
    });

    return NextResponse.json(fixtures.slice(0, 20));
  } catch (error) {
    return NextResponse.json([]);
  }
}
