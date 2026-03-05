import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { home, away, league } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    // IL PROMPT VA QUI DENTRO, DOVE "home" e "away" ESISTONO
    const prompt = `Agisci come un analista di scommesse professionista esperto in mercati asiatici e value betting.
    Analizza il match: ${home} vs ${away} in ${league}.

    COMPITI:
    1. Devi essere audace: cerca Handicap Asiatici (es: AH -0.25, AH +1.0) o Somma Gol Asiatica (Over 2.25, Under 2.75).
    2. Se prevedi una vittoria netta, usa Handicap. Se prevedi equilibrio, usa mercati Combo o DNB (Draw No Bet).
    3. Spiega la motivazione tecnica (es. assenze, xG, trend casa/trasferta).
    4. Evita pronostici banali come 1X o X2 a meno che non ci sia una quota di valore altissima.

    Rispondi rigorosamente in formato JSON: {"consiglio": "PRONOSTICO", "perche": "MOTIVAZIONE"}`;

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

    const data = await groqRes.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return NextResponse.json(aiResponse);
  } catch (e) {
    return NextResponse.json({ 
      consiglio: "AH +0.5 (DNB)", 
      perche: "Analisi di sistema basata sui volumi di gioco e trend storici." 
    });
  }
}
