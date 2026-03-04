import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  // Usiamo l'indirizzo base che abbiamo visto nel tuo screenshot
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-all-list-by-date?date=20260303';

  try {
    const res = await fetch(url, {
      headers: {
        'x-rapidapi-key': apiKey || '',
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      },
      cache: 'no-store'
    });

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Errore critico di connessione" }, { status: 500 });
  }
}
