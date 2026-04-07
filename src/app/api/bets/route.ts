import { NextResponse } from 'next/server';

// Questa riga dice a Vercel: "NON USARE LA CACHE, RIGENERA SEMPRE"
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const apiKey = process.env.FOOTBALL_API_KEY || '';

    // URL di API-Football (Assicurati di aver fatto 'Subscribe' su RapidAPI a questa)
    const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      next: { revalidate: 0 } // Forza il recupero dati
    });

    const data = await response.json();
    
    // Se l'API non risponde o è vuota, mandiamo i match di TEST
    if (!data.response || data.response.length === 0) {
      return NextResponse.json([
        {
          league: { name: "SISTEMA OPERATIVO" },
          teams: { home: { name: "Connessione OK" }, away: { name: "In attesa dati" } },
          ai_tip: "INFO",
          ai_reason: "Il sito comunica col server, ma l'API non ha inviato partite per oggi."
        }
      ]);
    }

    // Se ci sono match, li puliamo per la grafica
    const matches = data.response.slice(0, 15).map((m: any) => ({
      league: { name: m.league.name },
      teams: { home: { name: m.teams.home.name }, away: { name: m.teams.away.name } },
      ai_tip: "Analisi Live",
      ai_reason: "Match rilevato correttamente."
    }));

    return NextResponse.json(matches);
  } catch (error) {
    return NextResponse.json([{ 
      league: { name: "ERRORE" }, 
      teams: { home: { name: "Errore Tecnico" }, away: { name: "Riprova" } },
      ai_tip: "!", 
      ai_reason: "C'è un problema nel caricamento." 
    }]);
  }
}
