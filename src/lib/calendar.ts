// CALENDARIO CALCIO - STAGIONE 2025-26
// Fonte: Lega Serie A, DAZN, Sky Sport
// Aggiornato: 1 Marzo 2026

export interface Match {
  home: string;
  away: string;
  date: string;
  time: string;
  league: string;
  round?: string;
}

export const SERIE_A: Match[] = [
  // 27ª Giornata - 28 Febbraio - 2 Marzo 2026
  { home: "Verona", away: "Napoli", date: "2026-02-28", time: "15:00", league: "Serie A", round: "27" },
  { home: "Inter", away: "Genoa", date: "2026-02-28", time: "18:00", league: "Serie A", round: "27" },
  { home: "Cremonese", away: "Milan", date: "2026-03-01", time: "12:30", league: "Serie A", round: "27" },
  { home: "Sassuolo", away: "Atalanta", date: "2026-03-01", time: "15:00", league: "Serie A", round: "27" },
  { home: "Torino", away: "Lazio", date: "2026-03-01", time: "18:00", league: "Serie A", round: "27" },
  { home: "Roma", away: "Juventus", date: "2026-03-01", time: "20:45", league: "Serie A", round: "27" },
  { home: "Parma", away: "Cagliari", date: "2026-02-28", time: "15:00", league: "Serie A", round: "27" },
  { home: "Como", away: "Lecce", date: "2026-02-28", time: "15:00", league: "Serie A", round: "27" },
  { home: "Udinese", away: "Bologna", date: "2026-03-02", time: "20:45", league: "Serie A", round: "27" },
  { home: "Fiorentina", away: "Venezia", date: "2026-03-02", time: "18:30", league: "Serie A", round: "27" },

  // 28ª Giornata - 7-9 Marzo 2026
  { home: "Napoli", away: "Fiorentina", date: "2026-03-08", time: "18:00", league: "Serie A", round: "28" },
  { home: "Juventus", away: "Atalanta", date: "2026-03-08", time: "20:45", league: "Serie A", round: "28" },
  { home: "Inter", away: "Monza", date: "2026-03-07", time: "15:00", league: "Serie A", round: "28" },
  { home: "Milan", away: "Parma", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Roma", away: "Cagliari", date: "2026-03-08", time: "12:30", league: "Serie A", round: "28" },
  { home: "Lazio", away: "Como", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Bologna", away: "Venezia", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Torino", away: "Genoa", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Udinese", away: "Empoli", date: "2026-03-08", time: "15:00", league: "Serie A", round: "28" },
  { home: "Lecce", away: "Verona", date: "2026-03-09", time: "20:45", league: "Serie A", round: "28" },
];

export const CHAMPIONS_LEAGUE: Match[] = [
  { home: "Bayern Monaco", away: "Bayer Leverkusen", date: "2026-03-10", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Real Madrid", away: "Manchester City", date: "2026-03-10", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "PSG", away: "Barcelona", date: "2026-03-11", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Inter", away: "Atletico Madrid", date: "2026-03-11", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Liverpool", away: "Napoli", date: "2026-03-10", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
  { home: "Arsenal", away: "Borussia Dortmund", date: "2026-03-11", time: "21:00", league: "Champions League", round: "Ottavi Andata" },
];

export const EUROPA_LEAGUE: Match[] = [
  { home: "Roma", away: "Athletic Bilbao", date: "2026-03-05", time: "18:45", league: "Europa League", round: "Ottavi Andata" },
  { home: "Lazio", away: "Viktoria Plzen", date: "2026-03-05", time: "18:45", league: "Europa League", round: "Ottavi Andata" },
  { home: "Athletic Bilbao", away: "Roma", date: "2026-03-12", time: "18:45", league: "Europa League", round: "Ottavi Ritorno" },
  { home: "Viktoria Plzen", away: "Lazio", date: "2026-03-12", time: "18:45", league: "Europa League", round: "Ottavi Ritorno" },
];

export const PREMIER_LEAGUE: Match[] = [
  { home: "Arsenal", away: "Manchester City", date: "2026-03-01", time: "12:30", league: "Premier League", round: "28" },
  { home: "Chelsea", away: "Liverpool", date: "2026-03-01", time: "15:00", league: "Premier League", round: "28" },
  { home: "Liverpool", away: "Tottenham", date: "2026-03-08", time: "17:30", league: "Premier League", round: "29" },
];

export const LA_LIGA: Match[] = [
  { home: "Barcelona", away: "Atletico Madrid", date: "2026-03-01", time: "21:00", league: "La Liga", round: "27" },
  { home: "Real Madrid", away: "Sevilla", date: "2026-03-01", time: "18:30", league: "La Liga", round: "27" },
];

export const BUNDESLIGA: Match[] = [
  { home: "Borussia Dortmund", away: "Bayer Leverkusen", date: "2026-03-01", time: "18:30", league: "Bundesliga", round: "24" },
  { home: "Bayern Monaco", away: "Hoffenheim", date: "2026-03-01", time: "15:30", league: "Bundesliga", round: "24" },
];

export const LIGUE_1: Match[] = [
  { home: "Lyon", away: "PSG", date: "2026-03-01", time: "21:00", league: "Ligue 1", round: "24" },
  { home: "Marsiglia", away: "Monaco", date: "2026-03-01", time: "17:00", league: "Ligue 1", round: "24" },
];

export const ALL_MATCHES: Match[] = [
  ...SERIE_A,
  ...CHAMPIONS_LEAGUE,
  ...EUROPA_LEAGUE,
  ...PREMIER_LEAGUE,
  ...LA_LIGA,
  ...BUNDESLIGA,
  ...LIGUE_1,
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
