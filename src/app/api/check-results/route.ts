import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { bets } = body;

    if (!bets || !Array.isArray(bets)) {
      return NextResponse.json({ success: false, error: 'No bets provided' });
    }

    const zai = await ZAI.create();
    const results: any[] = [];

    for (const bet of bets) {
      if (bet.status !== 'pending') continue;

      try {
        // Cerca risultato partita
        const searchRes = await zai.functions.invoke("web_search", {
          query: `${bet.event} final score result today 2026`,
          num: 5
        });

        if (searchRes && Array.isArray(searchRes)) {
          const result = parseMatchResult(searchRes, bet);
          if (result) {
            results.push({
              betId: bet.id,
              ...result
            });
          }
        }
      } catch (e) {
        console.error(`Error checking bet ${bet.id}:`, e);
      }
    }

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Check results error:', error);
    return NextResponse.json({ success: false, error: error.message });
  }
}

function parseMatchResult(searchResults: any[], bet: any): { won: boolean, lost: boolean } | null {
  for (const r of searchResults) {
    const text = (r.snippet || '').toLowerCase();
    
    // Verifica che il risultato sia per la partita giusta
    const teamNames = bet.event.split(' vs ').map((t: string) => t.trim().toLowerCase());
    const hasTeam = teamNames.some((t: string) => text.includes(t.split(' ')[0].toLowerCase()));
    
    if (!hasTeam) continue;
    
    // Cerca punteggio finale
    const scoreMatch = text.match(/(\d+)\s*[-–]\s*(\d+)/);
    if (scoreMatch) {
      const homeScore = parseInt(scoreMatch[1]);
      const awayScore = parseInt(scoreMatch[2]);
      
      // Se trova "finished", "full time", "final" è più affidabile
      const isFinished = text.includes('finish') || text.includes('final') || text.includes('full time') || text.includes('ended');
      
      const pred = bet.prediction.toLowerCase().trim();
      
      // Vittoria casa (1)
      if (pred === '1' || pred === '1x2 1') {
        if (homeScore > awayScore) return { won: true, lost: false };
        if (homeScore < awayScore) return { won: false, lost: true };
        if (homeScore === awayScore && isFinished) return { won: false, lost: true };
      }
      
      // Vittoria fuori (2)
      if (pred === '2' || pred === '1x2 2') {
        if (awayScore > homeScore) return { won: true, lost: false };
        if (awayScore < homeScore) return { won: false, lost: true };
        if (homeScore === awayScore && isFinished) return { won: false, lost: true };
      }
      
      // Pareggio (X)
      if (pred === 'x' || pred === 'draw') {
        if (homeScore === awayScore && isFinished) return { won: true, lost: false };
        if (homeScore !== awayScore && isFinished) return { won: false, lost: true };
      }
      
      // Goal (GG / BTTS)
      if (pred === 'gg' || pred === 'btts' || pred === 'goal') {
        if (homeScore > 0 && awayScore > 0 && isFinished) return { won: true, lost: false };
        if ((homeScore === 0 || awayScore === 0) && isFinished) return { won: false, lost: true };
      }
      
      // No Goal (NG)
      if (pred === 'ng' || pred === 'no goal') {
        if ((homeScore === 0 || awayScore === 0) && isFinished) return { won: true, lost: false };
        if (homeScore > 0 && awayScore > 0 && isFinished) return { won: false, lost: true };
      }
      
      // 1X
      if (pred === '1x') {
        if (homeScore >= awayScore && isFinished) return { won: true, lost: false };
        if (homeScore < awayScore && isFinished) return { won: false, lost: true };
      }
      
      // X2
      if (pred === 'x2') {
        if (awayScore >= homeScore && isFinished) return { won: true, lost: false };
        if (homeScore > awayScore && isFinished) return { won: false, lost: true };
      }
      
      // Over 2.5
      if (pred === 'over 2.5' || pred === 'o2.5') {
        if (homeScore + awayScore > 2.5 && isFinished) return { won: true, lost: false };
        if (homeScore + awayScore <= 2.5 && isFinished) return { won: false, lost: true };
      }
      
      // Under 2.5
      if (pred === 'under 2.5' || pred === 'u2.5') {
        if (homeScore + awayScore < 2.5 && isFinished) return { won: true, lost: false };
        if (homeScore + awayScore >= 2.5 && isFinished) return { won: false, lost: true };
      }
    }
  }
  return null;
}
