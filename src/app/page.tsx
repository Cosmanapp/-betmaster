// ... (tutta la parte iniziale degli import e stati rimane uguale)

// Modifica solo la parte del return nel blocco Analysis:

{view === 'analysis' ? (
  <>
    <form onSubmit={handleSearch} className="relative mb-8 group text-left">
      <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
      <input 
        type="text" 
        placeholder="Cerca squadra o campionato (es: Inter o Serie A)..." 
        className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-5 pl-12 pr-32 text-sm font-medium focus:border-emerald-500/50 outline-none transition-all shadow-inner"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <button 
        type="submit"
        disabled={isSearching}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-500 text-black text-[10px] font-black px-4 py-2 rounded-xl uppercase hover:bg-white transition-colors disabled:opacity-50"
      >
        {isSearching ? <Loader2 className="animate-spin" size={14} /> : "Cerca"}
      </button>
    </form>

    {loading ? (
      <div className="py-24 text-center">
        <Loader2 className="animate-spin text-emerald-500 mx-auto mb-4" size={40} />
        <div className="text-emerald-500 font-black uppercase tracking-widest text-sm italic">Interrogazione Palinsesto Mondiale...</div>
      </div>
    ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left animate-in fade-in slide-in-from-bottom-2 duration-500">
        {matches.length === 0 ? (
          <div className="col-span-full py-20 text-center bg-slate-900/20 border-2 border-dashed border-slate-800 rounded-[40px]">
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Nessun match trovato</p>
          </div>
        ) : matches.map((m: any, i) => (
          <div key={i} className="bg-slate-900/30 border border-slate-800 rounded-[32px] p-6 hover:border-emerald-500/30 transition-all shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-6">
                {/* CAMPIONATO INGRANDITO */}
                <span className="text-[12px] font-black bg-slate-950 text-emerald-400 px-4 py-2 rounded-lg border border-white/5 uppercase tracking-normal">
                  {m.league.name}
                </span>
                <button onClick={() => !betSlip.find(x=>x.fixture.id===m.fixture.id) && setBetSlip([...betSlip,{...m,user_odds:1.0, user_tip: m.ai_tip}])} className="text-emerald-500 hover:scale-125 transition-transform"><PlusCircle size={32}/></button>
              </div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center p-2 border border-white/5 shadow-2xl">
                    <img src={m.teams.home.logo} alt="" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="text-[15px] font-black text-white uppercase text-center leading-none tracking-tighter">{m.teams.home.name}</span>
                </div>
                <div className="text-slate-800 font-black text-[10px] uppercase">VS</div>
                <div className="flex-1 flex flex-col items-center gap-3">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center p-2 border border-white/5 shadow-2xl">
                    <img src={m.teams.away.logo} alt="" className="w-12 h-12 object-contain" />
                  </div>
                  <span className="text-[15px] font-black text-white uppercase text-center leading-none tracking-tighter">{m.teams.away.name}</span>
                </div>
              </div>
            </div>

            {/* BOX ANALISI CON CARATTERI PIÙ GRANDI */}
            <div className="bg-slate-950 p-5 rounded-3xl border-l-4 border-emerald-500 shadow-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-emerald-500" />
                {/* PRONOSTICO INGRANDITO */}
                <span className="text-emerald-400 font-black text-[16px] uppercase italic tracking-wider">
                  {m.ai_tip}
                </span>
              </div>
              {/* COMMENTO/RAGIONAMENTO INGRANDITO */}
              <p className="text-[16px] text-white leading-snug font-semibold italic">
                "{m.ai_reason}"
              </p>
            </div>
          </div>
        ))}
      </div>
    )}
  </>
) : (
  // ... (il resto dell'archivio e della schedina rimane uguale)
