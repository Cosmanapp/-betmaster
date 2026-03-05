import { NextResponse } from 'next/server';

export async function GET() {
  const chiave = process.env.FOOTBALL_API_KEY; 
  
  // Usiamo un filtro che il piano FREE accetta sicuramente: le partite di una data specifica
  // (Ho messo la data di oggi 5 Marzo 2026)
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
    return NextResponse.json(dati);
    
  } catch (errore) {
    return NextResponse.json({ messaggio: "Errore di connessione" }, { status: 500 });
  }
}
