import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport = 'football', count = 5, riskLevel = 'medium' } = body;
    const now = new Date();
    const todayStr = now.toLocaleDateString('it-IT');
    
    const matches = await searchEuropeanMatches(now);
    
    if (matches.length === 0) {
      return NextResponse.json({
        success: true, suggestions: [{ event: '📅 Nessuna partita', league: 'Riprova', prediction: '--', odds: 0, confidence: 0, reasoning: `Nessuna partita per ${todayStr}.`, sport, eventDate: todayStr }],
        totalFound: 0, source: 'no_matches'
      });
    }
    
    const upcoming = filterUpcomingMatches(matches, now);
    
    if (upcoming.length === 0) {
      return NextResponse.json({
        success: true, suggestions: [{ event: '⏰ Partite già iniziate', league: 'Domani', prediction: '--', odds: 0, confidence: 0, reasoning: 'Tutte già iniziate.', sport, eventDate: todayStr }],
        totalFound: matches.length, source: 'all_started'
      });
    }
    
    const suggestions = [];
    for (const m of upcoming.slice(0, count + 3)) {
      const a = await analyzeMatchExpert(m);
      if (a) suggestions.push(a);
    }
    
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    if (suggestions.length === 0) {
      return NextResponse.json({
        success: true, suggestions: upcoming.slice(0, count).map(m => ({
          event: `${m.homeTeam} vs ${m.awayTeam}`, league: m.league, prediction: predictBasic(m),
          odds: 1.70, confidence: 65, reasoning: `${m.homeTeam} vs ${m.awayTeam} in ${m.league} alle ${m.time}.`,
          sport: 'football', eventDate: todayStr, matchTime: m.time
        })),
        totalFound: upcoming.length, source: 'web-search'
      });
    }
    
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
    
    const queries = [
      `Serie A matches today ${day} ${month} 2026 kickoff times`,
      `Premier League matches today ${day} ${month} 2026 kickoff`,
      `La Liga matches today ${day} ${month} 2026 kickoff`,
      `Bundesliga matches ${day} ${month} 2026 kickoff`,
      `Ligue 1 matches ${day} ${month} 2026 kickoff`,
      `Champions League matches ${day} ${month} 2026`
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
      // "Team vs Team at 20:45"
      /([A-Za-z][a-z\s]+)\s+vs\.?\s+([A-Za-z][a-z\s]+)\s+(?:at|,)\s*(\d{1,2}):(\d{2})/gi,
      // "Team versus Team kick off 14:00"
      /([A-Za-z][a-z\s]+)\s+versus\s+([A-Za-z][a-z\s]+)\s+.*?(\d{1,2}):(\d{2})/gi,
      // "20:45 CET Team vs Team"
      /(\d{1,2}):(\d{2})\s*(?:CET|GMT|BST)?\s*([A-Za-z][a-z\s]+)\s+vs\.?\s+([A-Za-z][a-z\s]+)/gi,
      // Italiano: "ore 15.00: Squadra-Squadra"
      /ore\s*(\d{1,2})[.:](\d{2})\s*[:\-]?\s*([A-Za-z][a-zàèéìòù\s]+)\s*[-–]\s*([A-Za-z][a-zàèéìòù\s]+)/gi,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let hour: number, minute: number, homeTeam: string, awayTeam: string;
        
        if (match[1] && match[1].length <= 2 && !isNaN(parseInt(match[1])) && parseInt(match[1]) <= 23) {
          hour = parseInt(match[1]); minute = parseInt(match[2]);
          homeTeam = match[3].trim(); awayTeam = match[4].trim();
        } else {
          homeTeam = match[1].trim(); awayTeam = match[2].trim();
          hour = parseInt(match[3]); minute = parseInt(match[4]);
        }
        
        if (isNaN(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59) continue;
        if (!homeTeam || !awayTeam || homeTeam.length < 3 || awayTeam.length < 3) continue;
        
        // Pulisci
        homeTeam = homeTeam.replace(/\s+(will|be|on|at|live|CET|GMT).*$/i, '').trim();
        awayTeam = awayTeam.replace(/\s+(will|be|on|at|live|CET|GMT).*$/i, '').trim();
        
        let league = 'Europeo';
        const ctx = text.toLowerCase();
        if (ctx.includes('serie a') || ctx.includes('italian')) league = 'Serie A';
        else if (ctx.includes('premier') || ctx.includes('english')) league = 'Premier League';
        else if (ctx.includes('la liga') || ctx.includes('spanish')) league = 'La Liga';
        else if (ctx.includes('bundesliga') || ctx.includes('german')) league = 'Bundesliga';
        else if (ctx.includes('ligue 1') || ctx.includes('french')) league = 'Ligue 1';
        else if (ctx.includes('champions')) league = 'Champions League';
        
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

async function analyzeMatchExpert(m: any): Promise<any | null> {
  const GROQ_API_KEY = process.env.GROQ_API_KEY;
  if (!GROQ_API_KEY) return null;
  
  const { homeTeam, awayTeam, league, time } = m;
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${GROQ_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Esperto calcio 30 anni. Analisi onesta. JSON.' },
          { role: 'user', content: `${homeTeam} vs ${awayTeam} (${league}). Valuta forza, forma, motivazioni. JSON: {"prediction":"1","odds":1.4,"confidence":80,"reasoning":"Analisi"}` }
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
