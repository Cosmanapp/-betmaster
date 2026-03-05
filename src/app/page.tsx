'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Info } from 'lucide-react';

export default function BettingDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

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
          ai_tip: aiData.analisi?.[i]?.consiglio || "1X",
          ai_reason: aiData.analisi?.[i]?.perche || "Analisi tecnica basata sui dati storici."
        }));

        setMatches(finalData);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
          <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">V3_PROFESSIONAL_ENGINE</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-full flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-emerald-500 uppercase">Live PlanetWin365 Data</span>
        </div>
      </header>

      <main className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {loading ? (
            <div className="col-span-full text-center py-20 animate-pulse text-emerald-500 font-bold uppercase tracking-widest">Inizializzazione Analisi...</div>
        ) : matches.map((match: any, i) => (
          <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-8 hover:border-emerald-500/40 transition-all duration-500 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-md text-slate-400 uppercase tracking-widest">{match.league.name}</span>
              <TrendingUp className="text-emerald-500/30" size={18} />
            </div>

            <div className="flex justify-center items-center gap-6 mb-10">
              <div className="flex-1 text-center text-xl font-bold tracking-tight">{match.teams.home.name}</div>
              <div className="text-slate-700 font-black italic">VS</div>
              <div className="flex-1 text-center text-xl font-bold tracking-tight">{match.teams.away.name}</div>
            </div>

            <div className="space-y-4">
              <div className="bg-emerald-500 p-[1px] rounded-2xl">
                <div className="bg-[#050507] rounded-2xl p-4 flex justify-between items-center">
                  <div className="flex items-center gap-3"><Target className="text-emerald-500" size={20}/><span className="text-xs font-bold text-slate-500 uppercase">AI Pick</span></div>
                  <span className="text-2xl font-black text-emerald-400 italic tracking-tighter uppercase">{match.ai_tip}</span>
                </div>
              </div>
              <div className="bg-slate-950/50 p-5 rounded-2xl border border-slate-800/50">
                <div className="flex gap-3">
                  <Info className="text-slate-600 shrink-0" size={16}/>
                  <p className="text-sm text-slate-400 leading-relaxed italic">"{match.ai_reason}"</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
