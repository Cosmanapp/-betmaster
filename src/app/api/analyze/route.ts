import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matches } = await req.json();
    
    // Usiamo la chiave che hai impostato su Vercel
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
      console.error("GROQ_API_KEY mancante");
      return NextResponse.json({ analisi: matches.map(() => ({ consiglio: "1X", perche: "Analisi tecnica standard." })) });
    }

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Sei un esperto di betting. Analizza i match e restituisci SOLO un JSON con questa struttura: {"analisi": [{"consiglio": "1X", "perche": "Spiegazione brevissima"}]}. Il numero di analisi deve essere uguale al numero di match inviati.'
          },
          {
            role: 'user',
            content: `Analizza questi match per domani: ${JSON.stringify(matches)}`
          }
        ],
        temperature: 0.7,
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);
    return NextResponse.json(content);

  } catch (error) {
    console.error("Errore analisi AI:", error);
    // Fallback: se l'AI ha un errore, restituiamo dati neutri per non rompere l'app
    return NextResponse.json({ analisi: [] });
  }
}
