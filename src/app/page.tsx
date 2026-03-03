import React from 'react';
import { Trophy, Zap } from 'lucide-react';

export default function BettingPro() {
  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <header className="flex justify-between items-center mb-8 border-b-2 border-green-500 pb-4">
        <h1 className="text-4xl font-black tracking-tighter italic text-green-500">BETTING PRO</h1>
        <div className="bg-green-500 text-black px-3 py-1 rounded-full font-bold text-[10px] italic uppercase">AI: GROQ + SMART API</div>
      </header>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2 mb-4 text-zinc-300 uppercase">
            <Zap className="text-yellow-400 fill-yellow-400" /> Top 5 Pronostici AI
          </h2>
          
          <div className="bg-zinc-900 border-2 border-zinc-800 p-5 rounded-2xl flex justify-between items-center border-l-green-500 border-l-8 shadow-lg">
            <div>
              <p className="text-zinc-500 text-[10px] font-black uppercase mb-1 tracking-widest">Analisi Live</p>
              <h3 className="text-2xl font-black mb-1 uppercase">Sistema in caricamento...</h3>
              <p className="text-green-400 font-bold uppercase tracking-widest text-sm underline decoration-2 italic">L'AI sta sincronizzando i dati</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-black text-white italic">@LIVE</div>
              <div className="text-[10px] bg-zinc-800 px-2 py-1 rounded mt-2 font-bold text-zinc-400">PRECISIONE: 90%+</div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 rounded-3xl p-6 border-2 border-green-500/20 sticky top-4 h-fit shadow-[0_0_50px_-12px_rgba(34,197,94,0.3)]">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2 border-b border-zinc-800 pb-2">
            <Trophy className="text-yellow-500" /> LA TUA BOLLETTA
          </h2>
          <p className="text-zinc-500 text-xs mb-6 italic text-center uppercase font-bold tracking-tighter">Sincronizza per vedere lo storico</p>
          <div className="bg-black p-4 rounded-2xl border border-zinc-700">
            <button className="w-full bg-green-600 text-black font-black py-4 rounded-xl uppercase tracking-tighter hover:bg-green-400 transition-all shadow-lg">
              Aggiorna Dati
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
