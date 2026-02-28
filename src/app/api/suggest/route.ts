import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// API suggerimenti calcio - Analisi professionale da esperto
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport = 'football', count = 5, riskLevel = 'medium' } = body;

    const now = new Date();
    const todayStr = now.toLocaleDateString('it-IT');
    
    // 1. Cerca partite da tutti i campionati europei
    const matches = await searchEuropeanMatches(now);
    
    if (matches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [{ event: '📅 Nessuna partita', league: 'Riprova', prediction: '--', odds: 0, confidence: 0, reasoning: `Nessuna partita per ${todayStr}.`, sport, eventDate: todayStr }],
        totalFound: 0, source: 'no_matches'
      });
    }
    
    // 2. Filtra partite NON ancora iniziate
    const upcoming = filterUpcomingMatches(matches, now);
    
    if (upcoming.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [{ event: '⏰ Partite già iniziate', league: 'Domani', prediction: '--', odds: 0, confidence: 0, reasoning: 'Tutte le partite già iniziate.', sport, eventDate: todayStr }],
        totalFound: matches.length, source: 'all_started'
      });
    }
    
    // 3. Analisi professionale per ogni partita
    const suggestions = [];
    for (const m of upcoming.slice(0, count + 3)) {
      const a = await analyzeMatchExpert(m);
      if (a) suggestions.push(a);
    }
    
    // 4. Ordina per confidence (più solidi prima)
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    // 5. Fallback
    if (suggestions.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: upcoming.slice(0, count).map(m => ({
          event: `${m.homeTeam} vs ${m.awayTeam}`, league: m.league, prediction: predictBasic(m),
          odds: 1.70, confidence: 65, reasoning: `${m.homeTeam} vs ${m.awayTeam} in ${m.league}.`,
          sport: 'football', eventDate: todayStr, matchTime: m.time
        })),
        totalFound: upcoming.length, source: 'web-search'
      });
    }
    
    // 6. Filtra per rischio
    let filtered = suggestions;
    if (riskLevel === 'low') filtered = suggestions.filter(s => s.confidence >= 80);
    else if (riskLevel === 'medium') filtered = suggestions.filter(s => s.confidence >= 65);

    return NextResponse.json({ success: true, suggestions: filtered.slice(0, count), totalFound: upcoming.length, source: 'expert-analysis', date: todayStr });
    
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message, suggestions: [] }, { status: 500 });
  }
}

async function searchEuropeanMatches(now: Date): Promise<any[]> {
  try {
    const zai = await ZAI.create();
    const day = now.getDate();
    const month = now.toLocaleString('en-EN', { month: 'long' });
    const monthIt = now.toLocaleString('it-IT', { month: 'long' });
    
    const queries = [
      `Serie A matches today ${day} ${month} 2026 kickoff`,
      `Premier League matches today ${day} ${month} 2026 kickoff`,
      `La Liga matches today ${day} ${month} 2026 kickoff`,
      `Bundesliga matches today ${day} ${month} 2026 kickoff`,
      `Ligue 1 matches today ${day} ${month} 2026 kickoff`,
      `Champions League Europa League today ${day} ${month}`,
      `partite calcio oggi ${day} ${monthIt} serie A premier liga orari`
    ];
    
    const allMatches: any[] = [];
    for (const query of queries) {
      try {
        const result = await zai.functions.invoke("web_search", { query, num: 8 });
        if (result && Array.isArray(result)) allMatches.push(...extractMatches(result));
      } catch (e) {}
    }
    
    return allMatches.filter((m, i, arr) => i === arr.findIndex(x => x.homeTeam === m.homeTeam && x.awayTeam === m.awayTeam));
  } catch (e) { return []; }
}

function extractMatches(results: any[]): any[] {
  const matches: any[] = [];
  
  for (const r of results) {
    const text = (r.snippet || '') + ' ' + (r.name || '');
    
    const patterns = [
      /ore\s*(\d{1,2})[.:](\d{2})\s*[:\-]?\s*([A-Za-z][a-zàèéìòù\s]+)\s*[-–]\s*([A-Za-z][a-zàèéìòù\s]+)/gi,
      /([A-Za-z][a-zàèéìòù\s]+)\s+(?:vs|[-–])\s+([A-Za-z][a-zàèéìòù\s]+)[, ]+(?:ore\s*)?(\d{1,2})[.:](\d{2})/gi,
      /(\d{1,2}):(\d{2})\s+([A-Za-z][a-z\s]+)\s+v\s+([A-Za-z][a-z\s]+)/gi,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let hour: number, minute: number, homeTeam: string, awayTeam: string;
        
        if (pattern === patterns[2]) {
          hour = parseInt(match[1]); minute = parseInt(match[2]);
          homeTeam = match[3].trim(); awayTeam = match[4].trim();
        } else if (match[1].length <= 2 && parseInt(match[1]) <= 23) {
          hour = parseInt(match[1]); minute = parseInt(match[2]);
          homeTeam = match[3].trim(); awayTeam = match[4].trim();
        } else {
          homeTeam = match[1].trim(); awayTeam = match[2].trim();
          hour = parseInt(match[3]); minute = parseInt(match[4]);
        }
        
        if (hour < 0 || hour > 23 || homeTeam.length < 3 || awayTeam.length < 3) continue;
        
        homeTeam = homeTeam.replace(/\s+(su|vs|DAZN|Sky|live).*$/i, '').trim();
        awayTeam = awayTeam.replace(/\s+(su|vs|DAZN|Sky|live).*$/i, '').trim();
        
        let league = 'Europeo';
        const ctx = text.toLowerCase();
        if (ctx.includes('serie a') || ctx.includes('italian')) league = 'Serie A';
        else if (ctx.includes('premier') || ctx.includes('english')) league = 'Premier League';
        else if (ctx.includes('la liga') || ctx.includes('spanish')) league = 'La Liga';
        else if (ctx.includes('bundesliga') || ctx.includes('german')) league = 'Bundesliga';
        else if (ctx.includes('ligue 1') || ctx.includes('french')) league = 'Ligue 1';
        else if (ctx.includes('champions')) league = 'Champions League';
        else if (ctx.includes('europa')) league = 'Europa League';
        
        const exists = matches.some(m => m.homeTeam === homeTeam && m.awayTeam === awayTeam);
        if (!exists) matches.push({ homeTeam, awayTeam, league, time: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`, hour, minute });
      }
    }
  }
  return matches;
}

function filterUpcomingMatches(matches: any[], now: Date): any[] {
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return matches.filter(m => (m.hour * 60 + m.minute) > currentMinutes + 5)
    .sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
}

function predictBasic(m: any): string {
  const strong = ['napoli', 'inter', 'juventus', 'milan', 'atalanta', 'manchester city', 'arsenal', 'liverpool', 'real madrid', 'barcelona', 'bayern', 'psg'];
  const h = m.homeTeam.toLowerCase(), a = m.awayTeam.toLowerCase();
  const hs = strong.some(t => h.includes(t)), as = strong.some(t => a.includes(t));
  if (hs && !as) return '1'; if (as && !hs) return 'X2'; if (hs && as) return 'GG';
  return '1X';
}

// Analisi DA ESPERTO DI CALCIO
async function analyzeMatchExpert(m: any): Promise<any | null> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return null;
  
  const { homeTeam, awayTeam, league, time } = m;
  
  const prompt = `Sei un esperto di calcio con 30 anni di esperienza. Analizza: ${homeTeam} vs ${awayTeam} (${league}).

Valuta:
1. Forza rose e qualità dei giocatori
2. Forma recente (ultimi 5 risultati)
3. Motivazioni (titolo, salvezza, coppa)
4. Fattore casa e tifo
5. Storico scontri diretti
6. Contesto tattico

Dai il risultato PIÙ PROBABILE. Se il favorito è chiaro, dilo onestamente.
JSON: {"prediction":"1","odds":1.40,"confidence":80,"reasoning":"Analisi tecnica"}`;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Esperto calcio 30 anni. Analisi TECNICHE e ONESTE. Obiettivo: AZZECCARE il risultato, non sorprendere. JSON solo.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2
      })
    });
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const json = content.match(/\{[\s\S]*?\}/);
    if (!json) return null;
    
    const p = JSON.parse(json[0]);
    return {
      event: `${homeTeam} vs ${awayTeam}`, league,
      prediction: p.prediction || '1X',
      odds: Math.round((p.odds || 1.70) * 100) / 100,
      confidence: Math.min(95, Math.max(60, p.confidence || 70)),
      reasoning: p.reasoning || 'Analisi tecnica.',
      sport: 'football',
      eventDate: new Date().toLocaleDateString('it-IT'),
      matchTime: time
    };
  } catch (e) { return null; }
}
