import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

const RUOTE = [
  'Bari', 'Cagliari', 'Firenze', 'Genova', 'Milano',
  'Napoli', 'Palermo', 'Roma', 'Torino', 'Venezia', 'Nazionale'
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type = 'ritardatari', ruota, combination } = body;

    const zai = await ZAI.create();
    const today = new Date().toLocaleDateString('it-IT');

    if (type === 'ritardatari') {
      // Cerca informazioni sui ritardatari
      const searchResult = await zai.functions.invoke("web_search", {
        query: `enalotto ritardatari ${today} ruote`,
        num: 10
      });

      // Usa l'AI per elaborare i dati
      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Sei un esperto del gioco dell'Enalotto italiano. Analizzi i ritardatari e calcoli le probabilità basandoti su dati storici. Rispondi sempre in italiano.`
          },
          {
            role: 'user',
            content: `Analizza questi dati web sui ritardatari dell'Enalotto e fornisci un'analisi dettagliata:

${JSON.stringify(searchResult, null, 2)}

Per ogni ruota (Bari, Cagliari, Firenze, Genova, Milano, Napoli, Palermo, Roma, Torino, Venezia, Nazionale), indica:
1. I numeri più ritardatari
2. Quanto manca all'uscita prevista

Rispondi in formato JSON:
{
  "ritardatari": [
    { "ruota": "Bari", "numeri": [numero, ritardo, frequenza], ... },
    ...
  ],
  "analisi": "breve analisi generale"
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      
      let data = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return NextResponse.json({
        success: true,
        data,
        searchResults: searchResult,
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'suggestion') {
      // Suggerimenti per combinazioni
      const searchResult = await zai.functions.invoke("web_search", {
        query: `enalotto estrazione ultima ${today} risultati`,
        num: 10
      });

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Sei un esperto del gioco dell'Enalotto italiano. Suggerisci combinazioni basandoti su analisi statistiche dei ritardatari e delle frequenze. Non garantire mai vincite. Rispondi sempre in italiano.`
          },
          {
            role: 'user',
            content: `Basandoti su questi dati dell'ultima estrazione Enalotto, suggerisci una combinazione per ${combination || 'ambo'} sulla ruota ${ruota || 'tutte'}:

${JSON.stringify(searchResult, null, 2)}

Fornisci:
1. I numeri suggeriti
2. Il tipo di giocata (ambo, terno, quaterna, cinquina)
3. La probabilità stimata
4. Il reasoning basato sui ritardatari

Rispondi in formato JSON:
{
  "type": "${combination || 'ambo'}",
  "numbers": [1, 2, ...],
  "ruota": "${ruota || 'tutte'}",
  "probability": 0.05,
  "reasoning": "Spiegazione dettagliata..."
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1500
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      
      let suggestion = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          suggestion = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return NextResponse.json({
        success: true,
        suggestion,
        searchResults: searchResult,
        timestamp: new Date().toISOString()
      });
    }

    if (type === 'estrazione') {
      // Ultima estrazione
      const searchResult = await zai.functions.invoke("web_search", {
        query: `enalotto estrazione oggi risultati ufficiali ${today}`,
        num: 10
      });

      const completion = await zai.chat.completions.create({
        messages: [
          {
            role: 'system',
            content: `Sei un esperto del gioco dell'Enalotto italiano. Estrai i dati dell'ultima estrazione dai risultati web. Rispondi sempre in italiano.`
          },
          {
            role: 'user',
            content: `Estrai i numeri dell'ultima estrazione Enalotto da questi risultati web:

${JSON.stringify(searchResult, null, 2)}

Rispondi in formato JSON:
{
  "data": "data estrazione",
  "ruote": [
    { "ruota": "Bari", "numeri": [1, 2, 3, 4, 5] },
    ...
  ]
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content || '{}';
      
      let estrazione = {};
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          estrazione = JSON.parse(jsonMatch[0]);
        }
      } catch (e) {
        console.error('JSON parsing error:', e);
      }

      return NextResponse.json({
        success: true,
        estrazione,
        searchResults: searchResult,
        timestamp: new Date().toISOString()
      });
    }

    return NextResponse.json(
      { error: 'Invalid type parameter' },
      { status: 400 }
    );

  } catch (error: any) {
    console.error('Enalotto error:', error);
    return NextResponse.json(
      { error: error.message || 'Enalotto request failed' },
      { status: 500 }
    );
  }
}
