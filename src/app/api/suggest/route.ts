import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport = 'football', count = 5, riskLevel = 'medium' } = body;

    console.log('[SUGGEST] === INIZIO ===', { sport, count, riskLevel });

    const zai = await ZAI.create();
    
    // Data di oggi
    const today = new Date();
    const day = today.getDate();
    const month = today.getMonth() + 1;
    const year = today.getFullYear();
    
    // Query per web search
    const queries = [
      `partite calcio oggi ${day} ${month} ${year}`,
      `Serie A partite oggi`,
      `Premier League matches today`,
      `La Liga partidos hoy`,
      `Bundesliga Spiele heute`,
      `Ligue 1 matchs aujourd'hui`
    ];
    
    let allSearchResults: any[] = [];
    
    // Esegui web search
    for (const query of queries) {
      try {
        console.log('[SUGGEST] Query:', query);
        const results = await zai.functions.invoke("web_search", { query, num: 5 });
        if (results && Array.isArray(results)) {
          allSearchResults = allSearchResults.concat(results);
        }
      } catch (e) {
        console.log('[SUGGEST] Query fallita:', query);
      }
    }
    
    console.log('[SUGGEST] Totale risultati:', allSearchResults.length);
    
    if (allSearchResults.length === 0) {
      return NextResponse.json({
        success: false,
        suggestions: [],
        message: "Nessun dato trovato. Riprova."
      });
    }
    
    // Prepara dati per AI
    const webData = allSearchResults
      .slice(0, 15)
      .map(r => `${r.name}: ${r.snippet}`)
      .join('\n\n');
    
    // Chiama AI
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `Sei un esperto di scommesse. Analizza le partite e dai pronostici.
Rispondi SOLO con JSON array.
Formato: [{"event":"Squadra A vs Squadra B","prediction":"1","odds":1.85,"confidence":72,"reasoning":"motivo","league":"Serie A","matchTime":"15:00"}]
Prediction: 1, X, 2, 1X, X2, GG, NG, Over 2.5, Under 2.5`
        },
        {
          role: 'user',
          content: `Partite trovate oggi ${day}/${month}/${year}:\n\n${webData}\n\nEstrai le partite REALI e fornisci ${count} pronostici. Rispondi SOLO con JSON array:`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000
    });

    const responseText = completion.choices[0]?.message?.content || '';
    console.log('[SUGGEST] AI:', responseText.substring(0, 150));
    
    // Estrai JSON
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({
        success: false,
        suggestions: [],
        message: "Errore parsing AI"
      });
    }
    
    const suggestions = JSON.parse(jsonMatch[0]);
    
    const valid = suggestions
      .filter((s: any) => s.event && s.prediction)
      .map((s: any) => ({
        event: s.event,
        sport: 'football',
        prediction: s.prediction,
        odds: Math.round((s.odds || 1.70) * 100) / 100,
        confidence: Math.min(85, Math.max(55, s.confidence || 65)),
        reasoning: s.reasoning || '',
        league: s.league || '',
        matchTime: s.matchTime || ''
      }));
    
    console.log('[SUGGEST] OK:', valid.length, 'pronostici');
    
    return NextResponse.json({
      success: true,
      suggestions: valid.slice(0, count)
    });

  } catch (error: any) {
    console.error('[SUGGEST] Errore:', error);
    return NextResponse.json({
      success: false,
      suggestions: [],
      error: error.message
    });
  }
}
