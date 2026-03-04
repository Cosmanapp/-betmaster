import { NextResponse } from 'next/server';

export async function GET() {
  // Se hai cambiato nome alla variabile su Vercel, usa quello qui sotto
  const apiKey = process.env.RAPIDAPI_KEY; 
  
  // Endpoint ufficiale di API-FOOTBALL per i match di oggi
  const url = 'https://v3.football.api-sports.io/fixtures?date=2026-03-04';

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'x-apisports-key': apiKey || '', // Nota: qui si usa x-apisports-key
      },
      next: { revalidate: 0 }
    });

    const data = await res.json();

    // Se l'API risponde con errori di licenza o altro, lo vedremo qui
    return NextResponse.json(data);
    
  } catch (e) {
    return NextResponse.json({ error: "Errore di connessione al nuovo provider" }, { status: 500 });
  }
}
