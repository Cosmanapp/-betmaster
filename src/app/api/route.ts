import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  // Endpoint di ricerca (spesso usato come alternativa all'elenco per data)
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-search-matches?search=2026';

  if (!apiKey) {
    return NextResponse.json({ error: "Chiave mancante" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      }
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Errore" }, { status: 500 });
  }
}
