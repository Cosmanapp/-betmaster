import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic'; // Forza il server a non usare la cache

export async function GET() {
  try {
    const apiKey = process.env.FOOTBALL_API_KEY;
    const today = new Date().toISOString().split('T')[0];

    // TEST VELOCE: Se la chiave manca, lo capiamo subito dai log
    if (!apiKey) {
      console.error("ERRORE: Chiave API mancante nelle variabili di Vercel");
    }

    const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': apiKey || '',
      },
      cache: 'no-store' // Impedisce al server di ricordare dati vecchi
    });

    const data = await response.json();
    const rawMatches = data.events || [];

    if (rawMatches.length === 0) {
      // Se l'API è vuota, restituiamo un match finto per sbloccare la grafica
      return NextResponse.json([{
        fixture: { id: 1 },
        league: { name: "SISTEMA ONLINE" },
        teams: { 
          home: { name: "Nessun match live", logo: "" }, 
          away: { name: "Riprova tra poco", logo: "" } 
        },
        ai_tip: "INFO",
        ai_reason: "Il server risponde, ma l'API non ha inviato partite per oggi."
      }]);
    }

    const fixtures = rawMatches.slice(0, 15).map((e: any) => ({
      fixture: { id: e.id },
      league: { name: e.tournament?.name || "Football" },
      teams: {
        home: { name: e.homeTeam?.name, logo: "" },
        away: { name: e.awayTeam?.name, logo: "" }
      }
    }));

    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json([{ fixture: { id: 0 }, league: { name: "ERRORE" }, teams: { home: { name: "Errore API", logo: "" }, away: { name: "Riprova", logo: "" } } }]);
  }
}
