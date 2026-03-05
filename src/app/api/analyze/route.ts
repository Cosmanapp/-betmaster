import { NextResponse } from 'next/server';

export async function GET() {
  const footballKey = process.env.FOOTBALL_API_KEY;

  // Prendiamo la data di OGGI in formato YYYY-MM-DD
  const oggi = new Date().toISOString().split('T')[0];
  
  // Rimuoviamo il filtro per campionato (&league=39) per vedere TUTTO quello che c'è
  const url = `https://v3.football.api-sports.io/fixtures?date=${oggi}`;

  try {
    const res = await fetch(url, {
      headers: { 'x-apisports-key': footballKey || '' },
      next: { revalidate: 0 }
    });
    
    const data = await res.json();
    
    // Filtriamo solo i match che devono ancora iniziare (NS = Not Started)
    // e ne prendiamo solo 5 per non sovraccaricare l'AI
    const matchDaIniziare = data.response
      ?.filter((m: any) => m.fixture.status.short === 'NS')
      .slice(0, 5) || [];

    return NextResponse.json(matchDaIniziare);
  } catch (e) {
    return NextResponse.json([]);
  }
}
