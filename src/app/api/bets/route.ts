import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve all bets
export async function GET() {
  try {
    const bets = await db.bet.findMany({
      orderBy: { createdAt: 'desc' }
    });
    return NextResponse.json({ success: true, bets });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create new bet
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const bet = await db.bet.create({
      data: {
        event: body.event,
        sport: body.sport,
        league: body.league,
        prediction: body.prediction,
        odds: body.odds,
        stake: body.stake,
        status: body.status || 'pending',
        result: body.result,
        profitLoss: body.profitLoss,
        confidence: body.confidence,
        reasoning: body.reasoning,
        eventDate: body.eventDate,
        source: body.source || 'custom'
      }
    });
    return NextResponse.json({ success: true, bet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update bet
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const bet = await db.bet.update({
      where: { id: body.id },
      data: body.updates
    });
    return NextResponse.json({ success: true, bet });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete bet
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }
    await db.bet.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
