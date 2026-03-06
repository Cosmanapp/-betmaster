'use client';
import React, { useState, useEffect } from 'react';
import { Target, Search, PlusCircle, Trash2, LayoutList, History, Trophy } from 'lucide-react';

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

  const filteredMatches = matches.filter(m => {
    const search = searchTerm.toLowerCase();
    return m.teams.home.name.toLowerCase().includes(search) || 
           m.teams.away.name.toLowerCase().includes(search) ||
           m.league.name.toLowerCase().includes(search);
  });

  const addToSlip = (m: any) => {
    if (!betSlip.find(x => x.fixture.id === m.fixture.id)) {
      setBetSlip([...betSlip, { ...m, user_odds: 1.0, user_tip: m.ai_tip }]);
    }
  };

  const saveToArchive = () => {
    const totalOddsNum = Number(betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2));
    const newBet = {
      id: Date.now(),
      date: new Date().toLocaleString('it-IT', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }),
      events: [...betSlip],
      totalOdds: totalOddsNum,
      stake: stake,
      potentialWin: (totalOddsNum * stake).toFixed(2),
      status: 'pending' 
    };
    const updated = [newBet, ...savedBets];
    setSavedBets(updated);
    localStorage.setItem('quantbet_archive', JSON.stringify(updated));
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
    <div className="min-h-screen bg-[#08080a] text-slate-100 p-4 md:p-8 flex flex-col lg:flex-row gap-8 font-sans">
      <div className="flex-1 max-w-5xl mx-auto w-full">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center border-b border-slate-800 pb-6 gap-6">
          <div onClick={() => setView('analysis')} className="cursor-pointer text-left w-full md:w-auto">
            <h1 className="text-3xl font-black bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">QuantBet AI</h1>
            <p className="text-slate-500 text-[9px] font-bold tracking-[0.3em] uppercase italic">Professional Analytics</p>
          </div>
          <div className="flex gap-2 bg-slate-900/50 p-1.5 rounded-2xl border border-slate-800 w-full md:w-auto">
            <button onClick={() => setView('analysis')} className={`flex-1 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'analysis' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Analisi</button>
            <button onClick={() => setView('archive')} className={`flex-1 md:px-6 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${view === 'archive' ? 'bg-emerald-500 text-black' : 'text-slate-500'}`}>Archivio ({savedBets.length})</button>
          </div>
        </header>

        {view === 'analysis' ? (
          <>
            <div className="relative mb-8 group text-left">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
              <input 
                type="text" 
                placeholder="Cerca squadra o campionato..." 
                className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? <div className="py-20 text-emerald-500 font-bold animate-pulse text-center uppercase tracking-widest text-sm italic">Sincronizzazione loghi e quote...</div> : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                {filteredMatches.map((m: any, i) => (
                  <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-[28px] p-6 hover:border-emerald-500/30 transition-all">
                    <div className="flex justify-between items-center mb-6">
                      <span className="text-[9px] font-black bg-slate-800 text-slate-300 px-3 py-1 rounded-md border border-white/5 uppercase">{m.league.name}</span>
                      <button onClick={() => addToSlip(m)} className="text-emerald-500 hover:scale-125 transition-transform"><PlusCircle size={32}/></button>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-8">
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img src={m.teams.home.logo} alt="" className="w-12 h-12 object-contain drop-shadow-lg" />
                        <span className="text-sm font-black text-white uppercase text-center leading-tight">{m.teams.home.name}</span>
                      </div>
                      <div className="text-slate-700 font-black text-xs italic">VS</div>
                      <div className="flex-1 flex flex-col items-center gap-2">
                        <img src={m.teams.away.logo} alt="" className="w-12 h-12 object-contain drop-shadow-lg" />
                        <span className="text-sm font-black text-white uppercase text-center leading-tight">{m.teams.away.name}</span>
                      </div>
                    </div>

                    <div className="bg-slate-950 p-5 rounded-2xl border-l-4 border-emerald-500 shadow-inner">
                      <div className="flex items-center gap-2 mb-2">
                        <Trophy size={14} className="text-emerald-500" />
                        <span className="text-emerald-400 font-black text-[12px] uppercase italic tracking-wider">{m.ai_tip}</span>
                      </div>
                      <p className="text-[14px] text-slate-200 leading-relaxed font-medium italic">"{m.ai_reason}"</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-6 text-left">
             <div className="flex justify-between items-center bg-slate-900/80 p-6 rounded-[28px] border border-slate-800">
              <h2 className="text-lg font-black uppercase text-emerald-500 italic">Bilancio Totale</h2>
              <div className={`text-2xl font-black ${stats.profit >= 0 ? 'text-emerald-400' : 'text-red-500'}`}>€ {stats.profit.toFixed(2)}</div>
            </div>
            {savedBets.map((bet) => (
              <div key={bet.id} className={`p-6 rounded-[28px] border-2 transition-all ${bet.status === 'won' ? 'border-emerald-500/50 bg-emerald-500/5' : bet.status === 'lost' ? 'border-red-500/30 bg-red-500/5' : 'border-slate-800 bg-slate-900/40'}`}>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col gap-2">
                    <span className="text-[11px] font-black text-white uppercase tracking-widest bg-emerald-500/20 text-emerald-400 px-4 py-1 rounded-full self-start">{bet.date}</span>
                    <p className="text-2xl font-black text-white italic uppercase leading-none">Vincita: € {bet.potentialWin}</p>
                  </div>
                  <button onClick={() => toggleStatus(bet.id)} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase border-2 transition-all ${bet.status === 'won' ? 'bg-emerald-500 text-black border-white' : bet.status === 'lost' ? 'bg-red-500 text-white border-white' : 'bg-slate-700 text-white border-slate-500'}`}>
                    {bet.status === 'pending' ? '🟡 IN ATTESA' : bet.status === 'won' ? '✅ VINCENTE' : '❌ PERSA'}
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {bet.events.map((e:any, idx:number) => (
                    <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 flex items-center gap-4">
                      <div className="flex -space-x-3">
                        <img src={e.teams.home.logo} className="w-8 h-8 rounded-full bg-slate-900 p-1 border border-white/10" />
                        <img src={e.teams.away.logo} className="w-8 h-8 rounded-full bg-slate-900 p-1 border border-white/10" />
                      </div>
                      <div className="flex-1 truncate">
                        <p className="text-[11px] font-black text-white uppercase truncate">{e.teams.home.name} - {e.teams.away.name}</p>
                        <p className="text-xs font-black text-emerald-400">{e.user_tip} @{e.user_odds}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="w-full lg:w-[400px] text-left">
        <div className="bg-slate-900 border border-slate-800 rounded-[40px] p-6 sticky top-8 shadow-2xl">
          <h2 className="font-black text-xl uppercase tracking-tighter mb-8 flex gap-2 items-center text-white italic"><LayoutList size={24} className="text-emerald-500"/> Schedina</h2>
          {betSlip.length === 0 ? (
            <div className="py-20 text-center border-2 border-dashed border-slate-800 rounded-[32px] text-slate-700 text-[10px] font-black uppercase tracking-widest italic">Seleziona Match</div>
          ) : (
            <div className="space-y-4">
              <div className="max-h-[450px] overflow-y-auto pr-1 space-y-4 custom-scrollbar">
                {betSlip.map((m: any, idx: number) => (
                  <div key={idx} className="bg-slate-950 p-5 rounded-[30px] border border-slate-800 shadow-xl">
                    <div className="flex justify-between items-center mb-4">
                      <input 
                        type="text" 
                        value={m.user_tip} 
                        onChange={(e) => setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x, user_tip: e.target.value}:x))} 
                        className="bg-slate-900 px-4 py-2 rounded-xl text-emerald-400 font-black uppercase text-xs outline-none border border-emerald-500/20 w-32 focus:border-emerald-500" 
                      />
                      <button onClick={()=>setBetSlip(betSlip.filter(x=>x.fixture.id!==m.fixture.id))} className="text-red-500 hover:scale-110"><Trash2 size={20}/></button>
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <img src={m.teams.home.logo} className="w-8 h-8 object-contain" />
                      <div className="flex-1 text-[13px] font-black text-white uppercase leading-tight">
                        {m.teams.home.name} <br/> {m.teams.away.name}
                      </div>
                      <img src={m.teams.away.logo} className="w-8 h-8 object-contain" />
                    </div>
                    <div className="flex items-center justify-between bg-slate-900/50 p-3 rounded-2xl border border-slate-800">
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Quota</span>
                      <input type="number" step="0.01" value={m.user_odds} onChange={(e)=>setBetSlip(betSlip.map(x=>x.fixture.id===m.fixture.id?{...x,user_odds:parseFloat(e.target.value)||0}:x))} className="bg-transparent text-emerald-400 font-black text-xl text-right outline-none w-20" />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-6 border-t border-slate-800 space-y-5">
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Stake (€)</span>
                  <input type="number" value={stake} onChange={(e)=>setStake(Number(e.target.value))} className="bg-transparent text-right font-black text-emerald-400 outline-none w-20 text-xl" />
                </div>
                <div className="bg-emerald-500 p-6 rounded-[30px] text-center shadow-xl shadow-emerald-500/10">
                  <p className="text-[10px] font-black text-emerald-950 uppercase mb-1 tracking-widest">Vincita Totale</p>
                  <p className="text-3xl font-black text-black tracking-tighter italic">€ {(Number(betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1)) * stake).toFixed(2)}</p>
                </div>
                <button onClick={saveToArchive} className="w-full bg-white text-black font-black py-5 rounded-[28px] uppercase text-[11px] tracking-[0.2em] flex justify-center gap-2 hover:bg-emerald-400 transition-all shadow-xl active:scale-95"><History size={18}/> Salva in Archivio</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
