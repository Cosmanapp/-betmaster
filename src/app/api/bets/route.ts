import { NextResponse } from 'next/server';

export async function GET() {
  // Prende la chiave dalle variabili d'ambiente di Vercel
  const chiave = process.env.RAPIDAPI_KEY; 
  
  // Indirizzo per vedere tutte le partite in diretta (test più veloce)
  const url = 'https://v3.football.api-sports.io/fixtures?live=all';

  try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        // La "firma" corretta per API-Sports
        'x-apisports-key': chiave ? chiave.trim() : '', 
      },
      next: { revalidate: 0 } // Forza l'aggiornamento dei dati
    });

    const dati = await risposta.json();
    return NextResponse.json(dati);
    
  } catch (errore) {
    return NextResponse.json({ messaggio: "Errore di connessione al server" }, { status: 500 });
  }
}
