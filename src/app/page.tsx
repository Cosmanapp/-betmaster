useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch('/api/bets');
        const rawMatches = await res.json();
        
        if (!rawMatches || rawMatches.length === 0) {
          setLoading(false);
          return;
        }

        // Prepariamo i dati per l'invio unico
        const matchesPayload = rawMatches.map((m: any) => ({
          home: m.teams.home.name,
          away: m.teams.away.name,
          league: m.league.name
        }));

        // Chiamata singola all'AI per tutta la lista
        const aiRes = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ matches: matchesPayload })
        });
        
        const aiData = await aiRes.json();
        
        // Uniamo i dati originali con le analisi dell'AI
        const finalData = rawMatches.map((m: any, i: number) => ({
          ...m,
          ai_tip: aiData.analisi[i]?.consiglio || "1X",
          ai_reason: aiData.analisi[i]?.perche || "Analisi in aggiornamento"
        }));

        setMatches(finalData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);
