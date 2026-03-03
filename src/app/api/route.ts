import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const apiKey = process.env.RAPIDAPI_KEY;
  const today = new Date().toISOString().split('T')[0];

  // FUNZIONE PER MOSTRARE ERRORI A SCHERMO
  // Usiamo confidence 100 e success true per aggirare i filtri del frontend
  const showError = (title: string, msg: string) => {
    return NextResponse.json({
      success: true,
      suggestions: [{
        event: `⚠️ ${title}`,
        league: "Diagnostica",
        prediction: "Vedi Dettagli",
        confidence: 100,
        odds: 0,
        reasoning: msg,
        sport: "football"
      }]
    });
  };

  // 1. Controllo se la chiave esiste su Vercel
  if (!apiKey) {
    return showError("CONFIGURAZIONE MANCANTE", 
      "Su Vercel non c'è nessuna variabile chiamata RAPIDAPI_KEY. Aggiungila nelle Environment Variables."
    );
  }

  // 2. Chiamata all'API Reale
  const url = `https://api-football-v1.p.rapidapi.com/v3/fixtures?date=${today}`;
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'x-rapidapi-key': apiKey,
        'x-rapidapi-host': 'api-football-v1.p.rapidapi.com'
      }
    });

    // 3. Se l'API risponde con un errore (es. 403 Forbidden, 401 Unauthorized)
    if (!response.ok) {
      const errorBody = await response.text();
      return showError(`ERRORE API (Codice ${response.status})`, 
        `L'API rifiuta l'accesso. Risposta: "${errorBody}". Verifica se la tua chiave RapidAPI è valida o se il piano gratuito è scaduto.`
      );
    }

    const data = await response.json();
    const matches = data.response || [];

    // 4. Se l'API risponde OK ma non ci sono partite
    if (matches.length === 0) {
      return showError("NESSUNA PARTITA TROVATA", 
        `L'API funziona! Ma per la data di oggi (${today}) non risultano partite nei campionati disponibili col piano gratuito.`
      );
    }

    // 5. Se tutto funziona, restituisco le partite vere
    const results = matches.map((m: any) => ({
      event: `${m.teams.home.name} vs ${m.teams.away.name}`,
      league: m.league.name,
      prediction: "ANALISI...",
      confidence: 50,
      odds: 0,
      reasoning: "Partita reale trovata!",
      sport: "football"
    }));

    return NextResponse.json({ success: true, suggestions: results });

  } catch (e: any) {
    return showError("ERRORE DI CONNESSIONE", e.message);
  }
}
