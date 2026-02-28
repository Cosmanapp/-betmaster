import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// API per suggerimenti usando Groq AI + Web Search (fallback) o Football-Data.org
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      sport = 'football', 
      league, 
      count = 5, 
      riskLevel = 'medium',
      apiKey // Football-data.org key (opzionale)
    } = body;

    const today = new Date();
    const todayStr = today.toLocaleDateString('it-IT');
    const todayISO = today.toISOString().split('T')[0];
    
    let matches: any[] = [];
    
    // 1. Prova con Football-Data.org se c'è API key
    if (apiKey && apiKey.trim() !== '') {
      try {
        matches = await fetchFootballDataOrg(apiKey.trim(), todayISO);
      } catch (e) {
        console.error('[Football-Data] Errore:', e);
      }
    }
    
    // 2. Fallback: Usa Web Search per trovare partite di oggi
    if (matches.length === 0) {
      matches = await searchTodaysMatches();
    }
    
    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [{
          event: '📅 Nessuna partita trovata oggi',
          league: 'Riprova più tardi',
          prediction: '--',
          odds: 0,
          confidence: 0,
          reasoning: `Oggi ${todayStr} potrebbe non esserci calcio.`,
          sport: sport,
          eventDate: todayStr
        }],
        totalFound: 0,
        timestamp: new Date().toISOString(),
        source: 'no_matches',
        date: todayStr
      });
    }
    
    // 3. Per ogni partita, ottieni analisi AI
    const suggestions = [];
    for (const match of matches.slice(0, count + 5)) {
      try {
        const analysis = await analyzeMatchWithGroq(match);
        if (analysis) suggestions.push(analysis);
      } catch (e) {
        console.error('Error analyzing match:', e);
      }
    }
    
    // 4. Filtra per rischio
    let filtered = suggestions;
    if (riskLevel === 'low') {
      filtered = suggestions.filter(s => s.confidence >= 75);
    } else if (riskLevel === 'medium') {
      filtered = suggestions.filter(s => s.confidence >= 60);
    }

    return NextResponse.json({
      success: true,
      suggestions: filtered.slice(0, count),
      totalFound: matches.length,
      timestamp: new Date().toISOString(),
      source: apiKey ? 'football-data-org + groq' : 'web-search + groq',
      lastUpdate: todayStr,
      date: todayStr
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || 'Errore',
      suggestions: []
    }, { status: 500 });
  }
}

// Cerca partite di oggi via Web Search
async function searchTodaysMatches(): Promise<any[]> {
  const matches: any[] = [];
  
  try {
    const zai = await ZAI.create();
    const today = new Date();
    const dateStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    const searchResult = await zai.functions.invoke("web_search", {
      query: `partite calcio oggi ${dateStr} serie A premier league liga`,
      num: 15
    });
    
    if (searchResult && Array.isArray(searchResult)) {
      for (const result of searchResult) {
        const text = result.snippet || '';
        const title = result.name || '';
        
        const patterns = [
          /([A-Za-zÀ-ÿ\s]+)\s+vs\s+([A-Za-zÀ-ÿ\s]+)/gi,
          /([A-Za-zÀ-ÿ\s]+)\s*-\s*([A-Za-zÀ-ÿ\s]+)/gi
        ];
        
        for (const pattern of patterns) {
          const found = text.match(pattern) || title.match(pattern);
          if (found) {
            for (const m of found) {
              const parts = m.split(/\s+vs\s+|\s*-\s*/i);
              if (parts.length === 2) {
                const home = parts[0].trim();
                const away = parts[1].trim();
                
                if (home.length > 2 && away.length > 2) {
                  let league = 'Campionato';
                  const ctx = (text + ' ' + title).toLowerCase();
                  if (ctx.includes('serie a')) league = 'Serie A';
                  else if (ctx.includes('premier')) league = 'Premier League';
                  else if (ctx.includes('liga')) league = 'La Liga';
                  else if (ctx.includes('bundesliga')) league = 'Bundesliga';
                  else if (ctx.includes('champions')) league = 'Champions League';
                  
                  matches.push({
                    homeTeam: home,
                    awayTeam: away,
                    league,
                    date: new Date().toISOString(),
                    status: 'SCHEDULED'
                  });
                }
              }
            }
          }
        }
      }
    }
    
    // Rimuovi duplicati
    return matches.filter((m, i, arr) =>
      i === arr.findIndex(x => 
        x.homeTeam.toLowerCase() === m.homeTeam.toLowerCase() &&
        x.awayTeam.toLowerCase() === m.awayTeam.toLowerCase()
      )
    ).slice(0, 15);
    
  } catch (e) {
    console.error('Web search error:', e);
    return matches;
  }
}

// Scarica partite da football-data.org
async function fetchFootballDataOrg(apiKey: string, date: string): Promise<any[]> {
  const response = await fetch(
    `https://api.football-data.org/v4/matches?date=${date}`,
    { headers: { 'X-Auth-Token': apiKey }, cache: 'no-store' }
  );
  
  if (!response.ok) return [];
  
  const data = await response.json();
  const matches: any[] = [];
  
  if (data.matches) {
    for (const m of data.matches) {
      if (m.status !== 'FINISHED' && m.status !== 'POSTPONED') {
        matches.push({
          homeTeam: m.homeTeam?.name,
          awayTeam: m.awayTeam?.name,
          league: m.competition?.name,
          area: m.competition?.area?.name,
          date: m.utcDate,
          status: m.status
        });
      }
    }
  }
  return matches;
}

// Analisi AI con Groq
async function analyzeMatchWithGroq(match: any): Promise<any | null> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
  const home = match.homeTeam || 'Casa';
  const away = match.awayTeam || 'Trasferta';
  const league = match.league || 'Campionato';
  
  const prompt = `Sei un bookmaker professionista. Analizza: ${home} vs ${away} (${league})
Rispondi in JSON: {"prediction":"1/X/2/1X/X2/Over 2.5/Under 2.5/GG","odds":1.5,"confidence":75,"reasoning":"Analisi dettagliata"}`;
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const json = content.match(/\{[\s\S]*\}/);
    if (!json) return null;
    
    const a = JSON.parse(json[0]);
    return {
      event: `${home} vs ${away}`,
      league,
      prediction: a.prediction || '1X',
      odds: Math.round((a.odds || 1.5) * 100) / 100,
      confidence: Math.min(95, Math.max(60, a.confidence || 70)),
      reasoning: a.reasoning || 'Analisi AI',
      sport: 'football',
      eventDate: new Date().toLocaleDateString('it-IT')
    };
  } catch (e) {
    return null;
  }
}
