'use client';
import React, { useState, useEffect } from 'react';

export default function BettingPro() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAndAnalyze() {
      try {
        const res = await fetch('/api/bets');
        const rawMatches = await res.json();
        
        if (!rawMatches || rawMatches.length === 0) {
          setLoading(false);
          return;
        }

        // Analizziamo i match uno per uno inviandoli a Groq
        const analyzed = await Promise.all(rawMatches.map(async (m: any) => {
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
            return { ...m, ai_tip: "Analisi...", ai_reason: "Errore di connessione con Groq" };
          }
        }));

        setMatches(analyzed);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchAndAnalyze();
  }, []);

  return (
    <div style={{ background: '#000', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'sans-serif' }}>
      <header style={{ borderBottom: '2px solid #22c55e', marginBottom: '30px', paddingBottom: '10px' }}>
        <h1 style={{ color: '#22c55e', margin: 0, fontStyle: 'italic', fontWeight: '900' }}>BETTING PRO AI</h1>
        <p style={{ fontSize: '10px', color: '#666' }}>ANALISI REAL-TIME: GROQ + API-SPORTS</p>
      </header>
      
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <div style={{ border: '4px solid #22c55e', borderTop: '4px solid transparent', borderRadius: '50%', width: '40px', height: '40px', animation: 'spin 1s linear infinite', margin: '0 auto 20px' }}></div>
            <p style={{ color: '#22c55e', fontWeight: 'bold' }}>L'AI STA ANALIZZANDO I MATCH DI DOMANI...</p>
          </div>
        ) : matches.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#444', border: '1px dashed #444', padding: '40px', borderRadius: '20px' }}>
            Nessun match trovato per il 6 Marzo. Prova a ricaricare tra poco.
          </div>
        ) : (
          matches.map((match: any, i: number) => (
            <div key={i} style={{ background: '#111', border: '1px solid #222', borderLeft: '6px solid #22c55e', borderRadius: '15px', padding: '20px', marginBottom: '20px shadow: 0 10px 15px -3px rgba(0,0,0,0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontSize: '10px', color: '#22c55e', fontWeight: 'bold' }}>{match.league.name}</span>
                  <h2 style={{ margin: '5px 0', fontSize: '20px' }}>{match.teams.home.name} <span style={{ color: '#444' }}>vs</span> {match.teams.away.name}</h2>
                </div>
                <div style={{ background: '#22c55e', color: '#000', padding: '8px 15px', borderRadius: '8px', fontWeight: 'bold' }}>
                  {match.ai_tip}
                </div>
              </div>
              <div style={{ marginTop: '15px', background: '#000', padding: '15px', borderRadius: '10px', fontSize: '14px', color: '#ccc', fontStyle: 'italic' }}>
                <span style={{ color: '#22c55e', fontWeight: 'bold', fontStyle: 'normal', display: 'block', fontSize: '10px', marginBottom: '5px' }}>AI INSIGHT:</span>
                "{match.ai_reason}"
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx global>{`
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
