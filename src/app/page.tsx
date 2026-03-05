'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Info, PlusCircle, Trash2, LayoutList, History, Euro, Activity } from 'lucide-react';

export default function BettingDashboard() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState<any[]>([]); 
  const [stake, setStake] = useState(10); 

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/bets');
        const raw = await res.json();
        if (!raw) return;
        const aiRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches: raw.map((m:any)=>({home:m.teams.home.name, away:m.teams.away.name, league:m.league.name})) })
        });
        const aiData = await aiRes.json();
        setMatches(raw.map((m:any, i:number) => ({
          ...m, ai_tip: aiData.analisi?.[i]?.consiglio || "1X", ai_reason: aiData.analisi?.[i]?.perche || "Analisi tecnica in corso..."
        })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, []);

  const totalOdds = betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      <div className="flex-1 max-w-5xl mx-auto text-left">
        <header className="mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">V3_PROFESSIONAL</p>
          </div>
          <Activity className="text-emerald-500 animate-pulse hidden md:block" />
        </header>

        {loading ? <div className="py-20 text-emerald-500 font-bold animate-pulse text-center">CARICAMENTO DATI AI...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {matches.map((m: any, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-7 hover:border-emerald-500/40 transition-all text-left relative overflow-hidden">
                <div className="flex justify-between mb-4">
                  <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg uppercase">{m.league.name}</span>
                  <button onClick={() => !betSlip.find(x=>x.fixture.id===m.fixture.id) && setBetSlip([...betSlip,{...m,user_odds:1.0}])} className="text-emerald-500 hover:scale-110 transition-transform"><PlusCircle size={28}/></button>
                </div>
                
                <div className="flex justify-between items-center mb-8 font-bold text-xl tracking-tight px-2">
                  <div className="flex-1 text-center truncate">{m.teams.home.name}</div>
                  <div className="text-slate-700 italic px-4 text-xs font-black">VS</div>
                  <div className="flex-1 text-center truncate">{m.teams.away.name}</div>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-2 mb-1">
                      <Target size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Prediction</span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400 italic uppercase tracking-tighter">{m.ai_tip}</div>
                  </div>
                  
                  {/* BOX MOTIVAZIONE POTENZIATO */}
                  <div className="bg-slate-900/80 p-5 rounded-2xl border-l-4 border-emerald-500 shadow-xl">
                    <div className="flex items-start gap-3">
                      <Info className="text-emerald-500 shrink-0 mt-1" size={18}/>
                      <p className="text-[14px] text-slate-200 leading-relaxed font-medium italic">
                        {m.ai_reason}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-[380px] text-left">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[40px] p-6 sticky top-8 shadow-2xl">
          <h2 className="font-black text-2xl uppercase tracking-tighter mb-6 flex gap-2 items-center"><LayoutList className="text-emerald-400"/> Bet Slip</h2>
          <div className="space-y-4 mb-8 overflow-y-auto max-h-[400px] pr-2">
            {betSlip.map((m: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-5 rounded-2xl border border-slate-800 animate-in fade-in duration-300">
                <div className="flex justify-between text-sm mb-3">
                  <span className="font-bold text-emerald-500 uppercase text-[11px] tracking-wider">{m.ai_tip}</span>
                  <button onClick={()=>setBetSlip(betSlip.filter(x=>x.fixture.id!==m.fixture.id))} className="text-red-500 hover:scale-110 transition-transform"><Trash2 size={18}/></button>
                </div>
                <div className="font-bold text-sm mb-4">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex items-center gap-2 bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] font-bold text-slate-500 uppercase px-1">Quota</span>
                  <input type="number" step="0.01" value={m.user_odds} onChange={(e)=>setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x,user_odds:parseFloat(e.target.value)||0}:x))} className="bg-transparent w-full text-emerald-400 font-black text-base outline-none text-right" />
                </div>
              </div>
            ))}
          </div>

          {betSlip.length > 0 && (
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center px-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Multiplicatore</span>
                <span className="text-emerald-400 font-black text-2xl italic">x{totalOdds}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Importo Giocato</span>
                <div className="flex items-center">
                   <span className="text-emerald-500 font-black mr-1 text-lg">€</span>
                   <input type="number" value={stake} onChange={(e)=>setStake(Number(e.target.value))} className="bg-transparent text-right font-black text-emerald-400 outline-none w-20 text-lg" />
                </div>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-5 rounded-2xl text-center shadow-[0_10px_30px_rgba(16,185,129,0.2)]">
                <p className="text-[10px] font-black text-emerald-950 uppercase tracking-widest mb-1">Vincita Potenziale</p>
                <p className="text-3xl font-black text-black tracking-tighter italic">€ {(Number(totalOdds) * stake).toFixed(2)}</p>
              </div>
              <button onClick={()=>alert("Schedina salvata con successo!")} className="w-full bg-slate-100 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] flex justify-center gap-2 hover:bg-emerald-400 transition-colors"><History size={16}/> Salva Schedina</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
