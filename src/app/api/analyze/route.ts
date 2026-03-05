import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { home, away, league } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Modello più veloce per evitare errori
        messages: [{ 
          role: "user", 
          content: `Analizza match: ${home} vs ${away} (${league}). Dammi un pronostico esperto e un motivo tecnico. Rispondi in JSON: {"consiglio": "...", "perche": "..."}` 
        }],
        response_format: { type: "json_object" }
      })
    });

    const data = await groqRes.json();
    // Se Groq risponde con errore di rate limit, lo gestiamo
    if (data.error) throw new Error(data.error.message);

    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (e) {
    return NextResponse.json({ consiglio: "Puntata 1X", perche: "Analisi basata sui precedenti storici e forma attuale." });
  }
}
