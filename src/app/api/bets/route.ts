import { NextResponse } from 'next/server';

export async function GET() {
  const footballKey = process.env.FOOTBALL_API_KEY;
  const oggi = new Date().toISOString().split('T')[0];
  
  // Cerchiamo i match di oggi in tutto il mondo
  const url = `https://v3.football.api-sports.io/fixtures?date=${oggi}`;

  try {
    const res = await fetch(url, {
      headers: { 'x-apisports-key': footballKey || '' },
      next: { revalidate: 0 }
    });
    const data = await res.json();
    
    // FILTRO INTELLIGENTE: 
    // Prendiamo match di leghe importanti (Serie A, Premier, Liga, Bundesliga, Champions, Libertadores, etc.)
    // o semplicemente match con squadre conosciute per evitare campionati minori poco quotati.
    const topLeagues = [39, 140, 135, 78, 61, 2, 3, 13, 848]; // ID delle leghe principali
    
    let priorityMatches = data.response?.filter((m: any) => 
      topLeagues.includes(m.league.id) && m.fixture.status.short === 'NS'
    ) || [];

    // Se non ci sono abbastanza match nelle top leagues, prendiamo i primi disponibili
    if (priorityMatches.length < 5) {
      priorityMatches = data.response?.filter((m: any) => m.fixture.status.short === 'NS').slice(0, 10) || [];
    }

    // Ne passiamo 10 all'AI, lei sceglierà i 5 migliori
    return NextResponse.json(priorityMatches.slice(0, 10));
  } catch (e) {
    return NextResponse.json([]);
  }
}
