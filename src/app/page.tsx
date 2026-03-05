'use client';
import React, { useState, useEffect } from 'react';
import { Trophy, Zap, Loader2, BrainCircuit } from 'lucide-react';

export default function BettingPro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndAnalyze() {
      try {
        // 1. Prendi i match dall'API
        const res = await fetch('/api/bets');
        const rawMatches = await res.json();

        // 2. Chiedi al server di analizzarli tramite Groq 
        // (Passiamo per una nuova funzione API per non esporre la chiave)
        const analyzed = await Promise.all(rawMatches.map(async (m: any) => {
          try {
            const aiRes = await fetch('/api/analyze', {
              method: 'POST',
              body: JSON.stringify({
                home: m.teams.home.name,
                away: m.teams.away.name,
                league: m.league.name
              })
            });
            const aiData = await aiRes.json();
            return { ...m, ai_tip: aiData.consiglio, ai_reason: aiData.perche };
          } catch (err) {
            return { ...m, ai_tip: "Analisi...", ai_reason: "Elaborazione in corso" };
          }
        }));

        setMatches(analyzed);
      } catch (e) {
        console.error("Errore");
      } finally {
        setLoading(false);
      }
    }
    fetchAndAnalyze();
  }, []);

  return (
    // ... (Il resto della grafica rimane uguale a prima)
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-green-500 pb-4">
        <h1 className="text-4xl font-black tracking-tighter italic text-green-500">BETTING PRO AI</h1>
      </header>
      <div className="max-w-4xl mx-auto space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-green-500 mb-4" size={60} />
            <p className="text-green-500 font-black animate-pulse text-center uppercase">L'AI sta ragionando...</p>
          </div>
        ) : matches.map((match: any, i) => (
          <div key={i} className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-2xl font-black">{match.teams?.home?.name} vs {match.teams?.away?.name}</h3>
              <div className="bg-green-600 text-black font-black px-4 py-2 rounded-xl italic">{match.ai_tip}</div>
            </div>
            <div className="bg-black/50 border-l-4 border-green-500 p-4 rounded-r-xl">
              <p className="text-zinc-400 text-sm italic">"{match.ai_reason}"</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
