import { NextResponse } from 'next/server';

export async function GET() {
  const chiave = process.env.FOOTBALL_API_KEY; 
  // Usiamo questo URL che è il più completo per i test
  const url = 'https://v3.football.api-sports.io/fixtures?date=2026-03-05';

  try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': chiave ? chiave.trim() : '', 
      },
      next: { revalidate: 0 }
    });

    const dati = await risposta.json();
    
    // IMPORTANTE: Inviamo SOLO l'array dei match (dati.response)
    // Questo è quello che le grafiche preconfezionate di solito leggono
    return NextResponse.json(dati.response || [], {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
      },
    });

  } catch (errore) {
    return NextResponse.json([], { status: 500 });
  }
}
