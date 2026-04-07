import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchTerm = searchParams.get('search')?.toLowerCase();
  
  // Usiamo una data fissa di oggi per il test (2026-04-07)
  const today = new Date().toISOString().split('T')[0];

  try {
    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': process.env.FOOTBALL_API_KEY || '',
      },
      cache: 'no-store'
    });

    const data = await response.json();
    
    // Debug: se l'API risponde con un errore di autenticazione
    if (data.errors && Object.keys(data.errors).length > 0) {
      console.error("Errore API:", data.errors);
      return NextResponse.json([]);
    }

    let fixtures = data.response || [];

    if (searchTerm) {
      fixtures = fixtures.filter((f: any) => 
        f.teams.home.name.toLowerCase().includes(searchTerm) ||
        f.teams.away.name.toLowerCase().includes(searchTerm) ||
        f.league.name.toLowerCase().includes(searchTerm)
      );
    } else {
      // Se non cerchi nulla, prendiamo i primi 10 match di oggi
      fixtures = fixtures.slice(0, 10);
    }

    return NextResponse.json(fixtures);
  } catch (error) {
    return NextResponse.json([]);
  }
}
