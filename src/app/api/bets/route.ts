import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search')?.toLowerCase();

  // Usiamo OGGI invece di domani per testare se arrivano dati
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      cache: 'no-store' 
    });

    const data = await response.json();
    let fixtures = data.response || [];

    if (searchTerm) {
      fixtures = fixtures.filter((f: any) => 
        f.teams.home.name.toLowerCase().includes(searchTerm) ||
        f.teams.away.name.toLowerCase().includes(searchTerm) ||
        f.league.name.toLowerCase().includes(searchTerm)
      );
    } else {
      // Se non trova le top league, non restituire un array vuoto, dai i primi 20 match
      const topLeagues = [135, 39, 140, 78, 61, 2, 3];
      let filtered = fixtures.filter((f: any) => topLeagues.includes(f.league.id));
      fixtures = filtered.length > 0 ? filtered : fixtures.slice(0, 20);
    }

    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json({ error: 'Errore API' }, { status: 500 });
  }
}
