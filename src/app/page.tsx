'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Info, PlusCircle, Trash2, LayoutList, History, Euro } from 'lucide-react';

export default function BettingDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState([]); 
  const [stake, setStake] = useState(10); 

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/bets');
        const rawMatches = await res.json();
        if (!rawMatches || rawMatches.length === 0) { setLoading(false); return; }

        const payload = rawMatches.map((m: any) => ({
          home: m.teams.home.name,
          away: m.teams.away.name,
          league: m.league.name
        }));

        const aiRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches: payload })
        });
        
        const aiData = await aiRes.json();
        const finalData = rawMatches.map((m: any, i: number) => ({
          ...m,
          ai_tip: aiData.analisi?.[i]?.consiglio || "X2",
          ai_reason: aiData.analisi?.[i]?.perche || "Analisi tecnica basata sui dati storici."
        }));

        setMatches(finalData);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const addToSlip = (match) => {
    if (!betSlip.find(m => m.fixture.id === match.fixture.id)) {
      // Inizializziamo con una quota 1.00 che l'utente cambierà
      setBetSlip([...betSlip, { ...match, user_odds: 1.00 }]);
    }
  };

  const updateOdds = (id, val) => {
    const newSlip = betSlip.map(m => 
      m.fixture.id === id ? { ...m, user_odds: parseFloat(val) || 0 } : m
    );
    setBetSlip(newSlip);
  };

  const removeFromSlip = (id) => {
    setBetSlip(betSlip.filter(m => m.fixture.id !== id));
  };

  const totalOdds = betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 font-sans flex flex-col lg:flex-row gap-8">
      
      {/* SEZIONE MATCH */}
      <div className="flex-1 max-w-5xl mx-auto">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">V3_PROFESSIONAL_ENGINE</p>
          </div>
          <div className="bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl hidden md:flex items-center gap-3">
             <Activity className="text-emerald-500 animate-pulse" size={16} />
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Live Analysis Active</span>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-emerald-500 font-bold uppercase tracking-widest">Elaborazione Schedina...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match: any, i) => (
              <div key={i} className="group bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 hover:border-emerald-500/40 transition-all shadow-xl relative overflow-hidden">
                <div className="flex justify-between items-center mb-4 relative z-10">
                  <span className="text-[9px] font-black bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded border border-emerald-500/20 uppercase tracking-widest">{match.league.name}</span>
                  <button onClick={() => addToSlip(match)} className="bg-emerald-500 text-black p-2 rounded-xl hover:scale-110 transition-transform shadow-lg shadow-emerald-500/20">
                    <PlusCircle size={20} />
                  </button>
                </div>

                <div className="flex justify-between items-center gap-4 mb-8 relative z-10">
                  <div className="flex-1 text-center font-bold text-lg">{match.teams.home.name}</div>
                  <div className="text-slate-700 font-black italic text-sm">VS</div>
