import { NextResponse } from 'next/server';

export async function GET() {
  const footballKey = process.env.FOOTBALL_API_KEY;
  const url = `https://v3.football.api-sports.io/fixtures?date=2026-03-06&league=39&season=2024`;

  try {
    const res = await fetch(url, {
      headers: { 'x-apisports-key': footballKey || '' },
      next: { revalidate: 0 }
    });
    const data = await res.json();
    return NextResponse.json(data.response?.slice(0, 5) || []);
  } catch (e) {
    return NextResponse.json([]);
  }
}
