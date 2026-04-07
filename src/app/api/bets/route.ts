import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search')?.toLowerCase();
  
  // Prendiamo la data di oggi
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      next: { revalidate: 0 }
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
      // Se non cerchi nulla, mostriamo i primi 15 match di oggi
      fixtures = fixtures.slice(0, 15);
    }

    return NextResponse.json(fixtures);
  } catch (error) {
    console.error("Errore RapidAPI:", error);
    return NextResponse.json([], { status: 200 });
  }
}
