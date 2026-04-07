'use client';
import React, { useState, useEffect } from 'react';
import { Search, Loader2, PlusCircle } from 'lucide-react';

export default function BettingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/bets');
      const data = await res.json();
      setMatches(Array.isArray(data) ? data : []);
    } catch (e) {
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMatches(); }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-white p-4">
      <header className="mb-8">
        <h1 className="text-3xl font-black text-emerald-400 italic">QUANTBET AI</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {matches.map((m: any, i: number) => (
            <div key={i} className="bg-slate-900/50 p-6 rounded-[30px] border border-slate-800">
              <div className="text-[10px] text-emerald-400 font-bold mb-2 uppercase">{m.league?.name}</div>
              <div className="flex justify-between items-center mb-4 font-bold text-sm">
                <span>{m.teams?.home?.name}</span>
                <span className="text-slate-600 px-2">VS</span>
                <span>{m.teams?.away?.name}</span>
              </div>
              <div className="bg-black/40 p-3 rounded-xl border-l-4 border-emerald-500">
                <div className="text-emerald-400 font-bold text-xs">{m.ai_tip || '1X'}</div>
                <div className="text-[10px] text-slate-400 italic">{m.ai_reason}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
