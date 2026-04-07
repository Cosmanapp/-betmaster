'use client';
import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

export default function BettingPage() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const res = await fetch('/api/bets', { cache: 'no-store' });
        const data = await res.json();
        setMatches(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("Errore fetch:", e);
        setMatches([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMatches();
  }, []); // [] assicura che venga eseguito UNA SOLA VOLTA all'avvio

  return (
    <div className="min-h-screen bg-[#08080a] text-white p-6">
      <h1 className="text-2xl font-black text-emerald-400 mb-8 italic">QUANTBET AI</h1>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-emerald-500" size={40} /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.length > 0 ? matches.map((m: any, i: number) => (
            <div key={i} className="bg-slate-900/50 p-6 rounded-[30px] border border-slate-800 shadow-xl">
              <div className="text-[10px] text-emerald-400 font-bold mb-2 uppercase tracking-widest">{m.league?.name}</div>
              <div className="flex justify-between items-center mb-6 font-bold">
                <span>{m.teams?.home?.name}</span>
                <span className="text-slate-600 text-xs px-2">VS</span>
                <span>{m.teams?.away?.name}</span>
              </div>
              <div className="bg-black/40 p-4 rounded-2xl border-l-4 border-emerald-500">
                <div className="text-emerald-400 font-bold text-xs mb-1">{m.ai_tip}</div>
                <div className="text-[11px] text-slate-400 leading-relaxed">{m.ai_reason}</div>
              </div>
            </div>
          )) : (
            <div className="col-span-full text-center p-10 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
              <p className="text-slate-500">Nessun match disponibile al momento.</p>
              <p className="text-[10px] text-slate-600 mt-2 italic text-emerald-900">Verifica la connessione API in route.ts</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
