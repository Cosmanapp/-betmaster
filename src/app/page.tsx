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
        
        // Chiediamo all'AI di analizzare i match e ne selezioniamo 5
        const analyzed = await Promise.all(rawMatches.slice(0, 5).map(async (m: any) => {
          const aiRes = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ home: m.teams.home.name, away: m.teams.away.name, league: m.league.name })
          });
          const aiData = await aiRes.json();
          return { ...m, ai_tip: aiData.consiglio, ai_reason: aiData.perche };
        }));

        setMatches(analyzed);
      } catch (e) { console.error(e); } finally { setLoading(false); }
    }
    fetchAndAnalyze();
  }, []);

  return (
    <div style={{ background: '#050505', color: '#fff', minHeight: '100vh', padding: '20px', fontFamily: 'Inter, sans-serif' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ color: '#22c55e', fontSize: '3rem', fontWeight: '900', letterSpacing: '-2px', marginBottom: '0' }}>AI ELITE BETS</h1>
        <p style={{ color: '#666', textTransform: 'uppercase', fontSize: '12px', letterSpacing: '2px' }}>I 5 migliori pronostici scelti dall'intelligenza artificiale</p>
      </header>

      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', marginTop: '100px' }}>
            <div className="spinner"></div>
            <p style={{ color: '#22c55e', marginTop: '20px', fontWeight: 'bold' }}>L'AI sta scansionando i campionati mondiali...</p>
          </div>
        ) : (
          matches.map((match: any, i) => (
            <div key={i} style={{ background: '#111', borderRadius: '24px', padding: '30px', marginBottom: '25px', border: '1px solid #222', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <span style={{ color: '#22c55e', fontSize: '12px', fontWeight: '800' }}>{match.league.name}</span>
                  <h2 style={{ fontSize: '24px', margin: '10px 0' }}>{match.teams.home.name} <span style={{ color: '#444' }}>vs</span> {match.teams.away.name}</h2>
                </div>
                <div style={{ background: '#22c55e', color: '#000', padding: '12px 24px', borderRadius: '16px', fontWeight: '900', fontSize: '20px' }}>
                  {match.ai_tip}
                </div>
              </div>
              <div style={{ marginTop: '20px', padding: '20px', background: '#000', borderRadius: '16px', borderLeft: '4px solid #22c55e' }}>
                <p style={{ color: '#ccc', lineHeight: '1.6', fontSize: '15px', fontStyle: 'italic' }}>"{match.ai_reason}"</p>
              </div>
            </div>
          ))
        )}
      </div>

      <style jsx>{`
        .spinner { border: 4px solid #111; border-top: 4px solid #22c55e; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
