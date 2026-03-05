'use client';
import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Loader2, BrainCircuit } from 'lucide-react';

export default function BettingPro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/bets');
        const data = await res.json();
        setMatches(data);
      } catch (e) {
        console.error("Errore");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-green-500 pb-4">
        <h1 className="text-4xl font-black tracking-tighter italic text-green-500">BETTING PRO AI</h1>
        <div className="bg-green-500 text-black px-3 py-1 rounded-full font-bold text-[10px] italic uppercase">
          BRAIN MODE: GROQ Llama3 ACTIVE
        </div>
      </header>

      <div className="max-w-4xl mx-auto space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2 text-zinc-300 uppercase">
          <BrainCircuit className="text-green-400" /> Analisi Intelligente Match di Domani
        </h2>
        
        {loading ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Loader2 className="animate-spin text-green-500 mb-4" size={60} />
            <p className="text-green-500 font-black animate-pulse uppercase tracking-widest">L'AI sta studiando le formazioni e le statistiche...</p>
            <p className="text-zinc-600 text-xs mt-2 italic">Questo processo richiede pochi secondi per match</p>
          </div>
        ) : matches.map((match: any, i) => (
          <div key={i} className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl overflow-hidden shadow-2xl transition-all hover:border-green-500/50">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">{match.league?.name}</span>
                  <h3 className="text-2xl font-black uppercase tracking-tighter">{match.teams?.home?.name} vs {match.teams?.away?.name}</h3>
                </div>
                <div className="bg-green-600 text-black font-black px-4 py-2 rounded-xl text-lg transform rotate-2">
                  {match.ai_tip}
                </div>
              </div>
              
              <div className="bg-black/50 border-l-4 border-green-500 p-4 rounded-r-xl relative">
                <p className="text-zinc-400 text-sm leading-relaxed italic">
                  <span className="text-green-500 font-bold not-italic uppercase text-[10px] block mb-1">Analisi Tecnica AI:</span>
                  "{match.ai_reason}"
                </p>
              </div>
            </div>
          </div>
        ))}

        {!loading && (
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-zinc-800 text-white font-black py-6 rounded-2xl uppercase hover:bg-green-600 hover:text-black transition-all"
          >
            Genera Nuove Analisi
          </button>
        )}
      </div>
    </div>
  );
}
