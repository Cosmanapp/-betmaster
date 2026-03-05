import { NextResponse } from 'next/server';

export async function GET() {
  // Utilizziamo il nome corretto della variabile che abbiamo impostato su Vercel
  const chiave = process.env.FOOTBALL_API_KEY; 
  
  // URL di test: Premier League (League 39) stagione 2024
  const url = 'https://v3.football.api-sports.io/fixtures?league=39&season=2024&last=10';

  try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': chiave ? chiave.trim() : '', 
      },
      next: { revalidate: 0 } // Forza l'aggiornamento senza usare la memoria cache
    });

    const dati = await risposta.json();
    return NextResponse.json(dati);
    
  } catch (errore) {
    return NextResponse.json({ messaggio: "Errore di connessione al server API" }, { status: 500 });
  }
}
