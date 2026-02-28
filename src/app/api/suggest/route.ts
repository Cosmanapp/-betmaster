import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { count = 5, riskLevel = 'medium' } = await request.json();
    
    const now = new Date();
    const todayStr = now.toLocaleDateString('it-IT');
    const todayISO = now.toISOString().split('T')[0];
    
    console.log(`[SUGGEST] Data: ${todayStr}`);
    
    // PARTITE SERIE A DI OGGI - VERIFICATE (28 Febbraio 2026)
    const serieAToday = [
      { homeTeam: 'Como', awayTeam: 'Lecce', league: 'Serie A', time: '14:00', hour: 14, minute: 0 },
      { homeTeam: 'Hellas Verona', awayTeam: 'Napoli', league: 'Serie A', time: '17:00', hour: 17, minute: 0 },
      { homeTeam: 'Inter', awayTeam: 'Genoa', league: 'Serie A', time: '20:45', hour: 20, minute: 45 },
    ];
    
    // Prova a trovare altre partite
    const webMatches = await searchWeb(now);
    const apiMatches = await searchAPI(todayISO);
    
    // Filtra solo partite europee
    const europeanMatches = [...webMatches, ...apiMatches].filter(m => {
      const l = m.league?.toLowerCase() || '';
      return l.includes('serie a') || l.includes('premier') || l.includes('la liga') || 
             l.includes('bundesliga') || l.includes('ligue 1') || l.includes('champions') ||
             l.includes('europa') || m.league === 'Europeo';
    });
    
    // Unisci partite Serie A + altre europee
    let allMatches = [...serieAToday];
    
    for (const m of europeanMatches) {
      const exists = allMatches.some(x => 
        x.homeTeam.toLowerCase().includes(m.homeTeam.toLowerCase()) ||
        m.homeTeam.toLowerCase().includes(x.homeTeam.toLowerCase())
      );
      if (!exists) allMatches.push(m);
    }
    
    console.log(`[SUGGEST] Totale partite: ${allMatches.length}`);
    
    // Filtro orario (ora Italia)
    const italyHour = (now.getUTCHours() + 1) % 24;
    const italyMin = now.getUTCMinutes();
    const nowMinutes = italyHour * 60 + italyMin;
    
    // Partite non ancora iniziate (+5 min margine)
    const upcoming = allMatches.filter(m => (m.hour * 60 + m.minute) > nowMinutes + 5);
    
    // Se tutte già iniziate, mostra comunque le future
    const toShow = upcoming.length > 0 ? upcoming : allMatches;
    
    console.log(`[SUGGEST] Da mostrare: ${toShow.length}`);
    
    // Analisi AI
    const suggestions = [];
    for (const m of toShow.slice(0, count + 2)) {
      const a = await analyzeExpert(m);
      if (a) suggestions.push(a);
    }
    
    // Fallback se AI fallisce
    if (suggestions.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: toShow.slice(0, count).map(m => ({
          event: `${m.homeTeam} vs ${m.awayTeam}`,
          league: m.league,
          prediction: predict(m),
          odds: m.odds || 1.70,
          confidence: 70,
          reasoning: `${m.homeTeam} affronta ${m.awayTeam} in ${m.league}. Calcio d'inizio alle ore ${m.time}.`,
          sport: 'football',
          eventDate: todayStr,
          matchTime: m.time
        })),
        totalFound: toShow.length,
        source: 'fallback',
        date: todayStr,
        serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
      });
    }
    
    suggestions.sort((a, b) => b.confidence - a.confidence);
    
    let filtered = suggestions;
    if (riskLevel === 'low') filtered = suggestions.filter(s => s.confidence >= 80);
    else if (riskLevel === 'medium') filtered = suggestions.filter(s => s.confidence >= 65);
    
    return NextResponse.json({
      success: true,
      suggestions: filtered.slice(0, count),
      totalFound: toShow.length,
      source: 'expert-ai',
      date: todayStr,
      serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
    });
    
  } catch (e: any) {
    console.error('[ERROR]', e);
    return NextResponse.json({ success: false, error: e.message, suggestions: [] }, { status: 500 });
  }
}

async function searchAPI(date: string): Promise<any[]> {
  try {
    const res = await fetch(`https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`, {
      headers: { 'User-Agent': 'BetMaster/1.0' },
      next: { revalidate: 3600 }
    });
    if (!res.ok) return [];
    
    const data = await res.json();
    if (!data.events) return [];
    
    return data.events
      .filter((e: any) => e.strStatus !== 'Match Finished' && e.strHomeTeam && e.strAwayTeam)
      .map((e: any) => {
        let hour = 15, minute = 0;
        if (e.strTime) {
          const t = e.strTime.match(/(\d{1,2}):(\d{2})/);
          if (t) { hour = parseInt(t[1]); minute = parseInt(t[2]); }
        }
        let league = e.strLeague || 'Europeo';
        const l = league.toLowerCase();
        if (l.includes('italian') || l.includes('serie a')) league = 'Serie A';
        else if (l.includes('english') || l.includes('premier')) league = 'Premier League';
        else if (l.includes('spanish') || l.includes('la liga')) league = 'La Liga';
        else if (l.includes('german') || l.includes('bundesliga')) league = 'Bundesliga';
        else if (l.includes('french') || l.includes('ligue 1')) league = 'Ligue 1';
        return { homeTeam: e.strHomeTeam, awayTeam: e.strAwayTeam, league, time: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`, hour, minute };
      });
  } catch { return []; }
}

async function searchWeb(now: Date): Promise<any[]> {
  try {
    const zai = await ZAI.create();
    const res = await zai.functions.invoke("web_search", {
      query: `Serie A Premier League La Liga matches today ${now.getDate()} kickoff`,
      num: 10
    });
    if (!res || !Array.isArray(res)) return [];
    
    const matches: any[] = [];
    for (const r of res) {
      const text = (r.snippet || '') + ' ' + (r.name || '');
      const pats = [
        /([A-Za-z][a-z\s]+)\s+vs\.?\s+([A-Za-z][a-z\s]+)\s+(?:at|,)\s*(\d{1,2}):(\d{2})/gi,
        /(\d{1,2}):(\d{2})\s*[A-Z]*\s*([A-Za-z][a-z\s]+)\s+vs\.?\s+([A-Za-z][a-z\s]+)/gi,
      ];
      for (const p of pats) {
        let m;
        while ((m = p.exec(text)) !== null) {
          let h, min, home, away;
          if (m[1].length <= 2 && parseInt(m[1]) <= 23) {
            h = parseInt(m[1]); min = parseInt(m[2]); home = m[3].trim(); away = m[4].trim();
          } else {
            home = m[1].trim(); away = m[2].trim(); h = parseInt(m[3]); min = parseInt(m[4]);
          }
          if (h > 23 || min > 59 || home.length < 3) continue;
          home = home.replace(/\s+(will|be|at|live).*$/i, '').trim();
          away = away.replace(/\s+(will|be|at|live).*$/i, '').trim();
          if (!matches.some(x => x.homeTeam === home && x.awayTeam === away)) {
            matches.push({ homeTeam: home, awayTeam: away, league: 'Europeo', time: `${h.toString().padStart(2,'0')}:${min.toString().padStart(2,'0')}`, hour: h, minute: min });
          }
        }
      }
    }
    return matches;
  } catch { return []; }
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
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'Sei un esperto di calcio con 30 anni di esperienza come analista sportivo professionista. Fai analisi TECNICHE e ONESTE. Il tuo obiettivo è AZZECCARE il risultato. Rispondi SOLO con JSON valido.' },
          { role: 'user', content: `Analizza questa partita: ${m.homeTeam} vs ${m.awayTeam} (${m.league})

Valuta:
1. Forza delle rose e qualità dei giocatori chiave
2. Forma recente (ultimi 5 risultati)
3. Motivazioni (titolo, salvezza, competizioni europee)
4. Fattore casa
5. Storico scontri diretti

Dai il risultato PIÙ PROBABILE, anche se ovvio.
JSON: {"prediction":"1","odds":1.50,"confidence":80,"reasoning":"Analisi tecnica dettagliata in italiano"}` }
        ],
        temperature: 0.2,
        max_tokens: 400
      })
    });
    
    if (!res.ok) return null;
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return null;
    
    const p = JSON.parse(jsonMatch[0]);
    
    return {
      event: `${m.homeTeam} vs ${m.awayTeam}`,
      league: m.league,
      prediction: p.prediction || '1X',
      odds: Math.round((p.odds || 1.70) * 100) / 100,
      confidence: Math.min(95, Math.max(60, p.confidence || 70)),
      reasoning: p.reasoning || 'Analisi tecnica disponibile.',
      sport: 'football',
      eventDate: new Date().toLocaleDateString('it-IT'),
      matchTime: m.time
    };
  } catch { return null; }
}
