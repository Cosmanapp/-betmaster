'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, Trophy, Target, BarChart3, Settings, 
  Calendar, DollarSign, Activity, Zap, Star,
  Menu, X, Home, Clock, CheckCircle, XCircle,
  RefreshCw, Trash2, Play, Sparkles, Database, Wifi
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell
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
}

interface Settings {
  defaultEventsCount: number;
  defaultStake: number;
  bankroll: number;
  riskLevel: 'low' | 'medium' | 'high';
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

const COLORS = ['#10b981', '#ef4444', '#f59e0b', '#3b82f6'];

export default function BetMasterApp() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isSynced, setIsSynced] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [bets, setBets] = useState<Bet[]>([]);
  const [dailyTips, setDailyTips] = useState<DailyTip[]>([]);
  const [enalottoData, setEnalottoData] = useState<any>(null);
  const [settings, setSettings] = useState<Settings>({
    defaultEventsCount: 5,
    defaultStake: 10,
    bankroll: 100,
    riskLevel: 'medium'
  });

  useEffect(() => {
    loadAllData();
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
        setSettings(prev => ({
          ...prev,
          ...settingsData.settings,
          preferredSports: undefined
        }));
      }
      
      setIsSynced(true);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
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
    
    return { total, wins, losses, winRate, profitLoss, roi };
  }, [bets])();

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
      
      if (data.success && data.suggestions?.length > 0) {
        const tips = data.suggestions.map((s: any) => ({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          event: s.event || 'Evento',
          sport: s.sport || 'football',
          prediction: s.prediction || 'N/A',
          odds: s.odds || 1.5,
          confidence: s.confidence || 50,
          reasoning: s.reasoning || '',
          isPlayed: false
        }));
        
        setDailyTips(tips);
        toast.success(`${tips.length} suggerimenti caricati!`);
      }
    } catch (error) {
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

  const sections = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'daily', label: 'Suggerimenti', icon: Calendar },
    { id: 'enalotto', label: 'Enalotto', icon: Star },
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
            
            <div className="hidden md:flex items-center gap-2 rounded-lg bg-gray-800 px-4 py-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span className="font-semibold">€{settings.bankroll.toFixed(2)}</span>
            </div>
            
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
                          <p className="text-sm text-gray-400">Bankroll</p>
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
                          <p className="text-sm text-gray-400">Vincenti</p>
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
                          <p className="text-sm text-gray-400">Perdenti</p>
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
                          <p className="text-sm text-gray-400">ROI</p>
                          <p className={`text-xl font-bold ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.roi.toFixed(1)}%</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Chart */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
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
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-yellow-400" />
                      Suggerimenti del Giorno
                    </CardTitle>
                    <Button variant="ghost" size="sm" onClick={fetchDailyTips} disabled={isLoading}>
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Aggiorna
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {dailyTips.length > 0 ? (
                      <div className="space-y-3">
                        {dailyTips.slice(0, 3).map((tip) => (
                          <div key={tip.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-700/50">
                            <div>
                              <p className="font-medium">{tip.event}</p>
                              <p className="text-sm text-gray-400">{tip.prediction} @ {tip.odds}</p>
                            </div>
                            <Badge variant={tip.confidence >= 70 ? 'default' : 'secondary'}>{tip.confidence}%</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        <p>Nessun suggerimento</p>
                        <Button variant="outline" className="mt-4" onClick={fetchDailyTips}>Carica Suggerimenti</Button>
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
                    <p className="text-gray-400">Analisi AI basate su dati real-time</p>
                  </div>
                  <Button onClick={fetchDailyTips} disabled={isLoading}>
                    <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                    Aggiorna
                  </Button>
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center h-64">
                    <RefreshCw className="h-12 w-12 animate-spin text-emerald-400" />
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {dailyTips.map((tip) => (
                      <Card key={tip.id} className="bg-gray-800/50 border-gray-700">
                        <CardContent className="p-4">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex-1">
                              <Badge variant="outline" className="mb-2">{SPORT_LABELS[tip.sport] || tip.sport}</Badge>
                              <h3 className="text-lg font-semibold">{tip.event}</h3>
                              <p className="text-emerald-400 font-medium">{tip.prediction} @ {tip.odds}</p>
                              <p className="text-sm text-gray-400 mt-2">{tip.reasoning}</p>
                            </div>
                            <div className="flex flex-col items-end gap-3">
                              <p className={`text-2xl font-bold ${tip.confidence >= 70 ? 'text-green-400' : 'text-yellow-400'}`}>{tip.confidence}%</p>
                              {!tip.isPlayed && (
                                <Button onClick={async () => {
                                  await addBet({
                                    event: tip.event,
                                    sport: tip.sport,
                                    prediction: tip.prediction,
                                    odds: tip.odds,
                                    stake: settings.defaultStake,
                                    status: 'pending',
                                    confidence: tip.confidence,
                                    reasoning: tip.reasoning,
                                    eventDate: new Date().toLocaleDateString('it-IT'),
                                    source: 'daily_tip'
                                  });
                                  await updateSettings({ bankroll: settings.bankroll - settings.defaultStake });
                                  toast.success('Giocata aggiunta!');
                                }} className="bg-emerald-600 hover:bg-emerald-700">
                                  <Play className="h-4 w-4 mr-2" />
                                  Gioca €{settings.defaultStake}
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                    {dailyTips.length === 0 && (
                      <div className="text-center py-12">
                        <Target className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Nessun suggerimento</p>
                        <Button variant="outline" className="mt-4" onClick={fetchDailyTips}>Carica Suggerimenti</Button>
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            )}
            
            {activeSection === 'enalotto' && (
              <motion.div key="enalotto" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Enalotto Italia</h2>
                  <p className="text-gray-400">Analisi ritardatari e suggerimenti</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button className="bg-blue-600 hover:bg-blue-700 h-auto py-4" onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await fetch('/api/enalotto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'ritardatari' }) });
                      const data = await res.json();
                      if (data.success) {
                        setEnalottoData({ type: 'ritardatari', ...data });
                        toast.success('Ritardatari caricati!');
                      }
                    } catch (e) { toast.error('Errore'); }
                    setIsLoading(false);
                  }} disabled={isLoading}>
                    <div className="text-center">
                      <Star className="h-6 w-6 mx-auto mb-2" />
                      <span>Ritardatari</span>
                    </div>
                  </Button>
                  <Button className="bg-purple-600 hover:bg-purple-700 h-auto py-4" onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await fetch('/api/enalotto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'estrazione' }) });
                      const data = await res.json();
                      if (data.success) {
                        setEnalottoData({ type: 'estrazione', ...data });
                        toast.success('Estrazione caricata!');
                      }
                    } catch (e) { toast.error('Errore'); }
                    setIsLoading(false);
                  }} disabled={isLoading}>
                    <div className="text-center">
                      <Calendar className="h-6 w-6 mx-auto mb-2" />
                      <span>Ultima Estrazione</span>
                    </div>
                  </Button>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 h-auto py-4" onClick={async () => {
                    setIsLoading(true);
                    try {
                      const res = await fetch('/api/enalotto', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'suggestion', combination: 'ambo' }) });
                      const data = await res.json();
                      if (data.success && data.data) {
                        setEnalottoData({ type: 'suggestion', ...data });
                        toast.success(`Suggerimento: ${data.data.numbers?.join(' - ') || 'N/A'}`);
                      }
                    } catch (e) { toast.error('Errore'); }
                    setIsLoading(false);
                  }} disabled={isLoading}>
                    <div className="text-center">
                      <Sparkles className="h-6 w-6 mx-auto mb-2" />
                      <span>Suggerimento AI</span>
                    </div>
                  </Button>
                </div>

                {/* RISULTATI ENALOTTO */}
                {enalottoData && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        {enalottoData.type === 'ritardatari' && <><Star className="h-5 w-5 text-blue-400" /> Ritardatari per Ruota</>}
                        {enalottoData.type === 'estrazione' && <><Calendar className="h-5 w-5 text-purple-400" /> Ultima Estrazione</>}
                        {enalottoData.type === 'suggestion' && <><Sparkles className="h-5 w-5 text-emerald-400" /> Suggerimento AI</>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* RITARDATARI */}
                      {enalottoData.type === 'ritardatari' && enalottoData.data?.ritardatari && (
                        <div className="space-y-3">
                          {Object.entries(enalottoData.data.ritardatari).filter(([_, numeri]: [string, any]) => numeri.length > 0).slice(0, 6).map(([ruota, numeri]: [string, any]) => (
                            <div key={ruota} className="bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                              <h4 className="font-bold text-yellow-400 mb-2">{ruota}</h4>
                              <div className="flex flex-wrap gap-2">
                                {numeri.map((n: any) => (
                                  <div key={n.numero} className="bg-gradient-to-br from-blue-500 to-blue-700 px-4 py-2 rounded-lg text-center shadow-lg">
                                    <span className="text-xl font-bold text-white">{n.numero}</span>
                                    <span className="text-xs text-blue-200 ml-1 block">({n.ritardo} rit)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          ))}
                          {enalottoData.data.aiAnalysis?.numeriTop && (
                            <div className="bg-emerald-900/30 p-4 rounded-lg border border-emerald-600 mt-4">
                              <h4 className="font-bold text-emerald-400 mb-2">🎯 Top 5 Numeri Consigliati</h4>
                              <div className="flex gap-3 flex-wrap">
                                {enalottoData.data.aiAnalysis.numeriTop.map((n: number) => (
                                  <span key={n} className="bg-emerald-600 text-white px-4 py-2 rounded-full font-bold text-lg">{n}</span>
                                ))}
                              </div>
                            </div>
                          )}
                          <p className="text-sm text-yellow-400 mt-2">{enalottoData.data.disclaimer}</p>
                        </div>
                      )}
                      
                      {/* ESTRAZIONE */}
                      {enalottoData.type === 'estrazione' && enalottoData.data?.ruote && (
                        <div className="space-y-3">
                          <p className="text-gray-300 mb-4">📅 {enalottoData.data.data} {enalottoData.data.nota ? `- ${enalottoData.data.nota}` : ''}</p>
                          {Object.entries(enalottoData.data.ruote).map(([ruota, numeri]: [string, any]) => (
                            <div key={ruota} className="flex items-center gap-3 bg-gray-700/50 p-3 rounded-lg border border-gray-600">
                              <span className="font-bold text-purple-400 w-24">{ruota}</span>
                              <div className="flex gap-2">
                                {numeri.map((n: number) => (
                                  <span key={n} className="bg-purple-600 text-white px-3 py-1 rounded-full font-bold">{n}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* SUGGERIMENTO */}
                      {enalottoData.type === 'suggestion' && enalottoData.data && (
                        <div className="space-y-4">
                          <div className="bg-emerald-900/30 p-6 rounded-lg border-2 border-emerald-600 text-center">
                            <p className="text-gray-300 mb-2">Ruota: <span className="text-white font-bold">{enalottoData.data.ruota}</span></p>
                            <p className="text-gray-300 mb-4">Giocata: <span className="text-yellow-400 font-bold">{enalottoData.data.type?.toUpperCase()}</span></p>
                            <div className="flex justify-center gap-4">
                              {enalottoData.data.numbers?.map((n: number) => (
                                <span key={n} className="bg-emerald-600 text-white px-6 py-3 rounded-full font-bold text-2xl">{n}</span>
                              ))}
                            </div>
                          </div>
                          {enalottoData.data.reasoning && (
                            <div className="bg-gray-700/50 p-4 rounded-lg">
                              <h4 className="font-bold mb-2">📊 Analisi:</h4>
                              <p className="text-gray-300">{enalottoData.data.reasoning}</p>
                            </div>
                          )}
                          <p className="text-sm text-yellow-400">{enalottoData.data.disclaimer}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {!enalottoData && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-6 text-center text-gray-400">
                      <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p>Seleziona un'opzione sopra per caricare i dati Enalotto</p>
                      <p className="text-sm mt-2">I risultati verranno mostrati qui</p>
                    </CardContent>
                  </Card>
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
                </div>

                <div className="grid gap-4">
                  {bets.length > 0 ? bets.map((bet) => (
                    <Card key={bet.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline">{SPORT_LABELS[bet.sport] || bet.sport}</Badge>
                              <Badge className={bet.status === 'won' ? 'bg-green-600' : bet.status === 'lost' ? 'bg-red-600' : 'bg-yellow-600'}>
                                {bet.status === 'won' ? 'Vinta' : bet.status === 'lost' ? 'Persa' : 'In corso'}
                              </Badge>
                            </div>
                            <h3 className="font-semibold">{bet.event}</h3>
                            <p className="text-emerald-400">{bet.prediction} @ {bet.odds}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
                              <span>Stake: €{bet.stake}</span>
                              {bet.profitLoss !== undefined && (
                                <span className={bet.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}>
                                  P/L: €{bet.profitLoss.toFixed(2)}
                                </span>
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
                            <Button size="sm" variant="ghost" className="text-red-400" onClick={() => deleteBet(bet.id)}>
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
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {activeSection === 'stats' && (
              <motion.div key="stats" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold">Statistiche</h2>
                  <p className="text-gray-400">Analisi delle tue performance</p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-blue-400">{stats.total}</p>
                      <p className="text-sm text-gray-400">Totale</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-400">{stats.winRate.toFixed(1)}%</p>
                      <p className="text-sm text-gray-400">Win Rate</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className={`text-3xl font-bold ${stats.roi >= 0 ? 'text-green-400' : 'text-red-400'}`}>{stats.roi.toFixed(1)}%</p>
                      <p className="text-sm text-gray-400">ROI</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardContent className="p-4 text-center">
                      <p className={`text-3xl font-bold ${stats.profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>€{stats.profitLoss.toFixed(2)}</p>
                      <p className="text-sm text-gray-400">Profitto</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader><CardTitle>Andamento Profitti</CardTitle></CardHeader>
                  <CardContent>
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9ca3af" />
                          <YAxis stroke="#9ca3af" />
                          <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151' }} />
                          <Line type="monotone" dataKey="cumulative" stroke="#10b981" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex items-center justify-center h-48 text-gray-400">Nessun dato</div>
                    )}
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
                    <CardTitle>Bankroll</CardTitle>
                    <CardDescription>Il tuo capitale</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4">
                      <DollarSign className="h-8 w-8 text-emerald-400" />
                      <Input 
                        type="number"
                        value={settings.bankroll}
                        onChange={(e) => updateSettings({ bankroll: Number(e.target.value) })}
                        className="bg-gray-700 border-gray-600 text-2xl font-bold w-40"
                      />
                      <span className="text-xl">€</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader><CardTitle>Predefiniti</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <Label>Eventi per suggerimento</Label>
                        <Input type="number" value={settings.defaultEventsCount} onChange={(e) => updateSettings({ defaultEventsCount: Number(e.target.value) })} className="bg-gray-700 border-gray-600 mt-1" min={1} max={20} />
                      </div>
                      <div>
                        <Label>Stake predefinito (€)</Label>
                        <Input type="number" value={settings.defaultStake} onChange={(e) => updateSettings({ defaultStake: Number(e.target.value) })} className="bg-gray-700 border-gray-600 mt-1" min={1} />
                      </div>
                    </div>
                    <div>
                      <Label>Livello Rischio</Label>
                      <Select value={settings.riskLevel} onValueChange={(v) => updateSettings({ riskLevel: v as any })}>
                        <SelectTrigger className="bg-gray-700 border-gray-600 mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Basso (2% bankroll)</SelectItem>
                          <SelectItem value="medium">Medio (5% bankroll)</SelectItem>
                          <SelectItem value="high">Alto (10% bankroll)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Database className="h-5 w-5 text-emerald-400" />
                      <span className="text-emerald-400 font-medium">Database sincronizzato</span>
                    </div>
                    <p className="text-sm text-gray-400">
                      I tuoi dati sono salvati sul server e accessibili da qualsiasi dispositivo.
                    </p>
                    <p className="text-sm text-yellow-400 mt-4">
                      ⚠️ Il gioco d'azzardo può causare dipendenza. Gioca responsabilmente.
                    </p>
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
