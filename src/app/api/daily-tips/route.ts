import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve all daily tips
export async function GET() {
  try {
    const tips = await db.dailyTip.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, tips });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create or update daily tips (bulk)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (body.action === 'clear') {
      await db.dailyTip.deleteMany({});
      return NextResponse.json({ success: true });
    }
    
    if (Array.isArray(body.tips)) {
      // Clear old tips and create new ones
      await db.dailyTip.deleteMany({});
      
      const tips = await db.dailyTip.createMany({
        data: body.tips.map((t: any) => ({
          event: t.event,
          sport: t.sport,
          league: t.league,
          prediction: t.prediction,
          odds: t.odds,
          confidence: t.confidence,
          reasoning: t.reasoning,
          eventDate: t.eventDate,
          isPlayed: t.isPlayed || false,
          betId: t.betId
        }))
      });
      return NextResponse.json({ success: true, tips });
    }
    
    // Single tip creation
    const tip = await db.dailyTip.create({
      data: {
        event: body.event,
        sport: body.sport,
        league: body.league,
        prediction: body.prediction,
        odds: body.odds,
        confidence: body.confidence,
        reasoning: body.reasoning,
        eventDate: body.eventDate,
        isPlayed: body.isPlayed || false
      }
    });
    return NextResponse.json({ success: true, tip });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update tip (mark as played)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const tip = await db.dailyTip.update({
      where: { id: body.id },
      data: body.updates
    });
    return NextResponse.json({ success: true, tip });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
