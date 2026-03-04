import { NextResponse } from 'next/server';

export async function GET() {
  // Prende la chiave che hai salvato su Vercel
  const chiave = process.env.RAPIDAPI_KEY; 

  // Questo è l'indirizzo per le partite di oggi
  const url = 'https://v3.football.api-sports.io/fixtures?date=2026-03-04';

  try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        // Questa è la "firma" richiesta dal nuovo fornitore
        'x-apisports-key': chiave || '', 
      },
      next: { revalidate: 0 }
    });

    const dati = await risposta.json();
    return NextResponse.json(dati);
    
  } catch (errore) {
    return NextResponse.json({ messaggio: "Errore di connessione" }, { status: 500 });
  }
}
