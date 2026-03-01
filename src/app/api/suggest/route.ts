import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';
import { ALL_MATCHES, getUpcomingMatches, type Match } from '@/lib/calendar';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const count = body.count || 5;
    const league = body.league || 'all';

    console.log('[SUGGEST] Richiesta', count, 'pronostici per lega:', league);
    console.log('[SUGGEST] Totale partite in calendario:', ALL_MATCHES.length);

    let upcomingMatches = getUpcomingMatches(7);
    console.log('[SUGGEST] Partite prossime 7 giorni:', upcomingMatches.length);

    if (league && league !== 'all') {
      upcomingMatches = upcomingMatches.filter(m => m.league === league);
    }

    if (upcomingMatches.length === 0) {
      console.log('[SUGGEST] Nessuna partita prossima, uso tutto il calendario');
      upcomingMatches = ALL_MATCHES.slice(0, 20);
    }

    upcomingMatches.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.time.localeCompare(b.time);
    });

    const selectedMatches = upcomingMatches.slice(0, Math.min(count * 2, 15));
    console.log('[SUGGEST] Partite selezionate:', selectedMatches.length);

    try {
      const zai = await ZAI.create();
      
      const matchesText = selectedMatches
        .map(m => `${m.home} vs ${m.away} (${m.league}) - ${m.date} ore ${m.time}${m.round ? ` [${m.round}]` : ''}`)
        .join('\n');

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Sei un esperto di scommesse calcistiche europee.
Analizza le partite REALI e genera pronostici.
Rispondi SOLO con JSON array.
Formato: [{"event":"Squadra A vs Squadra B","prediction":"1","odds":1.85,"confidence":72,"reasoning":"motivo","league":"Serie A","matchTime":"15:00","date":"2026-01-25"}]
Prediction: 1, X, 2, 1X, X2, GG, NG, Over 2.5, Under 2.5
Confidence: 55-85
Odds: 1.30-4.00`
          },
          {
            role: 'user',
            content: `Analizza queste partite REALI e fornisci ${count} pronostici:\n${matchesText}\nGenera ${count} pronostici in JSON:`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content || '';
      console.log('[SUGGEST] AI risposta:', responseText.substring(0, 200));

      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        const valid = parsed
          .filter((s: any) => s.event && s.prediction)
          .slice(0, count)
          .map((s: any) => ({
            event: s.event,
            sport: 'football',
            prediction: s.prediction,
            odds: Math.round((s.odds || 1.70) * 100) / 100,
            confidence: Math.min(85, Math.max(55, s.confidence || 65)),
            reasoning: s.reasoning || 'Analisi AI',
            league: s.league || 'Calcio',
            matchTime: s.matchTime || '',
            date: s.date || ''
          }));

        if (valid.length > 0) {
          console.log('[SUGGEST] SUCCESS AI:', valid.length);
          return NextResponse.json({ success: true, suggestions: valid, source: 'calendar_ai', totalMatches: upcomingMatches.length });
        }
      }
    } catch (aiErr: any) {
      console.log('[SUGGEST] AI error, uso fallback:', aiErr.message);
    }

    const predictions = ['1', 'X', '2', '1X', 'X2', 'GG', 'Over 2.5'];
    const oddsMap: Record<string, number> = { '1': 2.10, 'X': 3.20, '2': 2.40, '1X': 1.40, 'X2': 1.55, 'GG': 1.70, 'Over 2.5': 1.80 };
    
    const suggestions = selectedMatches.slice(0, count).map((m, i) => {
      const pred = predictions[i % predictions.length];
      return {
        event: `${m.home} vs ${m.away}`,
        sport: 'football',
        prediction: pred,
        odds: oddsMap[pred] || 1.70,
        confidence: 60 + Math.floor(Math.random() * 15),
        reasoning: `${m.home} vs ${m.away} in ${m.league}${m.round ? ` (${m.round})` : ''}. ${m.date} ore ${m.time}.`,
        league: m.league,
        matchTime: m.time,
        date: m.date
      };
    });

    console.log('[SUGGEST] SUCCESS fallback:', suggestions.length);
    return NextResponse.json({ success: true, suggestions, source: 'calendar_fallback', totalMatches: upcomingMatches.length });

  } catch (error: any) {
    console.error('[SUGGEST] Errore:', error);
    return NextResponse.json({ success: false, suggestions: [], error: error.message });
  }
}
