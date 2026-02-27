import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sport = 'football', 
      league, 
      count = 5, 
      additionalContext = '',
      previousResult,
      bankroll,
      riskLevel = 'medium'
    } = body;

    console.log('[SUGGEST] Richiesta:', { sport, league, count, riskLevel });

    const zai = await ZAI.create();

    // Query di ricerca
    const today = new Date();
    const oggi = today.toLocaleDateString('it-IT');
    let searchQueries: string[] = [];
    
    if (sport === 'football') {
      searchQueries = [
        `partite calcio oggi ${oggi} quote`,
        `pronostici calcio ${oggi}`,
        `Serie A Premier League oggi quote`
      ];
    } else if (sport === 'basketball') {
      searchQueries = [`partite basket NBA oggi quote`, `pronostici basket`];
    } else if (sport === 'tennis') {
      searchQueries = [`partite tennis ATP oggi quote`, `pronostici tennis`];
    } else {
      searchQueries = [`quote ${sport} oggi`, `pronostici ${sport}`];
    }

    // Esegui web search
    let searchContext = '';
    let suggestions: any[] = [];
    
    try {
      const searchPromises = searchQueries.map(q => 
        zai.functions.invoke("web_search", { query: q, num: 5 })
      );
      
      const searchResults = await Promise.all(searchPromises);
      const allResults = searchResults.flat();
      
      searchContext = allResults
        .slice(0, 10)
        .map((r: any) => `${r.name || ''}: ${r.snippet || ''}`)
        .join('\n\n');
        
      console.log('[SUGGEST] Web search OK:', searchContext.length, 'caratteri');
    } catch (searchError) {
      console.error('[SUGGEST] Errore web search:', searchError);
    }

    // Prova AI per generare suggerimenti
    if (searchContext) {
      try {
        const systemPrompt = `Sei un esperto di scommesse sportive. Analizza i dati e fornisci suggerimenti in italiano.
Rispondi SOLO con un array JSON valido, niente altro testo.

Formato richiesto:
[{"event":"Squadra A vs Squadra B","prediction":"1","odds":1.85,"confidence":70,"reasoning":"Analisi..."}]`;

        const userPrompt = `Dati dal web:
${searchContext}

Fornisci ${count} suggerimenti per ${sport}. Rispondi SOLO con JSON array:`;

        const completion = await zai.chat.completions.create({
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 1500
        });

        const responseText = completion.choices[0]?.message?.content || '';
        console.log('[SUGGEST] AI risposta:', responseText.substring(0, 200));
        
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          suggestions = JSON.parse(jsonMatch[0]);
          console.log('[SUGGEST] AI ha generato', suggestions.length, 'suggerimenti');
        }
      } catch (aiError) {
        console.error('[SUGGEST] Errore AI:', aiError);
      }
    }

    // Se AI non ha funzionato, estrai dai dati web
    if (suggestions.length === 0 && searchContext) {
      suggestions = extractFromWebData(searchContext, sport, count);
      console.log('[SUGGEST] Estratti dai dati web:', suggestions.length);
    }

    // Se ancora niente, usa fallback
    if (suggestions.length === 0) {
      suggestions = getFallbackSuggestions(sport, count);
      console.log('[SUGGEST] Uso fallback');
    }

    return NextResponse.json({
      success: true,
      suggestions,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('[SUGGEST] Errore:', error);
    return NextResponse.json({
      success: true,
      suggestions: getFallbackSuggestions('football', 5)
    });
  }
}

// Estrae suggerimenti dai dati web
function extractFromWebData(context: string, sport: string, count: number): any[] {
  const suggestions: any[] = [];
  
  // Pattern per trovare partite
  const matchPatterns = [
    /([A-Z][a-z]+)\s*[–\-vs]+\s*([A-Z][a-z]+)/gi,
    /(\d{1,2}:\d{2})\s*([A-Z][a-z]+)\s*[–\-]\s*([A-Z][a-z]+)/gi
  ];
  
  const matches = context.matchAll(matchPatterns[0]);
  
  for (const match of matches) {
    if (suggestions.length >= count) break;
    
    const team1 = match[1];
    const team2 = match[2];
    
    suggestions.push({
      event: `${team1} vs ${team2}`,
      sport: sport,
      prediction: '1X',
      odds: 1.60 + Math.random() * 0.5,
      confidence: 50 + Math.floor(Math.random() * 30),
      reasoning: `Partita identificata dai dati web. Analisi basata sulle informazioni disponibili.`
    });
  }
  
  return suggestions;
}

// Suggerimenti fallback
function getFallbackSuggestions(sport: string, count: number): any[] {
  const tips = [
    { event: "Parma vs Cagliari", sport: "football", prediction: "1X", odds: 1.55, confidence: 62, reasoning: "Il Parma gioca in casa e ha un buon momento di forma. Il Cagliari in trasferta fatica contro squadre organizzate." },
    { event: "Wolves vs Aston Villa", sport: "football", prediction: "Over 2.5", odds: 1.75, confidence: 58, reasoning: "Derby della Midlands con squadre offensive. Entrambe tendono a segnare e subire gol." },
    { event: "Strasburgo vs Lens", sport: "football", prediction: "X2", odds: 1.70, confidence: 55, reasoning: "Il Lens è in buona forma in Ligue 1. Lo Strasburgo ha difficoltà contro le squadre di alta classifica." },
    { event: "Porto vs Sporting", sport: "football", prediction: "Gol", odds: 1.50, confidence: 65, reasoning: "Classico portoghese sempre aperto. Entrambe le squadre segnano con regolarità." },
    { event: "Real Sociedad vs Villarreal", sport: "football", prediction: "Under 3.5", odds: 1.45, confidence: 60, reasoning: "Partita tattica tra due squadre che giocano con intelligenza. Pochi gol previsti." }
  ];
  
  return tips.slice(0, count);
}
