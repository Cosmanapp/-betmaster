import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const { count = 5, riskLevel = 'medium' } = await request.json();
    
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const todayStr = now.toLocaleDateString('it-IT');
    
    // Ora Italia (UTC+1)
    const italyHour = (now.getUTCHours() + 1) % 24;
    const italyMin = now.getUTCMinutes();
    const nowMinutes = italyHour * 60 + italyMin;
    
    console.log(`[SUGGEST] Data: ${todayISO}, Ora Italia: ${italyHour}:${italyMin}`);
    
    // 1. CERCA TUTTE LE PARTITE EUROPEE DI OGGI
    const [apiMatches, webMatches] = await Promise.all([
      searchTheSportsDB(todayISO),
      searchWebMatches(now)
    ]);
    
    // Unisci e rimuovi duplicati
    let allMatches = [...apiMatches];
    for (const m of webMatches) {
      const exists = allMatches.some(x => 
        teamsMatch(x.homeTeam, m.homeTeam) && teamsMatch(x.awayTeam, m.awayTeam)
      );
      if (!exists) allMatches.push(m);
    }
    
    console.log(`[SUGGEST] Totale partite trovate: ${allMatches.length}`);
    
    // 2. FILTRA SOLO PARTITE NON ANCORA INIZIATE (+5 min margine)
    const upcomingMatches = allMatches.filter(m => {
      const matchMinutes = m.hour * 60 + m.minute;
      return matchMinutes > nowMinutes + 5;
    });
    
    console.log(`[SUGGEST] Partite non ancora iniziate: ${upcomingMatches.length}`);
    
    if (upcomingMatches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        totalFound: 0,
        message: 'Nessuna partita disponibile al momento. Riprova più tardi.',
        date: todayStr,
        serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
      });
    }
    
    // 3. AI ANALIZZA OGNI PARTITA
    const analyzedMatches = [];
    
    for (const match of upcomingMatches) {
      console.log(`[SUGGEST] Analizzo: ${match.homeTeam} vs ${match.awayTeam}`);
      const analysis = await analyzeMatchWithAI(match);
      
      if (analysis) {
        analyzedMatches.push({
          ...analysis,
          matchTime: match.time
        });
      }
    }
    
    console.log(`[SUGGEST] Partite analizzate: ${analyzedMatches.length}`);
    
    // 4. FILTRA PER CONFIDENCE MINIMA
    let minConfidence = 70;
    if (riskLevel === 'low') minConfidence = 80;
    if (riskLevel === 'high') minConfidence = 60;
    
    const highConfidenceMatches = analyzedMatches.filter(m => m.confidence >= minConfidence);
    
    // 5. ORDINA PER CONFIDENCE (PIÙ ALTA IN CIMA)
    highConfidenceMatches.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`[SUGGEST] Partite con confidence >= ${minConfidence}%: ${highConfidenceMatches.length}`);
    
    return NextResponse.json({
      success: true,
      suggestions: highConfidenceMatches.slice(0, count),
      totalFound: upcomingMatches.length,
      totalAnalyzed: analyzedMatches.length,
      source: 'ai-expert',
      date: todayStr,
      serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
    });
    
  } catch (e: any) {
    console.error('[ERROR]', e);
    return NextResponse.json({ 
      success: false, 
      error: e.message, 
      suggestions: [] 
    }, { status: 500 });
  }
}

// Confronta nomi squadre (gestisce variazioni)
function teamsMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '').substring(0, 5);
  return normalize(a) === normalize(b);
}

// Cerca su TheSportsDB (API gratuita)
async function searchTheSportsDB(date: string): Promise<any[]> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/eventsday.php?d=${date}&s=Soccer`,
      { headers: { 'User-Agent': 'BetMaster/2.0' }, next: { revalidate: 3600 } }
    );
    
    if (!res.ok) return [];
    const data = await res.json();
    if (!data.events) return [];
    
    const europeanLeagues = [
      'Serie A', 'Italian Serie A', 'Italian Cup', 'Coppa Italia',
      'Premier League', 'English Premier League', 'FA Cup', 'EFL Cup',
      'La Liga', 'Spanish La Liga', 'Copa del Rey',
      'Bundesliga', 'German Bundesliga', 'DFB-Pokal',
      'Ligue 1', 'French Ligue 1', 'Coupe de France',
      'UEFA Champions League', 'Champions League',
      'UEFA Europa League', 'Europa League',
      'UEFA Conference League', 'Conference League',
      'Championship', 'EFL Championship'
    ];
    
    return data.events
      .filter((e: any) => {
        if (e.strStatus === 'Match Finished') return false;
        if (!e.strHomeTeam || !e.strAwayTeam) return false;
        
        const league = (e.strLeague || '').toLowerCase();
        return europeanLeagues.some(l => league.includes(l.toLowerCase()));
      })
      .map((e: any) => {
        let hour = 15, minute = 0;
        if (e.strTime) {
          const t = e.strTime.match(/(\d{1,2}):(\d{2})/);
          if (t) { hour = parseInt(t[1]); minute = parseInt(t[2]); }
        }
        
        let league = e.strLeague || 'Europeo';
        const l = league.toLowerCase();
        if (l.includes('serie a') || l.includes('italian')) league = 'Serie A';
        else if (l.includes('premier') || l.includes('english')) league = 'Premier League';
        else if (l.includes('la liga') || l.includes('spanish')) league = 'La Liga';
        else if (l.includes('bundesliga') || l.includes('german')) league = 'Bundesliga';
        else if (l.includes('ligue 1') || l.includes('french')) league = 'Ligue 1';
        else if (l.includes('champions')) league = 'Champions League';
        else if (l.includes('europa')) league = 'Europa League';
        else if (l.includes('conference')) league = 'Conference League';
        
        return {
          homeTeam: e.strHomeTeam,
          awayTeam: e.strAwayTeam,
          league,
          time: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`,
          hour,
          minute
        };
      });
  } catch (e) {
    console.error('[TheSportsDB Error]', e);
    return [];
  }
}

// Cerca sul web partite di oggi
async function searchWebMatches(now: Date): Promise<any[]> {
  try {
    const zai = await ZAI.create();
    const res = await zai.functions.invoke("web_search", {
      query: `Serie A Premier League La Liga Bundesliga Ligue 1 Champions League matches today February ${now.getDate()} 2026 kickoff schedule`,
      num: 15
    });
    
    if (!res || !Array.isArray(res)) return [];
    
    const matches: any[] = [];
    
    for (const r of res) {
      const text = (r.snippet || '') + ' ' + (r.name || '');
      
      // Pattern per estrarre partite con orario
      const patterns = [
        /([A-Z][a-zA-Z\s]+)\s+vs\.?\s+([A-Z][a-zA-Z\s]+)\s+(?:at|,|-)\s*(\d{1,2}):(\d{2})/gi,
        /(\d{1,2}):(\d{2})\s*[-–]?\s*([A-Z][a-zA-Z\s]+)\s+vs\.?\s+([A-Z][a-zA-Z\s]+)/gi,
        /([A-Z][a-zA-Z\s]+)\s+[-–]\s+([A-Z][a-zA-Z\s]+)\s+(\d{1,2}):(\d{2})/gi,
      ];
      
      for (const pattern of patterns) {
        let m;
        while ((m = pattern.exec(text)) !== null) {
          let home, away, hour, minute;
          
          if (m[1] && m[1].length > 2 && parseInt(m[3]) <= 23) {
            home = m[1].trim();
            away = m[2].trim();
            hour = parseInt(m[3]);
            minute = parseInt(m[4]);
          } else if (parseInt(m[1]) <= 23) {
            hour = parseInt(m[1]);
            minute = parseInt(m[2]);
            home = m[3].trim();
            away = m[4].trim();
          }
          
          if (hour > 23 || minute > 59 || !home || !away) continue;
          if (home.length < 3 || away.length < 3) continue;
          
          // Pulisci nomi
          home = home.replace(/\s+(will|be|at|live|vs|match|game|fc|afc).*$/i, '').trim();
          away = away.replace(/\s+(will|be|at|live|vs|match|game|fc|afc).*$/i, '').trim();
          
          const exists = matches.some(x => teamsMatch(x.homeTeam, home) && teamsMatch(x.awayTeam, away));
          if (!exists) {
            matches.push({
              homeTeam: home,
              awayTeam: away,
              league: detectLeague(text),
              time: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`,
              hour,
              minute
            });
          }
        }
      }
    }
    
    return matches;
  } catch (e) {
    console.error('[WebSearch Error]', e);
    return [];
  }
}

// Rileva il campionato dal testo
function detectLeague(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('serie a') || t.includes('italian')) return 'Serie A';
  if (t.includes('premier league') || t.includes('english')) return 'Premier League';
  if (t.includes('la liga') || t.includes('spanish')) return 'La Liga';
  if (t.includes('bundesliga') || t.includes('german')) return 'Bundesliga';
  if (t.includes('ligue 1') || t.includes('french')) return 'Ligue 1';
  if (t.includes('champions league')) return 'Champions League';
  if (t.includes('europa league')) return 'Europa League';
  if (t.includes('conference league')) return 'Conference League';
  return 'Europeo';
}

// AI analizza la partita come esperto
async function analyzeMatchWithAI(match: any): Promise<any | null> {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) {
    console.log('[AI] GROQ_API_KEY non configurata');
    return getBasicAnalysis(match);
  }
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: `Sei un TOP ANALISTA SPORTIVO con 25 anni di esperienza in scommesse calcistiche. Il tuo lavoro è trovare le scommesse con ALTA PROBABILITÀ DI VINCITA.

REGOLE FONDAMENTALI:
1. Analizza OGNI partita oggettivamente - non fare il tifo
2. Considera: forma recente, classifica, infortuni, fattore casa, motivazioni
3. Assegna confidence REALISTICA (60-95%)
4. Se una partita è INCERTA, dillo (confidence 60-65%)
5. Se una partita è MOLTO PREVEDIBILE, assegna confidence alta (80-90%)

Rispondi SOLO con JSON valido, nient'altro.`
          },
          { 
            role: 'user', 
            content: `Analizza questa partita di ${match.league}:

 ${match.homeTeam} vs ${match.awayTeam}
Orario: ${match.time}

Fornisci:
1. Pronostico più probabile (1, X, 2, 1X, X2, GG, NG, Over2.5, Under2.5)
2. Quota indicativa realistica (1.10 - 5.00)
3. Confidence (60-95%) - QUANTO SEI SICURO CHE VINCI
4. Ragionamento tecnico breve

JSON: {"prediction":"1","odds":1.50,"confidence":80,"reasoning":"Analisi tecnica in italiano"}`
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });
    
    if (!res.ok) {
      console.log('[AI] Errore API Groq');
      return getBasicAnalysis(match);
    }
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    // Estrai JSON
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) {
      console.log('[AI] JSON non trovato nella risposta');
      return getBasicAnalysis(match);
    }
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      event: `${match.homeTeam} vs ${match.awayTeam}`,
      league: match.league,
      prediction: parsed.prediction || '1X',
      odds: Math.round((parsed.odds || 1.70) * 100) / 100,
      confidence: Math.min(95, Math.max(60, parsed.confidence || 70)),
      reasoning: parsed.reasoning || 'Analisi AI completata.',
      sport: 'football',
      eventDate: new Date().toLocaleDateString('it-IT')
    };
    
  } catch (e) {
    console.error('[AI Error]', e);
    return getBasicAnalysis(match);
  }
}

// Analisi di base se AI non disponibile
function getBasicAnalysis(match: any): any {
  const strongTeams = [
    'napoli', 'inter', 'juventus', 'milan', 'atalanta', 'lazio', 'roma',
    'manchester city', 'arsenal', 'liverpool', 'chelsea', 'tottenham', 'manchester united',
    'real madrid', 'barcelona', 'atletico madrid', 'real sociedad',
    'bayern munich', 'borussia dortmund', 'rb leipzig',
    'psg', 'monaco', 'marseille'
  ];
  
  const homeStrong = strongTeams.some(t => match.homeTeam.toLowerCase().includes(t));
  const awayStrong = strongTeams.some(t => match.awayTeam.toLowerCase().includes(t));
  
  let prediction = '1X';
  let odds = 1.80;
  let confidence = 65;
  
  if (homeStrong && !awayStrong) {
    prediction = '1';
    odds = 1.50;
    confidence = 75;
  } else if (awayStrong && !homeStrong) {
    prediction = 'X2';
    odds = 1.60;
    confidence = 70;
  } else if (homeStrong && awayStrong) {
    prediction = 'GG';
    odds = 1.70;
    confidence = 68;
  }
  
  return {
    event: `${match.homeTeam} vs ${match.awayTeam}`,
    league: match.league,
    prediction,
    odds,
    confidence,
    reasoning: `${match.homeTeam} affronta ${match.awayTeam} in ${match.league}. Analisi basata su forza storica delle squadre.`,
    sport: 'football',
    eventDate: new Date().toLocaleDateString('it-IT')
  };
}
