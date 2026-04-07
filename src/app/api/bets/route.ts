import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const apiKey = process.env.FOOTBALL_API_KEY || '';

    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      next: { revalidate: 0 }
    });

    const data = await response.json();
    const fixtures = data.response || [];

    if (fixtures.length === 0) {
      // DATI DI EMERGENZA (Così vedi se il sito funziona)
      return NextResponse.json([{
        league: { name: "MODALITÀ DIAGNOSTICA" },
        teams: { home: { name: "Server Connesso" }, away: { name: "API in attesa" } },
        ai_tip: "INFO",
        ai_reason: "Il sito è configurato bene, ma l'API Football non ha restituito partite reali."
      }]);
    }

    const formatted = fixtures.slice(0, 15).map((m: any) => ({
      league: { name: m.league.name },
      teams: { home: { name: m.teams.home.name }, away: { name: m.teams.away.name } },
      ai_tip: "ANALISI DISPONIBILE",
      ai_reason: "Dati caricati correttamente dall'API."
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json([{ league: { name: "ERRORE" }, teams: { home: { name: "Errore API" }, away: { name: "Controlla Logs" } }, ai_tip: "!", ai_reason: "Fallimento chiamata." }]);
  }
}
