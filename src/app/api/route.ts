import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.RAPIDAPI_KEY;
  // Endpoint corretto per la Smart API (pallone verde)
  // Abbiamo tolto i trattini che davano errore e usato il formato corretto
  const url = 'https://free-api-live-football-data.p.rapidapi.com/football-get-all-list-by-date?date=20260303';

  if (!apiKey) {
    return NextResponse.json({ error: "Chiave API mancante" }, { status: 500 });
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

    // Se l'API ci dice ancora che l'endpoint non esiste, proviamo a mandare 
    // un messaggio di debug più chiaro
    if (data.message && data.message.includes("does not exist")) {
        return NextResponse.json({ 
            error: "L'endpoint è cambiato", 
            suggerimento: "Controlla su RapidAPI il nome esatto dell'endpoint 'get-all-list'",
            debug: data
        });
    }

    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ error: "Errore di rete" }, { status: 500 });
  }
}
