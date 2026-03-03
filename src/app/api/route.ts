import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  // URL aggiornato: Usiamo 'football-all-list' che è l'endpoint base per i match
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-all-list';

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
