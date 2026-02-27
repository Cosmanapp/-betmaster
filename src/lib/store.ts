import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  Bet, 
  DailyTip, 
  FootballJourneyState, 
  Settings, 
  Statistics, 
  ChartData,
  SportStats,
  Sport,
  BetStatus
} from './types';

interface BettingStore {
  // Bets
  bets: Bet[];
  addBet: (bet: Bet) => void;
  updateBet: (id: string, updates: Partial<Bet>) => void;
  deleteBet: (id: string) => void;
  
  // Daily Tips
  dailyTips: DailyTip[];
  setDailyTips: (tips: DailyTip[]) => void;
  markTipAsPlayed: (id: string, betId: string) => void;
  
  // Football Journey
  footballJourney: FootballJourneyState;
  startJourney: (initialBankroll: number, targetProfit: number, leagues: string[]) => void;
  updateJourney: (updates: Partial<FootballJourneyState>) => void;
  resetJourney: () => void;
  
  // Settings
  settings: Settings;
  updateSettings: (updates: Partial<Settings>) => void;
  
  // Statistics
  calculateStatistics: () => Statistics;
  getChartData: () => ChartData[];
  getSportStats: () => SportStats[];
  
  // Bankroll
  bankroll: number;
  setBankroll: (amount: number) => void;
  
  // Loading states
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  // Last update
  lastUpdate: string | null;
  setLastUpdate: (date: string) => void;
}

const defaultSettings: Settings = {
  defaultEventsCount: 5,
  defaultStake: 10,
  initialBankroll: 100,
  preferredSports: ['football', 'basketball', 'tennis'],
  riskLevel: 'medium',
  darkMode: true,
  notifications: true
};

const defaultJourney: FootballJourneyState = {
  isActive: false,
  initialBankroll: 0,
  currentBankroll: 0,
  targetProfit: 0,
  currentStreak: null,
  streakCount: 0,
  totalBets: 0,
  wins: 0,
  losses: 0,
  draws: 0,
  selectedLeagues: [],
};

export const useBettingStore = create<BettingStore>()(
  persist(
    (set, get) => ({
      // Bets
      bets: [],
      addBet: (bet) => set((state) => ({ 
        bets: [bet, ...state.bets],
        lastUpdate: new Date().toISOString()
      })),
      updateBet: (id, updates) => set((state) => ({
        bets: state.bets.map((bet) => 
          bet.id === id ? { ...bet, ...updates } : bet
        ),
        lastUpdate: new Date().toISOString()
      })),
      deleteBet: (id) => set((state) => ({
        bets: state.bets.filter((bet) => bet.id !== id)
      })),
      
      // Daily Tips
      dailyTips: [],
      setDailyTips: (tips) => set({ dailyTips: tips }),
      markTipAsPlayed: (id, betId) => set((state) => ({
        dailyTips: state.dailyTips.map((tip) =>
          tip.id === id ? { ...tip, isPlayed: true, betId } : tip
        )
      })),
      
      // Football Journey
      footballJourney: defaultJourney,
      startJourney: (initialBankroll, targetProfit, leagues) => set({
        footballJourney: {
          isActive: true,
          startedAt: new Date().toISOString(),
          initialBankroll,
          currentBankroll: initialBankroll,
          targetProfit,
          currentStreak: null,
          streakCount: 0,
          totalBets: 0,
          wins: 0,
          losses: 0,
          draws: 0,
          selectedLeagues: leagues as any,
        },
        bankroll: initialBankroll
      }),
      updateJourney: (updates) => set((state) => ({
        footballJourney: { ...state.footballJourney, ...updates }
      })),
      resetJourney: () => set({ footballJourney: defaultJourney }),
      
      // Settings
      settings: defaultSettings,
      updateSettings: (updates) => set((state) => ({
        settings: { ...state.settings, ...updates }
      })),
      
      // Statistics
      calculateStatistics: () => {
        const { bets } = get();
        const completedBets = bets.filter(b => b.status !== 'pending');
        
        const wins = completedBets.filter(b => b.status === 'won').length;
        const losses = completedBets.filter(b => b.status === 'lost').length;
        const draws = completedBets.filter(b => b.status === 'void').length;
        const totalBets = completedBets.length;
        
        const totalStake = completedBets.reduce((sum, b) => sum + b.stake, 0);
        const totalReturn = completedBets.reduce((sum, b) => {
          if (b.status === 'won') return sum + (b.stake * b.odds);
          if (b.status === 'void') return sum + b.stake;
          return sum;
        }, 0);
        
        const profitLoss = totalReturn - totalStake;
        const roi = totalStake > 0 ? (profitLoss / totalStake) * 100 : 0;
        const winRate = totalBets > 0 ? (wins / totalBets) * 100 : 0;
        const avgOdds = completedBets.length > 0 
          ? completedBets.reduce((sum, b) => sum + b.odds, 0) / completedBets.length 
          : 0;
        
        const wonBets = completedBets.filter(b => b.status === 'won');
        const lostBets = completedBets.filter(b => b.status === 'lost');
        const bestWin = wonBets.length > 0 
          ? Math.max(...wonBets.map(b => (b.stake * b.odds) - b.stake))
          : 0;
        const worstLoss = lostBets.length > 0 
          ? Math.min(...lostBets.map(b => -b.stake))
          : 0;
        
        // Calculate streaks
        let currentStreak = 0;
        let longestWinStreak = 0;
        let longestLoseStreak = 0;
        let tempWinStreak = 0;
        let tempLoseStreak = 0;
        
        const sortedBets = [...completedBets].sort((a, b) => 
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
        
        sortedBets.forEach(bet => {
          if (bet.status === 'won') {
            tempWinStreak++;
            tempLoseStreak = 0;
            longestWinStreak = Math.max(longestWinStreak, tempWinStreak);
          } else if (bet.status === 'lost') {
            tempLoseStreak++;
            tempWinStreak = 0;
            longestLoseStreak = Math.max(longestLoseStreak, tempLoseStreak);
          }
        });
        
        // Current streak
        const lastResults = sortedBets.slice(-10).reverse();
        for (const bet of lastResults) {
          if (bet.status === 'won') currentStreak++;
          else if (bet.status === 'lost') currentStreak--;
        }
        
        return {
          totalBets,
          wins,
          losses,
          draws,
          winRate,
          totalStake,
          totalReturn,
          profitLoss,
          roi,
          avgOdds,
          bestWin,
          worstLoss,
          currentStreak,
          longestWinStreak,
          longestLoseStreak
        };
      },
      
      getChartData: () => {
        const { bets } = get();
        const completedBets = bets
          .filter(b => b.status !== 'pending')
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
        
        const data: ChartData[] = [];
        let cumulative = 0;
        
        completedBets.forEach(bet => {
          const date = new Date(bet.createdAt).toLocaleDateString('it-IT');
          const profit = bet.status === 'won' 
            ? (bet.stake * bet.odds) - bet.stake 
            : bet.status === 'lost' 
              ? -bet.stake 
              : 0;
          cumulative += profit;
          
          const existingDay = data.find(d => d.date === date);
          if (existingDay) {
            existingDay.profit += profit;
            existingDay.cumulative = cumulative;
            existingDay.bets++;
            if (bet.status === 'won') existingDay.wins++;
          } else {
            data.push({
              date,
              profit,
              cumulative,
              bets: 1,
              wins: bet.status === 'won' ? 1 : 0
            });
          }
        });
        
        return data;
      },
      
      getSportStats: () => {
        const { bets } = get();
        const completedBets = bets.filter(b => b.status !== 'pending');
        const sports: Sport[] = [...new Set(completedBets.map(b => b.sport))];
        
        return sports.map(sport => {
          const sportBets = completedBets.filter(b => b.sport === sport);
          const wins = sportBets.filter(b => b.status === 'won').length;
          const losses = sportBets.filter(b => b.status === 'lost').length;
          const profitLoss = sportBets.reduce((sum, b) => {
            if (b.status === 'won') return sum + ((b.stake * b.odds) - b.stake);
            if (b.status === 'lost') return sum - b.stake;
            return sum;
          }, 0);
          
          return {
            sport,
            bets: sportBets.length,
            wins,
            losses,
            profitLoss,
            winRate: sportBets.length > 0 ? (wins / sportBets.length) * 100 : 0
          };
        }).sort((a, b) => b.profitLoss - a.profitLoss);
      },
      
      // Bankroll
      bankroll: 100,
      setBankroll: (amount) => set({ bankroll: amount }),
      
      // Loading
      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),
      
      // Last update
      lastUpdate: null,
      setLastUpdate: (date) => set({ lastUpdate: date })
    }),
    {
      name: 'betting-storage',
      partialize: (state) => ({
        bets: state.bets,
        dailyTips: state.dailyTips,
        footballJourney: state.footballJourney,
        settings: state.settings,
        bankroll: state.bankroll,
        lastUpdate: state.lastUpdate
      })
    }
  )
);

// Helper function to calculate next stake based on previous result
export function calculateNextStake(
  previousStake: number,
  previousResult: 'win' | 'loss' | 'draw',
  bankroll: number,
  riskLevel: 'low' | 'medium' | 'high'
): number {
  const percentages = {
    low: 0.02,    // 2% del bankroll
    medium: 0.05, // 5% del bankroll
    high: 0.10    // 10% del bankroll
  };
  
  const baseStake = bankroll * percentages[riskLevel];
  
  switch (previousResult) {
    case 'win':
      // Dopo una vittoria, si può mantenere o aumentare leggermente
      return Math.round(baseStake * 100) / 100;
    case 'loss':
      // Dopo una perdita, si riduce proporzionalmente (mai martingala!)
      return Math.round(baseStake * 0.8 * 100) / 100;
    case 'draw':
      // In caso di pareggio, si mantiene
      return Math.round(baseStake * 100) / 100;
    default:
      return Math.round(baseStake * 100) / 100;
  }
}

// Helper to generate unique ID
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
