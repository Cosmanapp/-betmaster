'use client';
import React, { useState, useEffect } from 'react';
import { Search, PlusCircle, Trash2, LayoutList, History, Trophy, Loader2 } from 'lucide-react';

export default function BettingDashboard() {
  const [view, setView] = useState('analysis');
  const [matches, setMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [betSlip, setBetSlip] = useState<any[]>([]);
  const [stake, setStake] = useState(10);
  const [savedBets, setSavedBets] = useState<any[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('quantbet_archive');
    if (saved) { try { setSavedBets(JSON.parse(saved)); } catch (e) {} }
    fetchAnalysis();
  }, []);

  const fetchAnalysis = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bets${query ? `?search=${query}` : ''}`);
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  const saveToArchive = () => {
    const totalOddsNum = Number(betSlip.reduce((acc, m) => acc * (m.user_odds || 1), 1).toFixed(2));
    const newBet = {
      id: Date.now(),
      date: new Date().toLocaleString(),
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

  return (
    <div className="min-h-screen bg-[#08080a] text-white p-4 font-sans text-left">
      <header className="mb-8 border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-black text-emerald-400 italic">QUANTBET AI</h1>
        <div className="flex gap-4 mt-4">
          <button onClick={() => setView('analysis')} className={`px-4 py-2 rounded-xl text-xs font-bold ${view === 'analysis' ? 'bg-emerald-500 text-black' : 'bg-slate-800'}`}>ANALISI</button>
          <button onClick={() => setView('archive')} className={`px-4 py-2 rounded-xl text-xs font-bold ${view === 'archive' ? 'bg-emerald-500 text-black' : 'bg-slate-800'}`}>ARCHIVIO</button>
        </div>
      </header>

      {loading ? (
        <div className="text-center py-20"><Loader2 className="animate-spin mx-auto text-emerald-500" size={40} /></div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="flex-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {matches.map((m: any, i: number) => (
                <div key={i} className="bg-slate-900/50 p-6 rounded-[30px] border border-slate-800">
                  <div className="flex justify-between mb-4">
                    <span className="text-[10px] text-emerald-400 font-bold uppercase">{m.league?.name}</span>
                    <button onClick={() => setBetSlip([...betSlip, {...m, user_odds: 1.5, user_tip: '1X'}])}><PlusCircle className="text-emerald-500" /></button>
                  </div>
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-center flex-1 font-bold">{m.teams?.home?.name}</div>
                    <div className="px-4 text-slate-600 text-xs">VS</div>
                    <div className="text-center flex-1 font-bold">{m.teams?.away?.name}</div>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border-l-4 border-emerald-500">
                    <div className="text-emerald-400 font-black text-sm mb-1">{m.ai_tip || '1X'}</div>
                    <div className="text-xs text-slate-300 italic">"{m.ai_reason || 'Analisi disponibile a breve...'}"</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="w-full lg:w-80">
            <div className="bg-slate-900 p-6 rounded-[30px] border border-slate-800 sticky top-4">
              <h2 className="font-black mb-4 italic">SCHEDINA</h2>
              {betSlip.map((s, idx) => (
                <div key={idx} className="text-xs mb-4 border-b border-slate-800 pb-2 flex justify-between">
                  <span>{s.teams.home.name}</span>
                  <button onClick={() => setBetSlip(betSlip.filter((_, j) => j !== idx))}><Trash2 size={14} className="text-red-500"/></button>
                </div>
              ))}
              {betSlip.length > 0 && (
                <button onClick={saveToArchive} className="w-full bg-emerald-500 text-black font-black py-3 rounded-xl mt-4">SALVA</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
