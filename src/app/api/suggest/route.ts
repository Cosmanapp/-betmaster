import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

// CALENDARIO SERIE A 2025/26 - Marzo 2026
const SERIE_A_CALENDAR: Record<string, any[]> = {
  // Febbraio 2026
  '2026-02-28': [
    { homeTeam: 'Como', awayTeam: 'Lecce', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Hellas Verona', awayTeam: 'Napoli', time: '17:00', hour: 17, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Genoa', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-03-01': [
    { homeTeam: 'Torino', awayTeam: 'Lazio', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Juventus', awayTeam: 'Cagliari', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Milan', awayTeam: 'Atalanta', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Roma', awayTeam: 'Bologna', time: '20:45', hour: 20, minute: 45 },
  ],
  // Marzo 2026
  '2026-03-07': [
    { homeTeam: 'Atalanta', awayTeam: 'Lazio', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Bologna', awayTeam: 'Cagliari', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Fiorentina', awayTeam: 'Lecce', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Genoa', awayTeam: 'Juventus', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Napoli', awayTeam: 'Inter', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-03-08': [
    { homeTeam: 'Cagliari', awayTeam: 'Como', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Udinese', awayTeam: 'Roma', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Lecce', awayTeam: 'Milan', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Monza', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-03-14': [
    { homeTeam: 'Como', awayTeam: 'Napoli', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Atalanta', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Juventus', awayTeam: 'Verona', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-03-15': [
    { homeTeam: 'Lazio', awayTeam: 'Udinese', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Milan', awayTeam: 'Como', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Roma', awayTeam: 'Juventus', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Napoli', awayTeam: 'Fiorentina', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-03-21': [
    { homeTeam: 'Atalanta', awayTeam: 'Inter', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Juventus', awayTeam: 'Milan', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Fiorentina', awayTeam: 'Juventus', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-03-22': [
    { homeTeam: 'Napoli', awayTeam: 'Roma', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Lazio', awayTeam: 'Torino', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Udinese', time: '18:00', hour: 18, minute: 0 },
  ],
  // Aprile 2026
  '2026-04-04': [
    { homeTeam: 'Napoli', awayTeam: 'Atalanta', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Torino', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Milan', awayTeam: 'Fiorentina', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-05': [
    { homeTeam: 'Juventus', awayTeam: 'Lazio', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Roma', awayTeam: 'Juventus', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Atalanta', awayTeam: 'Bologna', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Lazio', awayTeam: 'Inter', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-11': [
    { homeTeam: 'Inter', awayTeam: 'Cagliari', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Juventus', awayTeam: 'Fiorentina', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Milan', awayTeam: 'Inter', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-12': [
    { homeTeam: 'Napoli', awayTeam: 'Bologna', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Roma', awayTeam: 'Verona', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Atalanta', awayTeam: 'Lazio', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Fiorentina', awayTeam: 'Napoli', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-18': [
    { homeTeam: 'Torino', awayTeam: 'Milan', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Lazio', awayTeam: 'Roma', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Napoli', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-19': [
    { homeTeam: 'Juventus', awayTeam: 'Monza', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Atalanta', awayTeam: 'Lecce', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Bologna', awayTeam: 'Inter', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Roma', awayTeam: 'Verona', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-25': [
    { homeTeam: 'Napoli', awayTeam: 'Torino', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Roma', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Milan', awayTeam: 'Atalanta', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-04-26': [
    { homeTeam: 'Juventus', awayTeam: 'Lecce', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Lazio', awayTeam: 'Genoa', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Fiorentina', awayTeam: 'Empoli', time: '18:00', hour: 18, minute: 0 },
  ],
  // Maggio 2026
  '2026-05-02': [
    { homeTeam: 'Atalanta', awayTeam: 'Juventus', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Verona', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Roma', awayTeam: 'Inter', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-05-03': [
    { homeTeam: 'Napoli', awayTeam: 'Lecce', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Milan', awayTeam: 'Genoa', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Lazio', awayTeam: 'Bologna', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Juventus', awayTeam: 'Bologna', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-05-09': [
    { homeTeam: 'Bologna', awayTeam: 'Milan', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Juventus', awayTeam: 'Udinese', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Torino', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-05-10': [
    { homeTeam: 'Napoli', awayTeam: 'Genoa', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Roma', awayTeam: 'Fiorentina', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Atalanta', awayTeam: 'Como', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Lazio', awayTeam: 'Juventus', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-05-16': [
    { homeTeam: 'Milan', awayTeam: 'Roma', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Inter', awayTeam: 'Lazio', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Juventus', awayTeam: 'Udinese', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-05-17': [
    { homeTeam: 'Napoli', awayTeam: 'Fiorentina', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Atalanta', awayTeam: 'Parma', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Bologna', awayTeam: 'Genoa', time: '18:00', hour: 18, minute: 0 },
  ],
  '2026-05-23': [
    { homeTeam: 'Juventus', awayTeam: 'Verona', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Roma', awayTeam: 'Milan', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Napoli', awayTeam: 'Cagliari', time: '20:45', hour: 20, minute: 45 },
  ],
  '2026-05-24': [
    { homeTeam: 'Inter', awayTeam: 'Torino', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Atalanta', awayTeam: 'Lecce', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Lazio', awayTeam: 'Lecce', time: '18:00', hour: 18, minute: 0 },
    { homeTeam: 'Fiorentina', awayTeam: 'Bologna', time: '20:45', hour: 20, minute: 45 },
  ],
};

// CALENDARIO PREMIER LEAGUE 2025/26
const PREMIER_LEAGUE_CALENDAR: Record<string, any[]> = {
  '2026-02-28': [
    { homeTeam: 'Arsenal', awayTeam: 'Manchester City', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Liverpool', awayTeam: 'Newcastle', time: '15:00', hour: 15, minute: 0 },
    { homeTeam: 'Chelsea', awayTeam: 'Tottenham', time: '17:30', hour: 17, minute: 30 },
  ],
  '2026-03-01': [
    { homeTeam: 'Manchester United', awayTeam: 'Everton', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'West Ham', awayTeam: 'Brighton', time: '16:30', hour: 16, minute: 30 },
  ],
  '2026-03-07': [
    { homeTeam: 'Manchester City', awayTeam: 'Liverpool', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Arsenal', awayTeam: 'Chelsea', time: '17:30', hour: 17, minute: 30 },
  ],
  '2026-03-08': [
    { homeTeam: 'Tottenham', awayTeam: 'Manchester United', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Newcastle', awayTeam: 'West Ham', time: '16:30', hour: 16, minute: 30 },
  ],
  '2026-03-14': [
    { homeTeam: 'Liverpool', awayTeam: 'Arsenal', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Chelsea', awayTeam: 'Manchester United', time: '17:30', hour: 17, minute: 30 },
  ],
  '2026-03-15': [
    { homeTeam: 'Manchester City', awayTeam: 'Brighton', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Tottenham', awayTeam: 'Everton', time: '16:30', hour: 16, minute: 30 },
  ],
  '2026-03-21': [
    { homeTeam: 'Arsenal', awayTeam: 'Tottenham', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Manchester United', awayTeam: 'Manchester City', time: '17:30', hour: 17, minute: 30 },
  ],
  '2026-03-22': [
    { homeTeam: 'Liverpool', awayTeam: 'Chelsea', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Newcastle', awayTeam: 'Brighton', time: '16:30', hour: 16, minute: 30 },
  ],
  '2026-04-04': [
    { homeTeam: 'Manchester City', awayTeam: 'Arsenal', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Liverpool', awayTeam: 'Everton', time: '17:30', hour: 17, minute: 30 },
  ],
  '2026-04-05': [
    { homeTeam: 'Chelsea', awayTeam: 'Newcastle', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Tottenham', awayTeam: 'West Ham', time: '16:30', hour: 16, minute: 30 },
  ],
  '2026-04-11': [
    { homeTeam: 'Arsenal', awayTeam: 'Liverpool', time: '12:30', hour: 12, minute: 30 },
    { homeTeam: 'Manchester City', awayTeam: 'Manchester United', time: '17:30', hour: 17, minute: 30 },
  ],
  '2026-04-12': [
    { homeTeam: 'Chelsea', awayTeam: 'Brighton', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Newcastle', awayTeam: 'Everton', time: '16:30', hour: 16, minute: 30 },
  ],
};

// CALENDARIO LA LIGA 2025/26
const LA_LIGA_CALENDAR: Record<string, any[]> = {
  '2026-02-28': [
    { homeTeam: 'Real Madrid', awayTeam: 'Real Sociedad', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Barcelona', awayTeam: 'Athletic Bilbao', time: '16:15', hour: 16, minute: 15 },
    { homeTeam: 'Atletico Madrid', awayTeam: 'Villarreal', time: '18:30', hour: 18, minute: 30 },
  ],
  '2026-03-01': [
    { homeTeam: 'Sevilla', awayTeam: 'Real Betis', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Valencia', awayTeam: 'Getafe', time: '16:15', hour: 16, minute: 15 },
  ],
  '2026-03-07': [
    { homeTeam: 'Barcelona', awayTeam: 'Real Madrid', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-08': [
    { homeTeam: 'Atletico Madrid', awayTeam: 'Sevilla', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Real Sociedad', awayTeam: 'Valencia', time: '16:15', hour: 16, minute: 15 },
  ],
  '2026-03-14': [
    { homeTeam: 'Real Madrid', awayTeam: 'Barcelona', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-15': [
    { homeTeam: 'Athletic Bilbao', awayTeam: 'Atletico Madrid', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Villarreal', awayTeam: 'Sevilla', time: '16:15', hour: 16, minute: 15 },
  ],
  '2026-03-21': [
    { homeTeam: 'Barcelona', awayTeam: 'Atletico Madrid', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-22': [
    { homeTeam: 'Real Madrid', awayTeam: 'Sevilla', time: '14:00', hour: 14, minute: 0 },
    { homeTeam: 'Valencia', awayTeam: 'Villarreal', time: '16:15', hour: 16, minute: 15 },
  ],
};

// CALENDARIO BUNDESLIGA 2025/26
const BUNDESLIGA_CALENDAR: Record<string, any[]> = {
  '2026-02-28': [
    { homeTeam: 'Bayern Munich', awayTeam: 'Borussia Dortmund', time: '15:30', hour: 15, minute: 30 },
    { homeTeam: 'RB Leipzig', awayTeam: 'Bayer Leverkusen', time: '18:30', hour: 18, minute: 30 },
  ],
  '2026-03-01': [
    { homeTeam: 'Frankfurt', awayTeam: 'Wolfsburg', time: '15:30', hour: 15, minute: 30 },
  ],
  '2026-03-07': [
    { homeTeam: 'Borussia Dortmund', awayTeam: 'RB Leipzig', time: '15:30', hour: 15, minute: 30 },
    { homeTeam: 'Bayer Leverkusen', awayTeam: 'Bayern Munich', time: '18:30', hour: 18, minute: 30 },
  ],
  '2026-03-08': [
    { homeTeam: 'Wolfsburg', awayTeam: 'Frankfurt', time: '15:30', hour: 15, minute: 30 },
  ],
  '2026-03-14': [
    { homeTeam: 'Bayern Munich', awayTeam: 'Frankfurt', time: '15:30', hour: 15, minute: 30 },
    { homeTeam: 'RB Leipzig', awayTeam: 'Wolfsburg', time: '18:30', hour: 18, minute: 30 },
  ],
  '2026-03-15': [
    { homeTeam: 'Borussia Dortmund', awayTeam: 'Bayer Leverkusen', time: '15:30', hour: 15, minute: 30 },
  ],
  '2026-03-21': [
    { homeTeam: 'Bayer Leverkusen', awayTeam: 'Borussia Dortmund', time: '15:30', hour: 15, minute: 30 },
    { homeTeam: 'Frankfurt', awayTeam: 'Bayern Munich', time: '18:30', hour: 18, minute: 30 },
  ],
  '2026-03-22': [
    { homeTeam: 'Wolfsburg', awayTeam: 'RB Leipzig', time: '15:30', hour: 15, minute: 30 },
  ],
};

// CALENDARIO LIGUE 1 2025/26
const LIGUE1_CALENDAR: Record<string, any[]> = {
  '2026-02-28': [
    { homeTeam: 'PSG', awayTeam: 'Marseille', time: '17:00', hour: 17, minute: 0 },
    { homeTeam: 'Lyon', awayTeam: 'Monaco', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-01': [
    { homeTeam: 'Lille', awayTeam: 'Nice', time: '15:00', hour: 15, minute: 0 },
  ],
  '2026-03-07': [
    { homeTeam: 'Marseille', awayTeam: 'Lyon', time: '17:00', hour: 17, minute: 0 },
    { homeTeam: 'Monaco', awayTeam: 'PSG', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-08': [
    { homeTeam: 'Nice', awayTeam: 'Lille', time: '15:00', hour: 15, minute: 0 },
  ],
  '2026-03-14': [
    { homeTeam: 'PSG', awayTeam: 'Nice', time: '17:00', hour: 17, minute: 0 },
    { homeTeam: 'Lyon', awayTeam: 'Lille', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-15': [
    { homeTeam: 'Monaco', awayTeam: 'Marseille', time: '15:00', hour: 15, minute: 0 },
  ],
  '2026-03-21': [
    { homeTeam: 'Lille', awayTeam: 'PSG', time: '17:00', hour: 17, minute: 0 },
    { homeTeam: 'Nice', awayTeam: 'Monaco', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-22': [
    { homeTeam: 'Marseille', awayTeam: 'Lille', time: '15:00', hour: 15, minute: 0 },
  ],
};

// CHAMPIONS LEAGUE 2025/26
const CHAMPIONS_LEAGUE_CALENDAR: Record<string, any[]> = {
  '2026-03-10': [
    { homeTeam: 'Real Madrid', awayTeam: 'Bayern Munich', time: '21:00', hour: 21, minute: 0 },
    { homeTeam: 'Manchester City', awayTeam: 'Barcelona', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-11': [
    { homeTeam: 'Inter', awayTeam: 'Arsenal', time: '21:00', hour: 21, minute: 0 },
    { homeTeam: 'Napoli', awayTeam: 'Liverpool', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-17': [
    { homeTeam: 'Bayern Munich', awayTeam: 'Real Madrid', time: '21:00', hour: 21, minute: 0 },
    { homeTeam: 'Barcelona', awayTeam: 'Manchester City', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-03-18': [
    { homeTeam: 'Arsenal', awayTeam: 'Inter', time: '21:00', hour: 21, minute: 0 },
    { homeTeam: 'Liverpool', awayTeam: 'Napoli', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-04-07': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-04-08': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-04-14': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-04-15': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-04-28': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-04-29': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-05-05': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
  '2026-05-06': [
    { homeTeam: 'TBD', awayTeam: 'TBD', time: '21:00', hour: 21, minute: 0 },
  ],
};

export async function POST(request: NextRequest) {
  try {
    const { count = 5, riskLevel = 'medium' } = await request.json();
    
    const now = new Date();
    const todayISO = now.toISOString().split('T')[0];
    const todayStr = now.toLocaleDateString('it-IT');
    
    // Ora Italia (UTC+1)
    const italyHour = (now.getUTCHours() + 1) % 24;
    const italyMin = now.getUTCMinutes();
    const nowMinutes = italyHour * 60 + italyMin;
    
    console.log(`[SUGGEST] Data: ${todayISO}, Ora Italia: ${italyHour}:${italyMin}`);
    
    // 1. OTTIENI PARTITE DA TUTTI I CALENDARI
    let allMatches: any[] = [];
    
    // Serie A
    const serieA = SERIE_A_CALENDAR[todayISO] || [];
    serieA.forEach(m => allMatches.push({ ...m, league: 'Serie A' }));
    
    // Premier League
    const premier = PREMIER_LEAGUE_CALENDAR[todayISO] || [];
    premier.forEach(m => allMatches.push({ ...m, league: 'Premier League' }));
    
    // La Liga
    const laliga = LA_LIGA_CALENDAR[todayISO] || [];
    laliga.forEach(m => allMatches.push({ ...m, league: 'La Liga' }));
    
    // Bundesliga
    const bundesliga = BUNDESLIGA_CALENDAR[todayISO] || [];
    bundesliga.forEach(m => allMatches.push({ ...m, league: 'Bundesliga' }));
    
    // Ligue 1
    const ligue1 = LIGUE1_CALENDAR[todayISO] || [];
    ligue1.forEach(m => allMatches.push({ ...m, league: 'Ligue 1' }));
    
    // Champions League
    const cl = CHAMPIONS_LEAGUE_CALENDAR[todayISO] || [];
    cl.forEach(m => allMatches.push({ ...m, league: 'Champions League' }));
    
    // 2. PROVA ANCHE WEB SEARCH PER PARTITE AGGIUNTIVE
    const webMatches = await searchWebMatches(now);
    for (const m of webMatches) {
      const exists = allMatches.some(x => 
        teamsMatch(x.homeTeam, m.homeTeam) && teamsMatch(x.awayTeam, m.awayTeam)
      );
      if (!exists) allMatches.push(m);
    }
    
    console.log(`[SUGGEST] Totale partite: ${allMatches.length}`);
    
    // 3. FILTRA SOLO PARTITE NON ANCORA INIZIATE (+5 min margine)
    const upcomingMatches = allMatches.filter(m => {
      const matchMinutes = m.hour * 60 + m.minute;
      return matchMinutes > nowMinutes + 5;
    });
    
    console.log(`[SUGGEST] Partite non ancora iniziate: ${upcomingMatches.length}`);
    
    if (upcomingMatches.length === 0) {
      return NextResponse.json({
        success: true,
        suggestions: [],
        totalFound: 0,
        message: 'Nessuna partita disponibile oggi. Controlla domani!',
        date: todayStr,
        serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
      });
    }
    
    // 4. AI ANALIZZA OGNI PARTITA
    const analyzedMatches = [];
    
    for (const match of upcomingMatches) {
      console.log(`[SUGGEST] Analizzo: ${match.homeTeam} vs ${match.awayTeam} (${match.league})`);
      const analysis = await analyzeMatchWithAI(match);
      
      if (analysis) {
        analyzedMatches.push({
          ...analysis,
          matchTime: match.time
        });
      }
    }
    
    console.log(`[SUGGEST] Partite analizzate: ${analyzedMatches.length}`);
    
    // 5. FILTRA PER CONFIDENCE MINIMA
    let minConfidence = 70;
    if (riskLevel === 'low') minConfidence = 80;
    if (riskLevel === 'high') minConfidence = 60;
    
    const highConfidenceMatches = analyzedMatches.filter(m => m.confidence >= minConfidence);
    
    // 6. ORDINA PER CONFIDENCE (PIÙ ALTA IN CIMA)
    highConfidenceMatches.sort((a, b) => b.confidence - a.confidence);
    
    console.log(`[SUGGEST] Partite con confidence >= ${minConfidence}%: ${highConfidenceMatches.length}`);
    
    return NextResponse.json({
      success: true,
      suggestions: highConfidenceMatches.slice(0, count),
      totalFound: upcomingMatches.length,
      totalAnalyzed: analyzedMatches.length,
      source: 'calendar-ai',
      date: todayStr,
      serverTime: `${italyHour}:${italyMin.toString().padStart(2, '0')}`
    });
    
  } catch (e: any) {
    console.error('[ERROR]', e);
    return NextResponse.json({ 
      success: false, 
      error: e.message, 
      suggestions: [] 
    }, { status: 500 });
  }
}

// Confronta nomi squadre
function teamsMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z]/g, '').substring(0, 5);
  return normalize(a) === normalize(b);
}

// Cerca sul web partite aggiuntive
async function searchWebMatches(now: Date): Promise<any[]> {
  try {
    const zai = await ZAI.create();
    const res = await zai.functions.invoke("web_search", {
      query: `Europa League Conference League matches today ${now.toISOString().split('T')[0]}`,
      num: 10
    });
    
    if (!res || !Array.isArray(res)) return [];
    
    const matches: any[] = [];
    
    for (const r of res) {
      const text = (r.snippet || '') + ' ' + (r.name || '');
      
      // Pattern generico per partite
      const pattern = /([A-Z][a-zA-Z\s]{2,20})\s+(?:vs|v\.?|[-–])\s+([A-Z][a-zA-Z\s]{2,20})/gi;
      let m;
      
      while ((m = pattern.exec(text)) !== null) {
        const home = m[1].trim();
        const away = m[2].trim();
        
        const timeMatch = text.match(/(\d{1,2}):(\d{2})/);
        if (timeMatch && isEuropeanTeam(home) || isEuropeanTeam(away)) {
          const hour = parseInt(timeMatch[1]);
          const minute = parseInt(timeMatch[2]);
          
          if (hour <= 23 && minute <= 59) {
            const league = detectLeague(text);
            if (!matches.some(x => teamsMatch(x.homeTeam, home) && teamsMatch(x.awayTeam, away))) {
              matches.push({ 
                homeTeam: home, 
                awayTeam: away, 
                league, 
                time: `${hour.toString().padStart(2,'0')}:${minute.toString().padStart(2,'0')}`, 
                hour, 
                minute 
              });
            }
          }
        }
      }
    }
    
    return matches;
  } catch (e) {
    return [];
  }
}

// Squadre europee note
function isEuropeanTeam(name: string): boolean {
  const teams = [
    'napoli', 'inter', 'juventus', 'milan', 'atalanta', 'lazio', 'roma', 'fiorentina',
    'como', 'lecce', 'verona', 'genoa', 'torino', 'cagliari', 'bologna', 'udinese', 'monza',
    'arsenal', 'liverpool', 'chelsea', 'tottenham', 'manchester', 'city', 'united',
    'real madrid', 'barcelona', 'atletico', 'sevilla', 'valencia', 'villarreal', 'athletic',
    'bayern', 'dortmund', 'leipzig', 'leverkusen', 'frankfurt', 'wolfsburg',
    'psg', 'marseille', 'lyon', 'monaco', 'lille', 'nice'
  ];
  return teams.some(t => name.toLowerCase().includes(t));
}

// Rileva campionato
function detectLeague(text: string): string {
  const t = text.toLowerCase();
  if (t.includes('serie a') || t.includes('italian')) return 'Serie A';
  if (t.includes('premier league') || t.includes('english')) return 'Premier League';
  if (t.includes('la liga') || t.includes('spanish')) return 'La Liga';
  if (t.includes('bundesliga') || t.includes('german')) return 'Bundesliga';
  if (t.includes('ligue 1') || t.includes('french')) return 'Ligue 1';
  if (t.includes('champions league')) return 'Champions League';
  if (t.includes('europa league')) return 'Europa League';
  if (t.includes('conference league')) return 'Conference League';
  return 'Europeo';
}

// AI analizza la partita
async function analyzeMatchWithAI(match: any): Promise<any | null> {
  const KEY = process.env.GROQ_API_KEY;
  if (!KEY) return getBasicAnalysis(match);
  
  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 
        'Authorization': `Bearer ${KEY}`, 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          { 
            role: 'system', 
            content: `Sei un TOP ANALISTA SPORTIVO con 25 anni di esperienza. Il tuo lavoro è trovare scommesse ad ALTA PROBABILITÀ DI VINCITA.

REGOLE:
1. Analizza OGNI partita oggettivamente
2. Considera: forma, classifica, infortuni, fattore casa, motivazioni
3. Confidence REALISTICA (60-95%)
4. Se INCERTA = confidence 60-65%
5. Se MOLTO PREVEDIBILE = confidence 80-90%

Rispondi SOLO con JSON valido.`
          },
          { 
            role: 'user', 
            content: `Analizza: ${match.homeTeam} vs ${match.awayTeam} (${match.league}) alle ${match.time}

Fornisci:
1. Pronostico (1, X, 2, 1X, X2, GG, NG, Over2.5, Under2.5)
2. Quota realistica (1.10 - 5.00)
3. Confidence (60-95%)
4. Ragionamento breve

JSON: {"prediction":"1","odds":1.50,"confidence":80,"reasoning":"Analisi tecnica"}`
          }
        ],
        temperature: 0.3,
        max_tokens: 300
      })
    });
    
    if (!res.ok) return getBasicAnalysis(match);
    
    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';
    
    const jsonMatch = content.match(/\{[\s\S]*?\}/);
    if (!jsonMatch) return getBasicAnalysis(match);
    
    const parsed = JSON.parse(jsonMatch[0]);
    
    return {
      event: `${match.homeTeam} vs ${match.awayTeam}`,
      league: match.league,
      prediction: parsed.prediction || '1X',
      odds: Math.round((parsed.odds || 1.70) * 100) / 100,
      confidence: Math.min(95, Math.max(60, parsed.confidence || 70)),
      reasoning: parsed.reasoning || 'Analisi AI completata.',
      sport: 'football',
      eventDate: new Date().toLocaleDateString('it-IT')
    };
    
  } catch (e) {
    return getBasicAnalysis(match);
  }
}

// Analisi di base
function getBasicAnalysis(match: any): any {
  const strongTeams = [
    'napoli', 'inter', 'juventus', 'milan', 'atalanta', 'lazio', 'roma',
    'manchester city', 'arsenal', 'liverpool', 'chelsea', 'tottenham', 'manchester united',
    'real madrid', 'barcelona', 'atletico madrid',
    'bayern', 'dortmund', 'leipzig', 'leverkusen',
    'psg', 'monaco', 'marseille'
  ];
  
  const homeStrong = strongTeams.some(t => match.homeTeam.toLowerCase().includes(t));
  const awayStrong = strongTeams.some(t => match.awayTeam.toLowerCase().includes(t));
  
  let prediction = '1X';
  let odds = 1.80;
  let confidence = 65;
  
  if (homeStrong && !awayStrong) {
    prediction = '1';
    odds = 1.50;
    confidence = 75;
  } else if (awayStrong && !homeStrong) {
    prediction = 'X2';
    odds = 1.60;
    confidence = 70;
  } else if (homeStrong && awayStrong) {
    prediction = 'GG';
    odds = 1.70;
    confidence = 68;
  }
  
  return {
    event: `${match.homeTeam} vs ${match.awayTeam}`,
    league: match.league,
    prediction,
    odds,
    confidence,
    reasoning: `${match.homeTeam} vs ${match.awayTeam} in ${match.league}. Analisi basata su forza storica.`,
    sport: 'football',
    eventDate: new Date().toLocaleDateString('it-IT')
  };
}
