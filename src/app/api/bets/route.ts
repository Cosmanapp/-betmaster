import { NextResponse } from 'next/server';

export async function GET() {
  const chiave = process.env.FOOTBALL_API_KEY; 
  const url = 'https://v3.football.api-sports.io/fixtures?live=all';

  try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': chiave ? chiave.trim() : '', 
      },
      next: { revalidate: 0 }
    });

    const dati = await risposta.json();
    
    return NextResponse.json(dati, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, x-apisports-key',
      },
    });

  } catch (errore) {
    return NextResponse.json({ messaggio: "Errore di connessione" }, { status: 500 });
  }
}
