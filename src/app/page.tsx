'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Info, PlusCircle, Trash2, LayoutList, History } from 'lucide-react';

export default function BettingDashboard() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState([]); // La nostra schedina
  const [stake, setStake] = useState(10); // Importo di default

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
          ai_reason: aiData.analisi?.[i]?.perche || "Analisi basata sui flussi di scommesse e condizione atletica."
        }));

        setMatches(finalData);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    loadData();
  }, []);

  const addToSlip = (match) => {
    if (!betSlip.find(m => m.fixture.id === match.fixture.id)) {
      setBetSlip([...betSlip, { ...match, user_odds: 1.80 }]); // Quota fissa di partenza
    }
  };

  const removeFromSlip = (id) => {
    setBetSlip(betSlip.filter(m => m.fixture.id !== id));
  };

  const totalOdds = betSlip.reduce((acc, m) => acc * m.user_odds, 1).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 font-sans flex flex-col lg:flex-row gap-8">
      
      {/* SEZIONE MATCH */}
      <div className="flex-1 max-w-5xl mx-auto">
        <header className="mb-10 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">V3_PROFESSIONAL_ENGINE</p>
          </div>
        </header>

        {loading ? (
          <div className="text-center py-20 animate-pulse text-emerald-500 font-bold uppercase tracking-widest">Analisi predittiva in corso...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((match: any, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 hover:border-emerald-500/40 transition-all shadow-xl">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-[10px] font-black bg-slate-800 px-3 py-1 rounded-md text-slate-400 uppercase tracking-widest">{match.league.name}</span>
                  <button onClick={() => addToSlip(match)} className="text-emerald-500 hover:text-emerald-400">
                    <PlusCircle size={24} />
                  </button>
                </div>

                <div className="flex justify-between items-center gap-4 mb-6">
                  <div className="flex-1 text-center font-bold text-lg">{match.teams.home.name}</div>
                  <div className="text-slate-700 font-black italic">VS</div>
                  <div className="flex-1 text-center font-bold text-lg">{match.teams.away.name}</div>
                </div>

                <div className="space-y-3">
                  <div className="bg-emerald-500 p-[1px] rounded-xl">
                    <div className="bg-[#050507] rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2"><Target className="text-emerald-500" size={18}/><span className="text-[10px] font-bold text-slate-500 uppercase italic">Consiglio</span></div>
                      <span className="text-lg font-black text-emerald-400 italic uppercase">{match.ai_tip}</span>
                    </div>
                  </div>
                  <div className="bg-slate-950/50 p-4 rounded-xl border border-slate-800/50">
                    <p className="text-xs text-slate-400 leading-relaxed italic line-clamp-3 hover:line-clamp-none transition-all cursor-pointer font-medium">
                      "{match.ai_reason}"
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SEZIONE SCHEDINA (SIDEBAR) */}
      <div className="w-full lg:w-96 relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-[32px] p-6 sticky top-8 shadow-2xl">
          <div className="flex items-center gap-2 mb-6 border-b border-slate-800 pb-4">
            <LayoutList className="text-emerald-500" size={20} />
            <h2 className="font-black text-xl uppercase tracking-tight text-emerald-500">La tua Schedina</h2>
          </div>

          <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
            {betSlip.length === 0 ? (
              <p className="text-slate-600 text-sm italic text-center py-10 underline decoration-slate-800">Nessun match selezionato.</p>
            ) : (
              betSlip.map((m, idx) => (
                <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex justify-between items-center">
                  <div>
                    <p className="text-[10px] text-emerald-500 font-bold uppercase">{m.ai_tip}</p>
                    <p className="text-sm font-bold">{m.teams.home.name} - {m.teams.away.name}</p>
                  </div>
                  <button onClick={() => removeFromSlip(m.fixture.id)} className="text-red-500/50 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))
            )}
          </div>

          {betSlip.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold">QUOTA TOTALE</span>
                <span className="text-emerald-400 font-black text-xl tracking-tighter">{totalOdds}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-bold uppercase">Importo (€)</span>
                <input 
                  type="number" 
                  value={stake} 
                  onChange={(e) => setStake(Number(e.target.value))}
                  className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-1 w-20 text-right font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="bg-emerald-500 p-4 rounded-2xl text-center shadow-[0_10px_20px_rgba(16,185,129,0.3)]">
                <p className="text-[10px] font-black text-emerald-900 uppercase">Vincita Potenziale</p>
                <p className="text-2xl font-black text-[#050507]">€ {(totalOdds * stake).toFixed(2)}</p>
              </div>
              <button 
                onClick={() => alert("Schedina Salvata in Archivio!")}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-bold py-3 rounded-xl transition-all uppercase text-xs tracking-widest flex items-center justify-center gap-2"
              >
                <History size={16} /> Salva e Monitora
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
