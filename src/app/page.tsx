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
          ...m, ai_tip: aiData.analisi?.[i]?.consiglio || "1X", ai_reason: aiData.analisi?.[i]?.perche || "Analisi tecnica."
        })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, []);

  const totalOdds = betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      <div className="flex-1 max-w-5xl mx-auto text-left">
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase">V3_PROFESSIONAL</p>
          </div>
          <Activity className="text-emerald-500 animate-pulse hidden md:block" />
        </header>

        {loading ? <div className="py-20 text-emerald-500 font-bold animate-pulse text-center">CARICAMENTO...</div> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {matches.map((m: any, i) => (
              <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 hover:border-emerald-500/40 transition-all text-left">
                <div className="flex justify-between mb-4">
                  <span className="text-[9px] font-black bg-slate-800 text-slate-400 px-2 py-1 rounded uppercase">{m.league.name}</span>
                  <button onClick={() => !betSlip.find(x=>x.fixture.id===m.fixture.id) && setBetSlip([...betSlip,{...m,user_odds:1.0}])} className="text-emerald-500"><PlusCircle/></button>
                </div>
                <div className="flex justify-between items-center mb-6 font-bold text-lg">
                  <div className="flex-1 text-center">{m.teams.home.name}</div>
                  <div className="text-slate-700 italic px-2 text-sm">VS</div>
                  <div className="flex-1 text-center">{m.teams.away.name}</div>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-2">
                  <div className="text-emerald-400 font-black italic uppercase">{m.ai_tip}</div>
                </div>
                <p className="text-[11px] text-slate-500 italic line-clamp-2 hover:line-clamp-none transition-all">"{m.ai_reason}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-[380px] text-left">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[40px] p-6 sticky top-8 shadow-2xl">
          <h2 className="font-black text-2xl uppercase tracking-tighter mb-6 flex gap-2"><LayoutList className="text-emerald-400"/> Bet Slip</h2>
          <div className="space-y-4 mb-8">
            {betSlip.map((m: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between text-sm mb-2">
                  <span className="font-bold">{m.teams.home.name.substring(0,3)}-{m.teams.away.name.substring(0,3)}</span>
                  <button onClick={()=>setBetSlip(betSlip.filter(x=>x.fixture.id!==m.fixture.id))} className="text-red-500"><Trash2 size={16}/></button>
                </div>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-500 uppercase">QUOTA</span>
                  <input type="number" step="0.01" value={m.user_odds} onChange={(e)=>setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x,user_odds:parseFloat(e.target.value)||0}:x))} className="bg-transparent w-full text-emerald-400 font-black text-sm outline-none" />
                </div>
              </div>
            ))}
          </div>
          {betSlip.length > 0 && (
            <div className="space-y-4 border-t border-slate-800 pt-6">
              <div className="flex justify-between items-center"><span className="text-xs font-bold text-slate-500">MOLTIPLICATORE</span><span className="text-emerald-400 font-black text-xl italic">x{totalOdds}</span></div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-xs font-bold text-slate-400">STAKE (€)</span>
                <input type="number" value={stake} onChange={(e)=>setStake(Number(e.target.value))} className="bg-transparent text-right font-black text-emerald-400 outline-none w-16" />
              </div>
              <div className="bg-emerald-500 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-emerald-900 uppercase">Vincita</p>
                <p className="text-2xl font-black text-black">€ {(Number(totalOdds) * stake).toFixed(2)}</p>
              </div>
              <button onClick={()=>alert("Salvata!")} className="w-full bg-slate-100 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-widest flex justify-center gap-2"><History size={16}/> Salva Schedina</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
