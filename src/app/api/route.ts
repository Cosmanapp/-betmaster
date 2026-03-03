import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  
  // Proviamo l'endpoint senza prefissi, come indicato nelle versioni più recenti
  const url = 'https://free-api-live-football-data.p.rapidapi.com/all-list';

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
