import { NextResponse } from 'next/server';

export async function GET() {
  const chiave = process.env.RAPIDAPI_KEY; 
  
  // Usiamo l'indirizzo standard senza filtri complessi per testare
  const url = 'https://v3.football.api-sports.io/fixtures?live=all';

  try {
    const risposta = await fetch(url, {
      method: 'GET',
      headers: {
        // Assicuriamoci che non ci siano spazi nella chiave
        'x-apisports-key': chiave ? chiave.trim() : '', 
      },
      next: { revalidate: 0 }
    });

    const dati = await risposta.json();
    return NextResponse.json(dati);
    
  } catch (errore) {
    return NextResponse.json({ messaggio: "Errore di connessione" }, { status: 500 });
  }
}
