import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { home, away, league } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    const prompt = `Sei un esperto scommettitore professionista e analista di dati calcistici.
    Analizza il match: ${home} vs ${away} (${league}).
    Considera: forma recente, importanza del match e statistiche generali che conosci su queste squadre.
    Fornisci un pronostico (es. 1X, Goal, Over 2.5) e una motivazione profonda.
    
    Rispondi SOLO con questo schema JSON:
    {"consiglio": "IL TUO PRONOSTICO", "perche": "LA TUA ANALISI ESPERTA"}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-70b-8192", // Usiamo il modello più grande per ragionamenti migliori
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const data = await groqRes.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (e) {
    return NextResponse.json({ consiglio: "Analisi...", perche: "Errore nel ragionamento AI" });
  }
}
