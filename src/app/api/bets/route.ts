import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const today = new Date().toISOString().split('T')[0];
    const apiKey = process.env.FOOTBALL_API_KEY || '';

    // Cerchiamo di chiamare l'API-Football (quella più affidabile)
    const response = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`, {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com',
        'x-rapidapi-key': apiKey,
      },
      cache: 'no-store'
    });

    const data = await response.json();
    const fixtures = data.response || [];

    // SE L'API È VUOTA, MOSTRIAMO MATCH DI TEST (Così vedi se l'app è viva)
    if (fixtures.length === 0) {
      return NextResponse.json([
        {
          league: { name: "TEST MODE" },
          teams: { home: { name: "Inter" }, away: { name: "Milan" } },
          ai_tip: "1X + OVER 1.5",
          ai_reason: "Il sistema è collegato, ma l'API non ha inviato dati reali per oggi."
        },
        {
          league: { name: "TEST MODE" },
          teams: { home: { name: "Real Madrid" }, away: { name: "Barcellona" } },
          ai_tip: "GOL / GOL",
          ai_reason: "Connessione stabilita con successo."
        }
      ]);
    }

    return NextResponse.json(fixtures.slice(0, 15));
  } catch (error) {
    return NextResponse.json([]);
  }
}
