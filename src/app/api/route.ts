import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-all-list-by-date?date=20240520';

  if (!apiKey) {
    return NextResponse.json({ error: "Chiave API mancante su Vercel" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      }
    });
    
    if (!res.ok) throw new Error("Errore risposta API");
    
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Connessione API fallita" }, { status: 500 });
  }
}
