import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search')?.toLowerCase();

  // Calcoliamo la data di DOMANI
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrow = tomorrowDate.toISOString().split('T')[0];

  try {
    // Chiamata per i match di domani (prospettiva futura)
    const response = await fetch(`https://v3.football.api-sports.io/fixtures?date=${tomorrow}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'v3.football.api-sports.io',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      next: { revalidate: 0 } 
    });

    const data = await response.json();
    let fixtures = data.response || [];

    if (searchTerm) {
      // Se cerchi "Serie A", cerchiamo in tutto il palinsesto di domani
      fixtures = fixtures.filter((f: any) => 
        f.teams.home.name.toLowerCase().includes(searchTerm) ||
        f.teams.away.name.toLowerCase().includes(searchTerm) ||
        f.league.name.toLowerCase().includes(searchTerm)
      );
    } else {
      // Se non cerchi nulla, filtriamo per i campionati top di domani
      const topLeagues = [135, 39, 140, 78, 61, 2, 3]; 
      fixtures = fixtures.filter((f: any) => topLeagues.includes(f.league.id));
      
      // Se non ci sono top league domani, prendiamo i primi 15 match generici di domani
      if (fixtures.length === 0) {
        fixtures = data.response?.slice(0, 15) || [];
      }
    }

    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json({ error: 'Errore API' }, { status: 500 });
  }
}
