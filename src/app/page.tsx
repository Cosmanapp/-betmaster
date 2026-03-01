'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Trophy, Target, BarChart3, Settings, 
  Calendar, DollarSign, Activity, Zap,
  Menu, X, Home, Clock, CheckCircle, XCircle,
  RefreshCw, Trash2, Play, Sparkles, Wifi, Plus, Minus,
  Edit3, Save, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';

// Types
type Sport = 'football' | 'basketball' | 'tennis' | 'f1' | 'motogp' | 'mma' | 'esports' | 'other';
type BetStatus = 'pending' | 'won' | 'lost' | 'void';

interface Bet {
  id: string;
  createdAt: string;
  event: string;
  sport: Sport;
  prediction: string;
  odds: number;
  stake: number;
  status: BetStatus;
  profitLoss?: number;
  confidence: number;
  reasoning: string;
  eventDate: string;
  source: string;
  matchTime?: string;
  homeTeam?: string;
  awayTeam?: string;
}

interface DailyTip {
  id: string;
  event: string;
  sport: Sport;
  prediction: string;
  odds: number;
  confidence: number;
  reasoning: string;
  isPlayed: boolean;
  matchTime?: string;
  league?: string;
}

interface Settings {
  defaultEventsCount: number;
  defaultStake: number;
  bankroll: number;
  riskLevel: 'low' | 'medium' | 'high';
}

interface ManualBet {
  event: string;
  prediction: string;
  odds: string;
  stake: string;
  sport: Sport;
}

const SPORT_LABELS: Record<string, string> = {
  football: '⚽ Calcio',
  basketball: '🏀 Basket',
  tennis: '🎾 Tennis',
  f1: '🏎️ F1',
  motogp: '🏍️ MotoGP',
  mma: '🥋 MMA',
  esports: '🎮 eSports',
  other: '🎯 Altro'
};

export default function BetMasterApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [bets, setBets] = useState<Bet[]>([]);
  const [dailyTips, setDailyTips] = useState<DailyTip[]>([]);
  const [settings, setSettings] = useState<Settings>({
    defaultEventsCount: 5,
    defaultStake: 10,
    bankroll: 100,
    riskLevel: 'medium'
  });

  // Per statistiche e nuova scommessa manuale
  const [selectedTips, setSelectedTips] = useState<Set<string>>(new Set());
  const [customStakes, setCustomStakes] = useState<Record<string, number>>({});
  const [isUpdating, setIsUpdating] = useState(false);
  const [showManualBet, setShowManualBet] = useState(false);
  const [manualBet, setManualBet] = useState<ManualBet>({
    event: '',
    prediction: '',
    odds: '',
    stake: '',
    sport: 'football'
  });

  useEffect(() => {
    loadAllData();
    // Auto-check risultati ogni 5 minuti
    const interval = setInterval(checkMatchResults, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [betsRes, tipsRes, settingsRes] = await Promise.all([
        fetch('/api/bets'),
        fetch('/api/daily-tips'),
        fetch('/api/user-settings')
      ]);

      const [betsData, tipsData, settingsData] = await Promise.all([
        betsRes.json(),
        tipsRes.json(),
        settingsRes.json()
      ]);

      if (betsData.success) setBets(betsData.bets || []);
      if (tipsData.success) setDailyTips(tipsData.tips || []);
      if (settingsData.success && settingsData.settings) {
        setSettings(prev => ({ ...prev, ...settingsData.settings }));
      }
      
      setIsSynced(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Controlla risultati partite via API
  const checkMatchResults = async () => {
    const pendingBets = bets.filter(b => b.status === 'pending');
    if (pendingBets.length === 0) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/check-results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bets: pendingBets })
      });

      const data = await response.json();

      if (data.success && data.results) {
        for (const result of data.results) {
          const bet = pendingBets.find(b => b.id === result.betId);
          if (bet) {
            if (result.won) {
              const profit = (bet.stake * bet.odds) - bet.stake;
              await updateBet(bet.id, { status: 'won', profitLoss: profit });
              await updateSettings({ bankroll: settings.bankroll + bet.stake + profit });
              toast.success(`🎉 ${bet.event} VINTA! +€${profit.toFixed(2)}`);
            } else if (result.lost) {
              await updateBet(bet.id, { status: 'lost', profitLoss: -bet.stake });
              toast.error(`❌ ${bet.event} persa`);
            }
          }
        }
      }
    } catch (e) {
      console.error('Auto-update error:', e);
    }
    setIsUpdating(false);
  };

  const stats = useCallback(() => {
    const completed = bets.filter(b => b.status !== 'pending');
    const wins = completed.filter(b => b.status === 'won').length;
    const losses = completed.filter(b => b.status === 'lost').length;
    const total = completed.length;
    const totalStake = completed.reduce((sum, b) => sum + b.stake, 0);
    const totalReturn = completed.reduce((sum, b) => 
      b.status === 'won' ? sum + (b.stake * b.odds) : sum, 0
    );
    const profitLoss = totalReturn - totalStake;
    const roi = totalStake > 0 ? (profitLoss / totalStake) * 100 : 0;
    const winRate = total > 0 ? (wins / total) * 100 : 0;
    
    const avgOdds = completed.length > 0 ? completed.reduce((sum, b) => sum + b.odds, 0) / completed.length : 0;
    const pendingCount = bets.filter(b => b.status === 'pending').length;
    const pendingStake = bets.filter(b => b.status === 'pending').reduce((sum, b) => sum + b.stake, 0);
    
    return { total, wins, losses, winRate, profitLoss, roi, avgOdds, pendingCount, pendingStake };
  }, [bets])();

  const pendingBets = bets.filter(b => b.status === 'pending').length;

  const chartData = bets
    .filter(b => b.status !== 'pending')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .reduce((acc: any[], bet) => {
      const date = new Date(bet.createdAt).toLocaleDateString('it-IT');
      const profit = bet.status === 'won' ? (bet.stake * bet.odds) - bet.stake : -bet.stake;
      const existing = acc.find(d => d.date === date);
      if (existing) {
        existing.profit += profit;
        existing.cumulative += profit;
      } else {
        const prev = acc.length > 0 ? acc[acc.length - 1].cumulative : 0;
        acc.push({ date, profit, cumulative: prev + profit });
      }
      return acc;
    }, []);

  const fetchDailyTips = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sport: 'football',
          count: settings.defaultEventsCount,
          riskLevel: settings.riskLevel
        })
      });
      
      const data = await response.json();
      
      if (data.suggestions && data.suggestions.length > 0) {
        const tips = data.suggestions.map((s: any) => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          event: s.event || 'Evento',
          sport: s.sport || 'football',
          prediction: s.prediction || 'N/A',
          odds: s.odds || 1.5,
          confidence: s.confidence || 50,
          reasoning: s.reasoning || '',
          isPlayed: false,
          matchTime: s.matchTime,
          league: s.league
        }));
        
        setDailyTips(tips);
        setSelectedTips(new Set());
        setCustomStakes({});
        toast.success(`${tips.length} suggerimenti caricati!`);
      } else {
        toast.warning('Nessun suggerimento disponibile. Riprova.');
      }
    } catch (error) {
      console.error('Errore:', error);
      toast.error('Errore nel caricamento');
    } finally {
      setIsLoading(false);
    }
  };

  const addBet = async (bet: Omit<Bet, 'id' | 'createdAt'>) => {
    try {
      const res = await fetch('/api/bets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bet)
      });
      const data = await res.json();
      if (data.success) {
        setBets(prev => [data.bet, ...prev]);
        return data.bet;
      }
    } catch (error) {
      toast.error('Errore nel salvataggio');
    }
    return null;
  };

  const updateBet = async (id: string, updates: Partial<Bet>) => {
    try {
      await fetch('/api/bets', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, updates })
      });
      setBets(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
    } catch (error) {
      toast.error('Errore');
    }
  };

  const deleteBet = async (id: string) => {
    try {
      await fetch(`/api/bets?id=${id}`, { method: 'DELETE' });
      setBets(prev => prev.filter(b => b.id !== id));
    } catch (error) {
      toast.error('Errore');
    }
  };

  const updateSettings = async (updates: Partial<Settings>) => {
    try {
      await fetch('/api/user-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      setSettings(prev => ({ ...prev, ...updates }));
    } catch (error) {
      toast.error('Errore');
    }
  };

  const toggleTipSelection = (tipId: string) => {
    setSelectedTips(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tipId)) {
        newSet.delete(tipId);
        setCustomStakes(s => { const n = { ...s }; delete n[tipId]; return n; });
      } else {
        newSet.add(tipId);
        setCustomStakes(s => ({ ...s, [tipId]: settings.defaultStake }));
      }
      return newSet;
    });
  };

  const playSelectedBets = async () => {
    const selectedArray = Array.from(selectedTips);
    let totalStake = 0;
    
    for (const tipId of selectedArray) {
      const tip = dailyTips.find(t => t.id === tipId);
      const stake = customStakes[tipId] || settings.defaultStake;
      totalStake += stake;
      
      if (tip) {
        await addBet({
          event: tip.event,
          sport: tip.sport,
          prediction: tip.prediction,
          odds: tip.odds,
          stake,
          status: 'pending',
          confidence: tip.confidence,
          reasoning: tip.reasoning,
          eventDate: new Date().toLocaleDateString('it-IT'),
          source: 'selected_tip',
          matchTime: tip.matchTime,
          league: tip.league
        });
        
        setDailyTips(prev => prev.map(t => t.id === tipId ? { ...t, isPlayed: true } : t));
      }
    }
    
    await updateSettings({ bankroll: settings.bankroll - totalStake });
    setSelectedTips(new Set());
    setCustomStakes({});
    toast.success(`${selectedArray.length} giocate aggiunte! Totale: €${totalStake.toFixed(2)}`);
  };

  const addManualBet = async () => {
    if (!manualBet.event || !manualBet.prediction || !manualBet.odds || !manualBet.stake) {
      toast.error('Compila tutti i campi');
      return;
    }

    const odds = parseFloat(manualBet.odds);
    const stake = parseFloat(manualBet.stake);

    if (isNaN(odds) || odds < 1.01) {
      toast.error('Quote non valide');
      return;
    }

    if (isNaN(stake) || stake <= 0) {
      toast.error('Importo non valido');
      return;
    }

    await addBet({
      event: manualBet.event,
      sport: manualBet.sport,
      prediction: manualBet.prediction,
      odds,
      stake,
      status: 'pending',
      confidence: 50,
      reasoning: 'Scommessa manuale',
      eventDate: new Date().toLocaleDateString('it-IT'),
      source: 'manual'
    });

    await updateSettings({ bankroll: settings.bankroll - stake });
    
    setManualBet({ event: '', prediction: '', odds: '', stake: '', sport: 'football' });
    setShowManualBet(false);
    toast.success('Scommessa aggiunta!');
  };

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'daily', label: 'Suggerimenti', icon: Calendar },
    { id: 'history', label: 'Storico', icon: Clock },
    { id: 'stats', label: 'Statistiche', icon: BarChart3 },
    { id: 'settings', label: 'Impostazioni', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-700 bg-gray-900/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-green-600">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">
                BetMaster AI
              </h1>
              <p className="text-xs text-gray-400">Suggeritore Professionale</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              {isSynced ? (
                <Badge variant="outline" className="bg-emerald-500/20 text-emerald-400">
                  <Wifi className="h-3 w-3 mr-1" /> Sync
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Sync...
                </Badge>
              )}
            </div>
            
            {isUpdating && (
              <Badge variant="outline" className="bg-blue-500/20 text-blue-400">
                <Activity className="h-3 w-3 mr-1 animate-pulse" /> Aggiornamento...
              </Badge>
            )}
            
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold">€{settings.bankroll.toFixed(2)}</span>
            </div>
            
            {pendingBets > 0 && (
              <Badge className="bg-yellow-600 text-white">
                {pendingBets} in corso
              </Badge>
            )}
            
            <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X /> : <Menu />}
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden md:flex w-64 flex-col border-r border-gray-700 bg-gray-900/50 min-h-[calc(100vh-64px)]">
          <div className="flex flex-col gap-1 p-4">
            {sections.map((section) => (
              <Button
                key={section.id}
                variant={activeSection === section.id ? 'secondary' : 'ghost'}
                className={`justify-start gap-3 ${activeSection === section.id ? 'bg-emerald-600/20 text-emerald-400' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <section.icon className="h-4 w-4" />
                {section.label}
              </Button>
            ))}
          </div>
        </nav>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 md:hidden">
              <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
              <nav className="absolute left-0 top-0 h-full w-64 bg-gray-900 p-4">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold">Menu</h2>
                  <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(false)}>
                    <X />
                  </Button>
                </div>
                <div className="flex flex-col gap-2">
                  {sections.map((section) => (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? 'secondary' : 'ghost'}
                      className={`justify-start gap-3 ${activeSection === section.id ? 'bg-emerald-600/20 text-emerald-400' : ''}`}
                      onClick={() => { setActiveSection(section.id); setMobileMenuOpen(false); }}
                    >
                      <section.icon className="h-4 w-4" />
                      {section.label}
                    </Button>
                  ))}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6">
          <AnimatePresence mode="wait">
            {activeSection === 'dashboard' && (
              <motion.div key="dashboard" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-500/20 p-2"><DollarSign className="h-5 w-5 text-emerald-400" /></div>
                        <div>
                          <p className="text-sm text-gray-300">Bankroll</p>
                          <p className="text-xl font-bold text-emerald-400">€{settings.bankroll.toFixed(2)}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-500/20 p-2"><Trophy className="h-5 w-5 text-blue-400" /></div>
                        <div>
                          <p className="text-sm text-gray-300">Vincenti</p>
                          <p className="text-xl font-bold text-blue-400">{stats.wins}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-red-500/20 p-2"><XCircle className="h-5 w-5 text-red-400" /></div>
                        <div>
                          <p className="text-sm text-gray-300">Perdenti</p>
                          <p className="text-xl font-bold text-red-400">{stats.losses}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-yellow-500/20 p-2"><TrendingUp className="h-5 w-5 text-yellow-400" /></div>
                        <div>
                          <p className="text-sm text-gray-300">ROI</p>
                          <p className={`text-xl font-bold ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.roi.toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Pending Bets Alert */}
                {stats.pendingCount > 0 && (
                  <Card className="bg-yellow-500/10 border-yellow-600/50">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-yellow-400" />
                          <div>
                            <p className="font-medium text-yellow-400">{stats.pendingCount} scommesse in corso</p>
                            <p className="text-sm text-gray-400">Totale in gioco: €{stats.pendingStake.toFixed(2)}</p>
                          </div>
                        </div>
                        <Button size="sm" onClick={checkMatchResults} disabled={isUpdating} variant="outline" className="border-yellow-600 text-yellow-400">
                          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                          Aggiorna
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Chart */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Activity className="h-5 w-5 text-emerald-400" />
                      Andamento Profitti
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                          <Area type="monotone" dataKey="cumulative" stroke="#10b981" fillOpacity={1} fill="url(#colorProfit)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                        <BarChart3 className="h-12 w-12 mb-4 opacity-50" />
                        <p>Nessun dato - Inizia a giocare!</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Daily Tips Preview */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      Suggerimenti del Giorno
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={fetchDailyTips} disabled={isLoading} className="text-white border-gray-600">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Aggiorna
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {dailyTips.length > 0 ? (
                      <div className="space-y-3">
                        {dailyTips.slice(0, 3).map((tip) => (
                          <div key={tip.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                            <div>
                              <p className="font-medium text-white text-lg">{tip.event}</p>
                              <p className="text-sm text-emerald-400 font-medium">{tip.prediction} @ {tip.odds}</p>
                              {tip.matchTime && <p className="text-xs text-gray-400">⏰ {tip.matchTime}</p>}
                            </div>
                            <Badge className={`${tip.confidence >= 70 ? 'bg-green-600' : 'bg-yellow-600'} text-white`}>{tip.confidence}%</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p>Nessun suggerimento</p>
                        <Button variant="outline" className="mt-4 text-white border-gray-600" onClick={fetchDailyTips}>Carica Suggerimenti</Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {activeSection === 'daily' && (
              <motion.div key="daily" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Suggerimenti del Giorno</h2>
                    <p className="text-gray-400">Seleziona le giocate e inserisci l'importo</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={fetchDailyTips} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Aggiorna
                    </Button>
                    {selectedTips.size > 0 && (
                      <Button onClick={playSelectedBets} className="bg-emerald-600 hover:bg-emerald-700">
                        <Play className="h-4 w-4 mr-2" />
                        Gioca ({selectedTips.size})
                      </Button>
                    )}
                  </div>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-12 w-12 animate-spin text-emerald-400" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {dailyTips.map((tip) => (
                      <Card key={tip.id} className={`bg-gray-800/50 border-gray-700 ${selectedTips.has(tip.id) ? 'ring-2 ring-emerald-500' : ''} ${tip.isPlayed ? 'opacity-50' : ''}`}>
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex items-start gap-3 flex-1">
                              <input
                                type="checkbox"
                                checked={selectedTips.has(tip.id)}
                                onChange={() => toggleTipSelection(tip.id)}
                                disabled={tip.isPlayed}
                                className="mt-1 h-5 w-5 rounded border-gray-600 bg-gray-700 text-emerald-600 focus:ring-emerald-500"
                              />
                              <div className="flex-1">
                                <Badge variant="outline" className="mb-2 border-emerald-500 text-emerald-400">{SPORT_LABELS[tip.sport] || tip.sport}</Badge>
                                <h3 className="text-lg font-semibold text-white">{tip.event}</h3>
                                <p className="text-emerald-400 font-medium text-lg">{tip.prediction} @ {tip.odds}</p>
                                {tip.matchTime && <p className="text-sm text-gray-400 mt-1">⏰ Calcio d'inizio: {tip.matchTime}</p>}
                                {tip.league && <p className="text-sm text-gray-500">{tip.league}</p>}
                                <p className="text-sm text-gray-300 mt-2">{tip.reasoning}</p>
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                              <p className={`text-2xl font-bold ${tip.confidence >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{tip.confidence}%</p>
                              
                              {selectedTips.has(tip.id) && (
                                <div className="flex items-center gap-2">
                                  <Label className="text-gray-300">€</Label>
                                  <Input
                                    type="number"
                                    value={customStakes[tip.id] || settings.defaultStake}
                                    onChange={(e) => setCustomStakes(s => ({ ...s, [tip.id]: parseFloat(e.target.value) || settings.defaultStake }))}
                                    className="w-24 bg-gray-700 border-gray-600 text-white"
                                    min="1"
                                    step="0.5"
                                  />
                                </div>
                              )}
                              
                              {tip.isPlayed && <Badge className="bg-gray-600">Giocata</Badge>}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {dailyTips.length === 0 && (
                      <div className="text-center py-12">
                        <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Nessun suggerimento</p>
                        <Button variant="outline" className="mt-4 text-white border-gray-600" onClick={fetchDailyTips}>Carica Suggerimenti</Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeSection === 'history' && (
              <motion.div key="history" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Storico Giocate</h2>
                    <p className="text-gray-400">Tutte le tue scommesse</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={checkMatchResults} disabled={isUpdating} variant="outline" className="text-white border-gray-600">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                      Aggiorna Risultati
                    </Button>
                    <Button onClick={() => setShowManualBet(!showManualBet)} className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuova
                    </Button>
                  </div>
                </div>

                {/* Manual Bet Form */}
                <AnimatePresence>
                  {showManualBet && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                      <Card className="bg-gray-800/50 border-emerald-600">
                        <CardHeader>
                          <CardTitle className="text-white flex items-center gap-2">
                            <Edit3 className="h-5 w-5 text-emerald-400" />
                            Aggiungi Scommessa Manuale
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <Label className="text-gray-300">Evento</Label>
                              <Input
                                placeholder="Es: Inter vs Milan"
                                value={manualBet.event}
                                onChange={(e) => setManualBet({ ...manualBet, event: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300">Pronostico</Label>
                              <Input
                                placeholder="Es: 1, X, 2, GG, Over 2.5"
                                value={manualBet.prediction}
                                onChange={(e) => setManualBet({ ...manualBet, prediction: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300">Quota</Label>
                              <Input
                                type="number"
                                placeholder="Es: 1.85"
                                step="0.01"
                                value={manualBet.odds}
                                onChange={(e) => setManualBet({ ...manualBet, odds: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300">Importo (€)</Label>
                              <Input
                                type="number"
                                placeholder="Es: 10"
                                step="0.5"
                                value={manualBet.stake}
                                onChange={(e) => setManualBet({ ...manualBet, stake: e.target.value })}
                                className="bg-gray-700 border-gray-600 text-white mt-1"
                              />
                            </div>
                            <div>
                              <Label className="text-gray-300">Sport</Label>
                              <select
                                value={manualBet.sport}
                                onChange={(e) => setManualBet({ ...manualBet, sport: e.target.value as Sport })}
                                className="w-full bg-gray-700 border border-gray-600 text-white rounded-md p-2 mt-1"
                              >
                                {Object.entries(SPORT_LABELS).map(([key, label]) => (
                                  <option key={key} value={key}>{label}</option>
                                ))}
                              </select>
                            </div>
                            <div className="flex items-end gap-2">
                              <Button onClick={addManualBet} className="bg-emerald-600 hover:bg-emerald-700 flex-1">
                                <Save className="h-4 w-4 mr-2" />
                                Salva
                              </Button>
                              <Button onClick={() => setShowManualBet(false)} variant="outline" className="text-white border-gray-600">
                                Annulla
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="grid gap-4">
                  {bets.length > 0 ? bets.map((bet) => (
                    <Card key={bet.id} className={`bg-gray-800/50 border-gray-700 ${bet.status === 'pending' ? 'border-l-4 border-l-yellow-500' : ''}`}>
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <Badge variant="outline" className="text-white border-gray-500">{SPORT_LABELS[bet.sport] || bet.sport}</Badge>
                              <Badge className={bet.status === 'won' ? 'bg-green-600' : bet.status === 'lost' ? 'bg-red-600' : 'bg-yellow-600'}>
                                {bet.status === 'won' ? '✅ Vinta' : bet.status === 'lost' ? '❌ Persa' : '⏳ In corso'}
                              </Badge>
                              {bet.matchTime && <span className="text-xs text-gray-400">⏰ {bet.matchTime}</span>}
                              {bet.source === 'manual' && <Badge variant="outline" className="border-purple-500 text-purple-400">Manuale</Badge>}
                            </div>
                            <h3 className="font-semibold text-white">{bet.event}</h3>
                            <p className="text-emerald-400 font-medium">{bet.prediction} @ {bet.odds}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-300 flex-wrap">
                              <span>Stake: €{bet.stake}</span>
                              <span className="text-gray-500">|</span>
                              <span>Potenziale: €{(bet.stake * bet.odds).toFixed(2)}</span>
                              {bet.profitLoss !== undefined && (
                                <>
                                  <span className="text-gray-500">|</span>
                                  <span className={bet.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                                    P/L: €{bet.profitLoss.toFixed(2)}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col gap-2">
                            {bet.status === 'pending' && (
                              <>
                                <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={async () => {
                                  const profit = (bet.stake * bet.odds) - bet.stake;
                                  await updateBet(bet.id, { status: 'won', profitLoss: profit });
                                  await updateSettings({ bankroll: settings.bankroll + bet.stake + profit });
                                  toast.success('Vittoria registrata! 🎉');
                                }}>
                                  <CheckCircle className="h-4 w-4 mr-1" /> Vinta
                                </Button>
                                <Button size="sm" className="bg-red-600 hover:bg-red-700" onClick={async () => {
                                  await updateBet(bet.id, { status: 'lost', profitLoss: -bet.stake });
                                  toast.success('Sconfitta registrata');
                                }}>
                                  <XCircle className="h-4 w-4 mr-1" /> Persa
                                </Button>
                              </>
                            )}
                            <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300" onClick={() => deleteBet(bet.id)}>
                              <Trash2 className="h-4 w-4 mr-1" /> Elimina
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )) : (
                    <div className="text-center py-12">
                      <Clock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400">Nessuna giocata registrata</p>
                      <Button onClick={() => setShowManualBet(true)} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Aggiungi Scommessa
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeSection === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">Statistiche</h2>
                    <p className="text-gray-400">Analisi delle tue performance</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={checkMatchResults} disabled={isUpdating} variant="outline" className="text-white border-gray-600">
                      <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                      Aggiorna Risultati
                    </Button>
                    <Button onClick={() => setActiveSection('history')} className="bg-emerald-600 hover:bg-emerald-700">
                      <Plus className="h-4 w-4 mr-2" />
                      Nuova Scommessa
                    </Button>
                  </div>
                </div>

                {/* Main Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                      <p className="text-sm text-gray-300">Totali</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-400">{stats.winRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-300">Win Rate</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className={`text-3xl font-bold ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.roi.toFixed(1)}%</p>
                      <p className="text-sm text-gray-300">ROI</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className={`text-3xl font-bold ${stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>€{stats.profitLoss.toFixed(2)}</p>
                      <p className="text-sm text-gray-300">Profitto</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-green-400">{stats.wins}</p>
                      <p className="text-sm text-gray-300">Vittorie</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-red-400">{stats.losses}</p>
                      <p className="text-sm text-gray-300">Sconfitte</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-yellow-400">{stats.pendingCount}</p>
                      <p className="text-sm text-gray-300">In Corso</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-2xl font-bold text-purple-400">{stats.avgOdds.toFixed(2)}</p>
                      <p className="text-sm text-gray-300">Quote Medie</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Pending Bets Summary */}
                {stats.pendingCount > 0 && (
                  <Card className="bg-yellow-500/10 border-yellow-600/50">
                    <CardHeader>
                      <CardTitle className="text-yellow-400 flex items-center gap-2">
                        <AlertCircle className="h-5 w-5" />
                        Scommesse in Corso
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <p className="text-2xl font-bold text-white">{stats.pendingCount} giocate</p>
                          <p className="text-gray-400">Investito: €{stats.pendingStake.toFixed(2)}</p>
                        </div>
                        <Button onClick={checkMatchResults} disabled={isUpdating} className="bg-yellow-600 hover:bg-yellow-700">
                          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                          Controlla Risultati
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Chart */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Andamento Profitti Cumulativo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip 
                            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
                            formatter={(value: any) => [`€${parseFloat(value).toFixed(2)}`, 'Profitto']}
                          />
                          <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center py-12 text-gray-400">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Nessun dato - Inizia a giocare!</p>
                        <Button onClick={() => setActiveSection('history')} className="mt-4 bg-emerald-600 hover:bg-emerald-700">
                          <Plus className="h-4 w-4 mr-2" />
                          Aggiungi Prima Scommessa
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Azioni Rapide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Button onClick={() => setActiveSection('daily')} className="bg-emerald-600 hover:bg-emerald-700 h-16">
                        <Sparkles className="h-5 w-5 mr-2" />
                        Carica Suggerimenti AI
                      </Button>
                      <Button onClick={() => setActiveSection('history')} className="bg-blue-600 hover:bg-blue-700 h-16">
                        <Edit3 className="h-5 w-5 mr-2" />
                        Aggiungi Scommessa Manuale
                      </Button>
                      <Button onClick={checkMatchResults} disabled={isUpdating} className="bg-yellow-600 hover:bg-yellow-700 h-16">
                        <RefreshCw className={`h-5 w-5 mr-2 ${isUpdating ? 'animate-spin' : ''}`} />
                        Aggiorna Risultati
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
            
            {activeSection === 'settings' && (
              <motion.div key="settings" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Impostazioni</h2>
                  <p className="text-gray-400">Personalizza la tua esperienza</p>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Gestione Bankroll</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Bankroll Attuale</Label>
                      <div className="flex items-center gap-2 mt-2">
                        <Button variant="outline" size="icon" onClick={() => updateSettings({ bankroll: Math.max(0, settings.bankroll - 10) })}>
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="text-2xl font-bold text-emerald-400 min-w-[100px] text-center">€{settings.bankroll.toFixed(2)}</span>
                        <Button variant="outline" size="icon" onClick={() => updateSettings({ bankroll: settings.bankroll + 10 })}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-300">Aggiungi/Preleva Importo Specifico</Label>
                      <Input
                        type="number"
                        placeholder="Es: 50 o -20"
                        className="bg-gray-700 border-gray-600 text-white mt-2"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const val = parseFloat((e.target as HTMLInputElement).value);
                            if (!isNaN(val)) {
                              updateSettings({ bankroll: Math.max(0, settings.bankroll + val) });
                              (e.target as HTMLInputElement).value = '';
                              toast.success('Bankroll aggiornato');
                            }
                          }
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">Preferenze Scommesse</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-300">Stake Predefinito</Label>
                      <Input
                        type="number"
                        value={settings.defaultStake}
                        onChange={(e) => updateSettings({ defaultStake: parseFloat(e.target.value) || 10 })}
                        className="bg-gray-700 border-gray-600 text-white mt-2"
                        min="1"
                        step="0.5"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Numero Suggerimenti</Label>
                      <Input
                        type="number"
                        value={settings.defaultEventsCount}
                        onChange={(e) => updateSettings({ defaultEventsCount: parseInt(e.target.value) || 5 })}
                        className="bg-gray-700 border-gray-600 text-white mt-2"
                        min="1"
                        max="10"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300">Livello Rischio</Label>
                      <div className="flex gap-2 mt-2">
                        {['low', 'medium', 'high'].map((level) => (
                          <Button
                            key={level}
                            variant={settings.riskLevel === level ? 'default' : 'outline'}
                            onClick={() => updateSettings({ riskLevel: level as any })}
                            className={settings.riskLevel === level ? 'bg-emerald-600' : 'text-white border-gray-600'}
                          >
                            {level === 'low' ? 'Basso' : level === 'medium' ? 'Medio' : 'Alto'}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Info Card */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white">ℹ️ Info</CardTitle>
                  </CardHeader>
                  <CardContent className="text-gray-300 text-sm space-y-2">
                    <p>• I risultati vengono aggiornati automaticamente ogni 5 minuti</p>
                    <p>• Puoi aggiungere scommesse manuali dalla sezione Storico</p>
                    <p>• Il controllo automatico funziona per i principali tipi di scommessa (1, X, 2, GG, NG, 1X, X2, Over/Under)</p>
                    <p>• I suggerimenti AI vengono generati cercando dati in tempo reale</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
