'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Info, Activity } from 'lucide-react';

export default function BettingDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. Recupero i match
        const res = await fetch('/api/bets');
        const rawMatches = await res.json();
        
        if (!rawMatches || rawMatches.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Prepariamo i dati per l'invio unico all'AI
        const matchesPayload = rawMatches.map((m: any) => ({
          home: m.teams.home.name,
          away: m.teams.away.name,
          league: m.league.name
        }));

        // 3. Chiamata singola all'AI per analizzare l'intera "schedina"
        const aiRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches: matchesPayload })
        });
        
        const aiData = await aiRes.json();
        
        // 4. Uniamo i match con le rispettive analisi ricevute nell'array
        const finalData = rawMatches.map((m: any, i: number) => ({
          ...m,
          ai_tip: aiData.analisi?.[i]?.consiglio || "N/A",
          ai_reason: aiData.analisi?.[i]?.perche || "Analisi non disponibile per questo match."
        }));

        setMatches(finalData);
      } catch (e) {
        console.error("Errore nel caricamento:", e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-100 font-sans p-4 md:p-8">
      {/* Background Decor */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>

      <header className="relative z-10 max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div>
          <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent uppercase">
            Quant_Bet AI
          </h1>
          <p className="text-slate-500 text-[10px] font-medium tracking-[0.2em]">MULTIVARIATE ANALYSIS ENGINE</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-2xl backdrop-blur-md">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider italic">PlanetWin365 Feed</span>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="w-16 h-16 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin mb-6" />
            <p className="text-emerald-500 font-bold tracking-widest animate-pulse uppercase text-sm">Configurazione Schedina AI...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {matches.map((match: any, i) => (
              <div key={i} className="group bg-slate-900/40 border border-slate-800 hover:border-emerald-500/50 rounded-[32px] overflow-hidden transition-all duration-500">
                <div className="p-8">
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-slate-800 text-slate-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                      {match.league?.name}
                    </span>
                    <TrendingUp className="text-emerald-500 w-5 h-5 opacity-50" />
                  </div>

                  <div className="flex justify-between items-center mb-8">
                    <div className="text-center flex-1 font-bold text-lg">{match.teams?.home?.name}</div>
                    <div className="px-4 text-slate-700 font-black italic">VS</div>
                    <div className="text-center flex-1 font-bold text-lg">{match.teams?.away?.name}</div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-[1px] rounded-2xl">
                      <div className="bg-[#0a0a0c] rounded-2xl p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3 text-emerald-500">
                          <Target size={20} />
                          <span className="text-sm font-bold text-slate-400 uppercase">AI Pick</span>
                        </div>
                        <span className="text-xl font-black text-emerald-400 tracking-tighter uppercase">{match.ai_tip}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950/50 border border-slate-800 rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <Info className="text-slate-500 mt-1 shrink-0" size={16} />
                        <p className="text-slate-400 text-sm leading-relaxed italic italic">
                          "{match.ai_reason}"
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="h-1 w-full bg-slate-800 group-hover:bg-emerald-500 transition-colors duration-500" />
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
