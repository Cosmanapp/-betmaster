'use client';
import React, { useState, useEffect } from 'react';
import { Target, TrendingUp, Info, PlusCircle, Trash2, LayoutList, History, Euro, Activity, CheckCircle2, XCircle } from 'lucide-react';

export default function BettingDashboard() {
  const [view, setView] = useState<'analysis' | 'archive'>('analysis');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState<any[]>([]); 
  const [stake, setStake] = useState(10); 
  const [savedBets, setSavedBets] = useState<any[]>([]);

  // Caricamento dati iniziali e Archivio
  useEffect(() => {
    const saved = localStorage.getItem('quantbet_archive');
    if (saved) setSavedBets(JSON.parse(saved));

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

  const saveToArchive = () => {
    const newBet = {
      id: Date.now(),
      date: new Date().toLocaleDateString(),
      events: betSlip,
      totalOdds: totalOdds,
      stake: stake,
      potentialWin: (Number(totalOdds) * stake).toFixed(2),
      status: 'pending' // pending, won, lost
    };
    const updatedArchive = [newBet, ...savedBets];
    setSavedBets(updatedArchive);
    localStorage.setItem('quantbet_archive', JSON.stringify(updatedArchive));
    setBetSlip([]);
    alert("Schedina salvata nell'archivio!");
  };

  const toggleStatus = (betId: number) => {
    const updated = savedBets.map(b => {
      if (b.id === betId) {
        const nextStatus = b.status === 'pending' ? 'won' : b.status === 'won' ? 'lost' : 'pending';
        return { ...b, status: nextStatus };
      }
      return b;
    });
    setSavedBets(updated);
    localStorage.setItem('quantbet_archive', JSON.stringify(updated));
  };

  const totalOdds = betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      <div className="flex-1 max-w-5xl mx-auto text-left">
        <header className="mb-10 flex justify-between items-center border-b border-slate-800 pb-6">
          <div onClick={() => setView('analysis')} className="cursor-pointer">
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase italic">Smart Betting Hub</p>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => setView('analysis')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'analysis' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-400'}`}
            >
              Analisi
            </button>
            <button 
              onClick={() => setView('archive')}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${view === 'archive' ? 'bg-emerald-500 text-black' : 'bg-slate-900 text-slate-400'}`}
            >
              Archivio ({savedBets.length})
            </button>
          </div>
        </header>

        {view === 'analysis' ? (
          loading ? <div className="py-20 text-emerald-500 font-bold animate-pulse text-center">GENERAZIONE ANALISI...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {matches.map((m: any, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-7 hover:border-emerald-500/40 transition-all text-left">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-lg uppercase">{m.league.name}</span>
                    <button onClick={() => !betSlip.find(x=>x.fixture.id===m.fixture.id) && setBetSlip([...betSlip,{...m,user_odds:1.0, user_tip: m.ai_tip}])} className="text-emerald-500 hover:scale-110 transition-transform"><PlusCircle size={28}/></button>
                  </div>
                  <div className="flex justify-between items-center mb-8 font-bold text-xl px-2">
                    <div className="flex-1 text-center truncate">{m.teams.home.name}</div>
                    <div className="text-slate-700 italic px-4 text-xs font-black uppercase">vs</div>
                    <div className="flex-1 text-center truncate">{m.teams.away.name}</div>
                  </div>
                  <div className="space-y-4">
                    <div className="bg-slate-900/80 p-5 rounded-2xl border-l-4 border-emerald-500">
                      <p className="text-[14px] text-slate-200 leading-relaxed font-medium italic">"{m.ai_reason}"</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6">
            <h2 className="text-2xl font-black uppercase italic tracking-tighter text-emerald-500">Storico Giocate</h2>
            {savedBets.length === 0 ? <p className="text-slate-500 italic">Nessuna schedina salvata.</p> : savedBets.map((bet) => (
              <div key={bet.id} className={`p-6 rounded-[24px] border-2 ${bet.status === 'won' ? 'border-emerald-500/50 bg-emerald-500/5' : bet.status === 'lost' ? 'border-red-500/50 bg-red-500/5' : 'border-slate-800 bg-slate-900/20'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase">{bet.date} - {bet.events.length} Eventi</p>
                    <p className="text-lg font-black tracking-tight">Vincita: € {bet.potentialWin} (x{bet.totalOdds})</p>
                  </div>
                  <button onClick={() => toggleStatus(bet.id)} className={`px-4 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${bet.status === 'won' ? 'bg-emerald-500 text-black' : bet.status === 'lost' ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300'}`}>
                    {bet.status}
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {bet.events.map((e:any, idx:number) => (
                    <div key={idx} className="text-[11px] bg-slate-950 p-2 rounded-lg border border-white/5">
                      <span className="text-emerald-500 font-bold">{e.user_tip}</span> @{e.user_odds}
                      <p className="text-slate-500 truncate">{e.teams.home.name.substring(0,3)}-{e.teams.away.name.substring(0,3)}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SCHEDINA DINAMICA */}
      <div className="w-full lg:w-[380px] text-left">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[40px] p-6 sticky top-8 shadow-2xl transition-all">
          <h2 className="font-black text-2xl uppercase tracking-tighter mb-6 flex gap-2 items-center"><LayoutList className="text-emerald-400"/> Bet Slip</h2>
          <div className="space-y-4 mb-8 overflow-y-auto max-h-[350px] pr-2">
            {betSlip.length === 0 ? <div className="py-12 text-center text-slate-600 italic uppercase text-[10px] tracking-widest">Seleziona Match</div> : betSlip.map((m: any, idx: number) => (
              <div key={idx} className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                <div className="flex justify-between items-start mb-2">
                   {/* PRONOSTICO EDITABILE */}
                  <input 
                    type="text" 
                    value={m.user_tip} 
                    onChange={(e) => setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x, user_tip: e.target.value}:x))}
                    className="bg-transparent text-emerald-500 font-black uppercase text-[12px] outline-none border-b border-emerald-500/20 w-24"
                  />
                  <button onClick={()=>setBetSlip(betSlip.filter(x=>x.fixture.id!==m.fixture.id))} className="text-red-500 opacity-50 hover:opacity-100"><Trash2 size={16}/></button>
                </div>
                <div className="font-bold text-[12px] mb-3">{m.teams.home.name} - {m.teams.away.name}</div>
                <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                  <span className="text-[9px] font-bold text-slate-500 uppercase px-1">Quota</span>
                  <input type="number" step="0.01" value={m.user_odds} onChange={(e)=>setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x,user_odds:parseFloat(e.target.value)||0}:x))} className="bg-transparent w-full text-emerald-400 font-black text-sm text-right outline-none" />
                </div>
              </div>
            ))}
          </div>

          {betSlip.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-800">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Stake</span>
                <div className="flex items-center"><span className="text-emerald-500 font-black mr-1">€</span>
                <input type="number" value={stake} onChange={(e)=>setStake(Number(e.target.value))} className="bg-transparent text-right font-black text-emerald-400 w-16 outline-none" /></div>
              </div>
              <div className="bg-emerald-500 p-4 rounded-2xl text-center">
                <p className="text-[10px] font-black text-emerald-950 uppercase mb-1 italic">Vincita Potenziale</p>
                <p className="text-3xl font-black text-black tracking-tighter italic">€ {(Number(totalOdds) * stake).toFixed(2)}</p>
              </div>
              <button onClick={saveToArchive} className="w-full bg-slate-100 text-black font-black py-4 rounded-2xl uppercase text-[10px] tracking-[0.2em] flex justify-center gap-2 hover:bg-emerald-400 transition-all"><History size={16}/> Salva in Archivio</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
