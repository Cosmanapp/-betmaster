'use client';
import React, { useState, useEffect } from 'react';
import { Target, Info, PlusCircle, Trash2, LayoutList, History, Euro, Activity } from 'lucide-react';

export default function BettingDashboard() {
  const [view, setView] = useState<'analysis' | 'archive'>('analysis');
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState<any[]>([]); 
  const [stake, setStake] = useState(10); 
  const [savedBets, setSavedBets] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quantbet_archive');
    if (saved) {
      try { setSavedBets(JSON.parse(saved)); } catch (e) { console.error(e); }
    }

    async function load() {
      try {
        const res = await fetch('/api/bets');
        const raw = await res.json();
        if (!raw) return;
        
        const aiRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            matches: raw.map((m:any)=>({home:m.teams.home.name, away:m.teams.away.name, league:m.league.name})),
            config: "high_precision_varying"
          })
        });
        const aiData = await aiRes.json();
        setMatches(raw.map((m:any, i:number) => ({
          ...m, 
          ai_tip: aiData.analisi?.[i]?.consiglio || "1X", 
          ai_reason: aiData.analisi?.[i]?.perche || "Analisi tecnica in corso..."
        })));
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    load();
  }, []);

  const addToSlip = (m: any) => {
    if (!betSlip.find(x => x.fixture.id === m.fixture.id)) {
      setBetSlip([...betSlip, { ...m, user_odds: 1.0, user_tip: m.ai_tip }]);
    }
  };

  const saveToArchive = () => {
    const totalOddsNum = Number(betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2));
    const newBet = {
      id: Date.now(),
      date: new Date().toLocaleString('it-IT', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }),
      events: [...betSlip],
      totalOdds: totalOddsNum,
      stake: stake,
      potentialWin: (totalOddsNum * stake).toFixed(2),
      status: 'pending' 
    };
    const updatedArchive = [newBet, ...savedBets];
    setSavedBets(updatedArchive);
    localStorage.setItem('quantbet_archive', JSON.stringify(updatedArchive));
    setBetSlip([]);
    setView('archive');
  };

  const toggleStatus = (betId: number) => {
    const updated = savedBets.map(b => {
      if (b.id === betId) {
        const states: ('pending' | 'won' | 'lost')[] = ['pending', 'won', 'lost'];
        const nextStatus = states[(states.indexOf(b.status) + 1) % 3];
        return { ...b, status: nextStatus };
      }
      return b;
    });
    setSavedBets(updated);
    localStorage.setItem('quantbet_archive', JSON.stringify(updated));
  };

  const stats = savedBets.reduce((acc, b) => {
    if (b.status === 'won') acc.profit += (Number(b.potentialWin) - b.stake);
    if (b.status === 'lost') acc.profit -= b.stake;
    return acc;
  }, { profit: 0 });

  const currentTotalOdds = betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2);

  return (
    <div className="min-h-screen bg-[#050507] text-slate-100 p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
          <div onClick={() => setView('analysis')} className="cursor-pointer text-left">
            <h1 className="text-4xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[10px] font-bold tracking-[0.3em] uppercase italic">Professional Dashboard</p>
          </div>
          <div className="flex gap-2 bg-slate-900 p-1 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button onClick={() => setView('analysis')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'analysis' ? 'bg-emerald-400 text-black' : 'text-slate-500'}`}>Analisi</button>
            <button onClick={() => setView('archive')} className={`flex-1 md:flex-none px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${view === 'archive' ? 'bg-emerald-400 text-black' : 'text-slate-500'}`}>Archivio ({savedBets.length})</button>
          </div>
        </header>

        {view === 'analysis' ? (
          loading ? <div className="py-20 text-emerald-500 font-bold animate-pulse text-center uppercase tracking-widest">Sincronizzazione API...</div> : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              {matches.map((m: any, i) => (
                <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-[32px] p-6 hover:border-emerald-500/40 transition-all">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] font-black bg-slate-800 text-emerald-400 px-3 py-1 rounded-lg border border-white/5 uppercase">{m.league.name}</span>
                    <button onClick={() => addToSlip(m)} className="text-emerald-400 hover:scale-110 transition-transform"><PlusCircle size={32}/></button>
                  </div>
                  <div className="flex justify-between items-center mb-8 font-bold text-xl px-2 text-center">
                    <div className="flex-1 truncate">{m.teams.home.name}</div>
                    <div className="text-slate-700 italic px-3 text-[10px] font-black">VS</div>
                    <div className="flex-1 truncate">{m.teams.away.name}</div>
                  </div>
                  <div className="bg-slate-950/80 p-5 rounded-2xl border-l-4 border-emerald-500 shadow-lg">
                    <div className="text-emerald-400 font-black uppercase text-xs mb-1 tracking-wider italic">{m.ai_tip}</div>
                    <p className="text-[14px] text-slate-200 leading-relaxed font-medium italic">"{m.ai_reason}"</p>
                  </div>
                </div>
              ))}
            </div>
          )
        ) : (
          <div className="space-y-6 text-left animate-in fade-in duration-500">
            <div className="flex justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-slate-800 shadow-xl">
              <h2 className="text-xl font-black uppercase tracking-tighter text-emerald-400 italic">Report Profitti</h2>
              <div className={`text-3xl font-black ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>
                {stats.profit >= 0 ? '+' : ''}€ {stats.profit.toFixed(2)}
              </div>
            </div>
            
            {savedBets.length === 0 ? <p className="text-slate-600 italic">Nessun record salvato.</p> : savedBets.map((bet) => (
              <div key={bet.id} className={`p-6 rounded-[32px] border-2 transition-all ${bet.status === 'won' ? 'border-emerald-500 bg-emerald-500/10' : bet.status === 'lost' ? 'border-red-500/40 bg-red-500/5' : 'border-slate-800 bg-slate-900/40'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{bet.date}</p>
                    <p className="text-2xl font-black tracking-tight uppercase italic text-white">Vincita: € {bet.potentialWin}</p>
                  </div>
                  <button onClick={() => toggleStatus(bet.id)} className={`w-full md:w-auto px-8 py-3 rounded-xl text-[12px] font-black uppercase tracking-widest transition-all border-2 shadow-2xl ${
                      bet.status === 'won' ? 'bg-emerald-500 text-black border-emerald-300' : 
                      bet.status === 'lost' ? 'bg-red-500 text-white border-red-400' : 
                      'bg-slate-700 text-white border-slate-500'
                    }`}>
                    {bet.status === 'pending' ? '🟡 IN ATTESA' : bet.status === 'won' ? '✅ VINCENTE' : '❌ PERSA'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {bet.events.map((e:any, idx:number) => (
                    <div key={idx} className="bg-slate-950 p-3 rounded-xl border border-white/10 flex justify-between items-center shadow-inner">
                      <div className="truncate pr-2 text-left">
                        <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{e.teams.home.name} - {e.teams.away.name}</p>
                        <p className="text-sm font-black text-emerald-400 uppercase tracking-wide">{e.user_tip}</p>
                      </div>
                      <span className="text-white font-black text-xs">@{e.user_odds}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-[380px] text-left">
        <div className="bg-slate-900 border-2 border-slate-800 rounded-[40px] p-6 sticky top-8 shadow-2xl">
          <h2 className="font-black text-2xl uppercase tracking-tighter mb-6 flex gap-2 items-center"><LayoutList className="text-emerald-400"/> My Ticket</h2>
          {betSlip.length === 0 ? (
            <div className="py-12 text-center border-2 border-dashed border-slate-800 rounded-3xl">
              <p className="text-slate-600 text-[11px] font-black uppercase tracking-widest">Vuoto</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[350px] overflow-y-auto pr-1 space-y-4">
                {betSlip.map((m: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-5 rounded-3xl border border-slate-800 shadow-2xl ring-1 ring-white/5">
                    <div className="flex justify-between items-center mb-3">
                      <input 
                        type="text" 
                        value={m.user_tip} 
                        onChange={(e) => setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x, user_tip: e.target.value}:x))} 
                        className="bg-slate-900 px-4 py-2 rounded-xl text-emerald-400 font-black uppercase text-[12px] outline-none border border-emerald-500/30 w-32 focus:border-emerald-500 shadow-inner" 
                      />
                      <button onClick={()=>setBetSlip(betSlip.filter(x=>x.fixture.id!==m.fixture.id))} className="text-red-500/80 hover:text-red-500 transition-all hover:scale-110"><Trash2 size={20}/></button>
                    </div>
                    {/* TESTO MATCH INGRANDITO E PIÙ CHIARO */}
                    <p className="text-sm font-black mb-4 uppercase tracking-tighter text-white leading-tight">
                      {m.teams.home.name} <span className="text-slate-600 px-1 italic">vs</span> {m.teams.away.name}
                    </p>
                    <div className="flex items-center justify-between bg-slate-900 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Quota</span>
                      <input type="number" step="0.01" value={m.user_odds} onChange={(e)=>setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x,user_odds:parseFloat(e.target.value)||0}:x))} className="bg-transparent text-emerald-400 font-black text-lg text-right outline-none w-20" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-slate-800 space-y-4">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 shadow-inner">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Importo Giocato</span>
                  <div className="flex items-center text-emerald-400">
                    <span className="text-xl font-black mr-1">€</span>
                    <input type="number" value={stake} onChange={(e)=>setStake(Number(e.target.value))} className="bg-transparent text-right font-black outline-none w-20 text-xl" />
                  </div>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 p-6 rounded-[32px] text-center shadow-[0_10px_40px_rgba(16,185,129,0.25)] border border-emerald-400/20">
                  <p className="text-[10px] font-black text-emerald-950 uppercase mb-1 tracking-widest">Vincita Totale</p>
                  <p className="text-4xl font-black text-black tracking-tighter italic">€ {(Number(currentTotalOdds) * stake).toFixed(2)}</p>
                  <p className="text-[10px] font-bold text-emerald-900/70 mt-1 uppercase">x{currentTotalOdds} Moltiplicatore</p>
                </div>
                <button onClick={saveToArchive} className="w-full bg-white text-black font-black py-5 rounded-3xl uppercase text-[12px] tracking-[0.2em] flex justify-center gap-2 hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl shadow-white/5"><History size={18}/> Salva in Archivio</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
