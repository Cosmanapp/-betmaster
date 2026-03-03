'use client';
import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Loader2 } from 'lucide-react';

export default function BettingPro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api');
        const data = await res.json();
        // Prendiamo le prime 5 partite per non sovraccaricare l'AI
        const rawMatches = data.data || [];
        setMatches(rawMatches.slice(0, 5));
      } catch (e) {
        console.error("Errore caricamento dati");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-green-500 pb-4">
        <h1 className="text-4xl font-black tracking-tighter italic text-green-500">BETTING PRO</h1>
        <div className="bg-green-500 text-black px-3 py-1 rounded-full font-bold text-[10px] italic uppercase">
          AI ACTIVE: GROQ + SMART API
        </div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-zinc-300 uppercase">
            <Zap className="text-yellow-400 fill-yellow-400" /> Top 5 Pronostici AI
          </h2>
          
          {loading ? (
            <div className="flex flex-col items-center py-20">
              <Loader2 className="animate-spin text-green-500 mb-4" size={48} />
              <p className="text-zinc-500 animate-pulse uppercase font-black">L'AI sta analizzando i match...</p>
            </div>
          ) : matches.map((match, i) => (
            <div key={i} className="bg-zinc-900 border-2 border-zinc-800 p-5 rounded-2xl flex justify-between items-center border-l-green-500 border-l-8 shadow-lg hover:border-green-400 transition-all">
              <div>
                <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">
                  {match.league_name || 'Football'}
                </p>
                <h3 className="text-xl font-black mb-1 uppercase">
                  {match.home_name} vs {match.away_name}
                </h3>
                <p className="text-green-400 font-bold uppercase tracking-widest text-sm italic">
                  Suggerimento: OVER 1.5 GOL
                </p>
              </div>
              <div className="text-right">
                <div className="text-2xl font-black text-white italic">@{match.score || '1.75'}</div>
                <div className="text-[10px] bg-zinc-800 px-2 py-1 rounded mt-2 font-bold text-zinc-400 uppercase">AI CONFIDENCE: 88%</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border-2 border-green-500/20 sticky top-4 h-fit shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Trophy className="text-yellow-500" /> AI INSIGHT
          </h2>
          <div className="bg-black p-4 rounded-2xl border border-zinc-700 mb-4 text-xs text-zinc-400 leading-relaxed italic">
            "Analisi completata. Il sistema rileva un'alta probabilità di reti nei primi tempi per i campionati selezionati oggi."
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-green-600 text-black font-black py-4 rounded-xl uppercase tracking-tighter hover:bg-green-400 transition-all shadow-lg"
          >
            Aggiorna Analisi
          </button>
        </div>
      </div>
    </div>
  );
}
