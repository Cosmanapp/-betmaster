import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-all-list-by-date?date=20260303';

  if (!apiKey) {
    return NextResponse.json({ error: "ERRORE: Chiave RAPIDAPI_KEY non trovata su Vercel" }, { status: 500 });
  }

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'free-api-live-football-data.p.rapidapi.com'
      },
      next: { revalidate: 0 } // Forza l'aggiornamento senza memoria vecchia
    });

    if (res.status === 401 || res.status === 403) {
      return NextResponse.json({ error: "ERRORE: Chiave API non valida o scaduta" }, { status: res.status });
    }

    if (!res.ok) {
      const errorText = await res.text();
      return NextResponse.json({ error: "L'API ha risposto con errore", details: errorText }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Il server di Vercel non riesce a contattare RapidAPI" }, { status: 500 });
  }
}
