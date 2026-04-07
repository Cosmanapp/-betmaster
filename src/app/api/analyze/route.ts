import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { matches } = await req.json();
    const apiKey = process.env.GROQ_API_KEY;

    if (!apiKey) {
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
            content: 'Sei un esperto di betting. Analizza i match e restituisci SOLO un JSON: {"analisi": [{"consiglio": "1X", "perche": "Max 10 parole"}]}.'
          },
          {
            role: 'user',
            content: `Analizza: ${JSON.stringify(matches)}`
          }
        ],
        response_format: { type: "json_object" }
      }),
    });

    const data = await response.json();
    return NextResponse.json(JSON.parse(data.choices[0].message.content));
  } catch (error) {
    return NextResponse.json({ analisi: [] });
  }
}
