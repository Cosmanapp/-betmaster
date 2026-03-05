import { NextResponse } from 'next/server';

export async function GET() {
  const footballKey = process.env.FOOTBALL_API_KEY;
  const groqKey = process.env.GROQ_API_KEY; // Assicurati che su Vercel si chiami così

  // 1. Prendiamo i match di domani per avere tempo di scommettere
  const today = new Date();
  today.setDate(today.getDate() + 1);
  const tomorrow = today.toISOString().split('T')[0];
  
  const footballUrl = `https://v3.football.api-sports.io/fixtures?date=${tomorrow}&league=39&season=2024`; // Premier League test

  try {
    const res = await fetch(footballUrl, {
      headers: { 'x-apisports-key': footballKey || '' }
    });
    const footballData = await res.json();
    const matches = footballData.response?.slice(0, 3) || []; // Analizziamo i primi 3 per ora

    // 2. Facciamo ragionare l'AI per ogni match
    const analyzedMatches = await Promise.all(matches.map(async (match: any) => {
      const prompt = `Agisci come un analista di scommesse professionista. 
      Analizza il match: ${match.teams.home.name} vs ${match.teams.away.name}.
      Campionato: ${match.league.name}.
      Fornisci un pronostico secco (Es: 1, X, 2, Over 2.5) e una breve motivazione tecnica basata sulla forza delle squadre.
      Rispondi in formato JSON: {"pronostico": "...", "ragionamento": "..."}`;

      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${groqKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: "llama3-8b-8192",
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" }
        })
      });

      const groqData = await groqRes.json();
      const aiAnalysis = JSON.parse(groqData.choices[0].message.content);

      return {
        ...match,
        ai_pronostico: aiAnalysis.pronostico,
        ai_ragionamento: aiAnalysis.ragionamento
      };
    }));

    return NextResponse.json(analyzedMatches);

  } catch (error) {
    return NextResponse.json({ error: "Errore nell'analisi AI" }, { status: 500 });
  }
}
