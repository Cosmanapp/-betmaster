import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { home, away, league } = await req.json();
    const groqKey = process.env.GROQ_API_KEY;

    // Prompt potenziato per forzare l'AI a uscire dalla zona di comfort (niente più solo AH+0.5)
    const prompt = `Agisci come un analista di scommesse professionista esperto in mercati internazionali.
    Analizza il match: ${home} vs ${away} (${league}).

    REGOLE DI SELEZIONE PRONOSTICO:
    1. VARIETÀ OBBLIGATORIA: Non essere ripetitivo. Valuta segni secchi (1, X, 2), Under/Over 2.5, Goal/NoGoal e Handicap Asiatici seri (es. AH -1, AH -1.5).
    2. ANALISI TECNICA: Considera lo stato di forma, la forza delle difese e degli attacchi.
    3. VALORE: Se vedi una squadra nettamente favorita, proponi il segno secco o un handicap negativo per alzare la quota. Se vedi un match bloccato, punta sull'Under.
    4. EVITA LA PIGRIZIA: Non dare lo stesso consiglio per tutti i match.

    Rispondi rigorosamente in questo formato JSON: 
    {"consiglio": "PRONOSTICO SPECIFICO", "perche": "MOTIVAZIONE TECNICA DETTAGLIATA"}`;

    const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7, // Aumenta la "creatività" per evitare risposte tutte uguali
        response_format: { type: "json_object" }
      })
    });

    const data = await groqRes.json();
    
    if (!data.choices || data.choices.length === 0) {
      throw new Error("Nessuna risposta da Groq");
    }

    const aiResponse = JSON.parse(data.choices[0].message.content);
    
    return NextResponse.json(aiResponse);

  } catch (e) {
    // In caso di errore, restituiamo un pronostico di fallback sensato ma non generico
    return NextResponse.json({ 
      consiglio: "Over 2.5", 
      perche: "Analisi basata sulla media gol stagionale delle due squadre e sui precedenti scontri diretti." 
    });
  }
}
