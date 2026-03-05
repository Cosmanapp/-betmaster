import { NextResponse } from 'next/server';

export async function GET() {
  const footballKey = process.env.FOOTBALL_API_KEY;

  // Forziamo la data di domani: 2026-03-06
  const dataTarget = "2026-03-06";
  
  // Cerchiamo tutti i match di domani (senza filtri di lega per ora)
  const url = `https://v3.football.api-sports.io/fixtures?date=${dataTarget}`;

  try {
    const res = await fetch(url, {
      headers: { 'x-apisports-key': footballKey || '' },
      next: { revalidate: 0 }
    });
    
    const data = await res.json();
    
    // Prendiamo solo i match che non sono ancora iniziati (NS)
    // Ne prendiamo 8 per avere una bella lista
    const matches = data.response
      ?.filter((m: any) => m.fixture.status.short === 'NS')
      .slice(0, 8) || [];

    return NextResponse.json(matches);
  } catch (e) {
    return NextResponse.json([]);
  }
}
