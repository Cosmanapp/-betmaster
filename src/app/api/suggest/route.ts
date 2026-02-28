import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { count = 5, riskLevel = 'medium' } = body;
    const now = new Date();
    const todayStr = now.toLocaleDateString('it-IT');
    const todayISO = now.toISOString().split('T')[0];
    
    let matches: any[] = [];
    let source = '';
    
    // 1. Web Search
    matches = await searchWeb(now);
    if (matches.length > 0) source = 'web-search';
    
    // 2. TheSportsDB API (gratuita!)
    if (matches.length === 0) {
      matches = await searchAPI(todayISO);
      if (matches.length > 0) source = 'thesportsdb';
    }
    
    // 3. Fallback emergenza
    if (matches.length === 0) {
      matches = getFallback(now);
      if (matches.length > 0) source = 'fallback';
    }
    
    if (matches.length === 0) {
      return NextResponse.json({ success: true, suggestions: [{ event: '📅 Nessuna partita', league: 'Riprova', prediction: '--', odds: 0, confidence: 0, reasoning: 'Nessuna partita oggi.', sport: 'football', eventDate: todayStr }], totalFound: 0, source: 'none' });
    }
    
    const upcoming = filterUpcoming(matches, now);
    
    if (upcoming.length === 0) {
      return NextResponse.json({ success: true, suggestions: [{ event: '⏰ Partite già iniziate', league: 'Domani', prediction: '--', odds: 0, confidence: 0, reasoning: 'Tutte già iniziate.', sport: 'football', eventDate: todayStr }], totalFound: matches.length, source: 'started' });
    }
    
    const suggestions = [];
    for (const m of upcoming.slice(0, count + 2)) {
      const a = await analyzeExpert(m);
      if (a) suggestions.push(a);
    }
    
    if (suggestions.length === 0) {
      return NextResponse.json({ success: true, suggestions: upcoming.slice(0, count).map(m => ({ event: `${m.homeTeam} vs ${m.awayTeam}`, league: m.league, prediction: predict(m), odds: 1.7, confidence: 65, reasoning: `${m.homeTeam} vs ${m.awayTeam} in ${m.league}.`, sport: 'football', eventDate: todayStr, matchTime: m.time })), totalFound: upcoming.length, source: source });
    }
    
    suggestions.sort((a, b) => b.confidence - a.confidence);
    let filtered = suggestions;
    if (riskLevel === 'low') filtered = suggestions.filter(s => s.confidence >= 80);
    else if (riskLevel === 'medium') filtered = suggestions.filter(s => s.confidence >= 65);
    
    return NextResponse.json({ success: true, suggestions: filtered.slice(0, count), totalFound: upcoming.length, source, date: todayStr });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e.message, suggestions: [] }, { status: 500 });
  }
}

// TheSportsDB - API pubblica gratuita
async function searchAPI(date: string): Promise<any[]> {
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`, { next: { revalidate: 3600 } });
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.events) return [];
    
    return data.events.filter((e: any) => e.strStatus !== 'Match Finished' && e.strStatus !== 'Cancelled').map((e: any) => {
      let hour = 15, minute = 0;
      if (e.strTime) { const t = e.strTime.match(/(\d{1,2}):(\d{2})/); if (t) { hour = parseInt(t[1]); minute = parseInt(t[2]); } }
      let league = e.strLeague || 'Europeo';
      if (league.includes('Italian')) league = 'Serie A';
      else if (league.includes('English')) league = 'Premier League';
      else if (league.includes('Spanish')) league = 'La Liga';
      else if (league.includes('German')) league = 'Bundesliga';
      else if (league.includes('French')) league = 'Ligue 1';
      return { homeTeam: e.strHomeTeam, awayTeam: e.strAwayTeam, league, time: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`, hour, minute };
    });
  } catch { return []; }
}

// Web Search
async function searchWeb(now: Date): Promise<any[]> {
  try {
    const zai = await ZAI.create();
    const res = await zai.functions.invoke("web_search", { query: `Serie A Premier League matches today ${now.getDate()} ${now.toLocaleString('en-EN', {month: 'long'})} kickoff`, num: 10 });
    if (!res || !Array.isArray(res)) return [];
    const matches: any[] = [];
    for (const r of res) {
      const text = (r.snippet || '') + ' ' + (r.name || '');
      const pats = [/([A-Za-z][a-z\s]+)\s+vs\.?\s+([A-Za-z][a-z\s]+)\s+(?:at|,)\s*(\d{1,2}):(\d{2})/gi, /(\d{1,2}):(\d{2})\s*[A-Z]*\s*([A-Za-z][a-z\s]+)\s+vs\.?\s+([A-Za-z][a-z\s]+)/gi];
      for (const p of pats) { let m; while ((m = p.exec(text)) !== null) {
        let h, min, home, away;
        if (m[1].length <= 2 && parseInt(m[1]) <= 23) { h = parseInt(m[1]); min = parseInt(m[2]); home = m[3].trim(); away = m[4].trim(); }
        else { home = m[1].trim(); away = m[2].trim(); h = parseInt(m[3]); min = parseInt(m[4]); }
        if (h > 23 || min > 59 || home.length < 3) continue;
        home = home.replace(/\s+(will|be|at|live|CET).*$/i, '').trim();
        away = away.replace(/\s+(will|be|at|live|CET).*$/i, '').trim();
        if (!matches.some(x => x.homeTeam === home && x.awayTeam === away)) matches.push({ homeTeam: home, awayTeam: away, league: 'Serie A', time: `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`, hour: h, minute: min });
      }}
    }
    return matches;
  } catch { return []; }
}

// Fallback emergenza
function getFallback(now: Date): any[] {
  const d = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;
  const data: Record<string, any[]> = {
    '28/2/2026': [{ homeTeam: 'Como', awayTeam: 'Lecce', league: 'Serie A', time: '14:00', hour: 14, minute: 0 }, { homeTeam: 'Hellas Verona', awayTeam: 'Napoli', league: 'Serie A', time: '17:00', hour: 17, minute: 0 }, { homeTeam: 'Inter', awayTeam: 'Genoa', league: 'Serie A', time: '20:45', hour: 20, minute: 45 }],
    '1/3/2026': [{ homeTeam: 'Torino', awayTeam: 'Monza', league: 'Serie A', time: '12:30', hour: 12, minute: 30 }, { homeTeam: 'Lazio', awayTeam: 'Milan', league: 'Serie A', time: '15:00', hour: 15, minute: 0 }],
  };
  return data[d] || [];
}

function filterUpcoming(m: any[], now: Date): any[] {
  const cur = now.getHours() * 60 + now.getMinutes();
  return m.filter(x => x.hour * 60 + x.minute > cur + 5).sort((a, b) => (a.hour * 60 + a.minute) - (b.hour * 60 + b.minute));
}

function predict(m: any): string {
  const strong = ['napoli', 'inter', 'juventus', 'milan', 'atalanta', 'arsenal', 'liverpool', 'real madrid', 'barcelona', 'bayern', 'psg'];
  const h = m.homeTeam.toLowerCase(), a = m.awayTeam.toLowerCase();
  if (strong.some(t => h.includes(t)) && !strong.some(t => a.includes(t))) return '1';
  if (strong.some(t => a.includes(t)) && !strong.some(t => h.includes(t))) return 'X2';
  if (strong.some(t => h.includes(t)) && strong.some(t => a.includes(t))) return 'GG';
  return '1X';
}

async function analyzeExpert(m: any): Promise<any | null> {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) return null;
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'llama-3.3-70b-versatile', messages: [{ role: 'system', content: 'Esperto calcio. JSON solo.' }, { role: 'user', content: `${m.homeTeam} vs ${m.awayTeam} (${m.league}). Valuta forza, forma, motivazioni. JSON: {"prediction":"1","odds":1.4,"confidence":80,"reasoning":"Analisi"}` }], temperature: 0.2 })
    });
    const data = await res.json();
    const j = (data.choices?.[0]?.message?.content || '').match(/\{[\s\S]*?\}/);
    if (!j) return null;
    const p = JSON.parse(j[0]);
    return { event: `${m.homeTeam} vs ${m.awayTeam}`, league: m.league, prediction: p.prediction || '1X', odds: Math.round((p.odds || 1.7) * 100) / 100, confidence: Math.min(95, Math.max(60, p.confidence || 70)), reasoning: p.reasoning || 'Analisi AI.', sport: 'football', eventDate: new Date().toLocaleDateString('it-IT'), matchTime: m.time };
  } catch { return null; }
}
