import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Retrieve settings
export async function GET() {
  try {
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      // Create default settings
      settings = await db.settings.create({
        data: {
          defaultEventsCount: 5,
          defaultStake: 10,
          initialBankroll: 100,
          preferredSports: 'football,basketball,tennis',
          riskLevel: 'medium',
          darkMode: true,
          notifications: true,
          bankroll: 100
        }
      });
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Update settings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    let settings = await db.settings.findFirst();
    
    if (!settings) {
      settings = await db.settings.create({
        data: {
          defaultEventsCount: body.defaultEventsCount ?? 5,
          defaultStake: body.defaultStake ?? 10,
          initialBankroll: body.initialBankroll ?? 100,
          preferredSports: Array.isArray(body.preferredSports) 
            ? body.preferredSports.join(',') 
            : (body.preferredSports ?? 'football,basketball,tennis'),
          riskLevel: body.riskLevel ?? 'medium',
          darkMode: body.darkMode ?? true,
          notifications: body.notifications ?? true,
          bankroll: body.bankroll ?? 100
        }
      });
    } else {
      settings = await db.settings.update({
        where: { id: settings.id },
        data: {
          defaultEventsCount: body.defaultEventsCount,
          defaultStake: body.defaultStake,
          initialBankroll: body.initialBankroll,
          preferredSports: Array.isArray(body.preferredSports) 
            ? body.preferredSports.join(',') 
            : body.preferredSports,
          riskLevel: body.riskLevel,
          darkMode: body.darkMode,
          notifications: body.notifications,
          bankroll: body.bankroll
        }
      });
    }
    
    return NextResponse.json({ success: true, settings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
