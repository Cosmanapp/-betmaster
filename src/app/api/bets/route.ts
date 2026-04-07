import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search')?.toLowerCase();
  
  // SportAPI usa un formato leggermente diverso
  try {
    const response = await fetch(`https://sportapi7.p.rapidapi.com/api/v1/sport/football/scheduled-events/${new Date().toISOString().split('T')[0]}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'sportapi7.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    // Mappiamo i dati di SportAPI nel formato della nostra App
    let events = data.events || [];

    let fixtures = events.map((e: any) => ({
      fixture: { id: e.id },
      league: { name: e.tournament?.name || "Campionato" },
      teams: {
        home: { name: e.homeTeam?.name, logo: `https://api.sofascore.app/api/v1/team/${e.homeTeam?.id}/image` },
        away: { name: e.awayTeam?.name, logo: `https://api.sofascore.app/api/v1/team/${e.awayTeam?.id}/image` }
      }
    }));

    if (searchTerm) {
      fixtures = fixtures.filter((f: any) => 
        f.teams.home.name.toLowerCase().includes(searchTerm) ||
        f.teams.away.name.toLowerCase().includes(searchTerm)
      );
    }

    return NextResponse.json(fixtures.slice(0, 20));
  } catch (error) {
    console.error("Errore SportAPI:", error);
    return NextResponse.json([]);
  }
}
