import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sport = 'football', 
      league, 
      count = 5, 
      riskLevel = 'medium'
    } = body;

    console.log('[SUGGEST] Richiesta:', { sport, league, count, riskLevel });

    const zai = await ZAI.create();

    // Query di ricerca basate sullo sport
    const today = new Date();
    const oggi = today.toLocaleDateString('it-IT');
    const giorno = today.getDate();
    const mese = today.toLocaleDateString('it-IT', { month: 'long' });
    const anno = today.getFullYear();
    
    let searchQueries: string[] = [];
    
    if (sport === 'football') {
      searchQueries = [
        `partite calcio ${oggi} quote pronostici`,
        `schedine calcio ${giorno} ${mese} ${anno}`,
        `quote calcio oggi Serie A Premier League`,
        `pronostici calcio ${oggi} analisi`
      ];
    } else if (sport === 'basketball') {
      searchQueries = [
        `partite basket NBA oggi quote`,
        `pronostici basket Eurolega ${oggi}`
      ];
    } else if (sport === 'tennis') {
      searchQueries = [
        `partite tennis ATP WTA oggi quote`,
        `pronostici tennis ${oggi}`
      ];
    } else {
      searchQueries = [
        `quote ${sport} ${oggi}`,
        `pronostici ${sport} oggi`
      ];
    }

    // Esegui ricerche web
    let searchContext = '';
    try {
      const searchPromises = searchQueries.map(q => 
        zai.functions.invoke("web_search", { query: q, num: 5 })
      );
      
      const searchResults = await Promise.all(searchPromises);
      
      // Combina i risultati
      const allResults = searchResults.flat();
      searchContext = allResults
        .slice(0, 15)
        .map((r: any) => `${r.name || ''}: ${r.snippet || ''}`)
        .filter((t: string) => t.length > 20)
        .join('\n\n');
        
      console.log('[SUGGEST] Contesto trovato:', searchContext.length, 'caratteri');
    } catch (searchError) {
      console.error('[SUGGEST] Errore ricerca web:', searchError);
      searchContext = 'Dati non disponibili dalla ricerca web.';
    }

    // Prompt per l'AI
    const systemPrompt = `Sei un esperto di scommesse sportive con anni di esperienza. Il tuo compito è fornire suggerimenti di scommesse basati sui dati disponibili.

IMPORTANTE:
- Analizza i dati forniti dal web
- Fornisci suggerimenti realistici
- Indica sempre la confidence (0-100)
- Sii onesto sulle probabilità
- Rispondi SEMPRE in italiano
- Rispondi SOLO con JSON valido, nient'altro`;

    const userPrompt = `Basandoti su questi dati dal web, fornisci ${count} suggerimenti per scommesse ${sport}:

DATI DAL WEB:
${searchContext || 'Nessun dato disponibile - genera suggerimenti generici'}

Per ogni suggerimento fornisci:
- event: nome dell'evento (es. "Juventus vs Milan")
- prediction: il pronostico (es. "1", "X", "2", "Over 2.5", "Gol")
- odds: quota indicativa (es. 1.85)
- confidence: percentuale 0-100
- reasoning: motivazione di 2-3 frasi

Rispondi SOLO con un array JSON valido, senza testo aggiuntivo:
[
  {
    "event": "Squadra A vs Squadra B",
    "sport": "${sport}",
    "prediction": "1",
    "odds": 1.85,
    "confidence": 70,
    "reasoning": "Analisi dettagliata del match..."
  }
]`;

    let suggestions = [];
    
    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content || '';
      console.log('[SUGGEST] Risposta AI:', responseText.substring(0, 200));
      
      // Parsing JSON
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (aiError) {
      console.error('[SUGGEST] Errore AI:', aiError);
    }

    // Se non ci sono suggerimenti, usa fallback
    if (!suggestions || suggestions.length === 0) {
      console.log('[SUGGEST] Uso fallback');
      suggestions = getFallbackSuggestions(sport, count);
    }

    return NextResponse.json({
      success: true,
      suggestions,
      context: searchContext.substring(0, 500),
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[SUGGEST] Errore generale:', error);
    
    // Restituisci fallback anche in caso di errore
    return NextResponse.json({
      success: true,
      suggestions: getFallbackSuggestions('football', 5),
      error: error.message
    });
  }
}

// Suggerimenti fallback quando la ricerca fallisce
function getFallbackSuggestions(sport: string, count: number) {
  const footballTips = [
    { event: "Serie A - Inter vs Juventus", sport: "football", prediction: "1X", odds: 1.45, confidence: 65, reasoning: "L'Inter è in forma e gioca in casa. La Juve è solida ma fatica in trasferta contro le big." },
    { event: "Premier League - Arsenal vs Chelsea", sport: "football", prediction: "Over 2.5", odds: 1.75, confidence: 60, reasoning: "Scontri diretti spesso prolifici. Entrambe le squadre segnano con regolarità." },
    { event: "La Liga - Real Madrid vs Barcelona", sport: "football", prediction: "Gol", odds: 1.55, confidence: 70, reasoning: "El Clasico storico, raramente finisce 0-0. Entrambe le squadre offensive." },
    { event: "Bundesliga - Bayern vs Dortmund", sport: "football", prediction: "1", odds: 1.60, confidence: 62, reasoning: "Il Bayern domina in casa contro il Dortmund. Der Klassiker favorevole ai bavaresi." },
    { event: "Serie A - Napoli vs Milan", sport: "football", prediction: "X2", odds: 1.80, confidence: 55, reasoning: "Partita equilibrata tra due squadre di alto livello. Il Milan può puntare al risultato utile." }
  ];
  
  const basketballTips = [
    { event: "NBA - Lakers vs Celtics", sport: "basketball", prediction: "Over 220.5", odds: 1.85, confidence: 60, reasoning: "Due squadre offensive, partita aperta con molti punti." },
    { event: "NBA - Warriors vs Nets", sport: "basketball", prediction: "1", odds: 1.65, confidence: 58, reasoning: "I Warriors in casa sono favoriti. Steph Curry in forma." }
  ];
  
  const tennisTips = [
    { event: "ATP - Sinner vs Alcaraz", sport: "tennis", prediction: "Over 2.5 set", odds: 1.75, confidence: 65, reasoning: "Scontro tra due top player. Partita probabilmente combattuta." },
    { event: "ATP - Djokovic vs Medvedev", sport: "tennis", prediction: "1", odds: 1.55, confidence: 60, reasoning: "Djokovic favorito negli scontri diretti recenti." }
  ];
  
  const allTips: Record<string, any[]> = {
    football: footballTips,
    basketball: basketballTips,
    tennis: tennisTips
  };
  
  const tips = allTips[sport] || footballTips;
  return tips.slice(0, count);
}
