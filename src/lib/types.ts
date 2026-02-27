// Types per l'applicazione suggeritore scommesse

export type Sport = 
  | 'football'
  | 'basketball'
  | 'tennis'
  | 'f1'
  | 'motogp'
  | 'mma'
  | 'boxing'
  | 'cricket'
  | 'rugby'
  | 'golf'
  | 'cycling'
  | 'esports'
  | 'horse_racing'
  | 'volleyball'
  | 'handball'
  | 'ice_hockey'
  | 'baseball'
  | 'american_football'
  | 'other';

export type BetStatus = 'pending' | 'won' | 'lost' | 'void';

export type BetType = 'single' | 'multiple' | 'system';

export type FootballLeague = 
  | 'serie_a'
  | 'premier_league'
  | 'la_liga'
  | 'bundesliga'
  | 'ligue_1'
  | 'champions_league'
  | 'europa_league'
  | 'conference_league'
  | 'world_cup'
  | 'euro';

export interface Bet {
  id: string;
  createdAt: string;
  event: string;
  sport: Sport;
  league?: string;
  prediction: string;
  odds: number;
  stake: number;
  status: BetStatus;
  result?: string;
  profitLoss?: number;
  confidence: number; // 0-100
  reasoning: string;
  eventDate: string;
  source: 'daily_tip' | 'football_journey' | 'custom';
}

export interface DailyTip {
  id: string;
  createdAt: string;
  event: string;
  sport: Sport;
  prediction: string;
  odds: number;
  confidence: number;
  reasoning: string;
  eventDate: string;
  isPlayed: boolean;
  betId?: string;
}

export interface FootballJourneyState {
  isActive: boolean;
  startedAt?: string;
  initialBankroll: number;
  currentBankroll: number;
  targetProfit: number;
  currentStreak: 'win' | 'loss' | 'draw' | null;
  streakCount: number;
  totalBets: number;
  wins: number;
  losses: number;
  draws: number;
  selectedLeagues: FootballLeague[];
  lastBetId?: string;
}

export interface EnalottoRitardatario {
  numero: number;
  ritardo: number;
  ruota: string;
  frequenza: number;
}

export interface EnalottoSuggestion {
  type: 'ambo' | 'terno' | 'quaterna' | 'cinquina';
  numbers: number[];
  ruota: string;
  probability: number;
  reasoning: string;
}

export interface RuotaEstrazione {
  ruota: string;
  numeri: number[];
}

export interface EnalottoEstrazione {
  data: string;
  ruote: RuotaEstrazione[];
}

export interface Statistics {
  totalBets: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  totalStake: number;
  totalReturn: number;
  profitLoss: number;
  roi: number;
  avgOdds: number;
  bestWin: number;
  worstLoss: number;
  currentStreak: number;
  longestWinStreak: number;
  longestLoseStreak: number;
}

export interface ChartData {
  date: string;
  profit: number;
  cumulative: number;
  bets: number;
  wins: number;
}

export interface SportStats {
  sport: Sport;
  bets: number;
  wins: number;
  losses: number;
  profitLoss: number;
  winRate: number;
}

export interface Settings {
  defaultEventsCount: number;
  defaultStake: number;
  initialBankroll: number;
  preferredSports: Sport[];
  riskLevel: 'low' | 'medium' | 'high';
  darkMode: boolean;
  notifications: boolean;
}

export interface WebSearchResult {
  url: string;
  name: string;
  snippet: string;
  source: string;
}

export interface BetSuggestion {
  event: string;
  sport: Sport;
  league?: string;
  prediction: string;
  odds: number;
  confidence: number;
  reasoning: string;
  eventDate: string;
  bookmakers?: string[];
}

export const SPORT_LABELS: Record<Sport, string> = {
  football: '⚽ Calcio',
  basketball: '🏀 Basket',
  tennis: '🎾 Tennis',
  f1: '🏎️ Formula 1',
  motogp: '🏍️ MotoGP',
  mma: '🥋 MMA',
  boxing: '🥊 Pugilato',
  cricket: '🏏 Cricket',
  rugby: '🏉 Rugby',
  golf: '⛳ Golf',
  cycling: '🚴 Ciclismo',
  esports: '🎮 eSports',
  horse_racing: '🐴 Ippica',
  volleyball: '🏐 Pallavolo',
  handball: '🤾 Pallamano',
  ice_hockey: '🏒 Hockey su Ghiaccio',
  baseball: '⚾ Baseball',
  american_football: '🏈 Football Americano',
  other: '🎯 Altro'
};

export const LEAGUE_LABELS: Record<FootballLeague, string> = {
  serie_a: '🇮🇹 Serie A',
  premier_league: '🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League',
  la_liga: '🇪🇸 La Liga',
  bundesliga: '🇩🇪 Bundesliga',
  ligue_1: '🇫🇷 Ligue 1',
  champions_league: '🏆 Champions League',
  europa_league: '🇪🇺 Europa League',
  conference_league: '🏟️ Conference League',
  world_cup: '🌍 Mondiale',
  euro: '🇪🇺 Europeo'
};

export const RUOTE = [
  'Bari', 'Cagliari', 'Firenze', 'Genova', 'Milano',
  'Napoli', 'Palermo', 'Roma', 'Torino', 'Venezia', 'Nazionale'
];
