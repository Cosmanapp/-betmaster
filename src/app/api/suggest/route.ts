import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// ============================================
// CALENDARIO CALCIO EUROPEO 2025-2026
// Aggiornare ad agosto per nuova stagione
// ============================================

const CALENDAR_2025_2026 = {
  // SERIE A - Italia
  serieA: {
    name: "Serie A",
    country: "Italia",
    teams: ["Napoli", "Inter", "Atalanta", "Lazio", "Juventus", "Fiorentina", "Bologna", "Roma", "Milan", "Udinese", "Torino", "Genoa", "Verona", "Cagliari", "Parma", "Lecce", "Como", "Venezia", "Empoli", "Monza"],
    matches: [
      { home: "Napoli", away: "Inter", date: "2026-03-01", time: "20:45" },
      { home: "Atalanta", away: "Lazio", date: "2026-03-01", time: "18:00" },
      { home: "Juventus", away: "Fiorentina", date: "2026-03-02", time: "20:45" },
      { home: "Roma", away: "Milan", date: "2026-03-02", time: "18:00" },
      { home: "Bologna", away: "Udinese", date: "2026-03-02", time: "15:00" },
      { home: "Inter", away: "Atalanta", date: "2026-03-08", time: "20:45" },
      { home: "Lazio", away: "Roma", date: "2026-03-08", time: "18:00" },
      { home: "Milan", away: "Juventus", date: "2026-03-09", time: "20:45" },
      { home: "Fiorentina", away: "Bologna", date: "2026-03-09", time: "15:00" },
      { home: "Napoli", away: "Torino", date: "2026-03-09", time: "18:00" },
      { home: "Juventus", away: "Atalanta", date: "2026-03-15", time: "20:45" },
      { home: "Roma", away: "Napoli", date: "2026-03-15", time: "18:00" },
      { home: "Inter", away: "Milan", date: "2026-03-16", time: "20:45" },
      { home: "Lazio", away: "Fiorentina", date: "2026-03-16", time: "15:00" },
      { home: "Bologna", away: "Genoa", date: "2026-03-16", time: "18:00" },
      { home: "Torino", away: "Verona", date: "2026-03-22", time: "15:00" },
      { home: "Genoa", away: "Cagliari", date: "2026-03-22", time: "18:00" },
      { home: "Parma", away: "Lecce", date: "2026-03-23", time: "15:00" },
      { home: "Udinese", away: "Empoli", date: "2026-03-23", time: "18:00" },
      { home: "Venezia", away: "Monza", date: "2026-03-23", time: "20:45" },
    ]
  },

  // PREMIER LEAGUE - Inghilterra
  premierLeague: {
    name: "Premier League",
    country: "Inghilterra",
    teams: ["Liverpool", "Arsenal", "Manchester City", "Chelsea", "Newcastle", "Brighton", "Aston Villa", "Tottenham", "Manchester United", "Fulham", "Bournemouth", "Brentford", "West Ham", "Crystal Palace", "Wolves", "Everton", "Nottingham Forest", "Ipswich", "Leicester", "Southampton"],
    matches: [
      { home: "Liverpool", away: "Manchester City", date: "2026-03-01", time: "17:30" },
      { home: "Arsenal", away: "Chelsea", date: "2026-03-01", time: "15:00" },
      { home: "Tottenham", away: "Manchester United", date: "2026-03-01", time: "20:00" },
      { home: "Newcastle", away: "Brighton", date: "2026-03-01", time: "15:00" },
      { home: "Aston Villa", away: "Fulham", date: "2026-03-02", time: "14:00" },
      { home: "Manchester City", away: "Arsenal", date: "2026-03-08", time: "17:30" },
      { home: "Chelsea", away: "Tottenham", date: "2026-03-08", time: "15:00" },
      { home: "Manchester United", away: "Liverpool", date: "2026-03-09", time: "16:30" },
      { home: "Brighton", away: "Aston Villa", date: "2026-03-08", time: "15:00" },
      { home: "Newcastle", away: "West Ham", date: "2026-03-08", time: "20:00" },
      { home: "Arsenal", away: "Manchester United", date: "2026-03-15", time: "17:30" },
      { home: "Liverpool", away: "Newcastle", date: "2026-03-15", time: "15:00" },
      { home: "Tottenham", away: "Brighton", date: "2026-03-15", time: "15:00" },
      { home: "Chelsea", away: "Aston Villa", date: "2026-03-16", time: "14:00" },
      { home: "Manchester City", away: "Fulham", date: "2026-03-16", time: "16:30" },
      { home: "Wolves", away: "Everton", date: "2026-03-22", time: "15:00" },
      { home: "Brentford", away: "Bournemouth", date: "2026-03-22", time: "15:00" },
      { home: "Crystal Palace", away: "Ipswich", date: "2026-03-22", time: "15:00" },
      { home: "Nottingham Forest", away: "Leicester", date: "2026-03-23", time: "14:00" },
      { home: "Southampton", away: "West Ham", date: "2026-03-23", time: "16:30" },
    ]
  },

  // LA LIGA - Spagna
  laLiga: {
    name: "La Liga",
    country: "Spagna",
    teams: ["Real Madrid", "Barcelona", "Atletico Madrid", "Athletic Bilbao", "Villarreal", "Real Betis", "Real Sociedad", "Girona", "Sevilla", "Valencia", "Osasuna", "Celta Vigo", "Mallorca", "Getafe", "Rayo Vallecano", "Espanyol", "Alaves", "Leganes", "Las Palmas", "Valladolid"],
    matches: [
      { home: "Real Madrid", away: "Barcelona", date: "2026-03-01", time: "21:00" },
      { home: "Atletico Madrid", away: "Athletic Bilbao", date: "2026-03-01", time: "18:30" },
      { home: "Villarreal", away: "Real Betis", date: "2026-03-02", time: "14:00" },
      { home: "Real Sociedad", away: "Sevilla", date: "2026-03-02", time: "16:15" },
      { home: "Valencia", away: "Girona", date: "2026-03-02", time: "18:30" },
      { home: "Barcelona", away: "Atletico Madrid", date: "2026-03-08", time: "21:00" },
      { home: "Athletic Bilbao", away: "Real Madrid", date: "2026-03-08", time: "18:30" },
      { home: "Real Betis", away: "Real Sociedad", date: "2026-03-09", time: "14:00" },
      { home: "Sevilla", away: "Valencia", date: "2026-03-09", time: "16:15" },
      { home: "Girona", away: "Villarreal", date: "2026-03-09", time: "18:30" },
      { home: "Real Madrid", away: "Villarreal", date: "2026-03-15", time: "21:00" },
      { home: "Barcelona", away: "Real Sociedad", date: "2026-03-15", time: "18:30" },
      { home: "Atletico Madrid", away: "Sevilla", date: "2026-03-16", time: "14:00" },
      { home: "Athletic Bilbao", away: "Girona", date: "2026-03-16", time: "16:15" },
      { home: "Real Betis", away: "Valencia", date: "2026-03-16", time: "18:30" },
      { home: "Osasuna", away: "Celta Vigo", date: "2026-03-22", time: "14:00" },
      { home: "Mallorca", away: "Getafe", date: "2026-03-22", time: "16:15" },
      { home: "Rayo Vallecano", away: "Espanyol", date: "2026-03-22", time: "18:30" },
      { home: "Alaves", away: "Leganes", date: "2026-03-23", time: "14:00" },
      { home: "Las Palmas", away: "Valladolid", date: "2026-03-23", time: "18:30" },
    ]
  },

  // BUNDESLIGA - Germania
  bundesliga: {
    name: "Bundesliga",
    country: "Germania",
    teams: ["Bayern Monaco", "Bayer Leverkusen", "RB Lipsia", "Borussia Dortmund", "Eintracht Francoforte", "Wolfsburg", "Friburgo", "Mainz", "Borussia M'gladbach", "Stoccarda", "Hoffenheim", "Werder Brema", "Union Berlino", "Augusta", "Bochum", "Heidenheim", "St. Pauli", "Holstein Kiel"],
    matches: [
      { home: "Bayern Monaco", away: "Borussia Dortmund", date: "2026-03-01", time: "18:30" },
      { home: "Bayer Leverkusen", away: "RB Lipsia", date: "2026-03-01", time: "15:30" },
      { home: "Eintracht Francoforte", away: "Wolfsburg", date: "2026-03-01", time: "15:30" },
      { home: "Stoccarda", away: "Friburgo", date: "2026-03-02", time: "17:30" },
      { home: "Borussia M'gladbach", away: "Mainz", date: "2026-03-02", time: "15:30" },
      { home: "Borussia Dortmund", away: "Bayer Leverkusen", date: "2026-03-08", time: "18:30" },
      { home: "RB Lipsia", away: "Bayern Monaco", date: "2026-03-08", time: "15:30" },
      { home: "Wolfsburg", away: "Stoccarda", date: "2026-03-08", time: "15:30" },
      { home: "Friburgo", away: "Eintracht Francoforte", date: "2026-03-09", time: "17:30" },
      { home: "Mainz", away: "Hoffenheim", date: "2026-03-09", time: "15:30" },
      { home: "Bayern Monaco", away: "Eintracht Francoforte", date: "2026-03-15", time: "18:30" },
      { home: "Bayer Leverkusen", away: "Wolfsburg", date: "2026-03-15", time: "15:30" },
      { home: "Borussia Dortmund", away: "Friburgo", date: "2026-03-15", time: "15:30" },
      { home: "RB Lipsia", away: "Stoccarda", date: "2026-03-16", time: "17:30" },
      { home: "Hoffenheim", away: "Borussia M'gladbach", date: "2026-03-16", time: "15:30" },
      { home: "Werder Brema", away: "Union Berlino", date: "2026-03-22", time: "15:30" },
      { home: "Augusta", away: "Bochum", date: "2026-03-22", time: "15:30" },
      { home: "Heidenheim", away: "St. Pauli", date: "2026-03-22", time: "15:30" },
      { home: "Holstein Kiel", away: "Werder Brema", date: "2026-03-23", time: "17:30" },
    ]
  },

  // LIGUE 1 - Francia
  ligue1: {
    name: "Ligue 1",
    country: "Francia",
    teams: ["PSG", "Marsiglia", "Monaco", "Lilla", "Lione", "Nizza", "Lens", "Rennes", "Strasburgo", "Tolosa", "Nantes", "Auxerre", "Reims", "Montpellier", "Saint-Etienne", "Le Havre", "Angers", "Brest"],
    matches: [
      { home: "PSG", away: "Marsiglia", date: "2026-03-01", time: "20:45" },
      { home: "Monaco", away: "Lilla", date: "2026-03-01", time: "17:00" },
      { home: "Lione", away: "Nizza", date: "2026-03-02", time: "20:45" },
      { home: "Lens", away: "Rennes", date: "2026-03-02", time: "15:00" },
      { home: "Strasburgo", away: "Tolosa", date: "2026-03-02", time: "17:00" },
      { home: "Marsiglia", away: "Monaco", date: "2026-03-08", time: "20:45" },
      { home: "Lilla", away: "PSG", date: "2026-03-08", time: "17:00" },
      { home: "Nizza", away: "Lens", date: "2026-03-09", time: "15:00" },
      { home: "Rennes", away: "Lione", date: "2026-03-09", time: "17:00" },
      { home: "Tolosa", away: "Nantes", date: "2026-03-09", time: "20:45" },
      { home: "PSG", away: "Lione", date: "2026-03-15", time: "20:45" },
      { home: "Monaco", away: "Nizza", date: "2026-03-15", time: "17:00" },
      { home: "Marsiglia", away: "Rennes", date: "2026-03-16", time: "15:00" },
      { home: "Lens", away: "Lilla", date: "2026-03-16", time: "17:00" },
      { home: "Strasburgo", away: "Reims", date: "2026-03-16", time: "20:45" },
      { home: "Auxerre", away: "Montpellier", date: "2026-03-22", time: "15:00" },
      { home: "Saint-Etienne", away: "Le Havre", date: "2026-03-22", time: "17:00" },
      { home: "Angers", away: "Brest", date: "2026-03-22", time: "20:45" },
    ]
  }
};

// Ottieni TUTTE le partite del calendario
function getAllMatches(): any[] {
  const matches: any[] = [];
  
  for (const [leagueKey, league] of Object.entries(CALENDAR_2025_2026)) {
    for (const match of (league as any).matches) {
      matches.push({
        ...match,
        league: `${(league as any).country} - ${(league as any).name}`,
        leagueKey
      });
    }
  }
  
  return matches;
}

// Ottieni partite random dal calendario
function getRandomMatches(count: number): any[] {
  const allMatches = getAllMatches();
  
  // Mescola e prendi le prime 'count'
  const shuffled = allMatches.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport = 'football', count = 5, riskLevel = 'medium' } = body;

    console.log('[SUGGEST] Richiesta:', { sport, count, riskLevel });

    // Ottieni partite dal calendario (sempre disponibili)
    const allMatches = getAllMatches();
    const matchesToAnalyze = getRandomMatches(Math.min(10, count * 2));
    
    console.log('[SUGGEST] Partite totali:', allMatches.length);
    console.log('[SUGGEST] Partite da analizzare:', matchesToAnalyze.length);

    if (matchesToAnalyze.length === 0) {
      return NextResponse.json({
        success: false,
        suggestions: [],
        message: "Nessuna partita disponibile nel calendario"
      });
    }

    // Usa AI per analizzare le partite
    const zai = await ZAI.create();
    
    const systemPrompt = `Sei un esperto analista di scommesse sportive calcistiche.
Analizza le partite fornite e dai pronostici basati su:
- Forza storica delle squadre
- Forma recente stimata
- Fattore casa
- Importanza della partita

Rispondi SOLO con un array JSON valido, niente altro testo.

Formato RICHIESTO:
[{"event":"Squadra A vs Squadra B","prediction":"1","odds":1.85,"confidence":75,"reasoning":"Analisi breve","league":"Serie A","matchTime":"2026-03-01 20:45"}]

Tipi di prediction:
- "1" = vittoria casa
- "X" = pareggio  
- "2" = vittoria trasferta
- "1X" = casa o pareggio
- "X2" = pareggio o trasferta
- "GG" = entrambi segnano
- "NG" = almeno una non segna
- "Over 2.5" = piu di 2.5 gol
- "Under 2.5" = meno di 2.5 gol

La confidence deve essere tra 60 e 85.
Le odds devono essere realistiche (tra 1.30 e 3.50).`;

    const matchesText = matchesToAnalyze
      .map(m => `- ${m.home} vs ${m.away} | ${m.league} | ${m.date} ore ${m.time}`)
      .join('\n');

    const userPrompt = `Analizza queste partite e fornisci esattamente ${count} pronostici:

 ${matchesText}

Rispondi SOLO con JSON array di ${count} elementi:`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.8,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content || '';
      console.log('[SUGGEST] AI risposta:', responseText.substring(0, 300));
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        
        // Valida suggerimenti
        const validSuggestions = suggestions
          .filter((s: any) => s.event && s.prediction)
          .map((s: any) => ({
            event: s.event || 'Partita',
            sport: 'football',
            prediction: s.prediction || '1X',
            odds: Math.round((s.odds || 1.65) * 100) / 100,
            confidence: Math.min(85, Math.max(60, s.confidence || 65)),
            reasoning: s.reasoning || 'Analisi AI',
            league: s.league || '',
            matchTime: s.matchTime || ''
          }));
        
        console.log('[SUGGEST] Suggerimenti validi:', validSuggestions.length);
        
        if (validSuggestions.length >= count) {
          return NextResponse.json({
            success: true,
            suggestions: validSuggestions.slice(0, count),
            calendarInfo: {
              season: "2025-2026",
              totalMatches: allMatches.length
            }
          });
        }
      }
    } catch (aiError) {
      console.error('[SUGGEST] Errore AI:', aiError);
    }

    // Fallback: partite con pronostici base
    const fallbackSuggestions = matchesToAnalyze.slice(0, count).map(m => ({
      event: `${m.home} vs ${m.away}`,
      sport: 'football',
      prediction: '1X',
      odds: 1.65,
      confidence: 60,
      reasoning: `Partita di ${m.league}. Pronostico conservativo.`,
      league: m.league,
      matchTime: `${m.date} ${m.time}`
    }));

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      calendarInfo: {
        season: "2025-2026",
        totalMatches: allMatches.length
      }
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

// Endpoint GET per vedere il calendario completo
export async function GET() {
  const allMatches = getAllMatches();
  
  return NextResponse.json({
    season: "2025-2026",
    lastUpdate: "Marzo 2026",
    note: "Aggiornare ad agosto 2026 per la nuova stagione",
    totalMatches: allMatches.length,
    leagues: Object.keys(CALENDAR_2025_2026),
    matches: allMatches
  });
}
