import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  // URL costruito seguendo la struttura 'football-get-all-list-by-date'
  // che è lo standard per questa API per recuperare i match del giorno
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-all-list-by-date?date=20260303';

  if (!apiKey) {
    return NextResponse.json({ error: "Chiave mancante su Vercel" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      },
      next: { revalidate: 0 }
    });

    const data = await res.json();
    return NextResponse.json(data);
    
  } catch (e) {
    return NextResponse.json({ error: "Errore di connessione" }, { status: 500 });
  }
}
