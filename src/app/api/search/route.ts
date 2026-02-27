import { NextRequest, NextResponse } from 'next/server';
import ZAI from 'z-ai-web-dev-sdk';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, num = 10 } = body;

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    const zai = await ZAI.create();

    const searchResult = await zai.functions.invoke("web_search", {
      query,
      num
    });

    return NextResponse.json({
      success: true,
      results: searchResult,
      query,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Search error:', error);
    return NextResponse.json(
      { error: error.message || 'Search failed' },
      { status: 500 }
    );
  }
}
