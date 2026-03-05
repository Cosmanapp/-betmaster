'use client';
import React, { useState, useEffect } from 'react';

export default function BettingPro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAndAnalyze() {
      try {
        const res = await fetch('/api/bets');
        if (!res.ok) throw new Error("Errore nel recupero dei match");
        
        const rawMatches = await res.json();
        if (!rawMatches || rawMatches.length === 0) {
          setLoading(false);
          return;
        }

        // Proviamo ad analizzarne solo 1 per testare la velocità
        const firstMatch = rawMatches.slice(0, 1);

        const analyzed = await Promise.all(firstMatch.map(async (m: any) => {
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
            return { ...m, ai_tip: "N/A", ai_reason: "Errore durante l'analisi dell'AI" };
          }
        }));

        setMatches(analyzed);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAndAnalyze();
  }, []);

  if (error) return <div style={{color: 'red', padding: '20px'}}>Errore: {error}</div>;

  return (
    <div style={{ background: 'black', color: 'white', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <h1 style={{ color: '#22c55e', borderBottom: '2px solid #22c55e', paddingBottom: '10px' }}>
        BETTING PRO AI
      </h1>
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <p style={{ color: '#22c55e' }}>L'AI sta analizzando i match... attendere...</p>
        </div>
      ) : matches.length === 0 ? (
        <p style={{ color: '#666' }}>Nessun match trovato per oggi o domani.</p>
      ) : (
        matches.map((match: any, i: number) => (
          <div key={i} style={{ border: '1px solid #333', margin: '20px 0', padding: '20px', borderRadius: '15px', backgroundColor: '#111' }}>
            <h2 style={{ margin: '0 0 10px 0' }}>{match.teams.home.name} vs {match.teams.away.name}</h2>
            <div style={{ backgroundColor: '#22c55e', color: 'black', display: 'inline-block', padding: '5px 15px', borderRadius: '5px', fontWeight: 'bold' }}>
              PRONOSTICO: {match.ai_tip}
            </div>
            <p style={{ color: '#aaa', marginTop: '15px', fontStyle: 'italic', borderLeft: '3px solid #22c55e', paddingLeft: '10px' }}>
              "{match.ai_reason}"
            </p>
          </div>
        ))
      )}
    </div>
  );
}
