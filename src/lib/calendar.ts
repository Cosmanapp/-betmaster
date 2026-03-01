// ============================================
// CALENDARIO CALCIO EUROPEO - STAGIONE 2025-26
// Aggiornato: Gennaio 2026
// ============================================

export interface Match {
  home: string;
  away: string;
  date: string;
  time: string;
  league: string;
  round?: string;
}

// SERIE A 2025-26
export const SERIE_A: Match[] = [
  // 22ª Giornata - 24-26 Gennaio 2026
  { home: "Inter", away: "Lecce", date: "2026-01-24", time: "15:00", league: "Serie A", round: "22" },
  { home: "Juventus", away: "Napoli", date: "2026-01-25", time: "18:00", league: "Serie A", round: "22" },
  { home: "Milan", away: "Parma", date: "2026-01-25", time: "15:00", league: "Serie A", round: "22" },
  { home: "Roma", away: "Genoa", date: "2026-01-25", time: "15:00", league: "Serie A", round: "22" },
  { home: "Atalanta", away: "Como", date: "2026-01-25", time: "20:45", league: "Serie A", round: "22" },
  { home: "Lazio", away: "Fiorentina", date: "2026-01-26", time: "20:45", league: "Serie A", round: "22" },
  { home: "Bologna", away: "Monza", date: "2026-01-26", time: "12:30", league: "Serie A", round: "22" },
  { home: "Verona", away: "Udinese", date: "2026-01-26", time: "15:00", league: "Serie A", round: "22" },
  { home: "Torino", away: "Cagliari", date: "2026-01-26", time: "15:00", league: "Serie A", round: "22" },
  { home: "Venezia", away: "Empoli", date: "2026-01-26", time: "15:00", league: "Serie A", round: "22" },

  // 23ª Giornata - 31 Gennaio - 2 Febbraio 2026
  { home: "Napoli", away: "Roma", date: "2026-01-31", time: "18:00", league: "Serie A", round: "23" },
  { home: "Fiorentina", away: "Genoa", date: "2026-02-01", time: "15:00", league: "Serie A", round: "23" },
  { home: "Inter", away: "Milan", date: "2026-02-01", time: "20:45", league: "Serie A", round: "23" },
  { home: "Juventus", away: "Bologna", date: "2026-02-01", time: "15:00", league: "Serie A", round: "23" },
  { home: "Atalanta", away: "Torino", date: "2026-02-01", time: "12:30", league: "Serie A", round: "23" },
  { home: "Lecce", away: "Parma", date: "2026-02-01", time: "15:00", league: "Serie A", round: "23" },
  { home: "Como", away: "Venezia", date: "2026-02-01", time: "15:00", league: "Serie A", round: "23" },
  { home: "Monza", away: "Verona", date: "2026-02-01", time: "15:00", league: "Serie A", round: "23" },
  { home: "Cagliari", away: "Lazio", date: "2026-02-01", time: "18:00", league: "Serie A", round: "23" },
  { home: "Udinese", away: "Empoli", date: "2026-02-02", time: "20:45", league: "Serie A", round: "23" },

  // 24ª Giornata - 7-9 Febbraio 2026
  { home: "Milan", away: "Inter", date: "2026-02-08", time: "18:00", league: "Serie A", round: "24" },
  { home: "Roma", away: "Cagliari", date: "2026-02-07", time: "15:00", league: "Serie A", round: "24" },
  { home: "Napoli", away: "Udinese", date: "2026-02-08", time: "15:00", league: "Serie A", round: "24" },
  { home: "Juventus", away: "Fiorentina", date: "2026-02-08", time: "20:45", league: "Serie A", round: "24" },
  { home: "Atalanta", away: "Lecce", date: "2026-02-07", time: "18:00", league: "Serie A", round: "24" },
  { home: "Lazio", away: "Monza", date: "2026-02-08", time: "12:30", league: "Serie A", round: "24" },
  { home: "Bologna", away: "Como", date: "2026-02-08", time: "15:00", league: "Serie A", round: "24" },
  { home: "Torino", away: "Genoa", date: "2026-02-08", time: "15:00", league: "Serie A", round: "24" },
  { home: "Parma", away: "Venezia", date: "2026-02-08", time: "15:00", league: "Serie A", round: "24" },
  { home: "Verona", away: "Empoli", date: "2026-02-09", time: "20:45", league: "Serie A", round: "24" },

  // 25ª Giornata - 14-16 Febbraio 2026
  { home: "Inter", away: "Fiorentina", date: "2026-02-14", time: "18:00", league: "Serie A", round: "25" },
  { home: "Napoli", away: "Lazio", date: "2026-02-15", time: "20:45", league: "Serie A", round: "25" },
  { home: "Juventus", away: "Atalanta", date: "2026-02-15", time: "18:00", league: "Serie A", round: "25" },
  { home: "Milan", away: "Roma", date: "2026-02-15", time: "15:00", league: "Serie A", round: "25" },
  { home: "Bologna", away: "Parma", date: "2026-02-14", time: "15:00", league: "Serie A", round: "25" },
  { home: "Udinese", away: "Como", date: "2026-02-15", time: "12:30", league: "Serie A", round: "25" },
  { home: "Genoa", away: "Venezia", date: "2026-02-15", time: "15:00", league: "Serie A", round: "25" },
  { home: "Lecce", away: "Torino", date: "2026-02-15", time: "15:00", league: "Serie A", round: "25" },
  { home: "Monza", away: "Cagliari", date: "2026-02-15", time: "15:00", league: "Serie A", round: "25" },
  { home: "Empoli", away: "Verona", date: "2026-02-16", time: "20:45", league: "Serie A", round: "25" },

  // 26ª Giornata - 21-23 Febbraio 2026
  { home: "Atalanta", away: "Inter", date: "2026-02-21", time: "18:00", league: "Serie A", round: "26" },
  { home: "Lazio", away: "Milan", date: "2026-02-22", time: "18:00", league: "Serie A", round: "26" },
  { home: "Roma", away: "Parma", date: "2026-02-22", time: "15:00", league: "Serie A", round: "26" },
  { home: "Juventus", away: "Genoa", date: "2026-02-22", time: "15:00", league: "Serie A", round: "26" },
  { home: "Fiorentina", away: "Verona", date: "2026-02-22", time: "12:30", league: "Serie A", round: "26" },
  { home: "Napoli", away: "Bologna", date: "2026-02-22", time: "20:45", league: "Serie A", round: "26" },
  { home: "Torino", away: "Monza", date: "2026-02-22", time: "15:00", league: "Serie A", round: "26" },
  { home: "Como", away: "Empoli", date: "2026-02-22", time: "15:00", league: "Serie A", round: "26" },
  { home: "Cagliari", away: "Udinese", date: "2026-02-22", time: "15:00", league: "Serie A", round: "26" },
  { home: "Venezia", away: "Lecce", date: "2026-02-23", time: "20:45", league: "Serie A", round: "26" },

  // 27ª Giornata - 28 Febbraio - 2 Marzo 2026
  { home: "Inter", away: "Napoli", date: "2026-03-01", time: "18:00", league: "Serie A", round: "27" },
  { home: "Milan", away: "Atalanta", date: "2026-03-01", time: "20:45", league: "Serie A", round: "27" },
  { home: "Juventus", away: "Cagliari", date: "2026-02-28", time: "15:00", league: "Serie A", round: "27" },
  { home: "Roma", away: "Monza", date: "2026-03-01", time: "15:00", league: "Serie A", round: "27" },
  { home: "Lazio", away: "Venezia", date: "2026-03-01", time: "12:30", league: "Serie A", round: "27" },
  { home: "Fiorentina", away: "Lecce", date: "2026-03-01", time: "15:00", league: "Serie A", round: "27" },
  { home: "Bologna", away: "Torino", date: "2026-03-01", time: "15:00", league: "Serie A", round: "27" },
  { home: "Parma", away: "Como", date: "2026-03-01", time: "15:00", league: "Serie A", round: "27" },
  { home: "Genoa", away: "Udinese", date: "2026-03-01", time: "15:00", league: "Serie A", round: "27" },
  { home: "Verona", away: "Empoli", date: "2026-03-02", time: "20:45", league: "Serie A", round: "27" },

  // 28ª Giornata - 7-9 Marzo 2026
  { home: "Napoli", away: "Lazio", date: "2026-03-08", time: "18:00", league: "Serie A", round: "28" },
  { home: "Atalanta", away: "Juventus", date: "2026-03-08", time: "20:45", league: "Serie A", round: "28" },
  { home: "Inter", away: "Monza", date: "2026-03-07", time: "15:00", league: "Serie A", round: "28" },
  { home: "Milan", away: "Parma", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Roma", away: "Cagliari", date: "2026-03-08", time: "12:30", league: "Serie A", round: "28" },
  { home: "Fiorentina", away: "Bologna", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Torino", away: "Venezia", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Genoa", away: "Verona", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Udinese", away: "Empoli", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Como", away: "Lecce", date: "2026-03-09", time: "20:45", league: "Serie A", round: "28" },
];

// CHAMPIONS LEAGUE 2025-26
export const CHAMPIONS_LEAGUE: Match[] = [
  { home: "Bayern Monaco", away: "Bayer Leverkusen", date: "2026-02-17", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Real Madrid", away: "Manchester City", date: "2026-02-17", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "PSG", away: "Barcelona", date: "2026-02-18", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Inter", away: "Atletico Madrid", date: "2026-02-18", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Liverpool", away: "Napoli", date: "2026-02-17", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Arsenal", away: "Borussia Dortmund", date: "2026-02-18", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Juventus", away: "Benfica", date: "2026-03-10", time: "21:00", league: "Champions League", round: "Ottavi Ritorno" },
  { home: "Atletico Madrid", away: "Inter", date: "2026-03-11", time: "21:00", league: "Champions League", round: "Ottavi Ritorno" },
  { home: "Inter", away: "Bayern Monaco", date: "2026-04-07", time: "21:00", league: "Champions League", round: "Quarti Andata" },
  { home: "Bayern Monaco", away: "Inter", date: "2026-04-14", time: "21:00", league: "Champions League", round: "Quarti Ritorno" },
  { home: "Inter", away: "Barcelona", date: "2026-04-28", time: "21:00", league: "Champions League", round: "Semifinale Andata" },
  { home: "Barcelona", away: "Inter", date: "2026-05-05", time: "21:00", league: "Champions League", round: "Semifinale Ritorno" },
  { home: "Inter", away: "Real Madrid", date: "2026-05-30", time: "21:00", league: "Champions League", round: "Finale" },
];

// EUROPA LEAGUE 2025-26
export const EUROPA_LEAGUE: Match[] = [
  { home: "Roma", away: "Athletic Bilbao", date: "2026-03-05", time: "18:45", league: "Europa League", round: "Ottavi Andata" },
  { home: "Lazio", away: "Viktoria Plzen", date: "2026-03-05", time: "18:45", league: "Europa League", round: "Ottavi Andata" },
  { home: "Athletic Bilbao", away: "Roma", date: "2026-03-12", time: "18:45", league: "Europa League", round: "Ottavi Ritorno" },
  { home: "Viktoria Plzen", away: "Lazio", date: "2026-03-12", time: "18:45", league: "Europa League", round: "Ottavi Ritorno" },
  { home: "Roma", away: "Lyon", date: "2026-04-09", time: "18:45", league: "Europa League", round: "Quarti Andata" },
  { home: "Lyon", away: "Roma", date: "2026-04-16", time: "18:45", league: "Europa League", round: "Quarti Ritorno" },
  { home: "Roma", away: "Tottenham", date: "2026-05-01", time: "21:00", league: "Europa League", round: "Semifinale Andata" },
  { home: "Tottenham", away: "Roma", date: "2026-05-08", time: "21:00", league: "Europa League", round: "Semifinale Ritorno" },
  { home: "Roma", away: "Tottenham", date: "2026-05-20", time: "21:00", league: "Europa League", round: "Finale" },
];

// PREMIER LEAGUE 2025-26
export const PREMIER_LEAGUE: Match[] = [
  { home: "Liverpool", away: "Arsenal", date: "2026-01-25", time: "17:30", league: "Premier League", round: "23" },
  { home: "Manchester City", away: "Chelsea", date: "2026-01-25", time: "15:00", league: "Premier League", round: "23" },
  { home: "Manchester United", away: "Tottenham", date: "2026-01-25", time: "16:30", league: "Premier League", round: "23" },
  { home: "Arsenal", away: "Manchester City", date: "2026-02-01", time: "16:30", league: "Premier League", round: "24" },
  { home: "Chelsea", away: "Liverpool", date: "2026-02-01", time: "17:30", league: "Premier League", round: "24" },
  { home: "Liverpool", away: "Tottenham", date: "2026-02-08", time: "17:30", league: "Premier League", round: "25" },
  { home: "Manchester United", away: "Chelsea", date: "2026-02-08", time: "12:30", league: "Premier League", round: "25" },
];

// LA LIGA 2025-26
export const LA_LIGA: Match[] = [
  { home: "Real Madrid", away: "Barcelona", date: "2026-01-25", time: "21:00", league: "La Liga", round: "21" },
  { home: "Atletico Madrid", away: "Villarreal", date: "2026-01-25", time: "18:30", league: "La Liga", round: "21" },
  { home: "Barcelona", away: "Atletico Madrid", date: "2026-02-01", time: "21:00", league: "La Liga", round: "22" },
  { home: "Real Madrid", away: "Sevilla", date: "2026-02-01", time: "18:30", league: "La Liga", round: "22" },
];

// BUNDESLIGA 2025-26
export const BUNDESLIGA: Match[] = [
  { home: "Bayern Monaco", away: "Borussia Dortmund", date: "2026-01-25", time: "18:30", league: "Bundesliga", round: "19" },
  { home: "Bayer Leverkusen", away: "RB Lipsia", date: "2026-01-25", time: "15:30", league: "Bundesliga", round: "19" },
  { home: "Borussia Dortmund", away: "Bayer Leverkusen", date: "2026-02-01", time: "18:30", league: "Bundesliga", round: "20" },
  { home: "Bayern Monaco", away: "Hoffenheim", date: "2026-02-01", time: "15:30", league: "Bundesliga", round: "20" },
];

// LIGUE 1 2025-26
export const LIGUE_1: Match[] = [
  { home: "PSG", away: "Marsiglia", date: "2026-01-26", time: "21:00", league: "Ligue 1", round: "20" },
  { home: "Monaco", away: "Lyon", date: "2026-01-25", time: "17:00", league: "Ligue 1", round: "20" },
  { home: "Lyon", away: "PSG", date: "2026-02-01", time: "21:00", league: "Ligue 1", round: "21" },
  { home: "Marsiglia", away: "Monaco", date: "2026-02-01", time: "17:00", league: "Ligue 1", round: "21" },
];

// COPPA ITALIA 2025-26
export const COPPA_ITALIA: Match[] = [
  { home: "Inter", away: "Lazio", date: "2026-01-28", time: "21:00", league: "Coppa Italia", round: "Quarti" },
  { home: "Juventus", away: "Roma", date: "2026-01-29", time: "21:00", league: "Coppa Italia", round: "Quarti" },
  { home: "Milan", away: "Atalanta", date: "2026-01-29", time: "21:00", league: "Coppa Italia", round: "Quarti" },
  { home: "Inter", away: "Milan", date: "2026-04-01", time: "21:00", league: "Coppa Italia", round: "Semifinale Andata" },
  { home: "Juventus", away: "Napoli", date: "2026-04-02", time: "21:00", league: "Coppa Italia", round: "Semifinale Andata" },
  { home: "Inter", away: "Juventus", date: "2026-05-13", time: "21:00", league: "Coppa Italia", round: "Finale" },
];

// TUTTI I CAMPIONATI
export const ALL_MATCHES: Match[] = [
  ...SERIE_A,
  ...CHAMPIONS_LEAGUE,
  ...EUROPA_LEAGUE,
  ...PREMIER_LEAGUE,
  ...LA_LIGA,
  ...BUNDESLIGA,
  ...LIGUE_1,
  ...COPPA_ITALIA,
];

export function getMatchesByDate(date: string): Match[] {
  return ALL_MATCHES.filter(m => m.date === date);
}

export function getTodayMatches(): Match[] {
  const today = new Date().toISOString().split('T')[0];
  return getMatchesByDate(today);
}

export function getUpcomingMatches(days: number = 7): Match[] {
  const today = new Date();
  const matches: Match[] = [];
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    matches.push(...getMatchesByDate(dateStr));
  }
  return matches;
}

export function getMatchesByLeague(league: string): Match[] {
  return ALL_MATCHES.filter(m => m.league === league);
}
