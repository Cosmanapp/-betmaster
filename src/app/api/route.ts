import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const today = new Date();
  const todayISO = today.toISOString().split('T')[0];
  const apiKey = process.env.RAPIDAPI_KEY;

  // Se manca la chiave, creiamo un "falso pronostico" visibile
  if (!apiKey) {
    return NextResponse.json({
      success: true,
      suggestions: [{
        event: "⚠️ CONFIGURAZIONE RICHIESTA",
        league: "Sistema", // Campo obbligatorio
        prediction: "API Key Mancante",
        confidence: 85, // Confidence alto per superare i filtri
        odds: 1.50, // Campo obbligatorio
        reasoning: "Vai su Vercel > Settings > Environment Variables e aggiungi 'RAPIDAPI_KEY'. Senza questa chiave, l'app non può scaricare le partite.",
        sport: "football"
      }]
    });
  }

  // Tentativo di chiamata API
  try {
    const res = await fetch(`https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${todayISO}`, {
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    if (!res.ok) {
      // Se l'API risponde con errore, creiamo un "falso pronostico" di errore
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: `❌ ERRORE API (Codice ${res.status})`,
          league: "RapidAPI",
          prediction: "Chiave Non Valida",
          confidence: 85,
          odds: 1.50,
          reasoning: `La tua chiave API è stata rifiutata. Verifica su RapidAPI.com se è attiva o se hai superato il limite gratuito.`,
          sport: "football"
        }]
      });
    }

    const data = await res.json();
    const matches = data.response || [];

    // Se non ci sono partite, avvisiamo con un "falso pronostico" informativo
    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: "ℹ️ NESSUNA PARTITA OGGI",
          league: todayISO,
          prediction: "Calendario Vuoto",
          confidence: 85,
          odds: 1.50,
          reasoning: `L'API risponde correttamente ma
