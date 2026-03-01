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
    country: "🇮🇹",
    teams: ["Napoli", "Inter", "Atalanta", "Lazio", "Juventus", "Fiorentina", "Bologna", "Roma", "Milan", "Udinese", "Torino", "Genoa", "Verona", "Cagliari", "Parma", "Lecce", "Como", "Venezia", "Empoli", "Monza"],
    upcomingMatches: [
      // Giornata 27 - Fine Febbraio/Inizio Marzo 2026
      { home: "Napoli", away: "Inter", date: "2026-03-01", time: "20:45" },
      { home: "Atalanta", away: "Lazio", date: "2026-03-01", time: "18:00" },
      { home: "Juventus", away: "Fiorentina", date: "2026-03-02", time: "20:45" },
      { home: "Roma", away: "Milan", date: "2026-03-02", time: "18:00" },
      { home: "Bologna", away: "Udinese", date: "2026-03-02", time: "15:00" },
      // Giornata 28
      { home: "Inter", away: "Atalanta", date: "2026-03-08", time: "20:45" },
      { home: "Lazio", away: "Roma", date: "2026-03-08", time: "18:00" },
      { home: "Milan", away: "Juventus", date: "2026-03-09", time: "20:45" },
      { home: "Fiorentina", away: "Bologna", date: "2026-03-09", time: "15:00" },
      { home: "Napoli", away: "Torino", date: "2026-03-09", time: "18:00" },
      // Giornata 29
      { home: "Juventus", away: "Atalanta", date: "2026-03-15", time: "20:45" },
      { home: "Roma", away: "Napoli", date: "2026-03-15", time: "18:00" },
      { home: "Inter", away: "Milan", date: "2026-03-16", time: "20:45" },
      { home: "Lazio", away: "Fiorentina", date: "2026-03-16", time: "15:00" },
      { home: "Bologna", away: "Genoa", date: "2026-03-16", time: "18:00" },
    ]
  },

  // PREMIER LEAGUE - Inghilterra
  premierLeague: {
    name: "Premier League",
    country: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
    teams: ["Liverpool", "Arsenal", "Manchester City", "Chelsea", "Newcastle", "Brighton", "Aston Villa", "Tottenham", "Manchester United", "Fulham", "Bournemouth", "Brentford", "West Ham", "Crystal Palace", "Wolves", "Everton", "Nottingham Forest", "Ipswich", "Leicester", "Southampton"],
    upcomingMatches: [
      // Gameweek 28
      { home: "Liverpool", away: "Manchester City", date: "2026-03-01", time: "17:30" },
      { home: "Arsenal", away: "Chelsea", date: "2026-03-01", time: "15:00" },
      { home: "Tottenham", away: "Manchester United", date: "2026-03-01", time: "20:00" },
      { home: "Newcastle", away: "Brighton", date: "2026-03-01", time: "15:00" },
      { home: "Aston Villa", away: "Fulham", date: "2026-03-02", time: "14:00" },
      // Gameweek 29
      { home: "Manchester City", away: "Arsenal", date: "2026-03-08", time: "17:30" },
      { home: "Chelsea", away: "Tottenham", date: "2026-03-08", time: "15:00" },
      { home: "Manchester United", away: "Liverpool", date: "2026-03-09", time: "16:30" },
      { home: "Brighton", away: "Aston Villa", date: "2026-03-08", time: "15:00" },
      { home: "Newcastle", away: "West Ham", date: "2026-03-08", time: "20:00" },
      // Gameweek 30
      { home: "Arsenal", away: "Manchester United", date: "2026-03-15", time: "17:30" },
      { home: "Liverpool", away: "Newcastle", date: "2026-03-15", time: "15:00" },
      { home: "Tottenham", away: "Brighton", date: "2026-03-15", time: "15:00" },
      { home: "Chelsea", away: "Aston Villa", date: "2026-03-16", time: "14:00" },
      { home: "Manchester City", away: "Fulham", date: "2026-03-16", time: "16:30" },
    ]
  },

  // LA LIGA - Spagna
  laLiga: {
    name: "La Liga",
    country: "🇪🇸",
    teams: ["Real Madrid", "Barcelona", "Atletico Madrid", "Athletic Bilbao", "Villarreal", "Real Betis", "Real Sociedad", "Girona", "Sevilla", "Valencia", "Osasuna", "Celta Vigo", "Mallorca", "Getafe", "Rayo Vallecano", "Espanyol", "Alaves", "Leganes", "Las Palmas", "Valladolid"],
    upcomingMatches: [
      // Jornada 27
      { home: "Real Madrid", away: "Barcelona", date: "2026-03-01", time: "21:00" },
      { home: "Atletico Madrid", away: "Athletic Bilbao", date: "2026-03-01", time: "18:30" },
      { home: "Villarreal", away: "Real Betis", date: "2026-03-02", time: "14:00" },
      { home: "Real Sociedad", away: "Sevilla", date: "2026-03-02", time: "16:15" },
      { home: "Valencia", away: "Girona", date: "2026-03-02", time: "18:30" },
      // Jornada 28
      { home: "Barcelona", away: "Atletico Madrid", date: "2026-03-08", time: "21:00" },
      { home: "Athletic Bilbao", away: "Real Madrid", date: "2026-03-08", time: "18:30" },
      { home: "Real Betis", away: "Real Sociedad", date: "2026-03-09", time: "14:00" },
      { home: "Sevilla", away: "Valencia", date: "2026-03-09", time: "16:15" },
      { home: "Girona", away: "Villarreal", date: "2026-03-09", time: "18:30" },
      // Jornada 29
      { home: "Real Madrid", away: "Villarreal", date: "2026-03-15", time: "21:00" },
      { home: "Barcelona", away: "Real Sociedad", date: "2026-03-15", time: "18:30" },
      { home: "Atletico Madrid", away: "Sevilla", date: "2026-03-16", time: "14:00" },
      { home: "Athletic Bilbao", away: "Girona", date: "2026-03-16", time: "16:15" },
      { home: "Real Betis", away: "Valencia", date: "2026-03-16", time: "18:30" },
    ]
  },

  // BUNDESLIGA - Germania
  bundesliga: {
    name: "Bundesliga",
    country: "🇩🇪",
    teams: ["Bayern Monaco", "Bayer Leverkusen", "RB Lipsia", "Borussia Dortmund", "Eintracht Francoforte", "Wolfsburg", "Friburgo", "Mainz", "Borussia M'gladbach", "Stoccarda", "Hoffenheim", "Werder Brema", "Union Berlino", "Augusta", "Bochum", "Heidenheim", "St. Pauli", "Holstein Kiel"],
    upcomingMatches: [
      // Spieltag 24
      { home: "Bayern Monaco", away: "Borussia Dortmund", date: "2026-03-01", time: "18:30" },
      { home: "Bayer Leverkusen", away: "RB Lipsia", date: "2026-03-01", time: "15:30" },
      { home: "Eintracht Francoforte", away: "Wolfsburg", date: "2026-03-01", time: "15:30" },
      { home: "Stoccarda", away: "Friburgo", date: "2026-03-02", time: "17:30" },
      { home: "Borussia M'gladbach", away: "Mainz", date: "2026-03-02", time: "15:30" },
      // Spieltag 25
      { home: "Borussia Dortmund", away: "Bayer Leverkusen", date: "2026-03-08", time: "18:30" },
      { home: "RB Lipsia", away: "Bayern Monaco", date: "2026-03-08", time: "15:30" },
      { home: "Wolfsburg", away: "Stoccarda", date: "2026-03-08", time: "15:30" },
      { home: "Friburgo", away: "Eintracht Francoforte", date: "2026-03-09", time: "17:30" },
      { home: "Mainz", away: "Hoffenheim", date: "2026-03-09", time: "15:30" },
      // Spieltag 26
      { home: "Bayern Monaco", away: "Eintracht Francoforte", date: "2026-03-15", time: "18:30" },
      { home: "Bayer Leverkusen", away: "Wolfsburg", date: "2026-03-15", time: "15:30" },
      { home: "Borussia Dortmund", away: "Friburgo", date: "2026-03-15", time: "15:30" },
      { home: "RB Lipsia", away: "Stoccarda", date: "2026-03-16", time: "17:30" },
      { home: "Hoffenheim", away: "Borussia M'gladbach", date: "2026-03-16", time: "15:30" },
    ]
  },

  // LIGUE 1 - Francia
  ligue1: {
    name: "Ligue 1",
    country: "🇫🇷",
    teams: ["PSG", "Marsiglia", "Monaco", "Lilla", "Lione", "Nizza", "Lens", "Rennes", "Strasburgo", "Tolosa", "Nantes", "Auxerre", "Reims", "Montpellier", "Saint-Etienne", "Le Havre", "Angers", "Brest"],
    upcomingMatches: [
      // Journée 25
      { home: "PSG", away: "Marsiglia", date: "2026-03-01", time: "20:45" },
      { home: "Monaco", away: "Lilla", date: "2026-03-01", time: "17:00" },
      { home: "Lione", away: "Nizza", date: "2026-03-02", time: "20:45" },
      { home: "Lens", away: "Rennes", date: "2026-03-02", time: "15:00" },
      { home: "Strasburgo", away: "Tolosa", date: "2026-03-02", time: "17:00" },
      // Journée 26
      { home: "Marsiglia", away: "Monaco", date: "2026-03-08", time: "20:45" },
      { home: "Lilla", away: "PSG", date: "2026-03-08", time: "17:00" },
      { home: "Nizza", away: "Lens", date: "2026-03-09", time: "15:00" },
      { home: "Rennes", away: "Lione", date: "2026-03-09", time: "17:00" },
      { home: "Tolosa", away: "Nantes", date: "2026-03-09", time: "20:45" },
      // Journée 27
      { home: "PSG", away: "Lione", date: "2026-03-15", time: "20:45" },
      { home: "Monaco", away: "Nizza", date: "2026-03-15", time: "17:00" },
      { home: "Marsiglia", away: "Rennes", date: "2026-03-16", time: "15:00" },
      { home: "Lens", away: "Lilla", date: "2026-03-16", time: "17:00" },
      { home: "Strasburgo", away: "Reims", date: "2026-03-16", time: "20:45" },
    ]
  }
};

// Ottieni partite imminenti (prossimi 7 giorni)
function getUpcomingMatches(days: number = 7): any[] {
  const matches: any[] = [];
  const today = new Date();
  const endDate = new Date(today);
  endDate.setDate(endDate.getDate() + days);
  
  for (const [leagueKey, league] of Object.entries(CALENDAR_2025_2026)) {
    for (const match of league.upcomingMatches) {
      const matchDate = new Date(match.date);
      if (matchDate >= today && matchDate <= endDate) {
        matches.push({
          ...match,
          league: `${(league as any).country} ${(league as any).name}`,
          leagueKey
        });
      }
    }
  }
  
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Ottieni tutte le partite della stagione
function getAllMatches(): any[] {
  const matches: any[] = [];
  
  for (const [leagueKey, league] of Object.entries(CALENDAR_2025_2026)) {
    for (const match of league.upcomingMatches) {
      matches.push({
        ...match,
        league: `${(league as any).country} ${(league as any).name}`,
        leagueKey
      });
    }
  }
  
  return matches.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sport = 'football', count = 5, riskLevel = 'medium' } = body;

    console.log('[SUGGEST] Richiesta:', { sport, count, riskLevel });

    // Ottieni partite dal calendario
    const upcomingMatches = getUpcomingMatches(7);
    const allMatches = getAllMatches();
    
    // Se non ci sono partite nei prossimi 7 giorni, usa tutte le partite
    const matchesToAnalyze = upcomingMatches.length > 0 ? upcomingMatches : allMatches.slice(0, 15);
    
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
- Forza delle squadre
- Forma recente
- Fattore casa
- Importanza della partita

Rispondi SOLO con un array JSON valido, niente altro testo.

Formato richiesto:
[{"event":"Squadra A vs Squadra B","prediction":"1","odds":1.85,"confidence":75,"reasoning":"Analisi breve","league":"Serie A","matchTime":"2026-03-01 20:45"}]

Tipi di prediction possibili:
- "1" = vittoria casa
- "X" = pareggio
- "2" = vittoria trasferta
- "1X" = casa o pareggio
- "X2" = pareggio o trasferta
- "GG" = entrambi segnano
- "NG" = almeno una non segna
- "Over 2.5" = più di 2.5 gol
- "Under 2.5" = meno di 2.5 gol

La confidence deve essere tra 50 e 90.
Le odds devono essere realistiche (tra 1.20 e 4.00).`;

    const matchesText = matchesToAnalyze
      .slice(0, 10)
      .map(m => `- ${m.home} vs ${m.away} | ${m.league} | ${m.date} ore ${m.time}`)
      .join('\n');

    const userPrompt = `Analizza queste partite e fornisci ${count} pronostici con alta confidence (minimo 65%):

 ${matchesText}

Fornisci ${count} suggerimenti in formato JSON array:`;

    try {
      const completion = await zai.chat.completions.create({
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content || '';
      console.log('[SUGGEST] AI risposta:', responseText.substring(0, 300));
      
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const suggestions = JSON.parse(jsonMatch[0]);
        
        // Valida e filtra suggerimenti
        const validSuggestions = suggestions
          .filter((s: any) => s.confidence >= 50 && s.confidence <= 90)
          .filter((s: any) => s.odds >= 1.10 && s.odds <= 5.00)
          .map((s: any) => ({
            event: s.event || 'Partita',
            sport: 'football',
            prediction: s.prediction || '1X',
            odds: Math.round(s.odds * 100) / 100,
            confidence: Math.min(90, Math.max(50, s.confidence)),
            reasoning: s.reasoning || 'Analisi AI',
            league: s.league || '',
            matchTime: s.matchTime || ''
          }));
        
        console.log('[SUGGEST] Suggerimenti validi:', validSuggestions.length);
        
        return NextResponse.json({
          success: true,
          suggestions: validSuggestions.slice(0, count),
          calendarInfo: {
            season: "2025-2026",
            matchesAvailable: allMatches.length,
            upcomingMatches: upcomingMatches.length
          }
        });
      }
    } catch (aiError) {
      console.error('[SUGGEST] Errore AI:', aiError);
    }

    // Fallback: restituisci le partite senza analisi AI
    const fallbackSuggestions = matchesToAnalyze.slice(0, count).map(m => ({
      event: `${m.home} vs ${m.away}`,
      sport: 'football',
      prediction: '1X',
      odds: 1.65,
      confidence: 55,
      reasoning: `Partita di ${m.league}. Analisi non disponibile.`,
      league: m.league,
      matchTime: `${m.date} ${m.time}`
    }));

    return NextResponse.json({
      success: true,
      suggestions: fallbackSuggestions,
      calendarInfo: {
        season: "2025-2026",
        matchesAvailable: allMatches.length,
        upcomingMatches: upcomingMatches.length
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
