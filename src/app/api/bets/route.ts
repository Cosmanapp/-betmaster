import { NextResponse } from 'next/server';

export async function GET() {
  const footballKey = process.env.FOOTBALL_API_KEY;
  // Domani 6 Marzo 2026
  const targetDate = "2026-03-06";
  
  // ID delle Top Leghe: 135 (Serie A), 39 (Premier), 140 (La Liga), 78 (Bundes), 61 (Ligue 1)
  const leagues = [135, 39, 140, 78, 61];
  
  try {
    // Cerchiamo i match di domani
    const res = await fetch(`https://v3.football.api-sports.io/fixtures?date=${targetDate}`, {
      headers: { 'x-apisports-key': footballKey || '' },
      next: { revalidate: 0 }
    });
    const data = await res.json();

    // Filtriamo SOLO per le grandi leghe europee
    const topMatches = data.response?.filter((m: any) => 
      leagues.includes(m.league.id) && m.fixture.status.short === 'NS'
    ) || [];

    // Se non ci sono match nelle top league (strano per un venerdì), prendiamo i primi 5 generici
    const finalSelection = topMatches.length > 0 ? topMatches : data.response?.slice(0, 5);

    return NextResponse.json(finalSelection.slice(0, 5));
  } catch (e) {
    return NextResponse.json([]);
  }
}
