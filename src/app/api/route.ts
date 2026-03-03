import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // 1. Prendiamo la chiave
  const apiKey = process.env.RAPIDAPI_KEY;

  // Se manca la chiave, errore immediato
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      suggestions: [{
        event: "❌ ERRORE CRITICO",
        reasoning: "Non trovo la variabile RAPIDAPI_KEY su Vercel. Controlla che il nome sia scritto ESATTAMENTE così (maiuscolo, tutto attaccato).",
        prediction: "ERRORE", confidence: 0, odds: 0, sport: "error"
      }]
    });
  }

  // 2. Chiamata API Reale (Data di oggi)
  const today = new Date().toISOString().split('T')[0];
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    // 3. Se l'API risponde male, mostriamo il perché
    if (!response.ok) {
      const errorText = await response.text();
      return NextResponse.json({
        success: false,
        suggestions: [{
          event: `❌ ERRORE API (Codice ${response.status})`,
          reasoning: `L'API ha rifiutato l'accesso. Risposta: ${errorText}. Significa che la Key è sbagliata o
