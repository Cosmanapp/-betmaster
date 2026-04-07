const fetchAnalysis = async (query = '') => {
    setLoading(true);
    try {
      const res = await fetch(`/api/bets${query ? `?search=${query}` : ''}`);
      const data = await res.json();
      
      // Se i dati arrivano, li mettiamo subito nello stato
      if (data && Array.isArray(data)) {
        setMatches(data);
      } else {
        setMatches([]);
      }
    } catch (e) {
      console.error("Errore fetch:", e);
      setMatches([]);
    } finally {
      setLoading(false);
    }
  };
