import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve football journey state
export async function GET() {
  try {
    let journey = await db.footballJourney.findFirst();
    
    if (!journey) {
      // Create default journey state
      journey = await db.footballJourney.create({
        data: {
          isActive: false,
          selectedLeagues: '[]'
        }
      });
    }
    
    return NextResponse.json({ success: true, journey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Update football journey
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let journey = await db.footballJourney.findFirst();
    
    if (!journey) {
      journey = await db.footballJourney.create({
        data: {
          isActive: body.isActive ?? false,
          startedAt: body.startedAt ? new Date(body.startedAt) : null,
          initialBankroll: body.initialBankroll ?? 0,
          currentBankroll: body.currentBankroll ?? 0,
          targetProfit: body.targetProfit ?? 0,
          currentStreak: body.currentStreak,
          streakCount: body.streakCount ?? 0,
          totalBets: body.totalBets ?? 0,
          wins: body.wins ?? 0,
          losses: body.losses ?? 0,
          draws: body.draws ?? 0,
          selectedLeagues: JSON.stringify(body.selectedLeagues || []),
          lastBetId: body.lastBetId
        }
      });
    } else {
      journey = await db.footballJourney.update({
        where: { id: journey.id },
        data: {
          isActive: body.isActive,
          startedAt: body.startedAt ? new Date(body.startedAt) : (body.startedAt === null ? null : undefined),
          initialBankroll: body.initialBankroll,
          currentBankroll: body.currentBankroll,
          targetProfit: body.targetProfit,
          currentStreak: body.currentStreak,
          streakCount: body.streakCount,
          totalBets: body.totalBets,
          wins: body.wins,
          losses: body.losses,
          draws: body.draws,
          selectedLeagues: Array.isArray(body.selectedLeagues) 
            ? JSON.stringify(body.selectedLeagues) 
            : body.selectedLeagues,
          lastBetId: body.lastBetId
        }
      });
    }
    
    return NextResponse.json({ success: true, journey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Reset journey
export async function DELETE() {
  try {
    await db.footballJourney.deleteMany({});
    const journey = await db.footballJourney.create({
      data: {
        isActive: false,
        selectedLeagues: '[]'
      }
    });
    return NextResponse.json({ success: true, journey });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
