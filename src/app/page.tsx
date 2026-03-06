'use client';
import React, { useState, useEffect } from 'react';
import { Target, Search, PlusCircle, Trash2, LayoutList, History, Activity, TrendingUp } from 'lucide-react';

export default function BettingDashboard() {
  const [view, setView] = useState<'analysis' | 'archive'>('analysis');
  const [matches, setMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState<any[]>([]); 
  const [stake, setStake] = useState(10); 
  const [savedBets, setSavedBets] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quantbet_archive');
    if (saved) { try { setSavedBets(JSON.parse(saved)); } catch (e) { console.error(e); } }

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

  const filteredMatches = matches.filter(m => 
    m.teams.home.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    m.teams.away.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.league.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const saveToArchive = () => {
    const totalOddsNum = Number(betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2));
    const newBet = {
      id: Date.now(),
      date: new Date().toLocaleString('it-IT', { day: '2-digit', month: 'long', hour: '2-digit', minute: '2-digit' }),
      events: [...betSlip],
      totalOdds: totalOddsNum,
      stake: stake,
      potentialWin: (totalOddsNum * stake).toFixed(2),
      status: 'pending' 
    };
    setSavedBets([newBet, ...savedBets]);
    localStorage.setItem('quantbet_archive', JSON.stringify([newBet, ...savedBets]));
    setBetSlip([]);
    setView('archive');
  };

  const toggleStatus = (id: number) => {
    const updated = savedBets.map(b => b.id === id ? { ...b, status: b.status === 'pending' ? 'won' : b.status === 'won' ? 'lost' : 'pending' } : b);
    setSavedBets(updated);
    localStorage.setItem('quantbet_archive', JSON.stringify(updated));
  };

  const stats = savedBets.reduce((acc, b) => {
    if (b.status === 'won') acc.profit += (Number(b.potentialWin) - b.stake);
    if (b.status === 'lost') acc.profit -= b.stake;
    return acc;
  }, { profit: 0 });

  return (
    <div className="min-h-screen bg-[#020203] text-white p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center border-b border-white/10 pb-6 gap-6 text-left">
          <div onClick={() => setView('analysis')} className="cursor-pointer w-full md:w-auto">
            <h1 className="text-5xl font-black bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent uppercase tracking-tighter leading-none">QuantBet AI</h1>
            <p className="text-emerald-500 font-bold text-xs tracking-widest mt-1">SISTEMA PROFESSIONALE DI ANALISI</p>
          </div>
          
          <div className="flex gap-2 bg-white/5 p-2 rounded-3xl border border-white/10 w-full md:w-auto">
            <button onClick={() => setView('analysis')} className={`flex-1 md:px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all ${view === 'analysis' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}>Analisi</button>
            <button onClick={() => setView('archive')} className={`flex-1 md:px-8 py-3 rounded-2xl text-xs font-black uppercase transition-all ${view === 'archive' ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' : 'text-slate-400'}`}>Archivio ({savedBets.length})</button>
          </div>
        </header>

        {view === 'analysis' ? (
          <>
            <div className="relative mb-8">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              <input 
                type="text" 
                placeholder="CERCA SQUADRA O CAMPIONATO..." 
                className="w-full bg-white/5 border-2 border-white/10 rounded-3xl py-5 pl-14 pr-6 text-sm font-bold uppercase tracking-widest focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? <div className="py-20 text-emerald-500 font-black animate-pulse text-center text-xl uppercase italic">Calcolo Algoritmi...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredMatches.map((m: any, i) => (
                  <div key={i} className="bg-zinc-900/50 border-2 border-white/5 rounded-[40px] p-8 hover:border-emerald-500/40 transition-all text-left">
                    <div className="flex justify-between items-start mb-6">
                      <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tighter">{m.league.name}</span>
                      <button onClick={() => !betSlip.find(x=>x.fixture.id===m.fixture.id) && setBetSlip([...betSlip,{...m,user_odds:1.0, user_tip: m.ai_tip}])} className="bg-emerald-500 text-black p-3 rounded-2xl hover:scale-110 transition-transform"><PlusCircle size={28}/></button>
                    </div>
                    <div className="flex flex-col gap-1 mb-8">
                      <div className="text-2xl font-black text-white uppercase tracking-tighter leading-tight italic truncate">{m.teams.home.name}</div>
                      <div className="text-emerald-500 font-black text-xs px-1">VS</div>
                      <div className="text-2xl font-black text-white uppercase tracking-tighter leading-tight italic truncate">{m.teams.away.name}</div>
                    </div>
                    <div className="bg-black/40 p-5 rounded-3xl border-l-8 border-emerald-500">
                      <div className="text-emerald-400 font-black uppercase text-xs mb-2 italic">Consiglio AI: {m.ai_tip}</div>
                      <p className="text-[15px] text-slate-200 leading-snug font-medium italic">"{m.ai_reason}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500 text-left">
            <div className="bg-emerald-500 p-8 rounded-[40px] flex justify-between items-center shadow-2xl shadow-emerald-500/10 border-2 border-white/20">
              <h2 className="text-2xl font-black uppercase tracking-tighter text-black italic">Profitto Totale</h2>
              <div className="text-4xl font-black text-black">€ {stats.profit.toFixed(2)}</div>
            </div>
            
            {savedBets.map((bet) => (
              <div key={bet.id} className={`p-8 rounded-[40px] border-4 transition-all ${bet.status === 'won' ? 'border-emerald-500 bg-emerald-500/5' : bet.status === 'lost' ? 'border-red-500 bg-red-500/5' : 'border-zinc-800 bg-zinc-900/40'}`}>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <div>
                    <p className="text-sm font-black text-white uppercase tracking-widest mb-1">{bet.date}</p>
                    <p className="text-3xl font-black text-emerald-400 uppercase italic leading-none">WIN: € {bet.potentialWin}</p>
                  </div>
                  <button onClick={() => toggleStatus(bet.id)} className={`w-full md:w-auto px-10 py-4 rounded-2xl text-[12px] font-black uppercase tracking-widest border-2 transition-all ${bet.status === 'won' ? 'bg-emerald-500 text-black border-white' : bet.status === 'lost' ? 'bg-red-500 text-white border-white' : 'bg-white text-black border-transparent shadow-xl'}`}>
                    {bet.status === 'pending' ? '🟡 IN ATTESA' : bet.status === 'won' ? '✅ VINCENTE' : '❌ PERSA'}
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {bet.events.map((e:any, idx:number) => (
                    <div key={idx} className="bg-black/50 p-4 rounded-2xl border border-white/10 flex justify-between items-center">
                      <div>
                        <p className="text-sm font-black text-white uppercase mb-1">{e.teams.home.name} - {e.teams.away.name}</p>
                        <p className="text-xs font-black text-emerald-400 uppercase tracking-widest">{e.user_tip}</p>
                      </div>
                      <span className="text-xl font-black text-white italic">@{e.user_odds}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-[420px] text-left">
        <div className="bg-zinc-900 border-4 border-zinc-800 rounded-[50px] p-8 sticky top-8 shadow-2xl ring-2 ring-emerald-500/10">
          <h2 className="font-black text-3xl uppercase tracking-tighter mb-8 flex gap-3 items-center text-white italic"><LayoutList size={32} className="text-emerald-500"/> My Ticket</h2>
          {betSlip.length === 0 ? (
            <div className="py-20 text-center border-4 border-dashed border-zinc-800 rounded-[40px]">
              <p className="text-zinc-700 text-xs font-black uppercase tracking-widest">Seleziona i match</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar space-y-4">
                {betSlip.map((m: any, idx: number) => (
                  <div key={idx} className="bg-black p-6 rounded-[35px] border-2 border-zinc-800 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <input 
                        type="text" 
                        value={m.user_tip} 
                        onChange={(e) => setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x, user_tip: e.target.value}:x))} 
                        className="bg-zinc-900 px-4 py-2 rounded-xl text-emerald-400 font-black uppercase text-sm outline-none border-2 border-emerald-500/20 w-32" 
                      />
                      <button onClick={()=>setBetSlip(betSlip.filter(x=>x.fixture.id!==m.fixture.id))} className="text-red-500 hover:scale-125 transition-transform"><Trash2 size={24}/></button>
                    </div>
                    {/* NOMI SQUADRE GIGANTI NELLA SCHEDINA */}
                    <div className="flex flex-col gap-0.5 mb-5">
                      <p className="text-lg font-black uppercase text-white tracking-tighter leading-none italic">{m.teams.home.name}</p>
                      <p className="text-[10px] font-black text-zinc-600">VS</p>
                      <p className="text-lg font-black uppercase text-white tracking-tighter leading-none italic">{m.teams.away.name}</p>
                    </div>
                    <div className="flex items-center justify-between bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                      <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">QUOTA @</span>
                      <input type="number" step="0.01" value={m.user_odds} onChange={(e)=>setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x,user_odds:parseFloat(e.target.value)||0}:x))} className="bg-transparent text-emerald-400 font-black text-2xl text-right outline-none w-24" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t-4 border-zinc-800 space-y-6">
                <div className="flex justify-between items-center bg-black p-5 rounded-3xl border-2 border-zinc-800">
                  <span className="text-xs font-black text-zinc-400 uppercase tracking-widest">STAKE €</span>
                  <input type="number" value={stake} onChange={(e)=>setStake(Number(e.target.value))} className="bg-transparent text-right font-black text-emerald-400 outline-none w-24 text-2xl" />
                </div>
                <div className="bg-emerald-500 p-8 rounded-[40px] text-center shadow-2xl shadow-emerald-500/30 border-t-4 border-white/20">
                  <p className="text-xs font-black text-emerald-950 uppercase mb-1 tracking-widest">Vincita Potenziale</p>
                  <p className="text-5xl font-black text-black tracking-tighter italic leading-none">€ {(Number(betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1)) * stake).toFixed(2)}</p>
                </div>
                <button onClick={saveToArchive} className="w-full bg-white text-black font-black py-6 rounded-[35px] uppercase text-sm tracking-[0.2em] flex justify-center gap-3 hover:bg-emerald-400 transition-all active:scale-95 shadow-2xl"><History size={24}/> Salva in Archivio</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
