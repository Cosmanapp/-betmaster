
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
        model: "llama3-8b-8192",
        messages: [{ 
          role: "user", 
          content: `Sei un esperto di scommesse. Analizza il match ${home} vs ${away} in ${league}. 
          Fornisci un pronostico secco e una motivazione breve e tecnica. 
          Rispondi rigorosamente in questo formato JSON: {"consiglio": "...", "perche": "..."}` 
        }],
        response_format: { type: "json_object" }
      })
    });

    const data = await groqRes.json();
    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return NextResponse.json(aiResponse);
  } catch (e) {
    return NextResponse.json({ consiglio: "N/A", perche: "Errore durante l'analisi AI" });
  }
}
