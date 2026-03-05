import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matches } = await req.json(); // Riceve un array di match
    const groqKey = process.env.GROQ_API_KEY;

    const prompt = `Sei un quotista professionista. Analizza questi ${matches.length} match e fornisci pronostici VARIATI.
    Non ripetere lo stesso esito per tutti. Usa: segni secchi (1,X,2), Goal/NoGoal, Over/Under 2.5 e Handicap Asiatici.
    
    MATCH DA ANALIZZARE:
    ${matches.map((m: any, i: number) => `${i+1}. ${m.home} vs ${m.away} (${m.league})`).join('\n')}

    Rispondi rigorosamente in JSON con questa struttura:
    {"analisi": [
      {"consiglio": "...", "perche": "..."},
      {"consiglio": "...", "perche": "..."}
    ]}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8, // Più alta per massima varietà
        response_format: { type: "json_object" }
      })
    });

    const data = await groqRes.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (e) {
    return NextResponse.json({ analisi: [] });
  }
}
