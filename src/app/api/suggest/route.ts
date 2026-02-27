import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sport, 
      league, 
      count = 5, 
      additionalContext = '',
      previousResult,
      bankroll,
      riskLevel = 'medium'
    } = body;

    const zai = await ZAI.create();

    // Costruisco la query di ricerca basata sui parametri
    const today = new Date().toLocaleDateString('it-IT');
    const searchQueries = [];
    
    if (sport === 'football') {
      searchQueries.push(`quote calcio ${league || 'oggi'} ${today}`);
      searchQueries.push(`statistiche calcio ${league || ''} ultime partite`);
      searchQueries.push(`news calcio ${league || ''} infortuni formazioni`);
    } else if (sport === 'basketball') {
      searchQueries.push(`quote basket NBA Eurolega ${today}`);
      searchQueries.push(`statistiche basket ultime partite`);
    } else if (sport === 'tennis') {
      searchQueries.push(`quote tennis ATP WTA ${today}`);
      searchQueries.push(`risultati tennis ATP WTA`);
    } else {
      searchQueries.push(`quote ${sport} ${today}`);
      searchQueries.push(`statistiche ${sport} previsioni`);
    }

    // Eseguo ricerche web parallele
    const searchPromises = searchQueries.map(q => 
      zai.functions.invoke("web_search", { query: q, num: 5 })
    );
    
    const searchResults = await Promise.all(searchPromises);
    
    // Combino i risultati
    const allResults = searchResults.flat();
    const searchContext = allResults
      .slice(0, 10)
      .map((r: any) => `${r.name}: ${r.snippet}`)
      .join('\n\n');

    // Creo il prompt per l'AI
    let systemPrompt = `Sei il più grande esperto di scommesse sportive al mondo. Hai decenni di esperienza nel analizzare quote, statistiche, forma delle squadre/atleti, infortuni, fattori ambientali e psicologici.

Il tuo compito è fornire suggerimenti di scommesse professionali, basati su:
1. Analisi statistiche approfondite
2. Valutazione delle quote (value betting)
3. Fattori nascosti (infortuni, motivazione, fattori ambientali)
4. Gestione del bankroll intelligente

IMPORTANTE: 
- Non usare mai la strategia martingala (raddoppiare dopo una perdita)
- Cerca sempre value bet dove la quota offerta è superiore alla probabilità reale
- Fornisci sempre reasoning dettagliato per ogni suggerimento
- Indica la confidence (0-100) basata sulla certezza della previsione
- Ogni suggerimento deve essere basato sui dati raccolti dal web

Rispondi SEMPRE in italiano.`;

    let userPrompt = `Analizza i seguenti dati raccolti dal web e fornisci ${count} suggerimenti di scommesse per ${sport} ${league || ''}:

DATI DAL WEB:
${searchContext}

${additionalContext ? `CONTESTO AGGIUNTIVO: ${additionalContext}` : ''}

${previousResult ? `RISULTATO PRECEDENTE: ${previousResult}` : ''}
${bankroll ? `BANKROLL ATTUALE: €${bankroll}` : ''}
${riskLevel ? `LIVELLO RISCHIO: ${riskLevel}` : ''}

Per ogni suggerimento fornisci:
1. Evento (squadre/atleti)
2. Previsione (1, X, 2, Over/Under, ecc.)
3. Quota stimata
4. Confidence (0-100)
5. Reasoning dettagliato (almeno 3-4 frasi)
6. Data evento (se disponibile)

Rispondi in formato JSON array:
[
  {
    "event": "Squadra A vs Squadra B",
    "sport": "${sport}",
    "league": "${league || ''}",
    "prediction": "1",
    "odds": 1.85,
    "confidence": 75,
    "reasoning": "Analisi dettagliata...",
    "eventDate": "${today}",
    "bookmakers": ["Bet365", "William Hill"]
  }
]`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content || '[]';
    
    // Parsing della risposta JSON
    let suggestions = [];
    try {
      // Estrae il JSON dalla risposta
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        suggestions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      console.error('JSON parsing error:', e);
      suggestions = [];
    }

    return NextResponse.json({
      success: true,
      suggestions,
      searchContext,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Suggestion error:', error);
    return NextResponse.json(
      { error: error.message || 'Suggestion failed' },
      { status: 500 }
    );
  }
}
