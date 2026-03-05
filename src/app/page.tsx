'use client';
import React, { useState, useEffect } from 'react';
import { BrainCircuit, Loader2 } from 'lucide-react';

export default function BettingPro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndAnalyze() {
      try {
        const res = await fetch('/api/bets');
        const rawMatches = await res.json();
        
        // Se non ci sono match, fermati qui
        if (!rawMatches || rawMatches.length === 0) {
          setMatches([]);
          setLoading(false);
          return;
        }

        // Analizziamo solo i primi 2 match per essere sicuri che carichi subito
        const limitedMatches = rawMatches.slice(0, 2);

        const analyzed = await Promise.all(limitedMatches.map(async (m: any) => {
          try {
            const aiRes = await fetch('/api/analyze', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                home: m.teams.home.name,
                away: m.teams.away.name,
                league: m.league.name
              })
            });
            const aiData = await aiRes.json();
            return { ...m, ai_tip: aiData.consiglio, ai_reason: aiData.perche };
          } catch (err) {
            return { ...m, ai_tip: "Analisi...", ai_reason: "Errore di connessione AI" };
          }
        }));

        setMatches(analyzed);
      } catch (e) {
        console.error("Errore fetch:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchAndAnalyze();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white p-6 font-sans">
      <h1 className="text-4xl font-black text-green-500 mb-8 italic">BETTING PRO AI</h1>
      
      <div className="max-w-3xl mx-auto space-y-6">
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="animate-spin text-green-500 mb-4" size={40} />
            <p className="text-zinc-500 uppercase font-bold tracking-widest">L'AI sta ragionando...</p>
          </div>
        ) : matches.length === 0 ? (
          <p className="text-zinc-600 italic">Nessun match trovato per domani.</p>
        ) : matches.map((match: any, i) => (
          <div key={i} className="bg-zinc-900 border-2 border-zinc-800 rounded-3xl p-6 border-l-green-500 border-l-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-black uppercase">{match.teams.home.name} vs {match.teams.away.name}</h3>
              <div className="bg-green-600 text-black font-black px-4 py-1 rounded-lg">{match.ai_tip || '1X'}</div>
            </div>
            <div className="bg-black/40 p-4 rounded-xl text-zinc-400 text-sm italic">
              "{match.ai_reason || 'Analisi non pervenuta'}"
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
